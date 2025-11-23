import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, ProcessLog } from './types';
import { YouTubeService } from './services/youtubeService';
import { LoginView } from './views/LoginView';
import { ExtractView } from './views/ExtractView';
import { RestoreView } from './views/RestoreView';
import { Layout } from './components/Layout';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [youtubeClientId, setYoutubeClientId] = useState<string>(localStorage.getItem('yt_client_id') || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<ProcessLog[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      message,
      type
    }, ...prev]);
  };

  const handleLogin = async () => {
    if (!youtubeClientId) {
      addLog('Please configure your Google Cloud Client ID in settings first.', 'warning');
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const ytService = YouTubeService.getInstance();
      await ytService.initialize(youtubeClientId);
      await ytService.signIn();
      
      const profile = await ytService.getUserProfile();
      setUser({
        name: profile.title,
        email: '', // Email is not always directly available in simple channel snippet, but auth is done.
        imageUrl: profile.thumbnails.default.url
      });
      
      setView(AppView.EXTRACT);
      addLog(`Logged in as ${profile.title}`, 'success');
    } catch (error: any) {
      console.error(error);
      addLog(`Login failed: ${error?.details || error.message || JSON.stringify(error)}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const ytService = YouTubeService.getInstance();
    ytService.signOut();
    setUser(null);
    setView(AppView.LOGIN);
    addLog('Logged out successfully', 'info');
  };

  const saveSettings = (clientId: string) => {
    setYoutubeClientId(clientId);
    localStorage.setItem('yt_client_id', clientId);
    setIsSettingsOpen(false);
    addLog('Settings saved', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {view === AppView.LOGIN ? (
        <LoginView 
          onLogin={handleLogin} 
          isLoading={isLoading} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          onOpenHelp={() => setIsHelpOpen(true)}
          hasClientId={!!youtubeClientId}
        />
      ) : (
        <Layout 
          currentView={view} 
          onViewChange={setView} 
          user={user} 
          onLogout={handleLogout}
          logs={logs}
          onOpenHelp={() => setIsHelpOpen(true)}
        >
           {view === AppView.EXTRACT && <ExtractView addLog={addLog} />}
           {view === AppView.RESTORE && <RestoreView addLog={addLog} />}
        </Layout>
      )}
      
      {isSettingsOpen && (
        <SettingsModal 
          currentClientId={youtubeClientId}
          onSave={saveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isHelpOpen && (
        <HelpModal onClose={() => setIsHelpOpen(false)} />
      )}
    </div>
  );
}