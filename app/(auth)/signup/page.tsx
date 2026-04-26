'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/supabase'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // trigger picks this up automatically
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {

        router.push('/signin')
      }

    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-stone-900">
            The Bakery
          </h1>
          <p className="text-stone-500 text-sm">
            Create your account to start ordering
          </p>
        </div>

        {/* Form */}
        <div className=" p-6   ">
          <form onSubmit={handleSignUp} className="space-y-4">

            {/* Error */}
            {error && (
              <div className="border border-red-200 bg-red-50 p-3 rounded-lg text-sm flex gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className=" ">
              <label htmlFor="fullName" className="text-sm font-medium  text-neutral-800">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className=' rounded-md   shadow-md   !border-0 !ring-0 !outline-none focus:!border-0 focus:!ring-0 focus:!outline-none  '
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-stone-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className=' rounded-md   shadow-md  !border-0 !ring-0 !outline-none focus:!border-0 focus:!ring-0 focus:!outline-none  '
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-stone-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className=' rounded-md   shadow-md  !border-0 !ring-0 !outline-none focus:!border-0 focus:!ring-0 focus:!outline-none  '
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className=' rounded-md   shadow-md !border-0 !ring-0 !outline-none focus:!border-0 focus:!ring-0 focus:!outline-none  '
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-md bg-white text-black shadow-md border-0 outline-none ring-0 hover:bg-neutral-50 hover:border-0 hover:ring-0 hover:outline-none focus:bg-neutral-50 focus:border-0 focus:ring-0 focus:outline-none"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>


          </form>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="text-black font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}