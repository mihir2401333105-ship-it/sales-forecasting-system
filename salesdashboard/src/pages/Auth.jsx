import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, ShieldCheck, Mail, Lock, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAuth = (e) => {
    e.preventDefault();
    // In a real app, this would hit the backend
    // Mocking session token generation:
    localStorage.setItem('session_token', 'mock_token_' + Math.random());
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      {/* Left Side: Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 p-16 flex-col justify-between">
         {/* Background Orbs */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[140px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
         
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-12">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">
               S
             </div>
             <span className="text-white font-bold text-2xl tracking-tight">SalesForecast.ai</span>
           </div>
           
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="text-white text-6xl font-extrabold leading-[1.05] tracking-tight mb-8"
           >
             Predict your sales.<br />
             <span className="text-blue-500">Optimize your growth.</span>
           </motion.h1>
           
           <p className="text-slate-400 text-xl max-w-md leading-relaxed">
             Enterprise-grade machine learning for sales forecasting and inventory management. 
             Stop guessing and start leading with data-driven insights.
           </p>
         </div>

         <div className="relative z-10 flex gap-12">
           <div>
             <div className="text-blue-500 font-bold text-4xl mb-1">98%</div>
             <div className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Model Accuracy</div>
           </div>
           <div>
             <div className="text-white font-bold text-4xl mb-1">5x</div>
             <div className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Faster Insights</div>
           </div>
         </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 bg-slate-50">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Join thousands of sales teams worldwide'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
            >
              {isLogin ? 'Sign in' : 'Start free trial'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
        
        {/* Trusted By */}
        <div className="mt-12 text-center text-slate-400 text-sm font-medium">
          <p className="mb-4">Trusted by industry leaders</p>
          <div className="flex gap-8 items-center justify-center opacity-50 grayscale">
             <span className="font-bold tracking-tighter text-lg">DATACLOUD</span>
             <span className="font-bold tracking-tighter text-lg">SOFTCORP</span>
             <span className="font-bold tracking-tighter text-lg">NEXTGEN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
