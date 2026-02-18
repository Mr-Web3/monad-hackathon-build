'use client'

import { OrderCreateCard, OrderViewerCard, RecentOrdersList } from '@/components/vwap'
import { ContractLiveFeed } from '@/src/components/LiveFeed'
import { NetworkHelpers } from '@/src/components/NetworkHelpers'
import { useCreateOrder } from '@/src/hooks/useVWAPDemoWrites'

export function HomePage() {
  const {
    createOrder,
    isPending,
    isConfirming,
    orderIdFromReceipt,
    txHash,
    error,
    reset,
  } = useCreateOrder()

  const handleCreateOrder = (totalAmount: number | bigint, numSlices: number) => {
    createOrder(totalAmount, numSlices)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">VWAP Demo</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Create orders and execute slices. View an order by ID to run slices in any order (or in
        parallel).
      </p>

      <NetworkHelpers latestTxHash={txHash} className="mt-2" />

      <div className="grid gap-6 lg:grid-cols-2">
        <OrderCreateCard
          createOrder={handleCreateOrder}
          isPending={isPending}
          isConfirming={isConfirming}
          orderIdFromReceipt={orderIdFromReceipt}
          txHash={txHash}
          error={error}
          onReset={reset}
        />
        <OrderViewerCard />
      </div>

      <RecentOrdersList />

      <ContractLiveFeed maxHeight="14rem" />
    </div>
  )
}
