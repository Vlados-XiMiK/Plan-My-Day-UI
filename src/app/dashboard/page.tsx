'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import MainContent from './tasks/page'
import CalendarView from './calendar/page'
import StatsView from './stats/page'
import Profile from './profile/page'
import Categories from './categories/page'

export default function DashboardPage() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/dashboard') {
      router.replace('/dashboard/tasks')
    }
  }, [pathname, router])

  if (pathname === '/dashboard/tasks') return <MainContent />
  if (pathname === '/dashboard/calendar') return <CalendarView />
  if (pathname === '/dashboard/stats') return <StatsView />
  if (pathname === '/dashboard/profile') return <Profile />
  if (pathname === '/dashboard/categories') return <Categories />

  return null
}