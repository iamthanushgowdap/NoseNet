import { NextResponse } from 'next/server';
import { liveTestStore, FreshnessVerdict } from '@/lib/server/live-test-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { verdict, assessorName, score } = body;

    const validVerdicts = ['Fresh', 'Fairly Fresh', 'Stale', 'Spoiled', 'Not Fresh'];

    if (!verdict || !validVerdicts.includes(verdict)) {
      return NextResponse.json(
        { error: 'Invalid verdict. Must be "Fresh", "Fairly Fresh", "Stale", or "Spoiled"' },
        { status: 400 }
      );
    }

    const updated = liveTestStore.submitVerdict(
      verdict as FreshnessVerdict,
      assessorName || 'Phone Assessor',
      typeof score === 'number' ? score : undefined
    );
    return NextResponse.json({ success: true, state: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
