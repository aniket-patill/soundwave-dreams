import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, Music, Image, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast({
      title: "Upload successful!",
      description: `"${formData.title}" has been added to your library.`,
    });
    
    setFormData({ title: "", artist: "", album: "" });
    setIsUploading(false);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Upload Music</h1>
          <p className="text-muted-foreground mt-1">Share your music with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Audio File Upload */}
          <div className="space-y-2">
            <Label>Audio File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-card">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">Drop your audio file here</p>
              <p className="text-sm text-muted-foreground mt-1">MP3, WAV, or M4A up to 50MB</p>
              <Button type="button" variant="secondary" className="mt-4">
                <UploadIcon className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-card">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">Drop your cover image here</p>
              <p className="text-sm text-muted-foreground mt-1">JPG or PNG, recommended 500x500px</p>
              <Button type="button" variant="secondary" className="mt-4">
                <UploadIcon className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </div>
          </div>

          {/* Metadata Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter song title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                placeholder="Enter artist name"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input
                id="album"
                placeholder="Enter album name (optional)"
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload Song
              </>
            )}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default Upload;
