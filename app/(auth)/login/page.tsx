'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || undefined;
  const message = searchParams.get('message');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const res = await fetch('/api/auth/sync', { method: 'POST', credentials: 'same-origin' });
    if (!res.ok) {
      setLoading(false);
      setError('Could not load your profile.');
      return;
    }
    const { role } = await res.json();
    setLoading(false);
    const redirectTo = next || (role === 'employer' ? '/employer' : '/candidate');
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400 mt-1 text-sm">Enter your credentials to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {message === 'confirm_email' && (
          <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            Check your email to confirm your account, then sign in below.
          </div>
        )}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/60 h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/60 h-11"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/30 font-semibold"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-slate-400 pt-1">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
