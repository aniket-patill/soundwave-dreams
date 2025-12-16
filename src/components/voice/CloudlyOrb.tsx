import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

type OrbState = 'idle' | 'listening' | 'processing' | 'active' | 'speaking';

interface CloudlyOrbProps {
    state: OrbState;
    className?: string;
    transcript?: string;
    isListening?: boolean;
}

export function CloudlyOrb({ state, className, transcript, isListening }: CloudlyOrbProps) {
    return (
        <div className={cn("relative flex items-center justify-center w-14 h-14 z-50", className)}>
            {/* Core Orb */}
            <div
                className={cn(
                    "w-10 h-10 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                    state === 'idle' && "bg-white/30 animate-pulse scale-90",
                    state === 'listening' && "bg-cyan-400 scale-110 shadow-[0_0_30px_rgba(34,211,238,0.8)]",
                    state === 'processing' && "bg-purple-500 scale-100 animate-spin bg-gradient-to-tr from-purple-500 to-blue-500",
                    state === 'speaking' && "bg-green-400 scale-110 animate-bounce shadow-[0_0_30px_rgba(74,222,128,0.8)]",
                    state === 'active' && "bg-white scale-125 shadow-[0_0_35px_rgba(255,255,255,1)]"
                )}
            />

            {/* Ripple Effect (Listening) */}
            {state === 'listening' && (
                <>
                    <div className="absolute w-full h-full rounded-full border border-cyan-400/30 animate-[ping_1.5s_ease-in-out_infinite]" />
                    <div className="absolute w-full h-full rounded-full border border-cyan-400/20 animate-[ping_1.5s_ease-in-out_infinite_delay-300ms]" />
                </>
            )}

            {/* Processing Glow */}
            {state === 'processing' && (
                <div className="absolute w-10 h-10 rounded-full border-2 border-t-purple-400 border-r-transparent border-b-blue-400 border-l-transparent animate-spin" />
            )}

            {/* Live Transcript Bubble */}
            {(state === 'listening' || state === 'processing') && transcript && (
                <div className="absolute right-16 top-0 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border border-white/10 animate-in fade-in slide-in-from-right-4">
                    {transcript}
                </div>
            )}
        </div>
    );
}
