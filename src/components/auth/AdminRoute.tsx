import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { useEffect, useState } from 'react';
import { getOwnerVenues } from '@/services/venues';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    if (user && isAuthenticated) {
      getOwnerVenues(user.id).then(_venues => {
        // Allow access even if they haven't created a venue yet (they might be creating one)
        setIsOwner(true);
      }).catch(() => setIsOwner(false));
    }
  }, [user, isAuthenticated]);

  if (isLoading || isOwner === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
