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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Announcement } from "../backend.d";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["s1", "s2", "s3"];

const SAMPLE: Announcement[] = [
  {
    id: 1n,
    title: "Server Maintenance Tonight",
    content:
      "We'll be performing scheduled maintenance from 2-4 AM EST. Expect brief downtime during the window. All services will resume automatically.",
    authorName: "Admin",
    isPinned: true,
    createdAt: BigInt(Date.now() - 3600000),
  },
  {
    id: 2n,
    title: "New Feature: Task Tracking Live",
    content:
      "Our new development task tracking module is now live! You can assign tasks, set priorities, and track progress in real-time.",
    authorName: "Dev Team",
    isPinned: false,
    createdAt: BigInt(Date.now() - 7200000),
  },
  {
    id: 3n,
    title: "Community Guidelines Update",
    content:
      "We've updated our community guidelines to better reflect our values. Please take a moment to review the changes.",
    authorName: "Moderators",
    isPinned: true,
    createdAt: BigInt(Date.now() - 86400000),
  },
  {
    id: 4n,
    title: "Weekly Dev Standup — Friday 3PM",
    content:
      "Reminder: our weekly development standup is this Friday at 3PM EST in #dev-voice. All contributors welcome!",
    authorName: "Project Lead",
    isPinned: false,
    createdAt: BigInt(Date.now() - 172800000),
  },
];

const EMPTY: Announcement = {
  id: 0n,
  title: "",
  content: "",
  authorName: "",
  isPinned: false,
  createdAt: BigInt(Date.now()),
};

export default function Announcements() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [form, setForm] = useState<Announcement>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const { data, isLoading } = useAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const announcements = data && data.length > 0 ? data : SAMPLE;

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY, id: BigInt(Date.now()) });
    setModalOpen(true);
  }

  function openEdit(a: Announcement) {
    setEditTarget(a);
    setForm({ ...a });
    setModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync(form);
        toast.success("Announcement updated");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Announcement posted");
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
      toast.success("Announcement deleted");
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
      data-ocid="announcements.page"
    >
      <Card className="border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="font-display">Announcements</CardTitle>
          <Button
            size="sm"
            onClick={openCreate}
            data-ocid="announcements.add.primary_button"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Announcement
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" data-ocid="announcements.loading_state">
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-24 w-full" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="announcements.empty_state"
            >
              No announcements yet.
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <div
                  key={ann.id.toString()}
                  className="rounded-xl border border-border bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors"
                  data-ocid={`announcements.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {ann.isPinned && (
                          <Pin className="h-3.5 w-3.5 text-accent shrink-0" />
                        )}
                        <h3 className="font-semibold text-foreground truncate">
                          {ann.title}
                        </h3>
                        {ann.isPinned && (
                          <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {ann.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                        <span>by {ann.authorName}</span>
                        <span>·</span>
                        <span>
                          {new Date(
                            Number(ann.createdAt) / 1_000_000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(ann)}
                        data-ocid={`announcements.edit_button.${i + 1}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(ann.id)}
                        data-ocid={`announcements.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="bg-card border-border"
          data-ocid="announcements.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="bg-secondary border-border"
                data-ocid="announcements.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                rows={4}
                className="bg-secondary border-border resize-none"
                data-ocid="announcements.content.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Author Name</Label>
              <Input
                value={form.authorName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, authorName: e.target.value }))
                }
                className="bg-secondary border-border"
                data-ocid="announcements.author.input"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isPinned}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isPinned: v }))}
                data-ocid="announcements.pinned.switch"
              />
              <Label>Pin announcement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="announcements.cancel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="announcements.save.submit_button"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Save Changes" : "Post"}
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
          data-ocid="announcements.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="announcements.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="announcements.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
