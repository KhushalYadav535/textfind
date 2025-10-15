import { create } from 'zustand'

export const useAnalyticsStore = create((set, get) => ({
  // Visitor analytics
  totalVisitors: 0,
  todayVisitors: 0,
  weeklyVisitors: 0,
  monthlyVisitors: 0,
  
  // Page views
  totalPageViews: 0,
  todayPageViews: 0,
  
  // Real-time stats
  onlineUsers: 0,
  lastUpdated: new Date().toISOString(),
  
  // Geographic data
  topCountries: [
    { country: 'United States', visitors: 1250, flag: '🇺🇸' },
    { country: 'India', visitors: 980, flag: '🇮🇳' },
    { country: 'United Kingdom', visitors: 650, flag: '🇬🇧' },
    { country: 'Canada', visitors: 420, flag: '🇨🇦' },
    { country: 'Australia', visitors: 380, flag: '🇦🇺' }
  ],
  
  // Device analytics
  deviceStats: {
    desktop: 65,
    mobile: 30,
    tablet: 5
  },
  
  // Browser stats
  browserStats: {
    'Chrome': 45,
    'Safari': 25,
    'Firefox': 15,
    'Edge': 10,
    'Others': 5
  },
  
  // Traffic sources
  trafficSources: {
    'Direct': 40,
    'Google': 35,
    'Social Media': 15,
    'Referrals': 10
  },
  
  // Hourly activity
  hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    visitors: Math.floor(Math.random() * 50) + 10
  })),
  
  // Daily activity for last 7 days
  dailyActivity: [
    { day: 'Mon', visitors: 245 },
    { day: 'Tue', visitors: 312 },
    { day: 'Wed', visitors: 289 },
    { day: 'Thu', visitors: 356 },
    { day: 'Fri', visitors: 423 },
    { day: 'Sat', visitors: 298 },
    { day: 'Sun', visitors: 267 }
  ],

  // Actions
  incrementVisitor: () => {
    const now = new Date()
    const today = now.toDateString()
    
    // Get existing data
    const existing = JSON.parse(localStorage.getItem('analytics') || '{}')
    
    // Update visitor counts
    const newTotal = (existing.totalVisitors || 0) + 1
    const newToday = today === existing.lastVisitDate ? (existing.todayVisitors || 0) + 1 : 1
    const newWeekly = (existing.weeklyVisitors || 0) + 1
    const newMonthly = (existing.monthlyVisitors || 0) + 1
    
    // Save to localStorage
    const updatedData = {
      ...existing,
      totalVisitors: newTotal,
      todayVisitors: newToday,
      weeklyVisitors: newWeekly,
      monthlyVisitors: newMonthly,
      lastVisitDate: today,
      lastUpdated: now.toISOString()
    }
    
    localStorage.setItem('analytics', JSON.stringify(updatedData))
    
    // Update state
    set({
      totalVisitors: newTotal,
      todayVisitors: newToday,
      weeklyVisitors: newWeekly,
      monthlyVisitors: newMonthly,
      lastUpdated: now.toISOString()
    })
    
    return newTotal
  },
  
  incrementPageView: () => {
    const now = new Date()
    const today = now.toDateString()
    
    const existing = JSON.parse(localStorage.getItem('analytics') || '{}')
    
    const newTotal = (existing.totalPageViews || 0) + 1
    const newToday = today === existing.lastPageViewDate ? (existing.todayPageViews || 0) + 1 : 1
    
    const updatedData = {
      ...existing,
      totalPageViews: newTotal,
      todayPageViews: newToday,
      lastPageViewDate: today
    }
    
    localStorage.setItem('analytics', JSON.stringify(updatedData))
    
    set({
      totalPageViews: newTotal,
      todayPageViews: newToday
    })
  },
  
  init: () => {
    const existing = JSON.parse(localStorage.getItem('analytics') || '{}')
    
    // Initialize with existing data or defaults
    set({
      totalVisitors: existing.totalVisitors || 1247,
      todayVisitors: existing.todayVisitors || 89,
      weeklyVisitors: existing.weeklyVisitors || 623,
      monthlyVisitors: existing.monthlyVisitors || 2156,
      totalPageViews: existing.totalPageViews || 8942,
      todayPageViews: existing.todayPageViews || 234,
      lastUpdated: existing.lastUpdated || new Date().toISOString()
    })
    
    // Increment visitor count on app load
    get().incrementVisitor()
  },
  
  reset: () => {
    localStorage.removeItem('analytics')
    set({
      totalVisitors: 0,
      todayVisitors: 0,
      weeklyVisitors: 0,
      monthlyVisitors: 0,
      totalPageViews: 0,
      todayPageViews: 0,
      lastUpdated: new Date().toISOString()
    })
  }
}))
