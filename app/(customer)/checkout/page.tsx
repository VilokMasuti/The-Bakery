'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { addOrderItems, clearCart, createOrder, getCartItems } from '@/lib/db'
import { createSupabaseClient, supabase } from '@/lib/supabase/supabase'
import type { CartItemWithProduct } from '@/lib/types'
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function CheckoutContent() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form data
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  useEffect(() => {
    const loadCheckout = async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }

      const items = await getCartItems(user.id)
      if (items.length === 0) {
        router.push('/cart')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setEmail(profile.email || '')
      }

      setCartItems(items)
      setLoading(false)
    }

    loadCheckout()
  }, [router])

  const subtotal = cartItems.reduce((total, item) => {
    return total + item.products.price * item.quantity
  }, 0)

  const deliveryFee = 5.0
  const total = subtotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!fullName || !email || !address || !city || !zipCode) {
      setError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        setSubmitting(false)
        return
      }

      const deliveryAddress = `${address}, ${city}, ${zipCode}`

      // Create order
      const order = await createOrder(
        user.id,
        fullName,
        email,
        deliveryAddress,
        subtotal,
        specialInstructions || null
      )

      if (!order) {
        setError('Failed to create order')
        setSubmitting(false)
        return
      }

      // Add order items
      const orderItems = cartItems.map((item) => ({
        productId: item.product_id,
        productName: item.products.name,
        productPrice: item.products.price,
        quantity: item.quantity,
      }))

      const itemsAdded = await addOrderItems(order.id, orderItems)
      if (!itemsAdded) {
        setError('Failed to add items to order')
        setSubmitting(false)
        return
      }

      // Clear cart
      await clearCart(user.id)

      setSuccess(true)
      setTimeout(() => {
        router.push(`/orders/${order.id}`)
      }, 1500)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-amber-200 dark:border-amber-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/cart" className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition">
            <ArrowLeft className="w-6 h-6 text-amber-900 dark:text-amber-100" />
          </Link>
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">Checkout</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="border-amber-200 dark:border-amber-900">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
                <CardDescription>Please provide your delivery details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        Order placed successfully! Redirecting...
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name *</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        disabled={submitting}
                        className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email *</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={submitting}
                        className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Street Address *</label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street"
                      disabled={submitting}
                      className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City *</label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        disabled={submitting}
                        className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Zip Code *</label>
                      <Input
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="10001"
                        disabled={submitting}
                        className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Special Instructions</label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g., No nuts, gluten-free options, etc."
                      rows={4}
                      disabled={submitting}
                      className="w-full px-3 py-2 border border-amber-200 dark:border-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 h-auto"
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-amber-200 dark:border-amber-900">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.products.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.products.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 space-y-2 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
