export type SensorStage = 'ROOM' | 'EMPTY_CONTAINER' | 'CAKE';

export interface SensorReading {
  id: string; // Composite unique key or UUID
  experimentId: string;
  sampleId: string;
  stage: SensorStage;
  sampleNo?: number;
  elapsedSeconds: number;
  temperatureC: number;
  humidityPercent: number;
  pressureHpa: number;
  gasResistanceOhm: number;
  gasResistanceKohm: number;
  status: string; // e.g. "OK", "STABLE"
  recordedAt?: string;
  importedAt: string;
}

export interface CsvInvalidRow {
  rowNumber: number;
  raw: Record<string, string>;
  errors: string[];
}

export interface CsvImportPreview {
  fileName: string;
  totalRows: number;
  validRows: SensorReading[];
  invalidRows: CsvInvalidRow[];
  duplicateCount: number;
  detectedStages: SensorStage[];
  detectedExperimentIds: string[];
  detectedSampleIds: string[];
}

export interface CsvImportResult {
  success: boolean;
  importedCount: number;
  skippedDuplicatesCount: number;
  errors: string[];
}
