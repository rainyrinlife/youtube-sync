import React, { useState } from 'react';
import { Button } from './Button';
import { X, Key } from 'lucide-react';

interface SettingsModalProps {
  currentClientId: string;
  onSave: (clientId: string) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentClientId, 
  onSave, 
  onClose 
}) => {
  const [clientId, setClientId] = useState(currentClientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Key size={18} className="text-blue-400"/>
            <span>API Configuration</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Google Cloud Client ID <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="xxxx.apps.googleusercontent.com"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Required for YouTube authentication.</p>
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(clientId)} disabled={!clientId.trim()}>
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};