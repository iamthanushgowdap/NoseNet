import { IStorageAdapter } from '@/lib/storage/storage-adapter';
import { SensorReading, SensorStage, CsvImportPreview, CsvImportResult } from '@/types/sensor';
import { parseSensorCsv } from '@/lib/validation/sensor.schema';
import Papa from 'papaparse';

export interface SensorFilterOptions {
  experimentId?: string;
  sampleId?: string;
  stage?: SensorStage | 'ALL';
  date?: string;
}

export interface MovingAveragePoint extends SensorReading {
  isMovingAverage?: boolean;
  smaGasKohm?: number;
  smaTempC?: number;
  smaHumidity?: number;
  smaPressureHpa?: number;
}

export class SensorService {
  constructor(private storage: IStorageAdapter) {}

  async previewCsv(csvContent: string, fileName: string = 'data.csv'): Promise<CsvImportPreview> {
    const existing = await this.storage.getSensorReadings();
    return parseSensorCsv(csvContent, fileName, existing);
  }

  async importReadings(readings: SensorReading[]): Promise<CsvImportResult> {
    if (!readings || readings.length === 0) {
      return {
        success: true,
        importedCount: 0,
        skippedDuplicatesCount: 0,
        errors: [],
      };
    }

    const existing = await this.storage.getSensorReadings();
    const existingKeys = new Set(
      existing.map((r) => `${r.experimentId}::${r.sampleId}::${r.stage}::${r.elapsedSeconds}`)
    );

    const newReadings: SensorReading[] = [];
    let skipped = 0;

    for (const r of readings) {
      const key = `${r.experimentId}::${r.sampleId}::${r.stage}::${r.elapsedSeconds}`;
      if (existingKeys.has(key)) {
        skipped++;
      } else {
        existingKeys.add(key);
        newReadings.push(r);
      }
    }

    if (newReadings.length > 0) {
      await this.storage.saveSensorReadings([...existing, ...newReadings]);
    }

    return {
      success: true,
      importedCount: newReadings.length,
      skippedDuplicatesCount: skipped,
      errors: [],
    };
  }

  async getReadings(filter?: SensorFilterOptions): Promise<SensorReading[]> {
    let list = await this.storage.getSensorReadings();

    if (filter?.experimentId && filter.experimentId !== 'ALL') {
      list = list.filter((r) => r.experimentId === filter.experimentId);
    }

    if (filter?.sampleId && filter.sampleId !== 'ALL') {
      list = list.filter((r) => r.sampleId === filter.sampleId);
    }

    if (filter?.stage && filter.stage !== 'ALL') {
      list = list.filter((r) => r.stage === filter.stage);
    }

    if (filter?.date) {
      list = list.filter((r) => r.importedAt.startsWith(filter.date!));
    }

    return list.sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);
  }

  calculateMovingAverages(readings: SensorReading[], windowSize: number = 5): MovingAveragePoint[] {
    if (readings.length === 0) return [];
    const sorted = [...readings].sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);

    return sorted.map((item, idx) => {
      const start = Math.max(0, idx - windowSize + 1);
      const windowSlice = sorted.slice(start, idx + 1);

      const avgGasKohm =
        windowSlice.reduce((acc, curr) => acc + curr.gasResistanceKohm, 0) / windowSlice.length;
      const avgTemp =
        windowSlice.reduce((acc, curr) => acc + curr.temperatureC, 0) / windowSlice.length;
      const avgHum =
        windowSlice.reduce((acc, curr) => acc + curr.humidityPercent, 0) / windowSlice.length;
      const avgPres =
        windowSlice.reduce((acc, curr) => acc + curr.pressureHpa, 0) / windowSlice.length;

      return {
        ...item,
        smaGasKohm: Number(avgGasKohm.toFixed(3)),
        smaTempC: Number(avgTemp.toFixed(2)),
        smaHumidity: Number(avgHum.toFixed(2)),
        smaPressureHpa: Number(avgPres.toFixed(2)),
      };
    });
  }

  exportToCsv(readings: SensorReading[]): string {
    const rows = readings.map((r) => ({
      experiment_id: r.experimentId,
      sample_id: r.sampleId,
      stage: r.stage,
      sample_no: r.sampleNo ?? '',
      elapsed_seconds: r.elapsedSeconds,
      temperature_C: r.temperatureC,
      humidity_percent: r.humidityPercent,
      pressure_hPa: r.pressureHpa,
      gas_resistance_ohm: r.gasResistanceOhm,
      gas_resistance_kohm: r.gasResistanceKohm,
      status: r.status,
    }));

    return Papa.unparse(rows);
  }

  async getFilterOptions(): Promise<{
    experiments: string[];
    samples: string[];
    stages: SensorStage[];
  }> {
    const readings = await this.storage.getSensorReadings();
    const experiments = Array.from(new Set(readings.map((r) => r.experimentId))).filter(Boolean);
    const samples = Array.from(new Set(readings.map((r) => r.sampleId))).filter(Boolean);
    const stages: SensorStage[] = ['ROOM', 'EMPTY_CONTAINER', 'CAKE'];

    return { experiments, samples, stages };
  }

  async clearAllReadings(): Promise<void> {
    await this.storage.saveSensorReadings([]);
  }
}
