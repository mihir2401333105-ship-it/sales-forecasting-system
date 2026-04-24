import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, ShieldCheck, Mail, Lock, ArrowRight, User, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '../context/LanguageContext';

const Auth = () => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Validation State
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: '' }

  const navigate = useNavigate();

  // Reset form when switching between login/signup
  useEffect(() => {
    setErrors({});
    setPasswordStrength(0);
    setToast(null);
  }, [isLogin]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast && toast.type === 'success') {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Validation Utilities
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass) && /[!@#$%^&*]/.test(pass)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (!isLogin) {
      setPasswordStrength(calculatePasswordStrength(val));
      if (errors.password) {
        setErrors(prev => ({ ...prev, password: null }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';

    if (!isLogin) {
      if (!firstName) newErrors.firstName = 'First name is required';
      if (!lastName) newErrors.lastName = 'Last name is required';
      
      const strength = calculatePasswordStrength(password);
      if (strength < 4) {
        newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
      }
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match. Please try again.";
      }
      
      if (!agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to Terms of Service to continue';
      }
    } else {
      if (!password) newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setToast(null);
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const res = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
          localStorage.setItem('session_token', data.access_token);
          localStorage.setItem('user_email', data.user.email);
          localStorage.setItem('user_first_name', data.user.firstName);
          localStorage.setItem('user_last_name', data.user.lastName);
          navigate('/dashboard');
        } else {
          setToast({ type: 'error', message: data.detail || 'Invalid email or password' });
        }
      } else {
        // --- SIGNUP FLOW ---
        const res = await fetch('http://localhost:8000/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email, password, confirmPassword, firstName, lastName, organization, agreeToTerms
          })
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          localStorage.setItem('session_token', data.sessionToken);
          localStorage.setItem('user_email', data.user.email);
          localStorage.setItem('user_first_name', data.user.firstName);
          localStorage.setItem('user_last_name', data.user.lastName);
          
          setToast({ type: 'success', message: 'Account created successfully!' });
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // Check specific error to handle UI hints
          if (data.error === "Email already exists") {
             setToast({ type: 'error', message: "Email already registered. Please sign in or use a different email." });
             setErrors(prev => ({...prev, email: "Email already registered"}));
          } else {
             setToast({ type: 'error', message: data.error || 'Signup failed' });
          }
        }
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Connection error. Please check your internet and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStrengthMeter = () => {
    const bars = [1, 2, 3, 4];
    let color = 'bg-slate-200';
    let text = 'Weak';
    let textColor = 'text-slate-400';
    
    if (passwordStrength === 1) { color = 'bg-red-500'; text = 'Weak'; textColor = 'text-red-500'; }
    if (passwordStrength === 2) { color = 'bg-orange-500'; text = 'Fair'; textColor = 'text-orange-500'; }
    if (passwordStrength === 3) { color = 'bg-yellow-500'; text = 'Good'; textColor = 'text-yellow-500'; }
    if (passwordStrength === 4) { color = 'bg-green-500'; text = 'Strong'; textColor = 'text-green-500'; }

    return (
      <div className="mt-2">
        <div className="flex gap-1 mb-1">
          {bars.map(bar => (
            <div 
              key={bar} 
              className={`h-1 flex-1 rounded-full ${bar <= passwordStrength ? color : 'bg-slate-200'} transition-colors duration-300`}
            />
          ))}
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${textColor} transition-colors`}>{text}</p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900 relative">
      
      {/* Toast Notification positioned absolutely over everything */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Side: Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 p-16 flex-col justify-between">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[140px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
         
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-12">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">
               N
             </div>
             <span className="text-white font-bold text-2xl tracking-tight">Neuroforecast</span>
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
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 bg-slate-50 overflow-y-auto py-12">
        <div className="w-full max-w-[480px] bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-slate-900">
              {isLogin ? t('auth.login_title') : t('auth.signup_title')}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? t('auth.login_subtitle') : t('auth.signup_subtitle')}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            
            {/* SIGNUP EXTRA FIELDS */}
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 overflow-hidden">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('settings.first_name')}</label>
                     <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                       <input 
                         type="text" 
                         disabled={isLoading}
                         placeholder="Jane"
                         className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-semibold ${errors.firstName ? 'border-red-400' : 'border-slate-200'}`}
                         value={firstName}
                         onChange={(e) => { setFirstName(e.target.value); setErrors({...errors, firstName: null}); }}
                       />
                     </div>
                     {errors.firstName && <p className="text-xs font-semibold text-red-500 ml-1">{errors.firstName}</p>}
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('settings.last_name')}</label>
                     <div className="relative">
                       <input 
                         type="text" 
                         disabled={isLoading}
                         placeholder="Doe"
                         className={`w-full h-12 px-4 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-semibold ${errors.lastName ? 'border-red-400' : 'border-slate-200'}`}
                         value={lastName}
                         onChange={(e) => { setLastName(e.target.value); setErrors({...errors, lastName: null}); }}
                       />
                     </div>
                     {errors.lastName && <p className="text-xs font-semibold text-red-500 ml-1">{errors.lastName}</p>}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Organization (Optional)</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      disabled={isLoading}
                      placeholder="My Company"
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-semibold"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-slate-400'}`} />
                <input 
                  type="email" 
                  disabled={isLoading}
                  placeholder="name@company.com"
                  className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-semibold ${errors.email ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200'}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: null}); }}
                />
              </div>
              {errors.email && <p className="text-xs font-semibold text-red-500 ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-400' : 'text-slate-400'}`} />
                <input 
                  type="password" 
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-semibold ${errors.password ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200'}`}
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
              {!isLogin && password && renderStrengthMeter()}
              {errors.password && <p className="text-xs font-semibold text-red-500 ml-1">{errors.password}</p>}
              
              {isLogin && (
                <div className="text-right pt-2">
                  <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot password?</a>
                </div>
              )}
            </div>

            {!isLogin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`} />
                  <input 
                    type="password" 
                    disabled={isLoading}
                    placeholder="••••••••"
                    className={`w-full h-12 pl-12 pr-4 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-semibold ${errors.confirmPassword ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200'}`}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: null}); }}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs font-semibold text-red-500 ml-1">{errors.confirmPassword}</p>}
              </motion.div>
            )}

            {!isLogin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    disabled={isLoading}
                    checked={agreeToTerms}
                    onChange={(e) => { setAgreeToTerms(e.target.checked); setErrors({...errors, agreeToTerms: null}); }}
                    className={`w-4 h-4 border rounded bg-slate-50 focus:ring-3 focus:ring-blue-300 transition-colors cursor-pointer ${errors.agreeToTerms ? 'border-red-400' : 'border-slate-300 text-blue-600'}`}
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="terms" className="font-semibold text-slate-600 cursor-pointer">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </label>
                  {errors.agreeToTerms && <p className="text-xs font-semibold text-red-500 mt-1">{errors.agreeToTerms}</p>}
                </div>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? t('auth.sign_in') : t('auth.sign_up')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {/* OAuth Options */}
            {/* <div className="mt-8 flex items-center justify-between gap-4">
               <hr className="flex-1 border-slate-200" />
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
               <hr className="flex-1 border-slate-200" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
               <button 
                  type="button" 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm focus:ring-4 focus:ring-slate-100 disabled:opacity-50"
               >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Google
               </button>
               <button 
                  type="button" 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 h-12 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm focus:ring-4 focus:ring-slate-100 disabled:opacity-50"
               >
                  <img src="https://www.svgrepo.com/show/452288/microsoft.svg" alt="Microsoft" className="w-5 h-5" />
                  Microsoft
               </button>
            </div> */}
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">
              {isLogin ? t('auth.no_account') : t('auth.have_account')}
            </span>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => setIsLogin(!isLogin)}
              className="font-extrabold text-blue-600 hover:text-blue-700 focus:outline-none"
            >
              {isLogin ? t('auth.sign_up') : t('auth.sign_in')}
            </button>
          </div>
        </div>
        
        {/* Trusted By */}
        <div className="mt-12 text-center text-slate-400 text-sm font-medium pb-8 lg:pb-0">
          <p className="mb-4">Trusted by industry leaders</p>
          <div className="flex flex-wrap gap-8 items-center justify-center opacity-50 grayscale">
             <span className="font-extrabold tracking-tighter text-xl">DATACLOUD</span>
             <span className="font-extrabold tracking-tighter text-xl">SOFTCORP</span>
             <span className="font-extrabold tracking-tighter text-xl">NEXTGEN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
