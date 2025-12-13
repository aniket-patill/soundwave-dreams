import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, ListMusic, Heart, Settings } from "lucide-react";
import { mockSongs, mockPlaylists, likedSongs } from "@/data/mockData";

const Profile = () => {
  const stats = [
    { label: "Songs Uploaded", value: mockSongs.length, icon: Music },
    { label: "Playlists Created", value: mockPlaylists.length, icon: ListMusic },
    { label: "Liked Songs", value: likedSongs.length, icon: Heart },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8 p-6 rounded-xl bg-card border border-border">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" />
            <AvatarFallback className="text-2xl">SH</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Shridhar</h1>
            <p className="text-muted-foreground">shridhar@example.com</p>
            <p className="text-sm text-muted-foreground mt-1">Member since January 2024</p>
          </div>
          <Button variant="secondary">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-xl bg-card border border-border text-center"
            >
              <stat.icon className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Profile Settings */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Profile Settings</h2>
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue="Shridhar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="shridhar@example.com" />
            </div>
            <Button className="w-fit">Save Changes</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
