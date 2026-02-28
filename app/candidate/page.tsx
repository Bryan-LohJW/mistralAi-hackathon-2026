import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { AuthNav } from '@/components/auth-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Briefcase, FileText, ArrowRight, Search, Clock, Building2 } from 'lucide-react';

async function getMyApplications(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('candidate_applications_summary')
    .select('*')
    .eq('user_id', userId)
    .order('application_created_at', { ascending: false });

  if (error) {
    console.error('Error loading candidate applications', error);
    return [];
  }
  return data ?? [];
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (['offered', 'completed'].includes(status)) return 'default';
  if (['rejected', 'withdrawn'].includes(status)) return 'destructive';
  if (['in_interview', 'screening'].includes(status)) return 'secondary';
  return 'outline';
}

export default async function CandidateDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/candidate');

  const applications = await getMyApplications(user.id);
  const inProgress = applications.filter((a) => !['rejected', 'withdrawn', 'offered'].includes(a.application_status));
  const offered = applications.filter((a) => a.application_status === 'offered');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="px-6 h-16 flex items-center border-b border-white/10 bg-slate-950 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">AegisHire</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10" asChild>
            <Link href="/candidate">My applications</Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10" asChild>
            <Link href="/employer">For employers</Link>
          </Button>
          <AuthNav user={user} />
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My applications</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Track your job applications and continue where you left off.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="gradient-border">
            <Card className="bg-white border-0 shadow-none">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total applications</p>
                  <h3 className="text-3xl font-bold text-slate-900">{applications.length}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
            </div>
            <div className="gradient-border">
            <Card className="bg-white border-0 shadow-none">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">In progress</p>
                  <h3 className="text-3xl font-bold text-slate-900">{inProgress.length}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Clock className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
            </div>
            <div className="gradient-border">
            <Card className="bg-white border-0 shadow-none">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Offers</p>
                  <h3 className="text-3xl font-bold text-slate-900">{offered.length}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Briefcase className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
            </div>
          </div>

          <div className="gradient-border">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-slate-900">Applications</CardTitle>
              <CardDescription>Jobs you've applied to or been invited to.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {applications.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-slate-100">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">You haven't applied to any jobs yet.</p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                    <Link href="/">
                      Browse jobs <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <div
                      key={app.application_id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900">{app.job_title}</h3>
                          <Badge variant={statusVariant(app.application_status)}>
                            {app.application_status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {app.job_company_name}
                          </span>
                          {app.job_category && (
                            <span>{app.job_category}</span>
                          )}
                          {app.job_seniority && (
                            <span>{app.job_seniority}</span>
                          )}
                          {app.applied_at && (
                            <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50" asChild>
                          <Link href={`/candidate/${app.job_profile_id}/apply`}>
                            View application
                          </Link>
                        </Button>
                        {['applied', 'screening', 'in_interview'].includes(app.application_status) && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0" asChild>
                            <Link href={`/candidate/${app.job_profile_id}/interview`}>
                              Continue <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
