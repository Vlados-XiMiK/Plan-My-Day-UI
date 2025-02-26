"use client";

import { BarChart2, PieChart, TrendingUp } from "lucide-react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useLanguage } from "@/contexts/LanguageContext"; // Імпортуємо хук для мови
import en from "@/translations/en.json"; // Англійські переклади
import uk from "@/translations/uk.json"; // Українські переклади

// Регистрация компонентов Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function StatsView() {
  // Отримуємо мову з контексту
  const { language } = useLanguage();
  const t = language === "uk" ? uk : en; // Вибираємо переклади залежно від мови

  // Дані для графіків
  const taskDistributionData = {
    labels: [
      "Work",
      "Personal",
      "Shopping",
    ],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: ["#9333EA", "#3B82F6", "#10B981"], // Фіолетовий, Синій, Зелений
        hoverOffset: 4,
      },
    ],
  };

  const productivityData = {
    labels: [
      t.stats.productivity.lastWeek || "Last Week",
      t.stats.productivity.thisWeek || "This Week",
    ],
    datasets: [
      {
        label: t.stats.productivity.label || "Productivity",
        data: [80, 85],
        backgroundColor: "#10B981",
        borderColor: "#10B981",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn min-h-screen relative">
      <div className="relative z-20 flex flex-col h-full">
        <div className="mb-6 bg-white dark:bg-[#2a2a3e] p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 drop-shadow-md">
            {t.stats.title || "Statistics"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t.stats.subtitle || "Overview of your task management"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Завершённые задачи с анимацией */}
            <div className="bg-white dark:bg-[#2a2a3e] rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {t.stats.tasksCompleted || "Tasks Completed"}
                </h3>
                <BarChart2 className="h-6 w-6 text-purple-500 dark:text-purple-400 animate-pulse" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">24</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t.stats.last7Days || "Last 7 days"}
              </p>
            </div>

            {/* Оценка продуктивности с графиком */}
            <div className="bg-white dark:bg-[#2a2a3e] rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {t.stats.productivityScore || "Productivity Score"}
                </h3>
                <TrendingUp className="h-6 w-6 text-green-500 dark:text-green-400 animate-bounce" />
              </div>
              <Chart
                type="bar"
                data={productivityData}
                options={{
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100 } },
                }}
                className="mt-2"
              />
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">85%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t.stats.productivityChange || "+5% from last week"}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                {t.stats.productivityMessage || "Great job! You’re on your way to 100%!"}
              </p>
            </div>

            {/* Распределение задач с круговым графиком */}
            <div className="bg-white dark:bg-[#2a2a3e] rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {t.stats.taskDistribution.title || "Task Distribution"}
                </h3>
                <PieChart className="h-6 w-6 text-blue-500 dark:text-blue-400 animate-spin-slow" />
              </div>
              <Chart
                type="pie"
                data={taskDistributionData}
                options={{ plugins: { legend: { position: "bottom" } } }}
                className="mt-2 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}