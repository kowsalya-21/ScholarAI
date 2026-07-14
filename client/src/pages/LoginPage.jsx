import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGraduationCap } from 'react-icons/fa';
import scholarshipIllustration from '../assets/scholarship_illustration.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation States
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Shaking state for invalid submit attempt
  const [shake, setShake] = useState(false);

  // Validate single fields dynamically
  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'email') {
      if (!value) {
        errorMsg = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errorMsg = 'Please enter a valid email address';
      }
    }
    if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required';
      } else if (value.length < 8) {
        errorMsg = 'Password must be at least 8 characters long';
      }
    }
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email) {
      validateField('email', val);
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (errors.password) {
      validateField('password', val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform final check
    const emailErr = !email ? 'Email is required' : !/\S+@\S+\.\S+/.test(email) ? 'Please enter a valid email address' : '';
    const passErr = !password ? 'Password is required' : password.length < 8 ? 'Password must be at least 8 characters long' : '';

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      // Trigger card shake
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.data && response.data.success) {
        setIsSuccess(true);
        setIsLoading(false);

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        toast.success('Login Successful! Welcome back.');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      setIsLoading(false);
      const errMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Invalid credentials. Please try again.';
      setErrors({ form: errMsg });
      toast.error(errMsg);
    }
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const floatingSphereVariants = {
    animate1: {
      y: [0, 40, 0],
      x: [0, 20, 0],
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
    },
    animate2: {
      y: [0, -30, 0],
      x: [0, -40, 0],
      transition: { duration: 10, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden bg-slate-900 text-slate-100 selection:bg-primary-500 selection:text-white font-sans">
      
      {/* Background Glowing Blobs (Visible on all screen sizes to give depth) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          variants={floatingSphereVariants}
          animate="animate1"
          className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-primary-600/20 blur-[80px]"
        />
        <motion.div 
          variants={floatingSphereVariants}
          animate="animate2"
          className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-secondary-600/15 blur-[100px]"
        />
        <div className="absolute top-[40%] left-[45%] w-64 h-64 rounded-full bg-blue-500/10 blur-[80px]" />
      </div>

      {/* Back Button (Fixed Top-Left) */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 group"
        >
          <FiArrowLeft className="text-base group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Left Column: Modern Scholarship Illustration & Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative bg-slate-950/40 border-r border-white/5 overflow-hidden z-10">
        
        {/* Subtle mesh background on the left */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 -z-10" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-700/10 blur-[120px]" />

        {/* Brand Header */}
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
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center my-auto py-8"
        >
          {/* Main Illustration */}
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center mb-10">
            {/* Pulsing glow ring behind illustration */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 blur-[50px] animate-pulse duration-[4000ms]" />
            <img 
              src={scholarshipIllustration} 
              alt="Scholarship Journey Illustration" 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)] animate-float"
              style={{
                animation: 'float 6s ease-in-out infinite'
              }}
            />
          </div>

          {/* Heading and Paragraph */}
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Continue your scholarship journey with ScholarAI. Unlock matches, track applications, and accelerate your academic path.
            </p>
          </div>
        </motion.div>

        {/* Footer Credit */}
        <div className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} ScholarAI. All rights reserved.
        </div>
      </div>

      {/* Right Column: Premium Login Card */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 xl:p-16 z-10">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center gap-2 mb-8 mt-12">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <FaGraduationCap className="text-lg" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent tracking-tight">
            Scholar<span className="text-white">AI</span>
          </span>
        </div>

        {/* Login Card wrapper with optional Shake animation */}
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[450px]"
        >
          {/* Main Glass Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[32px] p-8 md:p-10 relative overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500" />
            
            {/* Card Titles */}
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                Sign In
              </h2>
              <p className="text-sm text-slate-400">
                Welcome back! Please enter your details below.
              </p>
            </motion.div>

            {/* Error Message if general issue exists */}
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {errors.form}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Address */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                    <FiMail className="text-lg" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => validateField('email', email)}
                    placeholder="name@university.edu"
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border ${
                      errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'
                    } rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding`}
                    disabled={isLoading || isSuccess}
                  />
                </div>
                
                {/* Email Error */}
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -5 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -5 }}
                      className="text-xs text-red-400 font-medium pl-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                    <FiLock className="text-lg" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => validateField('password', password)}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3.5 bg-slate-950/40 border ${
                      errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/20'
                    } rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding`}
                    disabled={isLoading || isSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    disabled={isLoading || isSuccess}
                  >
                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>

                {/* Password Error */}
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -5 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -5 }}
                      className="text-xs text-red-400 font-medium pl-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group text-sm text-slate-300">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                      disabled={isLoading || isSuccess}
                    />
                    <div className={`w-5 h-5 rounded-md border ${
                      rememberMe ? 'bg-primary-600 border-primary-500 text-white' : 'border-white/20 bg-slate-950/40 group-hover:border-white/40'
                    } flex items-center justify-center transition-all duration-200`}>
                      {rememberMe && <FiCheck className="text-xs stroke-[4px]" />}
                    </div>
                  </div>
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-400 hover:text-primary-300 hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none relative overflow-hidden"
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
                      <span>Login Successful!</span>
                    </motion.div>
                  ) : (
                    <span>Log In</span>
                  )}
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 py-2">
                <div className="h-px bg-white/10 flex-grow" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">or</span>
                <div className="h-px bg-white/10 flex-grow" />
              </motion.div>

              {/* Google Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:border-white/20"
                  disabled={isLoading || isSuccess}
                >
                  <FcGoogle className="text-xl" />
                  <span>Continue with Google</span>
                </motion.button>
              </motion.div>

              {/* Sign Up Link */}
              <motion.div variants={itemVariants} className="text-center pt-4">
                <p className="text-sm text-slate-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </motion.div>

            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Embedded CSS for custom micro-animations like the float keyframe */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(1deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
};

export default LoginPage;
