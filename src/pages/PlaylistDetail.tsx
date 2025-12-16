import { useNavigate, useParams } from "react-router-dom";
import { usePlaylist, useDeletePlaylist, useUpdatePlaylist, useSongs, useAddSongToPlaylist, useRemoveSongFromPlaylist, useReorderPlaylist } from "@/hooks/useMusic";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Music, MoreVertical, Trash, Edit, Plus, X, GripVertical } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { SongCard } from "@/components/music/SongCard";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableSongRow } from "@/components/music/DraggableSongRow";
import { Song } from "@/types/music";

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playSong } = usePlayer();

  const { data: playlist, isLoading, isError } = usePlaylist(id || "");
  const deletePlaylist = useDeletePlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const addSong = useAddSongToPlaylist();
  const removeSong = useRemoveSongFromPlaylist();
  const reorderPlaylist = useReorderPlaylist();
  const { data: allSongs = [] } = useSongs();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [searchSong, setSearchSong] = useState("");

  // Local state for optimistic reordering
  const [orderedSongs, setOrderedSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (playlist?.songs) {
      setOrderedSongs(playlist.songs);
    }
  }, [playlist]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedSongs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Trigger server update
        if (playlist) {
          reorderPlaylist.mutate({
            playlistId: playlist.id,
            songIds: newOrder.map(s => s.id)
          });
        }

        return newOrder;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Error loading playlist</h2>
        <Button onClick={() => navigate("/playlists")}>Go Back</Button>
      </div>
    );
  }

  // Check if current user is owner (simplified check, assume local check for now or handle via backend error)
  // For UI, we enable drag if we can edit
  const isOwner = true; // In a real app we'd check user ID vs playlist.createdBy._id

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      await deletePlaylist.mutateAsync(playlist.id);
      toast({ title: "Playlist deleted" });
      navigate("/playlists");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePlaylist.mutateAsync({
      id: playlist.id,
      updates: { name: editName, description: editDesc }
    });
    setIsEditOpen(false);
    toast({ title: "Playlist updated" });
  };

  const handleAddSong = async (songId: string) => {
    try {
      await addSong.mutateAsync({ playlistId: playlist.id, songId });
      toast({ title: "Song added" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to add song" });
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      await removeSong.mutateAsync({ playlistId: playlist.id, songId });
      toast({ title: "Song removed" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to remove song" });
    }
  };

  const filteredSongsToAdd = allSongs.filter(s =>
    !playlist.songs.find(ps => ps.id === s.id) &&
    (s.title.toLowerCase().includes(searchSong.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchSong.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 bg-gradient-to-b from-secondary/50 to-background p-6 rounded-xl">
        <div className="h-52 w-52 shadow-xl rounded-lg overflow-hidden shrink-0">
          <img src={playlist.coverUrl} alt={playlist.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 w-full space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{playlist.name}</h1>
            <p className="text-lg text-muted-foreground">{playlist.description}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{playlist.songCount} songs</span>
            <span>•</span>
            <span>{typeof playlist.createdBy === 'object' ? (playlist.createdBy as any).name : playlist.createdBy}</span>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full"
              onClick={() => orderedSongs.length > 0 && playSong(orderedSongs[0], orderedSongs)}
            >
              <Play className="h-5 w-5 mr-2 fill-current" />
              Play
            </Button>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => {
                  setEditName(playlist.name);
                  setEditDesc(playlist.description);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Playlist</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Songs</h2>
          <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Songs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Songs to Playlist</DialogTitle>
                <Input
                  placeholder="Search songs..."
                  value={searchSong}
                  onChange={e => setSearchSong(e.target.value)}
                  className="mt-4"
                />
              </DialogHeader>
              <div className="space-y-2 mt-4">
                {filteredSongsToAdd.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No songs found</p>
                ) : (
                  filteredSongsToAdd.map(song => (
                    <div key={song.id} className="flex items-center justify-between p-2 hover:bg-secondary rounded-md">
                      <div className="flex items-center gap-3">
                        <img src={song.coverUrl} className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="font-medium">{song.title}</p>
                          <p className="text-xs text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleAddSong(song.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {orderedSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-muted rounded-xl">
            <Music className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">This playlist is empty</p>
            <Button variant="link" onClick={() => setIsAddSongOpen(true)}>Add songs now</Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedSongs.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {orderedSongs.map((song, index) => (
                  <DraggableSongRow
                    key={song.id}
                    song={song}
                    index={index}
                    isActive={false} // can add isActive check if needed
                    onPlay={() => playSong(song, orderedSongs)}
                  >
                    {/* Row Content */}
                    <div className="flex flex-1 items-center gap-4">
                      <div className="flex items-center justify-center w-8 text-muted-foreground font-medium">
                        {index + 1}
                      </div>
                      <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                        <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <div className="hidden md:block text-sm text-muted-foreground w-20 text-right">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSong(song.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DraggableSongRow>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
export default PlaylistDetail;
