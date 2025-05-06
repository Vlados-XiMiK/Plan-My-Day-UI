import { useState, useMemo, useCallback } from 'react'
import { differenceInMinutes, isPast, format, addHours } from 'date-fns'
import { uk, enUS } from 'date-fns/locale'
import { useNotification } from '@/contexts/notification-context'
import type { Task } from '@/types'
import { useTranslation } from 'react-i18next'

interface TimeRemaining {
  text: string
  isOverdue: boolean
  isApproaching: boolean
}

export const useTaskLogic = (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  const { t } = useTranslation(['tasks', 'notifications'])
  const { addNotification } = useNotification()
  const [isCreationPopupOpen, setCreationPopupOpen] = useState(false)
  const [isEditPopupOpen, setEditPopupOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Function for trimming long named tasks
  const truncateTitle = (title: string, maxLength: number = 30): string => {
    if (title.length <= maxLength) return title
    return title.slice(0, maxLength - 3) + '...'
  }

  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
    const task = tasks.find((task) => task.id === id)
    if (task) {
      const truncatedTitle = truncateTitle(task.title)
      addNotification(
        'info',
        task.completed ? t('notifications:taskReopened.title') : t('notifications:taskCompleted.title'),
        task.completed
          ? t('notifications:taskReopened.message', { title: truncatedTitle })
          : t('notifications:taskCompleted.message', { title: truncatedTitle })
      )
    }
  }

  const snoozeTask = (id: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const now = new Date()
          const currentDueDate = new Date(task.dueDate)
          const newDueDate = isPast(currentDueDate)
            ? addHours(now, 2)
            : addHours(currentDueDate, 2)
          return { ...task, dueDate: newDueDate.toISOString() }
        }
        return task
      })
    )
    const task = tasks.find((task) => task.id === id)
    if (task) {
      const truncatedTitle = truncateTitle(task.title)
      addNotification(
        'info',
        t('notifications:taskSnoozed.title'),
        t('notifications:taskSnoozed.message', { title: truncatedTitle })
      )
    }
  }

  const toggleTaskStarred = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, starred: !task.starred } : task
      )
    )
    const task = tasks.find((task) => task.id === id)
    if (task) {
      const truncatedTitle = truncateTitle(task.title)
      addNotification(
        'success',
        task.starred ? t('notifications:removedFromFavorites.title') : t('notifications:addedToFavorites.title'),
        task.starred
          ? t('notifications:removedFromFavorites.message', { title: truncatedTitle })
          : t('notifications:addedToFavorites.message', { title: truncatedTitle })
      )
    }
  }

  const handleCreateTask = (task: Partial<Task>) => {
    const now = new Date().toISOString()
    const newTask: Task = {
      id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      title: task.title || 'New Task',
      description: task.description || '',
      createdAt: now,
      dueDate: task.dueDate || now,
      category: task.category || '',
      priority: task.priority || 'low',
      completed: false,
      starred: false,
      date: task.date || new Date(now).toISOString().split('T')[0]
    }
    setTasks([...tasks, newTask])
    setCreationPopupOpen(false)
    const truncatedTitle = truncateTitle(newTask.title)
    addNotification(
      'success',
      t('notifications:taskCreated.title'),
      t('notifications:taskCreated.message', { title: truncatedTitle })
    )
  }

  const handleEditTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    )
    setEditPopupOpen(false)
    setTaskToEdit(null)
    const truncatedTitle = truncateTitle(updatedTask.title)
    addNotification(
      'success',
      t('notifications:taskUpdated.title'),
      t('notifications:taskUpdated.message', { title: truncatedTitle })
    )
  }

  const openEditPopup = (task: Task) => {
    setTaskToEdit(task)
    setEditPopupOpen(true)
  }

  const handleDeleteTask = (id: number) => {
    const task = tasks.find((task) => task.id === id)
    setTasks(tasks.filter((task) => task.id !== id))
    if (task) {
      const truncatedTitle = truncateTitle(task.title)
      addNotification(
        'success',
        t('notifications:taskDeleted.title'),
        t('notifications:taskDeleted.message', { title: truncatedTitle })
      )
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-orange-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const locale = t('tasks:language') === 'ua' ? uk : enUS
    const dateFormat = t('tasks:language') === 'ua' ? 'd MMMM yyyy' : 'MMM d, yyyy'
    const timeFormat = 'HH:mm'
    const formattedDate = format(date, dateFormat, { locale })
    const formattedTime = format(date, timeFormat)
    return t('tasks:language') === 'ua'
      ? `${formattedDate} о ${formattedTime}`
      : `${formattedDate} at ${formattedTime}`
  }, [t]);

  const getTimeRemaining = (dueDate: string, completed: boolean = false): TimeRemaining => {
    const now = new Date()
    const due = new Date(dueDate)
    const minutesLeft = differenceInMinutes(due, now)

    if (completed) {
      return {
        text: t('tasks:timeRemaining.completed'),
        isOverdue: false,
        isApproaching: false
      }
    }

    if (isPast(due)) {
      return {
        text: t('tasks:timeRemaining.overdue'),
        isOverdue: true,
        isApproaching: false
      }
    }

    const days = Math.floor(minutesLeft / (60 * 24))
    const hours = Math.floor((minutesLeft % (60 * 24)) / 60)
    const minutes = minutesLeft % 60

    if (days > 0) {
      return {
        text: t('tasks:timeRemaining.dueInDays', {
          days,
          hours,
          minutes,
          dayPlural: days > 1 ? t('tasks:timeRemaining.days') : t('tasks:timeRemaining.day')
        }),
        isOverdue: false,
        isApproaching: minutesLeft <= 1440
      }
    }

    const isUkrainian = t('tasks:language') === 'ua'
    const hourPlural = isUkrainian
      ? hours === 1
        ? t('tasks:timeRemaining.hour')
        : t('tasks:timeRemaining.hours')
      : hours === 1
      ? t('tasks:timeRemaining.hour')
      : t('tasks:timeRemaining.hours')
    const minutePlural = isUkrainian
      ? minutes === 1
        ? t('tasks:timeRemaining.minute')
        : t('tasks:timeRemaining.minutes')
      : minutes === 1
      ? t('tasks:timeRemaining.minute')
      : t('tasks:timeRemaining.minutes')

    return {
      text: t('tasks:timeRemaining.dueInHours', {
        hours,
        minutes,
        hourPlural,
        minutePlural
      }),
      isOverdue: false,
      isApproaching: true
    }
  }

  const filterTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = searchQuery.toLowerCase()
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (task.category && task.category.toLowerCase().includes(query)) ||
        task.priority.toLowerCase().includes(query) ||
        formatDate(task.createdAt).toLowerCase().includes(query) ||
        formatDate(task.dueDate).toLowerCase().includes(query)
      )
    })
  }, [tasks, searchQuery, formatDate])

  return {
    tasks,
    isCreationPopupOpen,
    setCreationPopupOpen,
    isEditPopupOpen,
    setEditPopupOpen,
    taskToEdit,
    searchQuery,
    setSearchQuery,
    toggleTaskCompletion,
    snoozeTask,
    toggleTaskStarred,
    handleCreateTask,
    handleEditTask,
    openEditPopup,
    handleDeleteTask,
    getPriorityColor,
    formatDate,
    getTimeRemaining,
    filterTasks
  }
}