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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/tasks";
import { useToast } from "@/hooks/use-toast";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [emailContent, setEmailContent] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (task: { title: string; description: string; priority: "low" | "medium" | "high" }) =>
      tasksApi.createTask({ ...task, category: "email" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task Imported",
        description: "A new task has been created from the email.",
      });
      onClose();
      setEmailContent("");
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Could not create a task from the email.",
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
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

    mutation.mutate({ title, description, priority });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Task from Email</DialogTitle>
          <DialogDescription>
            Paste the raw content of an email below to import it as a task.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Paste email content here..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          rows={15}
        />
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!emailContent || mutation.isPending}>
            {mutation.isPending ? "Importing..." : "Import Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}