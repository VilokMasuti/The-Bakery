'use client'

import { Navbar } from '@/components/sharerd/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrderById } from '@/lib/db'
import type { OrderItem } from '@/lib/types'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
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
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Image
            src="/young-baker-holding-some-bread-touching-transparent-screen.jpg"
            alt="y"
            width={500}   // fixed width
            height={500}  // fixed height
            className="object-cover rounded-md duration-1000 ease-in-out animate-pulse"
          />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen  bg-white  flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 font-heading ">Order not found</p>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-green-700 text-white ',
    baking: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {order.status === 'pending' && (
          <Card className="mb-8 shadow-md bg-white">
            <CardContent className="pt-6 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-neutral-900 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold font-heading text-neutral-950 ">Order Received!</p>
                <p className="text-sm text-neutral-600">
                  Thank you for your order. We&apos;re preparing your fresh baked goods!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Order Status */}
          <Card className="bg-white  shadow-mauve-50  rounded-md ">
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${statusColors[order.status]} rounded-md p-2 `}>
                {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
              </Badge>
            </CardContent>
          </Card>

          {/* Order Number */}
          <Card className="bg-white  shadow-mauve-50  rounded-md">
            <CardHeader>
              <CardTitle className="text-lg">Order Number</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="font-sora rounded-md p-3 text-sm break-all">{order.id.slice(0, 8).toUpperCase()}...</Badge>
            </CardContent>
          </Card>

          {/* Order Date */}
          <Card className="bg-white  shadow-mauve-50  rounded-md">
            <CardHeader>
              <CardTitle className="text-lg">Order Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-sm rounded-md p-3">{new Date(order.created_at).toLocaleDateString()}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Information */}
        <Card className="mb-8 bg-white  shadow-mauve-50  rounded-md">
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
        <Card className="mb-8 bg-white  shadow-mauve-50  rounded-md">
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
        <Card className="bg-white  shadow-mauve-50  rounded-md">
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
              <span className="font-semibold text-sm font-sans">Total - </span>
              <span className="text-2xl font-bold  text-black">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link href="/orders" className="flex-1">
            <Button variant="outline" className="w-full bg-neutral-900 shadow-md rounded-md duration-1000  ease-in-out  cursor-pointer text-white">
              Back to Orders
            </Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button className="w-full bg-neutral-900 shadow-md rounded-md  cursor-pointer text-white font-semibold">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
