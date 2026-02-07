import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { getUserRewards, redeemReward } from '@/services/rewards';
import type { UserReward, Reward } from '@/types/database';

export function RewardsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<(UserReward & { rewards: Reward })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserRewards(user.id)
      .then(setRewards)
      .finally(() => setIsLoading(false));
  }, [user]);

  async function handleRedeem(userRewardId: string) {
    setRedeemingId(userRewardId);
    const result = await redeemReward(userRewardId);
    setRedeemingId(null);

    if (result.success) {
      toast(result.message || 'Reward redeemed!', 'success');
      // Refresh
      if (user) {
        const updated = await getUserRewards(user.id);
        setRewards(updated);
      }
    } else {
      toast(result.message || result.error || 'Failed to redeem', 'error');
    }
  }

  if (isLoading) return <Spinner size="lg" className="py-24" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">My Rewards</h1>

      {rewards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🏆</p>
          <p>No rewards yet. Check in at venues to start earning!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rewards.map(ur => {
            const percent = Math.min(100, (ur.checkins_completed / ur.rewards.checkins_required) * 100);

            return (
              <Card key={ur.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{ur.rewards.name}</h3>
                    {ur.rewards.description && (
                      <p className="text-sm text-gray-400">{ur.rewards.description}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      ur.status === 'redeemed' ? 'success'
                      : ur.status === 'redeemable' ? 'warning'
                      : 'default'
                    }
                  >
                    {ur.status === 'redeemed' ? 'Redeemed' : ur.status === 'redeemable' ? 'Ready!' : `${ur.checkins_completed}/${ur.rewards.checkins_required}`}
                  </Badge>
                </div>

                {ur.status !== 'redeemed' && (
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}

                {ur.status === 'redeemable' && (
                  <Button
                    onClick={() => handleRedeem(ur.id)}
                    isLoading={redeemingId === ur.id}
                    size="sm"
                    className="w-full"
                  >
                    Redeem
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
