import { NextResponse } from 'next/server';
import { LONGITUDINAL_CSV_STRING } from '@/lib/data/longitudinal-dataset';

export async function GET(request: Request) {
  try {
    return new NextResponse(LONGITUDINAL_CSV_STRING, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="NoseNet-7Day-Complete-Experimental-Readings.csv"',
      },
    });
  } catch (error) {
    console.error('Failed to serve dataset CSV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
