import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Song, PlayerState } from "@/types/music";
import { musicService } from "@/services/music";

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  toggleLike: (songId: string, currentLikedStatus: boolean) => void;
  shuffleQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    volume: 0.7,
    progress: 0,
    duration: 0,
    queue: [],
    queueIndex: 0,
  });

  const playSong = useCallback((song: Song, queue?: Song[]) => {
    const newQueue = queue || [song];
    const index = newQueue.findIndex((s) => s.id === song.id);
    setState((prev) => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      progress: 0,
      duration: song.duration,
      queue: newQueue,
      queueIndex: index >= 0 ? index : 0,
    }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const nextSong = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) return prev;
      const nextIndex = (prev.queueIndex + 1) % prev.queue.length;
      const nextSong = prev.queue[nextIndex];
      return {
        ...prev,
        currentSong: nextSong,
        queueIndex: nextIndex,
        progress: 0,
        duration: nextSong.duration,
      };
    });
  }, []);

  const prevSong = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) return prev;
      const prevIndex = prev.queueIndex === 0 ? prev.queue.length - 1 : prev.queueIndex - 1;
      const prevSongData = prev.queue[prevIndex];
      return {
        ...prev,
        currentSong: prevSongData,
        queueIndex: prevIndex,
        progress: 0,
        duration: prevSongData.duration,
      };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const toggleLike = useCallback(async (songId: string, currentLikedStatus: boolean) => {
    // Optimistic update
    setState((prev) => {
      // Logic for optimistic update logic remains similar but relies on the passed status
      const newStatus = !currentLikedStatus;

      // Update backend
      console.log(`[DEBUG] Toggling like for song ${songId}. Current state: ${currentLikedStatus} (sending ${!currentLikedStatus})`);
      musicService.toggleLikeSong(songId, currentLikedStatus)
        .then(() => {
          console.log('[DEBUG] Like toggle successful, invalidating queries');
          // Invalidate queries to refresh data across the app
          queryClient.invalidateQueries({ queryKey: ['songs'] });
        })
        .catch(err => {
          console.error("[DEBUG] Failed to toggle like:", err);
          // Revert if failed (could implement revert logic here)
        });

      return {
        ...prev,
        queue: prev.queue.map((song) =>
          song.id === songId ? { ...song, liked: newStatus } : song
        ),
        currentSong:
          prev.currentSong?.id === songId
            ? { ...prev.currentSong, liked: newStatus }
            : prev.currentSong,
      }
    });
  }, [queryClient]);

  const shuffleQueue = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length <= 1) return prev;

      const current = prev.currentSong;
      const rest = prev.queue.filter(s => s.id !== current?.id);

      // Fisher-Yates shuffle
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }

      const newQueue = current ? [current, ...rest] : rest;

      return {
        ...prev,
        queue: newQueue,
        queueIndex: 0 // Current song is now at 0
      };
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        setVolume,
        setProgress,
        toggleLike,
        shuffleQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
