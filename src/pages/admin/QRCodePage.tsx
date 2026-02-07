import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';
import { Spinner } from '@/components/ui/Spinner';
import { getVenueById } from '@/services/venues';
import type { Venue } from '@/types/database';

export function QRCodePage() {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getVenueById(id)
        .then(setVenue)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) return <Spinner size="lg" className="py-24" />;

  if (!venue) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-400">Venue not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">QR Code</h1>
        <p className="text-gray-400 mt-1">Download and print for {venue.name}</p>
      </div>

      <div className="max-w-md mx-auto">
        <QRCodeGenerator slug={venue.slug} venueName={venue.name} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold text-white">Tips for your QR code</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>Print at least 4x4 inches for easy scanning</li>
          <li>Place near the entrance and at the bar</li>
          <li>Add to table tents for higher engagement</li>
          <li>Use laminated prints to prevent damage</li>
        </ul>
      </div>
    </div>
  );
}
