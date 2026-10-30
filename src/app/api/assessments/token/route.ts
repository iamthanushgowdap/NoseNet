import { NextRequest, NextResponse } from 'next/server';
import { ServerAssessmentStore } from '@/lib/server/assessment-store';
import { z } from 'zod';

const CreateTokenSchema = z.object({
  testId: z.string().min(1, 'Test ID is required'),
  sampleId: z.string().min(1, 'Sample ID is required'),
  cakeCategory: z.enum(['Normal cake', 'Pastry cake']),
  storageCondition: z.enum(['Frozen', 'Unfrozen']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateTokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const session = ServerAssessmentStore.createSession(parsed.data);

    // Build assessment link based on request host header
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const assessmentUrl = `${protocol}://${host}/assess/${session.token}`;

    return NextResponse.json({
      success: true,
      token: session.token,
      assessmentUrl,
      expiresAt: session.expiresAt,
      session,
    });
  } catch (err: unknown) {
    console.error('Failed to create assessment token:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
