import Papa from 'papaparse';
import { TestRun } from '@/types/test-run';
import { LiveSensorReading } from '@/types/serial';
import { IndependentHumanAssessment } from '@/types/assessment';

export class ExportService {
  /**
   * Export raw readings matching exact user-specified schema:
   * test_id,timestamp,elapsed_ms,sequence,sample_id,cake_category,storage_condition,stage,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status
   */
  public static exportRawReadingsCsv(testRun: TestRun, readings: LiveSensorReading[]): string {
    const rows = readings.map((r) => ({
      test_id: testRun.id,
      timestamp: r.receivedAt,
      elapsed_ms: r.elapsed_ms,
      sequence: r.seq,
      sample_id: testRun.sampleId,
      cake_category: testRun.cakeCategory,
      storage_condition: testRun.storageCondition,
      stage: testRun.stage,
      temperature_C: r.temperature_C,
      humidity_percent: r.humidity_percent,
      pressure_hPa: r.pressure_hPa,
      gas_resistance_ohm: r.gas_resistance_ohm,
      gas_resistance_kohm: r.gas_resistance_kohm,
      status: r.status,
    }));

    return Papa.unparse(rows, { header: true });
  }

  /**
   * Export tests list metadata as CSV
   */
  public static exportTestRunsSummaryCsv(tests: TestRun[]): string {
    const rows = tests.map((t) => ({
      test_id: t.id,
      sample_id: t.sampleId,
      cake_category: t.cakeCategory,
      storage_condition: t.storageCondition,
      stage: t.stage,
      status: t.status,
      planned_duration_sec: t.plannedDurationSeconds,
      actual_duration_sec: t.actualDurationSeconds,
      started_at: t.startedAt,
      completed_at: t.completedAt || '',
      readings_count: t.readingsCount,
      valid_readings_count: t.validReadingsCount,
      error_readings_count: t.errorReadingsCount,
      assessment_status: t.assessmentStatus,
      assessment_token: t.assessmentToken,
      operator_notes: t.operatorNotes || '',
    }));

    return Papa.unparse(rows, { header: true });
  }

  /**
   * Export human assessments as CSV
   */
  public static exportAssessmentsCsv(assessments: IndependentHumanAssessment[]): string {
    const rows = assessments.map((a) => ({
      assessment_id: a.id,
      test_id: a.testId,
      token: a.token,
      visual_condition: a.visualCondition,
      smell_assessment: a.smellAssessment,
      human_assessment: a.humanAssessment,
      confidence: a.confidence || '',
      assessor_identifier: a.assessorIdentifier || '',
      observations: a.observations || '',
      submitted_at: a.submittedAt,
    }));

    return Papa.unparse(rows, { header: true });
  }

  /**
   * Export raw readings from multiple tests combined matching exact schema:
   * test_id,timestamp,elapsed_ms,sequence,sample_id,cake_category,storage_condition,stage,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status
   */
  public static exportAllRawReadingsCombinedCsv(
    testsWithReadings: { testRun: TestRun; readings: LiveSensorReading[] }[]
  ): string {
    const rows = testsWithReadings.flatMap(({ testRun, readings }) =>
      readings.map((r) => ({
        test_id: testRun.id,
        timestamp: r.receivedAt,
        elapsed_ms: r.elapsed_ms,
        sequence: r.seq,
        sample_id: testRun.sampleId,
        cake_category: testRun.cakeCategory,
        storage_condition: testRun.storageCondition,
        stage: testRun.stage,
        temperature_C: r.temperature_C,
        humidity_percent: r.humidity_percent,
        pressure_hPa: r.pressure_hPa,
        gas_resistance_ohm: r.gas_resistance_ohm,
        gas_resistance_kohm: r.gas_resistance_kohm,
        status: r.status,
      }))
    );

    return Papa.unparse(rows, { header: true });
  }

  /**
   * Download a string payload as a browser file
   */
  public static triggerBrowserDownload(
    content: string,
    filename: string,
    mimeType = 'text/csv;charset=utf-8;'
  ) {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public static triggerDownload = ExportService.triggerBrowserDownload;
}
