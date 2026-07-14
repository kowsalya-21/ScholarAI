import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiUser, FiBell, FiShield, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  
  // Tab navigation & loading states
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile state for all 11 fields
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    college: '',
    course: '',
    year: '',
    cgpa: '',
    familyIncome: '',
    category: 'General',
    gender: 'Male',
    state: '',
    skills: '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    matchingAlerts: true,
    deadlineAlerts: true,
    weeklyDigest: false,
  });

  // Fetch current user details on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please log in.');
        navigate('/login');
        return;
      }

      setIsLoading(true);
      try {
        // Priority A: Fetch from GET /api/auth/me
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && response.data.success && response.data.user) {
          populateForm(response.data.user);
        } else {
          throw new Error('API request unsuccessful, trying local storage...');
        }
      } catch (err) {
        console.warn('API profile fetch failed, trying localStorage fallback:', err);
        // Priority B: Read from local storage
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            populateForm(JSON.parse(stored));
          } else {
            toast.error('Failed to retrieve user profile.');
            navigate('/login');
          }
        } catch {
          toast.error('Invalid user session details.');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const populateForm = (user) => {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        college: user.college || '',
        course: user.course || '',
        year: user.year || '',
        cgpa: user.cgpa !== undefined && user.cgpa !== null ? String(user.cgpa) : '',
        familyIncome: user.familyIncome !== undefined && user.familyIncome !== null ? String(user.familyIncome) : '',
        category: user.category || 'General',
        gender: user.gender || 'Male',
        state: user.state || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || '',
      });
    };

    fetchUserProfile();
  }, [navigate]);

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Preferences updated!');
  };

  // Submit profile updates to MongoDB
  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log in.');
      navigate('/login');
      return;
    }

    try {
      // Prepare schema payloads
      const submitData = {
        ...profileData,
        cgpa: profileData.cgpa !== '' ? Number(profileData.cgpa) : undefined,
        familyIncome: profileData.familyIncome !== '' ? Number(profileData.familyIncome) : undefined,
        skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const response = await axios.put('/api/users/profile', submitData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success && response.data.user) {
        const updatedUser = response.data.user;
        
        // Sync to local storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch event for other components (like TopNavbar) to refresh
        window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUser }));
        
        // Refresh local inputs state
        setProfileData({
          fullName: updatedUser.fullName || '',
          email: updatedUser.email || '',
          college: updatedUser.college || '',
          course: updatedUser.course || '',
          year: updatedUser.year || '',
          cgpa: updatedUser.cgpa !== undefined && updatedUser.cgpa !== null ? String(updatedUser.cgpa) : '',
          familyIncome: updatedUser.familyIncome !== undefined && updatedUser.familyIncome !== null ? String(updatedUser.familyIncome) : '',
          category: updatedUser.category || 'General',
          gender: updatedUser.gender || 'Male',
          state: updatedUser.state || '',
          skills: Array.isArray(updatedUser.skills) ? updatedUser.skills.join(', ') : updatedUser.skills || '',
        });

        toast.success('Settings saved successfully!', {
          icon: '✨',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save settings.');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: FiUser },
    { id: 'notifications', name: 'Notification Settings', icon: FiBell },
    { id: 'security', name: 'Security & Password', icon: FiShield },
  ];

  return (
    <div className="space-y-8 font-sans max-w-4xl pb-12">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account settings, preferences, and notifications.</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Side: Navigation Tabs */}
        <div className="md:col-span-1 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-primary-600/10 to-secondary-600/10 dark:from-primary-500/20 dark:to-secondary-500/20 border-primary-500/30 dark:border-primary-500/20 text-primary-700 dark:text-primary-400 font-extrabold shadow-sm'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="text-base" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="md:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md shadow-slate-100/50 dark:shadow-none"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-semibold">Retrieving profile...</p>
              </div>
            ) : (
              <>
                {activeTab === 'profile' && (
                  <form onSubmit={handleSave} className="space-y-6">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">Personal Information</h3>
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                        <input
                          required
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          required
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-950/80 text-xs font-medium transition-all"
                        />
                      </div>

                      {/* College */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">College / University</label>
                        <input
                          type="text"
                          value={profileData.college}
                          onChange={(e) => setProfileData(prev => ({ ...prev, college: e.target.value }))}
                          placeholder="e.g. National Institute of Technology"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>

                      {/* Course */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course / Stream</label>
                        <input
                          type="text"
                          value={profileData.course}
                          onChange={(e) => setProfileData(prev => ({ ...prev, course: e.target.value }))}
                          placeholder="e.g. Computer Science & Engineering"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>

                      {/* Year of Study */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Year of Study</label>
                        <input
                          type="text"
                          value={profileData.year}
                          onChange={(e) => setProfileData(prev => ({ ...prev, year: e.target.value }))}
                          placeholder="e.g. 3rd Year"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>

                      {/* CGPA */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Academic CGPA (0.0 - 10.0)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={profileData.cgpa}
                          onChange={(e) => setProfileData(prev => ({ ...prev, cgpa: e.target.value }))}
                          placeholder="e.g. 8.5"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>

                      {/* Family Income */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Annual Family Income (INR)</label>
                        <input
                          type="number"
                          min="0"
                          value={profileData.familyIncome}
                          onChange={(e) => setProfileData(prev => ({ ...prev, familyIncome: e.target.value }))}
                          placeholder="e.g. 450000"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reservation Category</label>
                        <select
                          value={profileData.category}
                          onChange={(e) => setProfileData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-bold cursor-pointer"
                        >
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="EWS">EWS</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Gender */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender</label>
                        <select
                          value={profileData.gender}
                          onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-bold cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      {/* State */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">State / Domicile</label>
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="e.g. Delhi"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>

                      {/* Skills */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills (comma separated)</label>
                        <input
                          type="text"
                          value={profileData.skills}
                          onChange={(e) => setProfileData(prev => ({ ...prev, skills: e.target.value }))}
                          placeholder="e.g. React.js, Python, SQL, Technical Writing"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-950/80 text-xs font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-xs flex items-center gap-2 cursor-pointer"
                      >
                        <FiCheck />
                        <span>Save Changes</span>
                      </motion.button>
                    </div>
                  </form>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">Email Preferences</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">New Scholarship Alerts</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Get notified immediately when matched scholarships are published.</p>
                        </div>
                        <button
                          onClick={() => handleToggle('matchingAlerts')}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.matchingAlerts ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.matchingAlerts ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Deadline Reminders</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Receive alerts for saved scholarships closing in 7 days.</p>
                        </div>
                        <button
                          onClick={() => handleToggle('deadlineAlerts')}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.deadlineAlerts ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.deadlineAlerts ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly Summary Newsletter</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Receive a curated digest of top recommended scholarships each Monday.</p>
                        </div>
                        <button
                          onClick={() => handleToggle('weeklyDigest')}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.weeklyDigest ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.weeklyDigest ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handleSave} className="space-y-6">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">Update Password</h3>

                    <div className="space-y-4 max-w-md">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-950/80 text-xs font-medium transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-955/80 text-xs font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-xs flex items-center gap-2 cursor-pointer"
                      >
                        <FiCheck />
                        <span>Update Password</span>
                      </motion.button>
                    </div>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
