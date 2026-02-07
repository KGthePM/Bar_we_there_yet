import { useEffect, useState } from 'react';
import { getVenues, getVenueBySlug } from '@/services/venues';
import type { VenueWithCrowd } from '@/types/database';

export function useVenues() {
  const [venues, setVenues] = useState<VenueWithCrowd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVenues()
      .then(setVenues)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { venues, isLoading, error };
}

export function useVenue(slug: string | undefined) {
  const [venue, setVenue] = useState<VenueWithCrowd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    getVenueBySlug(slug)
      .then(data => {
        setVenue(data);
        if (!data) setError('Venue not found');
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return { venue, isLoading, error };
}
