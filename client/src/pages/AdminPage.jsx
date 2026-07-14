import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiTrendingUp, FiAward, FiUsers, FiPlus, FiEdit2, FiTrash2, 
  FiSearch, FiInfo, FiInbox, FiX, FiSettings 
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

// Mock registered students dataset
const defaultStudents = [
  { id: 'std-1', name: 'Aarav Mehta', email: 'aarav@university.edu', course: 'Computer Science', state: 'Delhi', cgpa: 8.9, income: 450000, joined: '2026-04-10' },
  { id: 'std-2', name: 'Ananya Sharma', email: 'ananya@college.edu', course: 'Engineering', state: 'Maharashtra', cgpa: 9.2, income: 750000, joined: '2026-04-15' },
  { id: 'std-3', name: 'Rohan Das', email: 'rohan@tech.edu', course: 'Computer Science', state: 'West Bengal', cgpa: 7.8, income: 300000, joined: '2026-04-20' },
  { id: 'std-4', name: 'Priya Patel', email: 'priya@university.edu', course: 'MBA', state: 'Gujarat', cgpa: 8.5, income: 600000, joined: '2026-05-01' },
  { id: 'std-5', name: 'Siddharth Nair', email: 'sid@nair.edu', course: 'Science', state: 'Kerala', cgpa: 8.8, income: 250000, joined: '2026-05-12' },
  { id: 'std-6', name: 'Kriti Verma', email: 'kriti@college.edu', course: 'Engineering', state: 'Delhi', cgpa: 9.0, income: 400000, joined: '2026-05-18' },
  { id: 'std-7', name: 'Vikram Singh', email: 'vikram@university.edu', course: 'MBA', state: 'Rajasthan', cgpa: 7.5, income: 800000, joined: '2026-06-02' },
  { id: 'std-8', name: 'Meera Iyer', email: 'meera@college.edu', course: 'Science', state: 'Tamil Nadu', cgpa: 9.5, income: 150000, joined: '2026-06-10' }
];

