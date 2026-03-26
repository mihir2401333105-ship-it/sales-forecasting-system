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
  LayoutDashboard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 z-30">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">SalesForecast.ai</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/forecasts" icon={TrendingUp} label="Forecasting Hub" />
          <SidebarLink to="/data" icon={Database} label="Data Ingestion" />
          <SidebarLink to="/reports" icon={BarChart3} label="Reports & Export" />
        </nav>

        <div className="mt-auto space-y-2 pt-6 border-t border-slate-100">
           <SidebarLink to="/settings" icon={Settings} label="Settings" />
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
           >
             <LogOut className="w-5 h-5" />
             <span className="text-sm font-bold">Logout</span>
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
                placeholder="Search forecasts, products, or reports..."
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600/30 transition-all font-medium"
              />
           </div>

           <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 uppercase leading-none mb-1">Jane Doe</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none tracking-widest">Administrator</p>
                 </div>
                 <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md">
                   JD
                 </div>
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
