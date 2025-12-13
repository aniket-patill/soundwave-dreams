import { MainLayout } from "@/components/layout/MainLayout";
import { SongCard } from "@/components/music/SongCard";
import { Heart } from "lucide-react";
import { likedSongs } from "@/data/mockData";

const Liked = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Liked Songs</h1>
            <p className="text-muted-foreground">{likedSongs.length} songs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {likedSongs.map((song) => (
          <SongCard key={song.id} song={song} queue={likedSongs} />
        ))}
      </div>
    </MainLayout>
  );
};

export default Liked;
