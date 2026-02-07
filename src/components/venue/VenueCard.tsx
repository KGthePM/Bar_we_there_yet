import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { CrowdIndicator } from '@/components/venue/CrowdIndicator';
import { isVenueOpen, formatTime, getDayOfWeek } from '@/lib/utils';
import type { VenueWithCrowd } from '@/types/database';

interface VenueCardProps {
  venue: VenueWithCrowd;
}

export function VenueCard({ venue }: VenueCardProps) {
  const open = isVenueOpen(venue.hours || {});
  const today = getDayOfWeek();
  const todayHours = venue.hours?.[today];

  return (
    <Link to={`/venue/${venue.slug}`}>
      <Card hover className="group">
        {venue.photo_url ? (
          <div className="aspect-[16/9] -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
            <img
              src={venue.photo_url}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] -mx-6 -mt-6 mb-4 rounded-t-2xl bg-gradient-to-br from-brand-600/30 to-brand-900/30 flex items-center justify-center">
            <span className="text-5xl opacity-50">🍺</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
                {venue.name}
              </h3>
              <p className="text-sm text-gray-400">
                {venue.city}, {venue.state}
              </p>
            </div>
            <CrowdIndicator level={venue.crowd_level || 'empty'} size="sm" />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={open ? 'text-green-400' : 'text-red-400'}>
              {open ? 'Open' : 'Closed'}
            </span>
            {todayHours && (
              <>
                <span>&middot;</span>
                <span>{formatTime(todayHours.open)} - {formatTime(todayHours.close)}</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
