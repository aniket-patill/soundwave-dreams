import { Play, Heart } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SongCardProps {
  song: Song;
  queue?: Song[];
}

export function SongCard({ song, queue }: SongCardProps) {
  const { playSong, currentSong, isPlaying, toggleLike } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  return (
    <div
      className={cn(
        "group relative flex-shrink-0 w-44 cursor-pointer rounded-lg bg-card p-3 transition-all duration-300",
        "hover:bg-cloudly-surface-hover hover:scale-[1.02]",
        isCurrentSong && "ring-2 ring-primary"
      )}
      onClick={() => playSong(song, queue)}
    >
      {/* Cover Image */}
      <div className="relative aspect-square overflow-hidden rounded-md mb-3">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Play overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200",
            "group-hover:opacity-100",
            isCurrentSong && isPlaying && "opacity-100"
          )}
        >
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-transform shadow-lg cloudly-glow"
            onClick={(e) => {
              e.stopPropagation();
              playSong(song, queue);
            }}
          >
            <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
          </Button>
        </div>

        {/* Like button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 opacity-0 transition-opacity",
            "group-hover:opacity-100 hover:bg-black/70"
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song.id);
          }}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              song.liked ? "fill-primary text-primary" : "text-white"
            )}
          />
        </Button>
      </div>

      {/* Song info */}
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate text-sm">{song.title}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{song.artist}</p>
      </div>
    </div>
  );
}
