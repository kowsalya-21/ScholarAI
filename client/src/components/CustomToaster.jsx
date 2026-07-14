import React from 'react';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiXCircle } from 'react-icons/fi';

const CustomToaster = () => {
  const { isDarkMode } = useTheme();

  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 24,
        right: 24,
        bottom: 24,
        left: 24,
      }}
      toastOptions={{
        duration: 3500,
      }}
    >
      {(t) => {
        // Resolve type (handles potential custom types like warning or info passed via options)
        let type = t.type;
        if (t.type === 'blank') {
          if (t.icon === '⚠️' || t.icon === '⚡') {
            type = 'warning';
          } else if (t.icon === 'ℹ️' || t.icon === '💡') {
            type = 'info';
          } else if (t.customType) {
            type = t.customType;
          }
        }

        // Setup theme and type-specific classes
        let bgClass = '';
        let textClass = '';
        let borderClass = '';
        let progressBgClass = '';
        let iconElement = null;

        switch (type) {
          case 'success':
            bgClass = isDarkMode ? 'bg-green-700' : 'bg-green-600';
            textClass = 'text-white';
            borderClass = isDarkMode ? 'border-green-800' : 'border-green-500';
            progressBgClass = 'bg-white/40';
            iconElement = <FiCheckCircle className="w-5 h-5 text-white shrink-0" />;
            break;
          case 'error':
            bgClass = 'bg-red-600';
            textClass = 'text-white';
            borderClass = 'border-red-700';
            progressBgClass = 'bg-white/40';
            iconElement = <FiXCircle className="w-5 h-5 text-white shrink-0" />;
            break;
          case 'warning':
            bgClass = 'bg-yellow-500';
            textClass = isDarkMode ? 'text-white' : 'text-black';
            borderClass = isDarkMode ? 'border-yellow-600' : 'border-yellow-400';
            progressBgClass = isDarkMode ? 'bg-white/40' : 'bg-black/25';
            iconElement = <FiAlertTriangle className={`w-5 h-5 shrink-0 ${isDarkMode ? 'text-white' : 'text-black'}`} />;
            break;
          case 'info':
            bgClass = 'bg-blue-600';
            textClass = 'text-white';
            borderClass = 'border-blue-700';
            progressBgClass = 'bg-white/40';
            iconElement = <FiInfo className="w-5 h-5 text-white shrink-0" />;
            break;
          case 'loading':
            bgClass = isDarkMode ? 'bg-slate-800' : 'bg-white';
            textClass = isDarkMode ? 'text-white' : 'text-slate-800';
            borderClass = isDarkMode ? 'border-slate-700' : 'border-slate-200';
            progressBgClass = 'bg-blue-600/30 dark:bg-blue-400/30';
            iconElement = (
              <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            );
            break;
          default: // blank, default, custom
            bgClass = isDarkMode ? 'bg-slate-800' : 'bg-white';
            textClass = isDarkMode ? 'text-white' : 'text-slate-800';
            borderClass = isDarkMode ? 'border-slate-700' : 'border-slate-200';
            progressBgClass = 'bg-blue-600/30 dark:bg-blue-400/30';
            iconElement = <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />;
            break;
        }

        // Custom icon support
        if (t.icon && typeof t.icon !== 'string') {
          iconElement = <span className="shrink-0">{t.icon}</span>;
        } else if (t.icon && typeof t.icon === 'string') {
          iconElement = <span className="text-lg shrink-0">{t.icon}</span>;
        }

        // Check if inline styles are explicitly provided
        const hasCustomStyle = t.style && Object.keys(t.style).length > 0;
        const inlineStyle = {
          ...t.style,
          animation: t.visible
            ? 'toast-enter 0.35s cubic-bezier(0.21, 1.02, 0.43, 1.01) forwards'
            : 'toast-leave 0.4s cubic-bezier(0.21, 1.02, 0.43, 1.01) forwards',
        };

        return (
          <div
            className={`relative flex items-center justify-between gap-4 p-4 rounded-xl border shadow-lg max-w-md pointer-events-auto overflow-hidden transition-all duration-300 ${
              hasCustomStyle ? '' : `${bgClass} ${textClass} ${borderClass}`
            }`}
            style={inlineStyle}
          >
            <div className="flex items-center gap-3 pr-2">
              {iconElement}
              <div className="text-sm font-semibold leading-relaxed">
                {resolveValue(t.message, t)}
              </div>
            </div>

            {/* Close Button */}
            {t.type !== 'loading' && (
              <button
                onClick={() => toast.dismiss(t.id)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current shrink-0"
                aria-label="Close notification"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}

            {/* Progress Bar */}
            {t.type !== 'loading' && (
              <div
                className={`absolute bottom-0 left-0 h-1 ${hasCustomStyle ? 'bg-current/30' : progressBgClass}`}
                style={{
                  animation: `toast-shrink ${t.duration || 3500}ms linear forwards`,
                  animationPlayState: t.paused ? 'paused' : 'running',
                }}
              />
            )}
          </div>
        );
      }}
    </Toaster>
  );
};

export default CustomToaster;
