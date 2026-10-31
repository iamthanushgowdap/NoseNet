import { NextResponse } from 'next/server';
import { liveTestStore, CakeType } from '@/lib/server/live-test-store';

export async function GET(request: Request) {
  const state = await liveTestStore.getSyncedState();
  return NextResponse.json(state, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'start') {
      const cakeType = body.cakeType as CakeType;
      if (!cakeType) {
        return NextResponse.json({ error: 'cakeType is required' }, { status: 400 });
      }
      const updated = await liveTestStore.startTestAsync(cakeType, body.testId);
      return NextResponse.json(updated);
    }

    if (action === 'stop') {
      const updated = await liveTestStore.stopTestAsync();
      return NextResponse.json(updated);
    }

    if (action === 'reset') {
      const updated = await liveTestStore.resetTestAsync();
      return NextResponse.json(updated);
    }

    if (action === 'sensor_data') {
      const updated = liveTestStore.updateSensorData(body.reading || {});
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
