import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TaskList from "@/components/tasks/task-list";
import TaskForm from "@/components/tasks/task-form";

export default function Tasks() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header
          title="Email Tasks"
          description="Manage and organize your email tasks"
          onCreateTask={() => setIsTaskFormOpen(true)}
        />
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <TaskList />
          </div>
        </div>
      </main>
      
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
      />
    </div>
  );
}
