'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getOrdersByUser } from '@/lib/db'
import { createSupabaseClient } from '@/lib/supabase/supabase'
import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function OrdersContent() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }

      const userOrders = await getOrdersByUser(user.id)
      setOrders(userOrders)
      setLoading(false)
    }

    loadOrders()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    baking: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-amber-200 dark:border-amber-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/shop" className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition">
            <ArrowLeft className="w-6 h-6 text-amber-900 dark:text-amber-100" />
          </Link>
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">My Orders</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No orders yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start shopping to place your first order!</p>
            <Link href="/shop">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition border-amber-200 dark:border-amber-900">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <Badge className={statusColors[order.status] || ''}>
                          {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="mt-2 border-amber-200 dark:border-amber-900">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div></div>}>
      <OrdersContent />
    </Suspense>
  )
}
