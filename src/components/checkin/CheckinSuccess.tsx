import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { RewardCard } from '@/components/rewards/RewardCard';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { getVenueRewards, getVenueRewardsWithProgress, redeemReward } from '@/services/rewards';
import type { Reward, RewardWithProgress } from '@/types/database';

interface CheckinSuccessProps {
  venueName: string;
  venueSlug: string;
  venueId: string;
}

export function CheckinSuccess({ venueName, venueSlug, venueId }: CheckinSuccessProps) {
  const { isAnonymous, isAuthenticated, user } = useAuth();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsWithProgress, setRewardsWithProgress] = useState<RewardWithProgress[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null);

  const fetchAuthenticatedRewards = useCallback(async () => {
    if (!user) return;
    setRewardsLoading(true);
    try {
      const data = await getVenueRewardsWithProgress(venueId, user.id);
      setRewardsWithProgress(data);
    } catch {
      // silently fail — rewards are supplementary
    } finally {
      setRewardsLoading(false);
    }
  }, [venueId, user]);

  useEffect(() => {
    if (isAnonymous) {
      getVenueRewards(venueId)
        .then(setRewards)
        .catch(() => {})
        .finally(() => setRewardsLoading(false));
    } else if (isAuthenticated && user) {
      fetchAuthenticatedRewards();
    } else {
      setRewardsLoading(false);
    }
  }, [venueId, isAnonymous, isAuthenticated, user, fetchAuthenticatedRewards]);

  async function handleRedeem(userRewardId: string) {
    setRedeemingId(userRewardId);
    const result = await redeemReward(userRewardId);
    setRedeemingId(null);
    if (result.success) {
      setJustRedeemed(userRewardId);
      fetchAuthenticatedRewards();
    }
  }

  function handleAuthSuccess() {
    // After signup/login, auth state changes will trigger re-render
    // and the useEffect will fetch authenticated rewards
  }

  return (
    <div className="text-center space-y-6">
      {/* Celebration header */}
      <div className="text-7xl animate-bounce">🎉</div>
      <div>
        <h2 className="text-2xl font-bold text-white">You're in!</h2>
        <p className="text-gray-400 mt-1">Checked in to {venueName}</p>
      </div>

      {/* Anonymous user flow */}
      {isAnonymous && (
        <div className="space-y-5">
          {/* Venue rewards preview */}
          {rewardsLoading ? (
            <Spinner size="sm" />
          ) : rewards.length > 0 ? (
            <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-brand-300">
                Rewards you could earn here
              </p>
              <ul className="space-y-2">
                {rewards.map(r => (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-white">{r.name}</span>
                    <span className="text-gray-400">{r.checkins_required} check-ins</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Inline auth forms */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 text-left">
            <p className="text-sm text-center text-gray-300">
              {rewards.length > 0
                ? 'Sign up to start earning rewards!'
                : 'Create an account to track your check-ins!'}
            </p>

            {showLogin ? (
              <>
                <LoginForm onSuccess={handleAuthSuccess} />
                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="text-brand-400 hover:text-brand-300"
                  >
                    Sign up
                  </button>
                </p>
              </>
            ) : (
              <>
                <SignUpForm isLinking onSuccess={handleAuthSuccess} />
                <p className="text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setShowLogin(true)}
                    className="text-brand-400 hover:text-brand-300"
                  >
                    Log in
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Authenticated user flow */}
      {isAuthenticated && (
        <div className="space-y-4">
          <p className="text-sm text-green-400 font-medium">+1 point earned!</p>

          {rewardsLoading ? (
            <Spinner size="sm" />
          ) : rewardsWithProgress.length > 0 ? (
            <div className="space-y-3 text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wider text-center">
                Your rewards at {venueName}
              </p>
              {rewardsWithProgress.map(r => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  onRedeem={handleRedeem}
                  isRedeeming={redeemingId === r.user_reward?.id}
                />
              ))}
              {justRedeemed && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                  <p className="text-green-400 font-semibold">🎉 Show this to your bartender!</p>
                </div>
              )}
            </div>
          ) : (
            <Link to={`/venue/${venueSlug}`}>
              <Button variant="ghost" size="sm">
                View venue details
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
