import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiTrash2, FiInbox, FiX, FiCheckCircle, 
  FiList, FiTrendingUp 
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

const defaultApplications = [
  {
    id: 'app-1',
    scholarshipName: 'STEM Leaders of Tomorrow Award',
    provider: 'Vanguard Tech Foundation',
    appliedDate: '2026-06-28',
    status: 'Applied'
  },
  {
    id: 'app-2',
    scholarshipName: 'Vanguard Female Founders Fund',
    provider: 'Vanguard Tech Foundation',
    appliedDate: '2026-06-24',
    status: 'Under Review'
  },
  {
    id: 'app-3',
    scholarshipName: 'National Merit Scholarship Scheme',
    provider: 'Ministry of Education, Govt. of India',
    appliedDate: '2026-06-15',
    status: 'Shortlisted'
  },
  {
    id: 'app-4',
    scholarshipName: 'Tata Trusts Scholarship for Engineering',
    provider: 'Tata Trusts',
    appliedDate: '2026-05-10',
    status: 'Approved'
  },
  {
    id: 'app-5',
    scholarshipName: 'HDFC Badhte Kadam Scholarship',
    provider: 'HDFC Bank',
    appliedDate: '2026-05-01',
    status: 'Rejected'
  }
];

const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Approved', 'Rejected'];

