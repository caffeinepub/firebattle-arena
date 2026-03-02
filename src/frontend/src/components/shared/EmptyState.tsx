import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { BarChart3, Bell, Swords, Trophy, Users } from "lucide-react";

interface EmptyStateProps {
  icon?: "tournaments" | "trophy" | "bell" | "users" | "revenue";
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

const icons = {
  tournaments: Swords,
  trophy: Trophy,
  bell: Bell,
  users: Users,
  revenue: BarChart3,
};

export function EmptyState({
  icon = "tournaments",
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-display font-semibold text-foreground text-lg mb-1">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {description}
      </p>
      {actionLabel &&
        (actionTo ? (
          <Button
            asChild
            className="bg-fire text-primary-foreground hover:opacity-90"
          >
            <Link to={actionTo}>{actionLabel}</Link>
          </Button>
        ) : onAction ? (
          <Button
            className="bg-fire text-primary-foreground hover:opacity-90"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  );
}
