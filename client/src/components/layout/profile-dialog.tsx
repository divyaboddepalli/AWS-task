import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { user } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            This is your public profile information.
          </DialogDescription>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Name</label>
              <p>{user.name}</p>
            </div>
            <div>
              <label className="font-semibold">Email</label>
              <p>{user.email}</p>
            </div>
            <div>
              <label className="font-semibold">Username</label>
              <p>{user.username}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}