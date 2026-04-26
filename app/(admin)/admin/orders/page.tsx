'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getAllOrders, updateOrderStatus } from '@/lib/db'
import { createSupabaseClient } from '@/lib/supabase/supabase'
import type { Order } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function OrdersContent() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/shop')
        return
      }

      const ordersData = await getAllOrders()
      setOrders(ordersData)
      setLoading(false)
    }

    loadOrders()
  }, [router])

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId)
    const updated = await updateOrderStatus(orderId, newStatus)
    if (updated) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    }
    setUpdating(null)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-green-600  text-white ',
    baking: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const statusOptions: Order['status'][] = ['pending', 'confirmed', 'baking', 'out_for_delivery', 'delivered', 'cancelled']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Image
            src="/young-baker-holding-some-bread-talking-mobile.jpg"
            alt="y"
            width={500}   // fixed width
            height={500}  // fixed height
            className="object-cover rounded-md duration-1000 ease-in-out animate-pulse"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur border-b ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/admin" className="p-2 ">
            <ArrowLeft className="w-6 h-6 " />
          </Link>
          <h1 className="text-2xl  font-heading ">Manage Orders</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-4 gap-4 items-start">
                      <div>
                        <p className="text-xs text-gray-500  uppercase font-semibold mb-1">
                          Order ID
                        </p>
                        <p className=" font-sans font-medium text-sm ">
                          {order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                          Customer
                        </p>
                        <p className="font-semibold uppercase text-xs text-gray-900 0">{order.customer_name}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                          Date
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                          Total
                        </p>
                        <p className="text-2xl font-bold ">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">Items</p>
                      <div className="text-sm space-y-1">
                        {order.order_items?.map((item: any, idx: number) => (
                          <p key={idx} className="text-gray-700 dark:text-gray-300">
                            {item.product_name} × {item.quantity} — ${item.subtotal.toFixed(2)}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                        Delivery Address
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_address}</p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center gap-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                          Status
                        </p>
                        <Badge className={`${statusColors[order.status]} rounded-md p-2`}>
                          {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
                        </Badge>
                      </div>

                      <div className="ml-auto">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                          disabled={updating === order.id}
                        >

                          <SelectTrigger className="w-40 rounded-md shadow-md">

                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>

                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
                                </SelectItem>
                              ))}
                            </SelectGroup>

                          </SelectContent>
                        </Select>
                      </div>
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

export default function OrdersAdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div></div>}>
      <OrdersContent />
    </Suspense>
  )
}
