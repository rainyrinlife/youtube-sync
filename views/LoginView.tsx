import React from 'react';
import { Button } from '../components/Button';
import { Settings, Youtube, HelpCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  hasClientId: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onLogin, 
  isLoading, 
  onOpenSettings,
  onOpenHelp,
  hasClientId
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2874&auto=format&fit=crop')] bg-cover bg-center relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col items-center space-y-8 p-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-red-600 rounded-2xl shadow-2xl mb-4">
             <Youtube size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            youtube-sync
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Extract, Backup, and Restore your YouTube playlists via CSV with ease. 
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl shadow-xl backdrop-blur-md w-full max-w-md space-y-6">
          
          {!hasClientId && (
             <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
               <p className="text-yellow-200 text-sm text-center">
                 Configuration required. Please set your Google Cloud Client ID to proceed.
               </p>
             </div>
          )}

          <Button 
            onClick={onLogin} 
            isLoading={isLoading}
            className="w-full h-12 text-lg"
            disabled={!hasClientId}
          >
            Sign in with Google
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onOpenSettings}
              className="flex items-center justify-center w-full p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all space-x-2 border border-transparent hover:border-gray-600"
            >
              <Settings size={14} />
              <span>Configure Keys</span>
            </button>
            
            <button 
              onClick={onOpenHelp}
              className="flex items-center justify-center w-full p-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all space-x-2 border border-transparent hover:border-blue-800/50"
            >
              <HelpCircle size={14} />
              <span>How it works?</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-12 text-center max-w-xs">
          By using this application, you agree to the storage of your playlist data locally on your machine.
        </div>
      </div>
    </div>
  );
};