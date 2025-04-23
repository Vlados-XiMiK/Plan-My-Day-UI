'use client'

import { useState, useEffect } from 'react'
import { X, CalendarIcon, Clock, Tag, BarChart, FileText, ListTodo } from 'lucide-react'
import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import { useNotification } from '@/contexts/notification-context'
import { HTMLAttributes } from 'react'
import { useTheme } from 'next-themes' // Добавляем useTheme для управления темой

import type { Task,} from '@/types'

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface TaskCreationPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  categories: string[]
}

export default function TaskCreationPopup({ isOpen, onClose, onSave, categories }: TaskCreationPopupProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('23:59')
  const [priority, setPriority] = useState('medium')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { addNotification } = useNotification()
  const { theme } = useTheme() // Используем useTheme для определения текущей темы

  // Состояние для управления темой, синхронизированное с useTheme
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  // Определение темы при монтировании из useTheme и localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || theme
    setIsDarkTheme(savedTheme === 'dark')

    // Обновляем тему при изменении через localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setIsDarkTheme(e.newValue === 'dark')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [theme])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const currentDate = new Date()
    const selectedDate = new Date(`${dueDate}T${dueTime}`)

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!dueDate || !dueTime) {
      newErrors.dueDate = 'Due date is required'
      newErrors.dueTime = 'Due time is required'
    } else if (selectedDate < currentDate) {
      newErrors.dueDate = 'Date and time cannot be in the past'
      newErrors.dueTime = 'Date and time cannot be in the past'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      const form = document.getElementById('task-form')
      form?.classList.add('animate-shake')
      setTimeout(() => {
        form?.classList.remove('animate-shake')
      }, 500)
      addNotification('error', 'Error validation', 'Please fix the errors in the form.')
      return
    }

    onSave({
      id: 0,
      title,
      description,
      createdAt: new Date().toISOString(),
      dueDate: `${dueDate}T${dueTime}`,
      category,
      priority: priority as 'high' | 'medium' | 'low',
      completed: false,
      starred: false 
    })

    addNotification('success', 'Task created', 'Task created successfully!')

    setTitle('')
    setDescription('')
    setCategory(categories[0])
    setDueDate('')
    setDueTime('23:59')
    setPriority('medium')
    setErrors({})
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          {...({} as MotionDivProps)}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm ${isDarkTheme ? 'dark:bg-opacity-50' : ''}`}
            onClick={onClose}
            {...({} as MotionDivProps)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className={`relative w-full max-w-3xl overflow-hidden rounded-xl shadow-xl ${isDarkTheme ? 'bg-gray-900 border border-gray-800' : 'bg-white bg-opacity-60'}`}
            {...({} as MotionDivProps)}
          >
            <div className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 opacity-50' : 'bg-gradient-to-br from-purple-300 via-pink-200 to-blue-300 opacity-80'}`} />
            <motion.div
              className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-20' : 'bg-gradient-to-br from-transparent via-white to-transparent opacity-40'}`}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
                transition: { duration: 5, repeat: Infinity, repeatType: 'reverse' },
              }}
              {...({} as MotionDivProps)}
            />
            <div className={`relative ${isDarkTheme ? 'bg-gray-900 bg-opacity-80 p-6 text-white' : 'bg-white bg-opacity-60 p-6 backdrop-blur-sm text-gray-800'}`}>
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 ${isDarkTheme ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className={`${isDarkTheme ? 'text-white' : 'text-gray-800'} text-2xl font-bold mb-6`}>Create New Task</h2>

              <form id="task-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium`}>Title</label>
                  <div className="flex items-center space-x-2">
                    <FileText className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`flex-grow rounded-lg border ${
                        errors.title ? 'border-red-500' : isDarkTheme ? 'border-gray-600' : 'border-gray-300'
                      } px-3 py-2 ${isDarkTheme ? 'bg-gray-800 bg-opacity-70 text-white placeholder-gray-500' : 'bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500'} transition-colors duration-200`}
                      placeholder="Enter task title"
                    />
                  </div>
                  {errors.title && <p className={`${isDarkTheme ? 'text-red-400' : 'text-red-500'} text-sm`}>{errors.title}</p>}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium`}>Description</label>
                  <div className="flex items-start space-x-2">
                    <ListTodo className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'} mt-2`} />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className={`flex-grow rounded-lg border ${
                        errors.description ? 'border-red-500' : isDarkTheme ? 'border-gray-600' : 'border-gray-300'
                      } px-3 py-2 ${isDarkTheme ? 'bg-gray-800 bg-opacity-70 text-white placeholder-gray-500' : 'bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500'} transition-colors duration-200`}
                      placeholder="Enter task description"
                    />
                  </div>
                  {errors.description && <p className={`${isDarkTheme ? 'text-red-400' : 'text-red-500'} text-sm mt-1`}>{errors.description}</p>}
                </div>

                <div className="space-y-1">
                  <label className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium`}>Category</label>
                  <div className="flex items-center space-x-2">
                    <Tag className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`} />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`flex-grow rounded-lg border ${isDarkTheme ? 'border-gray-600 bg-gray-800 bg-opacity-70 text-white' : 'border-gray-300 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500'} px-3 py-2 transition-colors duration-200`}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className={isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium`}>Priority</label>
                  <div className="flex items-center space-x-2">
                    <BarChart className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`} />
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className={`flex-grow rounded-lg border ${isDarkTheme ? 'border-gray-600 bg-gray-800 bg-opacity-70 text-white' : 'border-gray-300 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500'} px-3 py-2 transition-colors duration-200`}
                    >
                      <option value="low" className={isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}>Low</option>
                      <option value="medium" className={isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}>Medium</option>
                      <option value="high" className={isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}>High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} block text-sm font-medium`}>Due Date and Time</label>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`} />
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`rounded-lg border ${
                          errors.dueDate ? 'border-red-500' : isDarkTheme ? 'border-gray-600' : 'border-gray-300'
                        } px-3 py-2 ${isDarkTheme ? 'bg-gray-800 bg-opacity-70 text-white' : 'bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500'} transition-colors duration-200`}
                      />
                      <div className="flex items-center space-x-2">
                        <Clock className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`} />
                        <input
                          type="time"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          className={`flex-grow rounded-lg border ${
                            errors.dueTime ? 'border-red-500' : isDarkTheme ? 'border-gray-600' : 'border-gray-300'
                          } px-3 py-2 ${isDarkTheme ? 'bg-gray-800 bg-opacity-70 text-white' : 'bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500'} transition-colors duration-200`}
                        />
                      </div>
                    </div>
                  </div>
                  {(errors.dueDate || errors.dueTime) && (
                    <p className={`${isDarkTheme ? 'text-red-400' : 'text-red-500'} text-sm`}>{errors.dueDate || errors.dueTime}</p>
                  )}
                </div>

                <div className={`flex justify-end space-x-3 mt-6 sm:col-span-2 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2 ${isDarkTheme ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 ${isDarkTheme ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-600 text-white hover:bg-purple-700'} rounded-lg transition-colors duration-200`}
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}