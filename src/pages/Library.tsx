import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongCard } from "@/components/music/SongCard";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { mockSongs, mockPlaylists, likedSongs } from "@/data/mockData";

const Library = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
        <p className="text-muted-foreground mt-1">All your music in one place</p>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="bg-secondary mb-6">
          <TabsTrigger value="songs">Your Songs</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mockSongs.map((song) => (
              <SongCard key={song.id} song={song} queue={mockSongs} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="playlists" className="animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mockPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="liked" className="animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {likedSongs.map((song) => (
              <SongCard key={song.id} song={song} queue={likedSongs} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Library;
