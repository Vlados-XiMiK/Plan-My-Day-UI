'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { UserCircle, LogOut, Menu, ChevronDown, User2, Moon, Sun, Globe } from 'lucide-react'
import { useLanguage } from "@/contexts/LanguageContext"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"
import { useTheme } from 'next-themes'

interface HeaderProps {
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  isCollapsed: boolean;
  onProfileClick?: () => void;
}

export default function Header({ toggleSidebar, toggleCollapse, isCollapsed, onProfileClick }: HeaderProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { language, setLanguage } = useLanguage()
  const t = language === "uk" ? uk : en
  const { theme, setTheme } = useTheme()

  // Состояние для управления темой, синхронизированное с useTheme и localStorage
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Определение и отслеживание темы из localStorage и useTheme с немедленным обновлением
  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme') || theme;
      setIsDarkTheme(savedTheme === 'dark');
    };

    // Инициализация при монтировании
    updateTheme();

    // Слушатель для изменений в localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        updateTheme();
      }
    };

    // Слушатель для изменений темы через useTheme
    const handleThemeChange = () => {
      updateTheme();
    };

    window.addEventListener('storage', handleStorageChange);
    // Подписываемся на изменения темы через useTheme (если доступно)
    const unsubscribe = () => {}; 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme]);

  useEffect(() => {
    // Update state to detect if the window width meets desktop criteria
    const updateIsDesktop = () => {
      if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth >= 768)
      }
    }

    updateIsDesktop()
    window.addEventListener('resize', updateIsDesktop)

    return () => window.removeEventListener('resize', updateIsDesktop)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Функции для переключения темы и языка
  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'uk' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <header className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 transition-colors duration-300
      ${isDarkTheme 
        ? 'bg-gray-900 border-gray-700 text-white' 
        : 'bg-gradient-to-b from-gray-100 to-gray-200 border-gray-200 text-gray-800'
      }`}
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={isDesktop ? toggleCollapse : toggleSidebar}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full hover:${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}
          aria-label={isDesktop ? (isCollapsed ? "Expand sidebar" : "Collapse sidebar") : "Toggle sidebar"}
        >
          <Menu 
            className={`h-6 w-6 ${isDarkTheme ? 'text-white' : 'text-black'}`}
          />
        </button>
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-2 rounded-full px-3 py-2 shadow-sm transition-colors 
            ${isDarkTheme ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
        >
          <UserCircle className={`h-6 w-6 ${isDarkTheme ? 'text-purple-400' : 'text-purple-600'}`} />
          <span className="font-medium">JohnDoe</span>
          <ChevronDown className={`h-4 w-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className={`absolute right-0 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 
            ${isDarkTheme ? 'bg-gray-800 ring-gray-700 text-white' : 'bg-white ring-black ring-opacity-5 text-gray-800'}`}>
            <div className={`px-4 py-2 ${isDarkTheme ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
              <p className="text-sm">{t.header.signed || "Signed in as"}</p>
              <p className="truncate text-sm font-medium">john@example.com</p>
            </div>
            <div className={isDarkTheme ? 'border-t border-gray-700' : 'border-t border-gray-200'}>
              <button
                onClick={() => {
                  router.push('/dashboard/profile') // Переход на страницу профиля
                  setShowDropdown(false)
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <User2 className={`h-4 w-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`} />
                {t.header.profile || "Profile"}
              </button>
              <button
                onClick={toggleTheme}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDarkTheme ? (t.header.lightTheme || "Light Theme") : (t.header.darkTheme || "Dark Theme")}
              </button>
              <button
                onClick={toggleLanguage}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Globe className={`h-4 w-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`} />
                {language === 'uk' ? ("Українська") : ("English")}
              </button>
              <button
                onClick={() => {
                  console.log('Logging out...')
                  router.push('/login') // Перенаправление на страницу входа после выхода
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <LogOut className={`h-4 w-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`} />
                {t.header.signOut || "Sign out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}