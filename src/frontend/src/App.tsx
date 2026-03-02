import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import { AdminLayout } from "./components/shared/AdminLayout";
// Layouts
import { Layout } from "./components/shared/Layout";

// Pages
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { TournamentDetailPage } from "./pages/TournamentDetailPage";
import { TournamentsPage } from "./pages/TournamentsPage";

// Admin pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminResultsPage } from "./pages/admin/AdminResultsPage";
import { AdminRevenuePage } from "./pages/admin/AdminRevenuePage";
import { AdminRoomPage } from "./pages/admin/AdminRoomPage";
import { AdminTournamentsPage } from "./pages/admin/AdminTournamentsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { TournamentFormPage } from "./pages/admin/TournamentFormPage";

// ─── Root Route ───────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" theme="dark" />
    </>
  ),
});

// ─── Main Layout Route ────────────────────────────────────────────────────────

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main",
  component: Layout,
});

// ─── User Routes ──────────────────────────────────────────────────────────────

const homeRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/",
  component: HomePage,
});

const tournamentsRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/tournaments",
  component: TournamentsPage,
});

const tournamentDetailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/tournaments/$id",
  component: TournamentDetailPage,
});

const loginRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/register",
  component: RegisterPage,
});

const profileRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/notifications",
  component: NotificationsPage,
});

// ─── Admin Layout Route ───────────────────────────────────────────────────────

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin",
  path: "/admin",
  component: AdminLayout,
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminDashboardPage,
});

const adminTournamentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/tournaments",
  component: AdminTournamentsPage,
});

const adminCreateTournamentRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/tournaments/new",
  component: () => <TournamentFormPage mode="create" />,
});

const adminEditTournamentRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/tournaments/$id/edit",
  component: () => <TournamentFormPage mode="edit" />,
});

const adminRoomRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/tournaments/$id/room",
  component: AdminRoomPage,
});

const adminResultsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/tournaments/$id/results",
  component: AdminResultsPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users",
  component: AdminUsersPage,
});

const adminRevenueRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/revenue",
  component: AdminRevenuePage,
});

// ─── Router ───────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
    homeRoute,
    tournamentsRoute,
    tournamentDetailRoute,
    loginRoute,
    registerRoute,
    profileRoute,
    notificationsRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminTournamentsRoute,
    adminCreateTournamentRoute,
    adminEditTournamentRoute,
    adminRoomRoute,
    adminResultsRoute,
    adminUsersRoute,
    adminRevenueRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
