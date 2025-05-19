"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart2, PieChart, TrendingUp, AlertCircle } from "lucide-react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  BarController,
  PieController,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  TooltipItem,
  Legend,
} from "chart.js";
import { motion, MotionProps } from "framer-motion";
import { HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/contexts/notification-context";
import { fetchTasks, fetchCategories } from "@/lib/tasks-data";
import { Task, Category } from "@/types";
import { isAuthenticated } from "@/api/auth";
import Loader from "@/components/ui/preloader";

// Register Chart.js components
ChartJS.register(
  BarElement,
  BarController,
  PieController,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>;

export default function StatsView() {
  const { t } = useTranslation("stats");
  const { addNotification } = useNotification();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(false); // Для статуса авторизации
  const [authLoading, setAuthLoading] = useState(true); // Для проверки авторизации

  // Проверка авторизации
  useEffect(() => {
    async function checkAuth() {
      const auth = await isAuthenticated();
      setIsAuth(auth);
      setAuthLoading(false);

      if (!auth) {
        router.replace("/auth/login"); // Перенаправление на логин, если не авторизован
      }
    }
    checkAuth();
  }, [router]);

  // Fetch tasks and categories
  useEffect(() => {
    async function loadData() {
      if (!isAuth) return; // Не загружаем данные, если не авторизован
      try {
        const [loadedTasks, loadedCategories] = await Promise.all([
          fetchTasks(),
          fetchCategories(),
        ]);
        setTasks(loadedTasks);
        setCategories(loadedCategories);
        setError(null);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(t("error.loadFailed"));
        addNotification(
          "error",
          t("error.loadFailedTitle"),
          t("error.loadFailed")
        );
      } finally {
        setIsLoading(false);
      }
    }
    if (isAuth) {
      loadData();
    }
  }, [isAuth, addNotification, t]);

  // Показываем лоадер во время проверки авторизации
  if (authLoading) {
    return <Loader />;
  }

  // Если не авторизован, ничего не рендерим (редирект уже выполнен)
  if (!isAuth) {
    return null;
  }

  if (isLoading) {
    return <Loader />;
  }

  // Helper to get tasks for a specific week (Monday to Sunday)
  const getTasksForWeek = (weekOffset: number): Task[] => {
    const now = new Date();
    const startOfWeek = new Date(now);
    // Set to Monday of the target week
    startOfWeek.setDate(
      now.getDate() - (now.getDay() || 7) + 1 + weekOffset * 7
    );
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      const taskDate = new Date(task.date || task.dueDate);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
  };

  // Calculate statistics
  const tasksCompletedLast7Days = tasks.filter((task) => {
    const taskDate = new Date(task.date || task.dueDate);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return task.completed && taskDate >= sevenDaysAgo && taskDate <= now;
  }).length;

  const thisWeekTasks = getTasksForWeek(0);
  const lastWeekTasks = getTasksForWeek(-1);
  const thisWeekCompleted = thisWeekTasks.filter(
    (task) => task.completed
  ).length;
  const lastWeekCompleted = lastWeekTasks.filter(
    (task) => task.completed
  ).length;
  const thisWeekProductivity =
    thisWeekTasks.length > 0
      ? (thisWeekCompleted / thisWeekTasks.length) * 100
      : 0;
  const lastWeekProductivity =
    lastWeekTasks.length > 0
      ? (lastWeekCompleted / lastWeekTasks.length) * 100
      : 0;
  const productivityChange = thisWeekProductivity - lastWeekProductivity;

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Calculate statistics
  const taskDistribution = categories
    .map((category) => ({
      name: category.name,
      count: tasks.filter((task) => task.category === category.id).length,
      color: category.color, // Note: This color is no longer used for the chart
    }))
    .filter((item) => item.count > 0);

  // Chart data for task distribution with random colors
  const taskDistributionData = {
    labels: taskDistribution.map((item) => item.name),
    datasets: [
      {
        data: taskDistribution.map((item) => item.count),
        backgroundColor: taskDistribution.map(() => getRandomColor()),
        borderColor: taskDistribution.map(() => getRandomColor()),
        borderWidth: 1,
        hoverOffset: 20,
      },
    ],
  };

  const productivityData = {
    labels: [t("productivity.lastWeek"), t("productivity.thisWeek")],
    datasets: [
      {
        label: t("productivity.label"),
        data: [lastWeekProductivity, thisWeekProductivity],
        backgroundColor: ["#6EE7B7", "#10B981"],
        borderColor: ["#6EE7B7", "#10B981"],
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 40,
      },
    ],
  };

  // Chart options
  const pieChartOptions = {
    plugins: {
      legend: { position: "bottom" as const, labels: { color: "#6B7280" } },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: "#4B5563",
        borderWidth: 1,
      },
    },
    animation: { duration: 1000, easing: "easeOutQuart" as const },
  };

  const barChartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: "#4B5563",
        borderWidth: 1,
        callbacks: {
          label: (context: TooltipItem<"bar">) =>
            `${(context.raw as number).toFixed(1)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#6B7280",
          callback: function (tickValue: number | string): string {
            return `${tickValue}%`;
          },
        },
        grid: {
          color: "#E5E7EB",
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: "#6B7280",
        },
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const,
    },
  };

  // Retry fetch
  const retryFetch = () => {
    setIsLoading(true);
    setError(null);
    async function loadData() {
      try {
        const [loadedTasks, loadedCategories] = await Promise.all([
          fetchTasks(),
          fetchCategories(),
        ]);
        setTasks(loadedTasks);
        setCategories(loadedCategories);
        setError(null);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(t("error.loadFailed"));
        addNotification(
          "error",
          t("error.loadFailedTitle"),
          t("error.loadFailed")
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Loading UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-[#1e1e2f]">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-[#1e1e2f]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={retryFetch}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-6">
      <motion.div
        className="mb-8 bg-white dark:bg-[#2a2a3e] p-8 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        {...({} as MotionDivProps)}
      >
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t("title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t("subtitle")}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tasks Completed */}
        <motion.div
          className="bg-white dark:bg-[#2a2a3e] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          {...({} as MotionDivProps)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              {t("tasksCompleted")}
            </h3>
            <BarChart2 className="h-6 w-6 text-purple-500 dark:text-purple-400 animate-pulse" />
          </div>
          <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-4">
            {tasksCompletedLast7Days}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t("last7Days")}
          </p>
        </motion.div>

        {/* Productivity Score */}
        <motion.div
          className="bg-white dark:bg-[#2a2a3e] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          {...({} as MotionDivProps)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              {t("productivityScore")}
            </h3>
            <TrendingUp className="h-6 w-6 text-green-500 dark:text-green-400 animate-bounce" />
          </div>
          <div className="h-48 mt-4">
            {productivityData && productivityData.datasets?.length > 0 ? (
              <Chart
                type="bar"
                data={productivityData}
                options={barChartOptions}
              />
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                {t("loadingData")}
              </p>
            )}
          </div>
          <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-4">
            {thisWeekTasks.length === 0
              ? "—"
              : `${Math.round(thisWeekProductivity)}%`}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {thisWeekTasks.length === 0
              ? t("noTasksThisWeek")
              : `${
                  productivityChange >= 0
                    ? `+${Math.round(productivityChange)}%`
                    : `${Math.round(productivityChange)}%`
                } ${t("productivityChange")}`}
          </p>
          {thisWeekTasks.length > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
              {thisWeekProductivity >= lastWeekProductivity
                ? t("productivityMessage")
                : t("productivityDecline")}
            </p>
          )}
        </motion.div>

        {/* Task Distribution */}
        <motion.div
          className="bg-white dark:bg-[#2a2a3e] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          {...({} as MotionDivProps)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              {t("taskDistribution.title")}
            </h3>
            <PieChart className="h-6 w-6 text-blue-500 dark:text-blue-400 animate-spin-slow" />
          </div>
          <div className="h-64 mt-4">
            {taskDistributionData &&
            taskDistributionData.datasets?.length > 0 ? (
              <Chart
                type="pie"
                data={taskDistributionData}
                options={pieChartOptions}
              />
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
                {taskDistribution.length === 0
                  ? t("noTasks")
                  : t("loadingData")}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
