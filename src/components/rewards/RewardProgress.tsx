import { RewardCard } from '@/components/rewards/RewardCard';
import { Spinner } from '@/components/ui/Spinner';
import type { RewardWithProgress } from '@/types/database';

interface RewardProgressProps {
  rewards: RewardWithProgress[];
  isLoading: boolean;
  onRedeem?: (userRewardId: string) => void;
  redeemingId?: string | null;
}

export function RewardProgress({ rewards, isLoading, onRedeem, redeemingId }: RewardProgressProps) {
  if (isLoading) return <Spinner className="py-8" />;

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-3xl mb-2">🏆</p>
        <p>No rewards available at this venue yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rewards.map(reward => (
        <RewardCard
          key={reward.id}
          reward={reward}
          onRedeem={onRedeem}
          isRedeeming={redeemingId === reward.user_reward?.id}
        />
      ))}
    </div>
  );
}
