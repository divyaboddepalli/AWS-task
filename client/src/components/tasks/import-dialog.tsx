import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/tasks";
import { useToast } from "@/hooks/use-toast";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [emailContent, setEmailContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const textMutation = useMutation({
    mutationFn: (task: { title: string; description: string; priority: "low" | "medium" | "high" }) =>
      tasksApi.createTask({ ...task, category: "email" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast.success("Task Imported", {
        description: "A new task has been created from the email.",
      });
      onClose();
      setEmailContent("");
    },
    onError: (error: any) => {
      toast.error("Import Failed", {
        description: error.message || "Could not create a task from the email.",
      });
    },
  });

  const fileMutation = useMutation({
    mutationFn: tasksApi.importTaskFromFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast.success("Task Imported", {
        description: "A new task has been created from the uploaded file.",
      });
      onClose();
      setFile(null);
    },
    onError: (error: any) => {
      toast.error("Import Failed", {
        description: error.message || "Could not create a task from the file.",
      });
    },
  });

  const handleImport = () => {
    if (file) {
      fileMutation.mutate(file);
    } else if (emailContent) {
      const subjectMatch = emailContent.match(/Subject: (.*)/);
      const title = subjectMatch ? subjectMatch[1].trim() : "New Task from Email";

      const bodyMatch = emailContent.split("\n\n");
      const description = bodyMatch.length > 1 ? bodyMatch.slice(1).join("\n\n").trim() : "";

      let priority: "low" | "medium" | "high" = "medium";
      if (emailContent.toLowerCase().includes("urgent") || emailContent.toLowerCase().includes("!")) {
        priority = "high";
      } else if (emailContent.toLowerCase().includes("low priority")) {
        priority = "low";
      }

      textMutation.mutate({ title, description, priority });
    }
  };

  const isLoading = textMutation.isPending || fileMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Task</DialogTitle>
          <DialogDescription>
            Paste email content below, or upload a PDF/DOCX file to import a task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Paste email content here..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            rows={10}
            disabled={!!file}
          />
          <div className="text-center text-muted-foreground">OR</div>
          <div>
            <Label htmlFor="file-upload">Upload a file</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              accept=".pdf,.docx"
              disabled={!!emailContent}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={(!emailContent && !file) || isLoading}>
            {isLoading ? "Importing..." : "Import Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}