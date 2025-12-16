import { AnimatePresence, motion } from 'framer-motion';
import { usePlayer } from '@/contexts/PlayerContext';
import { useEffect, useState } from 'react';

export function ImmersiveBackground() {
    const { currentSong } = usePlayer();
    const [bgImage, setBgImage] = useState<string>('');

    useEffect(() => {
        if (currentSong?.coverUrl) {
            setBgImage(currentSong.coverUrl);
        }
    }, [currentSong]);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
            {/* Base dark layer */}
            <div className="absolute inset-0 bg-background/90 z-0" />

            <AnimatePresence mode="wait">
                {bgImage && (
                    <motion.div
                        key={bgImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.25 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 z-0"
                    >
                        {/* Large Blurred Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center blur-[100px] scale-110"
                            style={{ backgroundImage: `url(${bgImage})` }}
                        />

                        {/* Gradient Overlay to ensure readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Noise Texture (Optional for texture) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0 mix-blend-overlay" />
        </div>
    );
}
