import { NextRequest, NextResponse } from 'next/server';
import { ServerAssessmentStore } from '@/lib/server/assessment-store';
import { AssessmentSubmissionSchema } from '@/lib/validation/assessment.schema';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = ServerAssessmentStore.getSession(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Assessment token not found or invalid' },
        { status: 404 }
      );
    }

    if (session.status === 'Expired') {
      return NextResponse.json(
        {
          error: 'This assessment link has expired.',
          status: 'Expired',
          testId: session.testId,
        },
        { status: 410 }
      );
    }

    // Return only minimum scoped metadata required for independent human evaluation
    return NextResponse.json({
      success: true,
      token: session.token,
      testId: session.testId,
      sampleId: session.sampleId,
      cakeCategory: session.cakeCategory,
      storageCondition: session.storageCondition,
      status: session.status,
      expiresAt: session.expiresAt,
      isAlreadySubmitted: session.status === 'Submitted',
    });
  } catch (err: unknown) {
    console.error('Error fetching assessment token:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    const parsed = AssessmentSubmissionSchema.safeParse({ ...body, token });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const result = ServerAssessmentStore.submitAssessment(token, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Independent human assessment recorded successfully',
      assessment: result.assessment,
    });
  } catch (err: unknown) {
    console.error('Error submitting assessment:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
