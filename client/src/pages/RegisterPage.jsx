import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUser, FiEye, FiEyeOff, FiArrowLeft, 
  FiCheck, FiX, FiBookOpen, FiDollarSign, FiBriefcase 
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGraduationCap } from 'react-icons/fa';
import toast from 'react-hot-toast';
import educationIllustration from '../assets/education_illustration.png';

const RegisterPage = () => {
  const navigate = useNavigate();

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    course: '',
    academicYear: '',
    cgpa: '',
    familyIncome: '',
    category: '',
    state: '',
    gender: '',
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Status & Validation States
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // States list (Indian States + general categories)
  const statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 
    'Delhi', 'Other'
  ];

  const coursesList = [
    'B.Tech / B.E.', 'M.Tech / M.E.', 'B.Sc', 'M.Sc', 'B.A.', 'M.A.', 
    'B.Com', 'M.Com', 'BBA', 'MBA', 'BCA', 'MCA', 'Ph.D', 'Diploma', 'Other'
  ];

  const yearsList = [
    '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Post Graduate', 'Other'
  ];

  const incomeList = [
    'Under ₹2 Lakhs', '₹2 - ₹5 Lakhs', '₹5 - ₹8 Lakhs', 'Above ₹8 Lakhs'
  ];

  const categoriesList = [
    'General', 'OBC', 'SC', 'ST', 'EWS', 'Other'
  ];

  // Password Strength Calculator
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score, label: 'None', color: 'bg-slate-700', textClass: 'text-slate-500' };
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500 w-1/4', textClass: 'text-red-400' };
      case 2:
        return { score, label: 'Fair', color: 'bg-orange-500 w-2/4', textClass: 'text-orange-400' };
      case 3:
        return { score, label: 'Good', color: 'bg-yellow-500 w-3/4', textClass: 'text-yellow-400' };
      case 4:
        return { score, label: 'Strong', color: 'bg-emerald-500 w-full', textClass: 'text-emerald-400' };
      default:
        return { score, label: 'Weak', color: 'bg-red-500 w-1/4', textClass: 'text-red-400' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate single field
  const validateField = (name, value) => {
    let errorMsg = '';
    
    if (!value && name !== 'confirmPassword') {
      errorMsg = 'This field is required';
    } else {
      if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        errorMsg = 'Please enter a valid email address';
      }
      if (name === 'password' && value.length < 8) {
        errorMsg = 'Password must be at least 8 characters long';
      }
      if (name === 'confirmPassword') {
        if (!value) {
          errorMsg = 'Please confirm your password';
        } else if (value !== formData.password) {
          errorMsg = 'Passwords do not match';
        }
      }
      if (name === 'cgpa') {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 10) {
          errorMsg = 'Enter CGPA between 0.00 and 10.00';
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // Skill Tags Handlers
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(/,/g, '');
      if (val && !skills.includes(val)) {
        setSkills((prev) => [...prev, val]);
        setSkillInput('');
        if (errors.skills) {
          setErrors((prev) => ({ ...prev, skills: '' }));
        }
      }
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Main Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // General Validations
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = 'This field is required';
      }
    });

    // Custom validations
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.cgpa) {
      const num = parseFloat(formData.cgpa);
      if (isNaN(num) || num < 0 || num > 10) {
        newErrors.cgpa = 'Enter CGPA between 0.00 and 10.00';
      }
    }
    if (skills.length === 0) {
      newErrors.skills = 'Please add at least one academic skill tag';
    }
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error('Please correct the errors in the form.');
      return;
    }

    setErrors({});
    setIsLoading(true);

    const parseIncome = (incomeStr) => {
      if (!incomeStr) return 0;
      if (incomeStr.includes('Under ₹2')) return 150000;
      if (incomeStr.includes('₹2 - ₹5')) return 350000;
      if (incomeStr.includes('₹5 - ₹8')) return 650000;
      if (incomeStr.includes('Above ₹8')) return 1000000;
      const parsed = parseInt(incomeStr.replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    const normalizedGender = formData.gender === 'Prefer Not to Say' ? 'Prefer not to say' : formData.gender;

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      college: formData.collegeName.trim(),
      course: formData.course,
      year: formData.academicYear,
      cgpa: parseFloat(formData.cgpa),
      familyIncome: parseIncome(formData.familyIncome),
      category: formData.category,
      state: formData.state,
      gender: normalizedGender,
      skills: skills
    };

    try {
      const response = await axios.post('/api/auth/register', payload);
      
      if (response.data && response.data.success) {
        setIsSuccess(true);
        setIsLoading(false);
        
        // Clear registration form
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          collegeName: '',
          course: '',
          academicYear: '',
          cgpa: '',
          familyIncome: '',
          category: '',
          state: '',
          gender: '',
        });
        setSkills([]);
        setAcceptTerms(false);
        
        toast.success("Registration successful! Please log in.");
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      setIsLoading(false);
      
      let serverMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      if (serverMsg === 'Network Error' || !error.response) {
        serverMsg = 'Connection error. Please try again or check your network.';
      }

      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg || 'Validation error');
        });
      } else if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error('An error occurred during registration.');
      }
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const floatingSphereVariants = {
    animate1: {
      y: [0, 50, 0],
      x: [0, 30, 0],
      transition: { duration: 9, repeat: Infinity, ease: "easeInOut" }
    },
    animate2: {
      y: [0, -40, 0],
      x: [0, -30, 0],
      transition: { duration: 11, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden bg-slate-900 text-slate-100 selection:bg-primary-500 selection:text-white font-sans">
      
      {/* Background Glowing Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          variants={floatingSphereVariants}
          animate="animate1"
          className="absolute top-[5%] left-[10%] w-80 h-80 rounded-full bg-primary-600/15 blur-[90px]"
        />
        <motion.div 
          variants={floatingSphereVariants}
          animate="animate2"
          className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full bg-secondary-600/10 blur-[100px]"
        />
        <div className="absolute top-[30%] left-[45%] w-72 h-72 rounded-full bg-indigo-500/10 blur-[90px]" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 group"
        >
          <FiArrowLeft className="text-base group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Left Column: Branding and Illustration */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative bg-slate-950/40 border-r border-white/5 overflow-hidden z-10">
        
        {/* Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 -z-10" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-secondary-700/10 blur-[130px]" />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <FaGraduationCap className="text-xl" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent tracking-tight">
            Scholar<span className="text-white">AI</span>
          </span>
        </div>

        {/* Central Illustration Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="flex flex-col items-center justify-center my-auto py-8"
        >
          <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center mb-10">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-secondary-500/15 to-primary-500/15 blur-[60px] animate-pulse duration-[5000ms]" />
            <img 
              src={educationIllustration} 
              alt="Education Journey Illustration" 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(168,85,247,0.25)] animate-float"
              style={{
                animation: 'float 6s ease-in-out infinite'
              }}
            />
          </div>

          <div className="text-center max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Start Your Scholarship Journey Today
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Join thousands of students discovering scholarships with AI. Setup your academic profile and find your perfect funding match in seconds.
            </p>
          </div>
        </motion.div>

        {/* Footer Credit */}
        <div className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} ScholarAI. All rights reserved.
        </div>
      </div>

      {/* Right Column: Scrollable Registration Form Card */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 xl:p-16 z-10 overflow-y-auto w-full">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 mb-8 mt-16">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <FaGraduationCap className="text-lg" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent tracking-tight">
            Scholar<span className="text-white">AI</span>
          </span>
        </div>

        {/* Animated Wrapper Container */}
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[650px] my-6"
        >
          {/* Registration Glass Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[32px] p-6 md:p-10 relative overflow-hidden"
          >
            {/* Gradient Top Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500" />
            
            {/* Header Titles */}
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                Create Student Account
              </h2>
              <p className="text-sm text-slate-400">
                Please complete your academic profile to help us find scholarship matches.
              </p>
            </motion.div>

            {/* Google Signup Button */}
            <motion.div variants={itemVariants} className="mb-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:border-white/20"
                disabled={isLoading || isSuccess}
              >
                <FcGoogle className="text-xl" />
                <span>Sign up with Google</span>
              </motion.button>
              <div className="flex items-center gap-4 py-5">
                <div className="h-px bg-white/10 flex-grow" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">or register manually</span>
                <div className="h-px bg-white/10 flex-grow" />
              </div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ---------------- SECTION 1: ACCOUNT SETUP ---------------- */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <FiUser className="text-primary-400 text-lg" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Account Credentials</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={() => validateField('fullName', formData.fullName)}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 bg-slate-950/40 border ${
                        errors.fullName ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'
                      } rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding`}
                      disabled={isLoading || isSuccess}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-400 font-medium">{errors.fullName}</p>}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => validateField('email', formData.email)}
                      placeholder="name@university.edu"
                      className={`w-full px-4 py-3 bg-slate-950/40 border ${
                        errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'
                      } rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding`}
                      disabled={isLoading || isSuccess}
                    />
                    {errors.email && <p className="text-[11px] text-red-400 font-medium">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => validateField('password', formData.password)}
                        placeholder="••••••••"
                        className={`w-full pl-4 pr-10 py-3 bg-slate-950/40 border ${
                          errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'
                        } rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding`}
                        disabled={isLoading || isSuccess}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-1 pt-1.5">
                        <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
                          <span className="text-slate-400">Password Strength:</span>
                          <span className={strength.textClass}>{strength.label}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} transition-all duration-300`} />
                        </div>
                      </div>
                    )}
                    {errors.password && <p className="text-[11px] text-red-400 font-medium">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                        placeholder="••••••••"
                        className={`w-full pl-4 pr-10 py-3 bg-slate-950/40 border ${
                          errors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'
                        } rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding`}
                        disabled={isLoading || isSuccess}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-[11px] text-red-400 font-medium">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </motion.div>

              {/* ---------------- SECTION 2: ACADEMIC PROFILE ---------------- */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <FiBookOpen className="text-purple-400 text-lg" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Academic Profile</h3>
                </div>

                {/* College Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">College / University Name *</label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    onBlur={() => validateField('collegeName', formData.collegeName)}
                    placeholder="Delhi Technological University"
                    className={`w-full px-4 py-3 bg-slate-950/40 border ${
                      errors.collegeName ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'
                    } rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding`}
                    disabled={isLoading || isSuccess}
                  />
                  {errors.collegeName && <p className="text-[11px] text-red-400 font-medium">{errors.collegeName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Course Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Course *</label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      onBlur={() => validateField('course', formData.course)}
                      className={`w-full px-3 py-3 bg-slate-950 border ${
                        errors.course ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary-500'
                      } rounded-xl text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-200`}
                      disabled={isLoading || isSuccess}
                    >
                      <option value="" className="bg-slate-900 text-slate-500">Select Course</option>
                      {coursesList.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-100">{opt}</option>
                      ))}
                    </select>
                    {errors.course && <p className="text-[11px] text-red-400 font-medium">{errors.course}</p>}
                  </div>

                  {/* Academic Year Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Academic Year *</label>
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleChange}
                      onBlur={() => validateField('academicYear', formData.academicYear)}
                      className={`w-full px-3 py-3 bg-slate-950 border ${
                        errors.academicYear ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary-500'
                      } rounded-xl text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-200`}
                      disabled={isLoading || isSuccess}
                    >
                      <option value="" className="bg-slate-900 text-slate-500">Select Year</option>
                      {yearsList.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-100">{opt}</option>
                      ))}
                    </select>
                    {errors.academicYear && <p className="text-[11px] text-red-400 font-medium">{errors.academicYear}</p>}
                  </div>

                  {/* CGPA */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">CGPA (out of 10.0) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      onBlur={() => validateField('cgpa', formData.cgpa)}
                      placeholder="9.15"
                      className={`w-full px-4 py-3 bg-slate-950/40 border ${
                        errors.cgpa ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'
                      } rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding`}
                      disabled={isLoading || isSuccess}
                    />
                    {errors.cgpa && <p className="text-[11px] text-red-400 font-medium">{errors.cgpa}</p>}
                  </div>
                </div>
              </motion.div>

              {/* ---------------- SECTION 3: PERSONAL DETAILS ---------------- */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <FiDollarSign className="text-emerald-400 text-lg" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Demographics & Finances</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Family Income */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Annual Family Income *</label>
                    <select
                      name="familyIncome"
                      value={formData.familyIncome}
                      onChange={handleChange}
                      onBlur={() => validateField('familyIncome', formData.familyIncome)}
                      className={`w-full px-3 py-3 bg-slate-950 border ${
                        errors.familyIncome ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary-500'
                      } rounded-xl text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-200`}
                      disabled={isLoading || isSuccess}
                    >
                      <option value="" className="bg-slate-900 text-slate-500">Select Income Range</option>
                      {incomeList.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-100">{opt}</option>
                      ))}
                    </select>
                    {errors.familyIncome && <p className="text-[11px] text-red-400 font-medium">{errors.familyIncome}</p>}
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onBlur={() => validateField('category', formData.category)}
                      className={`w-full px-3 py-3 bg-slate-950 border ${
                        errors.category ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary-500'
                      } rounded-xl text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-200`}
                      disabled={isLoading || isSuccess}
                    >
                      <option value="" className="bg-slate-900 text-slate-500">Select Category</option>
                      {categoriesList.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-100">{opt}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-[11px] text-red-400 font-medium">{errors.category}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* State */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block">State of Domicile *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={() => validateField('state', formData.state)}
                      className={`w-full px-3 py-3 bg-slate-950 border ${
                        errors.state ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary-500'
                      } rounded-xl text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-200`}
                      disabled={isLoading || isSuccess}
                    >
                      <option value="" className="bg-slate-900 text-slate-500">Select Domicile State</option>
                      {statesList.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-100">{opt}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-[11px] text-red-400 font-medium">{errors.state}</p>}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={() => validateField('gender', formData.gender)}
                      className={`w-full px-3 py-3 bg-slate-950 border ${
                        errors.gender ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary-500'
                      } rounded-xl text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-200`}
                      disabled={isLoading || isSuccess}
                    >
                      <option value="" className="bg-slate-900 text-slate-500">Select Gender</option>
                      <option value="Male" className="bg-slate-900 text-slate-100">Male</option>
                      <option value="Female" className="bg-slate-900 text-slate-100">Female</option>
                      <option value="Other" className="bg-slate-900 text-slate-100">Other</option>
                      <option value="Prefer Not to Say" className="bg-slate-900 text-slate-100">Prefer Not to Say</option>
                    </select>
                    {errors.gender && <p className="text-[11px] text-red-400 font-medium">{errors.gender}</p>}
                  </div>
                </div>
              </motion.div>

              {/* ---------------- SECTION 4: SKILLS & PREFERENCES ---------------- */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <FiBriefcase className="text-indigo-400 text-lg" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Skills & Attributes</h3>
                </div>

                {/* Skills Tag Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Academic Skills / Specializations * (Press Enter or Comma to add)
                  </label>
                  <div className={`w-full px-3 py-2 bg-slate-950/40 border ${
                    errors.skills ? 'border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-white/10 focus-within:border-primary-500 focus-within:ring-primary-500/20'
                  } rounded-xl focus-within:ring-4 transition-all duration-250 flex flex-wrap gap-2 items-center`}>
                    
                    {/* Render existing tags */}
                    {skills.map((skill, index) => (
                      <span 
                        key={skill} 
                        className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs font-semibold transition-all hover:bg-primary-500/20"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-500/30 hover:text-white transition-colors text-[10px]"
                        >
                          <FiX />
                        </button>
                      </span>
                    ))}

                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder={skills.length === 0 ? "e.g., Python, Research Writing, Public Speaking" : "Add more..."}
                      className="flex-grow min-w-[120px] bg-transparent border-none outline-none py-1 text-slate-100 placeholder-slate-500 focus:ring-0 text-sm"
                      disabled={isLoading || isSuccess}
                    />
                  </div>
                  {errors.skills && <p className="text-[11px] text-red-400 font-medium">{errors.skills}</p>}
                </div>
              </motion.div>

              {/* Terms and Conditions Checkbox */}
              <motion.div variants={itemVariants} className="space-y-1.5 pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none group text-sm text-slate-300">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked);
                        if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                      }}
                      className="sr-only"
                      disabled={isLoading || isSuccess}
                    />
                    <div className={`w-5 h-5 rounded-md border ${
                      acceptTerms ? 'bg-primary-600 border-primary-500 text-white' : 'border-white/20 bg-slate-950/40 group-hover:border-white/40'
                    } flex items-center justify-center transition-all duration-200`}>
                      {acceptTerms && <FiCheck className="text-xs stroke-[4px]" />}
                    </div>
                  </div>
                  <span className="leading-tight">
                    I agree to the{' '}
                    <a href="/terms" className="text-primary-400 hover:text-primary-300 underline font-medium">Terms of Service</a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary-400 hover:text-primary-300 underline font-medium">Privacy Policy</a>.
                  </span>
                </label>
                {errors.terms && <p className="text-[11px] text-red-400 font-medium pl-8">{errors.terms}</p>}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 text-white font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none relative overflow-hidden"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isSuccess ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <FiCheck className="text-lg stroke-[3px]" />
                      <span>Registration Complete!</span>
                    </motion.div>
                  ) : (
                    <span>Create Account</span>
                  )}
                </motion.button>
              </motion.div>

              {/* Bottom Login Link */}
              <motion.div variants={itemVariants} className="text-center pt-2">
                <p className="text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Login
                  </Link>
                </p>
              </motion.div>

            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Floater Anim Styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-1deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
};

export default RegisterPage;
