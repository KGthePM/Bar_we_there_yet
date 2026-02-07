import { useParams } from 'react-router-dom';
import { useVenue } from '@/hooks/useVenues';
import { useCrowdLevel } from '@/hooks/useCrowdLevel';
import { useCheckin } from '@/hooks/useCheckin';
import { CrowdIndicator } from '@/components/venue/CrowdIndicator';
import { CheckinButton } from '@/components/checkin/CheckinButton';
import { CheckinSuccess } from '@/components/checkin/CheckinSuccess';
import { Spinner } from '@/components/ui/Spinner';

export function CheckinPage() {
  const { slug } = useParams<{ slug: string }>();
  const { venue, isLoading: venueLoading, error: venueError } = useVenue(slug);
  const { count, level } = useCrowdLevel(venue?.id);
  const { isLoading: checkinLoading, isSuccess, error: checkinError, checkin } = useCheckin(venue?.id);

  if (venueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (venueError || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-6xl">🍺</p>
          <h1 className="text-2xl font-bold text-white">Venue Not Found</h1>
          <p className="text-gray-400">This QR code doesn't match any registered venue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-8">
        {/* Venue header */}
        <div className="text-center space-y-2">
          {venue.photo_url ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4">
              <img src={venue.photo_url} alt={venue.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍺</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{venue.name}</h1>
          {venue.city && (
            <p className="text-sm text-gray-400">{venue.city}, {venue.state}</p>
          )}
        </div>

        {/* Crowd level */}
        <div className="text-center">
          <CrowdIndicator level={level} count={count} size="lg" showCount />
        </div>

        {/* Check-in action */}
        <div className="space-y-4">
          {isSuccess ? (
            <CheckinSuccess venueName={venue.name} venueSlug={venue.slug} venueId={venue.id} />
          ) : (
            <>
              <CheckinButton
                onCheckin={checkin}
                isLoading={checkinLoading}
                isSuccess={isSuccess}
              />
              {checkinError && (
                <p className="text-sm text-center text-red-400 bg-red-500/10 px-4 py-2 rounded-xl">
                  {checkinError}
                </p>
              )}
              <p className="text-xs text-center text-gray-500">
                No account needed. Your check-in helps others see the vibe.
              </p>
            </>
          )}
        </div>

        {/* Powered by */}
        <p className="text-center text-xs text-gray-600">
          Powered by <span className="text-brand-500">Bar</span>WeThereYet
        </p>
      </div>
    </div>
  );
}
