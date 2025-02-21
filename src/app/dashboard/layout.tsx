
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/main/Sidebar'
import Header from '@/components/main/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#8f31f2] to-[#e0dee1]">
      <Sidebar isVisible={isSidebarVisible} isCollapsed={isSidebarCollapsed} />
      
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
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}