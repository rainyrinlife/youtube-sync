import React from 'react';
import { X, BookOpen, Cloud, Key, PlayCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900 rounded-t-xl sticky top-0">
          <h2 className="text-2xl font-bold flex items-center space-x-2 text-white">
            <BookOpen className="text-blue-500 mr-2" />
            <span>How to use youtube-sync</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth text-gray-300">
          
          {/* Section 1: Overview */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <PlayCircle className="mr-2 text-red-500" size={20} /> 
              What is this app?
            </h3>
            <p className="mb-2">
              <strong>youtube-sync</strong> allows you to <strong>backup</strong> your YouTube playlists to your local computer as CSV files and <strong>restore</strong> them later (e.g., to a new account or channel).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-bold text-blue-400 mb-1">Extraction</h4>
                <p className="text-sm">Reads your playlists via the YouTube API and saves structured CSV files to a folder you choose on your hard drive.</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-bold text-green-400 mb-1">Restoration</h4>
                <p className="text-sm">Reads CSV files from a folder, creates new playlists on your account, and adds the videos back one by one.</p>
              </div>
            </div>
          </section>

          <hr className="border-gray-700" />

          {/* Section 2: Setup Guide */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Cloud className="mr-2 text-blue-400" size={20} /> 
              Step 1: Getting a Google Cloud Client ID (Required)
            </h3>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-sm space-y-3">
              <p className="font-medium text-white">To use this app, you must create your own "key" to talk to YouTube. This is free and keeps your data private.</p>
              <ol className="list-decimal pl-5 space-y-3 text-gray-300">
                <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-bold">Google Cloud Console</a>.</li>
                <li>Create a <strong>New Project</strong> (name it "youtube-sync" or similar).</li>
                <li>In the top search bar, type <strong>"YouTube Data API v3"</strong>, select it, and click <strong>Enable</strong>.</li>
                <li>Go to <strong>APIs & Services &gt; OAuth consent screen</strong>.
                  <ul className="list-disc pl-5 mt-1 text-gray-400 space-y-1">
                    <li>Select <strong>External</strong>.</li>
                    <li>Fill in required fields (App Name, Email).</li>
                    <li><strong>Important:</strong> Add your Google Email as a "Test User". This allows you to log in while the app is in "Testing" mode.</li>
                  </ul>
                </li>
                <li>Go to <strong>Credentials</strong> &gt; <strong>Create Credentials</strong> &gt; <strong>OAuth client ID</strong>.</li>
                <li>Select <strong>Web application</strong>.</li>
                <li>Under <strong>Authorized JavaScript origins</strong>, you must add the URL where this app is running. 
                   <br/><span className="text-xs bg-black px-2 py-1 rounded text-gray-400 mt-1 inline-block">If running locally, use: {window.location.origin}</span>
                </li>
                <li>Click <strong>Create</strong>. Copy the <strong>Client ID</strong> (it ends with <code>.apps.googleusercontent.com</code>).</li>
                <li>Paste this ID into the <strong>Settings</strong> menu of this app.</li>
              </ol>
            </div>
          </section>

          {/* Section 3: Troubleshooting */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <AlertTriangle className="mr-2 text-yellow-400" size={20} /> 
              Important Notes
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
              <li><strong>Quota Limits:</strong> YouTube limits how many actions you can do per day. Creating playlists and adding videos consumes quota. If the app stops working, wait 24 hours for your quota to reset.</li>
              <li><strong>Browser Support:</strong> Use <strong>Google Chrome</strong>, <strong>Edge</strong>, or <strong>Opera</strong>. This app uses the <em>File System Access API</em> to save files directly to your disk, which is not supported in Firefox or Safari.</li>
              <li><strong>Privacy:</strong> Your data is processed locally in your browser. We do not see your keys, passwords, or playlists.</li>
            </ul>
          </section>

        </div>

        <div className="p-6 border-t border-gray-700 bg-gray-900 rounded-b-xl flex justify-end">
          <Button onClick={onClose} className="w-full sm:w-auto">Got it, let's go!</Button>
        </div>
      </div>
    </div>
  );
};