'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/main/Sidebar'
import Header from '@/components/main/Header'
import { AnimatedBackground, LightAnimatedBackground } from "@/components/ui/animated-background"
import { useTheme } from "next-themes"
import { UserProvider } from "@/contexts/UserContext"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    const savedState = localStorage.getItem('sidebarVisible')
    return savedState !== null ? JSON.parse(savedState) : false
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    return savedState !== null ? JSON.parse(savedState) : false
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    localStorage.setItem('sidebarVisible', JSON.stringify(isSidebarVisible))
  }, [isSidebarVisible])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible)
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed)

  return (
    <UserProvider>
      <div className="flex h-screen bg-white dark:bg-[#1a1a2e] relative">
        <div className="absolute inset-0 z-0">
          {theme === "dark" ? <AnimatedBackground /> : <LightAnimatedBackground />}
        </div>
        
        <div className="relative z-10 flex h-full w-full">
          <Sidebar 
            isVisible={isSidebarVisible} 
            isCollapsed={isSidebarCollapsed} 
          />
          
          <div className="flex flex-1 flex-col">
            <Header 
              toggleSidebar={toggleSidebar}
              toggleCollapse={toggleSidebarCollapse}
              isCollapsed={isSidebarCollapsed}
            />
            <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out p-6">
              {children}
            </main>
          </div>

          {isSidebarVisible && isMobile && (
            <div 
              className="fixed inset-0 bg-opacity-50 md:hidden z-20"
              onClick={toggleSidebar}
            />
          )}
        </div>
      </div>
    </UserProvider>
  )
}