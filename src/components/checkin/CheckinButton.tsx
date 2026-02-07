import { Button } from '@/components/ui/Button';

interface CheckinButtonProps {
  onCheckin: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  disabled?: boolean;
}

export function CheckinButton({ onCheckin, isLoading, isSuccess, disabled }: CheckinButtonProps) {
  if (isSuccess) {
    return (
      <div className="text-center space-y-3 animate-in zoom-in duration-300">
        <div className="text-6xl">🎉</div>
        <p className="text-xl font-bold text-white">You're checked in!</p>
        <p className="text-sm text-gray-400">Your check-in helps others know how busy it is</p>
      </div>
    );
  }

  return (
    <Button
      onClick={onCheckin}
      isLoading={isLoading}
      disabled={disabled}
      size="lg"
      className="w-full text-xl py-5 rounded-2xl shadow-lg shadow-brand-500/25"
    >
      {isLoading ? 'Checking in...' : 'Check In'}
    </Button>
  );
}
