import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Bug, CheckCircle2, Users, Wifi } from "lucide-react";
import { motion } from "motion/react";
import {
  useAnnouncements,
  useDevTasks,
  useDiscordMembers,
  useRecentActivity,
  useStats,
} from "../hooks/useQueries";

const priorityColor: Record<string, string> = {
  critical: "bg-[var(--nexus-critical)]",
  high: "bg-[var(--nexus-high)]",
  medium: "bg-[var(--nexus-medium)]",
  low: "bg-[var(--nexus-low)]",
};

const statusBadgeVariant: Record<string, string> = {
  online:
    "bg-[var(--nexus-low)]/20 text-[var(--nexus-low)] border-[var(--nexus-low)]/30",
  offline: "bg-muted text-muted-foreground border-border",
  idle: "bg-[var(--nexus-medium)]/20 text-[var(--nexus-medium)] border-[var(--nexus-medium)]/30",
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="border-border shadow-card" data-ocid="dashboard.stat.card">
      <CardContent className="flex items-center gap-4 pt-6">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-display text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4"];

const SAMPLE_ACTIVITY = [
  {
    id: 1n,
    actionType: "member_join",
    entityType: "member",
    entityId: 1n,
    details: "Alex Rivera joined #general",
    timestamp: BigInt(Date.now() - 300000),
  },
  {
    id: 2n,
    actionType: "task_created",
    entityType: "task",
    entityId: 2n,
    details: "New task: Fix memory leak",
    timestamp: BigInt(Date.now() - 900000),
  },
  {
    id: 3n,
    actionType: "announcement",
    entityType: "announcement",
    entityId: 1n,
    details: "Maintenance notice posted",
    timestamp: BigInt(Date.now() - 1800000),
  },
  {
    id: 4n,
    actionType: "issue_closed",
    entityType: "issue",
    entityId: 5n,
    details: "Issue #5 resolved",
    timestamp: BigInt(Date.now() - 3600000),
  },
];

const SAMPLE_MEMBERS = [
  {
    id: 1n,
    name: "Alex Rivera",
    discordHandle: "alex#1234",
    role: "Admin",
    status: "online",
    joinedAt: 0n,
  },
  {
    id: 2n,
    name: "Jamie Chen",
    discordHandle: "jamie#5678",
    role: "Moderator",
    status: "online",
    joinedAt: 0n,
  },
  {
    id: 3n,
    name: "Sam Okafor",
    discordHandle: "sam#9012",
    role: "Member",
    status: "idle",
    joinedAt: 0n,
  },
  {
    id: 4n,
    name: "Taylor Nguyen",
    discordHandle: "tswift#3456",
    role: "Member",
    status: "offline",
    joinedAt: 0n,
  },
];

const SAMPLE_TASKS = [
  {
    id: 1n,
    title: "Implement OAuth2 flow",
    priority: "high",
    status: "inProgress",
    dueDate: "2026-03-28",
    description: "",
    createdAt: 0n,
  },
  {
    id: 2n,
    title: "Fix memory leak in worker",
    priority: "critical",
    status: "todo",
    dueDate: "2026-03-25",
    description: "",
    createdAt: 0n,
  },
  {
    id: 3n,
    title: "Update API documentation",
    priority: "low",
    status: "todo",
    dueDate: "2026-04-01",
    description: "",
    createdAt: 0n,
  },
];

const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 1n,
    title: "Server Maintenance Tonight",
    content:
      "We'll be performing scheduled maintenance from 2-4 AM EST. Expect brief downtime.",
    authorName: "Admin",
    isPinned: true,
    createdAt: 0n,
  },
  {
    id: 2n,
    title: "New Feature: Task Tracking",
    content:
      "We've launched our new development task tracking module. Check it out!",
    authorName: "Dev Team",
    isPinned: false,
    createdAt: 0n,
  },
];

function priorityVar(p: string) {
  if (p === "critical") return "var(--nexus-critical)";
  if (p === "high") return "var(--nexus-high)";
  if (p === "medium") return "var(--nexus-medium)";
  return "var(--nexus-low)";
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: activity } = useRecentActivity();
  const { data: members } = useDiscordMembers();
  const { data: tasks } = useDevTasks();
  const { data: announcements } = useAnnouncements();

  const onlineMembers =
    members?.filter((m) => m.status === "online").slice(0, 5) ?? [];
  const openTasks = tasks?.filter((t) => t.status !== "done").slice(0, 5) ?? [];
  const pinnedAnnouncements = announcements?.slice(0, 4) ?? [];

  const displayActivity =
    activity && activity.length > 0 ? activity.slice(0, 6) : SAMPLE_ACTIVITY;
  const displayMembers =
    onlineMembers.length > 0 ? onlineMembers : SAMPLE_MEMBERS;
  const displayTasks = openTasks.length > 0 ? openTasks : SAMPLE_TASKS;
  const displayAnnouncements =
    pinnedAnnouncements.length > 0 ? pinnedAnnouncements : SAMPLE_ANNOUNCEMENTS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
      data-ocid="dashboard.page"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          SKELETON_KEYS.map((k) => (
            <Card key={k} className="border-border">
              <CardContent className="pt-6">
                <Skeleton className="h-14 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total Members"
              value={Number(stats?.totalMembers ?? 0)}
              color="bg-[var(--nexus-blue)]"
            />
            <StatCard
              icon={Wifi}
              label="Online Now"
              value={Number(stats?.onlineMembers ?? 0)}
              color="bg-[var(--nexus-teal)]"
            />
            <StatCard
              icon={CheckCircle2}
              label="Tasks Completed"
              value={Number(stats?.completedTasks ?? 0)}
              color="bg-[var(--nexus-low)]"
            />
            <StatCard
              icon={Bug}
              label="Open Issues"
              value={Number(stats?.openIssues ?? 0)}
              color="bg-[var(--nexus-critical)]"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="border-border shadow-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Activity className="h-4 w-4 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayActivity.map((act) => (
              <div key={act.id.toString()} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {act.details}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      Number(act.timestamp) / 1_000_000,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Online Members */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Users className="h-4 w-4 text-accent" />
              Members Online
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayMembers.map((m, i) => (
              <div
                key={m.id.toString()}
                className="flex items-center gap-3"
                data-ocid={`dashboard.member.item.${i + 1}`}
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-secondary text-xs">
                    {m.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.discordHandle}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeVariant[m.status] ?? statusBadgeVariant.offline}`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Open Tasks */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Open Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayTasks.map((t, i) => (
              <div
                key={t.id.toString()}
                className="flex items-start gap-3"
                data-ocid={`dashboard.task.item.${i + 1}`}
              >
                <div
                  className={`mt-1.5 h-3 w-1 shrink-0 rounded-full ${priorityColor[t.priority] ?? "bg-muted"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {t.title}
                  </p>
                  {t.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due {t.dueDate}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 text-xs capitalize"
                  style={{
                    borderColor: priorityVar(t.priority),
                    color: priorityVar(t.priority),
                  }}
                >
                  {t.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Community Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {displayAnnouncements.map((ann, i) => (
              <div
                key={ann.id.toString()}
                className="rounded-lg border border-border bg-secondary/30 p-4"
                data-ocid={`dashboard.announcement.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">
                    {ann.title}
                  </p>
                  {ann.isPinned && (
                    <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {ann.content}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  by {ann.authorName}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
