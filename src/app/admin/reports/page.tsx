'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { useTransactions } from '@/hooks/useTransaction';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Reports page component
 * Shows sales trends and transaction details with date range filtering
 */
export default function ReportsPage() {
  /**
   * State for date range selection
   * Defaults to last 7 days
   */
  const [date, setDate] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  // Get transactions with increased page size for better data coverage
  const { query: transactionsQuery } = useTransactions(100);
  const transactions = transactionsQuery.data?.pages.flatMap(page => page.data) ?? [];

  /**
   * Process transactions data for chart and table
   * Groups transactions by date and calculates daily totals
   */
  const { chartData, tableData } = React.useMemo(() => {
    // Initialize dates in range with zero values
    const dailySales = new Map();
    let currentDate = new Date(date.from);
    while (currentDate <= date.to) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      dailySales.set(dateStr, {
        date: dateStr,
        totalSales: 0,
        numberOfTransactions: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate transactions by date
    transactions.forEach(transaction => {
      const transactionDate = format(new Date(transaction.issued_at), 'yyyy-MM-dd');
      if (dailySales.has(transactionDate)) {
        const existing = dailySales.get(transactionDate);
        dailySales.set(transactionDate, {
          ...existing,
          totalSales: existing.totalSales + transaction.total_amount,
          numberOfTransactions: existing.numberOfTransactions + 1,
        });
      }
    });

    // Convert to arrays and sort by date
    const data = Array.from(dailySales.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      chartData: data.map(item => ({
        ...item,
        date: format(new Date(item.date), 'dd/MM'),
      })),
      tableData: data,
    };
  }, [transactions, date.from, date.to]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1>Reports</h1>

        {/* Date Range Selector */}
        <div className="flex gap-4 items-end">
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-min justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(date.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="start"
              >
                <Calendar
                  mode="range"
                  defaultMonth={date.from}
                  selected={date}
                  onSelect={newDate =>
                    setDate({
                      from: newDate?.from ?? date.from,
                      to: newDate?.to ?? date.to,
                    })
                  }
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Sales Trend</h3>
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactionsQuery.isError ? (
                <div className="h-[300px] flex items-center justify-center text-red-500">Error loading chart data</div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        yAxisId="left"
                        tickFormatter={value => formatCurrency(value)}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                      />
                      <Tooltip formatter={(value: any, name: string) => (name === 'Total Sales' ? formatCurrency(value) : value)} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        name="Total Sales"
                        dot={{ fill: '#4F46E5' }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="numberOfTransactions"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Number of Transactions"
                        dot={{ fill: '#10B981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Details Table */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Transaction Details</h3>
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactionsQuery.isError ? (
                <div className="text-center text-red-500 p-4">Error loading data</div>
              ) : (
                <div className="rounded-lg border border-slate-200">
                  <table className="w-full border-collapse bg-white text-left text-slate-700">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-4 font-semibold text-neutral-900">Date</th>
                        <th className="px-4 py-4 font-semibold text-neutral-900">Total Sales</th>
                        <th className="px-4 py-4 font-semibold text-neutral-900">Number of Transactions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tableData.map(item => (
                        <tr
                          key={item.date}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                          <td className="px-4 py-4">{formatCurrency(item.totalSales)}</td>
                          <td className="px-4 py-4">{item.numberOfTransactions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
