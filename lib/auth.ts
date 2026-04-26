import { supabase } from './supabase/supabase'
import type { Profile } from './types'

export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { user: data.user, error }
  } catch (error) {
    return { user: null, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user: data.user, session: data.session, error }
  } catch (error) {
    return { user: null, session: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return error
  } catch (error) {
    return error
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const profile = await getCurrentProfile()
    return profile?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