const ApplicationsPage = () => {
  const { isDarkMode } = useTheme();

  // Load applications from localStorage or default dataset
  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem('scholarshipApplications');
      if (stored === null) {
        localStorage.setItem('scholarshipApplications', JSON.stringify(defaultApplications));
        return defaultApplications;
      }
      return JSON.parse(stored);
    } catch {
      return defaultApplications;
    }
  });

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Sync state back to localStorage
  useEffect(() => {
    localStorage.setItem('scholarshipApplications', JSON.stringify(applications));
  }, [applications]);

  // Handle status update inline
  const handleUpdateStatus = (id, newStatus) => {
    try {
      setApplications(prev => prev.map(app => {
        if (app.id === id) {
          return { ...app, status: newStatus };
        }
        return app;
      }));
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  };

  // Handle remove application record
  const handleDeleteApplication = (id, name) => {
    try {
      setApplications(prev => prev.filter(app => app.id !== id));
      toast.success(`Removed application for "${name}"`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove application.');
    }
  };

  // Formatter for status badge colors
  const getStatusBadgeStyles = (status) => {
    if (isDarkMode) {
      switch (status) {
        case 'Applied':
          return 'bg-blue-950/30 text-blue-400 border-blue-900/50';
        case 'Under Review':
          return 'bg-amber-950/30 text-amber-400 border-amber-900/50';
        case 'Shortlisted':
          return 'bg-purple-950/30 text-purple-400 border-purple-900/50';
        case 'Approved':
          return 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50';
        case 'Rejected':
          return 'bg-rose-950/30 text-rose-400 border-rose-900/50';
        default:
          return 'bg-slate-900/40 text-slate-400 border-slate-800';
      }
    } else {
      switch (status) {
        case 'Applied':
          return 'bg-blue-50/70 text-blue-600 border-blue-200/50';
        case 'Under Review':
          return 'bg-amber-50/70 text-amber-600 border-amber-200/50';
        case 'Shortlisted':
          return 'bg-purple-50/70 text-purple-600 border-purple-200/50';
        case 'Approved':
          return 'bg-emerald-50/70 text-emerald-600 border-emerald-200/50';
        case 'Rejected':
          return 'bg-rose-50/70 text-rose-600 border-rose-200/50';
        default:
          return 'bg-slate-50 text-slate-600 border-slate-200/50';
      }
    }
  };

  // Filter application rows
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics for total, approved, and under review
  const stats = {
    total: applications.length,
    underReview: applications.filter(a => a.status === 'Under Review' || a.status === 'Shortlisted').length,
    approved: applications.filter(a => a.status === 'Approved').length,
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Title Header */}
      <div>
        <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-2.5 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md">
            <FiList className="text-lg" />
          </div>
          My Applications
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Track and manage your scholarship applications workflow.
        </p>
      </div>

      {/* Mini Stats Row */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`border rounded-[24px] p-5 shadow-sm flex items-center justify-between ${
            isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200/50"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tracked</span>
              <span className={`text-2xl font-black block ${isDarkMode ? "text-white" : "text-slate-800"}`}>{stats.total}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-400"
            }`}>
              <HiOutlineAcademicCap className="text-lg" />
            </div>
          </div>

          <div className={`border rounded-[24px] p-5 shadow-sm flex items-center justify-between ${
            isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200/50"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
              <span className="text-2xl font-black text-amber-600 block">{stats.underReview}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isDarkMode ? "bg-amber-950/20 border-amber-900/35 text-amber-400" : "bg-amber-50 border-amber-100 text-amber-550"
            }`}>
              <FiTrendingUp className="text-sm" />
            </div>
          </div>

          <div className={`border rounded-[24px] p-5 shadow-sm flex items-center justify-between ${
            isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200/50"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved Awards</span>
              <span className="text-2xl font-black text-emerald-600 block">{stats.approved}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isDarkMode ? "bg-emerald-950/20 border-emerald-900/35 text-emerald-450" : "bg-emerald-50 border-emerald-100 text-emerald-500"
            }`}>
              <FiCheckCircle className="text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className={`border rounded-[32px] p-6 shadow-sm space-y-6 ${
        isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200/50"
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by scholarship name or provider..."
              className={`w-full pl-11 pr-11 py-3 border rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-semibold ${
                isDarkMode 
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" 
                  : "bg-slate-50 border-slate-200/80 text-slate-800 placeholder-slate-400"
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX className="text-base" />
              </button>
            )}
          </div>

          {/* Status Select for Mobile (Visual fallback) */}
          <div className="w-full lg:hidden">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full px-3.5 py-3 border rounded-2xl text-xs font-bold focus:outline-none focus:border-primary-500 cursor-pointer ${
                isDarkMode 
                  ? "bg-slate-800 border-slate-700 text-white" 
                  : "bg-slate-50 border-slate-200/80 text-slate-700"
              }`}
            >
              <option value="All" className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>All Statuses</option>
              {statusOptions.map(opt => (
                <option key={opt} value={opt} className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Status Tabs for Desktop */}
          <div className={`hidden lg:flex items-center gap-1.5 border p-1.5 rounded-2xl ${
            isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200/50"
          }`}>
            <button
              onClick={() => setSelectedStatus('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === 'All'
                  ? (isDarkMode 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                      : 'bg-white text-slate-900 shadow-sm border border-slate-200/30')
                  : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
              }`}
            >
              All
            </button>
            {statusOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedStatus(opt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === opt
                    ? (isDarkMode 
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                        : 'bg-white text-slate-900 shadow-sm border border-slate-200/30')
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Table Content */}
      {applications.length === 0 ? (
        // Empty State: No applications at all
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
            <FiInbox className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className={`text-base font-extrabold ${isDarkMode ? "text-white" : "text-slate-800"}`}>No Applications Logged</h3>
            <p className={`text-xs leading-relaxed font-semibold max-w-sm mx-auto ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>
              Your tracking history is currently empty. Visit the scholarship directory, pick an opportunity, and click apply to start logging.
            </p>
          </div>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            Browse Scholarships
          </Link>
        </motion.div>
      ) : filteredApplications.length === 0 ? (
        // Empty State: Filters returned no results
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border border-dashed rounded-[32px] p-12 text-center max-w-lg mx-auto space-y-4 ${
            isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mx-auto ${
            isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-400"
          }`}>
            <FiX className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-850"}`}>No Matches Found</h3>
            <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>
              No tracked applications match your current search terms or selected status filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('All');
            }}
            className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isDarkMode 
                ? "border-slate-700 text-slate-300 hover:bg-slate-800" 
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Clear Filters
          </button>
        </motion.div>
      ) : (
        // Desktop View: Table
        <>
          <div className={`border rounded-[32px] overflow-hidden shadow-sm ${
            isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200/50"
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-extrabold uppercase tracking-wider ${
                    isDarkMode ? "border-slate-800 bg-slate-950 text-slate-500" : "border-slate-100 bg-slate-50/50 text-slate-400"
                  }`}>
                    <th className="py-4.5 px-6">Scholarship</th>
                    <th className="py-4.5 px-6">Provider</th>
                    <th className="py-4.5 px-6 text-center">Applied Date</th>
                    <th className="py-4.5 px-6 text-center">Status</th>
                    <th className="py-4.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs font-semibold ${
                  isDarkMode ? "divide-slate-800 text-slate-300" : "divide-slate-100 text-slate-750"
                }`}>
                  <AnimatePresence mode="popLayout">
                    {filteredApplications.map((app) => (
                      <motion.tr 
                        key={app.id} 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className={isDarkMode ? "hover:bg-slate-850/40 transition-colors" : "hover:bg-slate-50/30 transition-colors"}
                      >
                        <td className={`py-4.5 px-6 font-extrabold max-w-[260px] truncate ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                          {app.scholarshipName}
                        </td>
                        <td className={`py-4.5 px-6 font-bold max-w-[180px] truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {app.provider}
                        </td>
                        <td className={`py-4.5 px-6 text-center font-bold ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                          {formatDate(app.appliedDate)}
                        </td>
                        <td className="py-4.5 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-extrabold ${getStatusBadgeStyles(app.status)}`}>
                              {app.status}
                            </span>
                            
                            {/* Inline Status Select Switcher */}
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                              className={`px-1.5 py-1 text-[9px] border rounded-md focus:outline-none cursor-pointer font-bold ${
                                isDarkMode 
                                  ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600" 
                                  : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300"
                              }`}
                              title="Update tracking status"
                            >
                              {statusOptions.map(opt => (
                                <option key={opt} value={opt} className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <button
                            onClick={() => handleDeleteApplication(app.id, app.scholarshipName)}
                            className={`p-2 border border-transparent rounded-xl transition-all cursor-pointer inline-flex items-center justify-center ${
                              isDarkMode 
                                ? "text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/50" 
                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100"
                            }`}
                            title="Delete record"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
 
          {/* Mobile View: Cards Grid */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            <AnimatePresence mode="popLayout">
              {filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`border rounded-2xl p-5 shadow-sm space-y-4 ${
                    isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200/50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{app.provider}</span>
                      <h4 className={`text-sm font-extrabold tracking-tight leading-snug ${isDarkMode ? "text-white" : "text-slate-800"}`}>{app.scholarshipName}</h4>
                    </div>
                    <button
                      onClick={() => handleDeleteApplication(app.id, app.scholarshipName)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isDarkMode ? "text-slate-400 hover:text-rose-400 hover:bg-rose-950/20" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  </div>
 
                  <div className={`p-3 border rounded-xl space-y-2 text-xs ${
                    isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-100"
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-semibold">Applied Date</span>
                      <span className={`font-extrabold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>{formatDate(app.appliedDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-450 font-semibold">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${getStatusBadgeStyles(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
 
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Change Status:</span>
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none cursor-pointer ${
                        isDarkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-300" 
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt} className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

    </div>
  );
};

export default ApplicationsPage;
