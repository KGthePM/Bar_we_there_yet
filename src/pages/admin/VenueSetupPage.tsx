import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { createVenue, updateVenue, getVenueById, uploadVenuePhoto } from '@/services/venues';
import { generateSlug } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

const defaultHours = {
  monday: { open: '16:00', close: '02:00' },
  tuesday: { open: '16:00', close: '02:00' },
  wednesday: { open: '16:00', close: '02:00' },
  thursday: { open: '16:00', close: '02:00' },
  friday: { open: '14:00', close: '02:00' },
  saturday: { open: '12:00', close: '02:00' },
  sunday: { open: '12:00', close: '00:00' },
};

const dayLabels: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
  friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

export function VenueSetupPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('NJ');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(defaultHours);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);

  useEffect(() => {
    if (id) {
      getVenueById(id).then(venue => {
        if (venue) {
          setName(venue.name);
          setAddress(venue.address || '');
          setCity(venue.city || '');
          setState(venue.state || 'NJ');
          setZip(venue.zip || '');
          setPhone(venue.phone || '');
          setWebsite(venue.website || '');
          setDescription(venue.description || '');
          if (venue.hours && Object.keys(venue.hours).length > 0) {
            setHours(venue.hours as typeof defaultHours);
          }
        }
        setIsFetching(false);
      });
    }
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const slug = generateSlug(`${name}-${city}`);
      const venueData = {
        name,
        slug,
        address,
        city,
        state,
        zip,
        phone,
        website,
        description,
        hours,
        owner_id: user.id,
      };

      let venue;
      if (isEditing && id) {
        venue = await updateVenue(id, venueData);
        toast('Venue updated!', 'success');
      } else {
        venue = await createVenue(venueData);
        toast('Venue created!', 'success');
      }

      // Upload photo if selected
      if (photo && venue) {
        const photoUrl = await uploadVenuePhoto(photo, venue.id);
        await updateVenue(venue.id, { photo_url: photoUrl });
      }

      navigate(`/admin/venue/${venue.id}/qr`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save venue', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  function updateHours(day: string, field: 'open' | 'close', value: string) {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value },
    }));
  }

  if (isFetching) return <Spinner size="lg" className="py-24" />;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">
        {isEditing ? 'Edit Venue' : 'Register Your Bar'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Info</h2>
          <Input label="Venue Name" value={name} onChange={e => setName(e.target.value)} required placeholder="Crossroads Bar & Grill" />
          <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of your venue" />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setPhoto(e.target.files?.[0] || null)}
              className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Location</h2>
          <Input label="Street Address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="City" value={city} onChange={e => setCity(e.target.value)} required placeholder="Camden" />
            <Input label="State" value={state} onChange={e => setState(e.target.value)} placeholder="NJ" />
            <Input label="ZIP" value={zip} onChange={e => setZip(e.target.value)} placeholder="08101" />
          </div>
          <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
          <Input label="Website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://crossroadsbarandgrill.com" />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Hours</h2>
          <div className="space-y-3">
            {Object.entries(dayLabels).map(([day, label]) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-24 text-sm text-gray-400">{label}</span>
                <input
                  type="time"
                  value={hours[day as keyof typeof hours]?.open || ''}
                  onChange={e => updateHours(day, 'open', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hours[day as keyof typeof hours]?.close || ''}
                  onChange={e => updateHours(day, 'close', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300"
                />
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit" isLoading={isLoading} size="lg">
          {isEditing ? 'Save Changes' : 'Create Venue'}
        </Button>
      </form>
    </div>
  );
}
