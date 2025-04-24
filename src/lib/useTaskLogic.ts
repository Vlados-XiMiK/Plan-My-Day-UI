import { useState, useMemo } from 'react';
import { differenceInMinutes, isPast, format, addHours } from 'date-fns';
import { useNotification } from '@/contexts/notification-context';
import type { Task } from '@/types';

interface TimeRemaining {
  text: string;
  isOverdue: boolean;
  isApproaching: boolean;
}

export const useTaskLogic = (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  const { addNotification } = useNotification();
  const [isCreationPopupOpen, setCreationPopupOpen] = useState(false);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    const task = tasks.find((task) => task.id === id);
    if (task) {
      addNotification(
        'info',
        task.completed ? 'Task Reopened' : 'Task Completed',
        task.completed ? 'The task has been reopened and is now active again.' : 'You have successfully marked the task as completed.'
      );
    }
  };

  const snoozeTask = (id: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const now = new Date();
          const currentDueDate = new Date(task.dueDate);
          // Если задача просрочена, устанавливаем новый срок как текущее время + 2 часа
          const newDueDate = isPast(currentDueDate)
            ? addHours(now, 2)
            : addHours(currentDueDate, 2); // Иначе добавляем 2 часа к текущему dueDate
          return { ...task, dueDate: newDueDate.toISOString() };
        }
        return task;
      })
    );
    const task = tasks.find((task) => task.id === id);
    if (task) {
      addNotification(
        'info',
        'Task Snoozed',
        `Task "${task.title}" has been snoozed for 2 hours.`
      );
    }
  };

  const toggleTaskStarred = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, starred: !task.starred } : task
      )
    );
    const task = tasks.find((task) => task.id === id);
    if (task) {
      addNotification(
        'success',
        task.starred ? 'Removed from Favorites' : 'Added to Favorites',
        task.starred ? 'The task has been removed from your favorites list.' : 'The task has been added to your favorites list.'
      );
    }
  };

  const handleCreateTask = (task: Partial<Task>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      title: task.title || 'New Task',
      description: task.description || '',
      createdAt: now,
      dueDate: task.dueDate || now,
      category: task.category || 'Uncategorized',
      priority: task.priority || 'low',
      completed: false,
      starred: false,
      date: task.date || new Date(now).toISOString().split('T')[0],
    };
    setTasks([...tasks, newTask]);
    setCreationPopupOpen(false);
    addNotification('success', 'Task Created', 'The task has been successfully created.');
  };

  const handleEditTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditPopupOpen(false);
    setTaskToEdit(null);
    addNotification('success', 'Task Updated', 'The task has been successfully updated.');
  };

  const openEditPopup = (task: Task) => {
    setTaskToEdit(task);
    setEditPopupOpen(true);
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
    addNotification('success', 'Task Deleted', 'The task has been successfully removed.');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, 'MMM d, yyyy')} at ${format(date, 'HH:mm')}`;
  };

  const getTimeRemaining = (dueDate: string): TimeRemaining => {
    const now = new Date();
    const due = new Date(dueDate);
    const minutesLeft = differenceInMinutes(due, now);

    if (isPast(due)) return { text: 'Overdue', isOverdue: true, isApproaching: false };
    const days = Math.floor(minutesLeft / (60 * 24));
    const hours = Math.floor((minutesLeft % (60 * 24)) / 60);
    const minutes = minutesLeft % 60;

    if (days > 0) {
      return {
        text: `Due in ${days} day${days > 1 ? 's' : ''} ${hours}h ${minutes}m`,
        isOverdue: false,
        isApproaching: minutesLeft <= 1440,
      };
    }
    return {
      text: `Due in ${hours}h ${minutes}m`,
      isOverdue: false,
      isApproaching: true,
    };
  };

  const filterTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query) ||
        formatDate(task.createdAt).toLowerCase().includes(query) ||
        formatDate(task.dueDate).toLowerCase().includes(query)
      );
    });
  }, [tasks, searchQuery]);

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
    filterTasks,
  };
};