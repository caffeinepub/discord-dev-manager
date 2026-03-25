import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckSquare,
  LayoutDashboard,
  Megaphone,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navSections = [
  {
    label: "Overview",
    items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Discord",
    items: [
      { to: "/discord/members", icon: Users, label: "Members" },
      { to: "/discord/announcements", icon: Megaphone, label: "Announcements" },
    ],
  },
  {
    label: "Development",
    items: [
      { to: "/dev/tasks", icon: CheckSquare, label: "Tasks" },
      { to: "/dev/issues", icon: AlertCircle, label: "Issues" },
    ],
  },
  {
    label: "System",
    items: [{ to: "/settings", icon: Settings, label: "Settings" }],
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Zap className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground tracking-tight">
              Nexus HQ
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.to === "/"
                      ? currentPath === "/"
                      : currentPath.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground/50 text-center">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}
