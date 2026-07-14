import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (e, path) => {
    if (path.startsWith('#')) {
      e.preventDefault();
      // If we are not on the homepage, navigate to home with hash
      if (location.pathname !== '/') {
        navigate('/' + path);
        return;
      }
      
      const element = document.querySelector(path);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand & About Column */}
          <div className="space-y-4 md:col-span-5">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-md">
                <FaGraduationCap className="text-xl" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Scholar<span className="text-primary-400">AI</span>
              </span>
            </Link>
            <p className="text-sm max-w-sm text-slate-400 leading-relaxed">
              Helping Every Student Find the Right Scholarship. Leverage modern AI scoring, matching, and assistant features to discover financial aid.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a href="https://twitter.com" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 p-2 rounded-lg bg-slate-800/50 hover:bg-primary-600">
                <FaTwitter className="text-md text-white" />
              </a>
              <a href="https://linkedin.com" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 p-2 rounded-lg bg-slate-800/50 hover:bg-primary-700">
                <FaLinkedin className="text-md text-white" />
              </a>
              <a href="https://github.com" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700">
                <FaGithub className="text-md text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#home" onClick={(e) => handleScroll(e, '#home')} className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#scholarships" onClick={(e) => handleScroll(e, '#scholarships')} className="hover:text-white transition-colors">
                  Scholarships
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleScroll(e, '#about')} className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleScroll(e, '#contact')} className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <span className="block text-slate-500 font-medium">Support Email</span>
                <a href="mailto:support@scholarai.com" className="hover:text-white transition-colors text-slate-300 font-semibold">
                  support@scholarai.com
                </a>
              </li>
              <li>
                <span className="block text-slate-500 font-medium">Headquarters</span>
                <span className="text-slate-300">San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} ScholarAI. Helping Every Student Find the Right Scholarship. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
