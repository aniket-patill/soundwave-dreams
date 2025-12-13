export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  uploadedBy: string;
  createdAt: string;
  liked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  createdBy: string;
  songCount: number;
  songs: Song[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
}
