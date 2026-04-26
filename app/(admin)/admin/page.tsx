'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase/supabase'
import type { Order, Product } from '@/lib/types'
import { BarChart3, LogOut, Package, ShoppingBag } from 'lucide-react'
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
  }, [router])

  // ✅ Use the shared supabase instance
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
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
    o => o.status?.toLowerCase() === 'pending'
  ).length

  const totalOrders = orders.length

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-heading font-light uppercase tracking-widest text-stone-900">
            🥐 Admin Dashboard
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {profile?.full_name || 'Admin'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">

          {/* Total Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-stone-500">In your inventory</p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-stone-500">All time orders</p>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pendingOrders}
              </div>
              <p className="text-xs text-stone-500">Awaiting confirmation</p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Products Management</CardTitle>
              <CardDescription>Add, edit, and manage your bakery items</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/products">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  Manage Products
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>View and update order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/orders">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  Manage Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  )
}