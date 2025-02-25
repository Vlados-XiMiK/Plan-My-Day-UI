'use client'

import { useState, useEffect } from 'react'
import { differenceInMinutes, isPast, format } from 'date-fns'
import { useNotification } from '@/contexts/notification-context'
import type { Task, User, Group } from '@/types'

export const useTaskLogic = (initialTasks: Task[], users: User[], groups: Group[]) => {
  const { addNotification } = useNotification()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreationPopupOpen, setCreationPopupOpen] = useState(false)
  const [isEditPopupOpen, setEditPopupOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifiedTasks, setNotifiedTasks] = useState<number[]>([]) // Список задач, для которых уже отправлено уведомление

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date()
      tasks.forEach(task => {
        if (task.completed) return; // Пропускаем завершённые задачи
  
        const minutesLeft = differenceInMinutes(new Date(task.dueDate), now)
        if (minutesLeft <= 1440 && minutesLeft > 0) {
          const hoursLeft = Math.floor(minutesLeft / 60)
          const minutesRemainder = minutesLeft % 60
          addNotification(
            'warning',
            `Task Deadline Approaching`,
            `Task "${task.title}" is due in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} and ${minutesRemainder} minute${minutesRemainder !== 1 ? 's' : ''}`
          )
        }
      })
    }
  
    const interval = setInterval(checkDeadlines, 60000)
    return () => clearInterval(interval)
  }, [tasks, addNotification])

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
    const task = tasks.find(task => task.id === id)
    if (task) {
      addNotification(
        'info',
        task.completed ? 'Task Reopened' : 'Task Completed',
        task.completed ? 'The task has been reopened and is now active again.' : 'You have successfully marked the task as completed.'
      )
      // Если задача завершена, можно убрать её из списка уведомлённых
      if (!task.completed) {
        setNotifiedTasks(prev => prev.filter(taskId => taskId !== id))
      }
    }
  }

  const toggleTaskStarred = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, starred: !task.starred } : task
    ))
    const task = tasks.find(task => task.id === id)
    if (task) {
      addNotification(
        'success',
        task.starred ? 'Removed from Favorites' : 'Added to Favorites',
        task.starred ? 'The task has been removed from your favorites list.' : 'The task has been added to your favorites list.'
      )
    }
  }

  const handleCreateTask = (task: Partial<Task>) => {
    const now = new Date().toISOString()
    setTasks(prev => [
      ...prev,
      {
        id: prev.length + 1,
        title: task.title || 'New Task',
        description: task.description || '',
        createdAt: now,
        dueDate: task.dueDate || now,
        category: task.category || 'Uncategorized',
        priority: task.priority || 'low',
        completed: false,
        starred: false,
        assignedTo: task.assignedTo || null,
        groupId: task.groupId || null,
      },
    ])
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, createdAt: now, completed: false, starred: false }),
    }).catch(error => addNotification('error', 'Task Creation Failed', 'An error occurred while creating the task.'))
  }

  const handleEditTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)))
    setEditPopupOpen(false)
    addNotification('success', 'Task Updated', 'The task has been successfully updated.')
    fetch(`/api/tasks/${updatedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    }).catch(error => addNotification('error', 'Update Failed', 'An error occurred while updating the task.'))
    // Если дедлайн изменился, можно сбросить уведомление
    setNotifiedTasks(prev => prev.filter(id => id !== updatedTask.id))
  }

  const openEditPopup = (task: Task) => {
    setTaskToEdit(task)
    setEditPopupOpen(true)
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
    addNotification('success', 'Task Deleted', 'The task has been successfully removed.')
    fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      .catch(error => addNotification('error', 'Deletion Failed', 'An error occurred while deleting the task.'))
    setNotifiedTasks(prev => prev.filter(taskId => taskId !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${format(date, 'MMM d, yyyy')} at ${format(date, 'HH:mm')}`
  }

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const minutesLeft = differenceInMinutes(due, now)

    if (isPast(due)) return { text: 'Overdue', isOverdue: true, isApproaching: false }
    const days = Math.floor(minutesLeft / (60 * 24))
    const hours = Math.floor((minutesLeft % (60 * 24)) / 60)
    const minutes = minutesLeft % 60

    if (days > 0) {
      return { text: `Due in ${days} day${days > 1 ? 's' : ''} ${hours}h ${minutes}m`, isOverdue: false, isApproaching: minutesLeft <= 1440 }
    }
    return { text: `Due in ${hours}h ${minutes}m`, isOverdue: false, isApproaching: true }
  }

  const getAssignedDisplay = (task: Task) => {
    if (task.assignedTo) {
      const user = users.find(u => u.id === task.assignedTo)
      return user ? `Assigned to: ${user.name}` : 'Assigned to: Unknown User'
    } else if (task.groupId) {
      const group = groups.find(g => g.id === task.groupId)
      return group ? `Assigned to group: ${group.name}` : 'Assigned to: Unknown Group'
    }
    return 'Not assigned'
  }

  const filterTasks = () => {
    return tasks.filter(task => {
      const query = searchQuery.toLowerCase()
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query) ||
        formatDate(task.createdAt).toLowerCase().includes(query) ||
        formatDate(task.dueDate).toLowerCase().includes(query) ||
        getAssignedDisplay(task).toLowerCase().includes(query)
      )
    })
  }

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
    toggleTaskStarred,
    handleCreateTask,
    handleEditTask,
    openEditPopup,
    handleDeleteTask,
    getPriorityColor,
    formatDate,
    getTimeRemaining,
    getAssignedDisplay,
    filterTasks,
  }
}