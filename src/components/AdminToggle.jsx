import { Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

const AdminToggle = () => {
  const { user, toggleAdmin } = useUser();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={toggleAdmin}
        variant={user?.isAdmin ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-2 shadow-lg"
      >
        {user?.isAdmin ? (
          <>
            <Shield className="h-4 w-4" />
            Admin
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            Usuário
          </>
        )}
      </Button>
    </div>
  );
};

export default AdminToggle;
