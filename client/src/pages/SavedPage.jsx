import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiBookmark, FiClock, FiAlertCircle, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const SavedPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Saved IDs stored in Local Storage
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('savedScholarships');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch States
  const [scholarships, setScholarships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch details for all saved scholarship IDs
  const fetchSavedScholarships = useCallback(async () => {
    if (savedIds.length === 0) {
      setScholarships([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchPromises = savedIds.map(async (id) => {
        try {
          const response = await axios.get(`/api/scholarships/${id}`);
          if (response.data && response.data.success) {
            return response.data.data;
          }
          return null;
        } catch (err) {
          console.warn(`Could not fetch saved scholarship ID ${id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      // Filter out any null values (e.g. from failed requests or deleted scholarships)
      const validScholarships = results.filter(item => item !== null);
      setScholarships(validScholarships);
      
      // Sync valid IDs back to state and local storage if some were deleted
      if (validScholarships.length !== savedIds.length) {
        const validIds = validScholarships.map(s => s._id);
        setSavedIds(validIds);
        localStorage.setItem('savedScholarships', JSON.stringify(validIds));
      }
    } catch (err) {
      console.error('Error fetching saved scholarships:', err);
      setError('An error occurred while loading your saved scholarships.');
      toast.error('Failed to load saved scholarships.');
    } finally {
      setIsLoading(false);
    }
  }, [savedIds]);

  useEffect(() => {
    fetchSavedScholarships();
  }, [fetchSavedScholarships]);

  // Remove saved scholarship handler
  const handleRemoveSaved = (id, title) => {
    try {
      const updatedIds = savedIds.filter(savedId => savedId !== id);
      setSavedIds(updatedIds);
      localStorage.setItem('savedScholarships', JSON.stringify(updatedIds));
      setScholarships(prev => prev.filter(sch => sch._id !== id));
      toast.success(`Removed "${title}" from saved list.`);
    } catch (err) {
      console.error('Error removing saved scholarship:', err);
      toast.error('Failed to remove scholarship.');
    }
  };

  // Formatter for Scholarship Amount (USD vs. INR heuristic matching seed data)
  const formatAmount = (amount, title, provider) => {
    const isUSD = amount < 25000 && !/India|Ministry|Govt|National|Post Matric|MOMA|ONGC|Tata|HDFC|Reliance/i.test(title + ' ' + provider);
    if (isUSD) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    } else {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if deadline is close (within 30 days)
  const checkUrgency = (dateStr) => {
    const diffTime = new Date(dateStr) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Title Header */}
      <div>
        <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-2.5 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md">
            <FiBookmark className="text-lg fill-current" />
          </div>
          Saved Scholarships
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Keep track of opportunities you are interested in.
        </p>
      </div>

      {/* Main Contents Panel */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className={`text-xs font-semibold animate-pulse ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Loading saved scholarships...
          </p>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-[28px] p-8 text-center space-y-4 max-w-lg mx-auto ${
            isDarkMode ? "border-red-800/40 bg-red-950/15" : "border-red-200 bg-red-50/30"
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
            isDarkMode ? "bg-red-950/45 text-red-400" : "bg-red-100 text-red-600"
          }`}>
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className={`text-base font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Connection Error
            </h3>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{error}</p>
          </div>
        </motion.div>
      ) : scholarships.length === 0 ? (
        // Empty State Block
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border border-dashed rounded-[32px] p-12 text-center max-w-lg mx-auto space-y-5 ${
            isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto ${
            isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-400"
          }`}>
            <FiBookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className={`text-base font-extrabold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
              No Saved Scholarships Yet
            </h3>
            <p className={`text-xs leading-relaxed font-semibold max-w-sm mx-auto ${
              isDarkMode ? "text-slate-400" : "text-slate-400"
            }`}>
              You haven't bookmarked any scholarship opportunities yet. Discover active grants and save them to track them here.
            </p>
          </div>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:opacity-95 hover:shadow-lg transition-all cursor-pointer"
          >
            Browse Scholarships
          </Link>
        </motion.div>
      ) : (
        // Saved Scholarships Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {scholarships.map((sch, idx) => {
              const isUrgent = checkUrgency(sch.applicationDeadline);
              return (
                <motion.div
                  key={sch._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.03 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => navigate(`/scholarships/${sch._id}`)}
                  className={`border rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden bg-clip-padding cursor-pointer ${
                    isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200/50"
                  }`}
                >
                  {/* Active Accent Border Ring */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/20 rounded-[28px] pointer-events-none transition-all duration-300" />
                  
                  <div>
                    {/* Top Row: Category Tags */}
                    <div className="flex flex-wrap gap-1.5 justify-start items-center">
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${
                        isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-primary-600/5 border-primary-500/10 text-primary-600"
                      }`}>
                        {sch.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${
                        isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-secondary-500/5 border-secondary-500/10 text-secondary-500"
                      }`}>
                        {sch.educationLevel}
                      </span>
                    </div>

                    {/* Title & Provider */}
                    <div className="mt-4 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">{sch.provider}</span>
                      <h3 className={`text-sm font-extrabold tracking-tight leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${
                        isDarkMode ? "text-slate-100" : "text-slate-800"
                      }`}>
                        {sch.title}
                      </h3>
                    </div>

                    {/* Scholarship Parameter Box */}
                    <div className={`mt-4 p-3.5 rounded-2xl border space-y-2 text-xs ${
                      isDarkMode ? "bg-slate-950/40 border-slate-800/80" : "bg-slate-50/50 border-slate-100/60"
                    }`}>
                      <div className={`flex justify-between items-center pb-1.5 border-b ${
                        isDarkMode ? "border-slate-800" : "border-slate-100/50"
                      }`}>
                        <span className="text-slate-400 dark:text-slate-550 font-semibold">Amount</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                          {formatAmount(sch.scholarshipAmount, sch.title, sch.provider)}
                        </span>
                      </div>
                      <div className={`flex justify-between items-center pb-1.5 border-b ${
                        isDarkMode ? "border-slate-800" : "border-slate-100/50"
                      }`}>
                        <span className="text-slate-400 dark:text-slate-550 font-semibold">State Eligibility</span>
                        <span className={`font-bold px-2 py-0.5 rounded-lg ${
                          isDarkMode ? "text-slate-350 bg-slate-800" : "text-slate-650 bg-slate-100"
                        }`}>
                          {sch.state}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-550 font-semibold">Deadline</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          isUrgent 
                            ? (isDarkMode ? 'text-rose-500 font-black' : 'text-rose-600 font-black') 
                            : (isDarkMode ? 'text-slate-350' : 'text-slate-600')
                        }`}>
                          <FiClock className={isUrgent ? 'animate-pulse' : ''} />
                          {formatDate(sch.applicationDeadline)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className={`mt-4 text-xs font-medium leading-relaxed line-clamp-2 ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      {sch.description}
                    </p>
                  </div>

                  {/* Action buttons footer */}
                  <div className={`flex gap-2 w-full mt-4 pt-3.5 border-t ${
                    isDarkMode ? "border-slate-800" : "border-slate-100"
                  }`}>
                    <Link
                      to={`/scholarships/${sch._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`flex-1 py-2.5 px-4 rounded-xl border transition-colors text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                        isDarkMode 
                          ? "border-slate-700 text-slate-300 hover:bg-slate-800" 
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSaved(sch._id, sch.title);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border cursor-pointer group ${
                        isDarkMode
                          ? 'bg-amber-400/10 border-amber-400/35 text-amber-400 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/50'
                          : 'bg-amber-400/10 border-amber-400/30 text-amber-600 hover:bg-rose-50 hover:text-rose-650 hover:border-rose-200'
                      }`}
                      title="Remove saved scholarship"
                    >
                      <FiBookmark className="fill-current group-hover:hidden text-sm" />
                      <FiX className="hidden group-hover:block text-sm" />
                      <span>Saved</span>
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

export default SavedPage;
