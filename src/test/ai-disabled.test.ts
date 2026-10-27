import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter } from '@/lib/storage/memory-storage-adapter';
import { createServiceContainer } from '@/services';

describe('AI-Disabled State and Academic Transparency', () => {
  let services: ReturnType<typeof createServiceContainer>;
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    services = createServiceContainer(storage);
  });

  it('guarantees AI prediction status is unavailable when dataset is insufficient', async () => {
    const metrics = await services.ai.getReadinessMetrics();

    expect(metrics.status).toBe('Not Configured');
    expect(metrics.statusMessage).toContain('AI prediction unavailable — insufficient validated data');
    expect(metrics.isReadyForValidation).toBe(false);
  });

  it('computes paired specimen count correctly based on samples with both sensor and sensory data', async () => {
    // 1. Register 2 samples
    await services.samples.createSample({
      id: 'SMP-PAIRED-1',
      experimentId: 'EXP-1',
      category: 'Normal Cake',
      storageCondition: 'Unfrozen',
      testDateTime: new Date().toISOString(),
    });

    await services.samples.createSample({
      id: 'SMP-UNPAIRED-2',
      experimentId: 'EXP-1',
      category: 'Pastry Cake',
      storageCondition: 'Frozen',
      testDateTime: new Date().toISOString(),
    });

    // 2. Add sensor readings for SMP-PAIRED-1 only
    await storage.saveSensorReadings([
      {
        id: 'r1',
        experimentId: 'EXP-1',
        sampleId: 'SMP-PAIRED-1',
        stage: 'CAKE',
        elapsedSeconds: 0,
        temperatureC: 24,
        humidityPercent: 50,
        pressureHpa: 1013,
        gasResistanceOhm: 50000,
        gasResistanceKohm: 50,
        status: 'OK',
        importedAt: new Date().toISOString(),
      },
    ]);

    // 3. Add manual assessment for SMP-PAIRED-1 only
    await services.assessments.submitAssessment({
      experimentId: 'EXP-1',
      sampleId: 'SMP-PAIRED-1',
      assessorName: 'Evaluator',
      assessorId: 'usr_eval',
      label: 'Fresh',
    });

    const metrics = await services.ai.getReadinessMetrics();
    expect(metrics.totalSamples).toBe(2);
    expect(metrics.labeledSamples).toBe(1);
    expect(metrics.sensorReadingsCount).toBe(1);
    expect(metrics.pairedSamplesCount).toBe(1);
  });
});
