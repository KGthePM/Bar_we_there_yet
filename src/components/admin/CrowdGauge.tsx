import { CrowdIndicator } from '@/components/venue/CrowdIndicator';
import { Card } from '@/components/ui/Card';
import { useCrowdLevel } from '@/hooks/useCrowdLevel';

interface CrowdGaugeProps {
  venueId: string;
}

export function CrowdGauge({ venueId }: CrowdGaugeProps) {
  const { count, level, isLoading } = useCrowdLevel(venueId);

  return (
    <Card className="text-center space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Live Crowd</h3>
      {isLoading ? (
        <div className="animate-pulse h-10 bg-gray-800 rounded-full w-32 mx-auto" />
      ) : (
        <>
          <CrowdIndicator level={level} count={count} size="lg" showCount />
          <p className="text-xs text-gray-500">
            {count === 1 ? '1 person checked in' : `${count} people checked in`}
          </p>
        </>
      )}
    </Card>
  );
}
