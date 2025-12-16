import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

interface VisualizerProps {
    className?: string;
}

export function Visualizer({ className }: VisualizerProps) {
    const { isPlaying } = usePlayer();
    const [bars, setBars] = useState<number[]>(Array(20).fill(10));

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setBars(prev => prev.map(() => Math.random() * 80 + 20));
            }, 100);
        } else {
            setBars(Array(20).fill(10));
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className={cn("flex items-end justify-center gap-1 h-32", className)}>
            {bars.map((height, i) => (
                <div
                    key={i}
                    className="w-2 bg-primary/80 rounded-t-md transition-all duration-300 ease-in-out"
                    style={{ height: `${height}%` }}
                />
            ))}
        </div>
    );
}
