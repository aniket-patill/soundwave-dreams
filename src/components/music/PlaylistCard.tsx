import { Play } from "lucide-react";
import { Playlist } from "@/types/music";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const { playSong } = usePlayer();

  const handlePlay = () => {
    if (playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex-shrink-0 w-44 cursor-pointer rounded-lg bg-card p-3 transition-all duration-300",
        "hover:bg-cloudly-surface-hover hover:scale-[1.02]"
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-square overflow-hidden rounded-md mb-3">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Play overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200",
            "group-hover:opacity-100"
          )}
        >
          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-transform shadow-lg cloudly-glow"
            onClick={handlePlay}
          >
            <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Playlist info */}
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate text-sm">{playlist.name}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {playlist.songCount} songs
        </p>
      </div>
    </div>
  );
}
