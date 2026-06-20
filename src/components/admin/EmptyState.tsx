import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedDiv } from "@/components/ui/AnimatedDiv";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, actionHref }: EmptyStateProps) {
  return (
    <AnimatedDiv 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] bg-foreground/[0.02] border border-dashed border-foreground/10 rounded-3xl p-8 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center mb-6 premium-shadow border border-foreground/5">
        <Icon className="w-8 h-8 text-foreground/40" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-foreground/50 max-w-sm mb-6">{description}</p>
      
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button className="rounded-full bg-gold text-black hover:bg-gold-dark premium-shadow">
                {actionLabel}
              </Button>
            </Link>
          ) : onAction ? (
            <Button onClick={onAction} className="rounded-full bg-gold text-black hover:bg-gold-dark premium-shadow">
              {actionLabel}
            </Button>
          ) : null}
        </>
      )}
    </AnimatedDiv>
  );
}
