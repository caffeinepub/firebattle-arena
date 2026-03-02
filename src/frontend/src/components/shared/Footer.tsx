import { ExternalLink, Flame } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-fire" />
            <span className="font-display font-semibold text-foreground">
              FireBattle Arena
            </span>
            <span className="text-muted-foreground">
              — Free Fire Tournament Platform
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            &copy; {year}. Built with <span className="text-red-400">♥</span>{" "}
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fire hover:underline inline-flex items-center gap-0.5"
            >
              caffeine.ai
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
