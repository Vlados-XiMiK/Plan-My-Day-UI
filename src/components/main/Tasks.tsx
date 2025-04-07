"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Edit,
  Star,
  Trash,
  Plus,
  Calendar,
  Clock,
  User as UserIcon,
  AlertTriangle,
} from "lucide-react";
import TaskCreationPopup from "@/components/main/pop-up/TaskCreationPopup";
import TaskEditPopup from "@/components/main/pop-up/TaskEditPopup";
import { useTheme } from "next-themes";
import { useTaskLogic } from "@/lib/useTaskLogic";
import type { Task, User, Group } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/translations/en.json";
import ukTranslations from "@/translations/uk.json";

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Complete project proposal",
    description: "Finish the draft and send it for review",
    createdAt: "2024-06-08T10:00:00",
    dueDate: "2025-02-26T23:00:00",
    category: "Work",
    priority: "high",
    completed: false,
    starred: false
  },
  {
    id: 2,
    title: "Buy groceries",
    description: "Get items for the week",
    createdAt: "2024-06-09T14:30:00",
    dueDate: "2026-06-10T18:00:00",
    category: "Shopping",
    priority: "medium",
    completed: true,
    starred: true
  },
  {
    id: 3,
    title: "Schedule dentist appointment",
    description: "Call the clinic for a check-up",
    createdAt: "2024-06-10T09:15:00",
    dueDate: "2025-02-25T15:00:00",
    category: "Personal",
    priority: "low",
    completed: false,
    starred: false
  },
];

