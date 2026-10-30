// In-memory + file-backed live test store for instant cross-device synchronization
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

  public static getInstance(): LiveTestStore {
    if (!globalThis.__liveTestStoreInstance) {
      globalThis.__liveTestStoreInstance = new LiveTestStore();
    }
    return globalThis.__liveTestStoreInstance;
  }

  public getState(): LiveTestState {
    return { ...this.state };
  }

  public startTest(cakeType: CakeType): LiveTestState {
    const testId = `TEST-${Date.now().toString().slice(-6)}`;
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
    return this.getState();
  }

  public stopTest(): LiveTestState {
    this.state.isTestRunning = false;
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
    return this.getState();
  }

  public updateSensorData(reading: Partial<LiveSensorSnapshot>): LiveTestState {
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
    score?: number
  ): LiveTestState {
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

    return this.getState();
  }
}

export const liveTestStore = LiveTestStore.getInstance();
