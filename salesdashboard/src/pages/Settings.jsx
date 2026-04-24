import React, { useState, useEffect } from 'react';
import { 
  User, Sliders, Monitor, Smartphone, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearchParams } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';

// Mock Data
const MOCK_TEAM = [
  { id: 1, name: 'Jane Doe', email: 'jane.doe@company.com', role: 'Admin', status: 'Active', avatar: 'JD' },
  { id: 2, name: 'John Smith', email: 'john.smith@company.com', role: 'Editor', status: 'Active', avatar: 'JS' },
  { id: 3, name: 'Alice Wong', email: 'alice.w@company.com', role: 'Viewer', status: 'Pending', avatar: 'AW' }
];

const MOCK_SESSIONS = [
  { id: 1, device: 'MacBook Pro 16"', browser: 'Chrome', ip: '192.168.1.1', location: 'San Francisco, CA', time: 'Active now', icon: Monitor },
  { id: 2, device: 'iPhone 14 Pro', browser: 'Safari', ip: '10.0.0.45', location: 'San Francisco, CA', time: '2 hours ago', icon: Smartphone }
];

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = React.useState(tabParam || 'profile');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  React.useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Sync tab state to URL parameter
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'preferences', label: t('settings.preferences'), icon: Sliders },
  ];

  const firstName = localStorage.getItem('user_first_name') || 'Jane';
  const lastName = localStorage.getItem('user_last_name') || 'Doe';
  const emailStr = localStorage.getItem('user_email') || 'jane.doe@company.com';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const [profileImage, setProfileImage] = useState(localStorage.getItem('user_profile_image') || null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('user_profile_image', reader.result);
        // Dispatch custom event so other components (like MainLayout) can optionally update
        window.dispatchEvent(new Event('profileImageUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // Render Tab Content
  // ==========================================

  const renderProfile = () => (
    <div className="space-y-8 animate-in fade-in">
      {/* Target: Personal Info */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('settings.personal_info')}</h3>
            <p className="text-sm text-slate-500 font-medium">{t('settings.personal_subtitle')}</p>
          </div>
          <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
            {t('settings.save_changes')}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-3xl shadow-lg border-4 border-white overflow-hidden relative">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            
            <label className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
              Change Photo
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('settings.first_name')}</label>
              <input type="text" defaultValue={firstName} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('settings.last_name')}</label>
              <input type="text" defaultValue={lastName} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('settings.email')}</label>
              <input type="email" defaultValue={emailStr} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('settings.job_title')}</label>
              <input type="text" defaultValue="VP of Sales" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-8 animate-in fade-in">
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
         <h3 className="text-lg font-bold text-slate-900 mb-6">{t('settings.regional')}</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('settings.language')}</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-700"
              >
                 <option value="en">English (US)</option>
                 <option value="mr">मराठी (Marathi)</option>
                 <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('settings.date_format')}</label>
              <select className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-700">
                 <option>DD/MM/YYYY</option>
                 <option>MM/DD/YYYY</option>
              </select>
            </div>
         </div>
         
         <h3 className="text-lg font-bold text-slate-900 mt-8 mb-6">{t('settings.visual')}</h3>
         <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
               onClick={() => handleThemeChange('light')}
               className={`border-2 rounded-xl p-4 cursor-pointer relative overflow-hidden bg-slate-50 transition-colors ${theme === 'light' ? 'border-blue-600' : 'border-slate-200 hover:border-slate-300'}`}
            >
               {theme === 'light' && <div className="absolute top-2 right-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /></div>}
               <div className="w-full h-16 bg-white border border-slate-200 rounded mb-3 shadow-sm flex items-center justify-center text-slate-400">☀️</div>
               <p className={`font-extrabold text-sm text-center ${theme === 'light' ? 'text-slate-900' : 'text-slate-500'}`}>{t('settings.light_mode')}</p>
            </div>
            <div 
               onClick={() => handleThemeChange('dark')}
               className={`border-2 rounded-xl p-4 cursor-pointer relative overflow-hidden bg-white transition-colors ${theme === 'dark' ? 'border-blue-600' : 'border-slate-200 hover:border-slate-300'}`}
            >
               {theme === 'dark' && <div className="absolute top-2 right-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /></div>}
               <div className="w-full h-16 bg-slate-900 rounded mb-3 shadow-sm flex items-center justify-center text-slate-400">🌙</div>
               <p className={`font-extrabold text-sm text-center ${theme === 'dark' ? 'text-slate-900' : 'text-slate-500'}`}>{t('settings.dark_mode')}</p>
            </div>
         </div>
      </section>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{t('settings.title')}</h1>
        <p className="text-slate-500 font-medium">{t('settings.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
           <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              ))}
           </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pb-20">
           {activeTab === 'profile' && renderProfile()}
           {activeTab === 'preferences' && renderPreferences()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
