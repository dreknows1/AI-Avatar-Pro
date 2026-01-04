
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onLogin: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Listen for the auth state change
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user?.email) {
        onLogin(session.user.email);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onLogin]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Membership Verification
      if (normalizedEmail !== 'dreknows@gmail.com') {
          const { data: allowed, error: allowedError } = await supabase
            .from('allowed_users')
            .select('email')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (allowedError) {
              console.error("Membership Check Error:", allowedError);
              throw new Error("Forensic verification failed. Project access denied.");
          }
          
          if (!allowed) {
            throw new Error("Access restricted. DNA Profile not found in community database.");
          }
      }

      // 2. Send Magic Link
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (otpError) throw otpError;

      setMessage("Sequence Initiated. Check your secure inbox for the decryption link.");
    } catch (err: any) {
      setError(err.message || "Identity verification error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 font-sans selection:bg-indigo-500/30">
      <div className="max-w-md w-full bg-[#111827]/80 rounded-[3rem] shadow-2xl border border-white/5 p-12 backdrop-blur-3xl relative overflow-hidden">
        {/* Visual Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
        
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.15)] mb-8 border border-indigo-500/20 group hover:scale-105 transition-transform duration-500">
             <svg viewBox="0 0 24 24" className="w-12 h-12 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
             </svg>
          </div>
          <h1 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Identity Verification</h1>
          <h2 className="text-4xl font-black text-white text-center uppercase tracking-tight">AI Avatar <br/>Creator Pro</h2>
        </div>
        
        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-black uppercase tracking-widest flex items-start gap-4 animate-fadeIn">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             <span className="flex-1">{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-8 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] text-center space-y-4 animate-fadeIn">
             <p className="font-black text-white uppercase tracking-widest text-sm">Sequence Sent</p>
             <p className="text-slate-400 text-xs leading-relaxed">{message}</p>
             <button onClick={() => setMessage(null)} className="text-[10px] text-indigo-400 hover:text-white transition-colors underline uppercase tracking-widest font-black pt-4 block w-full text-center">Try Another Email</button>
          </div>
        )}

        {!message && (
          <form onSubmit={handleMagicLink} className="space-y-10">
            <div className="space-y-4">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                Authorized Email
              </label>
              <input
                type="email"
                id="email"
                required
                disabled={loading}
                className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl p-5 text-white placeholder-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all disabled:opacity-50 text-sm font-medium"
                placeholder="identity@vault.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#008080] hover:bg-[#006666] text-white font-black py-6 px-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl shadow-teal-500/10 uppercase tracking-[0.2em] text-xs"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                'Verify Identity'
              )}
            </button>
            
            <div className="text-center">
               <p className="text-[9px] text-slate-600 uppercase tracking-widest leading-relaxed">
                  Exclusive access for verified community members only.<br/>
                  Powered by Gemini 3 Pro & Veo.
               </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
