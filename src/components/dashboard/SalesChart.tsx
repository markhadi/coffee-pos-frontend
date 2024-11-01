import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DailySales } from '@/types/transaction';

/**
 * Props for SalesChart component
 */
interface SalesChartProps {
  data?: DailySales[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Sales chart component with loading and error states
 * Displays daily sales data in a line chart
 */
export function SalesChart({ data, isLoading, isError }: SalesChartProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <div className="h-[300px] flex items-center justify-center text-red-500">Error loading chart data</div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={value => value}
              />
              <YAxis
                tickFormatter={value => formatCurrency(value)}
                domain={[0, 'auto']}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={label => label}
              />
              <Line
                type="monotone"
                dataKey="totalSale"
                name="Sales"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ fill: '#4F46E5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
