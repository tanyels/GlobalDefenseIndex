import React, { useState } from 'react';
import { loginAdmin, registerAdmin } from '../services/firebase';

interface LoginProps {
  onCancel: () => void;
}

export const Login: React.FC<LoginProps> = ({ onCancel }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await registerAdmin(email, pass);
      } else {
        await loginAdmin(email, pass);
      }
      // Auth state listener in App.tsx will handle the redirect
    } catch (err: any) {
      console.error(err);
      // Show specific firebase error code to help debugging
      const code = err.code ? `(${err.code})` : '';
      const msg = err.message || 'Authentication failed.';
      setError(`${msg} ${code}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
        <h2 className="text-2xl font-black text-white uppercase text-center mb-6">
          {isRegistering ? 'Create Admin Account' : 'Admin Access'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-xs break-words">
            <span className="font-bold block mb-1">Error:</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold uppercase py-3 rounded mt-4 transition-all"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
            <button 
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                }}
                className="w-full text-indigo-400 text-xs uppercase font-bold hover:text-indigo-300"
            >
                {isRegistering ? 'Already have an account? Login' : 'Need an account? Create one'}
            </button>
            
            <button 
                onClick={onCancel}
                className="w-full text-slate-500 text-xs uppercase font-bold hover:text-slate-300"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};