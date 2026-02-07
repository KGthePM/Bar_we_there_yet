import { VenueList } from '@/components/venue/VenueList';
import { useVenues } from '@/hooks/useVenues';

export function ExplorePage() {
  const { venues, isLoading } = useVenues();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Explore Venues</h1>
        <p className="text-gray-400 mt-2">See real-time crowd levels at bars near you</p>
      </div>

      <VenueList
        venues={venues}
        isLoading={isLoading}
        emptyMessage="No venues available yet. Check back soon!"
      />
    </div>
  );
}
