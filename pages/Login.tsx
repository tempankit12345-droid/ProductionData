import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate network delay for realism
    setTimeout(async () => {
        const success = await onLogin(username, password);
        if (!success) {
            setError('Invalid username or password.');
            setLoading(false);
        }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* Left Side - Brand */}
        <div className="md:w-1/2 bg-gradient-to-br from-brand-600 to-indigo-800 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-industrial-900 opacity-20"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">ManuTech</h1>
            <p className="text-indigo-200">Manufacturing Data Management System</p>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Secure Access</h3>
                <p className="text-sm text-indigo-200">Authorized Personnel Only</p>
              </div>
            </div>
            <p className="text-xs text-indigo-300 opacity-70">v3.1.0 Enterprise</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 bg-industrial-50 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-industrial-800 mb-2">Sign In</h2>
          <p className="text-industrial-500 mb-8 text-sm">Enter your credentials to access the dashboard.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div>
              <label className="block text-xs font-bold text-industrial-500 uppercase mb-1">Username</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-industrial-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 pr-3 py-2 border border-industrial-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-industrial-500 uppercase mb-1">Password</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-industrial-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-3 py-2 border border-industrial-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-industrial-900 text-white py-3 rounded-lg font-medium hover:bg-industrial-800 transition-colors flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Authenticating...' : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};