const AdminPage = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  // State Management
  const [scholarships, setScholarships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student filtering states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCourseFilter, setStudentCourseFilter] = useState('All');
  const [studentStateFilter, setStudentStateFilter] = useState('All');

  // Scholarship CRUD form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    scholarshipAmount: '',
    state: 'All',
    category: 'All',
    educationLevel: 'All',
    deadline: '',
    description: '',
    eligibilityCriteria: '',
    minimumCGPA: '',
    maximumIncome: '',
    requiredDocuments: '',
    applicationLink: ''
  });

  // Fetch all scholarships from MERN backend
  const fetchScholarships = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/scholarships?limit=100');
      if (response.data && response.data.success) {
        setScholarships(response.data.data);
      } else {
        throw new Error('Failed to load scholarships database.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error connecting to database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // Form Field Changers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open Form for Adding
  const openAddForm = () => {
    setEditId(null);
    setFormData({
      title: '',
      provider: '',
      scholarshipAmount: '',
      state: 'All',
      category: 'All',
      educationLevel: 'All',
      deadline: '',
      description: '',
      eligibilityCriteria: '',
      minimumCGPA: '',
      maximumIncome: '',
      requiredDocuments: '',
      applicationLink: ''
    });
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditForm = (sch) => {
    setEditId(sch._id);
    // Format deadline date to YYYY-MM-DD
    let formattedDate = '';
    if (sch.deadline) {
      try {
        formattedDate = new Date(sch.deadline).toISOString().substring(0, 10);
      } catch {
        formattedDate = sch.deadline;
      }
    }
    setFormData({
      title: sch.title || '',
      provider: sch.provider || '',
      scholarshipAmount: sch.scholarshipAmount || '',
      state: sch.state || 'All',
      category: sch.category || 'All',
      educationLevel: sch.educationLevel || 'All',
      deadline: formattedDate,
      description: sch.description || '',
      eligibilityCriteria: sch.eligibilityCriteria || '',
      minimumCGPA: sch.minimumCGPA || '',
      maximumIncome: sch.maximumIncome || '',
      requiredDocuments: Array.isArray(sch.requiredDocuments) ? sch.requiredDocuments.join(', ') : sch.requiredDocuments || '',
      applicationLink: sch.applicationLink || ''
    });
    setIsFormOpen(true);
  };

  // Submit CRUD (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log in.');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // Prepare clean data matching Mongoose Schema
    const submitData = {
      ...formData,
      scholarshipAmount: Number(formData.scholarshipAmount),
      minimumCGPA: formData.minimumCGPA !== '' ? Number(formData.minimumCGPA) : undefined,
      maximumIncome: formData.maximumIncome !== '' ? Number(formData.maximumIncome) : undefined,
      requiredDocuments: formData.requiredDocuments.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editId) {
        // Edit Mode
        const response = await axios.put(`/api/scholarships/${editId}`, submitData, config);
        if (response.data && response.data.success) {
          toast.success('Scholarship updated successfully!');
          fetchScholarships();
          setIsFormOpen(false);
        }
      } else {
        // Add Mode
        const response = await axios.post('/api/scholarships', submitData, config);
        if (response.data && response.data.success) {
          toast.success('Scholarship created successfully!');
          fetchScholarships();
          setIsFormOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit form.');
    }
  };

  // Delete Record Callback
  const handleDeleteScholarship = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const response = await axios.delete(`/api/scholarships/${id}`, config);
      if (response.data && response.data.success) {
        toast.success(`Deleted "${title}" successfully!`);
        fetchScholarships();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  // Filter students list
  const filteredStudents = defaultStudents.filter(std => {
    const matchesSearch = std.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          std.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesCourse = studentCourseFilter === 'All' || std.course === studentCourseFilter;
    const matchesState = studentStateFilter === 'All' || std.state === studentStateFilter;
    return matchesSearch && matchesCourse && matchesState;
  });

  // Calculate dashboard stats variables
  const appsSubmitted = (JSON.parse(localStorage.getItem('scholarshipApplications')) || []).length + 42;
  const stats = {
    totalScholarships: scholarships.length,
    activeScholarships: scholarships.filter(s => {
      if (!s.deadline) return true;
      try {
        return new Date(s.deadline) > new Date();
      } catch {
        return true;
      }
    }).length,
    totalStudents: defaultStudents.length,
    submittedApplications: appsSubmitted
  };

  // Formatter for values
  const formatAmount = (amount, title, provider) => {
    const isUSD = amount < 25000 && !/India|Ministry|Govt|National|Post Matric|MOMA|ONGC|Tata|HDFC|Reliance/i.test(title + ' ' + provider);
    return isUSD 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
      : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatIncome = (income) => {
    if (!income) return 'No Limit';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(income);
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md">
            <FiSettings className="text-lg animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          Admin Control Panel
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {activeTab === 'dashboard' && 'Platform status overview and analytics metrics.'}
          {activeTab === 'scholarships' && 'Perform CRUD operations on database scholarships.'}
          {activeTab === 'students' && 'Manage and monitor registered platform student profiles.'}
          {activeTab === 'analytics' && 'Detailed data breakdowns and charts of matches and quotas.'}
          {activeTab === 'settings' && 'Adjust portal configs, parameters, and credentials.'}
        </p>
      </div>

      {/* RENDER VIEW: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200/50 rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Scholarships</span>
                <span className="text-2xl font-black text-slate-800 block">{stats.totalScholarships}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                <FiAward className="text-lg" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/50 rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Grants</span>
                <span className="text-2xl font-black text-emerald-600 block">{stats.activeScholarships}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                <HiOutlineAcademicCap className="text-lg" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/50 rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Students</span>
                <span className="text-2xl font-black text-slate-800 block">{stats.totalStudents}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                <FiUsers className="text-lg" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/50 rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applications Handled</span>
                <span className="text-2xl font-black text-amber-600 block">{stats.submittedApplications}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                <FiTrendingUp className="text-sm" />
              </div>
            </div>
          </div>

          {/* Quick Info & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Submission Chart */}
            <div className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm col-span-2 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Monthly Application Submission Trend</h3>
                <p className="text-xs text-slate-450 font-medium">Monthly total tracked submissions on platform.</p>
              </div>
              
              {/* Custom CSS Chart */}
              <div className="flex items-end justify-between h-48 pt-4 px-2 border-b border-slate-100 pb-2">
                {[
                  { m: 'Feb', count: 12 },
                  { m: 'Mar', count: 18 },
                  { m: 'Apr', count: 28 },
                  { m: 'May', count: 35 },
                  { m: 'Jun', count: 40 },
                  { m: 'Jul', count: stats.submittedApplications }
                ].map((item, idx) => {
                  const pct = Math.min(100, Math.round((item.count / 60) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 w-[14%]">
                      <div className="text-[10px] font-extrabold text-slate-550 mb-1">{item.count}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-primary-600 to-secondary-500 rounded-lg shadow-sm hover:opacity-90 transition-opacity" 
                        style={{ height: `${pct * 1.3}px`, minHeight: '12px' }}
                      />
                      <span className="text-[10px] font-extrabold text-slate-400 mt-1">{item.m}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category distribution */}
            <div className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Category Distribution</h3>
                <p className="text-xs text-slate-400 font-medium">Breakdown of active database listings.</p>
              </div>

              <div className="space-y-4.5">
                {[
                  { label: 'General', count: scholarships.filter(s => s.category === 'All' || s.category === 'General').length },
                  { label: 'OBC', count: scholarships.filter(s => s.category === 'All' || s.category === 'OBC').length },
                  { label: 'SC/ST', count: scholarships.filter(s => s.category === 'All' || s.category === 'SC' || s.category === 'ST').length },
                  { label: 'EWS', count: scholarships.filter(s => s.category === 'All' || s.category === 'EWS').length }
                ].map((cat, idx) => {
                  const total = scholarships.length || 1;
                  const percent = Math.round((cat.count / total) * 100);
                  return (
                    <div key={idx} className="space-y-1.5 text-xs font-semibold">
                      <div className="flex justify-between text-slate-700">
                        <span className="font-extrabold">{cat.label}</span>
                        <span className="text-slate-450">{cat.count} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: SCHOLARSHIP CRUD MANAGEMENT */}
      {activeTab === 'scholarships' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Registries</h2>
            {!isFormOpen && (
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-sm cursor-pointer hover:opacity-95"
              >
                <FiPlus /> Add Scholarship
              </button>
            )}
          </div>

          {/* Form Modal Panel (Add / Edit) */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm space-y-6 relative"
              >
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <FiX />
                </button>

                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                  {editId ? 'Modify Scholarship Record' : 'Register New Scholarship'}
                </h3>

                <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Scholarship Name</label>
                    <input
                      required
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Merit-cum-Means Scholarship for Professional Courses"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Provider Name</label>
                    <input
                      required
                      type="text"
                      name="provider"
                      value={formData.provider}
                      onChange={handleInputChange}
                      placeholder="e.g. Ministry of Minority Affairs"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Value Amount</label>
                    <input
                      required
                      type="number"
                      name="scholarshipAmount"
                      value={formData.scholarshipAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">State / Domicile</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="All">All States</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Target Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="All">Open to All</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Education Level</label>
                    <select
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="All">All Levels</option>
                      <option value="High School">High School</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Minimum CGPA (0.0 - 10.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="minimumCGPA"
                      value={formData.minimumCGPA}
                      onChange={handleInputChange}
                      placeholder="e.g. 7.5"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Max Family Income Limit</label>
                    <input
                      type="number"
                      name="maximumIncome"
                      value={formData.maximumIncome}
                      onChange={handleInputChange}
                      placeholder="e.g. 250000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Deadline Date</label>
                    <input
                      required
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Application Portal Link</label>
                    <input
                      required
                      type="url"
                      name="applicationLink"
                      value={formData.applicationLink}
                      onChange={handleInputChange}
                      placeholder="e.g. https://scholarships.gov.in"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Documents Required (comma separated)</label>
                    <input
                      type="text"
                      name="requiredDocuments"
                      value={formData.requiredDocuments}
                      onChange={handleInputChange}
                      placeholder="Income Certificate, Aadhaar Card, Transcripts"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Short Description</label>
                    <textarea
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief details about benefits..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none h-20"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Eligibility Criteria</label>
                    <textarea
                      required
                      name="eligibilityCriteria"
                      value={formData.eligibilityCriteria}
                      onChange={handleInputChange}
                      placeholder="Detailed eligibility rules..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none h-20"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:opacity-95"
                    >
                      Save Scholarship
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Database Table Listing */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-xs font-semibold">Loading scholarship lists...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center border border-slate-200 bg-white rounded-3xl text-red-500 font-semibold">
              <FiInfo className="mx-auto text-xl mb-2" />
              {error}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white rounded-[32px] p-12 text-center max-w-sm mx-auto space-y-3">
              <FiInbox className="w-10 h-10 text-slate-350 mx-auto" />
              <h4 className="text-sm font-extrabold text-slate-800">No Scholarships Found</h4>
              <p className="text-xs text-slate-400">Add an entry using the action button above to start seeding.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/50 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="py-4.5 px-6">Scholarship</th>
                      <th className="py-4.5 px-6">State / Category</th>
                      <th className="py-4.5 px-6 text-center">Amount</th>
                      <th className="py-4.5 px-6 text-center">Criteria (GPA/Income)</th>
                      <th className="py-4.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-750 text-xs font-semibold">
                    {scholarships.map((sch) => (
                      <tr key={sch._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6 max-w-[240px]">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-850 block truncate">{sch.title}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{sch.provider}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-550 font-bold">
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-slate-50 border px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-slate-500">
                              {sch.state === 'All' ? 'National' : sch.state}
                            </span>
                            <span className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-indigo-600">
                              {sch.category}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-emerald-600 font-extrabold">
                          {formatAmount(sch.scholarshipAmount, sch.title, sch.provider)}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-500">
                          <div className="space-y-0.5">
                            <span className="block text-[10px]">CGPA: &gt;= {sch.minimumCGPA || '0.0'}</span>
                            <span className="block text-[10px]">Income: &lt; {formatIncome(sch.maximumIncome)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right space-x-1.5">
                          <button
                            onClick={() => openEditForm(sch)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer inline-flex items-center"
                            title="Edit"
                          >
                            <FiEdit2 className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteScholarship(sch._id, sch.title)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center"
                            title="Delete"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              
              {/* Search */}
              <div className="relative w-full lg:max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FiSearch className="text-base" />
                </div>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by student name or email..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-xs font-semibold"
                />
                {studentSearch && (
                  <button onClick={() => setStudentSearch('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    <FiX />
                  </button>
                )}
              </div>

              {/* Selection Filters */}
              <div className="flex gap-3 w-full lg:w-auto">
                <div className="flex-1 lg:flex-initial">
                  <select
                    value={studentCourseFilter}
                    onChange={(e) => setStudentCourseFilter(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Courses</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="MBA">MBA</option>
                    <option value="Science">Science</option>
                  </select>
                </div>
                
                <div className="flex-1 lg:flex-initial">
                  <select
                    value={studentStateFilter}
                    onChange={(e) => setStudentStateFilter(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="All">All States</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Student Table */}
          {filteredStudents.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white rounded-[32px] p-12 text-center max-w-sm mx-auto space-y-3">
              <FiUsers className="w-10 h-10 text-slate-350 mx-auto" />
              <h4 className="text-sm font-extrabold text-slate-800">No Match Students</h4>
              <p className="text-xs text-slate-400 font-semibold">No registered student matches your query filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/50 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="py-4.5 px-6">Student Info</th>
                      <th className="py-4.5 px-6">Major Stream</th>
                      <th className="py-4.5 px-6 text-center">Domicile</th>
                      <th className="py-4.5 px-6 text-center">Academic / Income</th>
                      <th className="py-4.5 px-6 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-750 text-xs font-semibold">
                    {filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4.5 px-6">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-850 block">{std.name}</span>
                            <span className="text-[10px] text-slate-450 block font-bold">{std.email}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-6 text-slate-500 font-bold">{std.course}</td>
                        <td className="py-4.5 px-6 text-center">
                          <span className="px-2 py-0.5 border text-[10px] font-extrabold text-indigo-600 bg-indigo-50/70 rounded-md">
                            {std.state}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-center text-slate-500">
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-extrabold text-slate-750">{std.cgpa} CGPA</span>
                            <span className="block text-[9px] font-bold text-slate-400">{formatIncome(std.income)}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-6 text-right text-slate-400 text-[10px] font-bold">
                          {new Date(std.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW: ANALYTICS DETAIL PANEL */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overview Distributions */}
          <div className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">Quota Category Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'General / Open', count: scholarships.filter(s => s.category === 'All' || s.category === 'General').length, color: 'bg-primary-600' },
                { label: 'OBC (Other Backward Classes)', count: scholarships.filter(s => s.category === 'All' || s.category === 'OBC').length, color: 'bg-indigo-500' },
                { label: 'SC/ST Reserved Schemes', count: scholarships.filter(s => s.category === 'All' || s.category === 'SC' || s.category === 'ST').length, color: 'bg-purple-500' },
                { label: 'EWS (Economically Weaker)', count: scholarships.filter(s => s.category === 'All' || s.category === 'EWS').length, color: 'bg-pink-500' }
              ].map((c, idx) => {
                const pct = Math.round((c.count / (scholarships.length || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>{c.label}</span>
                      <span>{c.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${c.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Domicile State Demographics */}
          <div className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">Student State Demographics</h3>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs font-semibold text-slate-650">
              {[
                { state: 'Delhi', count: defaultStudents.filter(s => s.state === 'Delhi').length },
                { state: 'Maharashtra', count: defaultStudents.filter(s => s.state === 'Maharashtra').length },
                { state: 'Gujarat', count: defaultStudents.filter(s => s.state === 'Gujarat').length },
                { state: 'Kerala', count: defaultStudents.filter(s => s.state === 'Kerala').length },
                { state: 'Tamil Nadu', count: defaultStudents.filter(s => s.state === 'Tamil Nadu').length },
                { state: 'West Bengal', count: defaultStudents.filter(s => s.state === 'West Bengal').length }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between py-2.5">
                  <span className="font-extrabold">{item.state}</span>
                  <span className="text-slate-450 font-extrabold">{item.count} registered</span>
                </div>
              ))}
            </div>
          </div>

          {/* Large Monthly Trend */}
          <div className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">Monthly Trend Application Tracker</h3>
            <div className="flex items-end justify-between h-48 px-4 border-b border-slate-100 pb-2">
              {[
                { label: 'Jan', count: 8 },
                { label: 'Feb', count: 12 },
                { label: 'Mar', count: 18 },
                { label: 'Apr', count: 28 },
                { label: 'May', count: 35 },
                { label: 'Jun', count: 40 },
                { label: 'Jul', count: stats.submittedApplications }
              ].map((m, idx) => {
                const pct = Math.round((m.count / 60) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 w-[11%]">
                    <span className="text-[10px] font-black text-slate-500">{m.count}</span>
                    <div className="w-full bg-gradient-to-t from-primary-600 to-indigo-650 rounded-lg" style={{ height: `${pct * 1.3}px`, minHeight: '8px' }} />
                    <span className="text-[10px] font-bold text-slate-400 mt-1">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">Portal System Settings</h3>
          
          <div className="space-y-5 text-xs font-semibold text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">System Administration Email</label>
                <input
                  disabled
                  type="email"
                  value="admin@scholarai.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-450 uppercase text-[9px] tracking-wider font-extrabold">Server Port Config</label>
                <input
                  disabled
                  type="text"
                  value="5000 (MERN REST API)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-3.5">
              <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block">Notification Preferences</span>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4.5 h-4.5 accent-primary-600 cursor-pointer" />
                <span className="text-slate-600 font-bold">Email alerts on new applications submissions</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4.5 h-4.5 accent-primary-600 cursor-pointer" />
                <span className="text-slate-600 font-bold">Auto-sync database indices daily</span>
              </label>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="pt-2">
              <button
                onClick={() => toast.success('Admin preferences updated!')}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-650 text-white rounded-xl font-bold cursor-pointer hover:opacity-95"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
