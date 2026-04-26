'use client'

import { Navbar } from '@/components/sharerd/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/supabase'
import type { Order, Product } from '@/lib/types'
import { BarChart3, Package, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/sign-in')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData?.role !== 'admin') {
        router.push('/shop')
        return
      }

      setProfile(profileData)

      loadOrdersAndProducts()
    }

    const loadOrdersAndProducts = async () => {
      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      setProducts(productsData ?? [])
      setOrders(ordersData ?? [])
      setLoading(false)
    }

    loadData()

    // Subscribe to real-time updates for orders
    const ordersChannel = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrdersAndProducts()
      })
      .subscribe()

    // Subscribe to real-time updates for products
    const productsChannel = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadOrdersAndProducts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(productsChannel)
    }
  }, [router])

  //  Use the shared supabase instance
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

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

  // AFTER (fixed - case insensitive comparison):
  const totalRevenue = orders
    .filter(o =>
      o.status?.toLowerCase() === 'confirmed' ||
      o.status?.toLowerCase() === 'delivered' ||
      o.status?.toLowerCase() === 'baking' ||
      o.status?.toLowerCase() === 'out_for_delivery'
    )
    .reduce((sum, o) => sum + o.total_amount, 0)

  const pendingOrders = orders.filter(
    o => !o.status || o.status?.toLowerCase() === 'pending'
  ).length

  const totalOrders = orders.length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">

          {/* Total Products */}
          <Card className=' bg-white'>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 duration-1000 ease-in-out animate-spin text-stone-500 shadow-md" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-stone-500">In your inventory</p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className='bg-white'>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-neutral-900" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-stone-500">All time orders</p>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className='bg-white'>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-neutral-900" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-800">
                {pendingOrders}
              </div>
              <p className="text-xs text-stone-500">Awaiting confirmation</p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className='bg-white'>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-stone-500">Confirmed + delivered</p>
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className='bg-white'>
            <CardHeader>
              <CardTitle>Products Management</CardTitle>
              <CardDescription>Add, edit, and manage your bakery items</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/products">
                <Button className=" rounded-md cursor-pointer  text-white">
                  Manage Products
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className=' bg-white'>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>View and update order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/orders">
                <Button className="  cursor-pointer rounded-md text-white">
                  Management
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  )
}