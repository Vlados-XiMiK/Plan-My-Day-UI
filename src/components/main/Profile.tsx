"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  User2,
  Mail,
  Phone,
  Building2,
  Clock,
  Edit2,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { PieChart } from "@/components/ui/pie-chart";
import EditProfilePopup from "@/components/main/pop-up/EditProfilePopup";
import SettingsPopup from "@/components/main/pop-up/SettingsPopup";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { isAuthenticated } from "@/api/auth";
import Avatar from "@/components/ui/Avatar";
import Loader from "@/components/ui/preloader";

export default function Profile() {
  const { t, i18n } = useTranslation("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { user, stats } = useUser();
  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;
  const router = useRouter();
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

  useEffect(() => {
    const updateIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    updateIsDesktop();
    window.addEventListener("resize", updateIsDesktop);
    return () => window.removeEventListener("resize", updateIsDesktop);
  }, []);

  // Показываем лоадер во время проверки авторизации
  if (authLoading) {
    return <Loader />;
  }

  // Если не авторизован, ничего не рендерим (редирект уже выполнен)
  if (!isAuth) {
    return null;
  }

  if (!user) {
    return <Loader />;
  }

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === "ua" ? uk : enUS;
    const dateFormat = i18n.language === "ua" ? "d MMMM yyyy" : "MMM d, yyyy";
    const timeFormat = "HH:mm";
    const formattedDate = format(date, dateFormat, { locale });
    const formattedTime = format(date, timeFormat);
    return i18n.language === "ua"
      ? `${formattedDate} о ${formattedTime}`
      : `${formattedDate} at ${formattedTime}`;
  };

  return (
    <div className="mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen relative pb-24 md:pb-32 h-full overflow-y-auto">
      <div className="relative z-20">
        <div className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t("title")}
            </h1>
            <button
              onClick={() => router.push("/dashboard/tasks")}
              className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-[#3a3a5e] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4a4a7e] transition-all duration-200 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToTasks")}
            </button>
          </div>

          <div className="flex flex-col items-center sm:flex-row gap-4 sm:gap-6">
            <Avatar
              name={user.name.split(" ")[0]}
              surname={user.name.split(" ")[1]}
            />

            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {user.name}
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm sm:text-base"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t("editProfile")}
                  </button>
                  <EditProfilePopup
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                  />
                  {isDesktop && (
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-[#3a3a5e] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4a4a7e] transition-all duration-200 text-sm sm:text-base"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {t("settings")}
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70 transition-all duration-200 text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("logout")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {t("emailLabel")}: {user.email}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {t("phoneLabel")}: {user.phone}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Building2 className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {t("workplaceLabel")}: {user.workplace}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <User2 className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {t("ageLabel")}: {user.age}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SettingsPopup
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
          <div className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center h-auto min-h-[200px]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
              {t("taskCompletionRate")}
            </h3>
            {stats.totalTasks === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {t("noTasksYet")}
              </p>
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                  <PieChart
                    data={[
                      { value: completionRate, color: "#9333EA" },
                      { value: 100 - completionRate, color: "#E9D5FF" },
                    ]}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                      {completionRate}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl h-auto min-h-[200px]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t("activeTasks")}
            </h3>
            {stats.totalTasks === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                {t("noTasksYet")}
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t("ongoing")}</span>
                    <span>{stats.ongoingTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-[#3a3a5e] rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          stats.totalTasks > 0
                            ? (stats.ongoingTasks / stats.totalTasks) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t("completed")}</span>
                    <span>{stats.completedTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-[#3a3a5e] rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          stats.totalTasks > 0
                            ? (stats.completedTasks / stats.totalTasks) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t("recentActivity")}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="break-words">
                  {t("lastLogin")}: {formatActivityDate("2025-05-05T09:29:00Z")}
                </span>
              </div>
              <div className="flex items-start text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="break-words">
                  {t("profileEdited")}:{" "}
                  {formatActivityDate("2024-12-03T12:00:00Z")}
                </span>
              </div>
              <div className="flex items-start text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="break-words">
                  {t("lastTaskCompleted")}:{" "}
                  {formatActivityDate("2024-12-04T15:00:00Z")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
