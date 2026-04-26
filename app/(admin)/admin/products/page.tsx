'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createProduct, deleteProduct, getAllProductsAdmin, updateProduct } from '@/lib/db'
import { createSupabaseClient } from '@/lib/supabase/supabase'
import type { Product } from '@/lib/types'
import { AlertCircle, ArrowLeft, Edit2, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function ProductsContent() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'cakes',
    stock_quantity: '',
    image_url: '',
    is_available: true,
  })

  useEffect(() => {
    const loadProducts = async () => {
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

      const productsData = await getAllProductsAdmin()
      setProducts(productsData)
      setLoading(false)
    }

    loadProducts()
  }, [router])

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock_quantity: product.stock_quantity.toString(),
        image_url: product.image_url,
        is_available: product.is_available,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'cakes',
        stock_quantity: '',
        image_url: '',
        is_available: true,
      })
    }
    setError('')
    setSuccess('')
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.description || !formData.price || !formData.stock_quantity) {
      setError('Please fill in all required fields')
      return
    }

    try {
      if (editingId) {
        const updated = await updateProduct(editingId, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: formData.image_url,
          is_available: formData.is_available,
        })

        if (updated) {
          setProducts(products.map((p) => (p.id === editingId ? updated : p)))
          setSuccess('Product updated successfully!')
        }
      } else {
        const created = await createProduct({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: formData.image_url,
          is_available: formData.is_available,
        })

        if (created) {
          setProducts([created, ...products])
          setSuccess('Product created successfully!')
        }
      }

      setTimeout(() => {
        setIsDialogOpen(false)
      }, 1000)
    } catch (err) {
      setError('Failed to save product')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setDeleting(id)
    const success = await deleteProduct(id)
    if (success) {
      setProducts(products.filter((p) => p.id !== id))
    }
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-amber-200 dark:border-amber-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition">
              <ArrowLeft className="w-6 h-6 text-amber-900 dark:text-amber-100" />
            </Link>
            <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">Manage Products</h1>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg border-amber-200 dark:border-amber-900">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>Fill in the details below</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Chocolate Cake"
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product"
                    rows={3}
                    className="w-full px-3 py-2 border border-amber-200 dark:border-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="9.99"
                      className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock *</label>
                    <Input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="10"
                      className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-amber-200 dark:border-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="cakes">Cakes</option>
                    <option value="pastries">Pastries</option>
                    <option value="breads">Breads</option>
                    <option value="muffins">Muffins</option>
                    <option value="cookies">Cookies</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="rounded border-amber-200"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium">
                    Available for purchase
                  </label>
                </div>

                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                  {editingId ? 'Update Product' : 'Create Product'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">No products yet. Add your first product!</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Product
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-amber-200 dark:border-amber-900">
                <div className="relative w-full h-40 bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  {product.image_url && !imageErrors.has(product.id) ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={() => setImageErrors(prev => new Set([...prev, product.id]))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🧁</div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-amber-900 dark:text-amber-100">{product.name}</CardTitle>
                  <CardDescription className="text-xs">{product.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-2 py-1 rounded">
                      Stock: {product.stock_quantity}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => handleOpenDialog(product)}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-amber-200 dark:border-amber-900"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg border-amber-200 dark:border-amber-900">
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                          <DialogDescription>Update product details</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-4">
                          {error && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          )}

                          {success && (
                            <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                              <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                            </Alert>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name *</label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="e.g., Chocolate Cake"
                              className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description *</label>
                            <textarea
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Describe your product"
                              rows={3}
                              className="w-full px-3 py-2 border border-amber-200 dark:border-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Price *</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="9.99"
                                className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Stock *</label>
                              <Input
                                type="number"
                                value={formData.stock_quantity}
                                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                placeholder="10"
                                className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-3 py-2 border border-amber-200 dark:border-amber-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                            >
                              <option value="cakes">Cakes</option>
                              <option value="pastries">Pastries</option>
                              <option value="breads">Breads</option>
                              <option value="muffins">Muffins</option>
                              <option value="cookies">Cookies</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Image URL</label>
                            <Input
                              value={formData.image_url}
                              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is_available"
                              checked={formData.is_available}
                              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                              className="rounded border-amber-200"
                            />
                            <label htmlFor="is_available" className="text-sm font-medium">
                              Available for purchase
                            </label>
                          </div>

                          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                            Update Product
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div></div>}>
      <ProductsContent />
    </Suspense>
  )
}
