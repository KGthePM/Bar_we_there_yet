import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

export function ProfilePage() {
  const { user, profile, isAnonymous, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('user_profiles')
      .update({ display_name: displayName })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      toast('Failed to update profile', 'error');
    } else {
      await refreshProfile();
      toast('Profile updated!', 'success');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

      <div className="space-y-6">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Account Info</h2>

          {isAnonymous ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-sm text-yellow-300">
                You're using an anonymous account. Create an account to save your progress.
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              <p>Email: {user?.email}</p>
            </div>
          )}

          <Input
            label="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
          />

          <Button onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Stats</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-brand-400">{profile?.total_points || 0}</p>
              <p className="text-xs text-gray-400">Total Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-400">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '--'}
              </p>
              <p className="text-xs text-gray-400">Member Since</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
