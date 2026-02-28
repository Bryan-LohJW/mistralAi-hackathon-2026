import { NextRequest, NextResponse } from 'next/server';
import { generateEvaluationReport } from '@/ai/flows/generate-evaluation-report-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateEvaluationReport(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
