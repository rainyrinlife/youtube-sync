import React, { useEffect, useState } from 'react';
import { YouTubeService } from '../services/youtubeService';
import { Playlist } from '../types';
import { Button } from '../components/Button';
import { CheckCircle, Download, FolderOpen, RefreshCw } from 'lucide-react';

interface ExtractViewProps {
  addLog: (msg: string, type?: 'info'|'success'|'error'|'warning') => void;
}

export const ExtractView: React.FC<ExtractViewProps> = ({ addLog }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      addLog('Fetching your playlists...');
      const result = await YouTubeService.getInstance().getPlaylists();
      setPlaylists(result);
      addLog(`Found ${result.length} playlists`, 'success');
    } catch (err) {
      addLog('Failed to fetch playlists', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === playlists.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(playlists.map(p => p.id)));
  };

  const exportToFiles = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        setProcessing(true);
        addLog('Please select a folder to save CSV files...', 'info');
        
        // @ts-ignore - File System Access API
        const dirHandle = await window.showDirectoryPicker();
        addLog(`Directory selected: ${dirHandle.name}`, 'success');
        
        const folderHandle = await dirHandle.getDirectoryHandle('extracted_playlists', { create: true });
        
        let count = 0;
        const total = selectedIds.size;
        
        for (const playlistId of selectedIds) {
          const playlist = playlists.find(p => p.id === playlistId);
          if (!playlist) continue;

          addLog(`Extracting: ${playlist.title} (${count + 1}/${total})...`);
          
          const items = await YouTubeService.getInstance().getPlaylistItems(playlistId);
          
          // CSV Content
          const header = "playlistName,videoUrl,videoTitle,videoId,position\n";
          const rows = items.map(item => {
            // Escape quotes in title
            const safeTitle = `"${item.title.replace(/"/g, '""')}"`;
            const safePlaylistTitle = `"${playlist.title.replace(/"/g, '""')}"`;
            return `${safePlaylistTitle},https://www.youtube.com/watch?v=${item.videoId},${safeTitle},${item.videoId},${item.position}`;
          }).join('\n');
          
          const csvContent = header + rows;
          
          // Sanitize filename
          const filename = `${playlist.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${playlist.id}.csv`;
          
          const fileHandle = await folderHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(csvContent);
          await writable.close();
          
          count++;
        }
        
        addLog(`Successfully exported ${count} playlists to folder 'extracted_playlists'.`, 'success');
        setSelectedIds(new Set());
      } catch (err: any) {
         if (err.name === 'AbortError') {
           addLog('Export cancelled by user.', 'warning');
         } else {
           addLog(`Export failed: ${err.message}`, 'error');
         }
      } finally {
        setProcessing(false);
      }
    } else {
      addLog('Your browser does not support the File System Access API. Please use Chrome or Edge.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-white">Extract Playlists</h2>
           <p className="text-gray-400">Select playlists to download as CSV files.</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="secondary" onClick={fetchPlaylists} disabled={processing || loading}>
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
           </Button>
           <Button onClick={exportToFiles} disabled={selectedIds.size === 0 || processing} isLoading={processing}>
              <FolderOpen size={18} className="mr-2" />
              Save to Folder
           </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-400 border-b border-gray-700 pb-4">
         <button onClick={selectAll} className="hover:text-white">
            {selectedIds.size === playlists.length ? 'Deselect All' : 'Select All'}
         </button>
         <span>{selectedIds.size} selected</span>
      </div>

      {loading && playlists.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading playlists...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map(playlist => (
            <div 
              key={playlist.id} 
              onClick={() => toggleSelect(playlist.id)}
              className={`relative group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden ${
                selectedIds.has(playlist.id) 
                ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' 
                : 'bg-gray-800 border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="aspect-video w-full bg-gray-900 relative">
                <img 
                  src={playlist.thumbnail} 
                  alt={playlist.title} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                />
                {selectedIds.has(playlist.id) && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle size={16} />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/80 text-xs font-bold px-2 py-1 rounded text-white">
                  {playlist.itemCount} videos
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white line-clamp-1 mb-1" title={playlist.title}>
                  {playlist.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {playlist.privacyStatus} • {playlist.description || 'No description'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
