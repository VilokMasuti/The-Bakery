'use client'

import { Navbar } from '@/components/sharerd/Navbar'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">

      <Navbar />

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="space-y-8 max-w-3xl">

            {/* Tag line */}
            <p className="text-amber-900 text-sm font-medium font-heading tracking-widest uppercase">
              Freshly baked every morning
            </p>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl font-heading lg:text-7xl  text-stone-900 leading-tight font-light uppercase">
              Artisan Baked
              <br />
              <span className="text-amber-700 pl-22">Goods</span> Delivered
            </h1>

            {/* Subtitle */}
            <p className="text-sm font-sora text-stone-700 max-w-xl leading-relaxed">
              Handcrafted pastries, artisan breads, and decadent
              cakes made fresh daily from the finest ingredients.
              Delivered straight to your door.
            </p>

            {/* CTA Buttons */}
            {!loading && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {user ? (
                  /* Logged in → go to shop */
                  <Link href="/shop">
                    <Button
                      size="lg"
                      className="bg-amber-700 hover:bg-amber-800 rounded-md  text-white px-8 cursor-pointer duration-1000"
                    >
                      Browse Our Menu
                    </Button>
                  </Link>
                ) : (
                  /* Not logged in → sign up or sign in */
                  <>
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className="bg-neutral-950 rounded-md hover:bg-neutral-800 text-white px-8 cursor-pointer duration-1000"
                      >
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/signin">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-stone-300 rounded-md text-stone-700 px-8 cursor-pointer hover:bg-stone-200 duration-1000"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-stone-400">
          ©Vilok The Bakery. All rights reserved.
        </div>
      </footer>

    </div>
  )
}