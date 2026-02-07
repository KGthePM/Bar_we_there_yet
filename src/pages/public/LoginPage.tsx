import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const isAdminRedirect = fromState?.startsWith('/admin');
  const [isAdminMode, setIsAdminMode] = useState(isAdminRedirect ?? false);

  const redirectTo = isAdminMode ? '/admin' : (fromState || '/');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Mode toggle */}
        <div className="flex rounded-xl bg-gray-900 border border-gray-800 p-1">
          <button
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              !isAdminMode
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              isAdminMode
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bar Owner
          </button>
        </div>

        <div className="text-center">
          {isAdminMode ? (
            <>
              <h1 className="text-2xl font-bold text-white">Bar Owner Portal</h1>
              <p className="text-gray-400 mt-1">Sign in to manage your venues</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-gray-400 mt-1">Log in to your account</p>
            </>
          )}
        </div>

        <Card>
          <LoginForm onSuccess={() => navigate(redirectTo, { replace: true })} />
        </Card>
      </div>
    </div>
  );
}
