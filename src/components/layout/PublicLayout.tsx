import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/lib/constants';

export function PublicLayout() {
  const { isAuthenticated, isAnonymous, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            <span className="text-brand-500">Bar</span>WeThereYet
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/explore" className="text-sm text-gray-400 hover:text-white transition-colors">
              Explore
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/me" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Profile
                </Link>
                <Link to="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : isAnonymous ? (
              <Link
                to="/signup"
                className="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 transition-colors"
              >
                Create Account
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          {APP_NAME} &middot; Real-time bar crowd levels
        </div>
      </footer>
    </div>
  );
}
