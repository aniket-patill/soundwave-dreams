import { MainLayout } from "@/components/layout/MainLayout";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockPlaylists } from "@/data/mockData";

const Playlists = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Playlists</h1>
          <p className="text-muted-foreground mt-1">Create and manage your collections</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Playlist
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {mockPlaylists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </MainLayout>
  );
};

export default Playlists;
