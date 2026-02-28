import { NextRequest, NextResponse } from 'next/server';
import { scoreCandidateAnswer } from '@/ai/flows/score-candidate-answer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await scoreCandidateAnswer(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
