import React from 'react';
import { AppView, UserProfile, ProcessLog } from '../types';
import { 
  LogOut, 
  Download, 
  Upload, 
  LayoutDashboard, 
  Terminal,
  Youtube,
  HelpCircle
} from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  user: UserProfile | null;
  onLogout: () => void;
  children: React.ReactNode;
  logs: ProcessLog[];
  onOpenHelp: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onViewChange, 
  user, 
  onLogout, 
  children,
  logs,
  onOpenHelp
}) => {
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700 flex items-center space-x-3">
          <div className="p-2 bg-red-600 rounded-lg">
            <Youtube size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">youtube-sync</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<Download size={20} />} 
            label="Extract Playlists" 
            active={currentView === AppView.EXTRACT} 
            onClick={() => onViewChange(AppView.EXTRACT)} 
          />
          <SidebarItem 
            icon={<Upload size={20} />} 
            label="Restore from CSV" 
            active={currentView === AppView.RESTORE} 
            onClick={() => onViewChange(AppView.RESTORE)} 
          />
          
          <div className="pt-4 mt-4 border-t border-gray-700">
             <SidebarItem 
              icon={<HelpCircle size={20} />} 
              label="Help & Guide" 
              active={false} 
              onClick={onOpenHelp} 
            />
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <img src={user?.imageUrl} alt="User" className="w-10 h-10 rounded-full border border-gray-600" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">Authenticated</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-red-900/30 hover:text-red-400 rounded-md text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative">
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
           {children}
        </div>

        {/* Log Console */}
        <div className="h-48 bg-black/90 border-t border-gray-700 p-2 flex flex-col text-xs font-mono">
          <div className="flex items-center space-x-2 text-gray-400 mb-2 px-2">
             <Terminal size={14} />
             <span className="uppercase font-bold tracking-wider">System Logs</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-2">
            {logs.map((log) => (
              <div key={log.id} className={`flex items-start space-x-2 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 
                log.type === 'warning' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                <span className="text-gray-600 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span>{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && <div className="text-gray-600 italic">Ready...</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);