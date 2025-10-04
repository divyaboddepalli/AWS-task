import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";

export function useAuth() {
  const { data, ...rest } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.getCurrentUser,
    retry: false,
  });

  return { user: data?.user, ...rest };
}