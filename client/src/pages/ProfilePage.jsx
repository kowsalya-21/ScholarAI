import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Format currency value safely
  const formatIncome = (incomeVal) => {
    if (incomeVal === undefined || incomeVal === null) return 'N/A';
    const num = Number(incomeVal);
    if (isNaN(num)) return incomeVal;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans pb-12">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and manage your academic matching profile.</p>
      </div>

      {/* Main Details Panel */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-8">
        
        {/* Section 1: Academic Profile */}
        <div className="space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5">Academic Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Full Name</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.fullName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Current College</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.college || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Course major</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.course || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Academic Year</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.year || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">State of Domicile</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.state || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Gender</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.gender || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Eligibility Parameters */}
        <div className="space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5">Eligibility Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Cumulative GPA</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.cgpa !== undefined ? `${user.cgpa} / 10.0` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Family Annual Income</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatIncome(user.familyIncome)}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Social Category</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.category || 'General'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Skills Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2.5">Academic Skills & Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills && user.skills.length > 0 ? (
              user.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 text-xs font-bold border border-primary-100 dark:border-primary-800 shadow-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-550 font-semibold italic">No skills listed in profile.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
