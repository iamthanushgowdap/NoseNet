import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '@/lib/storage/local-storage-adapter';
import { createServiceContainer } from '@/services';

describe('Local Persistence after Page Reload', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists experiments and samples across new adapter instances (page reload simulation)', async () => {
    // 1. Initial page session writes data
    const adapter1 = new LocalStorageAdapter();
    const services1 = createServiceContainer(adapter1);

    await services1.experiments.createExperiment({
      id: 'EXP-PERSIST-01',
      name: 'Persistent Experiment',
      testDate: '2026-10-27',
      plannedDurationMinutes: 45,
    });

    await services1.samples.createSample({
      id: 'SMP-PERSIST-01',
      experimentId: 'EXP-PERSIST-01',
      category: 'Pastry Cake',
      storageCondition: 'Frozen',
      replicateNumber: 'Sample 1',
      testDateTime: new Date().toISOString(),
    });

    // 2. Simulate page reload by creating a fresh adapter instance
    const adapter2 = new LocalStorageAdapter();
    const services2 = createServiceContainer(adapter2);

    const reloadedExp = await services2.experiments.getExperimentById('EXP-PERSIST-01');
    expect(reloadedExp).not.toBeNull();
    expect(reloadedExp?.name).toBe('Persistent Experiment');

    const reloadedSample = await services2.samples.getSampleById('SMP-PERSIST-01');
    expect(reloadedSample).not.toBeNull();
    expect(reloadedSample?.category).toBe('Pastry Cake');
    expect(reloadedSample?.storageCondition).toBe('Frozen');
  });

  it('persists demo session across page reload', async () => {
    const adapter1 = new LocalStorageAdapter();
    const services1 = createServiceContainer(adapter1);

    await services1.auth.login('Dr. S. Nair', 'researcher');

    // Simulate reload
    const adapter2 = new LocalStorageAdapter();
    const services2 = createServiceContainer(adapter2);

    const session = await services2.auth.getSession();
    expect(session).not.toBeNull();
    expect(session?.displayName).toBe('Dr. S. Nair');
    expect(session?.role).toBe('researcher');
  });
});
