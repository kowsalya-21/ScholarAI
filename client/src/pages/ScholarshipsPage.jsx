import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiClock, FiBookmark, FiChevronLeft, FiChevronRight, 
  FiRefreshCw, FiAlertCircle, FiInbox, FiX 
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const ScholarshipsPage = () => {
  const { isDarkMode } = useTheme();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [debouncedSearch, setDebouncedSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination & Fetch States
  const [scholarships, setScholarships] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local Storage Bookmarking
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('savedScholarships');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Items per page
  const limit = 6;

  // Sync Saved IDs to LocalStorage
  useEffect(() => {
    localStorage.setItem('savedScholarships', JSON.stringify(savedIds));
  }, [savedIds]);

  const location = useLocation();
  const navigate = useNavigate();
  const lastNavigatedQuery = useRef(searchTerm);

  // Sync search states with URL parameter changes externally
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get('search') || '';
    if (urlQuery !== lastNavigatedQuery.current) {
      setSearchTerm(urlQuery);
      setDebouncedSearch(urlQuery);
      lastNavigatedQuery.current = urlQuery;
      setCurrentPage(1);
    }
  }, [location.search]);

  // Debounced URL updates (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      triggerSearch(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const triggerSearch = (query) => {
    const params = new URLSearchParams(location.search);
    const currentQuery = params.get('search') || '';
    if (query !== currentQuery) {
      lastNavigatedQuery.current = query;
      setDebouncedSearch(query);
      if (query.trim()) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      const newSearch = params.toString();
      navigate(`/scholarships${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch(searchTerm);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    triggerSearch('');
  };

  const highlightText = (text, highlight) => {
    if (!highlight || !highlight.trim()) {
      return <span>{text}</span>;
    }
    const cleanHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${cleanHighlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-0.5 rounded font-extrabold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Reset filters handler when page is changed or filters reset
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Fetch Scholarships from MERN backend API
  const fetchScholarships = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = {
      page: currentPage,
      limit,
      sort: sortBy,
    };

    if (selectedState !== 'All') {
      params.state = selectedState;
    }
    if (selectedCategory !== 'All') {
      params.category = selectedCategory;
    }
    if (selectedEducationLevel !== 'All') {
      params.educationLevel = selectedEducationLevel;
    }

    try {
      const searchParams = { ...params };
      if (debouncedSearch.trim()) {
        searchParams.search = debouncedSearch;
      }

      const response = await axios.get('/api/scholarships', { params: searchParams });
      
      if (response.data && response.data.success) {
        setScholarships(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Backend query failed');
      }
    } catch (err) {
      console.warn('Backend search failed or returned error, falling back to frontend filtering:', err);
      try {
        // Fetch a larger batch for frontend filtering
        const fallbackResponse = await axios.get('/api/scholarships', { 
          params: { ...params, limit: 1000 } 
        });
        
        if (fallbackResponse.data && fallbackResponse.data.success) {
          let items = fallbackResponse.data.data || [];
          
          if (debouncedSearch.trim()) {
            const cleanQuery = debouncedSearch.toLowerCase().trim();
            items = items.filter(sch => 
              (sch.title && sch.title.toLowerCase().includes(cleanQuery)) ||
              (sch.provider && sch.provider.toLowerCase().includes(cleanQuery)) ||
              (sch.category && sch.category.toLowerCase().includes(cleanQuery)) ||
              (sch.state && sch.state.toLowerCase().includes(cleanQuery)) ||
              (sch.educationLevel && sch.educationLevel.toLowerCase().includes(cleanQuery)) ||
              (sch.description && sch.description.toLowerCase().includes(cleanQuery))
            );
          }
          
          const startIndex = (currentPage - 1) * limit;
          const paginatedItems = items.slice(startIndex, startIndex + limit);
          
          setScholarships(paginatedItems);
          setPagination({
            currentPage,
            totalPages: Math.ceil(items.length / limit),
            totalScholarships: items.length,
            hasNextPage: startIndex + limit < items.length,
            hasPrevPage: currentPage > 1
          });
        } else {
          throw new Error('Failed to retrieve scholarships directory.');
        }
      } catch (fallbackErr) {
        console.error('Frontend fallback also failed:', fallbackErr);
        const errMsg = fallbackErr.response?.data?.message || fallbackErr.message || 'An error occurred while loading scholarships.';
        setError(errMsg);
        toast.error(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedState, selectedCategory, selectedEducationLevel, sortBy]);

  // Trigger fetch when query parameters modify
  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // Toggle saving scholarship locally
  const toggleSaveScholarship = (id, title) => {
    if (savedIds.includes(id)) {
      setSavedIds(prev => prev.filter(savedId => savedId !== id));
      toast.success(`Removed "${title}" from saved list.`);
    } else {
      setSavedIds(prev => [...prev, id]);
      toast.success(`Saved "${title}" successfully!`, { icon: '🔖' });
    }
  };

  // Reset all filters utility
  const handleResetFilters = () => {
    setSearchTerm('');
    triggerSearch('');
    setSelectedState('All');
    setSelectedCategory('All');
    setSelectedEducationLevel('All');
    setSortBy('newest');
    setCurrentPage(1);
    toast.success('Search and filters reset.');
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

  // Skeleton Loader for premium appearance
  const SkeletonCard = () => (
    <div className={`border rounded-[28px] p-5 shadow-sm space-y-4 animate-pulse ${
      isDarkMode 
        ? "bg-slate-800/80 border-slate-700" 
        : "bg-white border-slate-200/50"
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-1.5">
          <div className={`w-12 h-5 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`w-16 h-5 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
        <div className={`w-8 h-8 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </div>
      <div className="space-y-2">
        <div className={`w-24 h-3 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className={`w-3/4 h-5 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </div>
      <div className={`p-3.5 rounded-2xl border space-y-3 ${
        isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="flex justify-between">
          <div className={`w-16 h-3 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`w-20 h-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
        <div className="flex justify-between">
          <div className={`w-20 h-3 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`w-12 h-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
        <div className="flex justify-between">
          <div className={`w-14 h-3 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`w-24 h-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
      </div>
      <div className={`w-full h-8 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <div className={`pt-3 border-t flex gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className={`flex-1 h-10 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className={`w-20 h-10 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md">
              <HiOutlineAcademicCap className="text-xl" />
            </div>
            Scholarships
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explore and filter matched scholarship opportunities.</p>
        </div>

        {/* Global Reset Shortcut */}
        {(searchTerm || selectedState !== 'All' || selectedCategory !== 'All' || selectedEducationLevel !== 'All' || sortBy !== 'newest') && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-rose-800/40 text-rose-650 dark:text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FiX className="text-sm" />
            Reset Active Filters
          </motion.button>
        )}
      </div>

      {/* Search & Advanced Filters Panel */}
      <div className={`border rounded-[32px] p-6 shadow-sm space-y-6 ${
        isDarkMode
          ? "bg-slate-900/70 border-slate-800/80"
          : "bg-white border-slate-200/50"
      }`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full lg:max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <FiSearch className="text-lg" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Search by keyword, provider, or major..."
              className={`w-full pl-11 pr-11 py-3 border rounded-2xl text-sm font-semibold focus:outline-none transition-all ${
                isDarkMode
                  ? "bg-slate-800 text-white border-slate-700 placeholder-slate-500 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  : "bg-slate-50 text-slate-800 border-slate-200/80 placeholder-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
              }`}
            />
            {searchTerm && (
              <button
                onClick={handleSearchClear}
                className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                title="Clear search"
              >
                <FiX className="text-base" />
              </button>
            )}
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className={`w-full sm:w-44 px-3.5 py-3 border rounded-2xl text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                isDarkMode
                  ? "bg-slate-800 text-white border-slate-700 focus:border-primary-500"
                  : "bg-slate-50 text-slate-700 border-slate-200/80 focus:border-primary-500"
              }`}
            >
              <option value="newest" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Latest Added</option>
              <option value="amount" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Highest Amount</option>
              <option value="deadline" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Closest Deadline</option>
            </select>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className={`h-px ${isDarkMode ? "bg-slate-800/50" : "bg-slate-100"}`} />

        {/* Dynamic Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
              className={`w-full px-3.5 py-3 border rounded-2xl text-xs font-semibold focus:outline-none cursor-pointer ${
                isDarkMode
                  ? "bg-slate-800 text-white border-slate-700 focus:border-primary-500"
                  : "bg-slate-50 text-slate-700 border-slate-200/80 focus:border-primary-500"
              }`}
            >
              <option value="All" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>All Categories</option>
              <option value="General" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>General</option>
              <option value="OBC" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>OBC</option>
              <option value="SC" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>SC</option>
              <option value="ST" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>ST</option>
              <option value="EWS" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>EWS</option>
              <option value="Other" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Other / Minority</option>
            </select>
          </div>

          {/* Education Level Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Education Level</label>
            <select
              value={selectedEducationLevel}
              onChange={(e) => handleFilterChange(setSelectedEducationLevel, e.target.value)}
              className={`w-full px-3.5 py-3 border rounded-2xl text-xs font-semibold focus:outline-none cursor-pointer ${
                isDarkMode
                  ? "bg-slate-800 text-white border-slate-700 focus:border-primary-500"
                  : "bg-slate-50 text-slate-700 border-slate-200/80 focus:border-primary-500"
              }`}
            >
              <option value="All" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>All Education Levels</option>
              <option value="High School" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>High School</option>
              <option value="Undergraduate" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Undergraduate</option>
              <option value="Postgraduate" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Postgraduate</option>
              <option value="PhD" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>PhD</option>
              <option value="Diploma" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Diploma</option>
              <option value="Other" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Other Level</option>
            </select>
          </div>

          {/* State Eligibility Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">State Eligibility</label>
            <select
              value={selectedState}
              onChange={(e) => handleFilterChange(setSelectedState, e.target.value)}
              className={`w-full px-3.5 py-3 border rounded-2xl text-xs font-semibold focus:outline-none cursor-pointer ${
                isDarkMode
                  ? "bg-slate-800 text-white border-slate-700 focus:border-primary-500"
                  : "bg-slate-50 text-slate-700 border-slate-200/80 focus:border-primary-500"
              }`}
            >
              <option value="All" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>All States</option>
              {INDIAN_STATES_AND_UTS.map((state) => (
                <option key={state} value={state} className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Contents Grid */}
      {isLoading ? (
        // Grid loader skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : error ? (
        // Error Display Block
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-red-800/40 rounded-[28px] p-8 bg-red-50/10 text-center space-y-4 max-w-lg mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-900/30 flex items-center justify-center text-red-500 mx-auto">
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Failed to Load Scholarships</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          </div>
          <button
            onClick={fetchScholarships}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/10 cursor-pointer"
          >
            <FiRefreshCw className="text-sm" />
            <span>Retry Connection</span>
          </button>
        </motion.div>
      ) : scholarships.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border border-dashed rounded-[32px] p-12 text-center max-w-lg mx-auto space-y-5 ${isDarkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white"}`}
        >
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-slate-400 dark:text-slate-550 mx-auto ${isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
            <FiInbox className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
              {searchTerm.trim() ? `No scholarships found for '${searchTerm}'` : 'No Scholarships Found'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto">
              {searchTerm.trim()
                ? "We couldn't find any scholarship options matching your keyword. Try a different search term."
                : "We couldn't find any scholarship options matching your current filters or keywords. Try clearing some selections."
              }
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </motion.div>
      ) : (
        // Grid Display list
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {scholarships.map((sch, idx) => {
                const isSaved = savedIds.includes(sch._id);
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
                    className={`border rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden bg-clip-padding cursor-pointer ${isDarkMode ? "bg-slate-800/95 border-slate-700" : "bg-white border-slate-200/50"}`}
                  >
                    {/* Active Accent Border Ring */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/20 dark:group-hover:border-primary-500/40 rounded-[28px] pointer-events-none transition-all duration-300" />
                    
                    <div>
                      {/* Top Row: Category Tags */}
                      <div className="flex flex-wrap gap-1.5 justify-start items-center">
                        <span className="px-2.5 py-0.5 rounded-md bg-primary-600/5 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-[9px] font-extrabold uppercase tracking-wider border border-primary-500/10 dark:border-primary-800/50">
                          {sch.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-secondary-500/5 dark:bg-secondary-950/20 text-secondary-500 dark:text-secondary-400 text-[9px] font-extrabold uppercase tracking-wider border border-secondary-500/10 dark:border-secondary-800/50">
                          {sch.educationLevel}
                        </span>
                      </div>

                      {/* Title & Provider */}
                      <div className="mt-4 space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">{sch.provider}</span>
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-450 transition-colors">
                          {highlightText(sch.title, searchTerm)}
                        </h3>
                      </div>

                      {/* Scholarship Parameter Box */}
                      <div className={`mt-4 p-3.5 rounded-2xl border space-y-2 text-xs ${
                        isDarkMode 
                          ? "bg-slate-900/40 border-slate-800/80" 
                          : "bg-slate-50/50 border-slate-100/60"
                      }`}>
                        <div className={`flex justify-between items-center pb-1.5 border-b ${
                          isDarkMode ? "border-slate-800/80" : "border-slate-100/50"
                        }`}>
                          <span className="text-slate-400 dark:text-slate-550 font-semibold">Amount</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                            {formatAmount(sch.scholarshipAmount, sch.title, sch.provider)}
                          </span>
                        </div>
                        <div className={`flex justify-between items-center pb-1.5 border-b ${
                          isDarkMode ? "border-slate-800/80" : "border-slate-100/50"
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
                          <span className={`font-bold flex items-center gap-1 ${isUrgent ? 'text-rose-650 dark:text-rose-500 font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                            <FiClock className={isUrgent ? 'animate-pulse' : ''} />
                            {formatDate(sch.applicationDeadline)}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
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
                        className={`flex-1 py-2.5 px-4 rounded-xl border transition-colors text-xs font-bold text-center flex items-center justify-center gap-1 cursor-pointer ${
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
                          toggleSaveScholarship(sch._id, sch.title);
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 border cursor-pointer ${
                          isSaved
                            ? 'bg-amber-400/10 border-amber-400/30 text-amber-500 dark:text-amber-400 font-extrabold shadow-sm'
                            : (isDarkMode 
                                ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800' 
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

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isDarkMode 
                    ? "border-slate-700 bg-slate-800 text-slate-350 hover:bg-slate-750" 
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-md'
                      : (isDarkMode 
                          ? 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750' 
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isDarkMode 
                    ? "border-slate-700 bg-slate-800 text-slate-350 hover:bg-slate-750" 
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScholarshipsPage;
