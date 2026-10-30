export type SerialConnectionStatus =
  | 'Disconnected'
  | 'Connecting'
  | 'Connected'
  | 'Stale'
  | 'Reconnecting'
  | 'Error'
  | 'Unsupported';

export interface LiveSensorReading {
  seq: number;
  elapsed_ms: number;
  temperature_C: number;
  humidity_percent: number;
  pressure_hPa: number;
  gas_resistance_ohm: number;
  gas_resistance_kohm: number;
  status: 'OK' | 'HEATING' | 'STABLE' | 'ERROR';
  receivedAt: string; // ISO 8601 string
}

export interface SerialBootMessage {
  type: 'boot';
  board?: string;
  sensor?: string;
  version?: string;
  i2c_sda?: number;
  i2c_scl?: number;
  message?: string;
}

export interface SerialStatusMessage {
  type: 'status';
  sensor?: string;
  initialized: boolean;
  i2c_addr?: string;
  message?: string;
}

export interface SerialErrorMessage {
  type: 'error' | 'reading_error';
  seq?: number;
  elapsed_ms?: number;
  message: string;
  status?: string;
}

export type IncomingSerialMessage =
  | ({ type: 'reading' } & LiveSensorReading)
  | SerialBootMessage
  | SerialStatusMessage
  | SerialErrorMessage;

export interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}
