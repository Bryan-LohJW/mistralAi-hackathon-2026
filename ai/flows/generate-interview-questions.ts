'use server';
/**
 * @fileOverview A flow for generating interview questions using Mistral AI.
 *
 * - generateInterviewQuestions - A function that handles the generation of interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import { mistral, TEXT_MODEL, parseJSON } from '@/ai/mistral';

export type GenerateInterviewQuestionsInput = {
  jobDescription: string;
  stageFocusAreas: string[];
  numQuestions?: number;
};

export type GenerateInterviewQuestionsOutput = {
  questions: Array<{
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
};

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  const numQuestions = input.numQuestions ?? 5;
  const focusAreasList = input.stageFocusAreas.map((a) => `- ${a}`).join('\n');

  const response = await mistral.chat.complete({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'user',
        content: `You are an expert interviewer. Your task is to generate interview questions for a job based on the provided job description and specified focus areas.

Job Description:
${input.jobDescription}

Interview Stage Focus Areas:
${focusAreasList}

Generate ${numQuestions} interview questions. Each question should be relevant to the job description and focus areas, and you should assign a difficulty level (easy, medium, or hard) to each.

Respond with a JSON object with a single key "questions" which is an array of objects. Each object should have two keys: "question" (string) and "difficulty" (string, one of "easy", "medium", "hard").`,
      },
    ],
    responseFormat: { type: 'json_object' },
  });

  const output = parseJSON<GenerateInterviewQuestionsOutput>(
    response.choices?.[0]?.message?.content as string
  );
  if (!output) {
    throw new Error('Failed to generate interview questions.');
  }
  return output;
}
