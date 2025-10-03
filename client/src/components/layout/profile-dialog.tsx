import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.getCurrentUser,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            View and manage your profile information.
          </DialogDescription>
        </DialogHeader>
        {authData?.user && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Name</label>
              <p>{authData.user.name}</p>
            </div>
            <div>
              <label className="font-semibold">Email</label>
              <p>{authData.user.email}</p>
            </div>
            <div>
              <label className="font-semibold">Username</label>
              <p>{authData.user.username}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}