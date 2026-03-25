import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type DiscordMember = {
    id : Nat;
    name : Text;
    discordHandle : Text;
    role : Text;
    status : Text;
    joinedAt : Int;
  };

  type Announcement = {
    id : Nat;
    title : Text;
    content : Text;
    authorName : Text;
    createdAt : Int;
    isPinned : Bool;
  };

  type DevTask = {
    id : Nat;
    title : Text;
    description : Text;
    priority : Text;
    status : Text;
    dueDate : ?Text;
    assignee : ?Text;
    createdAt : Int;
  };

  type Issue = {
    id : Nat;
    title : Text;
    description : Text;
    severity : Text;
    status : Text;
    createdAt : Int;
  };

  type Activity = {
    id : Nat;
    entityId : Nat;
    entityType : Text;
    actionType : Text;
    timestamp : Int;
    details : Text;
  };

  module Activity {
    public func compare(activity1 : Activity, activity2 : Activity) : Order.Order {
      Nat.compare(activity2.id, activity1.id);
    };
  };

  public type Stats = {
    totalMembers : Nat;
    onlineMembers : Nat;
    totalTasks : Nat;
    completedTasks : Nat;
    openIssues : Nat;
    totalAnnouncements : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let discordMembers = Map.empty<Nat, DiscordMember>();
  let announcements = Map.empty<Nat, Announcement>();
  let devTasks = Map.empty<Nat, DevTask>();
  let issues = Map.empty<Nat, Issue>();
  let activities = Map.empty<Nat, Activity>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var discordMemberId = 0;
  var announcementId = 0;
  var devTaskId = 0;
  var issueId = 0;
  var activityId = 0;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // DiscordMember CRUD
  public shared ({ caller }) func createDiscordMember(member : DiscordMember) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = discordMemberId;
    let newMember = {
      member with
      id;
      joinedAt = Time.now();
    };
    discordMembers.add(id, newMember);

    addActivity(id, "DiscordMember", #create, "Created member: " # member.name);

    discordMemberId += 1;
    id;
  };

  public shared ({ caller }) func updateDiscordMember(member : DiscordMember) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not discordMembers.containsKey(member.id)) {
      Runtime.trap("DiscordMember does not exist");
    };
    discordMembers.add(member.id, member);

    addActivity(member.id, "DiscordMember", #update, "Updated member: " # member.name);
  };

  public shared ({ caller }) func deleteDiscordMember(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not discordMembers.containsKey(id)) {
      Runtime.trap("DiscordMember does not exist");
    };
    discordMembers.remove(id);

    addActivity(id, "DiscordMember", #delete, "Deleted member with id: " # id.toText());
  };

  public query ({ caller }) func getDiscordMember(id : Nat) : async DiscordMember {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (discordMembers.get(id)) {
      case (null) { Runtime.trap("DiscordMember does not exist") };
      case (?member) { member };
    };
  };

  // Announcement CRUD
  public shared ({ caller }) func createAnnouncement(announcement : Announcement) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = announcementId;
    let newAnnouncement = {
      announcement with
      id;
      createdAt = Time.now();
      isPinned = false;
    };
    announcements.add(id, newAnnouncement);

    addActivity(id, "Announcement", #create, "Created announcement: " # announcement.title);

    announcementId += 1;
    id;
  };

  public shared ({ caller }) func updateAnnouncement(announcement : Announcement) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not announcements.containsKey(announcement.id)) {
      Runtime.trap("Announcement does not exist");
    };
    announcements.add(announcement.id, announcement);

    addActivity(announcement.id, "Announcement", #update, "Updated announcement: " # announcement.title);
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not announcements.containsKey(id)) {
      Runtime.trap("Announcement does not exist");
    };
    announcements.remove(id);

    addActivity(id, "Announcement", #delete, "Deleted announcement with id: " # id.toText());
  };

  public query ({ caller }) func getAnnouncement(id : Nat) : async Announcement {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement does not exist") };
      case (?announcement) { announcement };
    };
  };

  // DevTask CRUD
  public shared ({ caller }) func createDevTask(task : DevTask) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = devTaskId;
    let newTask = {
      task with
      id;
      createdAt = Time.now();
    };
    devTasks.add(id, newTask);

    addActivity(id, "DevTask", #create, "Created task: " # task.title);

    devTaskId += 1;
    id;
  };

  public shared ({ caller }) func updateDevTask(task : DevTask) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not devTasks.containsKey(task.id)) {
      Runtime.trap("DevTask does not exist");
    };
    devTasks.add(task.id, task);

    addActivity(task.id, "DevTask", #update, "Updated task: " # task.title);
  };

  public shared ({ caller }) func deleteDevTask(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not devTasks.containsKey(id)) {
      Runtime.trap("DevTask does not exist");
    };
    devTasks.remove(id);

    addActivity(id, "DevTask", #delete, "Deleted task with id: " # id.toText());
  };

  public query ({ caller }) func getDevTask(id : Nat) : async DevTask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (devTasks.get(id)) {
      case (null) { Runtime.trap("DevTask does not exist") };
      case (?task) { task };
    };
  };

  // Issue CRUD
  public shared ({ caller }) func createIssue(issue : Issue) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = issueId;
    let newIssue = {
      issue with
      id;
      createdAt = Time.now();
    };
    issues.add(id, newIssue);

    addActivity(id, "Issue", #create, "Created issue: " # issue.title);

    issueId += 1;
    id;
  };

  public shared ({ caller }) func updateIssue(issue : Issue) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not issues.containsKey(issue.id)) {
      Runtime.trap("Issue does not exist");
    };
    issues.add(issue.id, issue);

    addActivity(issue.id, "Issue", #update, "Updated issue: " # issue.title);
  };

  public shared ({ caller }) func deleteIssue(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not issues.containsKey(id)) {
      Runtime.trap("Issue does not exist");
    };
    issues.remove(id);

    addActivity(id, "Issue", #delete, "Deleted issue with id: " # id.toText());
  };

  public query ({ caller }) func getIssue(id : Nat) : async Issue {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (issues.get(id)) {
      case (null) { Runtime.trap("Issue does not exist") };
      case (?issue) { issue };
    };
  };

  // Get Stats
  public query ({ caller }) func getStats() : async Stats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let totalMembers = discordMembers.size();
    let onlineMembers = discordMembers.values().toArray().filter(func(m : DiscordMember) : Bool { m.status == "online" }).size();
    let totalTasks = devTasks.size();
    let completedTasks = devTasks.values().toArray().filter(func(t : DevTask) : Bool { t.status == "done" }).size();
    let openIssues = issues.values().toArray().filter(func(i : Issue) : Bool { i.status == "open" }).size();
    let totalAnnouncements = announcements.size();

    {
      totalMembers;
      onlineMembers;
      totalTasks;
      completedTasks;
      openIssues;
      totalAnnouncements;
    };
  };

  // Get Recent Activity
  public query ({ caller }) func getRecentActivity() : async [Activity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    activities.values().toArray().sort().sliceToArray(0, Nat.min(10, activities.size()));
  };

  // Helper functions
  type ActivityType = { #create; #update; #delete };

  func addActivity(entityId : Nat, entityType : Text, actionType : ActivityType, details : Text) {
    let id = activityId;
    let actionText = switch (actionType) {
      case (#create) { "create" };
      case (#update) { "update" };
      case (#delete) { "delete" };
    };
    let activity = {
      id;
      entityId;
      entityType;
      actionType = actionText;
      timestamp = Time.now();
      details;
    };
    activities.add(id, activity);
    activityId += 1;
  };

  // Query Functions with Filtering
  public query ({ caller }) func listDiscordMembersByRole(role : Text) : async [DiscordMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    discordMembers.values().toArray().filter(func(m : DiscordMember) : Bool { m.role == role });
  };

  public query ({ caller }) func listDevTasksByStatus(status : Text) : async [DevTask] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    devTasks.values().toArray().filter(func(t : DevTask) : Bool { t.status == status });
  };

  public query ({ caller }) func listIssuesBySeverity(severity : Text) : async [Issue] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    issues.values().toArray().filter(func(i : Issue) : Bool { i.severity == severity });
  };
};
