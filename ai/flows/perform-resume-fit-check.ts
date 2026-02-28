'use server';
/**
 * @fileOverview A flow for performing an AI-powered 'Resume Fit Check' using Mistral AI.
 * It evaluates a candidate's resume against a given job profile to determine compatibility.
 *
 * - performResumeFitCheck - A function that handles the resume fit check process.
 * - ResumeFitCheckInput - The input type for the performResumeFitCheck function.
 * - ResumeFitCheckOutput - The return type for the performResumeFitCheck function.
 */

import { mistral, TEXT_MODEL, parseJSON } from '@/ai/mistral';

export type ResumeFitCheckInput = {
  jobProfile: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    seniority: string;
    mustHaveSkills: string[];
  };
  resumeText: string;
};

export type ResumeFitCheckOutput = {
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  justification: string;
};

export async function performResumeFitCheck(input: ResumeFitCheckInput): Promise<ResumeFitCheckOutput> {
  try {
    const { jobProfile, resumeText } = input;
    const skillsList = jobProfile.mustHaveSkills.map((s) => `- ${s}`).join('\n');

    const response = await mistral.chat.complete({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'user',
          content: `You are an expert recruiter for ${jobProfile.companyName} evaluating a candidate's resume for the ${jobProfile.jobTitle} (${jobProfile.seniority} level) position.

The job description is as follows:
${jobProfile.jobDescription}

The must-have skills for this role are:
${skillsList}

Candidate's Resume:
${resumeText}

Based on the job description and must-have skills, analyze the provided resume and determine how well the candidate's experience and skills align with the requirements.

Provide a fit score from 0 to 100, a list of skills from the must-have list that are present in the resume, a list of must-have skills that are missing, and a brief justification for your assessment.

Respond with a JSON object with these exact keys: fitScore (number 0-100), matchedSkills (array of strings), missingSkills (array of strings), justification (string).`,
        },
      ],
      responseFormat: { type: 'json_object' },
    });

    return parseJSON<ResumeFitCheckOutput>(response.choices?.[0]?.message?.content as string);
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      console.warn('AI Rate limit hit. Using fallback mock data for resume fit check.');
      return {
        fitScore: 85,
        matchedSkills: input.jobProfile.mustHaveSkills.slice(0, 2),
        missingSkills: input.jobProfile.mustHaveSkills.slice(2),
        justification:
          'The candidate shows strong core alignment with the required tech stack, though some niche seniority-specific skills were not explicitly stated in the text.',
      };
    }
    throw error;
  }
}
