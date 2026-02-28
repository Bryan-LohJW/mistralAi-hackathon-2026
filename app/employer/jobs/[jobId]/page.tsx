"use client";

import { useState, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, ArrowLeft, MoreHorizontal, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function JobDetails({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const mockCandidates = [
    {
      id: 'c-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      fitScore: 88,
      status: 'passed',
      appliedAt: '2024-03-16',
      currentStage: 'Completed',
      recommendation: 'Strong Hire'
    },
    {
      id: 'c-2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      fitScore: 72,
      status: 'in_progress',
      appliedAt: '2024-03-17',
      currentStage: 'Technical Coding',
      recommendation: 'Pending'
    },
    {
      id: 'c-3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      fitScore: 45,
      status: 'failed',
      appliedAt: '2024-03-18',
      currentStage: 'Resume Fit Check',
      recommendation: 'No Hire'
    }
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="px-6 h-16 flex items-center border-b bg-white shrink-0">
        <Link href="/employer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold tracking-tight text-primary">AegisHire</span>
        </Link>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Senior Software Engineer</h1>
            <p className="text-muted-foreground mt-1">TechFlow Inc. • Pipeline Active</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Edit Pipeline</Button>
            <Button>Publish New Version</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Candidates
            </CardTitle>
            <CardDescription>Track progression through the automated multi-stage pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Fit Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Rec.</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCandidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.fitScore > 80 ? 'default' : c.fitScore > 60 ? 'secondary' : 'destructive'}>
                        {c.fitScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {c.status === 'passed' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> :
                         c.status === 'failed' ? <XCircle className="w-3 h-3 text-destructive" /> :
                         <Clock className="w-3 h-3 text-amber-500" />}
                        <span className="capitalize text-xs font-medium">{c.status.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.currentStage}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        c.recommendation === 'Strong Hire' ? 'border-green-500 text-green-600 bg-green-50' :
                        c.recommendation === 'No Hire' ? 'border-destructive text-destructive bg-destructive/5' : ''
                      }>
                        {c.recommendation}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(c)}>
                            View Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                              <FileText className="w-6 h-6 text-primary" /> 
                              AI Evaluation Report: {selectedCandidate?.name}
                            </DialogTitle>
                            <DialogDescription>
                              Detailed assessment across all interview stages for Senior Software Engineer.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="mt-6 space-y-8">
                            <div className="grid md:grid-cols-[1fr_200px] gap-8 border-b pb-8">
                              <div className="space-y-4">
                                <h3 className="font-bold text-lg">Overall Performance Summary</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                  Alice demonstrated exceptional proficiency in both technical and soft skills. Her approach to the system design problem showed senior-level architectural thinking, while her coding implementation was clean, well-tested, and efficient.
                                </p>
                              </div>
                              <div className="bg-primary/5 rounded-xl p-4 flex flex-col items-center justify-center border border-primary/10">
                                <span className="text-4xl font-black text-primary">88%</span>
                                <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Global Score</p>
                              </div>
                            </div>

                            <Tabs defaultValue="resume" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="resume">Resume Fit</TabsTrigger>
                                <TabsTrigger value="stages">Stage Breakdown</TabsTrigger>
                                <TabsTrigger value="ai-collaboration">AI Collaboration</TabsTrigger>
                              </TabsList>
                              <TabsContent value="resume" className="p-6 border rounded-lg mt-2 bg-white">
                                <div className="space-y-4">
                                  <h4 className="font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Matched Must-Have Skills
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {['React', 'Next.js', 'TypeScript', 'System Design'].map(s => (
                                      <Badge key={s} variant="secondary">{s}</Badge>
                                    ))}
                                  </div>
                                  <div className="mt-4">
                                    <h4 className="font-bold">AI Justification</h4>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      Alice's background at previous Fortune 500 tech companies aligns perfectly with our need for scale and reliability. She has 6+ years of specialized React experience.
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="stages" className="space-y-4 mt-4">
                                <StageEvaluationCard 
                                  title="Behavioral & Culture Fit" 
                                  score={85} 
                                  strengths={['Communication', 'Leadership', 'Conflict Resolution']} 
                                  improvements={['Could provide more specific metrics on impact']}
                                />
                                <StageEvaluationCard 
                                  title="Technical Implementation" 
                                  score={92} 
                                  strengths={['Clean Code', 'Edge Case Handling', 'Performance Optimization']} 
                                  improvements={[]}
                                />
                              </TabsContent>
                              <TabsContent value="ai-collaboration" className="p-6 border rounded-lg mt-2 bg-white">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-accent font-bold">
                                    <Shield className="w-5 h-5" /> Expert Collaboration Detected
                                  </div>
                                  <p className="text-sm leading-relaxed">
                                    Candidate used the AI workspace strategically. Rather than asking for whole solutions, Alice used AI to verify complex regex patterns and brainstorm edge cases for a sorting algorithm. 
                                  </p>
                                  <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="p-3 bg-muted rounded-md">
                                      <p className="text-xs font-bold uppercase mb-1">Prompt Quality</p>
                                      <p className="text-sm">9.5/10 - Specific and technical</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-md">
                                      <p className="text-xs font-bold uppercase mb-1">Critique Factor</p>
                                      <p className="text-sm">High - Refined 20% of AI code</p>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>

                            <div className="flex justify-end gap-3 pt-6 border-t">
                              <Button variant="outline">Download PDF</Button>
                              <Button>Move to Final Interview</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StageEvaluationCard({ title, score, strengths, improvements }: any) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm flex items-start justify-between gap-4">
      <div className="space-y-3 flex-1">
        <h4 className="font-bold">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {strengths.map((s: string) => (
            <Badge key={s} variant="secondary" className="bg-green-50 text-green-700 border-green-200">+{s}</Badge>
          ))}
          {improvements.map((s: string) => (
            <Badge key={s} variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">△ {s}</Badge>
          ))}
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-black text-primary">{score}%</div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase">Score</p>
      </div>
    </div>
  );
}
