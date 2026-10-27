import { IStorageAdapter } from '@/lib/storage/storage-adapter';
import { ProjectBackupData, ProjectBackupMetadata } from '@/types/backup';
import { ProjectBackupDataSchema } from '@/lib/validation/backup.schema';
import { Experiment } from '@/types/experiment';
import { Sample } from '@/types/sample';
import { SensorReading } from '@/types/sensor';
import { ManualAssessment } from '@/types/assessment';
import Papa from 'papaparse';

export class BackupService {
  constructor(private storage: IStorageAdapter) {}

  async exportBackup(): Promise<ProjectBackupData> {
    const experiments = await this.storage.getExperiments();
    const samples = await this.storage.getSamples();
    const sensorReadings = await this.storage.getSensorReadings();
    const manualAssessments = await this.storage.getAssessments();

    const metadata: ProjectBackupMetadata = {
      totalExperiments: experiments.length,
      totalSamples: samples.length,
      totalReadings: sensorReadings.length,
      totalAssessments: manualAssessments.length,
    };

    return {
      version: '1.0.0',
      application: 'NoseNet',
      exportedAt: new Date().toISOString(),
      metadata,
      experiments,
      samples,
      sensorReadings,
      manualAssessments,
    };
  }

  validateBackupFile(jsonString: string): {
    isValid: boolean;
    data?: ProjectBackupData;
    errors: string[];
  } {
    try {
      const parsed = JSON.parse(jsonString);
      const result = ProjectBackupDataSchema.safeParse(parsed);
      if (!result.success) {
        return {
          isValid: false,
          errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return {
        isValid: true,
        data: result.data as ProjectBackupData,
        errors: [],
      };
    } catch {
      return {
        isValid: false,
        errors: ['Invalid JSON syntax. Please verify that the backup file is intact and not corrupted.'],
      };
    }
  }

  async restoreBackup(
    backupData: ProjectBackupData,
    replaceExisting: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    if (replaceExisting) {
      await this.storage.saveExperiments(backupData.experiments);
      await this.storage.saveSamples(backupData.samples);
      await this.storage.saveSensorReadings(backupData.sensorReadings);
      await this.storage.saveAssessments(backupData.manualAssessments);
    } else {
      // Merge mode
      const curExp = await this.storage.getExperiments();
      const curSmp = await this.storage.getSamples();
      const curReadings = await this.storage.getSensorReadings();
      const curAssessments = await this.storage.getAssessments();

      const expMap = new Map(curExp.map((e) => [e.id, e]));
      backupData.experiments.forEach((e) => expMap.set(e.id, e));

      const smpMap = new Map(curSmp.map((s) => [s.id, s]));
      backupData.samples.forEach((s) => smpMap.set(s.id, s));

      const readingMap = new Map(
        curReadings.map((r) => [`${r.experimentId}::${r.sampleId}::${r.stage}::${r.elapsedSeconds}`, r])
      );
      backupData.sensorReadings.forEach((r) =>
        readingMap.set(`${r.experimentId}::${r.sampleId}::${r.stage}::${r.elapsedSeconds}`, r)
      );

      const asmMap = new Map(curAssessments.map((a) => [a.id, a]));
      backupData.manualAssessments.forEach((a) => asmMap.set(a.id, a));

      await this.storage.saveExperiments(Array.from(expMap.values()));
      await this.storage.saveSamples(Array.from(smpMap.values()));
      await this.storage.saveSensorReadings(Array.from(readingMap.values()));
      await this.storage.saveAssessments(Array.from(asmMap.values()));
    }

    return {
      success: true,
      message: `Successfully restored ${backupData.experiments.length} experiments, ${backupData.samples.length} samples, ${backupData.sensorReadings.length} sensor readings, and ${backupData.manualAssessments.length} manual assessments.`,
    };
  }

  async exportExperimentsCsv(): Promise<string> {
    const list = await this.storage.getExperiments();
    const rows = list.map((e) => ({
      experiment_id: e.id,
      name: e.name,
      status: e.status,
      test_date: e.testDate,
      planned_duration_mins: e.plannedDurationMinutes,
      actual_duration_mins: e.actualDurationMinutes ?? '',
      sample_count: e.sampleIds.length,
      room_control_done: e.controls.roomStageCompleted ? 'YES' : 'NO',
      room_baseline_kohm: e.controls.roomBaselineResistanceKohm ?? '',
      container_control_done: e.controls.emptyContainerStageCompleted ? 'YES' : 'NO',
      container_baseline_kohm: e.controls.emptyContainerBaselineResistanceKohm ?? '',
      created_at: e.createdAt,
      protocol_notes: e.protocolNotes,
    }));
    return Papa.unparse(rows);
  }

  async exportSamplesCsv(): Promise<string> {
    const list = await this.storage.getSamples();
    const rows = list.map((s) => ({
      sample_id: s.id,
      experiment_id: s.experimentId,
      category: s.category,
      storage_condition: s.storageCondition,
      replicate_number: s.replicateNumber,
      test_datetime: s.testDateTime,
      status: s.status,
      mass_grams: s.massGrams ?? '',
      notes: s.notes ?? '',
      created_at: s.createdAt,
    }));
    return Papa.unparse(rows);
  }

  async seedCollegeDemoDataset(): Promise<void> {
    const exp1: Experiment = {
      id: 'EXP-2026-001',
      name: 'Ambient Degradation — Normal vs Pastry Cake',
      description:
        'Investigation into volatile organic compound (VOC) headspace emissions of normal and pastry cakes under ambient room temperature conditions over 72 hours.',
      createdAt: '2026-10-25T09:00:00.000Z',
      testDate: '2026-10-25',
      protocolNotes:
        'Protocol 1.2: 60s ROOM baseline, 60s EMPTY_CONTAINER baseline, followed by 180s closed-chamber CAKE evaluation. BME680 sensor heated at 320°C for 150ms.',
      plannedDurationMinutes: 60,
      actualDurationMinutes: 55,
      status: 'Active',
      sampleIds: ['SMP-NC-UF-01', 'SMP-PC-UF-02', 'SMP-NC-UF-05'],
      controls: {
        roomStageCompleted: true,
        roomBaselineResistanceKohm: 54.2,
        emptyContainerStageCompleted: true,
        emptyContainerBaselineResistanceKohm: 52.8,
        notes: 'Room baseline stabilized at 24.2°C, 51% RH.',
      },
      updatedAt: '2026-10-26T14:30:00.000Z',
    };

    const exp2: Experiment = {
      id: 'EXP-2026-002',
      name: 'Frozen Storage Stability Benchmark',
      description:
        'Evaluating the efficacy of sub-zero frozen storage (-18°C) on delaying moisture migration and volatile spoilage markers in cream-filled pastry cakes.',
      createdAt: '2026-10-26T10:00:00.000Z',
      testDate: '2026-10-26',
      protocolNotes:
        'Thawed at 22°C for 30 minutes before headspace aspiration. Compare against unfrozen parallel batch.',
      plannedDurationMinutes: 45,
      actualDurationMinutes: 42,
      status: 'Active',
      sampleIds: ['SMP-NC-FZ-03', 'SMP-PC-FZ-04'],
      controls: {
        roomStageCompleted: true,
        roomBaselineResistanceKohm: 55.1,
        emptyContainerStageCompleted: true,
        emptyContainerBaselineResistanceKohm: 53.4,
        notes: 'Chamber cleaned with filtered dry air between replicates.',
      },
      updatedAt: '2026-10-26T16:00:00.000Z',
    };

    const samples: Sample[] = [
      {
        id: 'SMP-NC-UF-01',
        experimentId: 'EXP-2026-001',
        category: 'Normal Cake',
        storageCondition: 'Unfrozen',
        replicateNumber: 'Sample 1',
        testDateTime: '2026-10-25T10:30:00.000Z',
        massGrams: 45.2,
        notes: 'Freshly baked sponge cake, kept at 24°C for 4 hours. No visual mould.',
        status: 'Completed',
        createdAt: '2026-10-25T09:30:00.000Z',
        updatedAt: '2026-10-25T11:00:00.000Z',
      },
      {
        id: 'SMP-PC-UF-02',
        experimentId: 'EXP-2026-001',
        category: 'Pastry Cake',
        storageCondition: 'Unfrozen',
        replicateNumber: 'Sample 1',
        testDateTime: '2026-10-25T11:45:00.000Z',
        massGrams: 52.8,
        notes: 'Vanilla cream puff pastry. 48 hours post-baking. Slight sweet sour odor detected.',
        status: 'Completed',
        createdAt: '2026-10-25T09:40:00.000Z',
        updatedAt: '2026-10-25T12:15:00.000Z',
      },
      {
        id: 'SMP-NC-FZ-03',
        experimentId: 'EXP-2026-002',
        category: 'Normal Cake',
        storageCondition: 'Frozen',
        replicateNumber: 'Sample 1',
        testDateTime: '2026-10-26T11:00:00.000Z',
        massGrams: 46.0,
        notes: 'Stored in deep freezer for 5 days. Thawed for 30 mins before headspace reading.',
        status: 'Completed',
        createdAt: '2026-10-26T10:15:00.000Z',
        updatedAt: '2026-10-26T11:30:00.000Z',
      },
      {
        id: 'SMP-PC-FZ-04',
        experimentId: 'EXP-2026-002',
        category: 'Pastry Cake',
        storageCondition: 'Frozen',
        replicateNumber: 'Sample 1',
        testDateTime: '2026-10-26T12:00:00.000Z',
        massGrams: 51.5,
        notes: 'Frozen pastry cake. Excellent structural integrity and zero off-odor.',
        status: 'Completed',
        createdAt: '2026-10-26T10:20:00.000Z',
        updatedAt: '2026-10-26T12:45:00.000Z',
      },
      {
        id: 'SMP-NC-UF-05',
        experimentId: 'EXP-2026-001',
        category: 'Normal Cake',
        storageCondition: 'Unfrozen',
        replicateNumber: 'Sample 2',
        testDateTime: '2026-10-27T08:00:00.000Z',
        massGrams: 44.8,
        notes: 'Replicate 2 after 72 hours ambient storage. Marginal dryness at crumb edges.',
        status: 'Testing',
        createdAt: '2026-10-27T07:00:00.000Z',
        updatedAt: '2026-10-27T07:15:00.000Z',
      },
    ];

    // Realistic ESP32 sensor readings for SMP-NC-UF-01 across ROOM, EMPTY_CONTAINER, and CAKE
    const readings: SensorReading[] = [];
    const nowIso = new Date().toISOString();

    // ROOM stage (0 to 50s, step 5s)
    for (let t = 0; t <= 50; t += 5) {
      readings.push({
        id: `EXP-2026-001_SMP-NC-UF-01_ROOM_${t}`,
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-NC-UF-01',
        stage: 'ROOM',
        sampleNo: 1,
        elapsedSeconds: t,
        temperatureC: Number((23.8 + Math.sin(t / 10) * 0.2).toFixed(2)),
        humidityPercent: Number((50.5 + Math.cos(t / 15) * 0.4).toFixed(2)),
        pressureHpa: Number((1012.4 + (t % 3) * 0.05).toFixed(2)),
        gasResistanceOhm: Math.round(54000 + (t % 4) * 200),
        gasResistanceKohm: Number(((54000 + (t % 4) * 200) / 1000).toFixed(3)),
        status: 'OK',
        importedAt: nowIso,
      });
    }

    // EMPTY_CONTAINER stage (55 to 110s, step 5s)
    for (let t = 55; t <= 110; t += 5) {
      readings.push({
        id: `EXP-2026-001_SMP-NC-UF-01_EMPTY_CONTAINER_${t}`,
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-NC-UF-01',
        stage: 'EMPTY_CONTAINER',
        sampleNo: 1,
        elapsedSeconds: t,
        temperatureC: Number((24.1 + Math.sin(t / 10) * 0.15).toFixed(2)),
        humidityPercent: Number((51.2 + Math.cos(t / 15) * 0.3).toFixed(2)),
        pressureHpa: Number((1012.3 + (t % 2) * 0.04).toFixed(2)),
        gasResistanceOhm: Math.round(52800 + (t % 3) * 150),
        gasResistanceKohm: Number(((52800 + (t % 3) * 150) / 1000).toFixed(3)),
        status: 'OK',
        importedAt: nowIso,
      });
    }

    // CAKE stage (115 to 240s, step 5s) - Fresh normal cake VOC release
    for (let t = 115; t <= 240; t += 5) {
      const relT = t - 115;
      // Fresh cake produces slight resistance rise as moisture and volatile profile stabilizes
      const gasKohm = 52.8 + (relT * 0.15) - Math.sin(relT / 20) * 1.2;
      readings.push({
        id: `EXP-2026-001_SMP-NC-UF-01_CAKE_${t}`,
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-NC-UF-01',
        stage: 'CAKE',
        sampleNo: 1,
        elapsedSeconds: t,
        temperatureC: Number((24.5 + relT * 0.01).toFixed(2)),
        humidityPercent: Number((53.5 + Math.min(relT * 0.03, 3.5)).toFixed(2)),
        pressureHpa: 1012.2,
        gasResistanceOhm: Math.round(gasKohm * 1000),
        gasResistanceKohm: Number(gasKohm.toFixed(3)),
        status: 'OK',
        importedAt: nowIso,
      });
    }

    // Also add readings for aged Pastry Cake SMP-PC-UF-02 showing significant drop in gas resistance (higher VOC / volatile emissions)
    for (let t = 0; t <= 40; t += 5) {
      readings.push({
        id: `EXP-2026-001_SMP-PC-UF-02_ROOM_${t}`,
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-PC-UF-02',
        stage: 'ROOM',
        sampleNo: 1,
        elapsedSeconds: t,
        temperatureC: 24.0,
        humidityPercent: 50.8,
        pressureHpa: 1012.5,
        gasResistanceOhm: 54500,
        gasResistanceKohm: 54.5,
        status: 'OK',
        importedAt: nowIso,
      });
    }
    for (let t = 45; t <= 180; t += 5) {
      const relT = t - 45;
      // Aged pastry with fermented cream drops gas resistance noticeably to 22-26 kOhm
      const gasKohm = Math.max(21.5, 53.0 - (relT * 0.28));
      readings.push({
        id: `EXP-2026-001_SMP-PC-UF-02_CAKE_${t}`,
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-PC-UF-02',
        stage: 'CAKE',
        sampleNo: 1,
        elapsedSeconds: t,
        temperatureC: Number((24.2 + relT * 0.012).toFixed(2)),
        humidityPercent: Number((54.0 + relT * 0.04).toFixed(2)),
        pressureHpa: 1012.4,
        gasResistanceOhm: Math.round(gasKohm * 1000),
        gasResistanceKohm: Number(gasKohm.toFixed(3)),
        status: 'OK',
        importedAt: nowIso,
      });
    }

    const assessments: ManualAssessment[] = [
      {
        id: 'asm_001',
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-NC-UF-01',
        assessorName: 'Dr. S. Nair (Faculty Advisor)',
        assessorId: 'usr_snair',
        label: 'Fresh',
        confidenceRating: 5,
        notes: 'Classic vanilla sponge scent, spongy crumb, optimal moisture retention.',
        createdAt: '2026-10-25T11:05:00.000Z',
      },
      {
        id: 'asm_002',
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-NC-UF-01',
        assessorName: 'Rahul Verma (Student Assessor)',
        assessorId: 'usr_rverma',
        label: 'Fresh',
        confidenceRating: 4,
        notes: 'Appears very fresh, clean aroma.',
        createdAt: '2026-10-25T11:10:00.000Z',
      },
      {
        id: 'asm_003',
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-PC-UF-02',
        assessorName: 'Dr. S. Nair (Faculty Advisor)',
        assessorId: 'usr_snair',
        label: 'Not Good',
        confidenceRating: 5,
        notes: 'Dairy filling exhibits sour off-notes. Moisture weeping observed on choux pastry.',
        createdAt: '2026-10-25T12:20:00.000Z',
      },
      {
        id: 'asm_004',
        experimentId: 'EXP-2026-002',
        sampleId: 'SMP-PC-FZ-04',
        assessorName: 'Ananya Roy (Assessor)',
        assessorId: 'usr_aroy',
        label: 'Fresh',
        confidenceRating: 4,
        notes: 'Cold stabilization retained pleasant vanilla custard aroma.',
        createdAt: '2026-10-26T12:50:00.000Z',
      },
      // Disagreement scenario on sample SMP-NC-UF-05 to demonstrate disagreement detection
      {
        id: 'asm_005',
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-NC-UF-05',
        assessorName: 'Rahul Verma (Student Assessor)',
        assessorId: 'usr_rverma',
        label: 'Average',
        confidenceRating: 3,
        notes: 'Slightly dry outer crust, but core smells acceptable.',
        createdAt: '2026-10-27T07:20:00.000Z',
      },
      {
        id: 'asm_006',
        experimentId: 'EXP-2026-001',
        sampleId: 'SMP-NC-UF-05',
        assessorName: 'Ananya Roy (Assessor)',
        assessorId: 'usr_aroy',
        label: 'Not Good',
        confidenceRating: 4,
        notes: 'Detected mild rancid fat note in the crumb after 72 hours ambient.',
        createdAt: '2026-10-27T07:25:00.000Z',
      },
    ];

    await this.storage.saveExperiments([exp1, exp2]);
    await this.storage.saveSamples(samples);
    await this.storage.saveSensorReadings(readings);
    await this.storage.saveAssessments(assessments);
  }
}
