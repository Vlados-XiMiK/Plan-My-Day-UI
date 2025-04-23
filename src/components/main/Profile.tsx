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
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import en from "@/translations/en.json";
import ukTranslations from "@/translations/uk.json";
import Avatar from "@/components/ui/Avatar";
import Loader from "@/components/ui/preloader";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { user, stats } = useUser();
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const router = useRouter();
  const { language } = useLanguage();
  const t = language === "uk" ? ukTranslations : en;

  useEffect(() => {
    const updateIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    updateIsDesktop();
    window.addEventListener("resize", updateIsDesktop);
    return () => window.removeEventListener("resize", updateIsDesktop);
  }, []);

  // Проверяем, есть ли данные пользователя, если нет — показываем "Loading..."
  if (!user) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn relative min-h-screen">
      <div className="relative z-20">
        <div className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-scaleIn">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t.profile.title || "Profile"}
            </h1>
            <button
              onClick={() => router.push("/dashboard/tasks")}
              className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-[#3a3a5e] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4a4a7e] transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.profile.backToTasks || "Back to Tasks"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar name={user.name.split(" ")[0]} surname={user.name.split(" ")[1]} />

            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">
                  {user.name}
                </h2>
                <div className="space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t.profile.editProfile || "Edit Profile"}
                  </button>
                  <EditProfilePopup isOpen={isEditing} onClose={() => setIsEditing(false)} />
                  {isDesktop && (
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-[#3a3a5e] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4a4a7e] transition-all duration-200 hover:scale-105"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {t.profile.settings || "Settings"}
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70 transition-all duration-200 hover:scale-105"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.profile.logout || "Logout"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <span>{t.profile.emailLabel || "Email"}: {user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <span>{t.profile.phoneLabel || "Phone number"}: {user.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Building2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <span>{t.profile.workplaceLabel || "Place of work"}: {user.workplace}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <User2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <span>{t.profile.ageLabel || "Age"}: {user.age}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t.profile.taskCompletionRate || "Task Completion Rate"}
              </h3>
              {stats.totalTasks === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  {t.profile.noTasksYet || "No tasks completed yet"}
                </p>
              ) : (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                  <PieChart
                    data={[
                      { value: completionRate, color: "#9333EA" },
                      { value: 100 - completionRate, color: "#E9D5FF" },
                    ]}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent`}
                    >
                      {completionRate}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t.profile.activeTasks || "Active Tasks"}
            </h3>
            {stats.totalTasks === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                {t.profile.noTasksYet || "No tasks completed yet"}
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t.profile.ongoing || "Ongoing"}</span>
                    <span>{stats.ongoingTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-[#3a3a5e] rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          stats.totalTasks > 0 ? (stats.ongoingTasks / stats.totalTasks) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t.profile.completed || "Completed"}</span>
                    <span>{stats.completedTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-[#3a3a5e] rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t.profile.recentActivity || "Recent Activity"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                <span>{t.profile.lastLogin || "Last login"}: Today at 09:29 AM</span>
              </div>
              <div className="flex items-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                <span>{t.profile.profileEdited || "Profile edited"}: Dec 3, 2024</span>
              </div>
              <div className="flex items-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
                <span>{t.profile.lastTaskCompleted || "Last task completed"}: Dec 4, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}