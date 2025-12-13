import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MusicPlayer() {
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

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-cloudly-player border-t border-border flex items-center justify-center">
        <p className="text-muted-foreground">Select a song to start playing</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-cloudly-player border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      <div className="flex h-full items-center justify-between px-4">
        {/* Currently playing info */}
        <div className="flex items-center gap-4 w-64">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="h-14 w-14 rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{currentSong.title}</p>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLike(currentSong.id)}
            className="shrink-0"
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
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={prevSong} className="text-foreground">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSong} className="text-foreground">
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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
              max={duration}
              step={1}
              onValueChange={(value) => setProgress(value[0])}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2 w-64 justify-end">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0] / 100)}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
