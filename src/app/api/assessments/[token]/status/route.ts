import { NextRequest, NextResponse } from 'next/server';
import { ServerAssessmentStore } from '@/lib/server/assessment-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = ServerAssessmentStore.getSession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Assessment token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: session.status,
      testId: session.testId,
      sampleId: session.sampleId,
      submittedAt: session.assessment?.submittedAt,
      assessment: session.assessment || null,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
