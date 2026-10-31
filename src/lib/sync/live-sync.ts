// Real-time synchronization layer for NoseNet (BroadcastChannel for 0ms local tabs + Supabase DB)

export interface LiveSyncEvent {
  type: 'CAKE_SELECTED' | 'TEST_STARTING' | 'TEST_RUNNING' | 'VERDICT_SUBMITTED' | 'TEST_STOPPED' | 'TEST_RESET';
  cakeType?: string | null;
  testId?: string | null;
  verdict?: 'Fresh' | 'Fairly Fresh' | 'Stale' | 'Spoiled' | 'Not Fresh' | null;
  score?: number | null;
  timestamp?: string;
  assessorName?: string | null;
}

// 1. Broadcast an event to all connected tabs/windows via BroadcastChannel
export function broadcastLiveSync(event: LiveSyncEvent): void {
  const payload = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // Channel: BroadcastChannel (Instant 0ms multi-tab sync)
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('nosenet_live_channel');
      bc.postMessage(payload);
      bc.close();
    } catch {}
  }
}
