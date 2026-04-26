'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/supabase'
import { AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccess(decodeURIComponent(message))
    }
  }, [searchParams])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else if (data.user) {
        // Check user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/shop')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-Playfair_Display tracking-tight">Sign In</h1>
          <p className=" text-sm font-sora text-black">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <div className="border border-destructive bg-background p-3 rounded text-sm">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-destructive" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="border border-foreground bg-background p-3 rounded text-sm">
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}

              className=' rounded-md   shadow-md   !border-0 !ring-0 !outline-none focus:!border-0 focus:!ring-0 focus:!outline-none  '
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className=' rounded-md   shadow-md   !border-0 !ring-0 !outline-none focus:!border-0 focus:!ring-0 focus:!outline-none  '
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer  font-sora rounded-md bg-white text-black shadow-md border-0 outline-none ring-0 hover:bg-neutral-50 hover:border-0 hover:ring-0 hover:outline-none focus:bg-neutral-50 focus:border-0 focus:ring-0 focus:outline-none"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium underline hover:no-underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
