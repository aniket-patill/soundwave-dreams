import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ContentRowProps {
  title: string;
  children: ReactNode;
  onViewAll?: () => void;
}

export function ContentRow({ title, children, onViewAll }: ContentRowProps) {
  return (
    <section className="mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {onViewAll && (
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={onViewAll}
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 cloudly-scrollbar">
        {children}
      </div>
    </section>
  );
}
