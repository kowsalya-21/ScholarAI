import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineChatAlt2, HiOutlineSparkles, HiOutlineUserCircle 
} from 'react-icons/hi';
import { FiSend, FiClock } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const suggestedQuestions = [
  'Which scholarships am I eligible for?',
  'How do I apply?',
  'What documents are required?',
  'Show scholarships for my course.'
];

const ChatbotPage = () => {
  const { isDarkMode } = useTheme();

  // Load and preserve chat history during the session
  const [messages, setMessages] = useState(() => {
    try {
      const stored = sessionStorage.getItem('chatbotHistory');
      return stored ? JSON.parse(stored) : [
        { 
          sender: 'ai', 
          text: "Hello! I am your ScholarAI Advisor. Ask me anything about matching scores, application requirements, or writing essay drafts.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    } catch {
      return [
        { 
          sender: 'ai', 
          text: "Hello! I am your ScholarAI Advisor. Ask me anything about matching scores, application requirements, or writing essay drafts.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [scholarships, setScholarships] = useState([]);
  
  const messagesEndRef = useRef(null);

  // Sync message history to session storage
  useEffect(() => {
    sessionStorage.setItem('chatbotHistory', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch all scholarships from MERN backend to do query checking
  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const response = await axios.get('/api/scholarships?limit=100');
        if (response.data && response.data.success) {
          setScholarships(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching scholarships for chatbot context:', err);
      }
    };
    fetchScholarships();
  }, []);

  // Rule-Based Advisor Response Generator
  const generateResponse = useCallback((input) => {
    const cleanInput = input.toLowerCase().trim();
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    // Core parameters from profile
    const cgpa = user.cgpa !== undefined && user.cgpa !== null ? Number(user.cgpa) : 8.0;
    const income = user.familyIncome !== undefined && user.familyIncome !== null ? Number(user.familyIncome) : 500000;
    const state = user.state || 'Delhi';
    const category = user.category || 'General';
    const course = user.course || 'Computer Science';

    const formatIncome = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    const formatAmount = (amount, title, provider) => {
      const isUSD = amount < 25000 && !/India|Ministry|Govt|National|Post Matric|MOMA|ONGC|Tata|HDFC|Reliance/i.test(title + ' ' + provider);
      return isUSD 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
        : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    // 1. Eligibility Check Query
    if (cleanInput.includes('eligible') || cleanInput.includes('eligibility') || cleanInput.includes('which scholarships')) {
      const matches = scholarships.filter(sch => {
        const cgpaMatch = !sch.minimumCGPA || cgpa >= sch.minimumCGPA;
        const incomeMatch = !sch.maximumIncome || income <= sch.maximumIncome;
        const stateMatch = sch.state === 'All' || state.toLowerCase() === sch.state.toLowerCase();
        const categoryMatch = sch.category === 'All' || category.toLowerCase() === sch.category.toLowerCase();
        return cgpaMatch && incomeMatch && stateMatch && categoryMatch;
      }).slice(0, 3);

      if (matches.length > 0) {
        const list = matches.map((m, idx) => `${idx + 1}. **${m.title}** (${m.provider}) - ${formatAmount(m.scholarshipAmount, m.title, m.provider)}`).join('\n');
        return `Based on your profile (CGPA: ${cgpa}, Income: ${formatIncome(income)}, Domicile: ${state}, Category: ${category}), here are some scholarships you are highly eligible for:\n\n${list}\n\nGo to the **AI Recommendations** tab to see your detailed match percentages and reasoning breakdown!`;
      }
      return `I couldn't find any direct matches for your profile (CGPA: ${cgpa}, Income: ${formatIncome(income)}) in our directory. Make sure to complete your profile at the **Profile** page to check again!`;
    }

    // 2. Application Process Query
    if (cleanInput.includes('how to apply') || cleanInput.includes('how do i apply') || cleanInput.includes('apply')) {
      return `Here is a step-by-step guide to applying for scholarships on ScholarAI:\n\n1. **Explore the Directory**: Navigate to the 'Scholarships' tab in the sidebar to search and filter active opportunities.\n2. **Review Requirements**: Click 'View Details' on any scholarship to check criteria, deadlines, and required documents.\n3. **Initiate Application**: Click the 'Apply Now' button. This will automatically log the scholarship in your 'Applications Tracker' (with status "Applied") and redirect you to the official provider portal.\n4. **Track Progress**: Open 'My Applications' to update your statuses inline as you move through reviews, shortlists, or approvals.`;
    }

    // 3. Required Documents Query
    if (cleanInput.includes('document') || cleanInput.includes('paper') || cleanInput.includes('required documents')) {
      return `Commonly required documents for scholarship applications include:\n\n- **Academic Transcripts**: Class 10/12 marksheets or college grade reports.\n- **Domicile Certificate**: Proof of residence (critical for state schemes).\n- **Income Certificate**: Verified affidavit of family income.\n- **Category/Caste Certificate**: If applying under SC/ST/OBC/EWS quotas.\n- **Identity Proof**: Aadhaar Card, Passport, or College ID.\n- **Support Materials**: Letters of recommendation (LOR) or personal statements/essays.\n\nYou can see specific required documents list by clicking 'View Details' on any scholarship in the directory!`;
    }

    // 4. Course Match Query
    if (cleanInput.includes('course') || cleanInput.includes('major') || cleanInput.includes('study')) {
      const matches = scholarships.filter(sch => 
        sch.description.toLowerCase().includes(course.toLowerCase()) || 
        sch.title.toLowerCase().includes(course.toLowerCase()) ||
        sch.educationLevel === 'All'
      ).slice(0, 3);

      if (matches.length > 0) {
        const list = matches.map((m, idx) => `${idx + 1}. **${m.title}** (${m.provider}) - ${formatAmount(m.scholarshipAmount, m.title, m.provider)}`).join('\n');
        return `Based on your course of study (**${course}**), here are some matching opportunities:\n\n${list}\n\nYou can check out all undergraduate or postgraduate listings directly in the 'Scholarships' directory.`;
      }
      return `I recommend exploring the 'Scholarships' tab to view all active listings. You can filter by Category, State, or Education level to find program fits for your studies!`;
    }

    // 5. Greet / Help Query
    if (cleanInput.includes('hi') || cleanInput.includes('hello') || cleanInput.includes('hey') || cleanInput.includes('help')) {
      return `Hello ${user.fullName || 'Student'}! 👋 I am your ScholarAI Advisor.\n\nI can help you with matching program eligibility, explaining application steps, listing required documents, or recommending course-specific grants.\n\nTry clicking one of the suggested question chips above to test my advice!`;
    }

    // Default Fallback
    return `Interesting question! I am a rule-based advisor, so I works best with questions about eligibility, application steps, required documents, or course recommendations. \n\nFeel free to try one of the suggested quick-chips above!`;
  }, [scholarships]);

  // Handle message send logic
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text, timestamp };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // 2. Trigger Typing State
    setIsTyping(true);

    // 3. Simulate AI thinking cycle (1.2s delay for natural response appearance)
    setTimeout(() => {
      const responseText = generateResponse(text);
      const aiMsg = { sender: 'ai', text: responseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  const parseInline = (text) => {
    if (!text) return '';
    let tokens = [{ type: 'text', content: text }];
    
    // Parse Links: [text](url)
    let nextTokens = [];
    for (const token of tokens) {
      if (token.type === 'text') {
        const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(token.content)) !== null) {
          if (match.index > lastIndex) {
            nextTokens.push({ type: 'text', content: token.content.substring(lastIndex, match.index) });
          }
          nextTokens.push({ type: 'link', text: match[1], url: match[2] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < token.content.length) {
          nextTokens.push({ type: 'text', content: token.content.substring(lastIndex) });
        }
      } else {
        nextTokens.push(token);
      }
    }
    tokens = nextTokens;

    // Parse Bold: **text**
    nextTokens = [];
    for (const token of tokens) {
      if (token.type === 'text') {
        const regex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(token.content)) !== null) {
          if (match.index > lastIndex) {
            nextTokens.push({ type: 'text', content: token.content.substring(lastIndex, match.index) });
          }
          nextTokens.push({ type: 'bold', content: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < token.content.length) {
          nextTokens.push({ type: 'text', content: token.content.substring(lastIndex) });
        }
      } else {
        nextTokens.push(token);
      }
    }
    tokens = nextTokens;

    // Parse Inline Code: `code`
    nextTokens = [];
    for (const token of tokens) {
      if (token.type === 'text') {
        const regex = /`([^`]+)`/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(token.content)) !== null) {
          if (match.index > lastIndex) {
            nextTokens.push({ type: 'text', content: token.content.substring(lastIndex, match.index) });
          }
          nextTokens.push({ type: 'code', content: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < token.content.length) {
          nextTokens.push({ type: 'text', content: token.content.substring(lastIndex) });
        }
      } else {
        nextTokens.push(token);
      }
    }
    tokens = nextTokens;

    // Parse Italics: *text*
    nextTokens = [];
    for (const token of tokens) {
      if (token.type === 'text') {
        const regex = /\*([^*]+)\*/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(token.content)) !== null) {
          if (match.index > lastIndex) {
            nextTokens.push({ type: 'text', content: token.content.substring(lastIndex, match.index) });
          }
          nextTokens.push({ type: 'italic', content: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < token.content.length) {
          nextTokens.push({ type: 'text', content: token.content.substring(lastIndex) });
        }
      } else {
        nextTokens.push(token);
      }
    }
    tokens = nextTokens;

    return tokens.map((token, i) => {
      switch (token.type) {
        case 'link':
          return (
            <a 
              key={i} 
              href={token.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-650 dark:text-indigo-400 hover:underline font-bold"
            >
              {token.text}
            </a>
          );
        case 'bold':
          return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{token.content}</strong>;
        case 'italic':
          return <em key={i} className="italic text-slate-800 dark:text-slate-200">{token.content}</em>;
        case 'code':
          return (
            <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
              {token.content}
            </code>
          );
        default:
          return token.content;
      }
    });
  };

  const parseMarkdown = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    const blocks = [];
    let currentBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block block
      if (line.trim().startsWith('```')) {
        if (currentBlock && currentBlock.type === 'codeblock') {
          blocks.push(currentBlock);
          currentBlock = null;
        } else {
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = { type: 'codeblock', lines: [] };
        }
        continue;
      }

      if (currentBlock && currentBlock.type === 'codeblock') {
        currentBlock.lines.push(line);
        continue;
      }

      // Table block
      if (line.trim().startsWith('|')) {
        if (currentBlock && currentBlock.type === 'table') {
          currentBlock.lines.push(line);
        } else {
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = { type: 'table', lines: [line] };
        }
        continue;
      }

      // Bullet list block
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (currentBlock && currentBlock.type === 'ul') {
          currentBlock.lines.push(line);
        } else {
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = { type: 'ul', lines: [line] };
        }
        continue;
      }

      // Numbered list block
      if (/^\s*\d+\.\s+/.test(line)) {
        if (currentBlock && currentBlock.type === 'ol') {
          currentBlock.lines.push(line);
        } else {
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = { type: 'ol', lines: [line] };
        }
        continue;
      }

      // Heading blocks
      if (line.trim().startsWith('#')) {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        const match = line.trim().match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          blocks.push({ type: 'heading', level: match[1].length, text: match[2] });
          continue;
        }
      }

      // Empty line
      if (line.trim() === '') {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        continue;
      }

      // Paragraph line
      if (currentBlock && currentBlock.type === 'p') {
        currentBlock.lines.push(line);
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'p', lines: [line] };
      }
    }

    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks.map((block, index) => {
      switch (block.type) {
        case 'codeblock':
          return (
            <pre key={index} className="my-2 p-3 bg-slate-900 border border-slate-700 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-200 leading-normal max-w-full">
              <code>{block.lines.join('\n')}</code>
            </pre>
          );
        case 'table': {
          const rows = block.lines
            .filter(l => !/^[|\s-:-]+$/.test(l.trim()))
            .map(l => {
              const cells = l.split('|').map(c => c.trim());
              if (cells[0] === '') cells.shift();
              if (cells[cells.length - 1] === '') cells.pop();
              return cells;
            });
          if (rows.length === 0) return null;
          const headers = rows[0];
          const bodies = rows.slice(1);
          return (
            <div key={index} className="overflow-x-auto my-3 max-w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-[10px]">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {bodies.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-600 dark:text-slate-300 font-medium whitespace-normal break-words">
                          {parseInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        case 'ul':
          return (
            <ul key={index} className="list-disc pl-5 my-2 space-y-1 text-xs">
              {block.lines.map((l, idx) => {
                const textContent = l.trim().replace(/^[-*]\s+/, '');
                return <li key={idx} className="text-slate-700 dark:text-slate-200">{parseInline(textContent)}</li>;
              })}
            </ul>
          );
        case 'ol':
          return (
            <ol key={index} className="list-decimal pl-5 my-2 space-y-1 text-xs">
              {block.lines.map((l, idx) => {
                const textContent = l.trim().replace(/^\d+\.\s+/, '');
                return <li key={idx} className="text-slate-700 dark:text-slate-200">{parseInline(textContent)}</li>;
              })}
            </ol>
          );
        case 'heading': {
          const HeadingTag = `h${Math.min(block.level + 2, 6)}`;
          const sizeClasses = {
            1: 'text-base font-extrabold my-2 text-slate-900 dark:text-white',
            2: 'text-sm font-bold my-2 text-slate-900 dark:text-white',
            3: 'text-xs font-bold my-1 text-slate-900 dark:text-white',
            4: 'text-xs font-bold my-1 text-slate-900 dark:text-white',
            5: 'text-[11px] font-bold my-1 text-slate-900 dark:text-white',
            6: 'text-[11px] font-bold my-1 text-slate-900 dark:text-white'
          };
          return (
            <HeadingTag key={index} className={sizeClasses[block.level] || 'text-xs font-bold text-slate-900 dark:text-white'}>
              {parseInline(block.text)}
            </HeadingTag>
          );
        }
        case 'p':
        default: {
          const textContent = block.lines.join(' ');
          return (
            <p key={index} className="my-1.5 leading-relaxed text-slate-705 dark:text-slate-200">
              {parseInline(textContent)}
            </p>
          );
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-130px)] font-sans">
      {/* Title Header */}
      <div>
        <h1 className={`text-3xl font-extrabold flex items-center gap-2 ${
          isDarkMode ? "text-white" : "text-slate-900"
        }`}>
          AI Chatbot <HiOutlineSparkles className="text-secondary-500 text-2xl animate-pulse" />
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Get immediate answers to scholarship and essay requirements.
        </p>
      </div>

      {/* Main Glass Chat Card */}
      <div className={`flex-grow rounded-[32px] p-5 shadow-sm flex flex-col overflow-hidden border ${
        isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200/50"
      }`}>
        
        {/* Messages list container */}
        <div className={`flex-1 overflow-y-auto space-y-5 pr-2 mb-4 scrollbar-thin ${
          isDarkMode ? "scrollbar-thumb-slate-800 scrollbar-track-slate-900" : "scrollbar-thumb-slate-200 scrollbar-track-transparent"
        }`}>
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
              >
                {/* AI Avatar */}
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm border border-white/10">
                    <HiOutlineChatAlt2 className="text-base" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className="flex flex-col space-y-1 max-w-[85%] sm:max-w-md w-full overflow-hidden break-words whitespace-normal">
                  <div className={`p-4 rounded-[22px] text-xs font-semibold leading-relaxed shadow-sm bg-clip-padding ${
                    msg.sender === 'user'
                      ? 'bg-indigo-650 text-white rounded-tr-none'
                      : (isDarkMode 
                          ? 'bg-slate-800 text-white rounded-tl-none border border-slate-700' 
                          : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/30')
                  }`}>
                    {parseMarkdown(msg.text)}
                  </div>
                  
                  {/* Timestamp */}
                  <span className={`text-[8px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-0.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <FiClock />
                    {msg.timestamp}
                  </span>
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    <HiOutlineUserCircle className="text-xl" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm border border-white/10">
                <HiOutlineChatAlt2 className="text-base" />
              </div>
              <div className={`p-3.5 rounded-[22px] rounded-tl-none border flex items-center gap-1 shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 border-slate-200/30 text-slate-500'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          {/* Scroll bottom anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions chips */}
        <div className={`flex flex-wrap gap-2 pb-4 border-t pt-4 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              disabled={isTyping}
              className={`px-3.5 py-2 border rounded-xl text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                isDarkMode 
                  ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white" 
                  : "bg-slate-50/50 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input panel row */}
        <div className="flex gap-2.5 items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
              placeholder="Ask a question (e.g. Which scholarships am I eligible for?)..."
              className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-xs font-semibold ${
                isDarkMode 
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400" 
                  : "bg-slate-50 border-slate-200/80 text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>
          
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            className={`p-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-extrabold shadow-md flex items-center justify-center transition-all ${
              !inputText.trim() || isTyping
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90 dark:hover:from-primary-700 dark:hover:to-indigo-800 shadow-primary-500/10 cursor-pointer active:scale-95'
            }`}
          >
            <FiSend className="text-sm" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChatbotPage;
