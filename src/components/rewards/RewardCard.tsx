import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { RewardWithProgress } from '@/types/database';

interface RewardCardProps {
  reward: RewardWithProgress;
  onRedeem?: (userRewardId: string) => void;
  isRedeeming?: boolean;
}

export function RewardCard({ reward, onRedeem, isRedeeming }: RewardCardProps) {
  const progress = reward.user_reward?.checkins_completed || 0;
  const total = reward.checkins_required;
  const percentage = Math.min(100, (progress / total) * 100);
  const isRedeemable = reward.user_reward?.status === 'redeemable';
  const isRedeemed = reward.user_reward?.status === 'redeemed';

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white">{reward.name}</h4>
          {reward.description && (
            <p className="text-sm text-gray-400 mt-0.5">{reward.description}</p>
          )}
        </div>
        {isRedeemed ? (
          <Badge variant="success">Redeemed</Badge>
        ) : isRedeemable ? (
          <Badge variant="warning">Ready!</Badge>
        ) : (
          <Badge>{progress}/{total}</Badge>
        )}
      </div>

      {/* Progress bar */}
      {!isRedeemed && (
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {progress} of {total} check-ins
          </p>
        </div>
      )}

      {isRedeemable && onRedeem && reward.user_reward && (
        <Button
          onClick={() => onRedeem(reward.user_reward!.id)}
          isLoading={isRedeeming}
          size="sm"
          className="w-full"
        >
          Redeem Reward
        </Button>
      )}

      {isRedeemed && (
        <p className="text-xs text-green-400/70 text-center">
          Show this to your bartender!
        </p>
      )}
    </Card>
  );
}
