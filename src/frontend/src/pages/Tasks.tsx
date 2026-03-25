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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DevTask } from "../backend.d";
import {
  useCreateDevTask,
  useDeleteDevTask,
  useDevTasks,
  useUpdateDevTask,
} from "../hooks/useQueries";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-[var(--nexus-critical)]",
  high: "bg-[var(--nexus-high)]",
  medium: "bg-[var(--nexus-medium)]",
  low: "bg-[var(--nexus-low)]",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  inProgress: "bg-[var(--nexus-blue)]/20 text-[var(--nexus-blue)]",
  done: "bg-[var(--nexus-low)]/20 text-[var(--nexus-low)]",
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"];

const SAMPLE: DevTask[] = [
  {
    id: 1n,
    title: "Implement OAuth2 authentication flow",
    priority: "high",
    status: "inProgress",
    assignee: "Alex Rivera",
    dueDate: "2026-03-28",
    description: "Set up OAuth2 with Discord for member authentication.",
    createdAt: BigInt(Date.now() - 86400000 * 3),
  },
  {
    id: 2n,
    title: "Fix memory leak in background worker",
    priority: "critical",
    status: "todo",
    assignee: "Jamie Chen",
    dueDate: "2026-03-25",
    description: "Worker process consuming 8GB+ RAM after 24h uptime.",
    createdAt: BigInt(Date.now() - 86400000 * 2),
  },
  {
    id: 3n,
    title: "Update REST API documentation",
    priority: "low",
    status: "todo",
    assignee: "Sam Okafor",
    dueDate: "2026-04-01",
    description: "Document all v2 endpoints in Swagger.",
    createdAt: BigInt(Date.now() - 86400000),
  },
  {
    id: 4n,
    title: "Migrate database to PostgreSQL 16",
    priority: "medium",
    status: "inProgress",
    assignee: "Jordan Lee",
    dueDate: "2026-04-05",
    description: "Upgrade DB version and update connection pooling.",
    createdAt: BigInt(Date.now() - 86400000 * 5),
  },
  {
    id: 5n,
    title: "Set up CI/CD pipeline",
    priority: "high",
    status: "done",
    assignee: "Taylor Nguyen",
    dueDate: "2026-03-20",
    description: "GitHub Actions for automated testing and deployment.",
    createdAt: BigInt(Date.now() - 86400000 * 7),
  },
];

const EMPTY: DevTask = {
  id: 0n,
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  assignee: "",
  dueDate: "",
  createdAt: BigInt(Date.now()),
};
const STATUS_FILTERS = ["all", "todo", "inProgress", "done"];
const PRIORITY_FILTERS = ["all", "critical", "high", "medium", "low"];

function priorityVar(p: string) {
  if (p === "critical") return "var(--nexus-critical)";
  if (p === "high") return "var(--nexus-high)";
  if (p === "medium") return "var(--nexus-medium)";
  return "var(--nexus-low)";
}

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DevTask | null>(null);
  const [form, setForm] = useState<DevTask>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const { data, isLoading } = useDevTasks();
  const createMutation = useCreateDevTask();
  const updateMutation = useUpdateDevTask();
  const deleteMutation = useDeleteDevTask();

  const allTasks = data && data.length > 0 ? data : SAMPLE;
  const tasks = allTasks.filter(
    (t) =>
      (statusFilter === "all" || t.status === statusFilter) &&
      (priorityFilter === "all" || t.priority === priorityFilter),
  );

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY, id: BigInt(Date.now()) });
    setModalOpen(true);
  }

  function openEdit(t: DevTask) {
    setEditTarget(t);
    setForm({ ...t });
    setModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync(form);
        toast.success("Task updated");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Task created");
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
      toast.success("Task deleted");
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
      data-ocid="tasks.page"
    >
      <Card className="border-border shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-display">Development Tasks</CardTitle>
            <Button
              size="sm"
              onClick={openCreate}
              data-ocid="tasks.add.primary_button"
            >
              <Plus className="mr-1.5 h-4 w-4" /> New Task
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="flex gap-1">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={statusFilter === f ? "default" : "outline"}
                  onClick={() => setStatusFilter(f)}
                  className="text-xs capitalize"
                  data-ocid={`tasks.status.${f}.tab`}
                >
                  {f === "inProgress" ? "In Progress" : f}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              {PRIORITY_FILTERS.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={priorityFilter === f ? "default" : "ghost"}
                  onClick={() => setPriorityFilter(f)}
                  className="text-xs capitalize"
                  data-ocid={`tasks.priority.${f}.tab`}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" data-ocid="tasks.loading_state">
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-16 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="tasks.empty_state"
            >
              No tasks found.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <div
                  key={t.id.toString()}
                  className="flex items-start gap-4 rounded-xl border border-border bg-secondary/20 p-4 hover:bg-secondary/40 transition-colors"
                  data-ocid={`tasks.item.${i + 1}`}
                >
                  <div
                    className={`mt-1.5 h-full min-h-8 w-1 shrink-0 rounded-full ${PRIORITY_COLORS[t.priority] ?? "bg-muted"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{t.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {t.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                        style={{
                          borderColor: priorityVar(t.priority),
                          color: priorityVar(t.priority),
                        }}
                      >
                        {t.priority}
                      </Badge>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {t.status === "inProgress"
                          ? "In Progress"
                          : t.status === "done"
                            ? "Done"
                            : "Todo"}
                      </span>
                      {t.assignee && (
                        <span className="text-xs text-muted-foreground">
                          → {t.assignee}
                        </span>
                      )}
                      {t.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(t)}
                      data-ocid={`tasks.edit_button.${i + 1}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(t.id)}
                      data-ocid={`tasks.delete_button.${i + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="tasks.dialog"
        >
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Task" : "New Task"}</DialogTitle>
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
                data-ocid="tasks.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="bg-secondary border-border resize-none"
                data-ocid="tasks.description.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="tasks.priority.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="tasks.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Assignee</Label>
                <Input
                  value={form.assignee ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, assignee: e.target.value }))
                  }
                  className="bg-secondary border-border"
                  data-ocid="tasks.assignee.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                  className="bg-secondary border-border"
                  data-ocid="tasks.duedate.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="tasks.cancel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="tasks.save.submit_button"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Save Changes" : "Create Task"}
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
          data-ocid="tasks.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="tasks.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="tasks.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
