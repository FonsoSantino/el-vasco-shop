import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminPageHeader({ title, description, actionLabel, onAction }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-white/50 mt-1">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-full bg-gold text-black hover:bg-gold-dark font-bold premium-shadow">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
