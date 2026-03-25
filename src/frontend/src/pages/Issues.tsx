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
import type { Issue } from "../backend.d";
import {
  useCreateIssue,
  useDeleteIssue,
  useIssues,
  useUpdateIssue,
} from "../hooks/useQueries";

const SEVERITY_COLORS: Record<string, string> = {
  critical:
    "bg-[var(--nexus-critical)]/20 text-[var(--nexus-critical)] border-[var(--nexus-critical)]/30",
  high: "bg-[var(--nexus-high)]/20 text-[var(--nexus-high)] border-[var(--nexus-high)]/30",
  medium:
    "bg-[var(--nexus-medium)]/20 text-[var(--nexus-medium)] border-[var(--nexus-medium)]/30",
  low: "bg-[var(--nexus-low)]/20 text-[var(--nexus-low)] border-[var(--nexus-low)]/30",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-[var(--nexus-blue)]/20 text-[var(--nexus-blue)]",
  inProgress: "bg-[var(--nexus-medium)]/20 text-[var(--nexus-medium)]",
  resolved: "bg-[var(--nexus-low)]/20 text-[var(--nexus-low)]",
  closed: "bg-muted text-muted-foreground",
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"];

const SAMPLE: Issue[] = [
  {
    id: 1n,
    title: "Login page crashes on mobile Safari",
    description:
      "Users on iOS 16+ with Safari cannot complete login flow. App crashes after OAuth redirect.",
    severity: "critical",
    status: "open",
    createdAt: BigInt(Date.now() - 86400000 * 2),
  },
  {
    id: 2n,
    title: "Slow query performance on member search",
    description:
      "Search queries taking 8-12 seconds on tables with 50k+ rows. Needs index optimization.",
    severity: "high",
    status: "inProgress",
    createdAt: BigInt(Date.now() - 86400000 * 4),
  },
  {
    id: 3n,
    title: "Announcement notifications not sending",
    description:
      "Push notifications for new announcements are not being delivered to iOS devices.",
    severity: "medium",
    status: "open",
    createdAt: BigInt(Date.now() - 86400000),
  },
  {
    id: 4n,
    title: "Typo in onboarding welcome email",
    description:
      "The word 'welcome' is misspelled as 'wellcome' in the third paragraph.",
    severity: "low",
    status: "resolved",
    createdAt: BigInt(Date.now() - 86400000 * 7),
  },
  {
    id: 5n,
    title: "Webhook timeout on high traffic",
    description:
      "Discord webhook calls timeout after 5s during peak usage (1000+ concurrent users).",
    severity: "high",
    status: "open",
    createdAt: BigInt(Date.now() - 86400000 * 3),
  },
];

const EMPTY: Issue = {
  id: 0n,
  title: "",
  description: "",
  severity: "medium",
  status: "open",
  createdAt: BigInt(Date.now()),
};
const SEVERITY_FILTERS = ["all", "critical", "high", "medium", "low"];

export default function Issues() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Issue | null>(null);
  const [form, setForm] = useState<Issue>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const { data, isLoading } = useIssues();
  const createMutation = useCreateIssue();
  const updateMutation = useUpdateIssue();
  const deleteMutation = useDeleteIssue();

  const allIssues = data && data.length > 0 ? data : SAMPLE;
  const issues = allIssues.filter(
    (iss) => severityFilter === "all" || iss.severity === severityFilter,
  );

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY, id: BigInt(Date.now()) });
    setModalOpen(true);
  }

  function openEdit(iss: Issue) {
    setEditTarget(iss);
    setForm({ ...iss });
    setModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync(form);
        toast.success("Issue updated");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Issue created");
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
      toast.success("Issue deleted");
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
      data-ocid="issues.page"
    >
      <Card className="border-border shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-display">Issues Tracker</CardTitle>
            <Button
              size="sm"
              onClick={openCreate}
              data-ocid="issues.add.primary_button"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Report Issue
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 pt-2">
            {SEVERITY_FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={severityFilter === f ? "default" : "outline"}
                onClick={() => setSeverityFilter(f)}
                className="text-xs capitalize"
                data-ocid={`issues.severity.${f}.tab`}
              >
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" data-ocid="issues.loading_state">
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-20 w-full" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="issues.empty_state"
            >
              No issues found.
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((iss, i) => (
                <div
                  key={iss.id.toString()}
                  className="flex items-start gap-4 rounded-xl border border-border bg-secondary/20 p-4 hover:bg-secondary/40 transition-colors"
                  data-ocid={`issues.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${SEVERITY_COLORS[iss.severity] ?? ""}`}
                      >
                        {iss.severity}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[iss.status] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {iss.status === "inProgress"
                          ? "In Progress"
                          : iss.status}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{iss.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {iss.description}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(
                        Number(iss.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(iss)}
                      data-ocid={`issues.edit_button.${i + 1}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(iss.id)}
                      data-ocid={`issues.delete_button.${i + 1}`}
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
          data-ocid="issues.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Issue" : "Report Issue"}
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
                data-ocid="issues.title.input"
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
                data-ocid="issues.description.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Severity</Label>
                <Select
                  value={form.severity}
                  onValueChange={(v) => setForm((p) => ({ ...p, severity: v }))}
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="issues.severity.select"
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
                    data-ocid="issues.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="issues.cancel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="issues.save.submit_button"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Save Changes" : "Report Issue"}
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
          data-ocid="issues.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="issues.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="issues.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
