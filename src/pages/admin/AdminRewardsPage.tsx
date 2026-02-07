import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { getAllVenueRewards, createReward, updateReward } from '@/services/rewards';
import { getVenueById } from '@/services/venues';
import type { Reward, Venue } from '@/types/database';

export function AdminRewardsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rewardName, setRewardName] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [checkinsRequired, setCheckinsRequired] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      getVenueById(id),
      getAllVenueRewards(id),
    ]).then(([v, r]) => {
      setVenue(v);
      setRewards(r);
    }).finally(() => setIsLoading(false));
  }, [id]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    try {
      const reward = await createReward({
        venue_id: id,
        name: rewardName,
        description: rewardDesc || null,
        checkins_required: checkinsRequired,
      });
      setRewards(prev => [reward, ...prev]);
      setRewardName('');
      setRewardDesc('');
      setCheckinsRequired(5);
      setShowForm(false);
      toast('Reward created!', 'success');
    } catch {
      toast('Failed to create reward', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(reward: Reward) {
    try {
      const updated = await updateReward(reward.id, { is_active: !reward.is_active });
      setRewards(prev => prev.map(r => r.id === reward.id ? updated : r));
      toast(updated.is_active ? 'Reward activated' : 'Reward deactivated', 'success');
    } catch {
      toast('Failed to update reward', 'error');
    }
  }

  if (isLoading) return <Spinner size="lg" className="py-24" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Rewards</h1>
          <p className="text-gray-400 mt-1">{venue?.name}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'ghost' : 'primary'} size="sm">
          {showForm ? 'Cancel' : '+ New Reward'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Reward Name"
              value={rewardName}
              onChange={e => setRewardName(e.target.value)}
              required
              placeholder="e.g., Free Appetizer"
            />
            <Input
              label="Description (optional)"
              value={rewardDesc}
              onChange={e => setRewardDesc(e.target.value)}
              placeholder="e.g., Any appetizer on the menu"
            />
            <Input
              label="Check-ins Required"
              type="number"
              min={1}
              max={100}
              value={checkinsRequired}
              onChange={e => setCheckinsRequired(Number(e.target.value))}
            />
            <Button type="submit" isLoading={isSaving}>Create Reward</Button>
          </form>
        </Card>
      )}

      {rewards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🏆</p>
          <p>No rewards yet. Create one to start engaging customers!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rewards.map(reward => (
            <Card key={reward.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{reward.name}</h3>
                  <Badge variant={reward.is_active ? 'success' : 'default'}>
                    {reward.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {reward.description && (
                  <p className="text-sm text-gray-400 mt-0.5">{reward.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {reward.checkins_required} check-ins required
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActive(reward)}
              >
                {reward.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
