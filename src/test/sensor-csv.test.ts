import { describe, it, expect, beforeEach } from 'vitest';
import { parseSensorCsv } from '@/lib/validation/sensor.schema';
import { MemoryStorageAdapter } from '@/lib/storage/memory-storage-adapter';
import { createServiceContainer } from '@/services';

describe('Sensor CSV Parsing, Validation, and Duplicate Prevention', () => {
  let services: ReturnType<typeof createServiceContainer>;
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    services = createServiceContainer(storage);
  });

  const validCsv = `experiment_id,sample_id,stage,sample_no,elapsed_seconds,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status
EXP-001,SMP-001,ROOM,1,0,24.5,50.2,1012.3,54000,54.000,OK
EXP-001,SMP-001,EMPTY_CONTAINER,1,10,24.6,50.4,1012.2,53000,53.000,OK
EXP-001,SMP-001,CAKE,1,20,24.8,51.5,1012.1,48000,48.000,OK`;

  it('parses valid CSV with ROOM, EMPTY_CONTAINER, and CAKE stages', () => {
    const preview = parseSensorCsv(validCsv, 'test.csv');
    expect(preview.validRows.length).toBe(3);
    expect(preview.invalidRows.length).toBe(0);
    expect(preview.detectedStages).toContain('ROOM');
    expect(preview.detectedStages).toContain('EMPTY_CONTAINER');
    expect(preview.detectedStages).toContain('CAKE');
    expect(preview.detectedExperimentIds).toEqual(['EXP-001']);
    expect(preview.detectedSampleIds).toEqual(['SMP-001']);
  });

  it('reports invalid rows with clear error descriptions', () => {
    const invalidCsv = `experiment_id,sample_id,stage,sample_no,elapsed_seconds,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status
EXP-001,,INVALID_STAGE,1,-5,150.0,120.0,200.0,not_a_number,not_a_number,OK`;

    const preview = parseSensorCsv(invalidCsv, 'invalid.csv');
    expect(preview.validRows.length).toBe(0);
    expect(preview.invalidRows.length).toBe(1);

    const errs = preview.invalidRows[0].errors;
    expect(errs.some((e) => e.includes('sample_id'))).toBe(true);
    expect(errs.some((e) => e.includes('Invalid stage'))).toBe(true);
    expect(errs.some((e) => e.includes('elapsed_seconds'))).toBe(true);
    expect(errs.some((e) => e.includes('temperature_C'))).toBe(true);
    expect(errs.some((e) => e.includes('humidity_percent'))).toBe(true);
    expect(errs.some((e) => e.includes('pressure_hPa'))).toBe(true);
    expect(errs.some((e) => e.includes('gas_resistance'))).toBe(true);
  });

  it('derives missing kOhm from Ohm and vice versa', () => {
    const onlyOhmCsv = `experiment_id,sample_id,stage,elapsed_seconds,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm
EXP-001,SMP-001,CAKE,15,24.0,50.0,1013.0,50000`;

    const preview1 = parseSensorCsv(onlyOhmCsv);
    expect(preview1.validRows.length).toBe(1);
    expect(preview1.validRows[0].gasResistanceKohm).toBe(50);

    const onlyKohmCsv = `experiment_id,sample_id,stage,elapsed_seconds,temperature_C,humidity_percent,pressure_hPa,gas_resistance_kohm
EXP-001,SMP-001,CAKE,20,24.0,50.0,1013.0,42.5`;

    const preview2 = parseSensorCsv(onlyKohmCsv);
    expect(preview2.validRows.length).toBe(1);
    expect(preview2.validRows[0].gasResistanceOhm).toBe(42500);
  });

  it('prevents duplicate readings when the same file or rows are imported again', async () => {
    // 1. Initial preview and import
    const preview1 = await services.sensor.previewCsv(validCsv);
    const result1 = await services.sensor.importReadings(preview1.validRows);
    expect(result1.importedCount).toBe(3);
    expect(result1.skippedDuplicatesCount).toBe(0);

    const stored1 = await services.sensor.getReadings();
    expect(stored1.length).toBe(3);

    // 2. Second preview of the same CSV against already imported data
    const preview2 = await services.sensor.previewCsv(validCsv);
    expect(preview2.duplicateCount).toBe(3);
    expect(preview2.validRows.length).toBe(0);

    // 3. Attempting to re-import
    const result2 = await services.sensor.importReadings(preview1.validRows);
    expect(result2.importedCount).toBe(0);
    expect(result2.skippedDuplicatesCount).toBe(3);

    // Stored readings count remains unchanged
    const stored2 = await services.sensor.getReadings();
    expect(stored2.length).toBe(3);
  });
});
