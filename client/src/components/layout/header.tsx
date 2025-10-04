import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
  onCreateTask?: () => void;
}

export default function Header({ title, description, onCreateTask }: HeaderProps) {
  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.getCurrentUser,
  });

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-muted-foreground">
              {description}
              {authData?.user && <span data-testid="text-username">{authData.user.name}</span>}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {onCreateTask && (
            <Button onClick={onCreateTask} data-testid="button-create-task">
              <i className="fas fa-plus mr-2"></i>
              New Task
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <button className="text-muted-foreground hover:text-foreground">
              <i className="fas fa-bell"></i>
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium" data-testid="text-user-initials">
                {authData?.user ? authData.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
