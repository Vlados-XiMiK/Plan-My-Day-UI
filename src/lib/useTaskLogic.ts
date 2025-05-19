"use client";

import { useState, useCallback, useEffect } from "react";
import {
  differenceInMinutes,
  isPast,
  format,
  parseISO,
  addHours,
} from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { useNotification } from "@/contexts/notification-context";
import {
  fetchTasks,
  fetchFavoriteTasks,
  fetchTodayTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskApi,
  mapClientPriorityToApi,
} from "@/api/tasks";
import { useCategories } from "@/lib/useCategories";
import type { Task, CreateTaskPayload } from "@/types";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";

// Interface for API errors
interface ApiErrorResponse {
  due_date?: string[];
  priority?: string[];
}

// Interface for time until deadline
interface TimeRemaining {
  text: string;
  isOverdue: boolean;
  isApproaching: boolean;
}

export const useTaskLogic = () => {
  const { t } = useTranslation(["tasks", "notifications"]);
  const { addNotification } = useNotification();
  const { categories, refreshCategories } = useCategories();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreationPopupOpen, setCreationPopupOpen] = useState(false);
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // State of filters with neutral initial values
  const [filters, setFilters] = useState<{
    search: string;
    status: "" | "completed" | "incomplete";
    priority: "" | "high" | "medium" | "low";
    sort:
      | ""
      | "created_at"
      | "-created_at"
      | "due_date"
      | "-due_date"
      | "favorites"
      | "today";
  }>({
    search: "",
    status: "",
    priority: "",
    sort: "",
  });

  // Loading tasks taking into account filters
  const loadTasks = async (resetPage: boolean = false) => {
    try {
      const currentPage = resetPage ? 1 : page;
      let response;

      // Forming filtering parameters
      const taskFilters: {
        page?: number;
        completed?: boolean;
        priority?: "H" | "M" | "L";
        ordering?: string;
        search?: string;
      } = { page: currentPage };

      if (filters.search) taskFilters.search = filters.search;
      if (filters.status === "completed") taskFilters.completed = true;
      if (filters.status === "incomplete") taskFilters.completed = false;
      if (filters.priority)
        taskFilters.priority = mapClientPriorityToApi(filters.priority);
      if (filters.sort && !["favorites", "today"].includes(filters.sort))
        taskFilters.ordering = filters.sort;

      // Select the appropriate endpoint
      // console.log(`Loading tasks with sort: ${filters.sort}, page: ${currentPage}, filters:`, taskFilters);
      if (filters.sort === "favorites") {
        response = await fetchFavoriteTasks(currentPage);
      } else if (filters.sort === "today") {
        response = await fetchTodayTasks(currentPage);
      } else {
        response = await fetchTasks(taskFilters);
      }

      // console.log('Loaded response:', JSON.stringify(response, null, 2));
      // console.log('Tasks count:', response.results.length, 'Total count:', response.count);

      // Update tasks
      const newTasks = resetPage
        ? response.results
        : [...tasks, ...response.results];
      // console.log('New tasks to set:', JSON.stringify(newTasks, null, 2));
      setTasks(newTasks);

      // Refresh the page
      setPage(currentPage + 1);

      // Check hasMore: if next === null or count <= loaded tasks
      const totalLoadedTasks = newTasks.length;
      const newHasMore =
        response.next !== null && totalLoadedTasks < response.count;
      setHasMore(newHasMore);
      // console.log('Set hasMore:', newHasMore, 'Next URL:', response.next, 'Total loaded:', totalLoadedTasks, 'Count:', response.count);
    } catch (error: unknown) {
      // console.error("Error loading tasks:", error);
      addNotification(
        "error",
        t("notifications:tasks.loadFailed.title"),
        t("notifications:tasks.loadFailed.message")
      );
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Loading initial tasks
  useEffect(() => {
    // console.log('Filters changed:', filters);
    setTasks([]); // Reset tasks when filters change
    setPage(1); // Reset the page
    setHasMore(true); // Reset hasMore
    loadTasks(true); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Debugging categories
  // useEffect(() => {
  //  console.log('Categories in useTaskLogic:', categories);
  // }, [categories]);

  // Loading additional tasks
  const loadMoreTasks = async () => {
    if (!hasMore) {
      console.warn("No more tasks to load");
      return;
    }
    await loadTasks();
  };

  // Updating filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    // console.log('Updating filters:', newFilters);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      sort: "",
    });
    setPage(1);
    setTasks([]);
    setHasMore(true);
  };

  // Opening the creation popup with a category refetch
  const setCreationPopupOpenWithRefresh = async (open: boolean) => {
    if (open) {
      await refreshCategories();
    }
    setCreationPopupOpen(open);
  };

  // Opening an edit popup with a category refetch
  const openEditPopup = async (task: Task) => {
    await refreshCategories();
    setTaskToEdit(task);
    setEditPopupOpen(true);
  };

  // Truncate long headers
  const truncateTitle = (name: string, maxLength: number = 30): string => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 3) + "...";
  };

  const toggleTaskCompletion = async (id: number) => {
    if (isUpdating) {
      console.warn("toggleTaskCompletion skipped: update already in progress");
      return;
    }
    const task = tasks.find((task) => task.id === id);
    if (!task) {
      // console.error("Task with id", id, "not found");
      addNotification(
        "error",
        t("notifications:tasks.undefinedTask.title"),
        t("notifications:tasks.undefinedTask.message")
      );
      return;
    }
    setIsUpdating(true);
    try {
      // console.log('Original dueDate:', task.dueDate);
      // Parse dueDate
      let currentDueDate: Date;
      try {
        if (task.dueDate.includes(" ")) {
          currentDueDate = new Date(task.dueDate.replace(" ", "T") + "Z");
        } else {
          currentDueDate = parseISO(task.dueDate);
        }
        if (isNaN(currentDueDate.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (error) {
        // console.error("Parsing error dueDate:", error);
        throw new Error("Invalid date format");
      }

      // console.log('Parsed currentDueDate:', currentDueDate.toISOString());
      // If the date is in the past, use the current date and time + 2 hours
      const now = new Date();
      const baseDate = isPast(currentDueDate) ? now : currentDueDate;
      // console.log('Base date:', baseDate.toISOString());
      // Add 2 hours if date is expired
      const newDueDate = isPast(currentDueDate)
        ? addHours(baseDate, 2)
        : baseDate;
      // console.log('Base date:', newDueDate.toISOString());
      // Format the date for the API (YYYY-MM-DD HH:mm:ss)
      const formattedDueDate = format(newDueDate, "yyyy-MM-dd HH:mm:ss");
      // console.log('Formatted due_date for API:', formattedDueDate);

      const updatedTask: CreateTaskPayload = {
        title: task.title,
        description: task.description,
        due_date: formattedDueDate,
        priority: mapClientPriorityToApi(task.priority),
        completed: !task.completed,
        is_favorite: task.starred,
        category: task.category,
      };
      //  console.log('Object sent to API:', updatedTask);

      await updateTask(id, updatedTask);
      await loadTasks(true);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        "info",
        task.completed
          ? t("notifications:taskReopened.title")
          : t("notifications:taskCompleted.title"),
        task.completed
          ? t("notifications:taskReopened.message", { title: truncatedTitle })
          : t("notifications:taskCompleted.message", { title: truncatedTitle })
      );
    } catch (error: unknown) {
      // console.error("Failed to toggle task completion:", error);
      addNotification(
        "error",
        t("notifications:tasks.updateFailed.title"),
        t("notifications:tasks.updateFailed.message")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const snoozeTask = async (id: number) => {
    if (isUpdating) {
      console.warn("snoozeTask skipped: update already in progress");
      return;
    }
    const task = tasks.find((task) => task.id === id);
    if (!task) {
      // console.error("Task with id", id, "not found");
      addNotification(
        "error",
        t("notifications:tasks.undefinedTask.title"),
        t("notifications:tasks.undefinedTask.message")
      );
      return;
    }
    setIsUpdating(true);
    try {
      // console.log('Original dueDate:', task.dueDate);
      // Parse dueDate
      let currentDueDate: Date;
      try {
        if (task.dueDate.includes(" ")) {
          currentDueDate = new Date(task.dueDate.replace(" ", "T") + "Z");
        } else {
          currentDueDate = parseISO(task.dueDate);
        }
        if (isNaN(currentDueDate.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (error) {
        // console.error("Error parsing dueDate:", error);
        throw new Error("Invalid date format");
      }

      // console.log("Parsed currentDueDate:", currentDueDate.toISOString());
      // If the date is in the past, use the current date and time
      const now = new Date();
      const baseDate = isPast(currentDueDate) ? now : currentDueDate;
      // console.log("Base date to add:", baseDate.toISOString());
      // Add 2 hours
      const newDueDate = addHours(baseDate, 2);
      // console.log("New newDueDate:", newDueDate.toISOString());
      // Format the date for the API (YYYY-MM-DD HH:mm:ss)
      const formattedDueDate = format(newDueDate, "yyyy-MM-dd HH:mm:ss");
      // console.log("Formatted due_date for API:", formattedDueDate);

      const updatedTask: CreateTaskPayload = {
        title: task.title,
        description: task.description,
        due_date: formattedDueDate,
        priority: mapClientPriorityToApi(task.priority),
        completed: task.completed,
        is_favorite: task.starred,
        category: task.category,
      };
      // console.log("Object sent to API:", updatedTask);

      await updateTask(id, updatedTask);
      await loadTasks(true);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        "info",
        t("notifications:taskSnoozed.title"),
        t("notifications:taskSnoozed.message", { title: truncatedTitle })
      );
    } catch (error: unknown) {
      // console.error("Error while postponing task:", error);
      addNotification(
        "error",
        t("notifications:tasks.updateFailed.title"),
        t("notifications:tasks.updateFailed.message")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTaskStarred = async (id: number) => {
    if (isUpdating) {
      console.warn("toggleTaskStarred skipped: update already in progress");
      return;
    }
    const task = tasks.find((task) => task.id === id);
    if (!task) {
      // console.error("Task with id", id, "not found");
      addNotification(
        "error",
        t("notifications:tasks.undefinedTask.title"),
        t("notifications:tasks.undefinedTask.message")
      );
      return;
    }
    setIsUpdating(true);
    try {
      const updatedTask: CreateTaskPayload = {
        title: task.title,
        description: task.description,
        due_date: task.dueDate.replace("T", " ").slice(0, 19),
        priority: mapClientPriorityToApi(task.priority),
        completed: task.completed,
        is_favorite: !task.starred,
        category: task.category,
      };
      await updateTask(id, updatedTask);
      await loadTasks(true);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        "success",
        task.starred
          ? t("notifications:removedFromFavorites.title")
          : t("notifications:addedToFavorites.title"),
        task.starred
          ? t("notifications:removedFromFavorites.message", {
              title: truncatedTitle,
            })
          : t("notifications:addedToFavorites.message", {
              title: truncatedTitle,
            })
      );
    } catch (error: unknown) {
      // console.error("Failed to toggle task starred:", error);
      addNotification(
        "error",
        t("notifications:tasks.updateFailed.title"),
        t("notifications:tasks.updateFailed.message")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateTask = async (task: Partial<Task>) => {
    if (isCreating) {
      console.warn("handleCreateTask skipped: creation already in progress");
      return;
    }
    if (!task.title || !task.title.trim()) {
      addNotification(
        "error",
        t("notifications:tasks.invalidTitle.title"),
        t("notifications:tasks.invalidTitle.message")
      );
      return;
    }
    setIsCreating(true);
    try {
      const now = new Date();
      const newTask: CreateTaskPayload = {
        title: task.title.trim(),
        description: task.description || "",
        due_date:
          task.dueDate || now.toISOString().replace("T", " ").slice(0, 19),
        category: task.category ?? null,
        priority: task.priority ? mapClientPriorityToApi(task.priority) : "M",
        completed: false,
        is_favorite: false,
      };
      await createTask(newTask);
      await refreshCategories();
      await loadTasks(true);
      setCreationPopupOpen(false);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        "success",
        t("notifications:taskCreated.title"),
        t("notifications:taskCreated.message", { title: truncatedTitle })
      );
    } catch (error: unknown) {
      // console.error("Failed to create task:", error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.due_date?.[0] ||
        axiosError.response?.data?.priority?.[0] ||
        t("notifications:tasks.addFailed.message");
      addNotification(
        "error",
        t("notifications:tasks.addFailed.title"),
        errorMessage
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    if (isUpdating) {
      console.warn("handleEditTask skipped: update already in progress");
      return;
    }
    if (!updatedTask.title || !updatedTask.title.trim()) {
      addNotification(
        "error",
        t("notifications:tasks.invalidTitle.title"),
        t("notifications:tasks.invalidTitle.message")
      );
      return;
    }
    setIsUpdating(true);
    try {
      const taskToSend: CreateTaskPayload = {
        title: updatedTask.title,
        description: updatedTask.description,
        due_date: updatedTask.dueDate.replace("T", " ").slice(0, 19),
        priority: mapClientPriorityToApi(updatedTask.priority),
        completed: updatedTask.completed,
        is_favorite: updatedTask.starred,
        category: updatedTask.category ?? null,
      };
      await updateTask(updatedTask.id, taskToSend);
      await refreshCategories();
      await loadTasks(true);
      setEditPopupOpen(false);
      setTaskToEdit(null);
      const truncatedTitle = truncateTitle(updatedTask.title);
      addNotification(
        "success",
        t("notifications:taskUpdated.title"),
        t("notifications:taskUpdated.message", { title: truncatedTitle })
      );
    } catch (error: unknown) {
      // console.error("Failed to update task:", error);
      addNotification(
        "error",
        t("notifications:tasks.updateFailed.title"),
        t("notifications:tasks.updateFailed.message")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (isDeleting) {
      console.warn("handleDeleteTask skipped: deletion already in progress");
      return;
    }
    const task = tasks.find((task) => task.id === id);
    if (!task) {
      // console.error("Task with id", id, "not found");
      addNotification(
        "error",
        t("notifications:tasks.undefinedTask.title"),
        t("notifications:tasks.undefinedTask.message")
      );
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTaskApi(id);
      await loadTasks(true);
      const truncatedTitle = truncateTitle(task.title);
      addNotification(
        "success",
        t("notifications:taskDeleted.title"),
        t("notifications:taskDeleted.message", { title: truncatedTitle })
      );
    } catch (error: unknown) {
      // console.error("Failed to delete task:", error);
      addNotification(
        "error",
        t("notifications:tasks.deletionFailed.title"),
        t("notifications:tasks.deletionFailed.message")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      const locale = t("tasks:language") === "ua" ? uk : enUS;
      const dateFormat =
        t("tasks:language") === "ua" ? "d MMMM yyyy" : "MMM d, yyyy";
      const timeFormat = "HH:mm";
      const formattedDate = format(date, dateFormat, { locale });
      const formattedTime = format(date, timeFormat);
      return t("tasks:language") === "ua"
        ? `${formattedDate} о ${formattedTime}`
        : `${formattedDate} at ${formattedTime}`;
    },
    [t]
  );

  const getTimeRemaining = (
    dueDate: string,
    completed: boolean = false
  ): TimeRemaining => {
    const now = new Date();
    const due = new Date(dueDate);
    const minutesLeft = differenceInMinutes(due, now);

    if (completed) {
      return {
        text: t("tasks:timeRemaining.completed"),
        isOverdue: false,
        isApproaching: false,
      };
    }

    if (isPast(due)) {
      return {
        text: t("tasks:timeRemaining.overdue"),
        isOverdue: true,
        isApproaching: false,
      };
    }

    const days = Math.floor(minutesLeft / (60 * 24));
    const hours = Math.floor((minutesLeft % (60 * 24)) / 60);
    const minutes = minutesLeft % 60;

    if (days > 0) {
      return {
        text: t("tasks:timeRemaining.dueInDays", {
          days,
          hours,
          minutes,
          dayPlural:
            days > 1
              ? t("tasks:timeRemaining.days")
              : t("tasks:timeRemaining.day"),
        }),
        isOverdue: false,
        isApproaching: minutesLeft <= 1440,
      };
    }

    const isUkrainian = t("tasks:language") === "ua";
    const hourPlural = isUkrainian
      ? hours === 1
        ? t("tasks:timeRemaining.hour")
        : t("tasks:timeRemaining.hours")
      : hours === 1
      ? t("tasks:timeRemaining.hour")
      : t("tasks:timeRemaining.hours");
    const minutePlural = isUkrainian
      ? minutes === 1
        ? t("tasks:timeRemaining.minute")
        : t("tasks:timeRemaining.minutes")
      : minutes === 1
      ? t("tasks:timeRemaining.minute")
      : t("tasks:timeRemaining.minutes");

    return {
      text: t("tasks:timeRemaining.dueInHours", {
        hours,
        minutes,
        hourPlural,
        minutePlural,
      }),
      isOverdue: false,
      isApproaching: true,
    };
  };

  return {
    tasks,
    setTasks,
    categories,
    isLoading: isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isCreationPopupOpen,
    setCreationPopupOpen: setCreationPopupOpenWithRefresh,
    isEditPopupOpen,
    setEditPopupOpen,
    taskToEdit,
    filters,
    updateFilters,
    resetFilters,
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
    refreshCategories,
    loadMoreTasks,
    hasMore,
  };
};
