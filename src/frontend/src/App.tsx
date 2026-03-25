import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Announcements from "./pages/Announcements";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/discord/members": "Discord Members",
  "/discord/announcements": "Announcements",
  "/dev/tasks": "Development Tasks",
  "/dev/issues": "Issues",
  "/settings": "Settings",
};

function LayoutWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = window.location.pathname;
  const title = PAGE_TITLES[path] ?? "Nexus HQ";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({ component: LayoutWrapper });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});
const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discord/members",
  component: Members,
});
const announcementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discord/announcements",
  component: Announcements,
});
const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dev/tasks",
  component: Tasks,
});
const issuesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dev/issues",
  component: Issues,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  membersRoute,
  announcementsRoute,
  tasksRoute,
  issuesRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
