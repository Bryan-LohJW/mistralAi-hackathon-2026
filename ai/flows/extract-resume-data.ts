'use server';
/**
 * @fileOverview A flow for extracting structured candidate information from resume text using Mistral AI.
 *
 * - extractResumeData - A function that handles the parsing of resume text into structured fields.
 * - ExtractResumeDataInput - The input type for the extractResumeData function.
 * - ExtractResumeDataOutput - The return type for the extractResumeData function.
 */

import { mistral, SMALL_MODEL, parseJSON } from '@/ai/mistral';

export type ExtractResumeDataInput = {
  resumeText: string;
};

export type ExtractResumeDataOutput = {
  name: string;
  email: string;
  education: string;
  experienceSummary: string;
  skills: string[];
};

export async function extractResumeData(input: ExtractResumeDataInput): Promise<ExtractResumeDataOutput> {
  try {
    const response = await mistral.chat.complete({
      model: SMALL_MODEL,
      messages: [
        {
          role: 'user',
          content: `You are an expert recruitment assistant. Your task is to extract structured information from a candidate's resume text.

Resume Text:
${input.resumeText}

Extract the candidate's full name, email, education history, and a summary of their experience. Also, identify a list of their key skills.
If any field cannot be found, return an empty string or empty array as appropriate.

Respond with a JSON object with these exact keys: name, email, education, experienceSummary, skills (array of strings).`,
        },
      ],
      responseFormat: { type: 'json_object' },
    });

    return parseJSON<ExtractResumeDataOutput>(response.choices?.[0]?.message?.content as string);
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      console.warn('AI Rate limit hit. Using fallback mock data for prototype.');
      return {
        name: 'Alex Rivers',
        email: 'alex.rivers@example.com',
        education: 'B.S. in Computer Science, State University',
        experienceSummary: 'Senior Developer with 8 years of experience in full-stack engineering.',
        skills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
      };
    }
    throw error;
  }
}
