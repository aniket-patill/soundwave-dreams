import { useQuery } from "@tanstack/react-query";
import { musicService } from "@/services/music";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Discover() {
    const { data: playlists = [], isLoading, isError } = useQuery({
        queryKey: ['playlists', 'public'],
        queryFn: musicService.getPublicPlaylists
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-xl font-bold text-destructive mb-2">Error loading public playlists</h2>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Globe className="h-8 w-8 text-primary" />
                        Discover
                    </h1>
                    <p className="text-muted-foreground mt-1">Explore playlists shared by the community.</p>
                </div>
            </div>

            {playlists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {playlists.map((playlist) => (
                        <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Globe className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No public playlists found</p>
                    <p className="text-sm">Be the first to share one!</p>
                </div>
            )}
        </>
    );
}
