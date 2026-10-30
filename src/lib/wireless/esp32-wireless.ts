// Wireless ESP32 Connection Service: Web Bluetooth (BLE) & Wi-Fi IP Bridge
import { LiveSensorSnapshot } from '@/lib/server/live-test-store';

export type WirelessConnectionType = 'bluetooth' | 'wifi' | 'none';
export type WirelessConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WirelessStatusListener {
  (status: WirelessConnectionStatus, message?: string, type?: WirelessConnectionType): void;
}

export interface WirelessSensorDataListener {
  (reading: LiveSensorSnapshot): void;
}

// Standard BLE UART Service UUIDs (Nordic UART Service or Custom ESP32 Service)
const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const UART_TX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notifications from ESP32
const UART_RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Writes to ESP32

export class ESP32WirelessManager {
  private static instance: ESP32WirelessManager | null = null;

  private connectionType: WirelessConnectionType = 'none';
  private connectionStatus: WirelessConnectionStatus = 'disconnected';
  private statusMessage = 'Wireless offline';

  // Bluetooth variables
  private bleDevice: any = null;
  private bleServer: any = null;
  private rxCharacteristic: any = null;
  private txCharacteristic: any = null;

  // Wi-Fi variables
  private esp32WifiIp: string = '';

  // Incoming chunk stream buffer
  private incomingBuffer = '';

  // Active testing lock - strictly gates sensor ingestion
  private isTestActive = false;

  // Listeners
  private statusListeners = new Set<WirelessStatusListener>();
  private sensorDataListeners = new Set<WirelessSensorDataListener>();

  public static getInstance(): ESP32WirelessManager {
    if (!ESP32WirelessManager.instance) {
      ESP32WirelessManager.instance = new ESP32WirelessManager();
    }
    return ESP32WirelessManager.instance;
  }

  public getStatus(): WirelessConnectionStatus {
    return this.connectionStatus;
  }

  public getConnectionType(): WirelessConnectionType {
    return this.connectionType;
  }

  public getStatusMessage(): string {
    return this.statusMessage;
  }

  public isTestingActive(): boolean {
    return this.isTestActive;
  }

  public subscribeStatus(listener: WirelessStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.connectionStatus, this.statusMessage, this.connectionType);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeSensorData(listener: WirelessSensorDataListener): () => void {
    this.sensorDataListeners.add(listener);
    return () => this.sensorDataListeners.delete(listener);
  }

  private setStatus(status: WirelessConnectionStatus, message: string, type: WirelessConnectionType) {
    this.connectionStatus = status;
    this.statusMessage = message;
    this.connectionType = type;
    this.statusListeners.forEach((l) => l(status, message, type));
  }

  // --- 1. WEB BLUETOOTH (BLE) CONNECTION ---
  public isBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public async connectBluetooth(): Promise<boolean> {
    if (!this.isBluetoothSupported()) {
      this.setStatus('error', 'Web Bluetooth is not supported in this browser. Please use Chrome or Edge.', 'bluetooth');
      return false;
    }

    try {
      this.setStatus('connecting', 'Requesting ESP32 Bluetooth device...', 'bluetooth');

      const navBluetooth = (navigator as any).bluetooth;
      this.bleDevice = await navBluetooth.requestDevice({
        filters: [
          { namePrefix: 'NoseNet' },
          { namePrefix: 'ESP32' },
        ],
        optionalServices: [UART_SERVICE_UUID, 'generic_access'],
      });

      this.setStatus('connecting', `Connecting to ${this.bleDevice.name || 'ESP32'}...`, 'bluetooth');

      this.bleDevice.addEventListener('gattserverdisconnected', () => {
        this.setStatus('disconnected', 'ESP32 Bluetooth disconnected', 'none');
      });

      this.bleServer = await this.bleDevice.gatt.connect();
      const service = await this.bleServer.getPrimaryService(UART_SERVICE_UUID);

      this.txCharacteristic = await service.getCharacteristic(UART_TX_CHAR_UUID);
      this.rxCharacteristic = await service.getCharacteristic(UART_RX_CHAR_UUID);

      // Listen for notifications from ESP32
      await this.txCharacteristic.startNotifications();
      this.txCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(value);
        this.handleIncomingRaw(text);
      });

