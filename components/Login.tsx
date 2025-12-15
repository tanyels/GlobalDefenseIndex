import React, { useState } from 'react';
import { loginAdmin } from '../services/firebase';

interface LoginProps {
  onCancel: () => void;
}

export const Login: React.FC<LoginProps> = ({ onCancel }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginAdmin(email, pass);
      // Auth state listener in App.tsx will handle the redirect
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials. Check your email/password.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
        <h2 className="text-2xl font-black text-white uppercase text-center mb-6">Admin Access</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold uppercase py-3 rounded mt-4 transition-all"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <button 
          onClick={onCancel}
          className="w-full text-slate-500 text-xs uppercase font-bold mt-4 hover:text-slate-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};