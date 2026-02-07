import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getOwnerVenues } from '@/services/venues';
import { CrowdGauge } from '@/components/admin/CrowdGauge';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { CheckinChart } from '@/components/admin/CheckinChart';
import { PeakHoursHeatmap } from '@/components/admin/PeakHoursHeatmap';
import { RecentCheckins } from '@/components/admin/RecentCheckins';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Venue } from '@/types/database';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getOwnerVenues(user.id)
      .then(v => {
        setVenues(v);
        if (v.length > 0) setSelectedVenue(v[0]);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading) return <Spinner size="lg" className="py-24" />;

  if (venues.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-5xl">🍺</p>
        <h1 className="text-2xl font-bold text-white">No venues yet</h1>
        <p className="text-gray-400">Create your first venue to get started.</p>
        <Link to="/admin/venue/new">
          <Button>Create Venue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          {venues.length > 1 && (
            <select
              value={selectedVenue?.id || ''}
              onChange={e => setSelectedVenue(venues.find(v => v.id === e.target.value) || null)}
              className="mt-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300"
            >
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}
        </div>
        <Link to="/admin/venue/new">
          <Button variant="secondary" size="sm">+ Add Venue</Button>
        </Link>
      </div>

      {selectedVenue && (
        <>
          {/* Live crowd + stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CrowdGauge venueId={selectedVenue.id} />
            <div className="md:col-span-3">
              <StatsOverview venueId={selectedVenue.id} />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CheckinChart venueId={selectedVenue.id} />
            <PeakHoursHeatmap venueId={selectedVenue.id} />
          </div>

          {/* Recent checkins */}
          <RecentCheckins venueId={selectedVenue.id} />

          {/* Quick links */}
          <div className="flex gap-3">
            <Link to={`/admin/venue/${selectedVenue.id}/qr`}>
              <Button variant="secondary" size="sm">QR Code</Button>
            </Link>
            <Link to={`/admin/venue/${selectedVenue.id}/edit`}>
              <Button variant="secondary" size="sm">Edit Venue</Button>
            </Link>
            <Link to={`/admin/venue/${selectedVenue.id}/rewards`}>
              <Button variant="secondary" size="sm">Manage Rewards</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
