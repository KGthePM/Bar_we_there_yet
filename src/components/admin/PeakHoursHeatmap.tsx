import { Card } from '@/components/ui/Card';
import { useHourlyBreakdown } from '@/hooks/useVenueStats';
import { clsx } from 'clsx';

interface PeakHoursHeatmapProps {
  venueId: string;
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export function PeakHoursHeatmap({ venueId }: PeakHoursHeatmapProps) {
  const { heatmap, isLoading } = useHourlyBreakdown(venueId);

  // Find max value for color scaling
  let maxVal = 0;
  for (const day of days) {
    if (heatmap[day]) {
      for (const count of Object.values(heatmap[day])) {
        if (count > maxVal) maxVal = count;
      }
    }
  }

  function getIntensity(count: number): string {
    if (count === 0 || maxVal === 0) return 'bg-gray-800';
    const ratio = count / maxVal;
    if (ratio < 0.25) return 'bg-brand-500/20';
    if (ratio < 0.5) return 'bg-brand-500/40';
    if (ratio < 0.75) return 'bg-brand-500/60';
    return 'bg-brand-500/80';
  }

  return (
    <Card className="space-y-4">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Peak Hours</h3>

      {isLoading ? (
        <div className="h-48 bg-gray-800 rounded animate-pulse" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex gap-0.5 mb-1 ml-10">
              {hours.filter(h => h % 3 === 0).map(h => (
                <div
                  key={h}
                  className="text-[10px] text-gray-500"
                  style={{ width: `${(3 / 24) * 100}%` }}
                >
                  {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
                </div>
              ))}
            </div>

            {/* Grid */}
            {days.map((day, di) => (
              <div key={day} className="flex items-center gap-1 mb-0.5">
                <span className="text-[10px] text-gray-500 w-8 text-right">{dayLabels[di]}</span>
                <div className="flex-1 flex gap-0.5">
                  {hours.map(h => {
                    const count = heatmap[day]?.[String(h)] || 0;
                    return (
                      <div
                        key={h}
                        className={clsx(
                          'flex-1 h-5 rounded-sm transition-colors',
                          getIntensity(count),
                        )}
                        title={`${dayLabels[di]} ${h}:00 - ${count} check-ins`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
