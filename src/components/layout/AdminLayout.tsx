import { Link, Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { getOwnerVenues } from '@/services/venues';
import type { Venue } from '@/types/database';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'New Venue', path: '/admin/venue/new', icon: '➕' },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    if (user) {
      getOwnerVenues(user.id).then(setVenues).catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-lg font-bold text-white">
            <span className="text-brand-500">Bar</span>WeThereYet
          </Link>
          <p className="text-xs text-gray-500 mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                location.pathname === item.path
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {venues.length > 0 && (
            <div className="pt-4">
              <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Your Venues
              </p>
              {venues.map(venue => (
                <div key={venue.id} className="space-y-0.5">
                  <Link
                    to={`/admin/venue/${venue.id}/edit`}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      location.pathname.includes(venue.id)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                    )}
                  >
                    <span>🍺</span>
                    {venue.name}
                  </Link>
                  <div className="pl-9 space-y-0.5">
                    <Link
                      to={`/admin/venue/${venue.id}/qr`}
                      className="block text-xs text-gray-500 hover:text-gray-300 py-1"
                    >
                      QR Code
                    </Link>
                    <Link
                      to={`/admin/venue/${venue.id}/rewards`}
                      className="block text-xs text-gray-500 hover:text-gray-300 py-1"
                    >
                      Rewards
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
