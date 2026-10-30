import { TestRun } from '@/types/test-run';
import { LiveSensorReading } from '@/types/serial';

const DB_NAME = 'NoseNet_DB';
const DB_VERSION = 1;
const STORE_TESTS = 'test_runs';
const STORE_READINGS = 'raw_readings';

// In-memory fallback for environments without IndexedDB (SSR, Node, Vitest)
class MemoryStoreFallback {
  private tests = new Map<string, TestRun>();
  private readings = new Map<string, LiveSensorReading[]>();

  async saveTest(test: TestRun): Promise<void> {
    this.tests.set(test.id, { ...test });
  }

  async getTest(id: string): Promise<TestRun | null> {
    return this.tests.get(id) ?? null;
  }

  async getAllTests(): Promise<TestRun[]> {
    return Array.from(this.tests.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async deleteTest(id: string): Promise<void> {
    this.tests.delete(id);
    this.readings.delete(id);
  }

  async appendReading(testId: string, reading: LiveSensorReading): Promise<void> {
    const list = this.readings.get(testId) || [];
    list.push({ ...reading });
    this.readings.set(testId, list);
  }

  async appendReadingsBatch(testId: string, readings: LiveSensorReading[]): Promise<void> {
    const list = this.readings.get(testId) || [];
    list.push(...readings.map((r) => ({ ...r })));
    this.readings.set(testId, list);
  }

  async getReadings(testId: string): Promise<LiveSensorReading[]> {
    return this.readings.get(testId) || [];
  }

  async clear(): Promise<void> {
    this.tests.clear();
    this.readings.clear();
  }
}

const memoryFallback = new MemoryStoreFallback();

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_TESTS)) {
        db.createObjectStore(STORE_TESTS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_READINGS)) {
        const readingsStore = db.createObjectStore(STORE_READINGS, {
          autoIncrement: true,
          keyPath: '_id',
        });
        readingsStore.createIndex('testId', 'testId', { unique: false });
        readingsStore.createIndex('testId_seq', ['testId', 'seq'], { unique: false });
      }
    };
  });
}

export class IndexedDBStorage {
  public async saveTestRun(test: TestRun): Promise<void> {
    if (!isIndexedDBAvailable()) {
      return memoryFallback.saveTest(test);
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TESTS, 'readwrite');
      const store = tx.objectStore(STORE_TESTS);
      const req = store.put(test);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getTestRun(id: string): Promise<TestRun | null> {
    if (!isIndexedDBAvailable()) {
      return memoryFallback.getTest(id);
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TESTS, 'readonly');
      const store = tx.objectStore(STORE_TESTS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllTestRuns(): Promise<TestRun[]> {
    if (!isIndexedDBAvailable()) {
      return memoryFallback.getAllTests();
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TESTS, 'readonly');
      const store = tx.objectStore(STORE_TESTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const tests = (req.result || []) as TestRun[];
        tests.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        resolve(tests);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteTestRun(id: string): Promise<void> {
    if (!isIndexedDBAvailable()) {
      return memoryFallback.deleteTest(id);
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_TESTS, STORE_READINGS], 'readwrite');
      tx.objectStore(STORE_TESTS).delete(id);

      const readingsStore = tx.objectStore(STORE_READINGS);
      const index = readingsStore.index('testId');
      const req = index.openCursor(IDBKeyRange.only(id));
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async appendRawReading(testId: string, reading: LiveSensorReading): Promise<void> {
    if (!isIndexedDBAvailable()) {
      return memoryFallback.appendReading(testId, reading);
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_READINGS, 'readwrite');
      const store = tx.objectStore(STORE_READINGS);
      const req = store.add({ testId, ...reading });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async appendRawReadingsBatch(testId: string, readings: LiveSensorReading[]): Promise<void> {
    if (readings.length === 0) return;
    if (!isIndexedDBAvailable()) {
      return memoryFallback.appendReadingsBatch(testId, readings);
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_READINGS, 'readwrite');
      const store = tx.objectStore(STORE_READINGS);
      for (const r of readings) {
        store.add({ testId, ...r });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getRawReadingsForTest(testId: string): Promise<LiveSensorReading[]> {
    if (!isIndexedDBAvailable()) {
      return memoryFallback.getReadings(testId);
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_READINGS, 'readonly');
      const store = tx.objectStore(STORE_READINGS);
      const index = store.index('testId');
      const req = index.getAll(IDBKeyRange.only(testId));
      req.onsuccess = () => {
        const list = (req.result || []) as (LiveSensorReading & { _id?: number; testId?: string })[];
        list.sort((a, b) => a.seq - b.seq);
        resolve(
          list.map((item) => ({
            seq: item.seq,
            elapsed_ms: item.elapsed_ms,
            temperature_C: item.temperature_C,
            humidity_percent: item.humidity_percent,
            pressure_hPa: item.pressure_hPa,
            gas_resistance_ohm: item.gas_resistance_ohm,
            gas_resistance_kohm: item.gas_resistance_kohm,
            status: item.status,
            receivedAt: item.receivedAt,
          }))
        );
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async clearAll(): Promise<void> {
    if (!isIndexedDBAvailable()) {
      return memoryFallback.clear();
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_TESTS, STORE_READINGS], 'readwrite');
      tx.objectStore(STORE_TESTS).clear();
      tx.objectStore(STORE_READINGS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Aliases for developer convenience
  public getReadingsForTest = this.getRawReadingsForTest.bind(this);
  public appendReadingsBatch = this.appendRawReadingsBatch.bind(this);
  public clearDatabase = this.clearAll.bind(this);
}

export const idbStorage = new IndexedDBStorage();
