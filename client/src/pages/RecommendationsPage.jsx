import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiBookmark, FiAlertCircle, FiCheck, FiInfo, FiSliders 
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

const RecommendationsPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Load user profile from localStorage with smart fallbacks
  const [profile] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          fullName: parsed.fullName || 'Student',
          cgpa: parsed.cgpa !== undefined ? Number(parsed.cgpa) : null,
          familyIncome: parsed.familyIncome !== undefined ? Number(parsed.familyIncome) : null,
          state: parsed.state || '',
          category: parsed.category || '',
          course: parsed.course || '',
          isProfileComplete: parsed.cgpa !== undefined && parsed.familyIncome !== undefined && parsed.state && parsed.category
        };
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
    return {
      fullName: 'Student',
      cgpa: null,
      familyIncome: null,
      state: '',
      category: '',
      course: '',
      isProfileComplete: false
    };
  });

  // Local Storage Bookmarks
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('savedScholarships');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Page States
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  // Sync Saved IDs to LocalStorage
  useEffect(() => {
    localStorage.setItem('savedScholarships', JSON.stringify(savedIds));
  }, [savedIds]);

  // Formatter helpers
  const formatAmount = (amount, title, provider) => {
    const isUSD = amount < 25000 && !/India|Ministry|Govt|National|Post Matric|MOMA|ONGC|Tata|HDFC|Reliance/i.test(title + ' ' + provider);
    if (isUSD) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    } else {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    }
  };

  const formatIncome = (income) => {
    if (!income) return 'No Limit';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(income);
  };

  // Local Rule-Based Recommendation Engine
  const calculateRecommendations = useCallback((allScholarships) => {
    // Fallback values for calculation if user profile fields are empty
    const cgpa = profile.cgpa !== null ? profile.cgpa : 8.0;
    const income = profile.familyIncome !== null ? profile.familyIncome : 500000;
    const state = profile.state || 'Delhi';
    const category = profile.category || 'General';
    const course = profile.course || 'Computer Science';

    const scored = allScholarships.map(sch => {
      let score = 0;
      const reasons = [];
      const gaps = [];

      // 1. CGPA Matching (25% weight)
      if (!sch.minimumCGPA || sch.minimumCGPA === 0) {
        score += 25;
        reasons.push('Eligible based on CGPA (No GPA threshold specified)');
      } else if (cgpa >= sch.minimumCGPA) {
        score += 25;
        reasons.push(`Eligible based on CGPA (Required: >= ${sch.minimumCGPA}, You: ${cgpa})`);
      } else {
        gaps.push(`Requires minimum CGPA of ${sch.minimumCGPA} (You have ${cgpa})`);
      }

      // 2. Family Income Matching (25% weight)
      if (!sch.maximumIncome) {
        score += 25;
        reasons.push('Income criteria matched (No income limits specified)');
      } else if (income <= sch.maximumIncome) {
        score += 25;
        reasons.push(`Income criteria matched (Limit: < ${formatIncome(sch.maximumIncome)}, You: ${formatIncome(income)})`);
      } else {
        gaps.push(`Requires family income under ${formatIncome(sch.maximumIncome)} (You have ${formatIncome(income)})`);
      }

      // 3. State eligibility (Domicile) Matching (20% weight)
      if (sch.state === 'All') {
        score += 20;
        reasons.push('State matched (Open to all target states)');
      } else if (state && state.toLowerCase() === sch.state.toLowerCase()) {
        score += 20;
        reasons.push(`State matched (Domicile of ${sch.state} matched)`);
      } else {
        gaps.push(`Eligible only for residents of ${sch.state} (You reside in ${state || 'Not Specified'})`);
      }

      // 4. Reservation Category Matching (15% weight)
      if (sch.category === 'All') {
        score += 15;
        reasons.push('Category matched (Open to all reservation categories)');
      } else if (category && category.toLowerCase() === sch.category.toLowerCase()) {
        score += 15;
        reasons.push(`Category matched (Reservation category ${sch.category} matched)`);
      } else {
        gaps.push(`Targeted for ${sch.category} category students (You are in ${category || 'Not Specified'})`);
      }

      // 5. Course / Stream Match (15% weight)
      if (sch.educationLevel === 'All') {
        score += 15;
        reasons.push('Education level matched (Open to all study streams)');
      } else if (
        course && 
        (sch.description.toLowerCase().includes(course.toLowerCase()) || 
         sch.title.toLowerCase().includes(course.toLowerCase()))
      ) {
        score += 15;
        reasons.push(`Course matched (Targets fields relating to "${course}")`);
      } else if (sch.educationLevel.toLowerCase() === 'undergraduate') {
        score += 10; // partial match
        reasons.push('Partial match (Available for Undergraduate level programs)');
      } else {
        gaps.push(`Targets ${sch.educationLevel} degree levels (Your field: ${course || 'Not Specified'})`);
      }

      return {
        ...sch,
        matchPercentage: Math.round(score),
        reasons,
        gaps
      };
    });

    // Sort by match percentage descending and filter out poor matches (match score < 50%)
    const sorted = scored
      .filter(sch => sch.matchPercentage >= 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    setRecommendations(sorted);
  }, [profile]);

  // Fetch all scholarships from MERN backend
  const fetchAllScholarships = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Query backend with a high limit to get all scholarships for rule matching
      const response = await axios.get('/api/scholarships?limit=200');
      if (response.data && response.data.success) {
        calculateRecommendations(response.data.data);
      } else {
        throw new Error('Failed to retrieve scholarships registry.');
      }
    } catch (err) {
      console.error('Error fetching scholarships:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while loading recommendations.');
    } finally {
      setIsLoading(false);
    }
  }, [calculateRecommendations]);

  useEffect(() => {
    fetchAllScholarships();
  }, [fetchAllScholarships]);

  // Toggle saving locally
  const toggleSaveScholarship = (id, title) => {
    if (savedIds.includes(id)) {
      setSavedIds(prev => prev.filter(savedId => savedId !== id));
      toast.success(`Removed "${title}" from saved list.`);
    } else {
      setSavedIds(prev => [...prev, id]);
      toast.success(`Saved "${title}" successfully!`, { icon: '🔖' });
    }
  };

  // Formatter for match color coding
  const getMatchColor = (percentage) => {
    if (percentage >= 85) {
      return isDarkMode 
        ? 'text-emerald-450 bg-slate-950 border-emerald-900' 
        : 'text-emerald-500 bg-emerald-50 border-emerald-250/30';
    }
    if (percentage >= 70) {
      return isDarkMode 
        ? 'text-primary-400 bg-slate-950 border-primary-900/50' 
        : 'text-primary-600 bg-primary-50 border-primary-250/30';
    }
    return isDarkMode 
      ? 'text-amber-450 bg-slate-950 border-amber-900/50' 
      : 'text-amber-600 bg-amber-50 border-amber-250/30';
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md">
              <HiOutlineSparkles className="text-lg animate-pulse" />
            </div>
            AI Recommendations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rule-based matching engine scoring fits based on your profile.</p>
        </div>
      </div>

      {/* User Profile Summary Card */}
      <div className={`border rounded-[32px] p-6 shadow-sm space-y-4 ${
        isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200/50"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1.5">
              Matching Profile: <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">{profile.fullName}</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
              Below are the profile parameters currently used for AI recommendation scoring.
            </p>
          </div>
          <Link
            to="/profile"
            className={`w-full md:w-auto px-4.5 py-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
              isDarkMode 
                ? "border-slate-700 text-slate-300 hover:bg-slate-800" 
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Update Profile Details
          </Link>
        </div>

        {/* Horizontal Divider */}
        <div className={`h-px ${isDarkMode ? "bg-slate-800/50" : "bg-slate-100"}`} />

        {/* Profile Warning if profile is incomplete */}
        {!profile.isProfileComplete && (
          <div className={`p-4 border rounded-2xl flex items-start gap-3 ${
            isDarkMode ? "bg-amber-950/20 border-amber-900/30" : "bg-amber-50/10 border-amber-800/30"
          }`}>
            <FiInfo className="text-amber-500 mt-0.5 text-base flex-shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-amber-800 dark:text-amber-500">Incomplete Academic Profile Details</span>
              <p className="text-[11px] text-amber-600 dark:text-amber-500/70 font-semibold leading-relaxed">
                Some details (like CGPA, Family Income, Domicile State, or Course) are missing from your account. We are using standard demonstration values to recommend matches. Update your profile for precise matching!
              </p>
            </div>
          </div>
        )}

        {/* Profile parameters badges row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
          <div className={`p-3 rounded-xl space-y-1 border ${
            isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100/50 text-slate-700"
          }`}>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">CGPA</span>
            <span className={`text-xs font-extrabold block ${isDarkMode ? "text-white" : "text-slate-700"}`}>{profile.cgpa !== null ? `${profile.cgpa} CGPA` : '8.0 (Demo)'}</span>
          </div>
          <div className={`p-3 rounded-xl space-y-1 border ${
            isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100/50 text-slate-700"
          }`}>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Income Limit</span>
            <span className={`text-xs font-extrabold block ${isDarkMode ? "text-white" : "text-slate-700"}`}>{profile.familyIncome !== null ? `${formatIncome(profile.familyIncome)}` : `${formatIncome(500000)} (Demo)`}</span>
          </div>
          <div className={`p-3 rounded-xl space-y-1 border ${
            isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100/50 text-slate-700"
          }`}>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Domicile</span>
            <span className={`text-xs font-extrabold block ${isDarkMode ? "text-white" : "text-slate-700"}`}>{profile.state || 'Delhi (Demo)'}</span>
          </div>
          <div className={`p-3 rounded-xl space-y-1 border ${
            isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100/50 text-slate-700"
          }`}>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Category</span>
            <span className={`text-xs font-extrabold block ${isDarkMode ? "text-white" : "text-slate-700"}`}>{profile.category || 'General (Demo)'}</span>
          </div>
          <div className={`p-3 rounded-xl space-y-1 border col-span-2 sm:col-span-1 ${
            isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100/50 text-slate-700"
          }`}>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Course Stream</span>
            <span className={`text-xs font-extrabold block truncate ${isDarkMode ? "text-white" : "text-slate-700"}`}>{profile.course || 'CS & Engineering (Demo)'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-semibold animate-pulse">Calculating matching recommendations...</p>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-red-800/40 rounded-[28px] p-8 bg-red-50/10 text-center space-y-4 max-w-lg mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-950/45 border border-red-900/30 flex items-center justify-center text-red-500 mx-auto">
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Failed to load recommendations</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          </div>
          <button
            onClick={fetchAllScholarships}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Fetching
          </button>
        </motion.div>
      ) : recommendations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border border-dashed rounded-[32px] p-12 text-center max-w-lg mx-auto space-y-5 ${isDarkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white"}`}
        >
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
            <HiOutlineSparkles className="w-7 h-7 text-slate-300 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No Matched Recommendations</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto">
              We couldn't find any scholarships matching your profile with a score of 50% or higher. Try updating your CGPA or course parameters.
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            Update Profile
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {recommendations.map((sch) => {
              const isSaved = savedIds.includes(sch._id);
              const isExpanded = expandedCard === sch._id;
              return (
                <motion.div
                  key={sch._id}
                  layout
                  onClick={() => navigate(`/scholarships/${sch._id}`)}
                  className={`border rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden bg-clip-padding cursor-pointer ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200/50"}`}
                >
                  {/* Accent glow on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/15 dark:group-hover:border-primary-500/30 rounded-[28px] pointer-events-none transition-all duration-300" />
                  
                  <div>
                    {/* Top Row: Category tags and score */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200/50 text-slate-500"}`}>
                          {sch.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200/50 text-slate-500"}`}>
                          {sch.educationLevel}
                        </span>
                      </div>

                      {/* Match Score Badge */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-extrabold ${getMatchColor(sch.matchPercentage)}`}>
                        {sch.matchPercentage}% Match
                      </span>
                    </div>

                    {/* Title & Provider */}
                    <div className="mt-4 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">{sch.provider}</span>
                      <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 tracking-tight leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {sch.title}
                      </h3>
                    </div>

                    {/* Scholarship Info Parameter Row */}
                    <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100/50 text-slate-700"}`}>
                      <span className="text-slate-400 dark:text-slate-550 font-semibold">Scholarship Value</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-450">
                        {formatAmount(sch.scholarshipAmount, sch.title, sch.provider)}
                      </span>
                    </div>

                    {/* Expandable Reasons Accordion */}
                    <div className={`mt-4 border-t pt-4 space-y-3 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCard(isExpanded ? null : sch._id);
                        }}
                        className={`flex items-center gap-1 text-[10px] font-extrabold cursor-pointer select-none uppercase tracking-wider ${isDarkMode ? "text-primary-400 hover:text-primary-350" : "text-primary-600 hover:text-primary-700"}`}
                      >
                        <FiSliders className={`transition-transform text-sm ${isExpanded ? 'rotate-90' : ''}`} />
                        <span>{isExpanded ? 'Hide Match Reasons' : 'Show Match Reasons'}</span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-3 pt-1.5"
                          >
                            {/* Positive matches */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-extrabold text-emerald-650 dark:text-emerald-450 uppercase tracking-widest block">Matched Parameters</span>
                              <ul className="space-y-1.5">
                                {sch.reasons.map((r, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                                    <FiCheck className="text-emerald-500 mt-0.5 text-sm flex-shrink-0" />
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Gaps */}
                            {sch.gaps.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Profile Discrepancies</span>
                                <ul className="space-y-1.5">
                                  {sch.gaps.map((g, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-550 font-medium">
                                      <FiInfo className="text-slate-400 mt-0.5 text-xs flex-shrink-0" />
                                      <span>{g}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className={`flex gap-2 w-full mt-5 pt-3.5 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <Link
                      to={`/scholarships/${sch._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`flex-1 py-2.5 px-4 rounded-xl border transition-colors text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer ${isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveScholarship(sch._id, sch.title);
                      }}
                      className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border cursor-pointer ${
                        isSaved
                          ? 'bg-amber-400/10 border-amber-400/30 text-amber-500 dark:text-amber-400 font-extrabold shadow-sm'
                          : (isDarkMode 
                              ? 'bg-slate-850 border-slate-700 text-slate-350 hover:bg-slate-800' 
                              : 'bg-primary-600/10 border-transparent text-primary-700 hover:bg-primary-600/20')
                      }`}
                    >
                      <FiBookmark className={isSaved ? 'fill-current' : 'text-sm'} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
