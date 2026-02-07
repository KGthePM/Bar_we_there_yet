import { VenueCard } from '@/components/venue/VenueCard';
import { Spinner } from '@/components/ui/Spinner';
import type { VenueWithCrowd } from '@/types/database';

interface VenueListProps {
  venues: VenueWithCrowd[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function VenueList({ venues, isLoading, emptyMessage = 'No venues found' }: VenueListProps) {
  if (isLoading) {
    return <Spinner size="lg" className="py-12" />;
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-2">🍻</p>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map(venue => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
}
