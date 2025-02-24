'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { UserCircle, LogOut, Menu, ChevronDown, User2, Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import en from '@/translations/en.json';
import uk from '@/translations/uk.json';
import { useTheme } from 'next-themes';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  isCollapsed: boolean;
  onProfileClick?: () => void;
}

export default function Header({ toggleSidebar, toggleCollapse, isCollapsed, onProfileClick }: HeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const t = language === 'uk' ? uk : en;

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme') || theme;
      setIsDarkTheme(savedTheme === 'dark');
    };
    updateTheme();
    window.addEventListener('storage', (e) => e.key === 'theme' && updateTheme());
    return () => window.removeEventListener('storage', () => {});
  }, [theme]);

  useEffect(() => {
    const updateIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    updateIsDesktop();
    window.addEventListener('resize', updateIsDesktop);
    return () => window.removeEventListener('resize', updateIsDesktop);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'uk' : 'en');
  };

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 items-center justify-between px-4 transition-colors duration-300
        ${isDarkTheme
          ? 'bg-gradient-to-b from-purple-950 to-gray-900 border-b border-purple-900'
          : 'bg-gradient-to-b from-gray-50 to-beige-100 border-b border-gray-200'}`}
    >
      <button
        onClick={isDesktop ? toggleCollapse : toggleSidebar}
        className={`p-2 rounded-full ${isDarkTheme ? 'hover:bg-purple-800/50' : 'hover:bg-gray-200/50'}`}
        aria-label={isDesktop ? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Toggle sidebar'}
      >
        <Menu className={`h-6 w-6 ${isDarkTheme ? 'text-gray-100' : 'text-gray-800'}`} />
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full ${isDarkTheme ? 'bg-purple-900/50 hover:bg-purple-800/50 text-gray-100' : 'bg-white/50 hover:bg-gray-100 text-gray-800'}`}
        >
          <UserCircle className={`h-6 w-6 ${isDarkTheme ? 'text-purple-400' : 'text-indigo-500'}`} />
          <span className="font-medium">JohnDoe</span>
          <ChevronDown className={`h-4 w-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div
            className={`absolute right-0 mt-2 w-48 rounded-md py-1 shadow-lg ${isDarkTheme ? 'bg-purple-900/90 text-gray-100' : 'bg-white text-gray-800'} border ${isDarkTheme ? 'border-purple-800' : 'border-gray-200'}`}
          >
            <button
              onClick={() => {
                router.push('/dashboard/profile');
                setShowDropdown(false);
                onProfileClick?.();
              }}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${isDarkTheme ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
            >
              <User2 className="h-4 w-4" />
              {t.header.profile || 'Profile'}
            </button>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${isDarkTheme ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
            >
              {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDarkTheme ? (t.header.lightTheme || 'Light Theme') : (t.header.darkTheme || 'Dark Theme')}
            </button>
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${isDarkTheme ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
            >
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'English' : 'Українська'}
            </button>
            <button
              onClick={() => router.push('/login')}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${isDarkTheme ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
            >
              <LogOut className="h-4 w-4" />
              {t.header.signOut || 'Sign out'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}