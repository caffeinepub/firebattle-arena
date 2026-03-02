import { Button } from "@/components/ui/button";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronLeft,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Swords,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useIsAdmin } from "../../hooks/useQueries";
import { PageLoadingSkeleton } from "./LoadingSkeleton";

const navItems = [
  {
    to: "/admin" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: "/admin/tournaments" as const,
    label: "Tournaments",
    icon: Swords,
    exact: false,
  },
  { to: "/admin/users" as const, label: "Users", icon: Users, exact: false },
  {
    to: "/admin/revenue" as const,
    label: "Revenue",
    icon: BarChart3,
    exact: false,
  },
];

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { clear } = useInternetIdentity();
  const currentPath = router.state.location.pathname;

  const handleLogout = () => {
    clear();
    router.navigate({ to: "/" });
  };

  const isActive = (to: string, exact: boolean) =>
    exact ? currentPath === to : currentPath.startsWith(to);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/assets/generated/firebattle-logo-transparent.dim_200x200.png"
              alt="FireBattle Arena"
              className="w-8 h-8 object-contain"
            />
            <div>
              <div className="font-display font-black text-sm text-foreground leading-none">
                <span className="text-fire">Fire</span>Battle
              </div>
              <div className="text-xs text-muted-foreground">Admin Panel</div>
            </div>
          </Link>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2 py-2 mb-1">
          Management
        </div>
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-fire/20 text-fire border border-fire/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground text-sm"
        >
          <Link to="/">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to App
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-sm"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsAdmin();
  const router = useRouter();

  if (isInitializing || isLoading) return <PageLoadingSkeleton />;

  if (!identity) {
    router.navigate({ to: "/login" });
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Flame className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-4">
            You don't have admin permissions.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-dvh bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-56 xl:w-64 border-r border-sidebar-border bg-sidebar flex-col shrink-0 sticky top-0 h-dvh overflow-y-auto">
          <AdminSidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border lg:hidden overflow-y-auto"
              >
                <AdminSidebar onClose={() => setMobileSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-fire" />
              <span className="font-display font-bold text-sm text-foreground">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
