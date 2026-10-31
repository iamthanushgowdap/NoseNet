// In-memory + cloud-bridged live test store for instant cross-device and cross-lambda synchronization
import { broadcastLiveSync, fetchLatestLiveEvents, LiveSyncEvent } from '@/lib/sync/live-sync';

export type CakeType =
  | 'Normal Cake — Frozen'
  | 'Normal Cake — Unfrozen'
  | 'Pastry Cake — Frozen'
  | 'Pastry Cake — Unfrozen';

export type FreshnessVerdict = 'Fresh' | 'Fairly Fresh' | 'Stale' | 'Spoiled' | 'Not Fresh';

export interface LiveSensorSnapshot {
  gasResistanceKohm: number | null;
  gasResistanceOhm: number | null;
  temperatureC: number | null;
  humidityPercent: number | null;
  pressureHpa: number | null;
  sensorStatus: 'OK' | 'Heating' | 'Error' | 'Standby';
  timestamp: string;
}

export interface LiveTestState {
  isTestRunning: boolean;
  selectedCakeType: CakeType | null;
  startedAt: string | null;
  testId: string | null;
  lastSensorReading: LiveSensorSnapshot | null;
  sensorReadingsCount: number;
  verdict: FreshnessVerdict | null;
  freshnessScore: number | null;
  verdictSubmittedAt: string | null;
  assessorName: string | null;
}

declare global {
  var __liveTestStoreInstance: LiveTestStore | undefined;
}

class LiveTestStore {
  private state: LiveTestState = {
    isTestRunning: false,
    selectedCakeType: 'Normal Cake — Unfrozen',
    startedAt: null,
    testId: null,
    lastSensorReading: null,
    sensorReadingsCount: 0,
    verdict: null,
    freshnessScore: null,
    verdictSubmittedAt: null,
    assessorName: null,
  };

  private lastCloudSyncTime = 0;

  public static getInstance(): LiveTestStore {
    if (!globalThis.__liveTestStoreInstance) {
      globalThis.__liveTestStoreInstance = new LiveTestStore();
    }
    return globalThis.__liveTestStoreInstance;
  }

  public getState(): LiveTestState {
    return { ...this.state };
  }

  public async getSyncedState(): Promise<LiveTestState> {
    const now = Date.now();
    if (now - this.lastCloudSyncTime > 400) {
      this.lastCloudSyncTime = now;
      try {
        const events = await fetchLatestLiveEvents();
        if (events.length > 0) {
          const last = events[events.length - 1];
          if (last.type === 'CAKE_SELECTED' && last.cakeType) {
            this.state.selectedCakeType = last.cakeType as CakeType;
          } else if (last.type === 'TEST_STARTING' || last.type === 'TEST_RUNNING') {
            this.state.isTestRunning = true;
            if (last.cakeType) this.state.selectedCakeType = last.cakeType as CakeType;
            if (last.testId) this.state.testId = last.testId;
            this.state.verdict = null;
            this.state.freshnessScore = null;
            this.state.startedAt = last.timestamp || new Date().toISOString();
          } else if (last.type === 'VERDICT_SUBMITTED') {
            this.state.isTestRunning = false;
            this.state.verdict = (last.verdict as FreshnessVerdict) || null;
            this.state.freshnessScore = last.score ?? null;
            if (last.testId) this.state.testId = last.testId;
            if (last.cakeType) this.state.selectedCakeType = last.cakeType as CakeType;
            this.state.verdictSubmittedAt = last.timestamp || new Date().toISOString();
            this.state.assessorName = last.assessorName || 'Phone Assessor';
          } else if (last.type === 'TEST_STOPPED' || last.type === 'TEST_RESET') {
            this.state.isTestRunning = false;
            if (last.type === 'TEST_RESET') {
              this.state.verdict = null;
              this.state.freshnessScore = null;
              this.state.testId = null;
            }
          }
        }
      } catch {}
    }
    return this.getState();
  }

  public async startTestAsync(cakeType: CakeType, customTestId?: string): Promise<LiveTestState> {
    const testId = customTestId || `TEST-${Math.floor(100000 + Math.random() * 900000)}`;
    this.state = {
      isTestRunning: true,
      selectedCakeType: cakeType,
      startedAt: new Date().toISOString(),
      testId,
      lastSensorReading: null,
      sensorReadingsCount: 0,
      verdict: null,
      freshnessScore: null,
      verdictSubmittedAt: null,
      assessorName: null,
    };
    this.lastCloudSyncTime = Date.now();
    await broadcastLiveSync({
      type: 'TEST_STARTING',
      cakeType,
      testId,
    });
    return this.getState();
  }

  public startTest(cakeType: CakeType, customTestId?: string): LiveTestState {
    const testId = customTestId || `TEST-${Math.floor(100000 + Math.random() * 900000)}`;
    this.state = {
      isTestRunning: true,
      selectedCakeType: cakeType,
      startedAt: new Date().toISOString(),
      testId,
      lastSensorReading: null,
      sensorReadingsCount: 0,
      verdict: null,
      freshnessScore: null,
      verdictSubmittedAt: null,
      assessorName: null,
    };
    this.lastCloudSyncTime = Date.now();
    broadcastLiveSync({
      type: 'TEST_STARTING',
      cakeType,
      testId,
    }).catch(() => {});
    return this.getState();
  }

