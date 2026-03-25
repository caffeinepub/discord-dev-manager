import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { identity } = useInternetIdentity();
  const [search, setSearch] = useState("");

  const principal = identity?.getPrincipal().toString() ?? "";
  const initials = principal ? principal.slice(0, 2).toUpperCase() : "?";

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card/50 px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground"
          data-ocid="header.menu.toggle"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-semibold text-foreground">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-56 pl-9 bg-secondary border-border text-sm"
            data-ocid="header.search_input"
          />
        </div>
        <button
          type="button"
          className="relative text-muted-foreground hover:text-foreground"
          data-ocid="header.notifications.button"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-secondary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
