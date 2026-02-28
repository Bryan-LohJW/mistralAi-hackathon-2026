"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield, CheckCircle2, ArrowRight, HelpCircle, Calendar, Mail } from 'lucide-react';

export default function InterviewCompleted({ params: paramsPromise }: { params: Promise<{ jobId: string }> }) {
  const params = use(paramsPromise);
  const jobId = params.jobId;
  const [completionTime, setCompletionTime] = useState<string | null>(null);

  useEffect(() => {
    const time = localStorage.getItem(`aegishire_completed_${jobId}`);
    if (time) {
      setCompletionTime(new Date(time).toLocaleString());
    } else {
      setCompletionTime(new Date().toLocaleString());
    }
  }, [jobId]);

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-6">
      <Card className="max-w-lg w-full text-center shadow-2xl border-2 border-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="pt-12">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter text-foreground">
            Interview Submitted!
          </CardTitle>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium mt-2">
            <Calendar className="w-4 h-4" />
            Completed on {completionTime || '...'}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-8 px-10">
          <p className="text-muted-foreground leading-relaxed text-lg">
            Thank you for your time, <span className="font-bold text-foreground">Candidate</span>. Your performance across all stages has been recorded and an AI evaluation report is currently being prepared for the hiring team at <span className="font-bold text-primary">TechFlow Inc</span>.
          </p>
          
          <div className="grid gap-4 text-left">
            <div className="p-5 bg-muted/50 rounded-2xl border flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Next Steps</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The recruiting manager will review the automated report. You will receive an update via email within 3-5 business days regarding the final selection.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full h-12 text-lg font-bold gap-2 shadow-lg shadow-primary/10" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-6 flex flex-col gap-4">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Help Center
            </Link>
            <span className="text-border">|</span>
            <Link href="#" className="hover:text-primary transition-colors">Candidate FAQ</Link>
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-8 flex flex-col items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Shield className="w-5 h-5 text-primary/60" />
          <span>Secured and Verified by AegisHire</span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">
          AI-Native Automated Recruitment Pipeline
        </p>
      </div>
    </div>
  );
}
