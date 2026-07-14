import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiClock, FiBookmark, FiMapPin, 
  FiAward, FiDollarSign, FiFileText, FiAlertCircle, FiExternalLink, FiCheckSquare
} from 'react-icons/fi';

const ScholarshipDetailsPage = () => {
  const { id } = useParams();
  const { isDarkMode } = useTheme();

  // Fetch States
  const [scholarship, setScholarship] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local Storage Bookmarks Sync
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('savedScholarships');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('savedScholarships', JSON.stringify(savedIds));
  }, [savedIds]);

  const isSaved = scholarship ? savedIds.includes(scholarship._id) : false;

  // Fetch Scholarship details on load
  useEffect(() => {
    const fetchScholarshipDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/scholarships/${id}`);
        if (response.data && response.data.success) {
          setScholarship(response.data.data);
        } else {
          throw new Error('Scholarship data could not be parsed.');
        }
      } catch (err) {
        console.error('Error fetching scholarship details:', err);
        const errMsg = err.response?.data?.message || err.message || 'The requested scholarship could not be found.';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchScholarshipDetails();
    }
  }, [id]);

  // Toggle Save handler
  const handleToggleSave = () => {
    if (!scholarship) return;
    if (isSaved) {
      setSavedIds(prev => prev.filter(savedId => savedId !== scholarship._id));
      toast.success(`Removed "${scholarship.title}" from saved list.`);
    } else {
      setSavedIds(prev => [...prev, scholarship._id]);
      toast.success(`Saved "${scholarship.title}" successfully!`, { icon: '🔖' });
    }
  };

  // Format amount
  const formatAmount = (amount, title, provider) => {
    if (amount === undefined || amount === null) return 'N/A';
    const isUSD = amount < 25000 && !/India|Ministry|Govt|National|Post Matric|MOMA|ONGC|Tata|HDFC|Reliance/i.test(title + ' ' + provider);
    if (isUSD) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    } else {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format family income limit
  const formatIncome = (income) => {
    if (income === undefined || income === null) return 'No Limit';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(income) + ' / Yr';
  };

  // Check if deadline is close (within 30 days)
  const checkUrgency = (dateStr) => {
    if (!dateStr) return false;
    const diffTime = new Date(dateStr) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  // 1. Loading State Screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-semibold animate-pulse">Loading scholarship details...</p>
      </div>
    );
  }

  // 2. Error / Not Found Screen
  if (error || !scholarship) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[32px] p-8 text-center space-y-5 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-500 dark:text-red-400 mx-auto">
          <FiAlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">Scholarship Not Found</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {error || "The scholarship you are looking for might have been removed or doesn't exist."}
          </p>
        </div>
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:opacity-95 transition-all cursor-pointer"
        >
          <FiArrowLeft />
          <span>Back to Scholarships</span>
        </Link>
      </div>
    );
  }

  // URL startsWith https:// check validation
  const isValidHttpsUrl = (url) => {
    return typeof url === 'string' && url.trim().toLowerCase().startsWith('https://');
  };

  const rawAppUrl = scholarship ? (scholarship.applicationUrl || scholarship.applicationLink) : null;
  const appUrl = isValidHttpsUrl(rawAppUrl) ? rawAppUrl.trim() : null;
  const hasAppUrl = !!appUrl;

  const rawWebsite = scholarship ? (scholarship.officialWebsite || scholarship.website || scholarship.applicationLink || scholarship.applicationUrl) : null;
  const officialWebsite = isValidHttpsUrl(rawWebsite) ? rawWebsite.trim() : null;

  const title = scholarship ? scholarship.title : '';
  const provider = scholarship ? scholarship.provider : '';
  const description = scholarship ? scholarship.description : '';
  const eligibility = scholarship ? (scholarship.eligibility || scholarship.eligibilityCriteria) : '';
  const amount = scholarship ? (scholarship.amount !== undefined && scholarship.amount !== null ? scholarship.amount : scholarship.scholarshipAmount) : 0;
  const deadline = scholarship ? (scholarship.deadline || scholarship.applicationDeadline) : null;

  const isUrgent = checkUrgency(deadline);

  // 3. Normal Details Screen
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors group cursor-pointer"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform text-sm" />
          <span>Back to Scholarships</span>
        </Link>
      </div>

      {/* Main Glassmorphic Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[32px] p-6 md:p-8 shadow-sm space-y-8 bg-clip-padding"
      >
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-3.5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-primary-600/5 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-extrabold uppercase tracking-wider border border-primary-500/10 dark:border-primary-500/20">
                {scholarship.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-secondary-500/5 dark:bg-secondary-500/10 text-secondary-500 dark:text-secondary-400 text-[10px] font-extrabold uppercase tracking-wider border border-secondary-500/10 dark:border-secondary-500/20">
                {scholarship.educationLevel}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider">
                State: {scholarship.state}
              </span>
            </div>
            {/* Title & Provider */}
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-sm text-primary-600 font-bold">{provider}</p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4.5 text-left md:text-right min-w-[160px] self-start md:self-auto flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Scholarship Amount</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-450 tracking-tight block mt-0.5">
              {formatAmount(amount, title, provider)}
            </span>
          </div>
        </div>

        {/* Primary Parameters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1">
              <FiClock className="text-slate-400 dark:text-slate-555 text-xs" />
              Deadline
            </span>
            <span className={`text-xs font-extrabold block ${isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
              {formatDate(deadline)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1">
              <FiAward className="text-slate-400 dark:text-slate-555 text-xs" />
              Minimum GPA/CGPA
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
              {scholarship.minimumCGPA ? `${scholarship.minimumCGPA} CGPA` : 'No CGPA Criteria'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1">
              <FiDollarSign className="text-slate-400 dark:text-slate-555 text-xs" />
              Family Income Limit
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
              {formatIncome(scholarship.maximumIncome)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1">
              <FiMapPin className="text-slate-400 dark:text-slate-555 text-xs" />
              State Eligibility
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
              {scholarship.state === 'All' ? 'Open to All States' : scholarship.state}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1">
              <FiCheckSquare className="text-slate-400 dark:text-slate-555 text-xs" />
              Application Mode
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
              {scholarship.applicationMode || 'Online'}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-primary-600" />
            Description
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* Eligibility Section */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-secondary-500" />
            Eligibility
          </h3>
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
              {eligibility || 'No eligibility criteria specified.'}
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        {scholarship.benefits && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
              Benefits
            </h3>
            <div className="p-4 bg-emerald-50/10 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/30 rounded-2xl">
              <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-semibold font-sans">
                {scholarship.benefits}
              </p>
            </div>
          </div>
        )}

        {/* Required Documents Section */}
        <div className="space-y-3.5">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
            Required Documents
          </h3>
          {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 ? (
            <div className="p-5 border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {scholarship.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450 flex-shrink-0">
                      <FiFileText className="text-xs" />
                    </div>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic font-semibold">No specific documents specified by the provider.</p>
          )}
        </div>

        {/* Official Website Section */}
        {officialWebsite && (
          <div className="space-y-3.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-blue-500" />
              Official Website
            </h3>
            <div className="p-5 border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl">
              <a
                href={officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>{officialWebsite}</span>
                <FiExternalLink className="text-xs" />
              </a>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <Link
            to="/scholarships"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FiArrowLeft />
            <span>Back to Scholarships</span>
          </Link>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            {/* Save Scholarship Button */}
            <button
              onClick={handleToggleSave}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 border cursor-pointer ${
                isSaved
                  ? 'bg-amber-400/10 border-amber-400/30 text-amber-600 shadow-sm'
                  : 'bg-primary-600/10 border-transparent text-primary-700 hover:bg-primary-600/20'
              }`}
            >
              <FiBookmark className={isSaved ? 'fill-current' : ''} />
              <span>{isSaved ? 'Saved' : 'Save Scholarship'}</span>
            </button>

            {/* Apply Now Button */}
            {hasAppUrl ? (
              <button
                onClick={() => {
                  try {
                    const savedApps = localStorage.getItem('scholarshipApplications');
                    const apps = savedApps ? JSON.parse(savedApps) : [];
                    
                    const exists = apps.some(app => app.scholarshipName === title);
                    if (!exists) {
                      const newApp = {
                        id: `app-${Date.now()}`,
                        scholarshipName: title,
                        provider: provider,
                        appliedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                        status: 'Applied'
                      };
                      localStorage.setItem('scholarshipApplications', JSON.stringify([newApp, ...apps]));
                    }
                  } catch (err) {
                    console.error('Error saving application:', err);
                  }
                  toast.success('Opening official scholarship website...', { icon: '🚀' });
                  window.open(appUrl, "_blank", "noopener,noreferrer");
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-extrabold text-xs hover:opacity-95 transition-all shadow-md shadow-primary-500/10 flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Apply Now</span>
                <FiExternalLink />
              </button>
            ) : officialWebsite ? (
              <button
                onClick={() => {
                  try {
                    const savedApps = localStorage.getItem('scholarshipApplications');
                    const apps = savedApps ? JSON.parse(savedApps) : [];
                    
                    const exists = apps.some(app => app.scholarshipName === title);
                    if (!exists) {
                      const newApp = {
                        id: `app-${Date.now()}`,
                        scholarshipName: title,
                        provider: provider,
                        appliedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                        status: 'Applied'
                      };
                      localStorage.setItem('scholarshipApplications', JSON.stringify([newApp, ...apps]));
                    }
                  } catch (err) {
                    console.error('Error saving application:', err);
                  }
                  toast.success('Please navigate to the Apply section on the official website.', { duration: 5000, icon: 'ℹ️' });
                  window.open(officialWebsite, "_blank", "noopener,noreferrer");
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-extrabold text-xs hover:opacity-95 transition-all shadow-md shadow-primary-500/10 flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Apply Now</span>
                <FiExternalLink />
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-extrabold text-xs cursor-not-allowed flex items-center justify-center gap-1.5 text-center"
              >
                <span>Official application link is currently unavailable.</span>
              </button>
            )}
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default ScholarshipDetailsPage;
