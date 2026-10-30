import { TestRun, TestRunConfig, TestStatus, TestReport } from '@/types/test-run';
import { LiveSensorReading } from '@/types/serial';
import { IndependentHumanAssessment } from '@/types/assessment';
import { idbStorage } from '@/lib/storage/indexed-db';
import { webSerial } from '@/lib/serial/web-serial-manager';
import { ReportService } from './report-service';

export type TestRunListener = (test: TestRun | null) => void;
export type LiveReadingsListener = (reading: LiveSensorReading) => void;

export class TestRunService {
  private static instance: TestRunService | null = null;

  private currentTest: TestRun | null = null;
  private currentReadings: LiveSensorReading[] = [];
  private timerInterval: any = null;
  private unsubscribeSerial: (() => void) | null = null;
  private unsubscribeStatus: (() => void) | null = null;

  private testListeners = new Set<TestRunListener>();
  private readingsListeners = new Set<LiveReadingsListener>();

  private constructor() {}

  public static getInstance(): TestRunService {
    if (!TestRunService.instance) {
      TestRunService.instance = new TestRunService();
    }
    return TestRunService.instance;
  }

  public getCurrentTest(): TestRun | null {
    return this.currentTest;
  }

  public getCurrentReadings(): LiveSensorReading[] {
    return this.currentReadings;
  }

  public subscribeCurrentTest(listener: TestRunListener): () => void {
    this.testListeners.add(listener);
    listener(this.currentTest);
    return () => this.testListeners.delete(listener);
  }

  public subscribeLiveReadings(listener: LiveReadingsListener): () => void {
    this.readingsListeners.add(listener);
    return () => this.readingsListeners.delete(listener);
  }

  private notifyTestUpdate() {
    this.testListeners.forEach((l) => l(this.currentTest ? { ...this.currentTest } : null));
  }

