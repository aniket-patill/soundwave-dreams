import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useQueryClient } from '@tanstack/react-query';
import { Song } from '@/types/music';
import { toast } from 'sonner';
import { musicService } from '@/services/music';

// Types for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'active';

export function useVoiceAssistant() {
    const [orbState, setOrbState] = useState<OrbState>('idle');
    const [transcript, setTranscript] = useState('');

    // We use a ref for the "Listening Session" to avoid closure stale state in the event handler
    const isSessionActive = useRef(false);
    const sessionTimeout = useRef<NodeJS.Timeout | null>(null);

    const {
        currentSong,
        togglePlay,
        nextSong,
        prevSong,
        setVolume,
        playSong,
        isPlaying,
        volume,
        toggleLike,
        shuffleQueue
    } = usePlayer();

    const queryClient = useQueryClient();
    const recognitionRef = useRef<any>(null);
    const isEnabledRef = useRef(false);
    const synth = window.speechSynthesis;

    // --- Core Speech Logic ---

    const startSession = () => {
        isSessionActive.current = true;
        setOrbState('listening');
        speak("I'm here"); // feedback

        // Timeout: If no command in 5 seconds, close session
        if (sessionTimeout.current) clearTimeout(sessionTimeout.current);
        sessionTimeout.current = setTimeout(() => {
            endSession();
        }, 5000);
    };

    const endSession = () => {
        isSessionActive.current = false;
        if (sessionTimeout.current) clearTimeout(sessionTimeout.current);
        setOrbState('idle');
    };

    const speak = (text: string) => {
        if (synth.speaking) synth.cancel();
        setOrbState('speaking');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onend = () => {
            // If we just said "I'm here", we are listening.
            // If we said something else, we might be done or still listening?
            // Logic in startSession handles state.
            if (!isSessionActive.current) setOrbState('idle');
            else setOrbState('listening');
        };
        synth.speak(utterance);
    };

    const processCommand = async (text: string) => {
        // Clean text
        const command = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        setTranscript(command);

        // 1. WAKE WORD CHECK (Always active if not in session)
        if (!isSessionActive.current) {
            const wakeWords = ['hey cloudly', 'hey cloud', 'hi cloudly', 'okay cloudly', 'cloudly'];
            if (wakeWords.some(w => command.endsWith(w) || command.includes(w))) {
                console.log("Wake word detected!");
                startSession();
                return;
            }
            return; // Ignore other noise when not active
        }

        // 2. COMMAND PROCESSING (Only if Session is Active)
        if (isSessionActive.current) {
            console.log(`Processing command in session: ${command}`);

            // Reset timeout since we heard something
            if (sessionTimeout.current) clearTimeout(sessionTimeout.current);
            sessionTimeout.current = setTimeout(endSession, 5000);

            let executed = false;

            // Simple Keywords
            if (['stop', 'pause', 'quiet'].some(w => command.includes(w))) {
                if (isPlaying) togglePlay();
                toast.success("Paused");
                executed = true;
            }
            else if (['play', 'resume', 'start'].some(w => command === w || command.includes('start music'))) {
                // strict 'play' might be 'play song...' so play single word needs strict check
                if (!isPlaying) togglePlay();
                toast.success("Resumed");
                executed = true;
            }
            else if (['next', 'skip'].some(w => command.includes(w))) {
                nextSong();
                toast.success("Next Song");
                executed = true;
            }
            else if (['previous', 'back'].some(w => command.includes(w))) {
                prevSong();
                executed = true;
            }
            else if (command.includes('shuffle')) {
                shuffleQueue();
                speak("Shuffling");
                executed = true;
            }
            else if (['volume up', 'louder'].some(w => command.includes(w))) {
                setVolume(Math.min(1, (volume || 0.7) + 0.2));
                executed = true;
            }
            else if (['volume down', 'quieter'].some(w => command.includes(w))) {
                setVolume(Math.max(0, (volume || 0.7) - 0.2));
                executed = true;
            }
            else if (command.includes('like')) {
                if (currentSong) toggleLike(currentSong.id, !currentSong.liked);
                speak("Liked");
                executed = true;
            }
            // Smart Search "Play [Song]"
            else if (command.startsWith('play ')) {
                const query = command.replace('play', '').trim();
                if (query) {
                    await findAndPlaySong(query);
                    executed = true;
                }
            }
            // Moods
            else if (['calm', 'sad', 'happy', 'focus'].some(m => command.includes(m))) {
                // trigger mood search
                const mood = ['calm', 'sad', 'happy', 'focus'].find(m => command.includes(m));
                findAndPlaySong(mood || 'lofi');
                executed = true;
            }

            if (executed) {
                setOrbState('active'); // Pulse
                setTimeout(endSession, 1000); // Close session after successful command
            }
        }
    };


    // --- Setup & Lifecycle ---

    // Mount effect to start voice
    useEffect(() => {
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const Recognition = SpeechRecognition || webkitSpeechRecognition;

        if (!Recognition) {
            console.warn('Speech recognition not supported.');
            return;
        }

        const recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Still need true for fast wake word
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('🎤 Cloudly listening...');
            isEnabledRef.current = true;
        };

        recognition.onend = () => {
            if (isEnabledRef.current) {
                console.log('↻ Voice restarted');
                setTimeout(() => { try { recognition.start(); } catch (e) { } }, 500);
            } else {
                setOrbState('idle');
            }
        };

        recognition.onresult = (event: any) => {
            const results = Array.from(event.results);
            const lastResult: any = results[results.length - 1];
            const text = lastResult[0].transcript.trim().toLowerCase();
            const isFinal = lastResult.isFinal;

            // If final, standard process
            if (isFinal) {
                processCommand(text);
            }
            // If interim, check specifically for wake word to catch it early
            else {
                if (!isSessionActive.current) {
                    // Fast wake word detection
                    if (text.endsWith('hey cloudly') || text.includes('hey cloud') || text.includes('hi cloud')) {
                        startSession();
                    }
                }
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') return; // Ignore normal silence
            console.error('Speech error:', event.error);
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (e) {
            console.log('Voice waiting for interaction...');
        }

        return () => {
            isEnabledRef.current = false;
            recognition.stop();
            if (sessionTimeout.current) clearTimeout(sessionTimeout.current);
        };
    }, []);

    // Sync Library on Mount (Scans for "pre-added" songs)
    useEffect(() => {
        const sync = async () => {
            try {
                const s = await musicService.getAllSongs();
                queryClient.setQueryData(['songs'], s);
                console.log(`📚 Cloudly scanned ${s.length} songs from library.`);
            } catch (e) {
                console.error("Failed to scan library for voice", e);
            }
        };
        sync();
    }, [queryClient]);

    const findAndPlaySong = async (query: string) => {
        toast.info(`Searching: ${query}`);
        let list = queryClient.getQueryData(['songs']) as Song[] | { songs: Song[] };
        let songs: Song[] = [];

        if (Array.isArray(list)) songs = list;
        else if ((list as any)?.songs) songs = (list as any).songs;

        // Force fetch if empty
        if (!songs?.length) {
            console.log("Empty library cache, force fetching...");
            try {
                songs = await musicService.getAllSongs();
                queryClient.setQueryData(['songs'], songs);
            } catch (e) {
                console.error("Fetch failed", e);
                speak("I can't reach the music library right now.");
                return;
            }
        }

        if (!songs.length) { speak("I don't see any songs in your library."); return; }

        const match = songs.find(s =>
            s.title.toLowerCase().includes(query) ||
            s.artist.toLowerCase().includes(query) ||
            s.album.toLowerCase().includes(query)
        );

        if (match) {
            console.log(`Found song: ${match.title}`);
            playSong(match);
            toast.success(`Playing ${match.title}`);
        } else {
            // Fallback for Moods (Random pick from list if keyword matches nothing)
            if (['calm', 'sad', 'happy', 'focus'].some(m => query.includes(m))) {
                speak(`Playing some ${query} music`);
                // Just pick a random one for now as "mood"
                const random = songs[Math.floor(Math.random() * songs.length)];
                playSong(random);
            } else {
                speak(`I couldn't find ${query}`);
            }
        }
    };

    return {
        orbState,
        transcript,
        isListening: isEnabledRef.current
    };
}
