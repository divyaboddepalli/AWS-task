import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { tasksApi } from "@/lib/tasks";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityColors = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

const categoryLabels = {
  "brand-collaboration": "Brand Collaboration",
  "content-request": "Content Request",
  "crisis-management": "Crisis Management",
  "general-inquiry": "General Inquiry",
};

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/categories"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.message || "Failed to delete task",
      });
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      tasksApi.updateTask(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.message || "Failed to update task",
      });
    },
  });

  const handleExportPdf = () => {
    window.open(`/api/tasks/${task.id}/export-pdf`, "_blank");
  };

  const handleExportDocx = () => {
    window.open(`/api/tasks/${task.id}/export-docx`, "_blank");
  };

  const formatTimeAgo = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  return (
    <div className="p-4 hover:bg-accent/50 transition-colors" data-testid={`card-task-${task.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              {categoryLabels[task.category as keyof typeof categoryLabels]}
            </span>
            {task.completed && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Completed
              </span>
            )}
          </div>
          <h4 className={`font-medium mb-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>
              <i className="fas fa-envelope mr-1"></i>
              <span data-testid={`text-email-${task.id}`}>{task.emailFrom}</span>
            </span>
            <span>
              <i className="fas fa-clock mr-1"></i>
              <span data-testid={`text-time-${task.id}`}>{formatTimeAgo(task.createdAt)}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportPdf}
            data-testid={`button-export-pdf-${task.id}`}
          >
            <i className="fas fa-file-pdf"></i>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportDocx}
            data-testid={`button-export-docx-${task.id}`}
          >
            <i className="fas fa-file-word"></i>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleCompleteMutation.mutate({ id: task.id, completed: !task.completed })}
            disabled={toggleCompleteMutation.isPending}
            data-testid={`button-toggle-${task.id}`}
          >
            <i className={`fas ${task.completed ? 'fa-undo' : 'fa-check'}`}></i>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            data-testid={`button-edit-${task.id}`}
          >
            <i className="fas fa-edit"></i>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTaskMutation.mutate(task.id)}
            disabled={deleteTaskMutation.isPending}
            data-testid={`button-delete-${task.id}`}
          >
            <i className="fas fa-trash text-destructive"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}