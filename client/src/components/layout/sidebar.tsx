import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Logout failed",
        variant: "destructive",
      });
    },
  });

  const isActive = (path: string) => location === path;

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-envelope text-primary-foreground"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">EmailFlow</h1>
            <p className="text-sm text-muted-foreground">Social Media Manager</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive("/dashboard")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              data-testid="link-dashboard"
            >
              <i className="fas fa-chart-pie w-5"></i>
              <span className={isActive("/dashboard") ? "font-medium" : ""}>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/tasks"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive("/tasks")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              data-testid="link-tasks"
            >
              <i className="fas fa-inbox w-5"></i>
              <span className={isActive("/tasks") ? "font-medium" : ""}>Email Tasks</span>
            </Link>
          </li>
        </ul>
        
        <div className="mt-8">
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
          </div>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => logoutMutation.mutate()}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt w-5"></i>
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
