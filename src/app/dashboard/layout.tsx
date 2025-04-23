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
    // Load initial visibility state from localStorage
    const savedState = localStorage.getItem('sidebarVisible')
    return savedState !== null ? JSON.parse(savedState) : false
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load initial collapsed state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed')
    return savedState !== null ? JSON.parse(savedState) : false
  })
  const [isMobile, setIsMobile] = useState(false)

  // Save sidebar visibility state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarVisible', JSON.stringify(isSidebarVisible))
  }, [isSidebarVisible])

  // Save sidebar collapsed state to localStorage whenever it changes
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
      <div className="flex h-screen overflow-hidden bg-white dark:bg-[#1a1a2e] relative">
        <div className="absolute inset-0 z-0">
          {theme === "dark" ? <AnimatedBackground /> : <LightAnimatedBackground />}
        </div>
        
        <div className="relative z-10 flex h-full w-full">
          <Sidebar 
            isVisible={isSidebarVisible} 
            isCollapsed={isSidebarCollapsed} 
            setIsCollapsed={setIsSidebarCollapsed}
          />
          
          <div className="flex flex-1 flex-col">
            <Header 
              toggleSidebar={toggleSidebar}
              toggleCollapse={toggleSidebarCollapse}
              isCollapsed={isSidebarCollapsed}
            />
            <main className="flex-1 overflow-hidden transition-all duration-300 ease-in-out p-6">
              {children}
            </main>
          </div>

          {/* Mobile overlay */}
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