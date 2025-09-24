import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categoryColors = {
  "brand-collaboration": "bg-blue-500",
  "content-request": "bg-green-500",
  "crisis-management": "bg-amber-500",
  "general-inquiry": "bg-purple-500",
};

const categoryLabels = {
  "brand-collaboration": "Brand Collaboration",
  "content-request": "Content Request",
  "crisis-management": "Crisis Management",
  "general-inquiry": "General Inquiry",
};

export default function CategoryBreakdown() {
  const { data: categories = {}, isLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/tasks/categories"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
              <div className="h-4 bg-muted rounded w-8"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 ${categoryColors[key as keyof typeof categoryColors]} rounded-full`}></div>
              <span className="text-sm text-foreground">{label}</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground" data-testid={`category-count-${key}`}>
              {categories[key] || 0}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
