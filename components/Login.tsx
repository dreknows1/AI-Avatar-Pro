
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
    // Listen for the auth state change when the user returns via Magic Link
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle both the initial sign in and the potential "user updated" event from the link
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
      // Check if the email exists in the allowed_users table
      if (normalizedEmail !== 'dreknows@gmail.com') {
          const { data: allowed, error: allowedError } = await supabase
            .from('allowed_users')
            .select('email')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (allowedError) {
              console.error("Membership Check Error:", allowedError);
              throw new Error("Verification server error. Please try again later.");
          }
          
          if (!allowed) {
            throw new Error("Access denied. This tool is exclusive to registered community members.");
          }
      }

      // 2. Send Magic Link (OTP)
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          // Redirect back to the current origin
          emailRedirectTo: window.location.origin,
        },
      });

      if (otpError) throw otpError;

      setMessage("Success! We've sent a login link to your email. Please check your inbox (and spam folder) to sign in.");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#1e293b] rounded-[2rem] shadow-2xl border border-slate-700/50 p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#8b5cf6] to-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-lg mb-6 transform -rotate-3 transition-transform hover:rotate-0">
             <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
             </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] mb-2">
            AI Avatar Creator Pro
          </h1>
          <p className="text-slate-400 text-center font-medium">Seamless Access for Community Members</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-pulse">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             <span className="flex-1">{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm text-center space-y-3 animate-fadeIn">
             <p className="font-bold text-lg">Check your email!</p>
             <p className="text-emerald-300/80">{message}</p>
             <button onClick={() => setMessage(null)} className="mt-2 text-xs underline opacity-60 hover:opacity-100 transition-opacity">Try a different email</button>
          </div>
        )}

        {!message && (
          <form onSubmit={handleMagicLink} className="space-y-8">
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                disabled={loading}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] outline-none transition-all disabled:opacity-50"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#0ea5e9] hover:from-[#4f46e5] hover:to-[#0284c7] text-white font-bold py-5 px-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/10"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                'Send Magic Link'
              )}
            </button>
            
            <div className="text-center pt-2">
               <p className="text-xs text-slate-500">
                  Password-free login for <a href="https://skool.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors font-semibold">Skool community members</a>.
               </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
