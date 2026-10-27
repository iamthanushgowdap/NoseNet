import { z } from 'zod';
import { SensorReading, SensorStage, CsvImportPreview, CsvInvalidRow } from '@/types/sensor';
import Papa from 'papaparse';

export const SensorStageSchema = z.enum(['ROOM', 'EMPTY_CONTAINER', 'CAKE']);

export const SensorReadingSchema = z.object({
  id: z.string(),
  experimentId: z.string().trim().min(1, 'Experiment ID is required'),
  sampleId: z.string().trim().min(1, 'Sample ID is required'),
  stage: SensorStageSchema,
  sampleNo: z.number().int().optional(),
  elapsedSeconds: z.number().min(0, 'Elapsed seconds must be >= 0'),
  temperatureC: z.number().min(-40).max(120, 'Temperature out of realistic bounds (-40 to 120 C)'),
  humidityPercent: z.number().min(0).max(100, 'Humidity must be between 0% and 100%'),
  pressureHpa: z.number().min(300).max(1200, 'Pressure must be between 300 and 1200 hPa'),
  gasResistanceOhm: z.number().min(0, 'Gas resistance must be >= 0'),
  gasResistanceKohm: z.number().min(0, 'Gas resistance in kOhm must be >= 0'),
  status: z.string().default('OK'),
  recordedAt: z.string().optional(),
  importedAt: z.string(),
});

// Normalized key mappings for flexible header parsing
const COLUMN_ALIASES: Record<string, string> = {
  experiment_id: 'experiment_id',
  experimentid: 'experiment_id',
  exp_id: 'experiment_id',
  sample_id: 'sample_id',
  sampleid: 'sample_id',
  smp_id: 'sample_id',
  stage: 'stage',
  phase: 'stage',
  step: 'stage',
  sample_no: 'sample_no',
  sample_num: 'sample_no',
  sampleno: 'sample_no',
  replicate: 'sample_no',
  elapsed_seconds: 'elapsed_seconds',
  elapsed_sec: 'elapsed_seconds',
  time_s: 'elapsed_seconds',
  time_sec: 'elapsed_seconds',
  elapsed: 'elapsed_seconds',
  temperature_c: 'temperature_c',
  temperature: 'temperature_c',
  temp_c: 'temperature_c',
  temp: 'temperature_c',
  humidity_percent: 'humidity_percent',
  humidity: 'humidity_percent',
  hum_pct: 'humidity_percent',
  rh: 'humidity_percent',
  pressure_hpa: 'pressure_hpa',
  pressure: 'pressure_hpa',
  pres_hpa: 'pressure_hpa',
  baro: 'pressure_hpa',
  gas_resistance_ohm: 'gas_resistance_ohm',
  gas_resistance: 'gas_resistance_ohm',
  gas_ohm: 'gas_resistance_ohm',
  gas_resistance_kohm: 'gas_resistance_kohm',
  gas_kohm: 'gas_resistance_kohm',
  gas_res_kohm: 'gas_resistance_kohm',
  status: 'status',
  sensor_status: 'status',
};

function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return COLUMN_ALIASES[clean] || clean;
}

