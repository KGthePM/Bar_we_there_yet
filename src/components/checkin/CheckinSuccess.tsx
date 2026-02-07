import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface CheckinSuccessProps {
  venueName: string;
  venueSlug: string;
}

export function CheckinSuccess({ venueName, venueSlug }: CheckinSuccessProps) {
  const { isAnonymous, isAuthenticated } = useAuth();

  return (
    <div className="text-center space-y-6">
      <div className="text-7xl animate-bounce">🎉</div>
      <div>
        <h2 className="text-2xl font-bold text-white">You're in!</h2>
        <p className="text-gray-400 mt-1">Checked in to {venueName}</p>
      </div>

      {isAnonymous && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 space-y-3">
          <p className="text-sm text-brand-300">
            Create an account to earn rewards for your check-ins!
          </p>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Create Account
            </Button>
          </Link>
        </div>
      )}

      {isAuthenticated && (
        <div className="space-y-2">
          <p className="text-sm text-green-400">+1 point earned!</p>
          <Link to={`/venue/${venueSlug}`}>
            <Button variant="ghost" size="sm">
              View venue details
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
