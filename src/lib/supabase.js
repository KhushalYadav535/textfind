import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

// For demo purposes, we'll use localStorage-based auth
// In production, replace with actual Supabase credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock auth functions for demo
export const auth = {
  async signUp(email, password) {
    // Mock signup - in production, use supabase.auth.signUp
    const user = {
      id: Date.now().toString(),
      email,
      created_at: new Date().toISOString()
    }
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isAuthenticated', 'true')
    return { user, error: null }
  },

  async signIn(email, password) {
    // Mock signin - in production, use supabase.auth.signInWithPassword
    const user = {
      id: Date.now().toString(),
      email,
      created_at: new Date().toISOString()
    }
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isAuthenticated', 'true')
    return { user, error: null }
  },

  async signOut() {
    // Mock signout - in production, use supabase.auth.signOut
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    return { error: null }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true'
  }
}
