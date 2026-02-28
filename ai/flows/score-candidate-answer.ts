'use server';
/**
 * @fileOverview A flow for automatically scoring candidate answers using Mistral AI.
 *
 * - scoreCandidateAnswer - A function that handles the candidate answer scoring process.
 * - ScoreCandidateAnswerInput - The input type for the scoreCandidateAnswer function.
 * - ScoreCandidateAnswerOutput - The return type for the scoreCandidateAnswer function.
 */

import { mistral, TEXT_MODEL, CODE_MODEL, parseJSON } from '@/ai/mistral';

export type ScoreCandidateAnswerInput = {
  jobProfile: {
    jobTitle: string;
    jobDescription: string;
    mustHaveSkills: string[];
  };
  stageConfig: {
    stageType: 'behavioral' | 'technical coding' | 'case simulation' | 'leadership' | 'culture fit' | 'custom';
    focusAreas: string[];
    aiAllowed: boolean;
    scoringRubric: {
      weights: Record<string, number>;
      criteria: string[];
      passThreshold: number;
    };
  };
  question: string;
  answer: string;
  aiCollaborationArtifacts?: {
    candidatePrompts?: string[];
    toolUsageNotes?: string[];
  };
};

export type ScoreCandidateAnswerOutput = {
  score: number;
  feedback: string;
  aiCollaborationAssessment?: string;
};

export async function scoreCandidateAnswer(input: ScoreCandidateAnswerInput): Promise<ScoreCandidateAnswerOutput> {
  const { jobProfile, stageConfig, question, answer, aiCollaborationArtifacts } = input;

  // Use Codestral for technical coding stages, Mistral Large for everything else
  const model = stageConfig.stageType === 'technical coding' ? CODE_MODEL : TEXT_MODEL;

  const criteriaList = stageConfig.scoringRubric.criteria.map((c) => `- ${c}`).join('\n');
  const focusAreasList = stageConfig.focusAreas.map((a) => `- ${a}`).join('\n');
  const skillsList = jobProfile.mustHaveSkills.map((s) => `- ${s}`).join('\n');

  let aiSection = '';
  if (aiCollaborationArtifacts) {
    const prompts = (aiCollaborationArtifacts.candidatePrompts ?? []).map((p) => `- ${p}`).join('\n');
    const notes = (aiCollaborationArtifacts.toolUsageNotes ?? []).map((n) => `- ${n}`).join('\n');
    aiSection = `
--- AI Collaboration Details ---
Candidate Prompts:
${prompts}
Tool Usage Notes:
${notes}`;
  }

  const response = await mistral.chat.complete({
    model,
    messages: [
      {
        role: 'user',
        content: `You are an expert HR/recruiting manager and interview assessor.
Your task is to objectively evaluate a candidate's answer based on the provided job profile, interview stage configuration, and the specific question asked.
Provide a numerical score (0-100) and detailed textual feedback.

--- Job Details ---
Job Title: ${jobProfile.jobTitle}
Job Description: ${jobProfile.jobDescription}
Must-Have Skills:
${skillsList}

--- Interview Stage Details ---
Stage Type: ${stageConfig.stageType}
Focus Areas:
${focusAreasList}
AI Allowed in Stage: ${stageConfig.aiAllowed}
Scoring Rubric Criteria:
${criteriaList}
Scoring Rubric Weights: ${JSON.stringify(stageConfig.scoringRubric.weights)}
Pass Threshold: ${stageConfig.scoringRubric.passThreshold}

--- Question and Answer ---
Question: ${question}
Candidate Answer: ${answer}
${aiSection}

--- Evaluation Instructions ---
1. Score the answer from 0 to 100, considering the job requirements, stage focus areas, and scoring rubric.
2. Provide comprehensive feedback that justifies the score and clearly highlights strengths and areas for improvement.
3. If AI was allowed AND AI Collaboration Details are provided, include an assessment of the candidate's collaboration with AI. Evaluate: prompt quality, verification attitude, refinement, and critique of AI output.
4. Respond with a JSON object with these keys: score (number 0-100), feedback (string), aiCollaborationAssessment (string, optional).`,
      },
    ],
    responseFormat: { type: 'json_object' },
  });

  const output = parseJSON<ScoreCandidateAnswerOutput>(response.choices?.[0]?.message?.content as string);
  if (!output) {
    throw new Error('Failed to generate score and feedback.');
  }
  return output;
}
