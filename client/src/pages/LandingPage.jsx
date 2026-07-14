import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineSparkles, 
  HiOutlineBadgeCheck, 
  HiOutlineClipboardList, 
  HiOutlineBell, 
  HiOutlineChatAlt2, 
  HiOutlineSearch,
  HiOutlineArrowRight,
  HiOutlineAcademicCap,
  HiOutlineTrendingUp,
  HiCheck
} from 'react-icons/hi';
import { FaGraduationCap, FaQuoteLeft, FaStar, FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';

// Sample scholarships for the interactive matching showcase
const SAMPLE_SCHOLARSHIPS = [
  {
    id: 1,
    title: 'STEM Leaders of Tomorrow Award',
    amount: '$15,000',
    matchScore: 98,
    tags: ['STEM', 'GPA 3.7+', 'Engineering', 'Tech'],
    deadline: 'In 12 Days',
    requirements: 'GPA 3.7+, STEM Majors'
  },
  {
    id: 2,
    title: 'Vanguard Female Founders Fund',
    amount: '$10,000',
    matchScore: 96,
    tags: ['Business', 'Female', 'GPA 3.5+'],
    deadline: 'In 3 Weeks',
    requirements: 'Female students in Business/Tech'
  },
  {
    id: 3,
    title: 'Global Citizen Scholarship',
    amount: '$8,000',
    matchScore: 92,
    tags: ['Any Major', 'Community', 'Essay'],
    deadline: 'Next Month',
    requirements: 'Community service record, 500w Essay'
  },
  {
    id: 4,
    title: 'Ascend Arts & Humanities Endowment',
    amount: '$12,000',
    matchScore: 89,
    tags: ['Arts', 'Creative', 'GPA 3.2+'],
    deadline: 'In 2 Months',
    requirements: 'Art, Design, or Literature Majors'
  },
  {
    id: 5,
    title: 'First-Gen Scholars Initiative',
    amount: '$20,000',
    matchScore: 95,
    tags: ['First-Gen', 'Financial Need', 'GPA 3.0+'],
    deadline: 'In 18 Days',
    requirements: 'First-generation college students'
  }
];

const PRESETS = [
  { name: 'Sarah (STEM, 3.9 GPA)', major: 'Computer Science', gpa: '3.9', gender: 'female', tags: ['STEM', 'Tech', 'Female'] },
  { name: 'Marcus (Arts, 3.4 GPA)', major: 'Fine Arts', gpa: '3.4', gender: 'male', tags: ['Arts', 'Creative'] },
  { name: 'Sofia (Business, 3.6 GPA)', major: 'Finance', gpa: '3.6', gender: 'female', tags: ['Business', 'Female', 'First-Gen'] }
];

const LandingPage = () => {
  const { isDarkMode } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [customMajor, setCustomMajor] = useState('');
  const [customGPA, setCustomGPA] = useState('');
  const [matchedList, setMatchedList] = useState([]);
  const [animatingMatch, setAnimatingMatch] = useState(false);

  // Compute scholarship match scores dynamically based on active tags
  useEffect(() => {
    setAnimatingMatch(true);
    const timer = setTimeout(() => {
      const filtered = SAMPLE_SCHOLARSHIPS.map(sch => {
        let baseScore = sch.matchScore;
        // Adjust score based on tags
        const matchingTags = sch.tags.filter(tag => 
          selectedPreset.tags.includes(tag) || 
          tag.toLowerCase().includes(selectedPreset.major.toLowerCase())
        );
        
        // Custom GPA matching
        const gpaNum = parseFloat(selectedPreset.gpa);
        if (sch.requirements.includes('GPA 3.7+') && gpaNum < 3.7) baseScore -= 20;
        if (sch.requirements.includes('GPA 3.5+') && gpaNum < 3.5) baseScore -= 15;
        if (sch.requirements.includes('GPA 3.2+') && gpaNum < 3.2) baseScore -= 15;

        // Add bonus for tag match
        baseScore += matchingTags.length * 5;
        baseScore = Math.min(99, Math.max(45, baseScore));

        return { ...sch, dynamicScore: baseScore };
      }).sort((a, b) => b.dynamicScore - a.dynamicScore);

      setMatchedList(filtered);
      setAnimatingMatch(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedPreset]);

  const handleCustomMatch = (e) => {
    e.preventDefault();
    if (!customMajor || !customGPA) return;
    
    // Create new profile preset
    const newPreset = {
      name: `Custom Profile (${customMajor})`,
      major: customMajor,
      gpa: customGPA,
      gender: 'any',
      tags: [customMajor.length > 5 ? 'STEM' : 'Arts', parseFloat(customGPA) >= 3.5 ? 'GPA 3.5+' : 'GPA 3.0+']
    };
    setSelectedPreset(newPreset);
  };

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100" id="home">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-primary-500/10 to-secondary-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-gradient-to-br from-secondary-500/10 to-primary-500/10 blur-[120px] pointer-events-none" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div 
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-slate-200 dark:border-slate-800 text-xs font-semibold text-primary-700 dark:text-primary-400 bg-white/50 dark:bg-slate-900/50 shadow-sm">
              <HiOutlineSparkles className="w-4 h-4 text-secondary-500 animate-pulse" />
              <span>Next-Gen Scholarship Matching Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Find Scholarships <br />
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-500 bg-clip-text text-transparent">
                Smarter with AI
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-350 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Helping Every Student Find the Right Scholarship. ScholarAI helps students discover scholarships based on eligibility, academic profile, income, and location using AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <a 
                href="#scholarships" 
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#scholarships')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Explore Scholarships
                <HiOutlineArrowRight className="w-5 h-5" />
              </a>
              <a 
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Get Started
              </a>
            </div>

            {/* Micro Stats Banner */}
            <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center lg:justify-start gap-8 text-slate-500 dark:text-slate-400 text-sm">
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-bold text-slate-800 dark:text-white text-lg">95%</span>
                <span>Match Accuracy</span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-bold text-slate-800 dark:text-white text-lg">24/7</span>
                <span>AI Guidance</span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-bold text-slate-800 dark:text-white text-lg">Free</span>
                <span>For All Students</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Right Content - Interactive AI Matcher Dashboard */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative glass border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 rounded-3xl p-6 shadow-2xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/10">
                    <FaGraduationCap />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">ScholarAI Matcher</h3>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      Ready to Scan
                    </span>
                  </div>
                </div>
                {/* Profile selector presets */}
                <div className="flex gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedPreset(preset)}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                        selectedPreset.name === preset.name
                          ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {preset.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Score & Input Status Row */}
              <div className="grid grid-cols-12 gap-4 py-5 items-center">
                <div className="col-span-7 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate Profile</span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Major: <span className="text-primary-600 dark:text-primary-400 font-normal">{selectedPreset.major}</span></p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">GPA: <span className="text-secondary-600 dark:text-secondary-400 font-normal">{selectedPreset.gpa}</span></p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedPreset.tags.map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 font-medium">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-5 flex flex-col items-center justify-center border-l border-slate-100 dark:border-slate-800">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* SVG Circular Progress */}
                    <svg className="w-full h-full transform -rotate-95">
                      <circle cx="40" cy="40" r="32" stroke={isDarkMode ? "#334155" : "#e2e8f0"} strokeWidth="6" fill="transparent" />
                      <motion.circle 
                        cx="40" 
                        cy="40" 
                        r="32" 
                        stroke="url(#heroGrad)" 
                        strokeWidth="6" 
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 32}
                        animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - (matchedList[0]?.dynamicScore || 90) / 100) }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.span 
                          key={matchedList[0]?.dynamicScore}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-lg font-black text-slate-900 dark:text-white leading-none"
                        >
                          {matchedList[0]?.dynamicScore || 90}%
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[9px] text-slate-400 font-bold tracking-tight">Best Match</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic matched list with Framer Motion layout */}
              <div className="space-y-3 relative min-h-[220px]">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Matched Scholarships</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-550">Total matched: {matchedList.length}</span>
                </div>

                <AnimatePresence mode="popLayout">
                  {matchedList.slice(0, 3).map((sch, index) => (
                    <motion.div
                      key={sch.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        index === 0 
                          ? 'bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-950/20 dark:to-secondary-950/20 border-primary-100 dark:border-primary-900 shadow-sm'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-100 dark:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{sch.title}</h4>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-400">Deadline: {sch.deadline}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">{sch.requirements}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-extrabold text-slate-950 dark:text-white">{sch.amount}</div>
                          <div className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded inline-block mt-1">
                            {sch.dynamicScore}% Match
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {animatingMatch && (
                  <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                  </div>
                )}
              </div>

              {/* Interactive Match Form */}
              <form onSubmit={handleCustomMatch} className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={customMajor}
                    onChange={(e) => setCustomMajor(e.target.value)}
                    placeholder="Enter Major (e.g. Bio)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="4.0"
                    value={customGPA}
                    onChange={(e) => setCustomGPA(e.target.value)}
                    placeholder="GPA (e.g. 3.7)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="col-span-3 text-[11px] font-bold py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-sm transition-all"
                >
                  Match
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STATISTICS SECTION ================= */}
      <section className="py-12 bg-gradient-to-r from-primary-900 to-indigo-950 text-white relative shadow-inner overflow-hidden">
        {/* Subtle grid patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stat Item 1 */}
            <motion.div 
              className="dark-glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-4 group"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                <HiOutlineAcademicCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">1000+</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verified Scholarships</p>
              </div>
            </motion.div>

            {/* Stat Item 2 */}
            <motion.div 
              className="dark-glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-4 group"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary-500/20 flex items-center justify-center text-secondary-400 group-hover:scale-110 transition-transform">
                <HiOutlineSparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">50K+</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Students</p>
              </div>
            </motion.div>

            {/* Stat Item 3 */}
            <motion.div 
              className="dark-glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-4 group"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <HiOutlineTrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">95%</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Matching Accuracy</p>
              </div>
            </motion.div>

            {/* Stat Item 4 */}
            <motion.div 
              className="dark-glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-4 group"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <HiOutlineChatAlt2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">24/7</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AI Assistant</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="scholarships">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 text-xs font-semibold text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50">
            <span>Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Supercharge Your Scholarship Search
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-md leading-relaxed">
            ScholarAI is packed with tools designed to streamline the process of finding, matching, and applying for scholarships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: AI Recommendations */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 group"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-primary-500/10 group-hover:scale-110 transition-transform duration-300">
              <HiOutlineSparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">AI Recommendations</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
              Personalized matches calculated in seconds, scanning thousands of scholarship requirements with natural language understanding.
            </p>
          </motion.div>

          {/* Card 2: Eligibility Checker */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 group"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-secondary-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-300">
              <HiOutlineBadgeCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Eligibility Checker</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
              Instantly see where you fit. Our engine maps your academic standing, demographic data, and income against strict rules.
            </p>
          </motion.div>

          {/* Card 3: Application Tracker */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 group"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-secondary-500 to-pink-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-secondary-500/10 group-hover:scale-110 transition-transform duration-300">
              <HiOutlineClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">Application Tracker</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
              Keep all your submissions organized in one centralized dashboard. Track dates, document status, and required references.
            </p>
          </motion.div>

          {/* Card 4: Deadline Notifications */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 group"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-pink-500/10 group-hover:scale-110 transition-transform duration-300">
              <HiOutlineBell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-450 transition-colors">Deadline Notifications</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
              Never miss a deadline. Receive automated email and SMS reminders when scholarship closing dates are approaching.
            </p>
          </motion.div>

          {/* Card 5: AI Chatbot */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 group"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-rose-500/10 group-hover:scale-110 transition-transform duration-300">
              <HiOutlineChatAlt2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">AI Chatbot</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
              Ask questions about eligibility criteria, get help drafting scholarship essay outlines, and find answers to application questions.
            </p>
          </motion.div>

          {/* Card 6: Scholarship Search */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 group"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-amber-500/10 group-hover:scale-110 transition-transform duration-300">
              <HiOutlineSearch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Scholarship Search</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
              Advanced filters let you sort by GPA, degree type, funding size, location, and key demographic markers quickly and easily.
            </p>
          </motion.div>

        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION (TIMELINE) ================= */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-800/80" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-50 dark:bg-secondary-950/30 text-xs font-semibold text-secondary-700 dark:text-secondary-400 border border-secondary-100 dark:border-secondary-900/50">
              <span>Timeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              How ScholarAI Works
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-md leading-relaxed">
              Get matched and submit applications in four simple steps. Let AI take care of the heavy lifting.
            </p>
          </div>

          {/* Timeline Process */}
          <div className="relative">
            {/* Center Line for Desktop Timeline */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 via-indigo-400 to-secondary-400" />

            <div className="space-y-12 lg:space-y-20 relative">
              
              {/* Step 1 */}
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="w-full lg:w-[45%] text-center lg:text-right space-y-3 order-2 lg:order-1">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-widest uppercase">Step 01</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Profile</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto lg:mr-0 leading-relaxed">
                      Enter your background details, academic major, GPA, financial status, and location. This forms the foundation of your matching score.
                    </p>
                  </motion.div>
                </div>
                {/* Center Badge */}
                <div className="z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-extrabold border-4 border-slate-50 dark:border-slate-900 shadow-md order-1 lg:order-2 my-4 lg:my-0">
                  1
                </div>
                <div className="hidden lg:block w-full lg:w-[45%] order-3" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="hidden lg:block w-full lg:w-[45%] order-1" />
                {/* Center Badge */}
                <div className="z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-extrabold border-4 border-slate-50 dark:border-slate-900 shadow-md order-1 lg:order-2 my-4 lg:my-0">
                  2
                </div>
                <div className="w-full lg:w-[45%] text-center lg:text-left space-y-3 order-2 lg:order-3">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Step 02</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Matches Scholarships</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto lg:ml-0 leading-relaxed">
                      Our advanced matching algorithm scans thousands of scholarships, giving you a custom score based on how well you meet their criteria.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="w-full lg:w-[45%] text-center lg:text-right space-y-3 order-2 lg:order-1">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase">Step 03</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Apply Seamlessly</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto lg:mr-0 leading-relaxed">
                      Use AI assistance to outline outlines, draft letters of recommendation, and write scholarship essays that speak directly to the selection committee.
                    </p>
                  </motion.div>
                </div>
                {/* Center Badge */}
                <div className="z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center text-white font-extrabold border-4 border-slate-50 dark:border-slate-900 shadow-md order-1 lg:order-2 my-4 lg:my-0">
                  3
                </div>
                <div className="hidden lg:block w-full lg:w-[45%] order-3" />
              </div>

              {/* Step 4 */}
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="hidden lg:block w-full lg:w-[45%] order-1" />
                {/* Center Badge */}
                <div className="z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-secondary-600 to-secondary-400 flex items-center justify-center text-white font-extrabold border-4 border-slate-50 dark:border-slate-900 shadow-md order-1 lg:order-2 my-4 lg:my-0">
                  4
                </div>
                <div className="w-full lg:w-[45%] text-center lg:text-left space-y-3 order-2 lg:order-3">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-xs font-bold text-secondary-600 dark:text-secondary-400 tracking-widest uppercase">Step 04</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Track & Win</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto lg:ml-0 leading-relaxed">
                      Follow application statuses from "Draft" to "Submitted" to "Awarded." Set custom alarms so you know the second results go public.
                    </p>
                  </motion.div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            <span>Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Loved by Students Nationwide
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-md leading-relaxed">
            Discover how high school and college students secured thousands in funding using ScholarAI's matching engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 relative group flex flex-col justify-between"
            whileHover={{ y: -6 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="space-y-4">
              <div className="flex gap-1 text-amber-400">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed relative z-10 font-normal">
                "ScholarAI found a Stem scholarship I didn't even know existed. The AI matched my GPA and major, and within 3 weeks, I was awarded $15,000 to cover my tuition. The matching accuracy is insane!"
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                alt="Sarah Jenkins" 
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 dark:border-primary-900"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sarah Jenkins</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Computer Science at Georgia Tech</p>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold inline-block mt-1">
                  $15,000 Matched
                </span>
              </div>
            </div>
            
            <FaQuoteLeft className="absolute right-6 top-6 text-slate-100 dark:text-slate-800/40 w-12 h-12 pointer-events-none" />
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 relative group flex flex-col justify-between"
            whileHover={{ y: -6 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-4">
              <div className="flex gap-1 text-amber-400">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed relative z-10 font-normal">
                "Writing scholarship essays used to take me days. With the AI chatbot assistance, I was able to generate solid outlines and refine my drafts in under an hour. I applied to 12 scholarships and won 3!"
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                alt="Marcus Vance" 
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 dark:border-primary-900"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Marcus Vance</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Creative Writing at NYU</p>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold inline-block mt-1">
                  $12,000 Matched
                </span>
              </div>
            </div>
            
            <FaQuoteLeft className="absolute right-6 top-6 text-slate-100 dark:text-slate-800/40 w-12 h-12 pointer-events-none" />
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className="glass border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 relative group flex flex-col justify-between"
            whileHover={{ y: -6 }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="space-y-4">
              <div className="flex gap-1 text-amber-400">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed relative z-10 font-normal">
                "Being a first-generation college student, navigating financial aid was intimidating. ScholarAI broke down every step, tracked all my deadlines, and recommended needs-based awards that saved my semester."
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" 
                alt="Sofia Rodriguez" 
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 dark:border-primary-900"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sofia Rodriguez</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Finance at UT Austin</p>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold inline-block mt-1">
                  $20,000 Matched
                </span>
              </div>
            </div>
            
            <FaQuoteLeft className="absolute right-6 top-6 text-slate-100 dark:text-slate-800/40 w-12 h-12 pointer-events-none" />
          </motion.div>

        </div>
      </section>

      {/* ================= CALL TO ACTION SECTION ================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="contact">
        <motion.div 
          className="rounded-3xl p-8 md:p-12 bg-gradient-to-tr from-primary-600 to-secondary-500 text-white relative shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative circular blob */}
          <div className="absolute top-[-50%] right-[-20%] w-[60%] h-[150%] rounded-full bg-white/5 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Find Your Match?</h2>
              <p className="text-white/80 text-sm sm:text-md max-w-xl">
                Create a profile today and let our AI scanner search thousands of scholarship programs. No credit card required.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
              <input
                type="email"
                placeholder="Enter your student email"
                className="px-4 py-3.5 rounded-xl text-slate-800 dark:text-white bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-300 dark:focus:ring-secondary-600 w-full sm:max-w-xs"
              />
              <button
                className="px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 dark:hover:bg-slate-800 border border-transparent dark:border-slate-700 text-white font-bold text-sm shadow-md transition-all whitespace-nowrap"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
