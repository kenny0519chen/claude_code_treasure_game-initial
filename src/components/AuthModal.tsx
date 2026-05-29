import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm border-amber-200 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-center text-2xl text-amber-900">
            🏴‍☠️ Treasure Hunt
          </DialogTitle>
          <p className="text-center text-amber-500 text-sm mt-1">
            Sign in to save your scores
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          {/* Tab switcher */}
          <div className="flex mb-5 bg-amber-50 rounded-lg p-1">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === t
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-amber-500 hover:text-amber-700'
                }`}
              >
                {t === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/50"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/50"
                placeholder="Enter password"
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-1"
            >
              {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
