import React, { useState } from 'react';
import { User, LogOut, LayoutDashboard, Database, ClipboardCheck, Settings, FileSpreadsheet, Archive, UserCheck, ArrowRightLeft, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdmin = user.role === 'ADMIN';

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsSidebarOpen(false);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string; icon: any; label: string }) => (
    <button
      onClick={() => handleNavigate(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm ${
        currentView === view
          ? 'bg-brand-600 text-white shadow-md'
          : 'text-industrial-400 hover:bg-industrial-800 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-industrial-50 overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-industrial-900 z-30 flex items-center justify-between px-4 shadow-md">
         <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Database className="text-brand-500" />
            <span>MANU<span className="text-brand-500">TECH</span></span>
         </div>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2">
           {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-industrial-900 text-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-16 md:pt-0
      `}>
        <div className="hidden md:block p-6 border-b border-industrial-800">
          <h1 className="text-xl font-bold tracking-wider text-brand-500 flex items-center gap-2">
            <Database className="text-white" />
            MANU<span className="text-white">TECH</span>
          </h1>
          <p className="text-xs text-industrial-500 mt-1">v3.0 Enterprise</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-industrial-500 uppercase tracking-wider mb-2 px-2 mt-2">
            Overview
          </div>
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          
          <div className="text-xs font-semibold text-industrial-500 uppercase tracking-wider mt-6 mb-2 px-2">
            Operations
          </div>
          <NavItem view="machine_entry" icon={Settings} label="Machine Entry" />
          <NavItem view="input_entry" icon={ArrowRightLeft} label="Input Entry" />
          <NavItem view="output_entry" icon={Archive} label="Output Entry" />
          <NavItem view="qc_entry" icon={ClipboardCheck} label="Quality Check" />
          <NavItem view="attendance_entry" icon={UserCheck} label="Worker Attendance" />

          {isAdmin && (
            <>
              <div className="text-xs font-semibold text-industrial-500 uppercase tracking-wider mt-6 mb-2 px-2">
                Administration
              </div>
              <NavItem view="admin-master" icon={Database} label="Master Data" />
              <NavItem view="admin-reports" icon={FileSpreadsheet} label="Reports & Export" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-industrial-800 bg-industrial-950">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isAdmin ? 'bg-purple-600' : 'bg-brand-600'}`}>
              <span className="font-bold text-xs">{user.username.substring(0,2).toUpperCase()}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-industrial-400 truncate">{isAdmin ? 'Administrator' : 'Operator'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 rounded bg-industrial-800 hover:bg-red-600/20 hover:text-red-400 transition-colors text-xs text-industrial-300"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-industrial-50 pt-16 md:pt-0 w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};