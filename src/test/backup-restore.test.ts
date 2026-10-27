import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter } from '@/lib/storage/memory-storage-adapter';
import { createServiceContainer } from '@/services';
import { ProjectBackupData } from '@/types/backup';

describe('JSON Backup and Safe Restoration', () => {
  let services: ReturnType<typeof createServiceContainer>;
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    services = createServiceContainer(storage);
  });

  it('exports a valid JSON backup with metadata', async () => {
    await services.experiments.createExperiment({
      id: 'EXP-BKP',
      name: 'Backup Test Experiment',
      testDate: '2026-10-27',
      plannedDurationMinutes: 30,
    });

    await services.samples.createSample({
      id: 'SMP-BKP',
      experimentId: 'EXP-BKP',
      category: 'Normal Cake',
      storageCondition: 'Frozen',
      replicateNumber: 'Sample 1',
      testDateTime: new Date().toISOString(),
    });

    const backup = await services.backup.exportBackup();
    expect(backup.application).toBe('NoseNet');
    expect(backup.version).toBe('1.0.0');
    expect(backup.metadata.totalExperiments).toBe(1);
    expect(backup.metadata.totalSamples).toBe(1);
    expect(backup.experiments[0].id).toBe('EXP-BKP');
  });

  it('validates good backup JSON and rejects malformed schema', () => {
    const validJson = JSON.stringify({
      version: '1.0.0',
      application: 'NoseNet',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalExperiments: 0,
        totalSamples: 0,
        totalReadings: 0,
        totalAssessments: 0,
      },
      experiments: [],
      samples: [],
      sensorReadings: [],
      manualAssessments: [],
    });

    const validResult = services.backup.validateBackupFile(validJson);
    expect(validResult.isValid).toBe(true);

    const invalidJson = JSON.stringify({
      version: '1.0.0',
      application: 'WrongApp', // must be 'NoseNet'
    });

    const invalidResult = services.backup.validateBackupFile(invalidJson);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  it('restores backup in merge mode without wiping existing records', async () => {
    // Existing record in storage
    await services.experiments.createExperiment({
      id: 'EXP-EXISTING',
      name: 'Existing Experiment',
      testDate: '2026-10-27',
      plannedDurationMinutes: 30,
    });

    // Backup to import
    const backupToRestore: ProjectBackupData = {
      version: '1.0.0',
      application: 'NoseNet',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalExperiments: 1,
        totalSamples: 0,
        totalReadings: 0,
        totalAssessments: 0,
      },
      experiments: [
        {
          id: 'EXP-IMPORTED',
          name: 'Imported Experiment',
          description: '',
          createdAt: new Date().toISOString(),
          testDate: '2026-10-27',
          protocolNotes: '',
          plannedDurationMinutes: 60,
          status: 'Active',
          sampleIds: [],
          controls: {
            roomStageCompleted: false,
            emptyContainerStageCompleted: false,
          },
          updatedAt: new Date().toISOString(),
        },
      ],
      samples: [],
      sensorReadings: [],
      manualAssessments: [],
    };

    // Restore with replaceExisting = false (merge)
    await services.backup.restoreBackup(backupToRestore, false);

    const allExps = await services.experiments.getExperiments();
    expect(allExps.length).toBe(2);
    expect(allExps.map((e) => e.id)).toContain('EXP-EXISTING');
    expect(allExps.map((e) => e.id)).toContain('EXP-IMPORTED');
  });

  it('restores backup in replace mode and overwrites when explicitly confirmed', async () => {
    await services.experiments.createExperiment({
      id: 'EXP-OLD',
      name: 'Old Experiment to be Replaced',
      testDate: '2026-10-27',
      plannedDurationMinutes: 30,
    });

    const backupToRestore: ProjectBackupData = {
      version: '1.0.0',
      application: 'NoseNet',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalExperiments: 1,
        totalSamples: 0,
        totalReadings: 0,
        totalAssessments: 0,
      },
      experiments: [
        {
          id: 'EXP-NEW',
          name: 'Brand New Experiment',
          description: '',
          createdAt: new Date().toISOString(),
          testDate: '2026-10-27',
          protocolNotes: '',
          plannedDurationMinutes: 45,
          status: 'Draft',
          sampleIds: [],
          controls: {
            roomStageCompleted: true,
            emptyContainerStageCompleted: false,
          },
          updatedAt: new Date().toISOString(),
        },
      ],
      samples: [],
      sensorReadings: [],
      manualAssessments: [],
    };

    // Restore with replaceExisting = true
    await services.backup.restoreBackup(backupToRestore, true);

    const allExps = await services.experiments.getExperiments();
    expect(allExps.length).toBe(1);
    expect(allExps[0].id).toBe('EXP-NEW');
  });
});
