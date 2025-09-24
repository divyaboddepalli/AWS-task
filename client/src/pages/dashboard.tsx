import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsOverview from "@/components/dashboard/stats-overview";
import TaskList from "@/components/tasks/task-list";
import QuickActions from "@/components/dashboard/quick-actions";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import RecentActivity from "@/components/dashboard/recent-activity";
import TaskForm from "@/components/tasks/task-form";
import { authApi } from "@/lib/auth";

export default function Dashboard() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.getCurrentUser,
  });

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
              <QuickActions onCreateTask={() => setIsTaskFormOpen(true)} />
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
