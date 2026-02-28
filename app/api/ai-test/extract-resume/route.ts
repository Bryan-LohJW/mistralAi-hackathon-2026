import { NextRequest, NextResponse } from 'next/server';
import { extractResumeData } from '@/ai/flows/extract-resume-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await extractResumeData(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
