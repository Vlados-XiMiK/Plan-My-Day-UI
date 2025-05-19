"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Task, Category, CreateTaskPayload } from "@/types";
import { fetchAllTasks, fetchCategories } from "@/lib/tasks-data";
import { createTask, updateTask, mapClientPriorityToApi } from "@/api/tasks";

export function useCalendar(initialTasks: Task[] = [], initialCategories: Category[] = []) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(Array.isArray(initialTasks) ? initialTasks : []);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"month" | "list">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

// Load tasks and categories on initialization
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, categoriesData] = await Promise.all([fetchAllTasks(), fetchCategories()]);
        console.log(`Loaded ${tasksData.length} tasks and ${categoriesData.length} categories in useCalendar`);
        setTasks(tasksData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load data in useCalendar:", error);
        setTasks([]);
        setCategories([]);
      }
    };

    loadData();
  }, []);

  // Function to update categories
  const refreshCategories = useCallback(async () => {
    try {
      const categoriesData = await fetchCategories();
      console.log(`Refreshed ${categoriesData.length} categories`);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to refresh categories:", error);
      setCategories([]);
    }
  }, []);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get the first day of the MUSLIMmonth
  const firstDayOfMonth = useMemo(() => new Date(currentYear, currentMonth, 1), [currentMonth, currentYear]);
  const startingDayOfWeek = useMemo(() => firstDayOfMonth.getDay(), [firstDayOfMonth]);

  // Get the number of days in the month
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentMonth, currentYear]);

  // Get the name of the month
  const monthName = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long" }).format(currentDate),
    [currentDate]
  );

  // Create a mapping of category names to their colors
  const categoryColorMap = useMemo(() => {
    const colorMap: Record<string, { color: string; icon: string }> = {};
    categories.forEach((category) => {
      colorMap[category.name] = {
        color: `bg-[${category.color}]/10 text-[${category.color}] dark:bg-[${category.color}]/30 dark:text-[${category.color}]/90`,
        icon: "📋",
      };
    });
    colorMap["other"] = { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300", icon: "📋" };
    return colorMap;
  }, [categories]);

  // Toggle task completion status
  const toggleTaskCompletion = useCallback(
    async (taskId: number) => {
      try {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) {
          console.error(`Task with id ${taskId} not found`);
          return;
        }

        const updatedTaskData: CreateTaskPayload = {
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          priority: mapClientPriorityToApi(task.priority),
          completed: !task.completed,
          is_favorite: task.starred,
          category: task.category,
        };

        const updatedTask = await updateTask(taskId, updatedTaskData);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
        );
      } catch (error) {
        console.error("Failed to toggle task completion:", error);
      }
    },
    [tasks]
  );

  // Filter tasks based on search query, selected categories, and completion status
  const filterTasks = useCallback(
    (taskList: Task[]) => {
      let filtered = [...taskList];

      if (!showCompleted) {
        filtered = filtered.filter((task) => !task.completed);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query))
        );
      }

      if (selectedCategories.length > 0) {
        filtered = filtered.filter((task) => {
          if (task.category == null) {
            return selectedCategories.includes(0);
          }
          return selectedCategories.includes(task.category);
        });
      }

      return filtered;
    },
    [searchQuery, selectedCategories, showCompleted]
  );

  // Navigate to previous month with animation
  const prevMonth = useCallback(() => {
    setDirection("right");
    setTimeout(() => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() - 1);
        return newDate;
      });
      setAnimationKey((prev) => prev + 1);
    }, 50);
  }, []);

  // Navigate to next month with animation
  const nextMonth = useCallback(() => {
    setDirection("left");
    setTimeout(() => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + 1);
        return newDate;
      });
      setAnimationKey((prev) => prev + 1);
    }, 50);
  }, []);

  // Go to today
  const goToToday = useCallback(() => {
    const today = new Date();
    if (today.getMonth() !== currentMonth || today.getFullYear() !== currentYear) {
      if (today.getTime() < currentDate.getTime()) {
        setDirection("right");
      } else {
        setDirection("left");
      }
      setTimeout(() => {
        setCurrentDate(today);
        setAnimationKey((prev) => prev + 1);
      }, 50);
    }
  }, [currentDate, currentMonth, currentYear]);

  // Change year
  const changeYear = useCallback(
    (year: number) => {
      if (year !== currentYear) {
        setDirection(year < currentYear ? "right" : "left");
        setTimeout(() => {
          setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setFullYear(year);
            return newDate;
          });
          setAnimationKey((prev) => prev + 1);
        }, 50);
      }
    },
    [currentYear]
  );

  // Change month
  const changeMonth = useCallback(
    (monthIndex: number) => {
      if (monthIndex !== currentMonth) {
        setDirection(monthIndex < currentMonth ? "right" : "left");
        setTimeout(() => {
          setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(monthIndex);
            return newDate;
          });
          setAnimationKey((prev) => prev + 1);
        }, 50);
      }
    },
    [currentMonth]
  );

  // Generate array of years for the year picker (current year ±10 years)
  const getYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  }, []);

  // Reset animation direction after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDirection(null);
    }, 500);
    return () => clearTimeout(timer);
  }, [animationKey]);

  // Create calendar days array
  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [daysInMonth, startingDayOfWeek]);

  // Get tasks for a specific day
  const getTasksForDay = useCallback(
    (day: number) => {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return filterTasks(
        tasks.filter((task) => {
          const taskDate = task.dueDate.split("T")[0];
          return taskDate === date;
        })
      );
    },
    [currentMonth, currentYear, tasks, filterTasks]
  );

  // Open modal to add a task for a specific day
  const openAddTaskModal = useCallback(
    (day: number) => {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      setSelectedDate(date);
      setIsModalOpen(true);
    },
    [currentMonth, currentYear]
  );

  // Add a new task through API
  const addTask = useCallback(
    async (task: Omit<Task, "id" | "createdAt" | "starred">) => {
      try {
        const taskPayload: CreateTaskPayload = {
          title: task.title,
          description: task.description || "",
          due_date: task.dueDate,
          category: task.category || null,
          priority: mapClientPriorityToApi(task.priority),
          completed: task.completed || false,
          is_favorite: false,
        };

        const newTask = await createTask(taskPayload);
        setTasks((prevTasks) => [...prevTasks, newTask]);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    },
    []
  );

  // Get all tasks for the current month
  const getMonthTasks = useCallback(() => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    return filterTasks(
      tasks.filter((task) => {
        const taskDate = new Date(task.dueDate.split("T")[0]);
        return taskDate >= monthStart && taskDate <= monthEnd;
      })
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [currentMonth, currentYear, filterTasks, tasks]);

  // Toggle category selection
  const toggleCategory = useCallback((categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  }, []);

  // Clear all selected categories
  const clearCategoryFilters = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  // Get all unique categories from tasks
  const allCategories = useMemo(() => {
    if (!Array.isArray(tasks)) {
      console.error("tasks is not an array:", tasks);
      return [];
    }
    return Array.from(new Set(tasks.map((task) => task.category).filter((c): c is number => c != null)));
  }, [tasks]);

  // Open task detail modal
  const openTaskDetail = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  // Close task detail modal
  const closeTaskDetail = useCallback(() => {
    setSelectedTask(null);
  }, []);

  // Toggle showing completed tasks
  const toggleShowCompleted = useCallback(() => {
    setShowCompleted((prev) => !prev);
  }, []);

  // Validate and normalize input data for setTasks
  const setTasksSafe = useCallback((newTasks: Task[]) => {
    if (!Array.isArray(newTasks)) {
      console.error("setTasks received non-array value:", newTasks);
      setTasks([]);
      return;
    }
    setTasks(newTasks);
  }, []);

  return {
    currentDate,
    currentMonth,
    currentYear,
    monthName,
    tasks,
    setTasks: setTasksSafe,
    categories,
    setCategories,
    selectedDate,
    view,
    setView,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    direction,
    animationKey,
    selectedTask,
    showCompleted,
    isModalOpen,
    setIsModalOpen,
    categoryColorMap,
    toggleTaskCompletion,
    filterTasks,
    prevMonth,
    nextMonth,
    goToToday,
    changeYear,
    changeMonth,
    getYearOptions,
    calendarDays,
    getTasksForDay,
    openAddTaskModal,
    addTask,
    getMonthTasks,
    toggleCategory,
    clearCategoryFilters,
    allCategories,
    openTaskDetail,
    closeTaskDetail,
    toggleShowCompleted,
    refreshCategories,
  };
}