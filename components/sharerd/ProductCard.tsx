'use client'

import { supabase } from "@/lib/supabase/supabase"
import { Product } from "@/lib/types"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "../ui/button"

export const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = async () => {
    // Check user FIRST before setting loading
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/sign-in')
      return
    }

    setAdding(true)

    try {
      // Check if already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id)

        if (error) {
          console.error('Update error:', error.message)
          return
        }
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          })

        if (error) {
          console.error('Insert error:', error.message)
          return
        }
      }

      // ✅ Fire event WITH userId
      window.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: { userId: user.id }
        })
      )

      setAdded(true)
      setTimeout(() => setAdded(false), 2000)

    } catch (err) {
      console.error('Add to cart failed:', err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {product.image_url && !imageError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🧁
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.stock_quantity > 0
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {product.stock_quantity > 0
              ? `${product.stock_quantity} left`
              : 'Out of stock'
            }
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>

        <span className="text-2xl font-bold text-amber-600">
          ${product.price.toFixed(2)}
        </span>

        <Button
          onClick={handleAddToCart}
          disabled={adding || added || product.stock_quantity === 0}
          className={`w-full h-12 text-base font-semibold transition-all duration-200 ${added
            ? 'bg-green-600 hover:bg-green-600 text-white'
            : product.stock_quantity === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
        >
          {added ? '✓ Added to Cart'
            : adding ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </span>
            )
              : product.stock_quantity === 0 ? 'Out of Stock'
                : 'Add to Cart'
          }
        </Button>
      </div>
    </div>
  )
}