import { create } from 'zustand'

export const useUserStore = create((set, get) => ({
  profile: null,
  subscription: null,
  usage: {
    monthlyUploads: 0,
    monthlyLimit: 100,
    totalUploads: 0,
    storageUsed: 0,
    storageLimit: 1024 // MB
  },
  preferences: {
    defaultLanguage: 'eng',
    autoSave: true,
    theme: 'dark',
    notifications: true
  },

  updateProfile: (profile) => {
    set({ profile })
    localStorage.setItem('userProfile', JSON.stringify(profile))
  },

  updateSubscription: (subscription) => {
    set({ subscription })
    localStorage.setItem('userSubscription', JSON.stringify(subscription))
  },

  updateUsage: (usage) => {
    set({ usage })
    localStorage.setItem('userUsage', JSON.stringify(usage))
  },

  updatePreferences: (preferences) => {
    set({ preferences })
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
  },

  incrementUsage: () => {
    const { usage } = get()
    const newUsage = {
      ...usage,
      monthlyUploads: usage.monthlyUploads + 1,
      totalUploads: usage.totalUploads + 1
    }
    set({ usage: newUsage })
    localStorage.setItem('userUsage', JSON.stringify(newUsage))
  },

  init: () => {
    const profile = JSON.parse(localStorage.getItem('userProfile') || 'null')
    const subscription = JSON.parse(localStorage.getItem('userSubscription') || 'null')
    const usage = JSON.parse(localStorage.getItem('userUsage') || 'null')
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || 'null')

    if (profile) set({ profile })
    if (subscription) set({ subscription })
    if (usage) set({ usage })
    if (preferences) set({ preferences })
  }
}))
