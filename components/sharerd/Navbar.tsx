'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { supabase } from '@/lib/supabase/supabase'
import { LogOut, Menu, ShoppingCart, User, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface NavLink {
  href: string
  label: string
  icon?: ReactNode
}

export function Navbar() {

  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  //  Accept userId as parameter - no stale closure
  const loadCartCount = async (userId: string) => {
    const { data } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', userId)

    if (data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
    }
  }

  const loadUserData = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .single()

    setProfile(profile)
    setRole(profile?.role ?? 'customer')
    await loadCartCount(userId)
  }

  useEffect(() => {
    // Get user on mount
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUser(user)
        await loadUserData(user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event, !!session?.user)
        if (session?.user) {
          setUser(session.user)
          await loadUserData(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setRole(null)
          setCartCount(0)
        }
        setLoading(false)
      }
    )

    //  Listen for cart updates from ProductCard
    const handleCartUpdate = (e: Event) => {
      const userId = (e as CustomEvent).detail?.userId
      if (userId) {
        loadCartCount(userId)
      }
    }
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const handleLogout = async () => {
    try {
      console.log('Logging out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
        return
      }
      console.log('Logged out successfully')
      setMobileOpen(false)
      window.location.href = '/'
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const isAuthPage =
    pathname.includes('/signin') ||
    pathname.includes('/signup') ||
    pathname.includes('/signin') ||
    pathname.includes('/signup')

  const isAdminPage = pathname.includes('/admin')

  const customerLinks: NavLink[] = [
    { href: '/shop', label: 'Shop' },
    { href: '/orders', label: 'My Orders' },
    {
      href: '/cart',
      label: cartCount > 0 ? `Cart (${cartCount})` : 'Cart',
      icon: <ShoppingCart className="w-4 h-4" />
    },
  ]

  const publicLinks: NavLink[] = [
    { href: '/shop', label: 'Shop' },
  ]

  const adminLinks: NavLink[] = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
  ]

  const navLinks = isAdminPage ? adminLinks : (user ? customerLinks : publicLinks)

  const linkClass = (href: string) =>
    `text-sm font-heading font-light tracking-widest uppercase transition-colors duration-200 px-3 py-1.5 rounded-md
    ${pathname === href || (href !== '/admin' && pathname.startsWith(href))
      ? 'bg-neutral-100 text-neutral-900'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
    }`

  return (
    <nav className="w-full border-b border-stone-100 bg-white backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 animate-pulse" />
            <span className="font-heading uppercase font-light text-lg text-stone-900">
              The Bakery
            </span>
          </Link>

          {/* Desktop Nav */}
          {!loading && !isAuthPage && (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={linkClass(link.href)}
                      >
                        <span className="flex items-center gap-1.5">
                          {link.icon}
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-sm">
                        <p className="font-semibold">{profile?.full_name || 'Customer'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/signin">
                    <Button variant="ghost" size="sm"
                      className="font-heading font-light tracking-widest uppercase rounded-md duration-1000 cursor-pointer
                        text-black hover:bg-neutral-100 hover:text-neutral-900">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm"
                      className="font-heading font-light tracking-widest uppercase rounded-md duration-1000 cursor-pointer
                        bg-neutral-950 hover:bg-neutral-800 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu */}
          {!loading && !isAuthPage && (
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-stone-100">
                      <span className="font-heading uppercase font-light text-lg">
                        The Bakery
                      </span>
                      {user && (
                        <div className="mt-2">
                          <p className="font-semibold text-sm">
                            {profile?.full_name || 'Customer'}
                          </p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-4 space-y-1">
                      {user ? (
                        navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm
                              font-heading font-light tracking-widest uppercase transition-colors
                              ${pathname === link.href
                                ? 'bg-neutral-100 text-neutral-900'
                                : 'text-neutral-600 hover:bg-neutral-50'
                              }`}
                          >
                            {link.icon}
                            {link.label}
                          </Link>
                        ))
                      ) : (
                        <>
                          <Link href="/signin" onClick={() => setMobileOpen(false)}
                            className="flex items-center px-3 py-2.5 text-sm
                              font-heading font-light tracking-widest rounded-sm uppercase
                              text-neutral-600 cursor-pointer hover:rounded-md hover:bg-neutral-50">
                            Sign In
                          </Link>
                          <Link href="/signup" onClick={() => setMobileOpen(false)}
                            className="flex items-center px-3 py-2.5 rounded-md text-sm
                              font-heading font-light tracking-widest uppercase
                              text-neutral-600 hover:bg-neutral-50">
                            Get Started
                          </Link>
                        </>
                      )}
                    </div>

                    {user && (
                      <div className="p-4 border-t border-stone-100">
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}