import { Card } from '@/components/ui/Card';
import { useVenueStats } from '@/hooks/useVenueStats';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

interface CheckinChartProps {
  venueId: string;
  days?: number;
}

export function CheckinChart({ venueId, days = 30 }: CheckinChartProps) {
  const { stats, isLoading } = useVenueStats(venueId, days);

  const chartData = stats.map(s => ({
    date: format(parseISO(s.date), 'MMM d'),
    checkins: s.total_checkins,
    unique: s.unique_visitors,
  }));

  return (
    <Card className="space-y-4">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Check-ins ({days} days)
      </h3>

      {isLoading ? (
        <div className="h-64 bg-gray-800 rounded animate-pulse" />
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          No data yet. Check-ins will appear here.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.75rem',
                color: '#F3F4F6',
              }}
            />
            <Line
              type="monotone"
              dataKey="checkins"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              name="Total"
            />
            <Line
              type="monotone"
              dataKey="unique"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Unique"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
