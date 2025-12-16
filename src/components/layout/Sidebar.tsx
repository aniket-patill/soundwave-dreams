import { Home, Library, Upload, ListMusic, Heart, User, Music2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: ListMusic, label: "Playlists", path: "/playlists" },
  { icon: Heart, label: "Liked Songs", path: "/liked" },
  { icon: User, label: "Profile", path: "/profile" },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  return (
    <aside className="h-full w-64 bg-cloudly-sidebar border-r border-border pb-24 flex flex-col relative z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Music2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">Cloudly</span>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all duration-200",
                  "hover:bg-cloudly-surface-hover hover:text-foreground"
                )}
                activeClassName="bg-cloudly-surface text-foreground"
                onClick={onLinkClick}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Decorative gradient */}
      <div className="absolute bottom-24 left-0 right-0 h-32 bg-gradient-to-t from-cloudly-sidebar to-transparent pointer-events-none" />
    </aside>
  );
}
