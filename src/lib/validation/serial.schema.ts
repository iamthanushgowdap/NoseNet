import { z } from 'zod';

export const LiveSensorReadingSchema = z.object({
  type: z.literal('reading'),
  seq: z.number().int().nonnegative(),
  elapsed_ms: z.number().nonnegative(),
  temperature_C: z.number().min(-40).max(85),
  humidity_percent: z.number().min(0).max(100),
  pressure_hPa: z.number().min(300).max(1200),
  gas_resistance_ohm: z.number().nonnegative(),
  gas_resistance_kohm: z.number().nonnegative().optional(),
  status: z.enum(['OK', 'HEATING', 'STABLE', 'ERROR']).default('OK'),
}).transform((data) => ({
  ...data,
  gas_resistance_kohm:
    data.gas_resistance_kohm ?? Number((data.gas_resistance_ohm / 1000).toFixed(3)),
}));

export const SerialBootMessageSchema = z.object({
  type: z.literal('boot'),
  board: z.string().optional(),
  sensor: z.string().optional(),
  version: z.string().optional(),
  i2c_sda: z.number().optional(),
  i2c_scl: z.number().optional(),
  message: z.string().optional(),
});

export const SerialStatusMessageSchema = z.object({
  type: z.literal('status'),
  sensor: z.string().optional(),
  initialized: z.boolean(),
  i2c_addr: z.string().optional(),
  message: z.string().optional(),
});

export const SerialErrorMessageSchema = z.object({
  type: z.enum(['error', 'reading_error']),
  seq: z.number().optional(),
  elapsed_ms: z.number().optional(),
  message: z.string(),
  status: z.string().optional(),
});

export function parseSerialJsonLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return { success: false as const, error: 'Not a JSON object string' };
  }

  try {
    const raw = JSON.parse(trimmed);
    if (raw.type === 'reading') {
      const res = LiveSensorReadingSchema.safeParse(raw);
      if (res.success) {
        return { success: true as const, data: res.data };
      }
      return { success: false as const, error: res.error.issues.map((i) => i.message).join(', ') };
    }

    if (raw.type === 'boot') {
      const res = SerialBootMessageSchema.safeParse(raw);
      if (res.success) return { success: true as const, data: res.data };
      return { success: false as const, error: res.error.issues.map((i) => i.message).join(', ') };
    }

    if (raw.type === 'status') {
      const res = SerialStatusMessageSchema.safeParse(raw);
      if (res.success) return { success: true as const, data: res.data };
      return { success: false as const, error: res.error.issues.map((i) => i.message).join(', ') };
    }

    if (raw.type === 'error' || raw.type === 'reading_error') {
      const res = SerialErrorMessageSchema.safeParse(raw);
      if (res.success) return { success: true as const, data: res.data };
      return { success: false as const, error: res.error.issues.map((i) => i.message).join(', ') };
    }

    return { success: false as const, error: `Unknown message type: ${raw.type}` };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}
