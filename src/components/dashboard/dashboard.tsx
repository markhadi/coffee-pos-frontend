'use client';

import MainLayout from '@/components/MainLayout';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { useTransactionStats, useTransactions } from '@/hooks/useTransaction';
import { Loader2 } from 'lucide-react';
import { StatisticCard } from '@/components/dashboard/StatisticCard';
import { SalesChart } from '@/components/dashboard/SalesChart';

/**
 * Dashboard page component
 * Shows sales statistics and transaction history
 */
export default function DashboardPage() {
  // Get transaction stats from custom hook
  const { todaySalesQuery, todayCountQuery, averageQuery, last7DaysQuery } = useTransactionStats();

  // Get transactions list with pagination
  const { query: transactionsQuery } = useTransactions(10);
  const transactions = transactionsQuery.data?.pages.flatMap(page => page.data) ?? [];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <h1>Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatisticCard
            label="Today's Sales"
            value={todaySalesQuery.data?.data ?? 0}
            isLoading={todaySalesQuery.isLoading}
            error={todaySalesQuery.isError}
            isCurrency={true}
          />
          <StatisticCard
            label="Today's Transactions"
            value={todayCountQuery.data?.data ?? 0}
            isLoading={todayCountQuery.isLoading}
            error={todayCountQuery.isError}
            isCurrency={false}
          />
          <StatisticCard
            label="Average Transaction"
            value={averageQuery.data?.data ?? 0}
            isLoading={averageQuery.isLoading}
            error={averageQuery.isError}
            isCurrency={true}
          />
        </div>

        {/* Sales Chart */}
        <div>
          <h2 className="text-[20px] font-bold text-neutral-900 mb-3">Last 7 Days Sales</h2>
          <SalesChart
            data={last7DaysQuery.data?.data}
            isLoading={last7DaysQuery.isLoading}
            isError={last7DaysQuery.isError}
          />
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-[20px] font-bold text-neutral-900 mb-3">Recent Transactions</h2>

          {transactionsQuery.isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : transactionsQuery.isError ? (
            <div className="text-center text-red-500 p-4">Error loading transactions</div>
          ) : (
            <TransactionTable
              data={transactions}
              fetchNextPage={transactionsQuery.fetchNextPage}
              isFetching={transactionsQuery.isFetchingNextPage}
              hasNextPage={transactionsQuery.hasNextPage ?? false}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