export function parseSensorCsv(
  csvContent: string,
  fileName: string = 'sensor_data.csv',
  existingReadings: SensorReading[] = []
): CsvImportPreview {
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => normalizeHeader(header),
  });

  const validRows: SensorReading[] = [];
  const invalidRows: CsvInvalidRow[] = [];
  const detectedStages = new Set<SensorStage>();
  const detectedExperimentIds = new Set<string>();
  const detectedSampleIds = new Set<string>();

  // Track existing unique keys to avoid duplicates
  const existingKeys = new Set(
    existingReadings.map(
      (r) => `${r.experimentId}::${r.sampleId}::${r.stage}::${r.elapsedSeconds}`
    )
  );

  // Also track seen keys in the current batch to prevent duplicates within the file
  const batchKeys = new Set<string>();
  let duplicateCount = 0;

  parsed.data.forEach((row, index) => {
    const rowNumber = index + 2; // header is row 1
    const rowErrors: string[] = [];

    const experimentId = (row.experiment_id || '').trim();
    const sampleId = (row.sample_id || '').trim();
    const rawStage = (row.stage || '').trim().toUpperCase();

    if (!experimentId) rowErrors.push('Missing experiment_id');
    if (!sampleId) rowErrors.push('Missing sample_id');

    let stage: SensorStage = 'CAKE';
    if (rawStage === 'ROOM' || rawStage === 'EMPTY_CONTAINER' || rawStage === 'CAKE') {
      stage = rawStage as SensorStage;
    } else {
      rowErrors.push(`Invalid stage "${row.stage}". Must be ROOM, EMPTY_CONTAINER, or CAKE`);
    }

    const elapsedSeconds = parseFloat(row.elapsed_seconds);
    if (isNaN(elapsedSeconds) || elapsedSeconds < 0) {
      rowErrors.push('Invalid elapsed_seconds (must be a non-negative number)');
    }

    const temperatureC = parseFloat(row.temperature_c);
    if (isNaN(temperatureC) || temperatureC < -40 || temperatureC > 120) {
      rowErrors.push('Invalid temperature_C (must be between -40 and 120 °C)');
    }

    const humidityPercent = parseFloat(row.humidity_percent);
    if (isNaN(humidityPercent) || humidityPercent < 0 || humidityPercent > 100) {
      rowErrors.push('Invalid humidity_percent (must be between 0 and 100%)');
    }

    const pressureHpa = parseFloat(row.pressure_hpa);
    if (isNaN(pressureHpa) || pressureHpa < 300 || pressureHpa > 1200) {
      rowErrors.push('Invalid pressure_hPa (must be between 300 and 1200 hPa)');
    }

    let gasResistanceOhm = parseFloat(row.gas_resistance_ohm);
    let gasResistanceKohm = parseFloat(row.gas_resistance_kohm);

    if (isNaN(gasResistanceOhm) && isNaN(gasResistanceKohm)) {
      rowErrors.push('Either gas_resistance_ohm or gas_resistance_kohm must be a valid number');
    } else if (isNaN(gasResistanceOhm) && !isNaN(gasResistanceKohm)) {
      gasResistanceOhm = Math.round(gasResistanceKohm * 1000);
    } else if (!isNaN(gasResistanceOhm) && isNaN(gasResistanceKohm)) {
      gasResistanceKohm = Number((gasResistanceOhm / 1000).toFixed(3));
    }

    if (rowErrors.length > 0) {
      invalidRows.push({
        rowNumber,
        raw: row,
        errors: rowErrors,
      });
      return;
    }

    const sampleNo = row.sample_no ? parseInt(row.sample_no, 10) : undefined;
    const status = (row.status || 'OK').trim().toUpperCase();

    const uniqueKey = `${experimentId}::${sampleId}::${stage}::${elapsedSeconds}`;
    if (existingKeys.has(uniqueKey) || batchKeys.has(uniqueKey)) {
      duplicateCount++;
      return;
    }

    batchKeys.add(uniqueKey);
    detectedStages.add(stage);
    detectedExperimentIds.add(experimentId);
    detectedSampleIds.add(sampleId);

    const reading: SensorReading = {
      id: `${experimentId}_${sampleId}_${stage}_${elapsedSeconds}`,
      experimentId,
      sampleId,
      stage,
      sampleNo: !isNaN(sampleNo as number) ? sampleNo : undefined,
      elapsedSeconds,
      temperatureC: Number(temperatureC.toFixed(2)),
      humidityPercent: Number(humidityPercent.toFixed(2)),
      pressureHpa: Number(pressureHpa.toFixed(2)),
      gasResistanceOhm: Math.round(gasResistanceOhm),
      gasResistanceKohm: Number(gasResistanceKohm.toFixed(3)),
      status,
      importedAt: new Date().toISOString(),
    };

    validRows.push(reading);
  });

  return {
    fileName,
    totalRows: parsed.data.length,
    validRows,
    invalidRows,
    duplicateCount,
    detectedStages: Array.from(detectedStages),
    detectedExperimentIds: Array.from(detectedExperimentIds),
    detectedSampleIds: Array.from(detectedSampleIds),
  };
}
