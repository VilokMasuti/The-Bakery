export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'customer'
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_available: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string | null
  customer_name: string
  delivery_address: string
  status: 'pending' | 'confirmed' | 'baking' | 'out_for_delivery' | 'delivered' | 'cancelled'
  subtotal: number
  delivery_fee: number
  total_amount: number
  special_instructions: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  created_at: string
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}

export type CartItemWithProduct = CartItem & {
  products: Product
}
