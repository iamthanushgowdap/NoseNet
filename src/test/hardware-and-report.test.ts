import { describe, it, expect } from 'vitest';
import { parseSerialJsonLine } from '@/lib/validation/serial.schema';
import { ReportService } from '@/services/report-service';
import { ExportService } from '@/services/export-service';
import { TestRun } from '@/types/test-run';
import { LiveSensorReading } from '@/types/serial';
import { IndependentHumanAssessment } from '@/types/assessment';

describe('Web Serial Protocol & Hardware Ingestion', () => {
  it('correctly parses valid BME688 reading JSON lines', () => {
    const rawLine = '{"type":"reading","seq":42,"elapsed_ms":42000,"temperature_C":25.4,"humidity_percent":65.2,"pressure_hPa":715.1,"gas_resistance_ohm":35000,"gas_resistance_kohm":35.000,"status":"OK"}';
    const result = parseSerialJsonLine(rawLine);
    expect(result.success).toBe(true);
    if (result.success && result.data.type === 'reading') {
      expect(result.data.seq).toBe(42);
      expect(result.data.elapsed_ms).toBe(42000);
      expect(result.data.temperature_C).toBe(25.4);
      expect(result.data.humidity_percent).toBe(65.2);
      expect(result.data.pressure_hPa).toBe(715.1);
      expect(result.data.gas_resistance_ohm).toBe(35000);
      expect(result.data.gas_resistance_kohm).toBe(35);
      expect(result.data.status).toBe('OK');
    }
  });

  it('correctly parses ESP32 boot event line', () => {
    const rawLine = '{"type":"boot","board":"ESP32-WROOM-32","sensor":"BME688","version":"1.0.0","i2c_sda":21,"i2c_scl":22,"baud":115200}';
    const result = parseSerialJsonLine(rawLine);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('boot');
    }
  });

  it('correctly parses sensor status and diagnostic line', () => {
    const rawLine = '{"type":"status","sensor":"BME688","initialized":true,"i2c_addr":"0x76","message":"BME688 initialized."}';
    const result = parseSerialJsonLine(rawLine);
    expect(result.success).toBe(true);
    if (result.success && result.data.type === 'status') {
      expect(result.data.initialized).toBe(true);
    }
  });

  it('handles corrupted or non-JSON serial noise gracefully without throwing', () => {
    const noisyLine = 'ESP-ROM:esp32s2-20200826 rst:0x1 (POWERON)';
    const result = parseSerialJsonLine(noisyLine);
    expect(result.success).toBe(false);
  });
});

describe('ReportService Statistical Calculation', () => {
  const dummyTest: TestRun = {
    id: 'TEST-20261030-001',
    sampleId: 'SMP-NC-UF-01',
    cakeCategory: 'Normal cake',
    storageCondition: 'Unfrozen',
    stage: 'Cake sample',
    status: 'Completed',
    plannedDurationSeconds: 360,
    actualDurationSeconds: 360,
    startedAt: '2026-10-30T00:00:00.000Z',
    completedAt: '2026-10-30T00:06:00.000Z',
    readingsCount: 3,
    validReadingsCount: 3,
    errorReadingsCount: 0,
    interruptionEvents: [],
    assessmentToken: 'test-token-12345678',
    assessmentStatus: 'Submitted',
  };

  const dummyReadings: LiveSensorReading[] = [
    {
      seq: 1,
      elapsed_ms: 1000,
      temperature_C: 25.0,
      humidity_percent: 60.0,
      pressure_hPa: 715.0,
      gas_resistance_ohm: 20000,
      gas_resistance_kohm: 20.0,
      status: 'OK',
      receivedAt: '2026-10-30T00:00:01.000Z',
    },
    {
      seq: 2,
      elapsed_ms: 2000,
      temperature_C: 25.5,
      humidity_percent: 61.0,
      pressure_hPa: 715.2,
      gas_resistance_ohm: 25000,
      gas_resistance_kohm: 25.0,
      status: 'OK',
      receivedAt: '2026-10-30T00:00:02.000Z',
    },
    {
      seq: 3,
      elapsed_ms: 3000,
      temperature_C: 26.0,
      humidity_percent: 62.0,
      pressure_hPa: 715.4,
      gas_resistance_ohm: 30000,
      gas_resistance_kohm: 30.0,
      status: 'OK',
      receivedAt: '2026-10-30T00:00:03.000Z',
    },
  ];

  it('accurately calculates min, max, mean, delta, and percentChange', () => {
    const report = ReportService.calculateReport(dummyTest, dummyReadings);

    // Gas resistance: start=20, end=30, delta=10, min=20, max=30, mean=25
    expect(report.gasResistance.start).toBe(20.0);
    expect(report.gasResistance.end).toBe(30.0);
    expect(report.gasResistance.delta).toBe(10.0);
    expect(report.gasResistance.mean).toBe(25.0);
    expect(report.gasResistance.percentChange).toBe(50.0);

    // Temperature: start=25.0, end=26.0, delta=1.0, mean=25.5
    expect(report.temperature.start).toBe(25.0);
    expect(report.temperature.end).toBe(26.0);
    expect(report.temperature.mean).toBe(25.5);

    // Honest interpretation notice
    expect(report.interpretationNotice).toContain('Sensor observations — freshness classification not yet validated');
  });
});

describe('ExportService CSV Formatting', () => {
  const dummyTest: TestRun = {
    id: 'TEST-20261030-001',
    sampleId: 'SMP-NC-UF-01',
    cakeCategory: 'Normal cake',
    storageCondition: 'Unfrozen',
    stage: 'Cake sample',
    status: 'Completed',
    plannedDurationSeconds: 360,
    actualDurationSeconds: 360,
    startedAt: '2026-10-30T00:00:00.000Z',
    completedAt: '2026-10-30T00:06:00.000Z',
    readingsCount: 1,
    validReadingsCount: 1,
    errorReadingsCount: 0,
    interruptionEvents: [],
    assessmentToken: 'test-token-12345678',
    assessmentStatus: 'Submitted',
  };

  const dummyReadings: LiveSensorReading[] = [
    {
      seq: 1,
      elapsed_ms: 1000,
      temperature_C: 25.4,
      humidity_percent: 65.2,
      pressure_hPa: 715.1,
      gas_resistance_ohm: 35000,
      gas_resistance_kohm: 35.0,
      status: 'OK',
      receivedAt: '2026-10-30T00:00:01.000Z',
    },
  ];

  it('generates exact CSV header and data row matching user schema', () => {
    const csv = ExportService.exportRawReadingsCsv(dummyTest, dummyReadings);
    const lines = csv.trim().split('\r\n');
    const header = lines[0] || lines.join('\n').split('\n')[0];

    expect(header).toBe(
      'test_id,timestamp,elapsed_ms,sequence,sample_id,cake_category,storage_condition,stage,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status'
    );
  });
});
