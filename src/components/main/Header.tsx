"use client"

import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { LogOut, Menu, ChevronDown, User2, Settings } from "lucide-react"
import { format } from "date-fns"
import { uk, enUS } from "date-fns/locale"
import { useUser } from "@/contexts/UserContext"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"
import SettingsPopup from "@/components/main/pop-up/SettingsPopup"
import Avatar from "@/components/ui/Avatar"
import { logoutUser } from "@/api/auth"
import { useNotification } from "@/contexts/notification-context"

interface HeaderProps {
  toggleSidebar: () => void
  toggleCollapse: () => void
  isCollapsed: boolean
  onProfileClick?: () => void
}

export default function Header({ toggleSidebar, toggleCollapse, isCollapsed, onProfileClick }: HeaderProps) {
  const { t } = useTranslation(["welcome_main", "notification"])
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const { user } = useUser()
  const { addNotification } = useNotification()
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  const locale = t("language") === "ua" ? uk : enUS
  const now = new Date()

  const dateFormat = t("language") === "ua"
    ? isDesktop ? "EEEE, MMMM d, yyyy · HH:mm" : "d MMMM yyyy · HH:mm"
    : isDesktop ? "EEEE, MMMM d, yyyy 'at' h:mm a" : "MMM d, yyyy 'at' h:mm a"
  let formattedDate = format(now, dateFormat, { locale })

  if (t("language") === "ua") {
    formattedDate = formattedDate
      .split(", ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(", ")
  }

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem("theme") || theme
      setIsDarkTheme(savedTheme === "dark")
    }
    updateTheme()
    window.addEventListener("storage", (e) => e.key === "theme" && updateTheme())
    return () => window.removeEventListener("storage", () => {})
  }, [theme])

  useEffect(() => {
    const updateIsDesktop = () => setIsDesktop(window.innerWidth >= 768)
    updateIsDesktop()
    window.addEventListener("resize", updateIsDesktop)
    return () => window.removeEventListener("resize", updateIsDesktop)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const userName = user?.name || t("unknownUser")

  const handleLogout = async () => {
    try {
      await logoutUser()
      addNotification('success', t('notifications:logoutSuccessTitle'), t('notifications:logoutSuccessMessage'))
      router.replace('/auth/login')
    } catch (error: any) {
      console.error('Logout error:', error)
      addNotification('error', t('notifications:logoutErrorTitle'), error.message || t('notifications:logoutErrorMessage'))
      router.replace('/auth/login')
    }
    setShowDropdown(false)
  }

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 items-center justify-between px-4 transition-colors duration-300
        ${isDarkTheme
          ? "bg-gradient-to-b from-purple-950 to-gray-900 border-b border-purple-900"
          : "bg-gradient-to-b from-gray-100 to-gray-200 sm:bg-gradient-to-b sm:from-gray-50 sm:to-beige-100 border-b border-gray-300 sm:border-gray-200"}`}
    >
      <button
        onClick={isDesktop ? toggleCollapse : toggleSidebar}
        className={`p-2 rounded-full ${isDarkTheme ? "hover:bg-purple-800/50 text-gray-100" : "hover:bg-gray-300/50 sm:hover:bg-gray-200/50 text-gray-900 sm:text-gray-800"}`}
        aria-label={isDesktop ? (isCollapsed ? t("expandSidebar") : t("collapseSidebar")) : t("toggleSidebar")}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1 flex justify-center mx-2">
        <div className={`inline-block rounded-full px-3 py-1 shadow-md max-w-full overflow-hidden
          ${isDarkTheme ? "bg-[#2a2a3e]" : "bg-white sm:bg-white/80"}`}>
          <h2
            className={`font-semibold whitespace-nowrap overflow-hidden text-ellipsis
              ${isDarkTheme ? "text-gray-100" : "text-gray-900 sm:text-gray-800"}
              ${isDesktop ? "text-lg" : "text-sm"}`}
          >
            {t("myDay")} · {formattedDate}
          </h2>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full
            ${isDarkTheme ? "bg-purple-900/50 hover:bg-purple-800/50 text-gray-100" : "bg-gray-50 sm:bg-white/50 hover:bg-gray-200 sm:hover:bg-gray-100 text-gray-900 sm:text-gray-800"}`}
        >
          <Avatar name={userName} size="small" />
          <span className="font-medium hidden sm:inline">{userName}</span>
          <ChevronDown
            className={`h-4 w-4 ${isDarkTheme ? "text-gray-300" : "text-gray-700 sm:text-gray-600"} ${showDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {showDropdown && (
          <div
            className={`absolute right-0 mt-2 w-48 rounded-md py-1 shadow-lg
              ${isDarkTheme ? "bg-purple-900/90 text-gray-100 border border-purple-800" : "bg-gray-50 sm:bg-white text-gray-900 sm:text-gray-800 border border-gray-300 sm:border-gray-200"}`}
          >
            <button
              onClick={() => {
                router.push("/dashboard/profile")
                setShowDropdown(false)
                onProfileClick?.()
              }}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm
                ${isDarkTheme ? "hover:bg-purple-800/50" : "hover:bg-gray-200 sm:hover:bg-gray-100"}`}
            >
              <User2 className="h-4 w-4" />
              {t("profile")}
            </button>
            <button
              onClick={() => {
                setIsSettingsOpen(true)
                setShowDropdown(false)
              }}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm
                ${isDarkTheme ? "hover:bg-purple-800/50" : "hover:bg-gray-200 sm:hover:bg-gray-100"}`}
            >
              <Settings className="h-4 w-4" />
              {t("settings.title")}
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm
                ${isDarkTheme ? "hover:bg-purple-800/50" : "hover:bg-gray-200 sm:hover:bg-gray-100"}`}
            >
              <LogOut className="h-4 w-4" />
              {t("signOut")}
            </button>
          </div>
        )}
      </div>

      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  )
}