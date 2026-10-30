import {
  SerialConnectionStatus,
  LiveSensorReading,
  IncomingSerialMessage,
} from '@/types/serial';
import { parseSerialJsonLine } from '@/lib/validation/serial.schema';

export type { SerialConnectionStatus };
export type SerialStatusListener = (status: SerialConnectionStatus, message?: string) => void;
export type SerialReadingListener = (reading: LiveSensorReading) => void;
export type SerialMessageListener = (msg: IncomingSerialMessage) => void;
export type SerialRawLineListener = (line: string) => void;
export type SerialErrorListener = (error: string) => void;

export class WebSerialManager {
  private static instance: WebSerialManager | null = null;

  private port: any = null;
  private reader: any = null;
  private readableStreamClosed: Promise<void> | null = null;
  private isReading = false;
  private keepReading = false;

  private status: SerialConnectionStatus = 'Disconnected';
  private statusMessage = '';
  private lastReading: LiveSensorReading | null = null;
  private lastReceivedTimestamp = 0;
  private incomingReadingCount = 0;
  private malformedLineCount = 0;

  // Stale detection
  private staleCheckTimer: any = null;
  private staleThresholdMs = 5000;

  // Listeners
  private statusListeners = new Set<SerialStatusListener>();
  private readingListeners = new Set<SerialReadingListener>();
  private messageListeners = new Set<SerialMessageListener>();
  private rawLineListeners = new Set<SerialRawLineListener>();
  private errorListeners = new Set<SerialErrorListener>();

