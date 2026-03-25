import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogIn, LogOut, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function Settings() {
  const { identity, login, clear, isLoggingIn, isLoginSuccess } =
    useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  const principal = identity?.getPrincipal().toString() ?? "";
  const isLoggedIn = isLoginSuccess || !!identity;
  const initials = principal ? principal.slice(0, 2).toUpperCase() : "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl space-y-6"
      data-ocid="settings.page"
    >
      {/* Account */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            Account
          </CardTitle>
          <CardDescription>
            Manage your authentication and identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-accent/40">
              <AvatarFallback className="bg-secondary text-lg font-display">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">Connected</p>
                    {isAdmin && (
                      <Badge className="bg-accent/20 text-accent border-accent/30 text-xs gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {principal}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-foreground">Not connected</p>
                  <p className="text-sm text-muted-foreground">
                    Sign in to manage your data.
                  </p>
                </>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {isLoggedIn ? (
            <Button
              variant="outline"
              onClick={() => clear()}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              data-ocid="settings.logout.button"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="settings.login.button"
            >
              {isLoggingIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">
            About Nexus HQ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span className="text-foreground font-mono">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Platform</span>
            <span className="text-foreground">Internet Computer</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Built with</span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
