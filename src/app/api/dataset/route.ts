import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'NoseNet-7Day-Complete-Experimental-Readings.csv');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Dataset file not found' }, { status: 404 });
    }

    const csvContent = fs.readFileSync(filePath, 'utf-8');

    return new NextResponse(csvContent, {
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
