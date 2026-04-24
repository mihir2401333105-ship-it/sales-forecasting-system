import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Database, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronRight, 
  LayoutDashboard,
  ChevronDown,
  User,
  Building,
  LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '../context/LanguageContext';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm">{label}</span>
  </NavLink>
);

const MainLayout = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_last_name');
    navigate('/');
  };

  const firstName = localStorage.getItem('user_first_name') || 'Jane';
  const lastName = localStorage.getItem('user_last_name') || 'Doe';
  const emailStr = localStorage.getItem('user_email') || 'jane.doe@company.com';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const [profileImage, setProfileImage] = React.useState(localStorage.getItem('user_profile_image') || null);

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileImage(localStorage.getItem('user_profile_image'));
    };

    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileImageUpdated', handleProfileUpdate);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 z-30">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
            N
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Neuroforecast</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
          <SidebarLink to="/forecasts" icon={TrendingUp} label={t('nav.forecasting')} />
          <SidebarLink to="/data" icon={Database} label={t('nav.data')} />
          <SidebarLink to="/reports" icon={BarChart3} label={t('nav.reports')} />
        </nav>

        <div className="mt-auto space-y-2 pt-6 border-t border-slate-100">
           <SidebarLink to="/settings" icon={Settings} label={t('nav.settings')} />
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
           >
             <LogOut className="w-5 h-5" />
             <span className="text-sm font-bold">{t('nav.logout')}</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20">
           <div className="relative w-96 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder={t('nav.search')}
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600/30 transition-all font-medium"
              />
           </div>

           <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 pl-6 border-l border-slate-200 hover:opacity-80 transition-opacity focus:outline-none"
                >
                   <div className="text-right hidden md:block">
                      <p className="text-xs font-bold text-slate-900 uppercase leading-none mb-1">{firstName} {lastName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none tracking-widest">Administrator</p>
                   </div>
                   <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md overflow-hidden relative">
                     {profileImage ? (
                       <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       initials
                     )}
                   </div>
                   <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-sm font-bold text-slate-900">{firstName} {lastName}</p>
                      <p className="text-xs font-medium text-slate-500 truncate">{emailStr}</p>
                    </div>
                    
                    <button onClick={() => navigate('/settings?tab=profile')} className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors">
                      <User className="w-4 h-4" /> {t('settings.profile')}
                    </button>
                    <button onClick={() => navigate('/settings?tab=preferences')} className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors">
                      <Settings className="w-4 h-4" /> {t('settings.preferences')}
                    </button>
                    
                    <div className="h-px bg-slate-100 my-1"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
           </div>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
             <motion.div
               key={window.location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2, ease: "easeOut" }}
             >
               <Outlet />
             </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
