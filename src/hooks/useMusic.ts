import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { musicService } from '@/services/music';
import { Song, Playlist } from '@/types/music';

export const useSongs = () => {
  return useQuery({
    queryKey: ['songs'],
    queryFn: musicService.getAllSongs,
  });
};

export const useSearchSongs = (query: string) => {
  return useQuery({
    queryKey: ['songs', 'search', query],
    queryFn: () => musicService.searchSongs(query),
    enabled: !!query,
  });
};

export const useMySongs = () => {
  return useQuery({
    queryKey: ['songs', 'me'],
    queryFn: musicService.getMySongs,
  });
};

export const usePlaylists = () => {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: musicService.getAllPlaylists,
  });
};

export const useLikedSongs = () => {
  return useQuery({
    queryKey: ['songs', 'liked'],
    queryFn: musicService.getLikedSongs
  });
};

export const useRecentlyPlayed = () => {
  return useQuery({
    queryKey: ['songs', 'recent'],
    queryFn: musicService.getRecentlyPlayed
  });
};

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPlaylist: { name: string; description?: string; isPublic?: boolean; cover?: File | null }) =>
      musicService.createPlaylist(newPlaylist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

export const usePlaylist = (id: string) => {
  return useQuery({
    queryKey: ['playlist', id],
    queryFn: () => musicService.getPlaylist(id),
    enabled: !!id,
  });
};

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Playlist> }) =>
      musicService.updatePlaylist(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', data.id] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => musicService.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

export const useAddSongToPlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      musicService.addSongToPlaylist(playlistId, songId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', data.id] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

export const useRemoveSongFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      musicService.removeSongFromPlaylist(playlistId, songId),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};

export const useReorderPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songIds }: { playlistId: string; songIds: string[] }) =>
      musicService.reorderPlaylist(playlistId, songIds),
    onSuccess: (_, { playlistId }) => {
      // We might NOT want to invalidate immediately if we are optimistically updating, 
      // but for simplicity let's invalidate to ensure sync.
      // Ideally we update the cache directly for smooth UX.
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
};
