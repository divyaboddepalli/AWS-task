import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskCard from "./task-card";
import TaskForm from "./task-form";
import type { Task } from "@shared/schema";

export default function TaskList() {
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks.filter(task => {
    if (priorityFilter === "all") return true;
    return task.priority === priorityFilter;
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading tasks...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Email Tasks</h3>
              <div className="flex items-center space-x-2">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40" data-testid="select-priority-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <div className="divide-y divide-border">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {priorityFilter === "all" ? "No tasks found" : `No ${priorityFilter} priority tasks found`}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEdit} />
              ))
            )}
          </div>
        </Card>
      </div>

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        task={editingTask || undefined}
      />
    </>
  );
}
