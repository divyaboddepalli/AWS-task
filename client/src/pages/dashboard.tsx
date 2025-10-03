import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsOverview from "@/components/dashboard/stats-overview";
import TaskList from "@/components/tasks/task-list";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import RecentActivity from "@/components/dashboard/recent-activity";
import TaskForm from "@/components/tasks/task-form";

export default function Dashboard() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header
          title="Dashboard"
          description="Welcome back, "
          onCreateTask={() => setIsTaskFormOpen(true)}
        />
        <div className="p-6">
          <StatsOverview />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TaskList />
            <div className="space-y-6">
              <CategoryBreakdown />
              <RecentActivity />
            </div>
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
