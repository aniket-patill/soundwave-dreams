import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { MusicPlayer } from "./MusicPlayer";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 pb-24">
        <Navbar />
        <main className="p-6 cloudly-scrollbar">{children}</main>
      </div>
      <MusicPlayer />
    </div>
  );
}
