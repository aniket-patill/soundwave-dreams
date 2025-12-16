import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Determine backend URL (handle both local and production if possible, or just hardcode for now/use env)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(BACKEND_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('🔌 Connected to Socket.io server');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        // Listen for real-time song updates
        socket.on('song:uploaded', (newSong) => {
            console.log('🎵 New song uploaded:', newSong.title);

            // Invalidate queries to refresh lists
            queryClient.invalidateQueries({ queryKey: ['songs'] });

            // Optional: Show a toast
            toast.success(`New song added: ${newSong.title} by ${newSong.artist}`, {
                description: "Added to library instantly."
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient]);

    return socketRef.current;
};
