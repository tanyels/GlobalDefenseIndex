import React, { useState } from 'react';
import { loginAdmin } from '../services/firebase';

interface LoginProps {
  onCancel: () => void;
}

export const Login: React.FC<LoginProps> = ({ onCancel }) => {
  const [email, setEmail] = useState('admin@globaldefense.com');
  const [pass, setPass] = useState('admin123');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorCode('');
    
    try {
      await loginAdmin(email, pass);
    } catch (err: any) {
      console.error(err);
      setErrorCode(err.code || 'unknown');
      
      // Friendly error mapping
      if (err.code === 'auth/api-key-not-valid') {
        setError("Your API Key is INVALID. Please check VITE_FIREBASE_API_KEY in .env");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("Incorrect email or password.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No user found with this email.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Try again later.");
      } else {
        setError(err.message || "Authentication failed.");
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
        <h2 className="text-2xl font-black text-white uppercase text-center mb-6">
          Admin Access
        </h2>
        
        <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded mb-6 text-xs text-indigo-200">
           <p className="font-bold mb-1 uppercase"><i className="fas fa-info-circle mr-1"></i> Authentication Provider</p>
           <p>Connecting to Firebase Auth. Ensure user exists in Firebase Console.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-xs">
            <span className="font-bold block mb-1">
              Error: <span className="font-mono bg-red-900/50 px-1 rounded">{errorCode}</span>
            </span>
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
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold uppercase py-3 rounded mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="mt-4">
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