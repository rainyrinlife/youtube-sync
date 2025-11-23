import { Playlist, PlaylistItem } from '../types';

// Declaration for global google and gapi objects
declare global {
  interface Window {
    google: any;
    gapi: any;
    tokenClient: any;
  }
}

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl';

export class YouTubeService {
  private static instance: YouTubeService;
  private tokenClient: any;
  private accessToken: string | null = null;
  private isGapiInitialized = false;
  private isGisInitialized = false;

  private constructor() {}

  public static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  public async initialize(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkScripts = setInterval(() => {
        if (window.gapi && window.google) {
          clearInterval(checkScripts);
          this.loadGapi(clientId).then(() => {
             this.initTokenClient(clientId);
             resolve();
          }).catch(reject);
        }
      }, 100);
    });
  }

  private async loadGapi(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
          });
          this.isGapiInitialized = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  private initTokenClient(clientId: string) {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp: any) => {
        if (resp.error !== undefined) {
          throw resp;
        }
        this.accessToken = resp.access_token;
      },
    });
    this.isGisInitialized = true;
  }

  public async signIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) return reject('Token client not initialized');
      
      // Override callback for this specific sign-in request to resolve the promise
      this.tokenClient.callback = (resp: any) => {
        if (resp.error) {
          reject(resp);
        } else {
          this.accessToken = resp.access_token;
          resolve();
        }
      };
      
      if (window.gapi.client.getToken() === null) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  public signOut() {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      this.accessToken = null;
    }
  }

  public async getUserProfile(): Promise<any> {
    // YouTube Data API channel request for 'mine'
    const response = await window.gapi.client.youtube.channels.list({
      part: 'snippet,contentDetails',
      mine: true,
    });
    return response.result.items[0].snippet;
  }

  public async getPlaylists(): Promise<Playlist[]> {
    let playlists: Playlist[] = [];
    let nextPageToken = '';
    
    do {
      const response: any = await window.gapi.client.youtube.playlists.list({
        part: 'snippet,contentDetails,status',
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken
      });

      const items = response.result.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        itemCount: item.contentDetails.itemCount,
        privacyStatus: item.status.privacyStatus
      }));
      
      playlists = [...playlists, ...items];
      nextPageToken = response.result.nextPageToken;
    } while (nextPageToken);

    return playlists;
  }

  public async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    let items: PlaylistItem[] = [];
    let nextPageToken = '';

    do {
      const response: any = await window.gapi.client.youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken
      });

      const mappedItems = response.result.items.map((item: any) => ({
        id: item.id,
        videoId: item.contentDetails.videoId,
        title: item.snippet.title,
        position: item.snippet.position,
        videoOwnerChannelTitle: item.snippet.videoOwnerChannelTitle,
        thumbnail: item.snippet.thumbnails?.default?.url
      }));

      items = [...items, ...mappedItems];
      nextPageToken = response.result.nextPageToken;
    } while (nextPageToken);

    return items;
  }

  public async createPlaylist(title: string, description: string, privacyStatus: string = 'private'): Promise<string> {
    const response: any = await window.gapi.client.youtube.playlists.insert({
      part: 'snippet,status',
      resource: {
        snippet: {
          title,
          description
        },
        status: {
          privacyStatus
        }
      }
    });
    return response.result.id;
  }

  public async addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
    await window.gapi.client.youtube.playlistItems.insert({
      part: 'snippet',
      resource: {
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId
          }
        }
      }
    });
  }
}
