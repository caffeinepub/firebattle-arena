import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  Coins,
  LayoutDashboard,
  LogOut,
  Menu,
  Swords,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useUserProfile } from "../../hooks/useQueries";
import { useIsAdmin } from "../../hooks/useQueries";
import { useNotifications } from "../../hooks/useQueries";
import { formatCoin } from "../../utils/format";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const { data: notifications } = useNotifications();
  const router = useRouter();

  const isLoggedIn = !!identity && !!profile;
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/tournaments", label: "Tournaments" },
    ...(isLoggedIn ? [{ to: "/profile", label: "Profile" }] : []),
  ];

  const handleLogout = () => {
    clear();
    router.navigate({ to: "/" });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/assets/generated/firebattle-logo-transparent.dim_200x200.png"
            alt="FireBattle Arena"
            className="w-8 h-8 object-contain"
          />
          <span className="font-display font-bold text-sm sm:text-base text-foreground hidden xs:block">
            <span className="text-fire">Fire</span>Battle Arena
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.to}
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 text-sm"
            >
              <Link to={link.to}>{link.label}</Link>
            </Button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* Wallet */}
              <div className="hidden sm:flex items-center gap-1.5 bg-card border border-border rounded-md px-2.5 py-1.5">
                <Coins className="w-3.5 h-3.5 text-gold" />
                <span className="font-mono-gaming text-sm font-semibold text-foreground">
                  {formatCoin(profile?.walletBalance ?? BigInt(0))}
                </span>
              </div>

              {/* Notifications */}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="relative p-2 h-8 w-8"
              >
                <Link to="/notifications">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-fire text-primary-foreground border-0">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 h-8 px-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-fire/20 border border-fire/40 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-fire" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium max-w-[80px] truncate">
                      {profile?.username}
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-card border-border"
                >
                  {isAdmin && (
                    <DropdownMenuItem
                      asChild
                      className="text-fire cursor-pointer"
                    >
                      <Link to="/admin">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {!isInitializing && (
                <Button
                  size="sm"
                  className="bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm h-8 text-sm font-semibold"
                  onClick={login}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Swords className="w-3.5 h-3.5 mr-1.5" />
                      Sign In
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 h-8 w-8"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Button
                  key={link.to}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              ))}
              {isLoggedIn && (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link to="/notifications">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge className="ml-2 bg-fire text-primary-foreground text-xs border-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  {isAdmin && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-fire hover:text-fire"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link to="/admin">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </Button>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Coins className="w-4 h-4 text-gold" />
                    Balance:{" "}
                    <span className="font-mono-gaming text-foreground font-semibold">
                      {formatCoin(profile?.walletBalance ?? BigInt(0))}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