  public async stopTestAsync(): Promise<LiveTestState> {
    this.state.isTestRunning = false;
    this.lastCloudSyncTime = Date.now();
    await broadcastLiveSync({ type: 'TEST_STOPPED' });
    return this.getState();
  }

  public stopTest(): LiveTestState {
    this.state.isTestRunning = false;
    this.lastCloudSyncTime = Date.now();
    broadcastLiveSync({ type: 'TEST_STOPPED' }).catch(() => {});
    return this.getState();
  }

  public async resetTestAsync(): Promise<LiveTestState> {
    this.state = {
      isTestRunning: false,
      selectedCakeType: null,
      startedAt: null,
      testId: null,
      lastSensorReading: null,
      sensorReadingsCount: 0,
      verdict: null,
      freshnessScore: null,
      verdictSubmittedAt: null,
      assessorName: null,
    };
    this.lastCloudSyncTime = Date.now();
    await broadcastLiveSync({ type: 'TEST_RESET' });
    return this.getState();
  }

  public resetTest(): LiveTestState {
    this.state = {
      isTestRunning: false,
      selectedCakeType: null,
      startedAt: null,
      testId: null,
      lastSensorReading: null,
      sensorReadingsCount: 0,
      verdict: null,
      freshnessScore: null,
      verdictSubmittedAt: null,
      assessorName: null,
    };
    this.lastCloudSyncTime = Date.now();
    broadcastLiveSync({ type: 'TEST_RESET' }).catch(() => {});
    return this.getState();
  }

  public updateSensorData(reading: Partial<LiveSensorSnapshot>): LiveTestState {
    if (!this.state.isTestRunning || this.state.verdict) {
      return this.getState();
    }

    const fullReading: LiveSensorSnapshot = {
      gasResistanceKohm: reading.gasResistanceKohm ?? null,
      gasResistanceOhm: reading.gasResistanceOhm ?? null,
      temperatureC: reading.temperatureC ?? null,
      humidityPercent: reading.humidityPercent ?? null,
      pressureHpa: reading.pressureHpa ?? null,
      sensorStatus: reading.sensorStatus ?? 'OK',
      timestamp: new Date().toISOString(),
    };
    this.state.lastSensorReading = fullReading;
    this.state.sensorReadingsCount++;
    return this.getState();
  }

  public async submitVerdictAsync(
    verdict: FreshnessVerdict,
    assessorName = 'IoT Verification',
    score?: number,
    targetTestId?: string
  ): Promise<LiveTestState> {
    if (targetTestId) {
      this.state.testId = targetTestId;
    }
    this.state.verdict = verdict;
    this.state.isTestRunning = false;
    this.state.verdictSubmittedAt = new Date().toISOString();
    this.state.assessorName = assessorName;

    if (score !== undefined && score !== null) {
      this.state.freshnessScore = score;
    } else {
      const gas = this.state.lastSensorReading?.gasResistanceKohm || 30;
      const gasOffset = (gas % 3);
      if (verdict === 'Fresh') {
        this.state.freshnessScore = Number((93.5 + gasOffset * 1.5).toFixed(1));
      } else if (verdict === 'Fairly Fresh') {
        this.state.freshnessScore = Number((73.2 + gasOffset * 2.1).toFixed(1));
      } else if (verdict === 'Stale') {
        this.state.freshnessScore = Number((51.4 + gasOffset * 2.2).toFixed(1));
      } else {
        this.state.freshnessScore = Number((15.8 + gasOffset * 2.4).toFixed(1));
      }
    }

    this.lastCloudSyncTime = Date.now();
    await broadcastLiveSync({
      type: 'VERDICT_SUBMITTED',
      verdict,
      score: this.state.freshnessScore,
      testId: this.state.testId,
      cakeType: this.state.selectedCakeType,
      assessorName,
    });
    return this.getState();
  }

  public submitVerdict(
    verdict: FreshnessVerdict,
    assessorName = 'IoT Verification',
    score?: number,
    targetTestId?: string
  ): LiveTestState {
    if (targetTestId) {
      this.state.testId = targetTestId;
    }
    this.state.verdict = verdict;
    this.state.isTestRunning = false;
    this.state.verdictSubmittedAt = new Date().toISOString();
    this.state.assessorName = assessorName;

    if (score !== undefined && score !== null) {
      this.state.freshnessScore = score;
    } else {
      const gas = this.state.lastSensorReading?.gasResistanceKohm || 30;
      const gasOffset = (gas % 3);
      if (verdict === 'Fresh') {
        this.state.freshnessScore = Number((93.5 + gasOffset * 1.5).toFixed(1));
      } else if (verdict === 'Fairly Fresh') {
        this.state.freshnessScore = Number((73.2 + gasOffset * 2.1).toFixed(1));
      } else if (verdict === 'Stale') {
        this.state.freshnessScore = Number((51.4 + gasOffset * 2.2).toFixed(1));
      } else {
        this.state.freshnessScore = Number((15.8 + gasOffset * 2.4).toFixed(1));
      }
    }

    this.lastCloudSyncTime = Date.now();
    broadcastLiveSync({
      type: 'VERDICT_SUBMITTED',
      verdict,
      score: this.state.freshnessScore,
      testId: this.state.testId,
      cakeType: this.state.selectedCakeType,
      assessorName,
    }).catch(() => {});
    return this.getState();
  }
}

export const liveTestStore = LiveTestStore.getInstance();
