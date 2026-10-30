import { TestRun, TestReport, MetricSummary } from '@/types/test-run';
import { LiveSensorReading } from '@/types/serial';
import { IndependentHumanAssessment } from '@/types/assessment';

export class ReportService {
  public static calculateReport(
    testRun: TestRun,
    readings: LiveSensorReading[],
    humanAssessment?: IndependentHumanAssessment | null
  ): TestReport {
    const validReadings = readings.filter(
      (r) => r.status === 'OK' || r.status === 'STABLE'
    );

    const calcMetric = (
      values: number[],
      decimals = 2
    ): MetricSummary => {
      if (values.length === 0) {
        return { min: 0, max: 0, mean: 0, start: 0, end: 0, delta: 0 };
      }
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((acc, v) => acc + v, 0);
      const mean = Number((sum / values.length).toFixed(decimals));
      const start = values[0];
      const end = values[values.length - 1];
      const delta = Number((end - start).toFixed(decimals));

      return {
        min: Number(min.toFixed(decimals)),
        max: Number(max.toFixed(decimals)),
        mean,
        start: Number(start.toFixed(decimals)),
        end: Number(end.toFixed(decimals)),
        delta,
      };
    };

    const tempValues = validReadings.map((r) => r.temperature_C);
    const humidityValues = validReadings.map((r) => r.humidity_percent);
    const pressureValues = validReadings.map((r) => r.pressure_hPa);
    const gasKohmValues = validReadings.map((r) => r.gas_resistance_kohm);

    const tempSummary = calcMetric(tempValues, 2);
    const humiditySummary = calcMetric(humidityValues, 2);
    const pressureSummary = calcMetric(pressureValues, 2);
    const gasSummaryBase = calcMetric(gasKohmValues, 3);

    const percentChange =
      gasSummaryBase.start > 0
        ? Number(
            (((gasSummaryBase.end - gasSummaryBase.start) / gasSummaryBase.start) * 100).toFixed(
              2
            )
          )
        : 0;

    const interpretationNotice =
      'Sensor observations — freshness classification not yet validated. ' +
      'BME688 metal oxide gas resistance changes reflect headspace volatile compound (VOC) concentration shifts ' +
      'and ambient temperature/humidity interactions. These empirical trends provide non-destructive sensor ' +
      'characterization but do not constitute a definitive food-safety, adulteration, or microbiological shelf-life verdict.';

    return {
      testRun,
      readings,
      temperature: tempSummary,
      humidity: humiditySummary,
      pressure: pressureSummary,
      gasResistance: {
        ...gasSummaryBase,
        percentChange,
      },
      humanAssessment: humanAssessment || null,
      interpretationNotice,
    };
  }

  public static compareReports(reports: TestReport[]) {
    // Aligns tests by elapsed time for honest comparison
    return reports.map((rep) => ({
      testId: rep.testRun.id,
      sampleId: rep.testRun.sampleId,
      category: rep.testRun.cakeCategory,
      storage: rep.testRun.storageCondition,
      stage: rep.testRun.stage,
      duration: rep.testRun.actualDurationSeconds,
      validReadings: rep.testRun.validReadingsCount,
      gasStartKohm: rep.gasResistance.start,
      gasEndKohm: rep.gasResistance.end,
      gasDeltaKohm: rep.gasResistance.delta,
      gasPercentChange: rep.gasResistance.percentChange,
      meanTempC: rep.temperature.mean,
      meanHumidityPercent: rep.humidity.mean,
      humanVerdict: rep.humanAssessment?.humanAssessment || 'Not Assessed',
    }));
  }
}
