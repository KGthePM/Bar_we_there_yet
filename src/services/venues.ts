import { supabase } from '@/lib/supabase';
import type { Venue, VenueCrowdLevel, VenueWithCrowd } from '@/types/database';

export async function getVenues(): Promise<VenueWithCrowd[]> {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  const { data: crowds } = await supabase
    .from('venue_crowd_levels')
    .select('*');

  const crowdMap = new Map<string, VenueCrowdLevel>();
  crowds?.forEach(c => crowdMap.set(c.venue_id, c));

  return (venues || []).map(v => ({
    ...v,
    crowd_level: crowdMap.get(v.id)?.crowd_level,
    active_checkins: crowdMap.get(v.id)?.active_checkins ?? 0,
  }));
}

export async function getVenueBySlug(slug: string): Promise<VenueWithCrowd | null> {
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !venue) return null;

  const { data: crowd } = await supabase
    .from('venue_crowd_levels')
    .select('*')
    .eq('venue_id', venue.id)
    .single();

  return {
    ...venue,
    crowd_level: crowd?.crowd_level,
    active_checkins: crowd?.active_checkins ?? 0,
  };
}

export async function getVenueById(id: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createVenue(venue: Partial<Venue>): Promise<Venue> {
  const { data, error } = await supabase
    .from('venues')
    .insert(venue)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVenue(id: string, updates: Partial<Venue>): Promise<Venue> {
  const { data, error } = await supabase
    .from('venues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOwnerVenues(ownerId: string): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function uploadVenuePhoto(file: File, venueId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `venues/${venueId}/photo.${ext}`;

  const { error } = await supabase.storage
    .from('venue-photos')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from('venue-photos')
    .getPublicUrl(path);

  return data.publicUrl;
}
