import { NextRequest, NextResponse } from 'next/server';
import { performResumeFitCheck } from '@/ai/flows/perform-resume-fit-check';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await performResumeFitCheck(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
