'use client'

import { Navbar } from '@/components/sharerd/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getOrdersByUser } from '@/lib/db'
import { createSupabaseClient } from '@/lib/supabase/supabase'
import { Clock } from 'lucide-react'
import Image from 'next/image'
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
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-green-500 text-black',
    baking: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    out_for_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <div className="min-h-screen bg-white ">
      {/* Header */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No orders yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-heading">Start shopping to place your first order!</p>
            <Link href="/shop">
              <Button className="bg-neutral-950 hover:bg-neutral-800 rounded-md text-white ">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className=" bg-white shadow-md rounded-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold  text-black font-sans">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <Badge className={`rounded-md p-1 ${statusColors[order.status]}`}>
                          {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700  mb-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-700">
                        {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="  flex flex-wrap flex-col items-center justify-center gap-1.5">
                      <p className="text-2xl  text-black">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className=" mt-3  text-black cursor-pointer">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
        }
      </main >
    </div >
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
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
    }>
      <OrdersContent />
    </Suspense>
  )
}
