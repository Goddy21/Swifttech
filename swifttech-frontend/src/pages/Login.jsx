/**
 * Login.jsx  — place at src/pages/Login.jsx
 * Handles both login and registration. Redirects to / on success.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Zap, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
        await register({ email: form.email, password: form.password, name: form.name });
      }
      toast({ title: mode === 'login' ? '✓ Welcome back!' : '✓ Account created!' });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "rounded-xl h-11 border-border focus-visible:ring-primary/30 bg-white pl-10";

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 gradient-blue rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-heading text-2xl font-bold">
            Swift<span className="text-gradient-blue">Tech</span>
          </h1>
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mt-1">
            Technologies Ltd.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          {/* Tab toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium font-heading transition-all ${
                  mode === m
                    ? 'gradient-blue text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    required
                    placeholder="enter full name"
                    value={form.name}
                    onChange={update('name')}
                    className={fieldClass}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  placeholder="enter email"
                  value={form.email}
                  onChange={update('email')}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  required
                  type="password"
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  value={form.password}
                  onChange={update('password')}
                  minLength={mode === 'register' ? 6 : undefined}
                  className={fieldClass}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    required
                    type="password"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    className={`${fieldClass} ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? 'border-red-300 focus-visible:ring-red-300'
                        : form.confirmPassword && form.password === form.confirmPassword
                        ? 'border-emerald-300 focus-visible:ring-emerald-300'
                        : ''
                    }`}
                  />
                  {form.confirmPassword && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                      {form.password === form.confirmPassword
                        ? <span className="text-emerald-500 font-bold">✓</span>
                        : <span className="text-red-400 font-bold">✗</span>}
                    </span>
                  )}
                </div>
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive bg-red-50 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-blue text-white rounded-xl font-heading font-semibold h-11 shadow-md hover:shadow-lg hover:shadow-primary/25 transition-all mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait...</>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </Button>
          </form>

          {/* Admin hint */}
          {mode === 'login' && (
            <p className="font-mono text-[10px] text-muted-foreground text-center mt-4">
              Admin: admin@swifttech.co.ke / admin1234
            </p>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Back to store
          </Link>
        </p>
      </motion.div>
    </div>
  );
}