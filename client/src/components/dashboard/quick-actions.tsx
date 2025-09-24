import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onCreateTask: () => void;
}

export default function QuickActions({ onCreateTask }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onCreateTask}
          className="w-full flex items-center space-x-3 justify-start"
          data-testid="button-quick-create-task"
        >
          <i className="fas fa-plus"></i>
          <span>Create New Task</span>
        </Button>
        <Button
          variant="secondary"
          className="w-full flex items-center space-x-3 justify-start"
          data-testid="button-bulk-import"
        >
          <i className="fas fa-upload"></i>
          <span>Import Emails</span>
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center space-x-3 justify-start"
          data-testid="button-export-tasks"
        >
          <i className="fas fa-download"></i>
          <span>Export Tasks</span>
        </Button>
      </CardContent>
    </Card>
  );
}
