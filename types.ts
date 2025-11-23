export interface PlaylistItem {
  id: string; // The ID of the item in the playlist
  videoId: string;
  title: string;
  position: number;
  videoOwnerChannelTitle?: string;
  thumbnail?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  privacyStatus: string;
  items?: PlaylistItem[]; // Populated after fetching details
}

export interface CsvRow {
  playlistName: string;
  videoUrl: string;
  videoTitle: string;
  videoId: string;
  position: number;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  EXTRACT = 'EXTRACT',
  RESTORE = 'RESTORE',
  SETTINGS = 'SETTINGS'
}

export interface UserProfile {
  name: string;
  email: string;
  imageUrl: string;
}

export interface ProcessLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: number;
}
