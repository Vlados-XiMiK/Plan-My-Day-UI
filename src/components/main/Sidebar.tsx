'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BarChart3, List, CalendarDays, PlusCircle, Trash } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCategories } from '@/lib/useCategories'; // Импортируем хук

interface SidebarProps {
  isVisible: boolean;
  isCollapsed: boolean;
}

export default function Sidebar({ isVisible, isCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // We use a hook to manage categories
  const {
    categories,
    newCategory,
    setNewCategory,
    newCategoryName,
    setNewCategoryName,
    editingIndex,
    tempCategory,
    setTempCategory,
    addCategory,
    deleteCategory,
    startEditing,
    saveEditing,
  } = useCategories();

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme') || theme;
      setIsDarkTheme(savedTheme === 'dark');
    };
    updateTheme();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') updateTheme();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [theme]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : '-translate-x-full'} 
        ${isCollapsed ? 'w-20' : 'w-72'}
        md:relative md:translate-x-0
        ${isDarkTheme 
          ? 'bg-gradient-to-b from-purple-950 to-gray-900 text-gray-100' 
          : 'bg-gradient-to-b from-gray-50 to-beige-100 text-gray-800'
        } border-r ${isDarkTheme ? 'border-purple-900' : 'border-gray-200'}`}
    >
      <div className={`flex h-16 shrink-0 items-center justify-center backdrop-blur-sm border-b px-4`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start w-full'}`}>
          <div className="h-16 w-16 overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={200} 
              height={200} 
              className="object-cover w-full h-full" 
            />
          </div>
          {!isCollapsed && <h1 className={`font-bold ml-3 text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400 }`}>Plan My Day</h1>}
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <button
          onClick={() => router.push('/dashboard/stats')}
          className={`flex w-full items-center rounded-lg p-3 ${isDarkTheme ? 'hover:bg-purple-800/50 text-gray-100' : 'hover:bg-gray-200/50 text-gray-700'} transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${pathname === '/dashboard/stats' ? `${isDarkTheme ? 'bg-purple-700' : 'bg-amber-100'} text-${isDarkTheme ? 'white' : 'amber-800'}` : ''}`}
        >
          <BarChart3 className={`${isCollapsed ? 'h-7 w-7' : 'mr-3 h-7 w-7'}`} />
          {!isCollapsed && <span className="font-medium">Stats</span>}
        </button>
        <button
          onClick={() => router.push('/dashboard/tasks')}
          className={`flex w-full items-center rounded-lg p-3 ${isDarkTheme ? 'hover:bg-purple-800/50 text-gray-100' : 'hover:bg-gray-200/50 text-gray-700'} transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${pathname === '/dashboard/tasks' ? `${isDarkTheme ? 'bg-purple-700' : 'bg-emerald-100'} text-${isDarkTheme ? 'white' : 'emerald-800'}` : ''}`}
        >
          <List className={`${isCollapsed ? 'h-7 w-7' : 'mr-3 h-7 w-7'}`} />
          {!isCollapsed && <span className="font-medium">All Tasks</span>}
        </button>
        <button
          onClick={() => router.push('/dashboard/calendar')}
          className={`flex w-full items-center rounded-lg p-3 ${isDarkTheme ? 'hover:bg-purple-800/50 text-gray-100' : 'hover:bg-gray-200/50 text-gray-700'} transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${pathname === '/dashboard/calendar' ? `${isDarkTheme ? 'bg-purple-700' : 'bg-indigo-100'} text-${isDarkTheme ? 'white' : 'indigo-800'}` : ''}`}
        >
          <CalendarDays className={`${isCollapsed ? 'h-7 w-7' : 'mr-3 h-7 w-7'}`} />
          {!isCollapsed && <span className="font-medium">Calendar</span>}
        </button>
      </nav>

      {!isCollapsed && (
        <div className="flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDarkTheme ? 'text-purple-200' : 'text-gray-800'}`}>My Categories</h2>
            <button
              onClick={() => setNewCategory(true)}
              className={`${isDarkTheme ? 'text-purple-300 hover:text-purple-200' : 'text-indigo-500 hover:text-indigo-400'} transition-colors duration-200`}
            >
              <PlusCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li
                  key={index}
                  className={`flex items-center justify-between rounded-lg p-3 ${isDarkTheme ? 'bg-purple-900/30 hover:bg-purple-800/50' : 'bg-white/50 hover:bg-gray-100'} transition-all duration-200`}
                >
                  <div className="flex items-center flex-1">
                    <div className={`h-4 w-4 rounded-full ${isDarkTheme ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gradient-to-br from-indigo-400 to-blue-500'}`}></div>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={tempCategory}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[a-zA-Z\s]*$/.test(value)) setTempCategory(value);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditing(index)}
                        onBlur={() => saveEditing(index)}
                        className={`ml-2 flex-1 rounded-lg ${isDarkTheme ? 'bg-purple-900/50 text-white placeholder-purple-300' : 'bg-gray-100 text-gray-800 placeholder-gray-400'} border-none px-2 py-1 focus:ring-2 ${isDarkTheme ? 'focus:ring-purple-400' : 'focus:ring-indigo-300'}`}
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => startEditing(index)}
                        className={`ml-2 cursor-pointer ${isDarkTheme ? 'text-gray-100' : 'text-gray-700'} font-medium`}
                      >
                        {category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteCategory(index)}
                    className={`${isDarkTheme ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-400'} transition-colors duration-200`}
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </li>
              ))}
              {newCategory && (
                <li className={`flex items-center rounded-lg p-3 ${isDarkTheme ? 'bg-purple-900/30 hover:bg-purple-800/50' : 'bg-white/50 hover:bg-gray-100'} transition-all duration-200`}>
                  <div className={`h-4 w-4 rounded-full ${isDarkTheme ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gradient-to-br from-indigo-400 to-blue-500'}`}></div>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-Z\s]*$/.test(value)) setNewCategoryName(value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    onBlur={addCategory}
                    className={`ml-2 flex-1 rounded-lg ${isDarkTheme ? 'bg-purple-900/50 text-white placeholder-purple-300' : 'bg-gray-100 text-gray-800 placeholder-gray-400'} border-none px-2 py-1 focus:ring-2 ${isDarkTheme ? 'focus:ring-purple-400' : 'focus:ring-indigo-300'}`}
                    autoFocus
                  />
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}