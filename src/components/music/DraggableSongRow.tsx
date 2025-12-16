import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Song } from "@/types/music";
import { cn } from "@/lib/utils";

interface DraggableSongRowProps {
    song: Song;
    index: number;
    isActive: boolean;
    onPlay: () => void;
    children: React.ReactNode;
}

export function DraggableSongRow({ song, index, isActive, onPlay, children }: DraggableSongRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: song.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-muted/50",
                isActive && "bg-muted/50",
                isDragging && "bg-background shadow-lg ring-1 ring-border"
            )}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity touch-none"
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {children}
        </div>
    );
}
