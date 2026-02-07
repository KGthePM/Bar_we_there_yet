import { useParams, Link } from 'react-router-dom';
import { useVenue } from '@/hooks/useVenues';
import { useCrowdLevel } from '@/hooks/useCrowdLevel';
import { CrowdIndicator } from '@/components/venue/CrowdIndicator';
import { RewardProgress } from '@/components/rewards/RewardProgress';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatTime, getDayOfWeek, isVenueOpen } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { getVenueRewardsWithProgress, getVenueRewards } from '@/services/rewards';
import type { RewardWithProgress, Reward } from '@/types/database';

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export function VenuePage() {
  const { slug } = useParams<{ slug: string }>();
  const { venue, isLoading, error } = useVenue(slug);
  const { count, level } = useCrowdLevel(venue?.id);
  const { user, isAuthenticated } = useAuth();
  const [rewards, setRewards] = useState<RewardWithProgress[] | Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);

  const today = getDayOfWeek();

  useEffect(() => {
    if (!venue) return;

    if (isAuthenticated && user) {
      getVenueRewardsWithProgress(venue.id, user.id)
        .then(setRewards)
        .finally(() => setRewardsLoading(false));
    } else {
      getVenueRewards(venue.id)
        .then(r => setRewards(r.map(rw => ({ ...rw, user_reward: null }))))
        .finally(() => setRewardsLoading(false));
    }
  }, [venue, user, isAuthenticated]);

  if (isLoading) return <Spinner size="lg" className="py-24" />;

  if (error || !venue) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🍺</p>
        <h1 className="text-2xl font-bold text-white mb-2">Venue Not Found</h1>
        <p className="text-gray-400 mb-6">This bar doesn't exist in our system yet.</p>
        <Link to="/explore">
          <Button variant="secondary">Browse All Venues</Button>
        </Link>
      </div>
    );
  }

  const open = isVenueOpen(venue.hours || {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      {venue.photo_url ? (
        <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-8">
          <img src={venue.photo_url} alt={venue.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[21/9] rounded-2xl bg-gradient-to-br from-brand-600/20 to-brand-900/20 flex items-center justify-center mb-8">
          <span className="text-7xl opacity-30">🍺</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-white">{venue.name}</h1>
              <CrowdIndicator level={level} count={count} showCount />
            </div>
            <p className="text-gray-400 mt-1">
              {venue.address && `${venue.address}, `}
              {venue.city}, {venue.state} {venue.zip}
            </p>
          </div>

          {venue.description && (
            <p className="text-gray-300 leading-relaxed">{venue.description}</p>
          )}

          <Link to={`/checkin/${venue.slug}`}>
            <Button size="lg" className="w-full md:w-auto">
              Check In Now
            </Button>
          </Link>

          {/* Rewards section */}
          {rewards.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Rewards</h2>
              <RewardProgress
                rewards={rewards as RewardWithProgress[]}
                isLoading={rewardsLoading}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className={open ? 'text-green-400' : 'text-red-400'}>●</span>
              <span className="font-medium text-white">{open ? 'Open Now' : 'Closed'}</span>
            </div>
            <div className="space-y-1.5">
              {dayOrder.map(day => {
                const hours = venue.hours?.[day];
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    className={`flex justify-between text-sm ${
                      isToday ? 'text-white font-medium' : 'text-gray-400'
                    }`}
                  >
                    <span>{dayLabels[day]}</span>
                    <span>
                      {hours
                        ? `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                        : 'Closed'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {venue.phone && (
            <Card>
              <p className="text-sm text-gray-400">Phone</p>
              <a href={`tel:${venue.phone}`} className="text-white hover:text-brand-400">
                {venue.phone}
              </a>
            </Card>
          )}

          {venue.website && (
            <Card>
              <p className="text-sm text-gray-400">Website</p>
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 text-sm break-all"
              >
                {venue.website}
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
