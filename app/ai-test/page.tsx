'use client';

import { useState } from 'react';

/* ─────────────────────────────────────────────
   Sample payloads
───────────────────────────────────────────── */
const SAMPLES: Record<string, { endpoint: string; payload: object }> = {
  'Extract Resume': {
    endpoint: '/api/ai-test/extract-resume',
    payload: {
      resumeText: `Jane Smith
jane.smith@example.com
Phone: +1 555-0100

EDUCATION
B.S. Computer Science, MIT, 2018

EXPERIENCE
Senior Software Engineer — Acme Corp (2020–present)
• Led a team of 5 engineers building a React/TypeScript SaaS platform
• Reduced API latency by 40% through query optimisation

Software Engineer — StartupXYZ (2018–2020)
• Built REST APIs with Node.js and PostgreSQL

SKILLS
React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Python`,
    },
  },
  'Resume Fit Check': {
    endpoint: '/api/ai-test/resume-fit',
    payload: {
      jobProfile: {
        jobTitle: 'Senior Frontend Engineer',
        companyName: 'TechCorp',
        jobDescription: 'Build and maintain high-performance React applications at scale.',
        seniority: 'Senior',
        mustHaveSkills: ['React', 'TypeScript', 'GraphQL', 'Testing (Jest/RTL)'],
      },
      resumeText: `Jane Smith — Senior SWE
Skills: React, TypeScript, Node.js, PostgreSQL, AWS
Experience: 6 years of full-stack development, 4 years in React`,
    },
  },
  'Generate Questions': {
    endpoint: '/api/ai-test/questions',
    payload: {
      jobDescription:
        'We are looking for a Senior Frontend Engineer to build React applications using TypeScript and GraphQL.',
      stageFocusAreas: ['React hooks and performance', 'TypeScript type system', 'Component design patterns'],
      numQuestions: 4,
    },
  },
  'Score Answer': {
    endpoint: '/api/ai-test/score-answer',
    payload: {
      jobProfile: {
        jobTitle: 'Senior Frontend Engineer',
        jobDescription: 'Build React applications at scale using TypeScript.',
        mustHaveSkills: ['React', 'TypeScript'],
      },
      stageConfig: {
        stageType: 'behavioral',
        focusAreas: ['communication', 'teamwork'],
        aiAllowed: false,
        scoringRubric: {
          weights: { clarity: 0.4, depth: 0.4, relevance: 0.2 },
          criteria: ['Clear communication', 'Specific examples', 'Positive outcome'],
          passThreshold: 60,
        },
      },
      question: 'Tell me about a time you resolved a conflict within your team.',
      answer:
        'On my last project, two engineers disagreed on the API structure. I facilitated a design session, presented pros/cons, and we reached consensus on a REST approach. The feature shipped on time and both engineers felt heard.',
    },
  },
  'Evaluation Report': {
    endpoint: '/api/ai-test/evaluation-report',
    payload: {
      jobProfile: {
        title: 'Senior Frontend Engineer',
        company: 'TechCorp',
        description: 'Build React applications at scale.',
        seniority: 'Senior',
        mustHaveSkills: ['React', 'TypeScript'],
        interviewPipelineConfig: [
          { stageId: 's1', stageType: 'behavioral', focusAreas: ['teamwork'], aiAllowed: false },
        ],
      },
      candidateData: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        education: 'B.S. Computer Science, MIT',
        experienceSummary: '6 years in full-stack development, 4 in React',
        resumeText: 'Jane Smith — Senior SWE with React & TypeScript experience.',
      },
      resumeFitCheckResult: {
        fitScore: 88,
        matchedSkills: ['React', 'TypeScript'],
        missingSkills: [],
        justification: 'Strong match on core skills.',
      },
      stageResults: [
        {
          stageId: 's1',
          stageType: 'behavioral',
          question: 'Tell me about a time you resolved a conflict within your team.',
          candidateAnswer:
            'I facilitated a design session to align two engineers and the feature shipped on time.',
          aiAllowed: false,
          aiInteractionArtifacts: null,
        },
      ],
    },
  },
};

type Tab = keyof typeof SAMPLES;

export default function AITestPage() {
  const tabs = Object.keys(SAMPLES) as Tab[];
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);
  const [payloadText, setPayloadText] = useState(JSON.stringify(SAMPLES[tabs[0]].payload, null, 2));
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setPayloadText(JSON.stringify(SAMPLES[tab].payload, null, 2));
    setResult('');
    setElapsed(null);
  }

  async function runTest() {
    setLoading(true);
    setResult('');
    setElapsed(null);
    const { endpoint } = SAMPLES[activeTab];
    let parsed: object;
    try {
      parsed = JSON.parse(payloadText);
    } catch {
      setResult('❌ Invalid JSON in payload editor.');
      setLoading(false);
      return;
    }
    const start = Date.now();
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setElapsed(Date.now() - start);
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setElapsed(Date.now() - start);
      setResult(`❌ Fetch error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Mistral AI — Flow Test Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Directly test each AI flow via its API route. Edit the JSON payload, then click Run.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Payload editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 uppercase tracking-wider">Request Payload</label>
              <span className="text-xs text-slate-500">POST {SAMPLES[activeTab].endpoint}</span>
            </div>
            <textarea
              className="w-full h-96 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 resize-none focus:outline-none focus:border-blue-500"
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              spellCheck={false}
            />
            <button
              onClick={runTest}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {loading ? 'Running…' : 'Run'}
            </button>
          </div>

          {/* Response */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 uppercase tracking-wider">Response</label>
              {elapsed !== null && (
                <span className="text-xs text-slate-500">{(elapsed / 1000).toFixed(2)}s</span>
              )}
            </div>
            <pre className="w-full h-96 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-green-300 overflow-auto whitespace-pre-wrap">
              {loading ? 'Waiting for response…' : result || 'Response will appear here.'}
            </pre>
          </div>
        </div>

        {/* Info footer */}
        <div className="text-xs text-slate-500 border-t border-slate-800 pt-4 space-y-1">
          <p>All flows use <span className="text-blue-400">mistral-large-latest</span> except Score Answer on <em>technical coding</em> stages (uses <span className="text-blue-400">codestral-latest</span>) and Extract Resume (uses <span className="text-blue-400">mistral-small-latest</span>).</p>
          <p>Speech-to-text and Text-to-speech are stubbed — Mistral has no native STT/TTS.</p>
          <p>Make sure <span className="text-yellow-400">MISTRAL_API_KEY</span> is set in your .env file.</p>
        </div>
      </div>
    </div>
  );
}
