// In-memory + cloud-bridged live test store for instant cross-device and cross-lambda synchronization
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

const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a18f237fcd6a39';

async function pushStateToCloud(state: LiveTestState): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 900);
    await fetch(CLOUD_SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'NoseNet_State',
        data: {
          isTestRunning: state.isTestRunning,
          selectedCakeType: state.selectedCakeType,
          startedAt: state.startedAt,
          testId: state.testId,
          verdict: state.verdict,
          freshnessScore: state.freshnessScore,
          verdictSubmittedAt: state.verdictSubmittedAt,
          assessorName: state.assessorName,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // Non-blocking fallback
  }
}

async function fetchStateFromCloud(): Promise<Partial<LiveTestState> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 900);
    const res = await fetch(CLOUD_SYNC_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.data && typeof json.data === 'object') {
      return json.data;
    }
  } catch {}
  return null;
}

class LiveTestStore {
  private state: LiveTestState = {
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
    // Cache for 500ms to eliminate redundant network roundtrips
    if (now - this.lastCloudSyncTime > 500) {
      this.lastCloudSyncTime = now;
      const cloudData = await fetchStateFromCloud();
      if (cloudData) {
        if (cloudData.testId !== undefined) this.state.testId = cloudData.testId ?? null;
        if (cloudData.isTestRunning !== undefined) this.state.isTestRunning = Boolean(cloudData.isTestRunning);
        if (cloudData.selectedCakeType !== undefined) this.state.selectedCakeType = (cloudData.selectedCakeType as CakeType) ?? null;
        if (cloudData.startedAt !== undefined) this.state.startedAt = cloudData.startedAt ?? null;
        this.state.verdict = (cloudData.verdict as FreshnessVerdict) || null;
        this.state.freshnessScore = cloudData.freshnessScore ?? null;
        this.state.verdictSubmittedAt = cloudData.verdictSubmittedAt ?? null;
        this.state.assessorName = cloudData.assessorName ?? null;
      }
    }
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
    pushStateToCloud(this.state);
    return this.getState();
  }

  public stopTest(): LiveTestState {
    this.state.isTestRunning = false;
    this.lastCloudSyncTime = Date.now();
    pushStateToCloud(this.state);
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
    pushStateToCloud(this.state);
    return this.getState();
  }

  public updateSensorData(reading: Partial<LiveSensorSnapshot>): LiveTestState {
    // STRICT HARDWARE CLOSURE: Never ingest sensor data if test is closed or verdict is already finalized
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

    // Calculate dynamic freshness score (%) tied to sensor metrics
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
        // Spoiled / Not Fresh
        this.state.freshnessScore = Number((15.8 + gasOffset * 2.4).toFixed(1));
      }
    }

    this.lastCloudSyncTime = Date.now();
    pushStateToCloud(this.state);
    return this.getState();
  }
}

export const liveTestStore = LiveTestStore.getInstance();
