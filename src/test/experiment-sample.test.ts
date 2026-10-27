import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter } from '@/lib/storage/memory-storage-adapter';
import { createServiceContainer } from '@/services';

describe('Experiment and Sample Management', () => {
  let services: ReturnType<typeof createServiceContainer>;
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    services = createServiceContainer(storage);
  });

  it('creates an experiment with valid fields and control run metadata', async () => {
    const exp = await services.experiments.createExperiment({
      id: 'EXP-TEST-001',
      name: 'Cake Degradation Test',
      description: 'Testing ambient spoilage kinetics',
      testDate: '2026-10-27',
      plannedDurationMinutes: 60,
      protocolNotes: 'Standard BME680 3-stage protocol',
      status: 'Active',
      controls: {
        roomStageCompleted: true,
        roomBaselineResistanceKohm: 54.2,
        emptyContainerStageCompleted: true,
        emptyContainerBaselineResistanceKohm: 52.8,
        notes: 'Chamber cleaned and verified',
      },
    });

    expect(exp.id).toBe('EXP-TEST-001');
    expect(exp.status).toBe('Active');
    expect(exp.controls.roomStageCompleted).toBe(true);
    expect(exp.controls.roomBaselineResistanceKohm).toBe(54.2);

    const retrieved = await services.experiments.getExperimentById('EXP-TEST-001');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Cake Degradation Test');
  });

  it('prevents creating duplicate experiment IDs', async () => {
    await services.experiments.createExperiment({
      id: 'EXP-UNIQUE',
      name: 'First Run',
      testDate: '2026-10-27',
      plannedDurationMinutes: 30,
    });

    await expect(
      services.experiments.createExperiment({
        id: 'EXP-UNIQUE',
        name: 'Second Run with same ID',
        testDate: '2026-10-27',
        plannedDurationMinutes: 30,
      })
    ).rejects.toThrow(/already exists/);
  });

  it('creates samples across combinations (Normal Cake vs Pastry Cake, Frozen vs Unfrozen) and preserves distinct statuses', async () => {
    await services.experiments.createExperiment({
      id: 'EXP-001',
      name: 'Main Experiment',
      testDate: '2026-10-27',
      plannedDurationMinutes: 60,
    });

    // 1. Normal Cake — Unfrozen (Planned)
    const s1 = await services.samples.createSample({
      id: 'SMP-NC-UF-01',
      experimentId: 'EXP-001',
      category: 'Normal Cake',
      storageCondition: 'Unfrozen',
      replicateNumber: 'Sample 1',
      testDateTime: new Date().toISOString(),
      massGrams: 45.0,
      status: 'Planned',
    });

    // 2. Normal Cake — Frozen (Testing)
    const s2 = await services.samples.createSample({
      id: 'SMP-NC-FZ-02',
      experimentId: 'EXP-001',
      category: 'Normal Cake',
      storageCondition: 'Frozen',
      replicateNumber: 'Sample 1',
      testDateTime: new Date().toISOString(),
      massGrams: 46.5,
      status: 'Testing',
    });

    // 3. Pastry Cake — Unfrozen (Completed)
    const s3 = await services.samples.createSample({
      id: 'SMP-PC-UF-03',
      experimentId: 'EXP-001',
      category: 'Pastry Cake',
      storageCondition: 'Unfrozen',
      replicateNumber: 'Sample 1',
      testDateTime: new Date().toISOString(),
      massGrams: 52.0,
      status: 'Completed',
    });

    // 4. Pastry Cake — Frozen (Invalid)
    const s4 = await services.samples.createSample({
      id: 'SMP-PC-FZ-04',
      experimentId: 'EXP-001',
      category: 'Pastry Cake',
      storageCondition: 'Frozen',
      replicateNumber: 'Sample 1',
      testDateTime: new Date().toISOString(),
      massGrams: 51.2,
      status: 'Invalid',
    });

    expect(s1.status).toBe('Planned');
    expect(s2.status).toBe('Testing');
    expect(s3.status).toBe('Completed');
    expect(s4.status).toBe('Invalid');

    // Verify samples linked to experiment
    const exp = await services.experiments.getExperimentById('EXP-001');
    expect(exp?.sampleIds).toContain('SMP-NC-UF-01');
    expect(exp?.sampleIds).toContain('SMP-NC-FZ-02');
    expect(exp?.sampleIds).toContain('SMP-PC-UF-03');
    expect(exp?.sampleIds).toContain('SMP-PC-FZ-04');
  });

  it('allows replicate numbers without overwriting earlier records', async () => {
    await services.experiments.createExperiment({
      id: 'EXP-001',
      name: 'Experiment 1',
      testDate: '2026-10-27',
      plannedDurationMinutes: 60,
    });

    await services.samples.createSample({
      id: 'SMP-REP-1',
      experimentId: 'EXP-001',
      category: 'Normal Cake',
      storageCondition: 'Unfrozen',
      replicateNumber: 'Sample 1',
      testDateTime: new Date().toISOString(),
    });

    await services.samples.createSample({
      id: 'SMP-REP-2',
      experimentId: 'EXP-001',
      category: 'Normal Cake',
      storageCondition: 'Unfrozen',
      replicateNumber: 'Sample 2',
      testDateTime: new Date().toISOString(),
    });

    const all = await services.samples.getSamples('EXP-001');
    expect(all.length).toBe(2);
    expect(all.map((s) => s.replicateNumber)).toEqual(['Sample 1', 'Sample 2']);
  });
});