export default function MainContent() {
  const { theme } = useTheme();
  const users: User[] = [];
  const groups: Group[] = [];
  const { language } = useLanguage(); 
  const t = language === "uk" ? ukTranslations : en;
  const {
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
  } = useTaskLogic(initialTasks, users, groups);
  const [isFiltersCollapsed, setFiltersCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
      <TaskCreationPopup
        isOpen={isCreationPopupOpen}
        onClose={() => setCreationPopupOpen(false)}
        onSave={handleCreateTask}
        categories={["Work", "Shopping", "Personal"]}
        users={users}
        groups={groups}
      />
      {taskToEdit && (
        <TaskEditPopup
          isOpen={isEditPopupOpen}
          onClose={() => setEditPopupOpen(false)}
          onSave={handleEditTask}
          task={taskToEdit}
          categories={["Work", "Shopping", "Personal"]}
          users={users}
          groups={groups}
        />
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        <div className="rounded-lg bg-white dark:bg-[#2a2a3e] p-6 shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {t.tasks.filtersAndSearch || "Filters and Search"}
            </h3>
            <button
              onClick={() => setFiltersCollapsed(!isFiltersCollapsed)}
              className="text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
            >
              {isFiltersCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </button>
          </div>
          <div className={`flex flex-wrap gap-4 ${isFiltersCollapsed ? "hidden" : "block"}`}>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white dark:bg-[#2a2a3e] text-gray-800 dark:text-gray-100"
                  placeholder={t.tasks.searchPlaceholder || "Search (e.g., 'high priority work this week')"}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white dark:bg-[#2a2a3e] text-gray-800 dark:text-gray-100">
                  <option>{t.tasks.allStatus || "All Status"}</option>
                  <option>{t.tasks.completed || "Completed"}</option>
                  <option>{t.tasks.incomplete || "Incomplete"}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white dark:bg-[#2a2a3e] text-gray-800 dark:text-gray-100">
                  <option>{t.tasks.allPriority || "All Priority"}</option>
                  <option>{t.tasks.high || "High"}</option>
                  <option>{t.tasks.medium || "Medium"}</option>
                  <option>{t.tasks.low || "Low"}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-white dark:bg-[#2a2a3e] text-gray-800 dark:text-gray-100">
                  <option>{t.tasks.createdDate || "Created Date"}</option>
                  <option>{t.tasks.lastModified || "Last Modified"}</option>
                  <option>{t.tasks.dueDate || "Due Date"}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
            </div>
          </div>
          {!isFiltersCollapsed && (
            <button
              className="mt-4 rounded-md bg-transparent border border-purple-600 text-purple-600 dark:text-purple-400 px-4 py-2 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-700 transition-all duration-200"
            >
              {t.tasks.clearFilters || "Clear Filters"}
            </button>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => setCreationPopupOpen(true)}
            className="flex items-center rounded-md bg-purple-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-purple-700 duration-200"
          >
            <Plus className="mr-2" size={20} />
            {t.tasks.createTask || "Create Task"}
          </button>
        </div>

        <div className="rounded-lg bg-white dark:bg-[#2a2a3e] p-6 shadow-lg">
          <ul className="space-y-4">
            {filterTasks().length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                {t.tasks.noTasks || "No tasks"}{" "}
                {language === "uk" ? "або Немає завдань" : "or No tasks"}
              </p>
            ) : (
              filterTasks().map((task) => {
                const { text: timeRemaining, isOverdue, isApproaching } = getTimeRemaining(task.dueDate);
                return (
                  <li
                    key={task.id}
                    className={`overflow-hidden rounded-lg bg-white dark:bg-[#2a2a3e] shadow-md transition-all duration-200 hover:shadow-lg ${
                      isOverdue && !task.completed ? "border-2 border-red-500" : isApproaching && !task.completed ? "border-2 border-yellow-500" : ""
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
                        <h4 className={`text-lg font-semibold max-w-[250px] truncate ${task.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100"} transition-all duration-200`}>{task.title}</h4>
                      </div>
                      <div className="task-actions flex space-x-2">
                        <button
                          onClick={() => openEditPopup(task)}
                          className="task-action-btn text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                          title={t.tasks.editTask || "Edit task"}
                        >
                          <Edit size={24} />
                        </button>
                        <span className="action-separator text-gray-300 dark:text-gray-600">|</span>
                        <button
                          onClick={() => toggleTaskStarred(task.id)}
                          className={`task-action-btn ${task.starred ? "text-yellow-500" : "text-gray-400 dark:text-gray-500"} hover:text-yellow-500 transition-colors duration-200`}
                          title={task.starred ? t.tasks.removeFromFavorites || "Remove from favorites" : t.tasks.addToFavorites || "Add to favorites"}
                        >
                          <Star size={24} fill={task.starred ? "currentColor" : "none"} />
                        </button>
                        <span className="action-separator text-gray-300 dark:text-gray-600">|</span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="task-action-btn text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                          title={t.tasks.deleteTask || "Delete task"}
                        >
                          <Trash size={24} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                    <p className="mb-4 text-gray-600 dark:text-gray-400 break-all max-w-full">
  {task.description}
</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          <span>{t.tasks.created || "Created"}: {formatDate(task.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          <span>{t.tasks.due || "Due"}: {formatDate(task.dueDate)}</span>
                        </div>
                        <div className="flex items-center">
                          {isOverdue && !task.completed ? (
                            <AlertTriangle size={16} className="mr-1 text-red-500" />
                          ) : isApproaching && !task.completed ? (
                            <AlertTriangle size={16} className="mr-1 text-yellow-500" />
                          ) : (
                            <Clock size={16} className="mr-1" />
                          )}
                          <span className={isOverdue && !task.completed ? "text-red-500" : isApproaching && !task.completed ? "text-yellow-500" : ""}>
                            {timeRemaining}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-1 h-3 w-3 rounded-full bg-[#9d75b5]" />
                          <span>{task.category}</span>
                        </div>
                        <div className={`flex items-center rounded-full px-2 py-1 text-white ${getPriorityColor(task.priority)} transition-all duration-200`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} {t.tasks.priority || "Priority"}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
          {filterTasks().length > 10 && (
            <div className="mt-4 flex justify-center">
              <button className="rounded-md bg-purple-600 px-6 py-2 text-white shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2">
                {t.tasks.loadMore || "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}