'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, Edit, Star, Trash, Plus, Calendar, Clock, User, Users } from 'lucide-react'
import { format } from 'date-fns' // Import date-fns for consistent formatting
import TaskCreationPopup from '../../../components/main/pop-up/TaskCreationPopup'
import TaskEditPopup from '../../../components/main/pop-up/TaskEditPopup'
import { useNotification } from '@/contexts/notification-context'

// Precompute current date outside the component
const currentDate = format(new Date(), 'EEE, MMM d, yyyy') // e.g., "Fri, Feb 21, 2025"

interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  starred: boolean;
  assignedTo: string | null; // ID пользователя или группы
  groupId: string | null;    // ID группы
}

interface User {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

export default function MainContent() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Complete project proposal',
      description: 'Finish the draft and send it for review',
      createdAt: '2024-06-08T10:00:00',
      dueDate: '2026-06-15T17:00:00',
      category: 'Work',
      priority: 'high',
      completed: false,
      starred: false,
      assignedTo: 'user123', // Пример назначенного пользователя
      groupId: null,
    },
    {
      id: 2,
      title: 'Buy groceries',
      description: 'Get items for the week',
      createdAt: '2024-06-09T14:30:00',
      dueDate: '2026-06-10T18:00:00',
      category: 'Shopping',
      priority: 'medium',
      completed: true,
      starred: true,
      assignedTo: null,
      groupId: 'group456', // Пример назначенной группы
    },
    {
      id: 3,
      title: 'Schedule dentist appointment',
      description: 'Call the clinic for a check-up',
      createdAt: '2024-06-10T09:15:00',
      dueDate: '2026-06-20T11:00:00',
      category: 'Personal',
      priority: 'low',
      completed: false,
      starred: false,
      assignedTo: null,
      groupId: null,
    },
  ])
  
  const [isCreationPopupOpen, setCreationPopupOpen] = useState(false)
  const [isEditPopupOpen, setEditPopupOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [users, setUsers] = useState<User[]>([]) // Список пользователей
  const [groups, setGroups] = useState<Group[]>([]) // Список групп
  const { addNotification } = useNotification()


  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
    const task = tasks.find(task => task.id === id)
    if (task) {
      addNotification(
        'info',
        task.completed ? 'Task marked as incomplete.' : 'Task completed!'
      )
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
        task.starred ? 'Task removed from favorites.' : 'Task added to favorites!'
      )
    }
  }

  const handleCreateTask = (task: Partial<Task>) => {
    const now = new Date().toISOString() // Capture once to ensure consistency
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
    // Отправка задачи на бэкенд
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...task,
        createdAt: now,
        completed: false,
        starred: false,
      }),
    }).catch(error => addNotification('error', 'Failed to create task'));
  }

  const handleEditTask = (updatedTask: Task) => {
    setTasks(prev =>
      prev.map(task => (task.id === updatedTask.id ? updatedTask : task))
    )
    setEditPopupOpen(false)
    addNotification('info', 'Task updated successfully!')

    // Обновление задачи на бэкенде
    fetch(`/api/tasks/${updatedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    }).catch(error => addNotification('error', 'Failed to update task'));
  }

  const openEditPopup = (task: Task) => {
    setTaskToEdit(task)
    setEditPopupOpen(true)
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
    addNotification('success', 'Task deleted successfully!')

    // Удаление задачи на бэкенде
    fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    }).catch(error => addNotification('error', 'Failed to delete task'));
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
    return `${format(date, 'MMM d, yyyy')} at ${format(date, 'hh:mm a')}` // e.g., "Jun 8, 2024 at 10:00 AM"
  }

  const getAssignedDisplay = (task: Task) => {
    if (task.assignedTo) {
      const user = users.find(u => u.id === task.assignedTo);
      return user ? `Assigned to: ${user.name} ` : 'Assigned to: Unknown User ';
    } else if (task.groupId) {
      const group = groups.find(g => g.id === task.groupId);
      return group ? `Assigned to group: ${group.name} ` : 'Assigned to: Unknown Group ';
    }
    return 'Not assigned';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
      <TaskCreationPopup
        isOpen={isCreationPopupOpen}
        onClose={() => setCreationPopupOpen(false)}
        onSave={handleCreateTask}
        categories={['Work', 'Shopping', 'Personal']}
        users={users}
        groups={groups}
      />
      {taskToEdit && (
        <TaskEditPopup
          isOpen={isEditPopupOpen}
          onClose={() => setEditPopupOpen(false)}
          onSave={handleEditTask}
          task={taskToEdit}
          categories={['Work', 'Shopping', 'Personal']}
          users={users}
          groups={groups}
        />
      )}

      <div className="mb-6">
        <div className="inline-block bg-white rounded-full px-4 py-2 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">
            My Day · {currentDate}
          </h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-6">
        <div className="rounded-lg bg-white bg-opacity-75 p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold">Filters and Search</h3>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200" 
                  placeholder="Search tasks..." 
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Incomplete</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200">
                  <option>All Priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200">
                  <option>Sort by Due Date</option>
                  <option>Sort by Priority</option>
                  <option>Sort Alphabetically</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
          </div>
          <button className="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 duration-200">
            Clear Filters
          </button>
        </div>
        
        <div className="mb-6">
          <button
            onClick={() => setCreationPopupOpen(true)}
            className="flex items-center rounded-md bg-purple-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-purple-700 duration-200"
          >
            <Plus className="mr-2" size={20} />
            Create Task
          </button>
        </div>
        
        <div className="rounded-lg bg-white bg-opacity-75 p-6 shadow-lg">
          <ul className="space-y-4">
            {tasks.map(task => (
              <li key={task.id} className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="mr-4 h-5 w-5 rounded text-purple-600 focus:ring-purple-500 transition-all duration-200"
                    />
                    <h4 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : ''} transition-all duration-200`}>{task.title}</h4>
                  </div>
                  <div className="task-actions flex space-x-2">
                    <button 
                      onClick={() => openEditPopup(task)} 
                      className="task-action-btn text-gray-400 hover:text-purple-600 transition-colors duration-200"
                      title="Edit task"
                    >
                      <Edit size={24} />
                    </button>
                    <span className="action-separator text-gray-300">|</span>
                    <button 
                      onClick={() => toggleTaskStarred(task.id)} 
                      className={`task-action-btn ${task.starred ? 'text-yellow-500 starred' : 'text-gray-400'} hover:text-yellow-500 transition-colors duration-200`}
                      title={task.starred ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star size={24} fill={task.starred ? 'currentColor' : 'none'} />
                    </button>
                    <span className="action-separator text-gray-300">|</span>
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="task-action-btn text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Delete task"
                    >
                      <Trash size={24} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-4 text-gray-600">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>Created: {formatDate(task.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-[#9d75b5]" />
                      <span>{task.category}</span>
                    </div>
                    <div className={`flex items-center rounded-full px-2 py-1 text-white ${getPriorityColor(task.priority)} transition-all duration-200`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </div>
                    {task.assignedTo || task.groupId ? (
                      <div className="flex items-center">
                        {task.assignedTo ? (
                          <User size={16} className="mr-1 text-blue-500" />
                        ) : (
                          <Users size={16} className="mr-1 text-green-500" />
                        )}
                        <span>{getAssignedDisplay(task)}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-center">
            <button className="rounded-md bg-purple-600 px-6 py-2 text-white shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}