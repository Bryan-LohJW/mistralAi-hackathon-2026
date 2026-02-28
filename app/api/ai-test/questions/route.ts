import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateInterviewQuestions(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