  /**
   * Start a new real-time test run
   */
  public async startTest(config: TestRunConfig): Promise<TestRun> {
    if (this.currentTest && (this.currentTest.status === 'Running' || this.currentTest.status === 'Paused')) {
      throw new Error('A test is already currently running. Please stop or complete it first.');
    }

    if (webSerial.getStatus() !== 'Connected') {
      throw new Error('Cannot start test: ESP32 is not connected. Connect device via USB first.');
    }

    const lastReading = webSerial.getLastReading();
    if (!lastReading) {
      throw new Error('Cannot start test: No valid sensor telemetry packet received yet.');
    }

    const testId = `TEST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // Generate local fallback token; also request server session token
    let assessmentToken = `tok_${Math.random().toString(36).substring(2, 10)}`;
    try {
      const res = await fetch('/api/assessments/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          sampleId: config.sampleId,
          cakeCategory: config.cakeCategory,
          storageCondition: config.storageCondition,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.token) assessmentToken = json.token;
      }
    } catch {
      // Local fallback token used
    }

    const newTest: TestRun = {
      id: testId,
      sampleId: config.sampleId,
      cakeCategory: config.cakeCategory,
      storageCondition: config.storageCondition,
      stage: config.stage,
      operatorNotes: config.operatorNotes,
      status: 'Running',
      plannedDurationSeconds: config.plannedDurationSeconds,
      actualDurationSeconds: 0,
      startedAt: new Date().toISOString(),
      readingsCount: 0,
      validReadingsCount: 0,
      errorReadingsCount: 0,
      interruptionEvents: [],
      assessmentToken,
      assessmentStatus: 'Pending',
    };

    this.currentTest = newTest;
    this.currentReadings = [];
    await idbStorage.saveTestRun(newTest);

    // Listen to live readings from webSerial
    this.unsubscribeSerial = webSerial.subscribeReading((reading) => {
      if (this.currentTest && this.currentTest.status === 'Running') {
        this.currentReadings.push(reading);
        this.currentTest.readingsCount++;
        if (reading.status === 'OK' || reading.status === 'STABLE') {
          this.currentTest.validReadingsCount++;
        } else {
          this.currentTest.errorReadingsCount++;
        }

        // Save raw reading directly into IndexedDB
        idbStorage.appendRawReading(this.currentTest.id, reading).catch(console.error);

        this.readingsListeners.forEach((l) => l(reading));
        this.notifyTestUpdate();
      }
    });

    // Watch for serial status changes (e.g. disconnect or stale during run)
    this.unsubscribeStatus = webSerial.subscribeStatus((status, message) => {
      if (this.currentTest && this.currentTest.status === 'Running') {
        if (status === 'Disconnected' || status === 'Error' || status === 'Stale') {
          this.currentTest.interruptionEvents.push({
            timestamp: new Date().toISOString(),
            reason: `Serial connection issue (${status}): ${message || 'Connection lost'}`,
          });
          this.notifyTestUpdate();
        }
      }
    });

    // Start 1-second elapsed timer
    this.startTimer();
    this.notifyTestUpdate();
    return newTest;
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.currentTest && this.currentTest.status === 'Running') {
        this.currentTest.actualDurationSeconds++;
        this.notifyTestUpdate();

        // Check if planned duration reached
        if (this.currentTest.actualDurationSeconds >= this.currentTest.plannedDurationSeconds) {
          this.finalizeTest('Completed');
        }
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public pauseTest() {
    if (this.currentTest && this.currentTest.status === 'Running') {
      this.currentTest.status = 'Paused';
      this.currentTest.interruptionEvents.push({
        timestamp: new Date().toISOString(),
        reason: 'Operator paused test run.',
      });
      this.notifyTestUpdate();
    }
  }

  public resumeTest() {
    if (this.currentTest && this.currentTest.status === 'Paused') {
      if (webSerial.getStatus() !== 'Connected') {
        throw new Error('Cannot resume test: ESP32 device is not currently connected.');
      }
      this.currentTest.status = 'Running';
      this.currentTest.interruptionEvents.push({
        timestamp: new Date().toISOString(),
        reason: 'Operator resumed test run.',
      });
      this.notifyTestUpdate();
    }
  }

  public async stopTest(reason?: string) {
    if (this.currentTest && (this.currentTest.status === 'Running' || this.currentTest.status === 'Paused')) {
      if (reason) {
        this.currentTest.interruptionEvents.push({
          timestamp: new Date().toISOString(),
          reason,
        });
      }
      const finalStatus: TestStatus =
        this.currentTest.actualDurationSeconds >= this.currentTest.plannedDurationSeconds
          ? 'Completed'
          : this.currentTest.validReadingsCount === 0
          ? 'Invalid'
          : 'Interrupted';

      await this.finalizeTest(finalStatus);
    }
  }

  private async finalizeTest(status: TestStatus) {
    this.stopTimer();
    if (this.unsubscribeSerial) {
      this.unsubscribeSerial();
      this.unsubscribeSerial = null;
    }
    if (this.unsubscribeStatus) {
      this.unsubscribeStatus();
      this.unsubscribeStatus = null;
    }

    if (this.currentTest) {
      this.currentTest.status = status;
      this.currentTest.completedAt = new Date().toISOString();
      await idbStorage.saveTestRun(this.currentTest);
      this.notifyTestUpdate();
    }
  }

  public async getTestRun(testId: string): Promise<TestRun | null> {
    return await idbStorage.getTestRun(testId);
  }

  public async getAllTestRuns(): Promise<TestRun[]> {
    return await idbStorage.getAllTestRuns();
  }

  public async deleteTestRun(testId: string): Promise<void> {
    await idbStorage.deleteTestRun(testId);
    if (this.currentTest && this.currentTest.id === testId) {
      this.currentTest = null;
      this.currentReadings = [];
      this.notifyTestUpdate();
    }
  }

  public async getReportForTest(testId: string): Promise<TestReport | null> {
    const testRun = await idbStorage.getTestRun(testId);
    if (!testRun) return null;

    const readings = await idbStorage.getRawReadingsForTest(testId);

    // Try checking server for submitted human assessment
    let humanAssessment: IndependentHumanAssessment | null = null;
    try {
      const res = await fetch(`/api/assessments/${testRun.assessmentToken}/status`);
      if (res.ok) {
        const json = await res.json();
        if (json.assessment) {
          humanAssessment = json.assessment;
          if (testRun.assessmentStatus !== 'Submitted') {
            testRun.assessmentStatus = 'Submitted';
            testRun.assessmentSubmittedAt = json.submittedAt;
            await idbStorage.saveTestRun(testRun);
          }
        }
      }
    } catch {
      // Offline fallback
    }

    return ReportService.calculateReport(testRun, readings, humanAssessment);
  }
}

export const testRunService = TestRunService.getInstance();
