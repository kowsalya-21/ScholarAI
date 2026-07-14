import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import TopNavbar from '../components/Dashboard/TopNavbar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar - Desktop (always visible on lg+) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile drawer (overlay + panel) */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setIsSidebarOpen(false)} 
          />
          
          {/* Mobile Sidebar */}
          <div className="relative z-50 transform transition-transform duration-300">
            <Sidebar onCloseMobile={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64">
        {/* Top Header Navigation */}
        <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Dynamic page contents loader */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 gradient-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
