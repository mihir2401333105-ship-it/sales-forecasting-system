import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CloudUpload,
  LineChart,
  Layers,
  BarChart3,
  Download,
  Workflow,
  Shield,
  Cpu,
  Database,
  Code2,
  Globe,
  Calendar,
  Play,
  Sparkles,
  Users,
  Mail,
  ExternalLink,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* Custom GitHub SVG Icon (not available in this lucide-react version) */
const GithubIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

/* ─── Reusable Section Header ─── */
const SectionHeader = ({ label, title, subtitle, light = false }) => (
  <div className="text-center mb-16 md:mb-20">
    {label && (
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`inline-block text-xs font-extrabold uppercase tracking-[0.2em] mb-4 px-4 py-1.5 rounded-full ${
          light
            ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
            : 'text-blue-600 bg-blue-50 border border-blue-100'
        }`}
      >
        {label}
      </motion.span>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] mb-5 font-display ${
        light ? 'text-white' : 'text-slate-900'
      }`}
    >
      {title}
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className={`text-lg md:text-xl font-medium max-w-2xl mx-auto px-4 leading-relaxed ${
        light ? 'text-slate-400' : 'text-slate-500'
      }`}
    >
      {subtitle}
    </motion.p>
  </div>
);

/* ─── Animated Counter ─── */
const AnimatedStat = ({ value, label, suffix = '' }) => (
  <div className="text-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="text-3xl md:text-4xl font-extrabold text-white font-display"
    >
      {value}{suffix}
    </motion.div>
    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">{label}</p>
  </div>
);

/* ─── Navbar ─── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-lg shadow-slate-200/20 border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-shadow">
            S
          </div>
          <span className="text-slate-900 font-bold text-xl tracking-tight font-display">
            Neuroforecast
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#tech-stack" className="hover:text-slate-900 transition-colors">Tech Stack</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden sm:inline-flex px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

/* ─── Main Landing Component ─── */
const Landing = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: BarChart3,
      title: 'Interactive Dashboards',
      desc: 'Visualize every metric with real-time, high-performance charts that update live as your data streams in.',
      color: 'from-blue-500 to-blue-600',
      highlight: 'bg-blue-500',
    },
    {
      icon: Calendar,
      title: 'Custom Forecast Horizons',
      desc: 'Predict anywhere from 7 days to 90 days into the future. Fine-tune your window to fit your business cycle.',
      color: 'from-indigo-500 to-indigo-600',
      highlight: 'bg-indigo-500',
    },
    {
      icon: Download,
      title: 'Export & Reporting',
      desc: 'Download polished reports as PDF or CSV. Share actionable insights with stakeholders in one click.',
      color: 'from-violet-500 to-violet-600',
      highlight: 'bg-violet-500',
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      desc: 'Your data is encrypted end-to-end with industry-standard protocols. We never share or sell your data.',
      color: 'from-emerald-500 to-emerald-600',
      highlight: 'bg-emerald-500',
    },
    {
      icon: Cpu,
      title: 'ML-Powered Precision',
      desc: 'State-of-the-art Random Forest and trend analysis models trained on your data for maximum accuracy.',
      color: 'from-amber-500 to-orange-500',
      highlight: 'bg-amber-500',
    },
    {
      icon: Globe,
      title: 'Cloud-Native Access',
      desc: 'Access your forecasts from anywhere. Secure cloud deployment means your entire team stays in sync.',
      color: 'from-rose-500 to-pink-500',
      highlight: 'bg-rose-500',
    },
  ];

  const teamMembers = [
    { name: 'Nirja Chorghe', role: 'Backend Developer', initials: 'NC', color: 'from-blue-500 to-indigo-600' },
    { name: 'Mihir Chaudhari', role: 'ML Engineer', initials: 'MC', color: 'from-violet-500 to-purple-600' },
    { name: 'Jeet Gawad', role: 'Frontend Developer', initials: 'JG', color: 'from-emerald-500 to-teal-600' },
    { name: 'Prasad Dalvi', role: 'Database Manager', initials: 'PD', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION — The Hook                            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-200px] left-[-300px] w-[900px] h-[900px] bg-blue-500 rounded-full blur-[180px] opacity-[0.07]" />
          <div className="absolute bottom-[-300px] right-[-200px] w-[1100px] h-[1100px] bg-indigo-500 rounded-full blur-[200px] opacity-[0.07]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400 rounded-full blur-[160px] opacity-[0.04]" />
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-xs font-extrabold uppercase tracking-[0.15em] border border-blue-100/80 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                AI Engine v4.0 is Live
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[0.95] tracking-tight text-slate-900 mb-8 font-display"
              >
                Smarter Sales.
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Better Forecasting.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10"
              >
                Upload your historical data and let our machine learning model
                predict your future sales trends with precision.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/auth"
                  id="cta-get-started"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  id="cta-view-demo"
                  className="group px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
                >
                  <Play className="w-5 h-5 text-blue-600" />
                  View Demo
                </button>
              </motion.div>

              {/* Trust Signal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 flex items-center gap-6 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500'].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 ${bg} rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}
                    >
                      {['M', 'A', 'R', 'S'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  <span className="text-slate-700 font-bold">Built by engineers</span> who care about data
                </p>
              </motion.div>
            </div>

            {/* Right: Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative">
                {/* Outer Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[52px] blur-2xl opacity-60" />

                {/* Device Frame */}
                <div className="relative bg-gradient-to-b from-slate-200 to-slate-300 rounded-[40px] p-1.5 shadow-2xl shadow-slate-400/30">
                  <div className="bg-slate-950 rounded-[34px] overflow-hidden">
                    {/* Browser Bar */}
                    <div className="flex items-center gap-2 px-5 py-3 bg-slate-900/80 border-b border-white/5">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-slate-800 rounded-lg py-1.5 px-4 text-[11px] text-slate-500 font-medium text-center">
                          neuroforecast.ai/dashboard
                        </div>
                      </div>
                    </div>
                    <img
                      src="/dashboard-mockup.png"
                      alt="Neuroforecast Dashboard — interactive analytics with real-time charts and KPIs"
                      className="w-full aspect-[1.5/1] object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Card — Live Metric */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-6 bg-white p-5 rounded-[24px] shadow-2xl shadow-slate-300/50 border border-slate-100 hidden lg:block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Live Accuracy
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 font-display">
                  94.2<span className="text-emerald-500 text-sm ml-1">%</span>
                </div>
                <div className="mt-3 flex gap-1">
                  {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: h / 4 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="w-2 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Card — Prediction */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -top-4 -right-4 bg-white p-4 rounded-[20px] shadow-2xl shadow-slate-300/50 border border-slate-100 hidden lg:block"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700">AI Prediction</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">Revenue next quarter</p>
                <p className="text-lg font-extrabold text-slate-900 font-display mt-0.5">
                  +24.1%{' '}
                  <span className="text-emerald-500 text-xs">▲</span>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. HOW IT WORKS — The Process                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 md:py-32 bg-gradient-to-b from-slate-50/80 to-white relative">
        <div className="container mx-auto px-6">
          <SectionHeader
            label="Simple Workflow"
            title="Three steps to smarter forecasting."
            subtitle="Our refined workflow handles the complex math while you focus on strategic decision making."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-5xl mx-auto relative">
            {/* Connector Line (desktop only) */}
            <div className="hidden md:block absolute top-[60px] left-[20%] right-[20%] h-[2px]">
              <div className="w-full h-full bg-gradient-to-r from-blue-200 via-indigo-200 to-violet-200 rounded-full" />
            </div>

            {[
              {
                icon: CloudUpload,
                title: 'Upload',
                desc: 'Securely import your historical sales data in CSV or Excel format.',
                gradient: 'from-blue-500 to-blue-600',
                shadow: 'shadow-blue-500/25',
                num: '01',
              },
              {
                icon: Workflow,
                title: 'Analyze',
                desc: 'Our engine processes the data and identifies hidden trends and patterns.',
                gradient: 'from-indigo-500 to-indigo-600',
                shadow: 'shadow-indigo-500/25',
                num: '02',
              },
              {
                icon: LineChart,
                title: 'Forecast',
                desc: 'Get actionable insights and interactive predictions for the coming months.',
                gradient: 'from-violet-500 to-violet-600',
                shadow: 'shadow-violet-500/25',
                num: '03',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div
                  className={`relative w-[120px] h-[120px] mb-8 flex items-center justify-center rounded-[36px] bg-gradient-to-br ${step.gradient} shadow-2xl ${step.shadow} group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300`}
                >
                  <step.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-2xl flex items-center justify-center font-extrabold text-slate-900 text-xs shadow-lg border border-slate-50 font-display">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 font-display">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-[280px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 3. KEY FEATURES — The Value                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[160px] opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <SectionHeader
            label="Powerful Features"
            title="Built for precision and speed."
            subtitle="Advanced features designed for modern sales teams who demand accuracy and actionable insights."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onMouseEnter={() => setActiveFeature(i)}
                className="relative p-8 md:p-10 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                {/* Hover Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feat.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 font-display">{feat.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed text-[15px]">{feat.desc}</p>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className={`bg-gradient-to-r ${feat.color} bg-clip-text text-transparent`}>
                      Learn More
                    </span>
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 4. BUILT BY / TECH STACK — The Architecture           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="tech-stack" className="py-24 md:py-32 bg-slate-950 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[200px] opacity-[0.08] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[180px] opacity-[0.06] translate-y-1/3 -translate-x-1/3" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <SectionHeader
            label="Under the Hood"
            title="The Technology Core"
            subtitle="Built with modern, high-performance technologies for resume-grade excellence."
            light
          />

          {/* Tech Stack Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
            {/* Left Column */}
            <div className="space-y-6">
              {[
                { icon: Layers, label: 'Frontend', tech: 'React + Tailwind', desc: 'Component-based UI with utility-first CSS' },
                { icon: Database, label: 'Backend', tech: 'FastAPI + Pandas', desc: 'High-performance Python API with data processing' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-5 items-start p-6 bg-white/[0.03] rounded-[24px] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
                >
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <item.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                    <h5 className="text-lg font-bold font-display">{item.tech}</h5>
                    <p className="text-slate-500 text-sm mt-1 font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Center — Animated Orb */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative w-64 h-64"
              >
                {/* Orbiting Ring */}
                <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
                <div className="absolute inset-4 rounded-full border border-white/[0.05]" />
                <div className="absolute inset-8 rounded-full border border-white/[0.03]" />

                {/* Spinning Dot */}
                <div className="absolute inset-0 animate-spin-slow">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_24px_rgba(59,130,246,0.9)]" />
                </div>
                <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '18s' }}>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_16px_rgba(129,140,248,0.8)]" />
                </div>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Code2 className="w-10 h-10 text-blue-400 mb-3" />
                  <div className="text-xl font-extrabold tracking-tight font-display">ENGINE.IO</div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1 font-bold">
                    ML Pipeline
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {[
                { icon: Cpu, label: 'ML Engine', tech: 'Scikit-Learn', desc: 'Random Forest & trend analysis models' },
                { icon: Workflow, label: 'Architecture', tech: 'Modular SaaS', desc: 'Scalable, maintainable component design' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-5 items-start p-6 bg-white/[0.03] rounded-[24px] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group md:flex-row-reverse md:text-right"
                >
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                    <item.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                    <h5 className="text-lg font-bold font-display">{item.tech}</h5>
                    <p className="text-slate-500 text-sm mt-1 font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-12 md:gap-20 py-10 px-8 bg-white/[0.02] rounded-[32px] border border-white/[0.06] max-w-3xl mx-auto mb-24"
          >
            <AnimatedStat value="94" suffix="%" label="Accuracy" />
            <AnimatedStat value="<2" suffix="s" label="Latency" />
            <AnimatedStat value="10K" suffix="+" label="Predictions" />
          </motion.div>

          {/* Team Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-6"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">The Team</span>
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-bold font-display">Meet the Builders</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 bg-white/[0.03] rounded-[28px] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${member.color} rounded-[24px] flex items-center justify-center text-white text-xl font-bold mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform font-display`}
                >
                  {member.initials}
                </div>
                <h4 className="text-lg font-bold font-display">{member.name}</h4>
                <p className="text-slate-500 text-sm font-medium mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CTA BANNER                                            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 font-display">
              Ready to see <br className="hidden sm:block" />the future of your sales?
            </h2>
            <p className="text-lg md:text-xl text-white/70 font-medium max-w-xl mx-auto mb-10">
              Start forecasting in under 2 minutes. No credit card required.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/auth"
                id="cta-final-get-started"
                className="group px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/mihir2401333105-ship-it/sales-forecasting-system"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <GithubIcon className="w-5 h-5" />
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 5. FOOTER                                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <footer className="py-16 bg-slate-950 text-white border-t border-white/[0.06]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-600/30">
                S
              </div>
              <span className="text-white font-bold text-xl tracking-tight font-display">
                Neuroforecast
              </span>
            </div>

            {/* Links */}
            <div className="flex gap-10 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">About Us</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="mailto:contact@neuroforecast.ai" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Contact
              </a>
            </div>

            {/* Social */}
            <div className="flex gap-4">
              <a
                href="https://github.com/mihir2401333105-ship-it/sales-forecasting-system"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white hover:text-slate-900 transition-all border border-white/[0.06] hover:border-transparent"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white hover:text-slate-900 transition-all border border-white/[0.06] hover:border-transparent"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
              © 2026 Neuroforecast • Built for high-impact performance
            </p>
            <div className="flex gap-6 text-xs text-slate-600 font-medium">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
