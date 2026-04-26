'use client'

import { Navbar } from '@/components/sharerd/Navbar'
import { Button } from '@/components/ui/button'
import { getCartItems, removeCartItem, updateCartItem } from '@/lib/db'
import { createSupabaseClient } from '@/lib/supabase/supabase'
import type { CartItemWithProduct } from '@/lib/types'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function CartContent() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const loadCart = async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }

      const items = await getCartItems(user.id)
      setCartItems(items)
      setLoading(false)
    }

    loadCart()
  }, [router])

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdating(itemId)
    await updateCartItem(itemId, newQuantity)
    const updated = cartItems.filter((item) => item.id !== itemId)
    if (newQuantity > 0) {
      const item = cartItems.find((item) => item.id === itemId)
      if (item) {
        updated.push({ ...item, quantity: newQuantity })
      }
    }
    setCartItems(updated)
    setUpdating(null)
    // Dispatch event to update navbar cart count
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId)
    await removeCartItem(itemId)
    setCartItems(cartItems.filter((item) => item.id !== itemId))
    setUpdating(null)
    // Dispatch event to update navbar cart count
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const subtotal = cartItems.reduce((total, item) => {
    return total + item.products.price * item.quantity
  }, 0)

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


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Start by adding some fresh baked goods</p>
            <Link href="/shop">
              <Button className=' rounded-md'>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className=" shadow-md border border-border rounded-lg p-6">
                <h2 className="font-semibold mb-6">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border shadow-md p-2 last:border-b-0 last:pb-0">
                      <div className="relative ml-2.5 w-20 h-20 bg-secondary rounded shrink-0">
                        {item.products.image_url ? (
                          <Image
                            src={item.products.image_url}
                            alt={item.products.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            <Image
                              src='/b.jpg'
                              alt={'b'}
                              fill
                              className=" object-cover group-hover:scale-105 transition-transform duration-300"


                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold">{item.products.name}</h3>
                        <p className="font-semibold">${item.products.price.toFixed(2)}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id}
                            className="p-1 hover:bg-secondary rounded disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 border border-border rounded text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="p-1 hover:bg-secondary rounded disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          ${(item.products.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={updating === item.id}
                          className="mt-2 p-2 text-destructive hover:bg-secondary rounded disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 shadow-md border border-border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Delivery</span>
                    <span>$5.00</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">
                      ${(subtotal + 5).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href="/checkout" className="block">
                    <Button className="w-full rounded-md cursor-pointer">
                      Checkout
                    </Button>
                  </Link>

                  <Link href="/shop" className="block">
                    <Button variant="outline" className="w-full rounded-md cursor-pointer">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    }>
      <CartContent />
    </Suspense>
  )
}
