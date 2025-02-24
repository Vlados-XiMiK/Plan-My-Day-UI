'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { BarChart, ListTodo, Calendar, PlusCircle, Trash2 } from 'lucide-react'
import { useNotification } from '@/contexts/notification-context'
import { useTheme } from 'next-themes'

interface SidebarProps {
  isVisible: boolean;
  isCollapsed: boolean;
}

export default function Sidebar({ isVisible, isCollapsed }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [categories, setCategories] = useState(['Work', 'Personal', 'Shopping']);
  const [newCategory, setNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempCategory, setTempCategory] = useState('');
  const { addNotification } = useNotification();
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

  const isValidCategoryName = (name: string) => {
    const isLatin = /^[a-zA-Z\s]+$/.test(name);
    return isLatin && name.trim().length > 0;
  };

  const addCategory = () => {
    if (!isValidCategoryName(newCategoryName)) {
      addNotification('error', 'Invalid Name', 'Category name must contain only Latin letters and cannot be empty.');
      setNewCategory(false);
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      addNotification('error', 'Duplicate Category', 'This category already exists.');
      setNewCategory(false);
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    addNotification('success', 'Category Added', `Category "${newCategoryName.trim()}" added.`);
    setNewCategory(false);
    setNewCategoryName('');
  };

  const deleteCategory = (index: number) => {
    const categoryToDelete = categories[index];
    setCategories(categories.filter((_, i) => i !== index));
    addNotification('info', 'Category Deleted', `Category "${categoryToDelete}" deleted.`);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempCategory(categories[index]);
  };

  const saveEditing = (index: number) => {
    if (!isValidCategoryName(tempCategory)) {
      addNotification('error', 'Invalid Name', 'Category name must contain only Latin letters and cannot be empty.');
      setEditingIndex(null);
      return;
    }
    if (categories[index] === tempCategory.trim()) {
      addNotification('info', 'No Changes', 'No changes were made.');
      setEditingIndex(null);
      return;
    }
    if (categories.includes(tempCategory.trim())) {
      addNotification('error', 'Duplicate Category', 'This category already exists.');
      setEditingIndex(null);
      return;
    }
    const updatedCategories = [...categories];
    updatedCategories[index] = tempCategory.trim();
    setCategories(updatedCategories);
    addNotification('success', 'Category Updated', `Category "${tempCategory.trim()}" updated.`);
    setEditingIndex(null);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : '-translate-x-full'} 
        ${isCollapsed ? 'w-20' : 'w-72'}
        md:relative md:translate-x-0
        ${isDarkTheme 
          ? 'bg-gray-900 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-800 shadow-md'
        }`}
    >
      <div className={`flex h-16 shrink-0 items-center justify-center border-b px-4
        ${isDarkTheme 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white/50 border-gray-200'
        }`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start w-full'}`}>
          <div className={`h-12 w-12 overflow-hidden rounded-full ${isDarkTheme ? 'ring-2 ring-white/30' : 'ring-2 ring-gray-300'}`}>
            <Image src="/logo.png?height=100&width=100" alt="Logo" width={48} height={48} />
          </div>
          {!isCollapsed && <h1 className={`ml-3 text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Plan My Day</h1>}
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <button
          onClick={() => router.push('/dashboard/stats')}
          className={`flex w-full items-center rounded-full p-3 hover:bg-${isDarkTheme ? 'white/10' : 'gray-200'} transition-all duration-200 shadow-sm
            ${isCollapsed ? 'justify-center' : ''} 
            ${pathname === '/dashboard/stats' 
              ? isDarkTheme 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
              : isDarkTheme 
                ? 'text-gray-300' 
                : 'text-gray-700'
            }`}
          style={{ 
            backgroundImage: pathname === '/dashboard/stats' 
              ? 'linear-gradient(to right, #facc15, #f97316)' 
              : 'none',
          }}
        >
          <BarChart 
            className={`${isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} 
              ${isDarkTheme ? 'drop-shadow-md' : ''}`}
            style={{
              background: pathname === '/dashboard/stats' 
                ? 'linear-gradient(to right, #facc15, #f97316)' 
                : 'none',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: pathname === '/dashboard/stats' ? 'transparent' : 'inherit',
            }}
          />
          {!isCollapsed && <span className="font-medium">Stats</span>}
        </button>
        <button
          onClick={() => router.push('/dashboard/tasks')}
          className={`flex w-full items-center rounded-full p-3 hover:bg-${isDarkTheme ? 'white/10' : 'gray-200'} transition-all duration-200 shadow-sm
            ${isCollapsed ? 'justify-center' : ''} 
            ${pathname === '/dashboard/tasks' 
              ? isDarkTheme 
                ? 'bg-gradient-to-r from-green-400 to-teal-500 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
              : isDarkTheme 
                ? 'text-gray-300' 
                : 'text-gray-700'
            }`}
          style={{ 
            backgroundImage: pathname === '/dashboard/tasks' 
              ? 'linear-gradient(to right, #22d3ee, #14b8a6)' 
              : 'none',
          }}
        >
          <ListTodo 
            className={`${isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} 
              ${isDarkTheme ? 'drop-shadow-md' : ''}`}
            style={{
              background: pathname === '/dashboard/tasks' 
                ? 'linear-gradient(to right, #22d3ee, #14b8a6)' 
                : 'none',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: pathname === '/dashboard/tasks' ? 'transparent' : 'inherit',
            }}
          />
          {!isCollapsed && <span className="font-medium">All Tasks</span>}
        </button>
        <button
          onClick={() => router.push('/dashboard/calendar')}
          className={`flex w-full items-center rounded-full p-3 hover:bg-${isDarkTheme ? 'white/10' : 'gray-200'} transition-all duration-200 shadow-sm
            ${isCollapsed ? 'justify-center' : ''} 
            ${pathname === '/dashboard/calendar' 
              ? isDarkTheme 
                ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
              : isDarkTheme 
                ? 'text-gray-300' 
                : 'text-gray-700'
            }`}
          style={{ 
            backgroundImage: pathname === '/dashboard/calendar' 
              ? 'linear-gradient(to right, #60a5fa, #4f46e5)' 
              : 'none',
          }}
        >
          <Calendar 
            className={`${isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} 
              ${isDarkTheme ? 'drop-shadow-md' : ''}`}
            style={{
              background: pathname === '/dashboard/calendar' 
                ? 'linear-gradient(to right, #60a5fa, #4f46e5)' 
                : 'none',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: pathname === '/dashboard/calendar' ? 'transparent' : 'inherit',
            }}
          />
          {!isCollapsed && <span className="font-medium">Calendar</span>}
        </button>
      </nav>

      {!isCollapsed && (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>My Categories</h2>
            <button
              onClick={() => setNewCategory(true)}
              className={`hover:${isDarkTheme ? 'text-yellow-200' : 'text-purple-800'} transition-colors duration-200
                ${isDarkTheme ? 'text-yellow-300' : 'text-purple-600'}`}
            >
              <PlusCircle className={`h-6 w-6 ${isDarkTheme ? 'drop-shadow-md' : ''}`} />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li
                  key={index}
                  className={`flex items-center justify-between rounded-full p-3 ${isDarkTheme ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white/50 hover:bg-gray-200'} transition-all duration-200 shadow-sm`}
                >
                  <div className="flex items-center flex-1">
                    <div className={`h-4 w-4 rounded-full ${isDarkTheme ? 'bg-gradient-to-br from-pink-400 to-purple-500' : 'bg-gradient-to-br from-purple-300 to-indigo-400'} shadow-md`}></div>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={tempCategory}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[a-zA-Z\s]*$/.test(value)) {
                            setTempCategory(value);
                          }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditing(index)}
                        onBlur={() => saveEditing(index)}
                        className={`ml-2 flex-1 rounded-sm ${isDarkTheme ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-300'} px-2 py-1 ${isDarkTheme ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'} focus:ring-2 focus:ring-${isDarkTheme ? 'yellow-300' : 'purple-300'}`}
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => startEditing(index)}
                        className={`ml-2 cursor-pointer font-medium ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}
                      >
                        {category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteCategory(index)}
                    className={`hover:${isDarkTheme ? 'text-red-400' : 'text-red-600'} transition-colors duration-200
                      ${isDarkTheme ? 'text-red-300' : 'text-red-500'}`}
                  >
                    <Trash2 className={`h-5 w-5 ${isDarkTheme ? 'drop-shadow-md' : ''}`} />
                  </button>
                </li>
              ))}
              {newCategory && (
                <li className={`flex items-center rounded-full p-3 ${isDarkTheme ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white/50 hover:bg-gray-200'} transition-all duration-200 shadow-sm`}>
                  <div className={`h-4 w-4 rounded-full ${isDarkTheme ? 'bg-gradient-to-br from-pink-400 to-purple-500' : 'bg-gradient-to-br from-purple-300 to-indigo-400'} shadow-md`}></div>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-Z\s]*$/.test(value)) {
                        setNewCategoryName(value);
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    onBlur={addCategory}
                    className={`ml-2 flex-1 rounded-sm ${isDarkTheme ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-300'} px-2 py-1 ${isDarkTheme ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'} focus:ring-2 focus:ring-${isDarkTheme ? 'yellow-300' : 'purple-300'}`}
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