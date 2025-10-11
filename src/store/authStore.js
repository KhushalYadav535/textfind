import { create } from 'zustand'
import { auth } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  init: () => {
    const user = auth.getCurrentUser()
    const isAuthenticated = auth.isAuthenticated()
    set({ user, isAuthenticated })
  },

  signUp: async (email, password) => {
    set({ isLoading: true })
    try {
      const { user, error } = await auth.signUp(email, password)
      if (error) throw error
      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true })
    try {
      const { user, error } = await auth.signIn(email, password)
      if (error) throw error
      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },

  signOut: async () => {
    set({ isLoading: true })
    try {
      await auth.signOut()
      set({ user: null, isAuthenticated: false, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  }
}))
