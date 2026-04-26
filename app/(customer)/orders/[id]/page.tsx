'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrderById } from '@/lib/db'
import type { OrderItem } from '@/lib/types'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      const orderData = await getOrderById(orderId)
      if (!orderData) {
        router.push('/orders')
        return
      }
      setOrder(orderData)
      setLoading(false)
    }

    loadOrder()
  }, [orderId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Order not found</p>
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
          <Link href="/orders" className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition">
            <ArrowLeft className="w-6 h-6 text-amber-900 dark:text-amber-100" />
          </Link>
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">Order Details</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {order.status === 'pending' && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="pt-6 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">Order Received!</p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Thank you for your order. We&apos;re preparing your fresh baked goods!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Order Status */}
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={statusColors[order.status] || ''}>
                {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
              </Badge>
            </CardContent>
          </Card>

          {/* Order Number */}
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="text-lg">Order Number</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-sm break-all">{order.id.slice(0, 8).toUpperCase()}...</p>
            </CardContent>
          </Card>

          {/* Order Date */}
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="text-lg">Order Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Information */}
        <Card className="mb-8 border-amber-200 dark:border-amber-900">
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recipient</p>
              <p className="font-semibold">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Delivery Address</p>
              <p className="font-semibold">{order.delivery_address}</p>
            </div>
            {order.special_instructions && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Special Instructions</p>
                <p className="text-sm">{order.special_instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-8 border-amber-200 dark:border-amber-900">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items?.map((item: OrderItem, index: number) => (
                <div key={item.id || index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">${item.product_price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
              <span>${order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
              <span className="font-semibold text-lg">Total</span>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link href="/orders" className="flex-1">
            <Button variant="outline" className="w-full border-amber-200 dark:border-amber-900">
              Back to Orders
            </Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
