'use server';
/**
 * @fileOverview A flow for generating a detailed AI evaluation report for a candidate using Mistral AI.
 *
 * - generateEvaluationReport - A function that handles the generation of the candidate evaluation report.
 * - GenerateEvaluationReportInput - The input type for the generateEvaluationReport function.
 * - GenerateEvaluationReportOutput - The return type for the generateEvaluationReport function.
 */

import { mistral, TEXT_MODEL, parseJSON } from '@/ai/mistral';

export type GenerateEvaluationReportInput = {
  jobProfile: {
    title: string;
    company: string;
    description: string;
    seniority: string;
    mustHaveSkills: string[];
    interviewPipelineConfig: Array<{
      stageId: string;
      stageType: string;
      focusAreas: string[];
      aiAllowed: boolean;
    }>;
  };
  candidateData: {
    name: string;
    email: string;
    education: string;
    experienceSummary: string;
    resumeText: string;
  };
  resumeFitCheckResult: {
    fitScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    justification: string;
  };
  stageResults: Array<{
    stageId: string;
    stageType: string;
    question: string;
    candidateAnswer: string;
    aiAllowed: boolean;
    aiInteractionArtifacts?: Array<{
      prompt: string;
      aiResponse: string;
      toolUsageNotes?: string;
    }> | null;
  }>;
};

export type GenerateEvaluationReportOutput = {
  overallSummary: string;
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Consider' | 'No Hire';
  resumeAnalysis: {
    fitScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    justification: string;
  };
  stageEvaluations: Array<{
    stageId: string;
    stageType: string;
    performanceSummary: string;
    score: number;
    strengths: string[];
    areasForImprovement: string[];
    aiCollaborationAssessment?: string | null;
  }>;
  humanReadableReport: string;
};

export async function generateEvaluationReport(
  input: GenerateEvaluationReportInput
): Promise<GenerateEvaluationReportOutput> {
  const response = await mistral.chat.complete({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'user',
        content: `You are an expert HR manager and interviewer. Your task is to generate a comprehensive evaluation report for a candidate who has completed a multi-stage interview process.

Use the provided Job Profile, Candidate Data, Resume Fit Check Result, and Stage Results to create a detailed assessment.

Critically evaluate the candidate's performance in each stage, considering their answers, adherence to job requirements, and if applicable, their collaboration with AI tools. Provide specific examples where possible.

When assessing AI collaboration (if aiAllowed is true for a stage), consider the candidate's prompt quality, verification of AI output, refinement, and critical thinking when integrating AI-generated content.

Job Profile:
${JSON.stringify(input.jobProfile, null, 2)}

Candidate Data:
${JSON.stringify(input.candidateData, null, 2)}

Resume Fit Check Result:
${JSON.stringify(input.resumeFitCheckResult, null, 2)}

Interview Stage Results:
${JSON.stringify(input.stageResults, null, 2)}

Respond with a JSON object with these exact keys:
- overallSummary (string): comprehensive summary of the candidate's overall performance and fit
- hiringRecommendation (string): one of "Strong Hire", "Hire", "Consider", "No Hire"
- resumeAnalysis (object): { fitScore, matchedSkills, missingSkills, justification }
- stageEvaluations (array): each item has { stageId, stageType, performanceSummary, score (0-100), strengths (array), areasForImprovement (array), aiCollaborationAssessment (string or null) }
- humanReadableReport (string): a human-readable Markdown formatted version of the full evaluation report`,
      },
    ],
    responseFormat: { type: 'json_object' },
  });

  return parseJSON<GenerateEvaluationReportOutput>(response.choices?.[0]?.message?.content as string);
}
