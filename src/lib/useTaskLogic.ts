'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { differenceInMinutes, isPast, format, addHours } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { useNotification } from '@/contexts/notification-context';
import { fetchTasks, createTask, updateTask, deleteTask as deleteTaskApi } from '@/api/tasks';
import type { Task } from '@/types';
import { useTranslation } from 'react-i18next';

interface TimeRemaining {
  text: string;
  isOverdue: boolean;
  isApproaching: boolean;
}

export const useTaskLogic = () => {
  const { t } = useTranslation(['tasks', 'notifications']);
  const { addNotification } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreationPopupOpen, setCreationPopupOpen] = useState(false);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load tasks on mount
  useEffect(() => {
    async function loadTasks() {
      try {
        const loadedTasks = await fetchTasks();
        console.log('Loaded tasks:', loadedTasks);
        setTasks(loadedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        addNotification('error', t('notifications:tasks.loadFailed.title'), t('notifications:tasks.loadFailed.message'));
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, [addNotification, t]);

  // Function for trimming long named tasks
  const truncateTitle = (title: string, maxLength: number = 30): string => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength - 3) + '...';
  };

  const toggleTaskCompletion = async (id: number) => {
    if (isUpdating) {
      console.warn('toggleTaskCompletion skipped: update already in progress');
      return;
    }
    const task = tasks.find((task) => task.id === id);
    if (!task) {
      console.error('Task with id', id, 'not found');
      addNotification('error', t('notifications:tasks.undefinedTask.title'), t('notifications:tasks.undefinedTask.message'));
      return;
    }
    setIsUpdating(true);
    try {
      const updatedTask = {
        ...task,
        completed: !task.completed,
        due_date: task.dueDate.replace('T', ' ').slice(0, 19),
        priority: { high: 'H', medium: 'M', low: 'L' }[task.priority] || 'M',
        is_favorite: task.starred,
      };
      await updateTask(id, updatedTask);
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        'info',
        task.completed ? t('notifications:taskReopened.title') : t('notifications:taskCompleted.title'),
        task.completed
          ? t('notifications:taskReopened.message', { title: truncatedTitle })
          : t('notifications:taskCompleted.message', { title: truncatedTitle })
      );
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      addNotification('error', t('notifications:tasks.updateFailed.title'), t('notifications:tasks.updateFailed.message'));
    } finally {
      setIsUpdating(false);
    }
  };

  const snoozeTask = async (id: number) => {
    if (isUpdating) {
      console.warn('snoozeTask skipped: update already in progress');
      return;
    }
    const task = tasks.find((task) => task.id === id);
    if (!task) {
      console.error('Task with id', id, 'not found');
      addNotification('error', t('notifications:tasks.undefinedTask.title'), t('notifications:tasks.undefinedTask.message'));
      return;
    }
    setIsUpdating(true);
    try {
      const now = new Date();
      const currentDueDate = new Date(task.dueDate);
      const newDueDate = isPast(currentDueDate) ? addHours(now, 2) : addHours(currentDueDate, 2);
      const updatedTask = {
        ...task,
        due_date: newDueDate.toISOString().replace('T', ' ').slice(0, 19),
        priority: { high: 'H', medium: 'M', low: 'L' }[task.priority] || 'M',
        is_favorite: task.starred,
      };
      await updateTask(id, updatedTask);
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        'info',
        t('notifications:taskSnoozed.title'),
        t('notifications:taskSnoozed.message', { title: truncatedTitle })
      );
    } catch (error) {
      console.error('Failed to snooze task:', error);
      addNotification('error', t('notifications:tasks.updateFailed.title'), t('notifications:tasks.updateFailed.message'));
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTaskStarred = async (id: number) => {
    if (isUpdating) {
      console.warn('toggleTaskStarred skipped: update already in progress');
      return;
    }
    const task = tasks.find((task) => task.id === id);
    if (!task) {
      console.error('Task with id', id, 'not found');
      addNotification('error', t('notifications:tasks.undefinedTask.title'), t('notifications:tasks.undefinedTask.message'));
      return;
    }
    setIsUpdating(true);
    try {
      const updatedTask = {
        ...task,
        is_favorite: !task.starred,
        due_date: task.dueDate.replace('T', ' ').slice(0, 19),
        priority: { high: 'H', medium: 'M', low: 'L' }[task.priority] || 'M',
      };
      console.log('Sending update for starred task:', updatedTask);
      await updateTask(id, updatedTask);
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        'success',
        task.starred ? t('notifications:removedFromFavorites.title') : t('notifications:addedToFavorites.title'),
        task.starred
          ? t('notifications:removedFromFavorites.message', { title: truncatedTitle })
          : t('notifications:addedToFavorites.message', { title: truncatedTitle })
      );
    } catch (error) {
      console.error('Failed to toggle task starred:', error);
      addNotification('error', t('notifications:tasks.updateFailed.title'), t('notifications:tasks.updateFailed.message'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateTask = async (task: Partial<Task>) => {
    if (isCreating) {
      console.warn('handleCreateTask skipped: creation already in progress');
      return;
    }
    if (!task.title || !task.title.trim()) {
      addNotification('error', t('notifications:tasks.invalidTitle.title'), t('notifications:tasks.invalidTitle.message'));
      return;
    }
    setIsCreating(true);
    try {
      const now = new Date();
      const newTask = {
        title: task.title.trim(),
        description: task.description || '',
        due_date: task.dueDate || now.toISOString().replace('T', ' ').slice(0, 19),
        category: task.category || undefined,
        priority: task.priority ? { high: 'H', medium: 'M', low: 'L' }[task.priority] : 'M',
        completed: false,
        is_favorite: false,
      };
      console.log('Sending task to API:', newTask);
      await createTask(newTask);
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
      setCreationPopupOpen(false);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        'success',
        t('notifications:taskCreated.title'),
        t('notifications:taskCreated.message', { title: truncatedTitle })
      );
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage =
        error.response?.data?.due_date?.[0] ||
        error.response?.data?.priority?.[0] ||
        t('notifications:tasks.addFailed.message');
      addNotification('error', t('notifications:tasks.addFailed.title'), errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    if (isUpdating) {
      console.warn('handleEditTask skipped: update already in progress');
      return;
    }
    if (!updatedTask.title || !updatedTask.title.trim()) {
      addNotification('error', t('notifications:tasks.invalidTitle.title'), t('notifications:tasks.invalidTitle.message'));
      return;
    }
    setIsUpdating(true);
    try {
      const taskToSend = {
        ...updatedTask,
        due_date: updatedTask.dueDate.replace('T', ' ').slice(0, 19),
        priority: { high: 'H', medium: 'M', low: 'L' }[updatedTask.priority] || 'M',
        is_favorite: updatedTask.starred,
      };
      await updateTask(updatedTask.id, taskToSend);
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
      setEditPopupOpen(false);
      setTaskToEdit(null);
      const truncatedTitle = truncateTitle(updatedTask.title);
      addNotification(
        'success',
        t('notifications:taskUpdated.title'),
        t('notifications:taskUpdated.message', { title: truncatedTitle })
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      addNotification('error', t('notifications:tasks.updateFailed.title'), t('notifications:tasks.updateFailed.message'));
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditPopup = (task: Task) => {
    setTaskToEdit(task);
    setEditPopupOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (isDeleting) {
      console.warn('handleDeleteTask skipped: deletion already in progress');
      return;
    }
    const task = tasks.find((task) => task.id === id);
    if (!task) {
      console.error('Task with id', id, 'not found');
      addNotification('error', t('notifications:tasks.undefinedTask.title'), t('notifications:tasks.undefinedTask.message'));
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTaskApi(id);
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        'success',
        t('notifications:taskDeleted.title'),
        t('notifications:taskDeleted.message', { title: truncatedTitle })
      );
    } catch (error) {
      console.error('Failed to delete task:', error);
      addNotification('error', t('notifications:tasks.deletionFailed.title'), t('notifications:tasks.deletionFailed.message'));
    } finally {
      setIsDeleting(false);
    }
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

  const formatDate = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      const locale = t('tasks:language') === 'ua' ? uk : enUS;
      const dateFormat = t('tasks:language') === 'ua' ? 'd MMMM yyyy' : 'MMM d, yyyy';
      const timeFormat = 'HH:mm';
      const formattedDate = format(date, dateFormat, { locale });
      const formattedTime = format(date, timeFormat);
      return t('tasks:language') === 'ua'
        ? `${formattedDate} о ${formattedTime}`
        : `${formattedDate} at ${formattedTime}`;
    },
    [t]
  );

  const getTimeRemaining = (dueDate: string, completed: boolean = false): TimeRemaining => {
    const now = new Date();
    const due = new Date(dueDate);
    const minutesLeft = differenceInMinutes(due, now);

    if (completed) {
      return {
        text: t('tasks:timeRemaining.completed'),
        isOverdue: false,
        isApproaching: false,
      };
    }

    if (isPast(due)) {
      return {
        text: t('tasks:timeRemaining.overdue'),
        isOverdue: true,
        isApproaching: false,
      };
    }

    const days = Math.floor(minutesLeft / (60 * 24));
    const hours = Math.floor((minutesLeft % (60 * 24)) / 60);
    const minutes = minutesLeft % 60;

    if (days > 0) {
      return {
        text: t('tasks:timeRemaining.dueInDays', {
          days,
          hours,
          minutes,
          dayPlural: days > 1 ? t('tasks:timeRemaining.days') : t('tasks:timeRemaining.day'),
        }),
        isOverdue: false,
        isApproaching: minutesLeft <= 1440,
      };
    }

    const isUkrainian = t('tasks:language') === 'ua';
    const hourPlural = isUkrainian
      ? hours === 1
        ? t('tasks:timeRemaining.hour')
        : t('tasks:timeRemaining.hours')
      : hours === 1
      ? t('tasks:timeRemaining.hour')
      : t('tasks:timeRemaining.hours');
    const minutePlural = isUkrainian
      ? minutes === 1
        ? t('tasks:timeRemaining.minute')
        : t('tasks:timeRemaining.minutes')
      : minutes === 1
      ? t('tasks:timeRemaining.minute')
      : t('tasks:timeRemaining.minutes');

    return {
      text: t('tasks:timeRemaining.dueInHours', {
        hours,
        minutes,
        hourPlural,
        minutePlural,
      }),
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
        (task.category && task.category.toLowerCase().includes(query)) ||
        task.priority.toLowerCase().includes(query) ||
        formatDate(task.createdAt).toLowerCase().includes(query) ||
        formatDate(task.dueDate).toLowerCase().includes(query)
      );
    });
  }, [tasks, searchQuery, formatDate]);

  return {
    tasks,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
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