import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthCallbackProps {
  onAuthenticated: (email: string) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthenticated }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user?.email) {
          // Session exists - authenticate the user
          setStatus('success');
          onAuthenticated(session.user.email);
          
          // Redirect to home after a brief delay
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          // No session - redirect to login
          setError('No active session found');
          setStatus('error');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setStatus('error');
        
        // Redirect to login after error
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [onAuthenticated]);

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#111827]/80 rounded-[3rem] shadow-2xl border border-white/5 p-12 backdrop-blur-3xl">
        <div className="flex flex-col items-center space-y-8">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                  Signing You In
                </h2>
                <p className="text-slate-400 text-sm">
                  Verifying your identity...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                  Success!
                </h2>
                <p className="text-slate-400 text-sm">
                  Redirecting to dashboard...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                  Authentication Failed
                </h2>
                <p className="text-slate-400 text-sm">
                  {error || 'Something went wrong'}
                </p>
                <p className="text-slate-500 text-xs mt-4">
                  Redirecting to login...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
