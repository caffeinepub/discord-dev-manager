import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DiscordMember } from "../backend.d";
import {
  useCreateDiscordMember,
  useDeleteDiscordMember,
  useDiscordMembers,
  useUpdateDiscordMember,
} from "../hooks/useQueries";

const STATUS_FILTERS = ["all", "online", "offline", "idle"];
const SKELETON_KEYS = ["s1", "s2", "s3", "s4"];

const statusStyle: Record<string, string> = {
  online:
    "bg-[var(--nexus-low)]/20 text-[var(--nexus-low)] border-[var(--nexus-low)]/30",
  offline: "bg-muted text-muted-foreground border-border",
  idle: "bg-[var(--nexus-medium)]/20 text-[var(--nexus-medium)] border-[var(--nexus-medium)]/30",
};

const SAMPLE: DiscordMember[] = [
  {
    id: 1n,
    name: "Alex Rivera",
    discordHandle: "alex#1234",
    role: "Admin",
    status: "online",
    joinedAt: BigInt(Date.now() - 86400000 * 30),
  },
  {
    id: 2n,
    name: "Jamie Chen",
    discordHandle: "jamie#5678",
    role: "Moderator",
    status: "online",
    joinedAt: BigInt(Date.now() - 86400000 * 20),
  },
  {
    id: 3n,
    name: "Sam Okafor",
    discordHandle: "sam#9012",
    role: "Member",
    status: "idle",
    joinedAt: BigInt(Date.now() - 86400000 * 15),
  },
  {
    id: 4n,
    name: "Taylor Nguyen",
    discordHandle: "taylor#3456",
    role: "Member",
    status: "offline",
    joinedAt: BigInt(Date.now() - 86400000 * 10),
  },
  {
    id: 5n,
    name: "Jordan Lee",
    discordHandle: "jordan#7890",
    role: "Contributor",
    status: "online",
    joinedAt: BigInt(Date.now() - 86400000 * 5),
  },
];

const EMPTY: DiscordMember = {
  id: 0n,
  name: "",
  discordHandle: "",
  role: "Member",
  status: "offline",
  joinedAt: BigInt(Date.now()),
};

export default function Members() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DiscordMember | null>(null);
  const [form, setForm] = useState<DiscordMember>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const { data, isLoading } = useDiscordMembers();
  const createMutation = useCreateDiscordMember();
  const updateMutation = useUpdateDiscordMember();
  const deleteMutation = useDeleteDiscordMember();

  const members = (data && data.length > 0 ? data : SAMPLE).filter(
    (m) => statusFilter === "all" || m.status === statusFilter,
  );

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY, id: BigInt(Date.now()) });
    setModalOpen(true);
  }

  function openEdit(m: DiscordMember) {
    setEditTarget(m);
    setForm({ ...m });
    setModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync(form);
        toast.success("Member updated");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Member added");
      }
      setModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  }

  async function handleDelete() {
    if (deleteTarget === null) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast.success("Member removed");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      data-ocid="members.page"
    >
      <Card className="border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="font-display">Discord Members</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={statusFilter === f ? "default" : "outline"}
                  onClick={() => setStatusFilter(f)}
                  className="capitalize text-xs"
                  data-ocid={`members.${f}.tab`}
                >
                  {f}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              onClick={openCreate}
              data-ocid="members.add.primary_button"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" data-ocid="members.loading_state">
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-14 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="members.empty_state"
            >
              No members found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-ocid="members.table">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Member</th>
                    <th className="pb-3 pr-4 font-medium">Handle</th>
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Joined</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m, i) => (
                    <tr
                      key={m.id.toString()}
                      className="text-sm"
                      data-ocid={`members.item.${i + 1}`}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-secondary text-xs">
                              {m.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {m.discordHandle}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs">
                          {m.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusStyle[m.status] ?? statusStyle.offline}`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(
                          Number(m.joinedAt) / 1_000_000,
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openEdit(m)}
                            data-ocid={`members.edit_button.${i + 1}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(m.id)}
                            data-ocid={`members.delete_button.${i + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="bg-card border-border"
          data-ocid="members.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Member" : "Add Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Full name"
                className="bg-secondary border-border"
                data-ocid="members.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discord Handle</Label>
              <Input
                value={form.discordHandle}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discordHandle: e.target.value }))
                }
                placeholder="username#0000"
                className="bg-secondary border-border"
                data-ocid="members.handle.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                placeholder="e.g. Admin, Moderator"
                className="bg-secondary border-border"
                data-ocid="members.role.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger
                  className="bg-secondary border-border"
                  data-ocid="members.status.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="members.cancel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="members.save.submit_button"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="members.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="members.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="members.delete.confirm_button"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
