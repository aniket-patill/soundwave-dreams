import { MainLayout } from "@/components/layout/MainLayout";
import { ContentRow } from "@/components/music/ContentRow";
import { SongCard } from "@/components/music/SongCard";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { mockSongs, mockPlaylists, recentlyPlayed, likedSongs, newUploads } from "@/data/mockData";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative -mx-6 -mt-6 mb-8 h-80 overflow-hidden">
        <img
          src={heroBackground}
          alt="Cloudly music streaming"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col justify-end p-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 animate-slide-up">
            Welcome back, <span className="text-primary">Shridhar</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Your personal music streaming experience. Discover new sounds, create playlists, and enjoy your favorites.
          </p>
        </div>
      </section>

      {/* Recently Played */}
      <ContentRow title="Recently Played">
        {recentlyPlayed.map((song) => (
          <SongCard key={song.id} song={song} queue={recentlyPlayed} />
        ))}
      </ContentRow>

      {/* Your Playlists */}
      <ContentRow title="Your Playlists">
        {mockPlaylists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </ContentRow>

      {/* Liked Songs */}
      <ContentRow title="Liked Songs">
        {likedSongs.map((song) => (
          <SongCard key={song.id} song={song} queue={likedSongs} />
        ))}
      </ContentRow>

      {/* New Uploads */}
      <ContentRow title="New Uploads">
        {newUploads.map((song) => (
          <SongCard key={song.id} song={song} queue={newUploads} />
        ))}
      </ContentRow>

      {/* All Songs */}
      <ContentRow title="Browse All">
        {mockSongs.map((song) => (
          <SongCard key={song.id} song={song} queue={mockSongs} />
        ))}
      </ContentRow>
    </MainLayout>
  );
};

export default Index;
