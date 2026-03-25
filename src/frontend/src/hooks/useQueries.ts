import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Announcement, DevTask, DiscordMember, Issue } from "../backend.d";
import { useActor } from "./useActor";

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecentActivity() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentActivity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDiscordMembers(statusFilter?: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["discordMembers", statusFilter ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      if (statusFilter && statusFilter !== "all") {
        return actor.listDiscordMembersByRole(statusFilter);
      }
      // Fetch all by combining common roles
      const [online, offline, idle] = await Promise.all([
        actor.listDiscordMembersByRole("online"),
        actor.listDiscordMembersByRole("offline"),
        actor.listDiscordMembersByRole("idle"),
      ]);
      const combined = [...online, ...offline, ...idle];
      // Deduplicate by id
      const seen = new Set<string>();
      return combined.filter((m) => {
        const key = m.id.toString();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (!actor) return [];
      // We'll fetch from getStats count, but we don't have a listAll, so we get by id range
      // Workaround: fetch up to 50 by sequential IDs starting from 1
      const results: Announcement[] = [];
      for (let i = 1; i <= 20; i++) {
        try {
          const a = await actor.getAnnouncement(BigInt(i));
          results.push(a);
        } catch {
          break;
        }
      }
      return results;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDevTasks(statusFilter?: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["devTasks", statusFilter ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      if (statusFilter && statusFilter !== "all") {
        return actor.listDevTasksByStatus(statusFilter);
      }
      const [todo, inProgress, done] = await Promise.all([
        actor.listDevTasksByStatus("todo"),
        actor.listDevTasksByStatus("inProgress"),
        actor.listDevTasksByStatus("done"),
      ]);
      return [...todo, ...inProgress, ...done];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIssues(severityFilter?: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["issues", severityFilter ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      if (severityFilter && severityFilter !== "all") {
        return actor.listIssuesBySeverity(severityFilter);
      }
      const [critical, high, medium, low] = await Promise.all([
        actor.listIssuesBySeverity("critical"),
        actor.listIssuesBySeverity("high"),
        actor.listIssuesBySeverity("medium"),
        actor.listIssuesBySeverity("low"),
      ]);
      return [...critical, ...high, ...medium, ...low];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// --- Mutations ---
export function useCreateDiscordMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (member: DiscordMember) => actor!.createDiscordMember(member),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discordMembers"] }),
  });
}
export function useUpdateDiscordMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (member: DiscordMember) => actor!.updateDiscordMember(member),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discordMembers"] }),
  });
}
export function useDeleteDiscordMember() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteDiscordMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discordMembers"] }),
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: Announcement) => actor!.createAnnouncement(a),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}
export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: Announcement) => actor!.updateAnnouncement(a),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}
export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteAnnouncement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useCreateDevTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: DevTask) => actor!.createDevTask(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devTasks"] }),
  });
}
export function useUpdateDevTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: DevTask) => actor!.updateDevTask(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devTasks"] }),
  });
}
export function useDeleteDevTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteDevTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devTasks"] }),
  });
}

export function useCreateIssue() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (issue: Issue) => actor!.createIssue(issue),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["issues"] }),
  });
}
export function useUpdateIssue() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (issue: Issue) => actor!.updateIssue(issue),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["issues"] }),
  });
}
export function useDeleteIssue() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteIssue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["issues"] }),
  });
}
