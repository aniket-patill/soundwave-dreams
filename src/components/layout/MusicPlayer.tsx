import { useRef, useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, Maximize2, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { CloudlyOrb } from "../voice/CloudlyOrb";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { Visualizer } from "../music/Visualizer";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlay,
    nextSong,
    prevSong,
    setVolume,
    setProgress,
    toggleLike,
  } = usePlayer();

  const { orbState } = useVoiceAssistant();

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Playback failed:", error);
          // Handle auto-play policies or errors
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]); // Re-run when song or play state changes

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle seeking when progress is set manually (optional, usually tricky with state loops)
  // For now, let's rely on the slider's onValueChange updating the audio time directly too?
  // No, the context `setProgress` just updates state. We need a way to seek.
  // Let's modify the Slider's onValueChange.

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    nextSong();
  };


  if (!currentSong) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Expanded Visualizer View */}
      <div className={cn(
        "fixed inset-0 z-[60] bg-background/95 backdrop-blur-3xl transition-all duration-500 flex flex-col items-center justify-center p-8",
        isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronDown className="h-8 w-8" />
        </Button>

        <div className="flex flex-col items-center gap-8 max-w-4xl w-full">
          <div className="relative group">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-64 h-64 md:w-96 md:h-96 rounded-2xl shadow-2xl object-cover"
            />
            {/* Visualizer Overlay */}
            <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
              <Visualizer className="h-24 gap-2" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold">{currentSong.title}</h2>
            <p className="text-xl text-muted-foreground">{currentSong.artist}</p>
          </div>

          {/* Lyrics Placeholder */}
          <div className="w-full max-w-lg h-32 overflow-y-auto text-center text-muted-foreground/50 space-y-1 mask-linear-fade">
            <p>Lyrics not available</p>
            <p className="text-sm">(Lyrics integration coming soon)</p>
          </div>

          {/* Expanded Controls */}
          <div className="w-full max-w-md space-y-6">
            <div className="flex w-full items-center gap-4">
              <span className="text-sm text-muted-foreground w-12 text-right">
                {formatTime(progress)}
              </span>
              <Slider
                value={[progress]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground w-12">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-8">
              <Button variant="ghost" size="icon" onClick={prevSong} className="h-12 w-12">
                <SkipBack className="h-8 w-8" />
              </Button>
              <Button
                onClick={togglePlay}
                className="h-16 w-16 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={nextSong} className="h-12 w-12">
                <SkipForward className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 h-24 border-t bg-background/60 backdrop-blur-xl flex items-center justify-between px-4 transition-all duration-300">
        <audio
          ref={audioRef}
          key={currentSong.id} // Forces remount on song change
          src={currentSong.audioUrl}
          crossOrigin="anonymous"
          autoPlay={isPlaying}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={(e) => console.error("Audio playback error:", e.currentTarget.error)}
        />
        {/* Currently playing info */}
        <div className="flex items-center gap-4 w-64">
          <div className="relative group cursor-pointer" onClick={() => setIsExpanded(true)}>
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="h-14 w-14 rounded-md object-cover shadow-md group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate cursor-pointer hover:underline" onClick={() => setIsExpanded(true)}>{currentSong.title}</p>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLike(currentSong.id, !!currentSong.liked)}
            className="shrink-0 hover:bg-white/10"
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                currentSong.liked ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>

        {/* Player controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/10">
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={prevSong} className="text-foreground hover:bg-white/10">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSong} className="text-foreground hover:bg-white/10">
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/10">
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="flex w-full items-center gap-2">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-4 w-64 justify-end">
          <CloudlyOrb state={orbState} className="mr-2" />
          <div className="flex items-center gap-2 group">
            <Volume2 className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0] / 100)}
              className="w-24 cursor-pointer"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} className="ml-2">
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </>
  );
}
