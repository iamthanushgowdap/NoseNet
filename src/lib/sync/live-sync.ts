// Real-time zero-lag cloud pub-sub channel (Powered by ntfy.sh SSE stream + BroadcastChannel)
export const NTFY_TOPIC = 'https://ntfy.sh/nosenet_telemetry_live_v3';

export interface LiveSyncEvent {
  type: 'CAKE_SELECTED' | 'TEST_STARTING' | 'TEST_RUNNING' | 'VERDICT_SUBMITTED' | 'TEST_STOPPED' | 'TEST_RESET';
  cakeType?: string | null;
  testId?: string | null;
  verdict?: 'Fresh' | 'Fairly Fresh' | 'Stale' | 'Spoiled' | 'Not Fresh' | null;
  score?: number | null;
  timestamp?: string;
  assessorName?: string | null;
}

// 1. Broadcast an event to all connected devices (Main station, phone assessor, tabs)
export async function broadcastLiveSync(event: LiveSyncEvent): Promise<boolean> {
  const payload = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // Channel A: BroadcastChannel (Instant 0ms multi-tab sync)
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('nosenet_live_channel');
      bc.postMessage(payload);
      bc.close();
    } catch {}
  }

  // Channel B: ntfy.sh real-time push (Sub-50ms propagation across mobile and desktop worldwide)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(NTFY_TOPIC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

// 2. Poll the latest event history from the cloud (used on page load or when user taps "Refresh")
export async function fetchLatestLiveEvents(): Promise<LiveSyncEvent[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${NTFY_TOPIC}/json?poll=1&since=all`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);
    const events: LiveSyncEvent[] = [];
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message) {
          const inner = typeof parsed.message === 'string' ? JSON.parse(parsed.message) : parsed.message;
          events.push(inner);
        }
      } catch {}
    }
    return events;
  } catch {
    return [];
  }
}
