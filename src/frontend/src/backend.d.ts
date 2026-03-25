import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Activity {
    id: bigint;
    actionType: string;
    entityId: bigint;
    timestamp: bigint;
    details: string;
    entityType: string;
}
export interface Stats {
    totalTasks: bigint;
    totalAnnouncements: bigint;
    completedTasks: bigint;
    totalMembers: bigint;
    openIssues: bigint;
    onlineMembers: bigint;
}
export interface Issue {
    id: bigint;
    status: string;
    title: string;
    createdAt: bigint;
    description: string;
    severity: string;
}
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    createdAt: bigint;
    authorName: string;
    isPinned: boolean;
}
export interface DiscordMember {
    id: bigint;
    status: string;
    name: string;
    joinedAt: bigint;
    role: string;
    discordHandle: string;
}
export interface DevTask {
    id: bigint;
    status: string;
    assignee?: string;
    title: string;
    createdAt: bigint;
    dueDate?: string;
    description: string;
    priority: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAnnouncement(announcement: Announcement): Promise<bigint>;
    createDevTask(task: DevTask): Promise<bigint>;
    createDiscordMember(member: DiscordMember): Promise<bigint>;
    createIssue(issue: Issue): Promise<bigint>;
    deleteAnnouncement(id: bigint): Promise<void>;
    deleteDevTask(id: bigint): Promise<void>;
    deleteDiscordMember(id: bigint): Promise<void>;
    deleteIssue(id: bigint): Promise<void>;
    getAnnouncement(id: bigint): Promise<Announcement>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDevTask(id: bigint): Promise<DevTask>;
    getDiscordMember(id: bigint): Promise<DiscordMember>;
    getIssue(id: bigint): Promise<Issue>;
    getRecentActivity(): Promise<Array<Activity>>;
    getStats(): Promise<Stats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listDevTasksByStatus(status: string): Promise<Array<DevTask>>;
    listDiscordMembersByRole(role: string): Promise<Array<DiscordMember>>;
    listIssuesBySeverity(severity: string): Promise<Array<Issue>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAnnouncement(announcement: Announcement): Promise<void>;
    updateDevTask(task: DevTask): Promise<void>;
    updateDiscordMember(member: DiscordMember): Promise<void>;
    updateIssue(issue: Issue): Promise<void>;
}
