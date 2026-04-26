import { createSupabaseClient } from './supabase/supabase'
import type { CartItemWithProduct, Order, Product } from './types'

const getSupabase = () => {
  try {
    return createSupabaseClient()
  } catch (err) {
    console.error('Supabase initialization error:', err)
    throw err
  }
}

// PRODUCTS
export async function getProducts() {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('products').select('*').eq('is_available', true).order('created_at', { ascending: false })
    return (data as Product[]) || []
  } catch (err) {
    console.error('Error fetching products:', err)
    return []
  }
}

export async function getProductById(id: string) {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    return (data as Product) || null
  } catch (err) {
    console.error('Error fetching product:', err)
    return null
  }
}

export async function getAllProductsAdmin() {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    return (data as Product[]) || []
  } catch (err) {
    console.error('Error fetching products:', err)
    return []
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('products').insert([product]).select().single()
    return (data as Product) || null
  } catch (err) {
    console.error('Error creating product:', err)
    return null
  }
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('products').update(product).eq('id', id).select().single()
    return (data as Product) || null
  } catch (err) {
    console.error('Error updating product:', err)
    return null
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = getSupabase()
    await supabase.from('products').delete().eq('id', id)
    return true
  } catch (err) {
    console.error('Error deleting product:', err)
    return false
  }
}

// CART
export async function getCartItems(userId: string): Promise<CartItemWithProduct[]> {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('cart_items').select('*, products(*)').eq('user_id', userId).order('created_at', { ascending: false })
    return (data as CartItemWithProduct[]) || []
  } catch (err) {
    console.error('Error fetching cart items:', err)
    return []
  }
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  try {
    const supabase = getSupabase()
    const { data: existing } = await supabase.from('cart_items').select('*').eq('user_id', userId).eq('product_id', productId).single()

    if (existing) {
      return updateCartItem(existing.id, existing.quantity + quantity)
    }

    const { data } = await supabase.from('cart_items').insert([{ user_id: userId, product_id: productId, quantity }]).select().single()
    return data
  } catch (err) {
    console.error('Error adding to cart:', err)
    return null
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return removeCartItem(cartItemId)
    }

    const supabase = getSupabase()
    const { data } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId).select().single()
    return data
  } catch (err) {
    console.error('Error updating cart item:', err)
    return null
  }
}

export async function removeCartItem(cartItemId: string) {
  try {
    const supabase = getSupabase()
    await supabase.from('cart_items').delete().eq('id', cartItemId)
    return true
  } catch (err) {
    console.error('Error removing cart item:', err)
    return false
  }
}

export async function clearCart(userId: string) {
  try {
    const supabase = getSupabase()
    await supabase.from('cart_items').delete().eq('user_id', userId)
    return true
  } catch (err) {
    console.error('Error clearing cart:', err)
    return false
  }
}

// ORDERS
export async function createOrder(userId: string, customerName: string, customerEmail: string, deliveryAddress: string, subtotal: number, specialInstructions: string | null = null) {
  try {
    const deliveryFee = 5.0
    const totalAmount = subtotal + deliveryFee
    const supabase = getSupabase()

    const { data } = await supabase
      .from('orders')
      .insert([{ user_id: userId, customer_name: customerName, customer_email: customerEmail, delivery_address: deliveryAddress, subtotal, delivery_fee: deliveryFee, total_amount: totalAmount, special_instructions: specialInstructions }])
      .select()
      .single()

    return (data as Order) || null
  } catch (err) {
    console.error('Error creating order:', err)
    return null
  }
}

export async function addOrderItems(orderId: string, items: Array<{ productId: string; productName: string; productPrice: number; quantity: number }>) {
  try {
    const supabase = getSupabase()
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.productPrice,
      quantity: item.quantity,
      subtotal: item.productPrice * item.quantity,
    }))

    await supabase.from('order_items').insert(orderItems)
    return true
  } catch (err) {
    console.error('Error adding order items:', err)
    return false
  }
}

export async function getOrdersByUser(userId: string) {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', userId).order('created_at', { ascending: false })
    return data || []
  } catch (err) {
    console.error('Error fetching orders:', err)
    return []
  }
}

export async function getAllOrders() {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
    return data || []
  } catch (err) {
    console.error('Error fetching orders:', err)
    return []
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single()
    return (data as Order) || null
  } catch (err) {
    console.error('Error updating order status:', err)
    return null
  }
}

export async function getOrderById(orderId: string) {
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single()
    return data
  } catch (err) {
    console.error('Error fetching order:', err)
    return null
  }
}
