import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  high: number;
  completed: number;
  pending: number;
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/tasks/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16 mb-4"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: "fas fa-tasks",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      change: "+12%",
      changeText: "from last week",
      changeColor: "text-green-600",
      testId: "stat-total-tasks",
    },
    {
      title: "High Priority",
      value: stats.high,
      icon: "fas fa-exclamation-triangle",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      change: "+3",
      changeText: "since yesterday",
      changeColor: "text-red-600",
      testId: "stat-high-priority",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: "fas fa-check-circle",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "+7%",
      changeText: "completion rate",
      changeColor: "text-green-600",
      testId: "stat-completed",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: "fas fa-clock",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      change: "-5%",
      changeText: "from last week",
      changeColor: "text-amber-600",
      testId: "stat-pending",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground" data-testid={stat.testId}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <i className={`${stat.icon} ${stat.iconColor}`}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${stat.changeColor}`}>{stat.change}</span>
              <span className="text-muted-foreground text-sm ml-2">{stat.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
