import React, { useState, useRef } from 'react';
import { YouTubeService } from '../services/youtubeService';
import { Button } from '../components/Button';
import { Upload, FileSpreadsheet, PlaySquare } from 'lucide-react';
import { CsvRow } from '../types';

interface RestoreViewProps {
  addLog: (msg: string, type?: 'info'|'success'|'error'|'warning') => void;
}

interface PendingPlaylist {
  id: string;
  name: string;
  videos: CsvRow[];
  status: 'pending' | 'creating' | 'done' | 'error';
  error?: string;
}

export const RestoreView: React.FC<RestoreViewProps> = ({ addLog }) => {
  const [pendingPlaylists, setPendingPlaylists] = useState<PendingPlaylist[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        addLog(`Reading CSVs from ${dirHandle.name}...`, 'info');

        const newPending: PendingPlaylist[] = [];

        // @ts-ignore
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.csv')) {
            const file = await entry.getFile();
            const text = await file.text();
            const parsed = parseCsv(text, entry.name);
            if (parsed) newPending.push(parsed);
          }
        }

        if (newPending.length === 0) {
          addLog('No CSV files found in selected folder.', 'warning');
        } else {
          addLog(`Loaded ${newPending.length} potential playlists.`, 'success');
          setPendingPlaylists(prev => [...prev, ...newPending]);
        }

      } catch (err: any) {
         if (err.name !== 'AbortError') addLog(`Error accessing folder: ${err.message}`, 'error');
      }
    } else {
       // Fallback to individual file selection
       fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          const parsed = parseCsv(text, file.name);
          if (parsed) setPendingPlaylists(prev => [...prev, parsed]);
        };
        reader.readAsText(file);
      });
    }
  };

  const parseCsv = (text: string, filename: string): PendingPlaylist | null => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) return null; // Empty or just header

      const headers = lines[0].split(',').map(h => h.trim());
      // Basic validation of headers
      if (!headers.includes('videoId') && !headers.includes('videoUrl')) return null;

      const rows: CsvRow[] = [];
      let detectedName = filename.replace('.csv', '').replace(/_/g, ' ');

      for (let i = 1; i < lines.length; i++) {
        // Handle simple CSV parsing (ignoring complex quotes for brevity in this demo)
        const cols = lines[i].split(','); 
        // In a production app, use a proper CSV parser to handle quoted titles containing commas
        
        // Assuming column order matches export: playlistName,videoUrl,videoTitle,videoId,position
        // Or try to map by index if consistent
        if (cols.length >= 4) {
           rows.push({
             playlistName: cols[0],
             videoUrl: cols[1],
             videoTitle: cols[2],
             videoId: cols[3],
             position: parseInt(cols[4] || '0')
           });
           if (cols[0]) detectedName = cols[0].replace(/"/g, '');
        }
      }

      return {
        id: Math.random().toString(36).substring(7),
        name: detectedName,
        videos: rows,
        status: 'pending'
      };
    } catch (e) {
      addLog(`Failed to parse ${filename}`, 'error');
      return null;
    }
  };

  const processQueue = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const yt = YouTubeService.getInstance();
    const pending = pendingPlaylists.filter(p => p.status === 'pending');

    for (const playlist of pending) {
      // Update UI to creating
      updateStatus(playlist.id, 'creating');
      addLog(`Creating playlist: ${playlist.name}...`);

      try {
        // 1. Generate Description
        const description = `Restored from CSV. Contains ${playlist.videos.length} videos.`;

        // 2. Create Playlist
        const newPlaylistId = await yt.createPlaylist(playlist.name, description, 'private');
        addLog(`Playlist created (ID: ${newPlaylistId}). Adding ${playlist.videos.length} videos...`);

        // 3. Add Videos Sequentially (Rate Limit Protection)
        for (const [index, video] of playlist.videos.entries()) {
          try {
            await yt.addVideoToPlaylist(newPlaylistId, video.videoId);
            // Tiny delay to be nice to API
            await new Promise(r => setTimeout(r, 500));
          } catch (vErr) {
            addLog(`Failed to add video ${video.videoId}: ${JSON.stringify(vErr)}`, 'warning');
          }
        }
        
        updateStatus(playlist.id, 'done');
        addLog(`Completed playlist: ${playlist.name}`, 'success');

      } catch (err: any) {
        updateStatus(playlist.id, 'error', err.message);
        addLog(`Failed to create playlist ${playlist.name}: ${err.message}`, 'error');
      }
    }

    setIsProcessing(false);
  };

  const updateStatus = (id: string, status: PendingPlaylist['status'], error?: string) => {
    setPendingPlaylists(prev => prev.map(p => 
      p.id === id ? { ...p, status, error } : p
    ));
  };

  const removePlaylist = (id: string) => {
    setPendingPlaylists(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-white">Restore Playlists</h2>
           <p className="text-gray-400">Import CSV files to create new playlists.</p>
        </div>
        <div className="flex space-x-3 items-center">
           <Button onClick={handleFolderSelect} variant="secondary">
              <Upload size={18} className="mr-2" />
              Load Folder
           </Button>
           <input 
             type="file" 
             multiple 
             accept=".csv" 
             ref={fileInputRef} 
             className="hidden" 
             onChange={handleFileChange} 
           />
           <Button onClick={processQueue} disabled={isProcessing || pendingPlaylists.filter(p => p.status === 'pending').length === 0} isLoading={isProcessing}>
              <PlaySquare size={18} className="mr-2" />
              Start Restore
           </Button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
           <h3 className="font-semibold text-gray-200">Queue ({pendingPlaylists.length})</h3>
           {pendingPlaylists.length > 0 && !isProcessing && (
             <button onClick={() => setPendingPlaylists([])} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
           )}
        </div>
        
        <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
          {pendingPlaylists.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <FileSpreadsheet size={48} className="mb-4 opacity-20" />
              <p>No CSV files loaded.</p>
              <p className="text-xs mt-2">Select a folder containing CSVs formatted from the Extract tool.</p>
            </div>
          ) : (
            pendingPlaylists.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
                 <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                       item.status === 'done' ? 'bg-green-900/30 text-green-400' :
                       item.status === 'error' ? 'bg-red-900/30 text-red-400' :
                       item.status === 'creating' ? 'bg-blue-900/30 text-blue-400 animate-pulse' :
                       'bg-gray-700 text-gray-400'
                    }`}>
                       <FileSpreadsheet size={20} />
                    </div>
                    <div>
                       <p className="font-medium text-white">{item.name}</p>
                       <p className="text-xs text-gray-400">{item.videos.length} videos • {item.status}</p>
                       {item.error && <p className="text-xs text-red-400 mt-1">{item.error}</p>}
                    </div>
                 </div>
                 
                 {item.status === 'pending' && (
                   <button onClick={() => removePlaylist(item.id)} className="text-gray-500 hover:text-red-400">
                      &times;
                   </button>
                 )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};