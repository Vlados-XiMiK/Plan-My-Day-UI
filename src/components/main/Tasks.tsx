'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, Edit, Star, Trash, Plus, Calendar, Clock, AlertTriangle } from 'lucide-react';
import TaskCreationPopup from '@/components/main/pop-up/TaskCreationPopup';
import TaskEditPopup from '@/components/main/pop-up/TaskEditPopup';
import FloatingDeadlineReminder from '@/components/ui/deadline-notification/floating-deadline-reminder';
import { useTaskLogic } from '@/lib/useTaskLogic';
import { Task } from '@/types';
import { useTranslation } from 'react-i18next';
import { isAuthenticated } from '@/api/auth';
import { motion, AnimatePresence } from 'framer-motion';

// Animations from CategoriesPage
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2, ease: [0.6, 0.05, 0.01, 0.99] } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } },
};

export default function Tasks() {
  const { t } = useTranslation('tasks');
  const router = useRouter();
  const [isFiltersCollapsed, setFiltersCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState('');

// Checking authorization
  useEffect(() => {
    async function checkAuth() {
      const auth = await isAuthenticated();
      if (!auth) {
        router.replace('/auth/login');
      }
    }
    checkAuth();
  }, [router]);

  const {
    tasks,
    categories,
    isLoading,
    isCreationPopupOpen,
    setCreationPopupOpen,
    isEditPopupOpen,
    setEditPopupOpen,
    taskToEdit,
    filters,
    updateFilters,
    resetFilters,
    toggleTaskCompletion,
    toggleTaskStarred,
    handleCreateTask,
    handleEditTask,
    openEditPopup,
    handleDeleteTask,
    snoozeTask,
    getPriorityColor,
    formatDate,
    getTimeRemaining,
    loadMoreTasks,
    hasMore,
  } = useTaskLogic();

  // Enter key handler for search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateFilters({ search: searchInput });
    }
  };

  // Search button click handler
  const handleSearchClick = () => {
    updateFilters({ search: searchInput });
  };

  // Debugging categories
  useEffect(() => {
    console.log('Categories in Tasks:', categories);
  }, [categories]);

  const TaskItem = ({ task }: { task: Task }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const descriptionLengthLimit = 100;

   // Find the category name by category
    const categoryName = typeof task.category === 'number'
      ? categories.find(cat => cat.id === task.category)?.name || 'No Category'
      : 'No Category';

    return (
      <li
        key={task.id}
        className={`overflow-hidden rounded-lg bg-white dark:bg-[#2a2a3e] shadow-md transition-all duration-200 hover:shadow-lg ${
          getTimeRemaining(task.dueDate, task.completed).isOverdue && !task.completed
            ? 'border-2 border-red-500'
            : getTimeRemaining(task.dueDate, task.completed).isApproaching && !task.completed
            ? 'border-2 border-yellow-500'
            : ''
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id)}
              className="mr-4 h-5 w-5 rounded text-purple-600 focus:ring-purple-500 transition-all duration-200"
            />
            <h4
              className={`text-lg font-semibold ${
                task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'
              } transition-all duration-200`}
            >
              {task.title}
            </h4>
          </div>
          <div className="task-actions flex space-x-2">
            <button
              onClick={() => openEditPopup(task)}
              className="text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
              title={t('editTask')}
            >
              <Edit size={24} />
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={() => toggleTaskStarred(task.id)}
              className={`${
                task.starred ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'
              } hover:text-yellow-500 transition-colors duration-200`}
              title={task.starred ? t('removeFromFavorites') : t('addToFavorites')}
            >
              <Star size={24} fill={task.starred ? 'currentColor' : 'none'} />
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
              title={t('deleteTask')}
            >
              <Trash size={24} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between w-full">
            <p
              className={`mb-4 text-gray-600 dark:text-gray-400 ${
                isExpanded ? '' : 'line-clamp-2'
              } break-words w-[calc(100%-40px)] sm:w-[calc(100%-40px)] pr-2 overflow-hidden`}
            >
              {task.description}
            </p>
            {task.description.length > descriptionLengthLimit && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 flex-shrink-0 w-8"
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>
                {t('created')}: {formatDate(task.createdAt)}
              </span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>
                {t('due')}: {formatDate(task.dueDate)}
              </span>
            </div>
            <div className="flex items-center">
              {getTimeRemaining(task.dueDate, task.completed).isOverdue && !task.completed ? (
                <AlertTriangle size={16} className="mr-1 text-red-500" />
              ) : getTimeRemaining(task.dueDate, task.completed).isApproaching && !task.completed ? (
                <AlertTriangle size={16} className="mr-1 text-yellow-500" />
              ) : (
                <Clock size={16} className="mr-1" />
              )}
              <span
                className={
                  getTimeRemaining(task.dueDate, task.completed).isOverdue && !task.completed
                    ? 'text-red-500'
                    : getTimeRemaining(task.dueDate, task.completed).isApproaching && !task.completed
                    ? 'text-yellow-500'
                    : ''
                }
              >
                {getTimeRemaining(task.dueDate, task.completed).text}
              </span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-[#9d75b5]" />
              <span>{categoryName}</span>
            </div>
            <div
              className={`flex items-center rounded-full px-2 py-1 text-white ${getPriorityColor(
                task.priority
              )} transition-all duration-200`}
            >
              {t(`priority.${task.priority}`)} {t('priority.label')}
            </div>
          </div>
        </div>
      </li>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-[#1e1e2f]">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
        <TaskCreationPopup
          isOpen={isCreationPopupOpen}
          onClose={() => setCreationPopupOpen(false)}
          onSave={handleCreateTask}
          categories={categories}
        />
        {taskToEdit && (
          <TaskEditPopup
            isOpen={isEditPopupOpen}
            onClose={() => setEditPopupOpen(false)}
            onSave={handleEditTask}
            task={taskToEdit}
            categories={categories}
          />
        )}

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-6">
          <div className="rounded-lg bg-white dark:bg-[#2a2a3e] p-4 sm:p-6 shadow-lg transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">{t('filtersAndSearch')}</h3>
              <button
                onClick={() => setFiltersCollapsed(!isFiltersCollapsed)}
                className="text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
              >
                {isFiltersCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
              </button>
            </div>
            <div className={`flex flex-wrap gap-4 ${isFiltersCollapsed ? 'hidden' : 'block'}`}>
              <div className="flex-1 min-w-[200px] flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white dark:bg-[#2a2a3e] text-gray-800 dark:text-gray-100"
                    placeholder={t('searchPlaceholder')}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />
                </div>
                <button
                  onClick={handleSearchClick}
                  className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-all duration-200"
                >
                  {t('searchButton')}
                </button>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilters({ status: e.target.value as '' | 'completed' | 'incomplete' })}
                    className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white dark:bg-[#2a2a3e] text-gray-800 dark:text-gray-100"
                  >
                    <option value="">{t('status.select')}</option>
                    <option value="completed">{t('status.completed')}</option>
                    <option value="incomplete">{t('status.incomplete')}</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-2.5 text-gray-400 dark:text-gray-500"
                    size={20}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <select
                    value={filters.priority}
                    onChange={(e) => updateFilters({ priority: e.target.value as '' | 'high' | 'medium' | 'low' })}
                    className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white dark:bg-[#2a2a3e] text-gray-800 dark:text-gray-100"
                  >
                    <option value="">{t('priority.select')}</option>
                    <option value="high">{t('priority.high')}</option>
                    <option value="medium">{t('priority.medium')}</option>
                    <option value="low">{t('priority.low')}</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-2.5 text-gray-400 dark:text-gray-500"
                    size={20}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilters({ sort: e.target.value as '' | 'created_at' | '-created_at' | 'due_date' | '-due_date' | 'favorites' | 'today' })}
                    className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white dark:bg-[#2a2a3e] text-gray-800 dark:text-gray-100"
                  >
                    <option value="">{t('sort.select')}</option>
                    <option value="created_at">{t('sort.createdDate')}</option>
                    <option value="-created_at">{t('sort.createdDateDesc')}</option>
                    <option value="due_date">{t('sort.dueDate')}</option>
                    <option value="-due_date">{t('sort.dueDateDesc')}</option>
                    <option value="favorites">{t('sort.favorites')}</option>
                    <option value="today">{t('sort.today')}</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-2.5 text-gray-400 dark:text-gray-500"
                    size={20}
                  />
                </div>
              </div>
            </div>
            {!isFiltersCollapsed && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-md bg-transparent border border-purple-600 text-purple-600 dark:text-purple-400 px-4 py-2 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-700 transition-all duration-200"
              >
                {t('clearFilters')}
              </button>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={() => setCreationPopupOpen(true)}
              className="flex items-center rounded-md bg-purple-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-purple-700 duration-200"
            >
             

 <Plus className="mr-2" size={20} />
              {t('createTask')}
            </button>
          </div>

          <div className="rounded-lg  p-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence mode="popLayout">
                {tasks.length === 0 ? (
                  <motion.div
                    className="text-center py-12"
                    variants={itemVariants}
                  >
                    <motion.div
                      className="mx-auto w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4"
                      animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    >
                      <div className="text-purple-500 dark:text-purple-300 text-4xl">📋</div>
                    </motion.div>
                    <motion.h3
                      className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1"
                      variants={itemVariants}
                    >
                      {t('noTasks')}
                    </motion.h3>
                    <motion.p
                      className="text-gray-500 dark:text-gray-400"
                      variants={itemVariants}
                    >
                      {t('noTasksMessage')} 🎉 {t('noTasksCallToAction')}
                    </motion.p>
                  </motion.div>
                ) : (
                  <ul className="space-y-4">
                    {tasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </ul>
                )}
              </AnimatePresence>
            </motion.div>
            {hasMore && tasks.length > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={loadMoreTasks}
                  className="rounded-md bg-purple-600 px-6 py-2 text-white shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                >
                  {t('loadMore')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <FloatingDeadlineReminder
        tasks={tasks}
        onComplete={toggleTaskCompletion}
        onSnooze={snoozeTask}
      />
    </>
  );
}