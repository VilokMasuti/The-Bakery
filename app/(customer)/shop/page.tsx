"use client"


import { Navbar } from "@/components/sharerd/Navbar"
import { ProductCard } from "@/components/sharerd/ProductCard"
import { getCurrentProfile, getCurrentUser } from "@/lib/auth"
import { getProducts } from "@/lib/db"
import type { Product } from '@/lib/types'
import Image from "next/image"
import { Suspense, useEffect, useState } from 'react'

const ShopContent = () => {

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      const currentProfile = await getCurrentProfile()
      setUser(currentUser)
      setProfile(currentProfile)
      const productsData = await getProducts()
      setProducts(productsData)
      setLoading(false)



    }


    loadData()
  }, [])


  const categories = ['all', ...new Set(products.map((p) => p.category))]
  const filteredProducts = selectedCategory === 'all' ? products : products.filter((p) => p.category === selectedCategory)
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight font-heading uppercase ">Shop</h2>
          <p className="text-sm text-neutral-500 max-w-2xl">
            Fresh baked goods delivered to your door.
          </p>
        </div>
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 cursor-pointer py-1.5 rounded text-sm font-medium transition ${selectedCategory === cat
                ? 'bg-foreground text-background'
                : 'border border-border text-foreground hover:bg-secondary'
                }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No products in this category</p>
          </div>
        )}
      </main>

    </div>
  )

}



export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading fresh baked goods...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
