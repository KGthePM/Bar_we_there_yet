import { Card } from '@/components/ui/Card';
import { useTodayStats } from '@/hooks/useVenueStats';

interface StatsOverviewProps {
  venueId: string;
}

export function StatsOverview({ venueId }: StatsOverviewProps) {
  const { total_checkins, unique_visitors, repeat_visitors, isLoading } = useTodayStats(venueId);

  const repeatPercent = unique_visitors > 0
    ? Math.round((repeat_visitors / unique_visitors) * 100)
    : 0;

  const stats = [
    { label: "Today's Check-ins", value: total_checkins, icon: '📍' },
    { label: 'Unique Visitors', value: unique_visitors, icon: '👤' },
    { label: 'Repeat %', value: `${repeatPercent}%`, icon: '🔄' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(stat => (
        <Card key={stat.label} className="text-center space-y-1">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-gray-800 rounded w-12 mx-auto" />
              <div className="h-3 bg-gray-800 rounded w-20 mx-auto" />
            </div>
          ) : (
            <>
              <p className="text-2xl">{stat.icon}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
