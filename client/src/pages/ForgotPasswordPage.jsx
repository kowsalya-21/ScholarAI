import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck, FiLock, FiEye, FiEyeOff, FiKey } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import scholarshipIllustration from '../assets/scholarship_illustration.png';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const validateEmail = (val) => {
    if (!val) {
      return 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (error) {
      setError(validateEmail(val));
    }
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setOtpGenerated(true);
      setIsLoading(false);
      toast.success('OTP generated successfully.');
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('OTP is required');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      setOtpVerified(true);
      setIsLoading(false);
      toast.success('OTP verified successfully.');
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || 'Invalid OTP';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError('OTP is required');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (!newPassword) {
      setError('New Password is required');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      setIsSuccess(true);
      setIsLoading(false);
      toast.success('Password reset successfully.');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || 'Something went wrong.';
      setError(errMsg);
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
      
      {/* Background Glowing Blobs */}
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

      {/* Back to Login Button (Fixed Top-Left) */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 group"
        >
          <FiArrowLeft className="text-base group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </Link>
      </div>

      {/* Left Column: Modern Scholarship Illustration & Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative bg-slate-950/40 border-r border-white/5 overflow-hidden z-10">
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
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center mb-10">
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

          <div className="text-center max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Enter your registered email address to receive an OTP and set a new password.
            </p>
          </div>
        </motion.div>

        {/* Footer Credit */}
        <div className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} ScholarAI. All rights reserved.
        </div>
      </div>

      {/* Right Column: Forgot Password Card */}
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

        {/* Card wrapper with optional Shake animation */}
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
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500" />
            
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="reset-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                      {!otpGenerated ? 'Forgot Password?' : 'Enter OTP'}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {!otpGenerated 
                        ? 'Enter your email below to receive your password reset OTP.'
                        : 'An OTP has been generated. Enter details below to reset password.'}
                    </p>
                  </motion.div>

                  <form className="space-y-5">
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
                          onBlur={() => !otpGenerated && setError(validateEmail(email))}
                          placeholder="name@university.edu"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-white/10 focus:border-primary-500 focus:ring-primary-500/20 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding"
                          disabled={isLoading || otpGenerated}
                        />
                      </div>
                    </motion.div>

                    {!otpGenerated ? (
                      /* Generate OTP Button */
                      <motion.div variants={itemVariants} className="pt-2">
                        <motion.button
                          type="button"
                          onClick={handleGenerateOtp}
                          disabled={isLoading}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none relative overflow-hidden"
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>Generate OTP</span>
                          )}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <>
                        {/* OTP Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                            OTP
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                              <FiKey className="text-lg" />
                            </div>
                            <input
                              type="text"
                              maxLength="6"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="123456"
                              className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-white/10 focus:border-primary-500 focus:ring-primary-500/20 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding"
                              disabled={isLoading}
                            />
                          </div>
                        </motion.div>

                        {/* New Password Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                            New Password
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                              <FiLock className="text-lg" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-11 pr-12 py-3.5 bg-slate-950/40 border border-white/10 focus:border-primary-500 focus:ring-primary-500/20 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                            </button>
                          </div>
                        </motion.div>

                        {/* Confirm Password Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                            Confirm Password
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                              <FiLock className="text-lg" />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-11 pr-12 py-3.5 bg-slate-950/40 border border-white/10 focus:border-primary-500 focus:ring-primary-500/20 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 bg-clip-padding"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                            </button>
                          </div>
                        </motion.div>

                        {/* Buttons */}
                        <motion.div variants={itemVariants} className="flex gap-4 pt-2">
                          <motion.button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isLoading || otpVerified}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`flex-1 py-3 px-4 rounded-2xl ${
                              otpVerified 
                                ? 'bg-emerald-600 text-white cursor-default' 
                                : 'bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-200 font-semibold'
                            } shadow-md transition-all duration-200 flex items-center justify-center gap-2`}
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : otpVerified ? (
                              <span>Verified ✔</span>
                            ) : (
                              <span>Verify OTP</span>
                            )}
                          </motion.button>

                          <motion.button
                            type="button"
                            onClick={handleResetPassword}
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 text-white font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span>Reset Password</span>
                            )}
                          </motion.button>
                        </motion.div>

                        {/* Request a new OTP link */}
                        <motion.div variants={itemVariants} className="text-center pt-2">
                          <button
                            type="button"
                            onClick={handleGenerateOtp}
                            disabled={isLoading}
                            className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors bg-transparent border-none cursor-pointer"
                          >
                            Request New OTP
                          </button>
                        </motion.div>
                      </>
                    )}

                    {/* Error display */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0, y: -5 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -5 }}
                          className="text-xs text-red-400 font-medium pl-1"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Back to Login Link */}
                    <motion.div variants={itemVariants} className="text-center pt-2">
                      <p className="text-sm text-slate-400">
                        Remember your password?{' '}
                        <Link
                          to="/login"
                          className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          Log In
                        </Link>
                      </p>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="reset-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6"
                  >
                    <FiCheck className="text-3xl stroke-[3px]" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
                    Success!
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    Password reset successfully. Redirecting you to the login page now...
                  </p>

                  <Link 
                    to="/login"
                    className="w-full py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:border-white/20"
                  >
                    <FiArrowLeft />
                    <span>Return to Login</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

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

export default ForgotPasswordPage;
