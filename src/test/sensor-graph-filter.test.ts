import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter } from '@/lib/storage/memory-storage-adapter';
import { createServiceContainer } from '@/services';
import { SensorReading } from '@/types/sensor';

describe('Sensor Graph Filtering and Trend Analytics', () => {
  let services: ReturnType<typeof createServiceContainer>;
  let storage: MemoryStorageAdapter;

  const testReadings: SensorReading[] = [
    {
      id: 'r1',
      experimentId: 'EXP-1',
      sampleId: 'SMP-A',
      stage: 'ROOM',
      elapsedSeconds: 0,
      temperatureC: 24.0,
      humidityPercent: 50.0,
      pressureHpa: 1013.0,
      gasResistanceOhm: 54000,
      gasResistanceKohm: 54.0,
      status: 'OK',
      importedAt: '2026-10-27T08:00:00Z',
    },
    {
      id: 'r2',
      experimentId: 'EXP-1',
      sampleId: 'SMP-A',
      stage: 'EMPTY_CONTAINER',
      elapsedSeconds: 10,
      temperatureC: 24.1,
      humidityPercent: 50.2,
      pressureHpa: 1013.0,
      gasResistanceOhm: 53000,
      gasResistanceKohm: 53.0,
      status: 'OK',
      importedAt: '2026-10-27T08:00:00Z',
    },
    {
      id: 'r3',
      experimentId: 'EXP-1',
      sampleId: 'SMP-A',
      stage: 'CAKE',
      elapsedSeconds: 20,
      temperatureC: 24.5,
      humidityPercent: 52.0,
      pressureHpa: 1012.8,
      gasResistanceOhm: 48000,
      gasResistanceKohm: 48.0,
      status: 'OK',
      importedAt: '2026-10-27T08:00:00Z',
    },
    {
      id: 'r4',
      experimentId: 'EXP-2',
      sampleId: 'SMP-B',
      stage: 'CAKE',
      elapsedSeconds: 5,
      temperatureC: 23.5,
      humidityPercent: 48.0,
      pressureHpa: 1014.0,
      gasResistanceOhm: 30000,
      gasResistanceKohm: 30.0,
      status: 'OK',
      importedAt: '2026-10-27T09:00:00Z',
    },
  ];

  beforeEach(async () => {
    storage = new MemoryStorageAdapter();
    services = createServiceContainer(storage);
    await storage.saveSensorReadings(testReadings);
  });

  it('filters readings by experiment ID', async () => {
    const exp1Readings = await services.sensor.getReadings({ experimentId: 'EXP-1' });
    expect(exp1Readings.length).toBe(3);
    expect(exp1Readings.every((r) => r.experimentId === 'EXP-1')).toBe(true);

    const exp2Readings = await services.sensor.getReadings({ experimentId: 'EXP-2' });
    expect(exp2Readings.length).toBe(1);
    expect(exp2Readings[0].sampleId).toBe('SMP-B');
  });

  it('filters readings by stage (ROOM vs EMPTY_CONTAINER vs CAKE)', async () => {
    const roomReadings = await services.sensor.getReadings({ stage: 'ROOM' });
    expect(roomReadings.length).toBe(1);
    expect(roomReadings[0].stage).toBe('ROOM');

    const cakeReadings = await services.sensor.getReadings({ stage: 'CAKE' });
    expect(cakeReadings.length).toBe(2);
  });

  it('calculates 5-point moving average without mutating original readings', () => {
    const readings = testReadings.filter((r) => r.experimentId === 'EXP-1');
    const smoothed = services.sensor.calculateMovingAverages(readings, 3);

    expect(smoothed.length).toBe(readings.length);
    // Point 0 SMA should equal point 0 raw
    expect(smoothed[0].smaGasKohm).toBe(readings[0].gasResistanceKohm);
    // Point 2 SMA should be average of points 0, 1, 2 = (54.0 + 53.0 + 48.0) / 3 = 51.667
    expect(smoothed[2].smaGasKohm).toBeCloseTo(51.667, 2);
    // Original raw field is preserved untouched
    expect(smoothed[2].gasResistanceKohm).toBe(48.0);
  });
});
