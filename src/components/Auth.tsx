import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300 flex items-center justify-center p-4">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 w-full max-w-md border border-gray-100 dark:border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

        <div className="flex items-center justify-center mb-10">
          <div className="bg-blue-600 dark:bg-blue-500 p-4 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Gestionnaire SWOT
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">
            {isSignUp ? 'Créez votre compte pour commencer' : 'Bienvenue, connectez-vous'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-slate-300 ml-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl focus:ring-0 transition-all outline-none dark:text-white"
              placeholder="votre@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-slate-300 ml-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl focus:ring-0 transition-all outline-none dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {isSignUp ? "Créer mon compte" : "Se connecter"}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-bold transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}