      this.setStatus('connected', `Connected wirelessly via Bluetooth to ${this.bleDevice.name || 'ESP32'}`, 'bluetooth');
      return true;
    } catch (err: any) {
      console.warn('Bluetooth connection error:', err);
      this.setStatus('error', err.message || 'Bluetooth connection failed or canceled', 'none');
      return false;
    }
  }

  // --- 2. WI-FI IP CONNECTION ---
  public setWifiIp(ip: string) {
    this.esp32WifiIp = ip.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  public async connectWifi(ip?: string): Promise<boolean> {
    if (ip) this.setWifiIp(ip);
    if (!this.esp32WifiIp) {
      this.setStatus('error', 'Please enter a valid ESP32 Wi-Fi IP address (e.g. 192.168.4.1)', 'wifi');
      return false;
    }

    this.setStatus('connecting', `Connecting to ESP32 at http://${this.esp32WifiIp}...`, 'wifi');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`http://${this.esp32WifiIp}/status`, {
        signal: controller.signal,
        mode: 'cors',
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.setStatus('connected', `Connected wirelessly via Wi-Fi (IP: ${this.esp32WifiIp})`, 'wifi');
        return true;
      } else {
        throw new Error(`ESP32 responded with status ${res.status}`);
      }
    } catch (err: any) {
      this.setStatus(
        'error',
        `Could not reach ESP32 at ${this.esp32WifiIp}. Make sure you are on the same Wi-Fi network.`,
        'wifi'
      );
      return false;
    }
  }

  // Disconnect
  public async disconnect(): Promise<void> {
    this.isTestActive = false;
    if (this.bleDevice && this.bleDevice.gatt && this.bleDevice.gatt.connected) {
      this.bleDevice.gatt.disconnect();
    }
    this.bleDevice = null;
    this.bleServer = null;
    this.setStatus('disconnected', 'Wireless disconnected', 'none');
  }

  // --- 3. TRIGGER MICROCONTROLLER TO RUN SENSOR TEST ---
  public async sendTriggerRunTest(cakeType: string, testId?: string): Promise<boolean> {
    this.isTestActive = true;
    const command = `RUN_TEST:${cakeType}\n`;

    // 1. If connected via Bluetooth
    if (this.connectionType === 'bluetooth' && this.rxCharacteristic) {
      try {
        const encoder = new TextEncoder();
        await this.rxCharacteristic.writeValue(encoder.encode(command));
      } catch (err) {
        console.error('Failed to send BLE command:', err);
      }
    }

    // 2. If connected via Wi-Fi
    if (this.connectionType === 'wifi' && this.esp32WifiIp) {
      try {
        await fetch(`http://${this.esp32WifiIp}/api/run-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'run_test', cakeType }),
          mode: 'cors',
        });
      } catch (err) {
        console.error('Failed to send Wi-Fi command:', err);
      }
    }

    // 3. Local cross-tab broadcast via BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('nosenet_live_channel');
        bc.postMessage({ type: 'TEST_STARTED', cakeType, testId });
        bc.close();
      } catch {}
    }

    // 4. Update server state
    try {
      await fetch('/api/live-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', cakeType, testId }),
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async sendStopTest(): Promise<boolean> {
    this.isTestActive = false;
    const command = `STOP_TEST\n`;

    // 1. Send stop over Bluetooth
    if (this.connectionType === 'bluetooth' && this.rxCharacteristic) {
      try {
        const encoder = new TextEncoder();
        await this.rxCharacteristic.writeValue(encoder.encode(command));
      } catch (err) {
        console.error('Failed to send BLE stop command:', err);
      }
    }

    // 2. Send stop over Wi-Fi
    if (this.connectionType === 'wifi' && this.esp32WifiIp) {
      try {
        await fetch(`http://${this.esp32WifiIp}/api/stop-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop_test' }),
          mode: 'cors',
        });
      } catch (err) {
        console.error('Failed to send Wi-Fi stop command:', err);
      }
    }

    // 3. Broadcast stop locally
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('nosenet_live_channel');
        bc.postMessage({ type: 'TEST_STOPPED' });
        bc.close();
      } catch {}
    }

    // 4. Notify server to stop active test
    try {
      await fetch('/api/live-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private handleIncomingRaw(rawText: string) {
    this.incomingBuffer += rawText;
    const lines = this.incomingBuffer.split('\n');
    this.incomingBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      this.parseAndEmitReading(trimmed);
    }

    // If buffer ends with complete JSON object bracket
    if (this.incomingBuffer.startsWith('{') && this.incomingBuffer.endsWith('}')) {
      this.parseAndEmitReading(this.incomingBuffer);
      this.incomingBuffer = '';
    }
  }

  private parseAndEmitReading(text: string) {
    try {
      const parsed = JSON.parse(text);

      // Resolve Gas Resistance accurately
      let gasKohm: number | null = null;
      let gasOhm: number | null = null;

      if (parsed.gas_kohm !== undefined && parsed.gas_kohm !== null) {
        gasKohm = Number(parsed.gas_kohm);
      } else if (parsed.gas_resistance_kohm !== undefined && parsed.gas_resistance_kohm !== null) {
        gasKohm = Number(parsed.gas_resistance_kohm);
      } else if (parsed.gasKohm !== undefined && parsed.gasKohm !== null) {
        gasKohm = Number(parsed.gasKohm);
      } else if (parsed.gas_ohm !== undefined && parsed.gas_ohm !== null) {
        gasKohm = Number((Number(parsed.gas_ohm) / 1000).toFixed(2));
      }

      if (parsed.gas_ohm !== undefined && parsed.gas_ohm !== null) {
        gasOhm = Number(parsed.gas_ohm);
      } else if (parsed.gas_resistance_ohm !== undefined && parsed.gas_resistance_ohm !== null) {
        gasOhm = Number(parsed.gas_resistance_ohm);
      } else if (gasKohm !== null) {
        gasOhm = Math.round(gasKohm * 1000);
      }

      const temp = parsed.temperature_C ?? parsed.temperature ?? parsed.temp ?? null;
      const hum = parsed.humidity_percent ?? parsed.humidity ?? parsed.hum ?? null;
      const pres = parsed.pressure_hPa ?? parsed.pressure ?? parsed.pres ?? null;

      const reading: LiveSensorSnapshot = {
        gasResistanceKohm: gasKohm !== null ? Number(gasKohm.toFixed(2)) : null,
        gasResistanceOhm: gasOhm,
        temperatureC: temp !== null ? Number(Number(temp).toFixed(1)) : null,
        humidityPercent: hum !== null ? Number(Number(hum).toFixed(0)) : null,
        pressureHpa: pres !== null ? Number(Number(pres).toFixed(0)) : null,
        sensorStatus: parsed.status || 'OK',
        timestamp: new Date().toISOString(),
      };

      // 1. Instantly notify local UI subscribers (Zero latency!)
      this.sensorDataListeners.forEach((l) => l(reading));

      // 2. Broadcast locally across tabs/windows
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('nosenet_live_channel');
          bc.postMessage({ type: 'SENSOR_READING', reading });
          bc.close();
        } catch {}
      }
    } catch {
      // Chunk not yet complete JSON or header banner
    }
  }
}

export const esp32Wireless = ESP32WirelessManager.getInstance();
