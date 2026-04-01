import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Building2, Bell, Sliders, LifeBuoy, Command, 
  Smartphone, Monitor, Key, Lock, Globe, Mail, MessageSquare, 
  AlertTriangle, KeyRound, Clock, CreditCard, Users, Search,
  ChevronRight, Plus, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearchParams } from 'react-router-dom';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = React.useState(tabParam || 'profile');

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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'account', label: 'Account', icon: KeyRound },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'support', label: 'Help & Support', icon: LifeBuoy }
  ];

  const firstName = localStorage.getItem('user_first_name') || 'Jane';
  const lastName = localStorage.getItem('user_last_name') || 'Doe';
  const emailStr = localStorage.getItem('user_email') || 'jane.doe@company.com';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // ==========================================
  // Render Tab Content
  // ==========================================

  const renderProfile = () => (
    <div className="space-y-8 animate-in fade-in">
      {/* Target: Personal Info */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            <p className="text-sm text-slate-500 font-medium">Update your photo and personal details.</p>
          </div>
          <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
            Save Changes
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-3xl shadow-lg border-4 border-white">
              {initials}
            </div>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Change Photo</button>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">First Name</label>
              <input type="text" defaultValue={firstName} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Name</label>
              <input type="text" defaultValue={lastName} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
              <input type="email" defaultValue={emailStr} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Job Title</label>
              <input type="text" defaultValue="VP of Sales" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold" />
            </div>
          </div>
        </div>
      </section>

      {/* Target: Account Info (Read Only) */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Account Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Account Type</p>
            <p className="font-extrabold text-blue-600">Enterprise</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
            <p className="font-extrabold text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Active</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Member Since</p>
            <p className="font-extrabold text-slate-900">Oct 2025</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Usage Activity</p>
            <p className="font-extrabold text-slate-900">42 Reports Gen.</p>
          </div>
        </div>
      </section>

      {/* Target: Company Information */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Company Details</h3>
            <p className="text-sm text-slate-500 font-medium">General business boundaries used for cohort intelligence.</p>
          </div>
          <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-100 transition-colors">
            Edit Company
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-1">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company Name</p>
             <p className="font-semibold text-slate-900">Acme Corp</p>
           </div>
           <div className="space-y-1">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Industry</p>
             <p className="font-semibold text-slate-900">SaaS / Technology</p>
           </div>
           <div className="space-y-1">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Size</p>
             <p className="font-semibold text-slate-900">200-500 Employees</p>
           </div>
           <div className="space-y-1">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Country</p>
             <p className="font-semibold text-slate-900">United States</p>
           </div>
           <div className="space-y-1">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Annual Revenue</p>
             <p className="font-semibold text-slate-900">$50M - $100M</p>
           </div>
        </div>
      </section>
    </div>
  );

  const renderOrganization = () => (
    <div className="space-y-8 animate-in fade-in">
      {/* Target: Organization details */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
           <h3 className="text-lg font-bold text-slate-900">Organization Settings</h3>
           <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Edit Details</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
           <div><p className="text-xs font-bold text-slate-400 uppercase">Org Name</p><p className="font-semibold">Acme Enterprises</p></div>
           <div><p className="text-xs font-bold text-slate-400 uppercase">Billing Email</p><p className="font-semibold">billing@acme.com</p></div>
           <div><p className="text-xs font-bold text-slate-400 uppercase">Website</p><p className="font-semibold">www.acme.com</p></div>
        </div>
      </section>

      {/* Target: Team Members */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Team Members</h3>
            <p className="text-sm text-slate-500 font-medium">Manage who has access to this organization.</p>
          </div>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Invite Member
          </button>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              <th className="py-4 px-8">Member</th>
              <th className="py-4 px-8">Role</th>
              <th className="py-4 px-8">Status</th>
              <th className="py-4 px-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_TEAM.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{member.name}</p>
                      <p className="text-xs font-medium text-slate-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-8">
                  <select className="bg-transparent border border-slate-200 rounded-lg text-xs font-bold p-2 outline-none focus:border-blue-500">
                    <option selected={member.role === 'Admin'}>Admin</option>
                    <option selected={member.role === 'Editor'}>Editor</option>
                    <option selected={member.role === 'Viewer'}>Viewer</option>
                    <option selected={member.role === 'Analyst'}>Analyst</option>
                  </select>
                </td>
                <td className="py-4 px-8">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="py-4 px-8 text-right">
                  <button className="text-xs font-bold text-rose-500 hover:text-rose-600">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Target: Team Permissions Overview */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Permission Levels Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 border border-slate-200 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
             <p className="font-extrabold text-slate-900 mb-1">Admin</p>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">Full access to settings, billing, team modifications, and all reporting data.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
             <p className="font-extrabold text-slate-900 mb-1">Editor</p>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">Can construct datasets, overwrite parameters, and generate forecasts.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
             <p className="font-extrabold text-slate-900 mb-1">Viewer</p>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">Read-only pipeline access. Can view hubs and download PDF reports.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
             <p className="font-extrabold text-slate-900 mb-1">Analyst</p>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">Specialized limited access for creating custom reporting charts only.</p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-8 animate-in fade-in">
      {/* Target: Password & Email */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
         <h3 className="text-lg font-bold text-slate-900 mb-6">Account Authentication</h3>
         <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
               <div>
                 <p className="text-sm font-extrabold text-slate-900 mb-1">Email Address</p>
                 <p className="text-sm font-medium text-slate-500">Primary email used for billing & login</p>
               </div>
               <div className="flex items-center gap-4">
                 <span className="font-bold text-sm text-slate-700">jane.doe@company.com</span>
                 <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">Change</button>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
               <div>
                 <p className="text-sm font-extrabold text-slate-900 mb-1">Password</p>
                 <p className="text-sm font-medium text-slate-500">Secure your account</p>
               </div>
               <div className="flex items-center gap-4">
                 <span className="font-bold text-sm text-slate-400">••••••••••</span>
                 <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">Update</button>
               </div>
            </div>
         </div>
      </section>

      {/* Target: Sessions */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
         <div className="flex justify-between items-start mb-6">
           <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Sessions</h3>
              <p className="text-sm text-slate-500 font-medium">Review and explicitly revoke authorized devices.</p>
           </div>
           <button className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
              Sign out all other devices
           </button>
         </div>
         
         <div className="space-y-4">
            {MOCK_SESSIONS.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <session.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{session.device} · {session.browser}</p>
                    <p className="text-xs text-slate-500 font-semibold">{session.location} — {session.ip}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 mb-1">{session.time}</p>
                  {idx !== 0 && <button className="text-xs font-bold text-rose-500 hover:text-rose-600">Revoke</button>}
                </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-8 animate-in fade-in">
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
         <h3 className="text-lg font-bold text-slate-900 mb-6">Regional Settings</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Language Selection</label>
              <select className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-700">
                 <option>English (US)</option>
                 <option>Spanish (ES)</option>
                 <option>French (FR)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Time Zone</label>
              <select className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-700">
                 <option>(GMT-08:00) Pacific Time</option>
                 <option>(GMT-05:00) Eastern Time</option>
                 <option>(GMT+00:00) UTC Time</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Date Format</label>
              <select className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-700">
                 <option>MM/DD/YYYY</option>
                 <option>DD/MM/YYYY</option>
              </select>
            </div>
         </div>
         
         <h3 className="text-lg font-bold text-slate-900 mt-8 mb-6">Visual Settings</h3>
         <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-2 border-blue-600 rounded-xl p-4 cursor-pointer relative overflow-hidden bg-slate-50">
               <div className="absolute top-2 right-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /></div>
               <div className="w-full h-16 bg-white border border-slate-200 rounded mb-3 shadow-sm"></div>
               <p className="font-extrabold text-sm text-center">Light Mode</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-300 transition-colors bg-white">
               <div className="w-full h-16 bg-slate-900 rounded mb-3 shadow-sm"></div>
               <p className="font-bold text-sm text-slate-500 text-center">Dark Mode</p>
            </div>
         </div>
      </section>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8 animate-in fade-in">
       <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-500"/> Notification Delivery</h3>
          
          <div className="space-y-6">
             <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                   <p className="font-extrabold text-sm text-slate-900">Email Alerts</p>
                   <p className="text-xs font-medium text-slate-500">Receive reports and major warnings directly to your inbox.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                   <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
             </div>
             
             <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                   <p className="font-extrabold text-sm text-slate-900">In-App Notifications</p>
                   <p className="text-xs font-medium text-slate-500">Display persistent bell icon alerts inside the Navigation bar.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                   <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
             </div>

             <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                   <p className="font-extrabold text-sm text-slate-900">Desktop Push Notifications</p>
                   <p className="text-xs font-medium text-slate-500">Allow your browser to interrupt you when tasks finish.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer shadow-inner">
                   <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
             </div>

             <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quiet Hours (Do Not Disturb)</p>
                <div className="flex items-center gap-4">
                  <select className="w-32 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                     <option>10:00 PM</option>
                  </select>
                  <span className="text-sm font-bold text-slate-400">to</span>
                  <select className="w-32 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                     <option>7:00 AM</option>
                  </select>
                </div>
             </div>
          </div>
       </section>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-8 animate-in fade-in">
       <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm border-t-4 border-t-amber-500">
          <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Lock className="w-5 h-5 text-amber-500"/> Protection Features</h3>
               <p className="text-sm text-slate-500 font-medium">Configure advanced barriers around your workflow data.</p>
             </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
             <div>
                <p className="font-extrabold text-sm text-slate-900 mb-1">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-slate-500 font-medium">Protect your account using an authenticator app or SMS code.</p>
             </div>
             <button className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition">
                Enable 2FA
             </button>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
               <div className="flex items-center gap-3">
                 <Globe className="w-5 h-5 text-slate-400" />
                 <div><p className="text-sm font-extrabold">IP Whitelisting</p><p className="text-[10px] uppercase font-bold text-slate-400">Not Configured</p></div>
               </div>
               <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Configure</button>
             </div>
             <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
               <div className="flex items-center gap-3">
                 <AlertTriangle className="w-5 h-5 text-rose-400" />
                 <div><p className="text-sm font-extrabold">Suspicious Activity Alerts</p><p className="text-[10px] uppercase font-bold text-slate-400">Enabled</p></div>
               </div>
               <button className="text-xs font-bold text-slate-400 hover:text-slate-600">Disable</button>
             </div>
          </div>
       </section>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-8 animate-in fade-in">
       <section className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 transform -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight relative z-10">How can we help?</h2>
          <p className="text-slate-400 text-sm mb-8 relative z-10">Search our knowledge base or get in touch with our team.</p>
          
          <div className="relative w-full max-w-xl z-10">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
             <input type="text" placeholder="Search for guides, FAQ, or articles..." className="w-full h-14 pl-12 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold backdrop-blur-md"/>
          </div>
       </section>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform group">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
               <Command className="w-6 h-6" />
             </div>
             <h4 className="font-extrabold text-slate-900 mb-2">Quick Start Guides</h4>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">Learn how to import datasets and generate your first AI prediction models.</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform group">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
               <MessageSquare className="w-6 h-6" />
             </div>
             <h4 className="font-extrabold text-slate-900 mb-2">Contact Support</h4>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">Chat with our dedicated engineers or schedule a 1-on-1 implementation call.</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform group">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <h4 className="font-extrabold text-slate-900 mb-2">Report an Issue</h4>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">Submit bug tickets directly to the development team for rapid patching.</p>
          </div>
       </div>

       <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
             <h4 className="font-bold text-slate-900 tracking-tight">System Status</h4>
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest"><CheckCircle2 className="w-3 h-3"/> All Systems Operational</div>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition">
             <h4 className="font-bold text-slate-900 text-sm">Frequently Asked Questions (FAQ)</h4>
             <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex justify-between items-center cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition">
             <h4 className="font-bold text-slate-900 text-sm">Review Knowledge Base Architecture</h4>
             <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
       </section>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Platform Settings</h1>
        <p className="text-slate-500 font-medium">Manage your personal profile, organization boundaries, and security parameters.</p>
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
           {activeTab === 'organization' && renderOrganization()}
           {activeTab === 'account' && renderAccount()}
           {activeTab === 'preferences' && renderPreferences()}
           {activeTab === 'notifications' && renderNotifications()}
           {activeTab === 'security' && renderSecurity()}
           {activeTab === 'support' && renderSupport()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
