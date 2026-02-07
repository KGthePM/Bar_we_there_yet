import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/hooks/useAuth';

export function SignUpPage() {
  const navigate = useNavigate();
  const { isAnonymous } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            {isAnonymous ? 'Save Your Progress' : 'Create Account'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isAnonymous
              ? 'Link an email to keep your check-in history and earn rewards'
              : 'Start tracking crowd levels and earning rewards'}
          </p>
        </div>
        <Card>
          <SignUpForm
            isLinking={isAnonymous}
            onSuccess={() => navigate('/', { replace: true })}
          />
        </Card>
      </div>
    </div>
  );
}