  private constructor() {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      if ('serial' in navigator) {
        (navigator as any).serial.addEventListener('disconnect', (event: any) => {
          if (this.port && event.target === this.port) {
            this.handleUnexpectedDisconnect('ESP32 device was unplugged from USB port.');
          }
        });
      }
    }
  }

  public static getInstance(): WebSerialManager {
    if (!WebSerialManager.instance) {
      WebSerialManager.instance = new WebSerialManager();
    }
    return WebSerialManager.instance;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public getStatus(): SerialConnectionStatus {
    return this.status;
  }

  public getStatusMessage(): string {
    return this.statusMessage;
  }

  public getLastReading(): LiveSensorReading | null {
    return this.lastReading;
  }

  public getLastReceivedTimestamp(): number {
    return this.lastReceivedTimestamp;
  }

  public getReadingCount(): number {
    return this.incomingReadingCount;
  }

  public getMalformedLineCount(): number {
    return this.malformedLineCount;
  }

  public isStale(): boolean {
    return this.status === 'Stale';
  }

  public async requestPortAndConnect(baudRate = 115200): Promise<boolean> {
    return this.requestAndConnect(baudRate);
  }

  public setStaleThresholdMs(threshold: number) {
    this.staleThresholdMs = Math.max(2000, threshold);
  }

  public subscribeStatus(listener: SerialStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status, this.statusMessage);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeReading(listener: SerialReadingListener): () => void {
    this.readingListeners.add(listener);
    return () => this.readingListeners.delete(listener);
  }

  public subscribeMessage(listener: SerialMessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public subscribeRawLine(listener: SerialRawLineListener): () => void {
    this.rawLineListeners.add(listener);
    return () => this.rawLineListeners.delete(listener);
  }

  public subscribeError(listener: SerialErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private setStatus(newStatus: SerialConnectionStatus, message = '') {
    this.status = newStatus;
    this.statusMessage = message;
    this.statusListeners.forEach((l) => l(newStatus, message));
  }

  private notifyError(err: string) {
    this.errorListeners.forEach((l) => l(err));
  }

  /**
   * Request user permission and connect to ESP32
   */
  public async requestAndConnect(baudRate = 115200): Promise<boolean> {
    if (!this.isSupported()) {
      this.setStatus(
        'Unsupported',
        'Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera on desktop with HTTPS or localhost.'
      );
      return false;
    }

    try {
      this.setStatus('Connecting', 'Prompting for USB serial port...');
      const port = await (navigator as any).serial.requestPort();
      return await this.openPort(port, baudRate);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        this.setStatus('Disconnected', 'No serial port was selected.');
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to request serial port';
        this.setStatus('Error', msg);
        this.notifyError(msg);
      }
      return false;
    }
  }

  /**
   * Connect to an existing permitted port if available
   */
  public async connectExisting(baudRate = 115200): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const ports = await (navigator as any).serial.getPorts();
      if (ports && ports.length > 0) {
        return await this.openPort(ports[0], baudRate);
      }
      return false;
    } catch {
      return false;
    }
  }

  private async openPort(port: any, baudRate: number): Promise<boolean> {
    try {
      this.port = port;
      this.setStatus('Connecting', `Opening serial port at ${baudRate} baud...`);

      await this.port.open({ baudRate });
      this.keepReading = true;
      this.isReading = true;

      // Start reader pipeline
      this.startReadingLoop();

      // Start stale check timer
      this.startStaleWatchdog();

      this.setStatus('Connected', 'Port open. Awaiting sensor telemetry packets...');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to open serial port';
      this.setStatus('Error', msg);
      this.notifyError(msg);
      this.port = null;
      return false;
    }
  }

  /**
   * Read newline-delimited serial stream
   */
  private async startReadingLoop() {
    let lineBuffer = '';
    const textDecoder = new TextDecoderStream();

    this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();

    try {
      while (this.keepReading) {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }
        if (value) {
          lineBuffer += value;
          const lines = lineBuffer.split('\n');
          // Keep incomplete line chunk in buffer
          lineBuffer = lines.pop() ?? '';

          for (const rawLine of lines) {
            const cleanLine = rawLine.trim();
            if (cleanLine) {
              this.rawLineListeners.forEach((l) => l(cleanLine));
              this.processIncomingLine(cleanLine);
            }
          }
        }
      }
    } catch (err: unknown) {
      if (this.keepReading) {
        const msg = err instanceof Error ? err.message : 'Serial read stream error';
        this.handleUnexpectedDisconnect(`Serial stream interrupted: ${msg}`);
      }
    } finally {
      this.isReading = false;
    }
  }

  private processIncomingLine(line: string) {
    const parseResult = parseSerialJsonLine(line);
    if (!parseResult.success) {
      this.malformedLineCount++;
      // If it's pure text like ESP32 debug log, don't crash
      return;
    }

    const data = parseResult.data;
    this.lastReceivedTimestamp = Date.now();

    // If we were previously Stale or Reconnecting, clear back to Connected
    if (this.status === 'Stale' || this.status === 'Connecting' || this.status === 'Reconnecting') {
      this.setStatus('Connected', 'Actively receiving live BME688 telemetry.');
    }

    if (data.type === 'reading') {
      const readingWithTime: LiveSensorReading = {
        ...data,
        receivedAt: new Date().toISOString(),
      };
      this.lastReading = readingWithTime;
      this.incomingReadingCount++;
      this.readingListeners.forEach((l) => l(readingWithTime));
      this.messageListeners.forEach((l) => l({ type: 'reading', ...readingWithTime }));
    } else {
      this.messageListeners.forEach((l) => l(data));
      if (data.type === 'status' && !data.initialized) {
        this.notifyError(`BME688 hardware status error: ${data.message || 'Sensor not initialized'}`);
      }
    }
  }

  private startStaleWatchdog() {
    this.stopStaleWatchdog();
    this.staleCheckTimer = setInterval(() => {
      if (this.status === 'Connected') {
        const elapsedSinceLast = Date.now() - this.lastReceivedTimestamp;
        if (this.lastReceivedTimestamp > 0 && elapsedSinceLast > this.staleThresholdMs) {
          this.setStatus(
            'Stale',
            `Warning: No valid sensor readings received for ${Math.round(elapsedSinceLast / 1000)}s. Check USB cable and sensor wiring.`
          );
        }
      }
    }, 1000);
  }

  private stopStaleWatchdog() {
    if (this.staleCheckTimer) {
      clearInterval(this.staleCheckTimer);
      this.staleCheckTimer = null;
    }
  }

  private async handleUnexpectedDisconnect(reason: string) {
    this.stopStaleWatchdog();
    this.keepReading = false;
    this.setStatus('Disconnected', reason);
    this.notifyError(reason);
    await this.cleanupStream();
  }

  /**
   * Disconnect cleanly from USB Serial port
   */
  public async disconnect(): Promise<void> {
    this.stopStaleWatchdog();
    this.keepReading = false;

    await this.cleanupStream();

    this.port = null;
    this.lastReading = null;
    this.lastReceivedTimestamp = 0;
    this.setStatus('Disconnected', 'ESP32 disconnected.');
  }

  private async cleanupStream() {
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      }
    } catch {
      // Reader might already be closed
    }

    try {
      if (this.readableStreamClosed) {
        await this.readableStreamClosed.catch(() => {});
        this.readableStreamClosed = null;
      }
    } catch {
      // Stream cleanup
    }

    try {
      if (this.port) {
        await this.port.close();
      }
    } catch {
      // Port might already be closed
    }
  }
}

export const webSerial = WebSerialManager.getInstance();
