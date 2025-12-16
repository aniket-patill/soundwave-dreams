import { Sidebar } from "./Sidebar";
import { MusicPlayer } from "./MusicPlayer";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { musicService } from "@/services/music";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { CloudlyOrb } from "@/components/voice/CloudlyOrb";
import { ImmersiveBackground } from "./ImmersiveBackground";

export function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const queryClient = useQueryClient();
  const { orbState, transcript, isListening } = useVoiceAssistant();

  // Prefetch songs on mount for voice assistant
  useEffect(() => {
    const prefetchSongs = async () => {
      try {
        const songs = await musicService.getAllSongs();
        queryClient.setQueryData(['songs'], songs);
      } catch (e) {
        console.error("Failed to prefetch songs for voice", e);
      }
    };
    prefetchSongs();
  }, [queryClient]);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent relative selection:bg-primary/20">
      <ImmersiveBackground />
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="lg:hidden absolute top-4 left-4 z-50">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar onLinkClick={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 cloudly-scrollbar pb-32">
          <Outlet />
        </main>
      </div>



      <MusicPlayer />
    </div>
  );
}
