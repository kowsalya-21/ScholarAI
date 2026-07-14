import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiBookmark, FiFileText, FiClock, 
  FiArrowRight, FiUserCheck, FiSearch, FiSliders, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import { HiOutlineSparkles, HiOutlineAcademicCap, HiOutlineUser, HiOutlineChatAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';

const sampleScholarships = [
  {
    _id: 'sample-1',
    title: 'Google Generation Scholarship',
    provider: 'Google Inc.',
    scholarshipAmount: 10000,
    eligibilityCriteria: 'Computer Science undergraduate student, min 3.0 GPA',
    applicationDeadline: '2026-08-31T00:00:00.000Z',
    category: 'CS',
    educationLevel: 'Undergraduate',
  },
  {
    _id: 'sample-2',
    title: 'Microsoft Tuition Scholarship',
    provider: 'Microsoft Corporation',
    scholarshipAmount: 15000,
    eligibilityCriteria: 'STEM undergraduate, leadership potential, min 3.5 CGPA',
    applicationDeadline: '2026-09-15T00:00:00.000Z',
    category: 'STEM',
    educationLevel: 'Undergraduate',
  },
  {
    _id: 'sample-3',
    title: 'AI Excellence Scholarship',
    provider: 'Future Tech Foundation',
    scholarshipAmount: 20000,
    eligibilityCriteria: 'Graduate student specializing in AI/ML or Computer Science',
    applicationDeadline: '2026-10-10T00:00:00.000Z',
    category: 'AI/ML',
    educationLevel: 'Undergraduate',
  }
];

const sampleApplications = [
  {
    id: 'sample-app-1',
    scholarship: 'Google Generation Scholarship',
    status: 'Under Review',
    appliedDate: '2026-06-20',
    statusColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  },
  {
    id: 'sample-app-2',
    scholarship: 'Microsoft Tuition Scholarship',
    status: 'Applied',
    appliedDate: '2026-06-28',
    statusColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  }
];

const sampleDeadlines = [
  {
    id: 'sample-dl-1',
    title: 'Google Generation Scholarship',
    date: '2026-08-31',
    status: 'Upcoming',
    daysLeft: 54,
    color: 'border-blue-500 bg-blue-500/10 text-blue-600'
  },
  {
    id: 'sample-dl-2',
    title: 'Microsoft Tuition Scholarship',
    date: '2026-09-15',
    status: 'Upcoming',
    daysLeft: 69,
    color: 'border-amber-500 bg-amber-500/10 text-amber-600'
  }
];

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // Dynamic user and stats data states
  const [user, setUser] = useState(null);
  const [dbData, setDbData] = useState({
    recommendedCount: 0,
    savedCount: 0,
    appliedCount: 0,
    upcomingCount: 0,
    matchingStrength: 0,
    recommendedList: [],
    recentApplications: [],
    upcomingDeadlines: []
  });
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [appliedScholarships, setAppliedScholarships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync data with database on mount
  useEffect(() => {
    const loadAndSyncData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = token ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        } : {};

        // 1. Fetch authenticated user profile
        let userData = null;
        try {
          const meRes = await axios.get('/api/auth/me', config);
          userData = meRes.data.user;
          setUser(userData);
        } catch (meErr) {
          console.warn('Profile fetch failed, using guest defaults:', meErr);
        }

        // 2. Read local state
        let localSaved = [];
        let localApplied = [];
        try {
          const savedStr = localStorage.getItem('savedScholarships');
          localSaved = savedStr ? JSON.parse(savedStr) : [];
          
          const appliedStr = localStorage.getItem('scholarshipApplications');
          localApplied = appliedStr ? JSON.parse(appliedStr) : [];
        } catch (e) {
          console.error('Error reading localStorage:', e);
        }

        setSavedScholarships(localSaved);
        setAppliedScholarships(localApplied.map(app => app.id));

        // 3. Sync with database
        if (token) {
          try {
            const syncRes = await axios.post('/api/users/dashboard/sync', {
              savedIds: localSaved,
              applications: localApplied
            }, config);

            if (syncRes.data && syncRes.data.success) {
              setDbData(syncRes.data.data);
            }
          } catch (syncErr) {
            console.warn('Dashboard sync failed, using defaults:', syncErr);
          }
        }
      } catch (err) {
        console.error('General error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndSyncData();
  }, []);

  // Format currency amount based on scholarship values
  const formatAmount = (amount, title, provider) => {
    const isUSD = amount < 25000 && !/India|Ministry|Govt|National|Post Matric|MOMA|ONGC|Tata|HDFC|Reliance/i.test(title + ' ' + provider);
    if (isUSD) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    } else {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    }
  };

  // Toggle Save Scholarship Action
  const handleSave = async (id, title) => {
    let updatedSaved = [];
    if (savedScholarships.includes(id)) {
      updatedSaved = savedScholarships.filter(item => item !== id);
      toast.success(`Removed "${title}" from saved list.`);
    } else {
      updatedSaved = [...savedScholarships, id];
      toast.success(`Saved "${title}" successfully!`, { icon: '🔖' });
    }
    
    setSavedScholarships(updatedSaved);
    localStorage.setItem('savedScholarships', JSON.stringify(updatedSaved));

    try {
      let localApplied = [];
      try {
        const appliedStr = localStorage.getItem('scholarshipApplications');
        localApplied = appliedStr ? JSON.parse(appliedStr) : [];
      } catch (e) {}

      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const syncRes = await axios.post('/api/users/dashboard/sync', {
        savedIds: updatedSaved,
        applications: localApplied
      }, config);
      if (syncRes.data && syncRes.data.success) {
        setDbData(syncRes.data.data);
      }
    } catch (err) {
      console.error('Failed to sync saved status:', err);
    }
  };

  // Simulate Application Submission
  const handleApply = async (id, title, provider) => {
    let localApplied = [];
    try {
      const appliedStr = localStorage.getItem('scholarshipApplications');
      localApplied = appliedStr ? JSON.parse(appliedStr) : [];
    } catch (e) {}

    const exists = localApplied.some(app => app.scholarshipName === title);
    if (exists) {
      toast.error(`You have already applied for "${title}".`);
      return;
    }

    const newApp = {
      id: `app-${Date.now()}`,
      scholarshipName: title,
      provider: provider,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied'
    };

    const updatedApplied = [newApp, ...localApplied];
    localStorage.setItem('scholarshipApplications', JSON.stringify(updatedApplied));
    setAppliedScholarships(updatedApplied.map(a => a.id));

    toast.success(`Application initiated for "${title}"! Redirecting to portals...`, { icon: '🚀' });

    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const syncRes = await axios.post('/api/users/dashboard/sync', {
        savedIds: savedScholarships,
        applications: updatedApplied
      }, config);
      if (syncRes.data && syncRes.data.success) {
        setDbData(syncRes.data.data);
      }
    } catch (err) {
      console.error('Failed to sync applied status:', err);
    }
  };

  // Determine if we should show fallback default values based on lack of activity
  const showDefaults = dbData.recommendedCount === 0 && dbData.savedCount === 0 && dbData.appliedCount === 0;

  const displayRecommendedCount = showDefaults ? 12 : (dbData.recommendedCount ?? 12);
  const displaySavedCount = showDefaults ? 2 : (dbData.savedCount ?? 2);
  const displayAppliedCount = showDefaults ? 3 : (dbData.appliedCount ?? 3);
  const displayUpcomingCount = showDefaults ? 2 : (dbData.upcomingCount ?? 2);
  const displayMatchingStrength = showDefaults ? 98.2 : (dbData.matchingStrength ?? 98.2);

  const recommendedList = showDefaults ? sampleScholarships : dbData.recommendedList;
  const recentApplications = showDefaults ? sampleApplications : dbData.recentApplications;
  const upcomingDeadlines = showDefaults ? sampleDeadlines : dbData.upcomingDeadlines;

  // Stats Configuration
  const stats = [
    { 
      name: 'Recommended Scholarships', 
      value: displayRecommendedCount, 
      desc: 'Based on your profile matching', 
      icon: HiOutlineSparkles, 
      color: 'text-primary-600 bg-primary-50 border-primary-100' 
    },
    { 
      name: 'Saved Scholarships', 
      value: displaySavedCount, 
      desc: 'Bookmarked opportunities', 
      icon: FiBookmark, 
      color: 'text-purple-600 bg-purple-50 border-purple-100' 
    },
    { 
      name: 'Applications Submitted', 
      value: displayAppliedCount, 
      desc: 'In progress and submitted', 
      icon: FiFileText, 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100' 
    },
    { 
      name: 'Upcoming Deadlines', 
      value: displayUpcomingCount, 
      desc: 'Closing within 30 days', 
      icon: FiClock, 
      color: 'text-rose-600 bg-rose-50 border-rose-100' 
    },
  ];

  // Quick Action List configuration
  const quickActions = [
    {
      title: 'Browse Scholarships',
      desc: 'Explore the full listing of active scholarship funds.',
      icon: HiOutlineAcademicCap,
      color: 'from-blue-500/10 to-indigo-500/10 hover:from-blue-500 hover:to-indigo-600 group-hover:text-white',
      iconColor: 'text-blue-600 bg-blue-100 group-hover:bg-white/20 group-hover:text-white',
      action: () => {
        toast.success('Navigating to Scholarship Directory...');
        navigate('/scholarships');
      }
    },
    {
      title: 'Complete Profile',
      desc: 'Enhance academic detail to unlock higher matching chances.',
      icon: FiUserCheck,
      color: 'from-purple-500/10 to-fuchsia-500/10 hover:from-purple-500 hover:to-fuchsia-600',
      iconColor: 'text-purple-600 bg-purple-100 group-hover:bg-white/20 group-hover:text-white',
      action: () => {
        toast.success('Navigating to Academic Profile...');
        navigate('/profile');
      }
    },
    {
      title: 'Track Applications',
      desc: 'Real-time workflow monitoring of current applications.',
      icon: FiFileText,
      color: 'from-emerald-500/10 to-teal-500/10 hover:from-emerald-500 hover:to-teal-600',
      iconColor: 'text-emerald-600 bg-emerald-100 group-hover:bg-white/20 group-hover:text-white',
      action: () => {
        toast.success('Navigating to Application Tracker...');
        navigate('/applications');
      }
    },
    {
      title: 'Ask AI Assistant',
      desc: 'Resolve application queries and seek matching advice.',
      icon: HiOutlineChatAlt2,
      color: 'from-pink-500/10 to-rose-500/10 hover:from-pink-500 hover:to-rose-600',
      iconColor: 'text-pink-600 bg-pink-100 group-hover:bg-white/20 group-hover:text-white',
      action: () => {
        toast.success('Opening AI Assistant...');
        navigate('/chatbot');
      }
    }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-semibold animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Top Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-500 rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-primary-500/15 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,#ffffff,transparent_60%)]" />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
              <HiOutlineSparkles className="text-amber-300 text-sm animate-pulse" />
              SaaS matching engine active
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {showDefaults ? 'Welcome back, Student 👋' : `Welcome back, ${user?.fullName || 'Student'} 👋`}
            </h1>
            {!showDefaults && user && (
              <p className="text-white/80 text-xs font-bold tracking-wide">
                {user.course} | {user.college} | {user.year}
              </p>
            )}
            <p className="text-slate-100/90 text-sm max-w-xl font-medium pt-1">
              {showDefaults 
                ? 'We have analyzed 150+ new scholarships based on your profile.' 
                : `We found ${displayRecommendedCount} scholarships matching your ${user?.course || 'course'} profile.`}
            </p>
          </div>

          <motion.div 
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-900 shadow-md">
              <HiOutlineSparkles className="text-xl" />
            </div>
            <div>
              <span className="block text-[10px] text-white/70 font-semibold uppercase tracking-wider">AI Matching Strength</span>
              <span className="block text-sm font-black text-white">{displayMatchingStrength}% Perfect Fit</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{stat.name}</span>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white block tracking-tight">{stat.value}</span>
                <span className="text-[10px] font-semibold text-slate-400 block">{stat.desc}</span>
              </div>
              <div className={`p-4 rounded-2xl border ${stat.color} flex-shrink-0 shadow-sm`}>
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid Section (Left: Recommended Scholarships & Applications Table, Right: AI Card, Timeline & Actions) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Side: 2/3 width */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Recommended Scholarships Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recommended Scholarships</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Top recommendation scores matching your profile details</p>
              </div>
              <motion.button 
                onClick={() => {
                  toast.success('Displaying filter dashboard...');
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-250 text-xs font-bold transition-all shadow-sm"
              >
                <FiSliders />
                <span>Filters</span>
              </motion.button>
            </div>

            {/* 6 Beautiful Scholarship Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedList.length === 0 ? (
                <div className="md:col-span-2 border border-dashed border-slate-250/60 dark:border-slate-800/80 rounded-[28px] p-8 text-center bg-white/50 dark:bg-slate-900/50">
                  <FiInfo className="mx-auto w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No matching scholarships found matching your profile criteria.</p>
                </div>
              ) : (
                recommendedList.map((sch, idx) => {
                  const isSaved = savedScholarships.includes(sch._id);
                  const isApplied = recentApplications.some(app => app.scholarship === sch.title);
                  
                  const diffTime = new Date(sch.applicationDeadline) - new Date();
                  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                  const tags = [sch.category, sch.educationLevel].filter(t => t && t !== 'All');

                  return (
                    <motion.div
                      key={sch._id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden bg-clip-padding"
                    >
                      {/* Glowing Accent Ring on Hover */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/20 dark:group-hover:border-primary-500/40 rounded-[28px] pointer-events-none transition-all duration-300" />
                      
                      <div>
                        {/* Top Row: Tags & Save Button */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map(tag => (
                              <span key={tag} className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-primary-600/5 to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 text-primary-600 dark:text-primary-400 text-[9px] font-extrabold uppercase tracking-wider border border-primary-500/10 dark:border-primary-500/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          {/* Save Button */}
                          <motion.button
                            onClick={() => handleSave(sch._id, sch.title)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2.5 rounded-xl border transition-all shadow-sm ${
                              isSaved 
                                ? 'bg-amber-400/10 border-amber-400/30 text-amber-500' 
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-355 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <FiBookmark className={isSaved ? 'fill-current' : 'text-lg'} />
                          </motion.button>
                        </div>

                        {/* Header Info */}
                        <div className="mt-4">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">{sch.provider}</span>
                          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {sch.title}
                          </h3>
                        </div>

                        {/* Details Box */}
                        <div className="mt-4 p-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100/50 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">Grant Value</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                              {formatAmount(sch.scholarshipAmount, sch.title, sch.provider)}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold block">Eligibility criteria:</span>
                            <p className="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed line-clamp-2">
                              {sch.eligibilityCriteria || sch.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <FiClock className={`text-xs ${daysLeft <= 30 ? 'text-rose-500 animate-pulse' : ''}`} />
                          <span className={daysLeft <= 30 ? 'text-rose-500 font-black' : ''}>
                            {daysLeft} days left
                          </span>
                        </div>
                        
                        <motion.button
                          onClick={() => handleApply(sch._id, sch.title, sch.provider)}
                          whileHover={!isApplied ? { scale: 1.03 } : {}}
                          whileTap={!isApplied ? { scale: 0.97 } : {}}
                          className={`px-4.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                            isApplied 
                              ? 'bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200/30 dark:border-emerald-900/40 cursor-default font-black' 
                              : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:opacity-95 shadow-md shadow-primary-500/10'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <FiCheckCircle className="text-xs" />
                              <span>Applied</span>
                            </>
                          ) : (
                            <span>Apply Now</span>
                          )}
                        </motion.button>
                      </div>

                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Applications professional table */}
          <div className="space-y-5 pt-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recent Applications</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Verify submission logs and real-time review updates</p>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-[28px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4.5 px-6">Scholarship</th>
                      <th className="py-4.5 px-6 text-center">Status</th>
                      <th className="py-4.5 px-6 text-right">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    {recentApplications.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-slate-400 font-semibold">
                          No submitted applications found.
                        </td>
                      </tr>
                    ) : (
                      recentApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/30 transition-colors">
                          <td className="py-4.5 px-6 font-extrabold text-slate-800 dark:text-slate-200">{app.scholarship}</td>
                          <td className="py-4.5 px-6 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold ${app.statusColor}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-right text-slate-400 dark:text-slate-500">{app.appliedDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: 1/3 width */}
        <div className="space-y-8">
          
          {/* AI Recommendation Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative bg-gradient-to-br from-purple-900/90 to-indigo-950/90 backdrop-blur-md border border-purple-500/20 rounded-[30px] p-6 text-white shadow-xl shadow-purple-900/10 overflow-hidden"
          >
            {/* Ambient Purple Light Effect */}
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-purple-500/20 blur-xl" />
            <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-indigo-500/20 blur-xl" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/35 border border-purple-400/30 flex items-center justify-center text-purple-200">
                  <HiOutlineSparkles className="text-lg text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <h3 className="text-base font-extrabold tracking-tight">AI Recommendations</h3>
              </div>

              <p className="text-slate-200/90 text-xs leading-relaxed font-medium">
                Based on your academic profile, you are eligible for <span className="text-amber-300 font-extrabold">{displayRecommendedCount} scholarships</span>.
              </p>

              <motion.button
                onClick={() => {
                  navigate('/recommendations');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/10 text-xs flex items-center justify-center gap-2 border border-white/10"
              >
                <span>View Recommendations</span>
                <FiArrowRight />
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Actions (4 Action Cards in a 2x2 grid) */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Quick Actions</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Fast pathways to complete workflows</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.title}
                    onClick={action.action}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 p-4.5 rounded-[24px] shadow-sm hover:shadow-md text-left flex flex-col justify-between gap-4 transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${action.iconColor}`}>
                      <Icon className="text-base" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-550 font-semibold leading-normal line-clamp-2">
                        {action.desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines (Timeline Layout) */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Upcoming Deadlines</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Chronological checklist of upcoming gates</p>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-[28px] p-6 shadow-sm space-y-6">
              <div className="relative pl-6 space-y-6 border-l border-slate-100 dark:border-slate-800 ml-1">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center py-4">
                    No upcoming deadlines within 30 days.
                  </p>
                ) : (
                  upcomingDeadlines.map((dl) => (
                    <div key={dl.id} className="relative group">
                      {/* Bullet */}
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 group-hover:scale-125 transition-transform flex items-center justify-center shadow-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          dl.status === 'Urgent' ? 'bg-rose-500 animate-pulse' : 'bg-primary-500'
                        }`} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-4">
                          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {dl.title}
                          </h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${dl.color}`}>
                            {dl.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-550 font-semibold">
                          <span>Closing: {dl.date}</span>
                          <span className={dl.status === 'Urgent' ? 'text-rose-500 font-black' : ''}>
                            {dl.daysLeft} days left
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
