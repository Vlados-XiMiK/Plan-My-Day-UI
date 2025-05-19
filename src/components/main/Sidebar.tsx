"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { BarChart3, List, CalendarDays, PlusCircle, Trash, Folder, Tag } from "lucide-react"
import { useTheme } from "next-themes"
import { useCategories } from "@/lib/useCategories"
import { useTranslation } from "react-i18next"
import { useRef } from "react"

interface SidebarProps {
  isVisible: boolean
  isCollapsed: boolean
}

export default function Sidebar({ isVisible, isCollapsed }: SidebarProps) {
  const { t } = useTranslation("welcome_main")
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const newInputRef = useRef<HTMLInputElement>(null)

  const {
    categories,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    newCategory,
    setNewCategory,
    newCategoryName,
    setNewCategoryName,
    editingId,
    tempCategory,
    setTempCategory,
    addCategory,
    deleteCategory,
    startEditing,
    saveEditing,
  } = useCategories()

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem("theme") || theme
      setIsDarkTheme(savedTheme === "dark")
    }
    updateTheme()
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") updateTheme()
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [theme])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    await addCategory()
    newInputRef.current?.focus()
  }

  const handleSaveEdit = async (id: number) => {
    await saveEditing(id)
  }

  const handleDeleteCategory = async (id: number) => {
    await deleteCategory(id)
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0" : "-translate-x-full"} 
        ${isCollapsed ? "w-20" : "w-72"}
        md:relative md:translate-x-0
        ${
          isDarkTheme
            ? "bg-gradient-to-b from-purple-950 to-gray-900 text-gray-100"
            : "bg-gradient-to-b from-gray-100 to-gray-200 sm:bg-gradient-to-b sm:from-gray-50 sm:to-beige-100 text-gray-900 sm:text-gray-800"
        }
        border-r ${isDarkTheme ? "border-purple-900" : "border-gray-300 sm:border-gray-200"}`}
    >
      <div
        className={`flex h-16 shrink-0 items-center justify-center backdrop-blur-sm border-b px-4 ${
          isDarkTheme ? "border-purple-900" : "border-gray-300 sm:border-gray-200"
        }`}
      >
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start w-full"}`}>
          <div className="h-16 w-16 overflow-hidden">
            <Image
              src="/logo.png"
              alt={t("logoAlt")}
              width={200}
              height={200}
              className="object-cover w-full h-full"
              onClick={() => router.push("/dashboard")}
            />
          </div>
          {!isCollapsed && (
            <h1
              className={`font-bold ml-3 text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400`}
            >
              Plan My Day
            </h1>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <button
          onClick={() => router.push("/dashboard/stats")}
          className={`flex w-full items-center rounded-lg p-3 ${
            isDarkTheme
              ? "hover:bg-purple-800/50 text-gray-100"
              : "hover:bg-gray-300/50 sm:hover:bg-gray-200/50 text-gray-800 sm:text-gray-700"
          } transition-all duration-200
            ${isCollapsed ? "justify-center" : ""} 
            ${
              pathname === "/dashboard/stats"
                ? `${
                    isDarkTheme ? "bg-purple-700" : "bg-amber-200 sm:bg-amber-100"
                  } text-${isDarkTheme ? "white" : "amber-900 sm:amber-800"}`
                : ""
            }`}
        >
          <BarChart3 className={`${isCollapsed ? "h-7 w-7" : "mr-3 h-7 w-7"}`} />
          {!isCollapsed && <span className="font-medium">{t("stats")}</span>}
        </button>
        <button
          onClick={() => router.push("/dashboard/tasks")}
          className={`flex w-full items-center rounded-lg p-3 ${
            isDarkTheme
              ? "hover:bg-purple-800/50 text-gray-100"
              : "hover:bg-gray-300/50 sm:hover:bg-gray-200/50 text-gray-800 sm:text-gray-700"
          } transition-all duration-200
            ${isCollapsed ? "justify-center" : ""} 
            ${
              pathname === "/dashboard/tasks"
                ? `${isDarkTheme ? "bg-purple-700" : "bg-emerald-200 sm:bg-emerald-100"} text-${
                    isDarkTheme ? "white" : "emerald-900 sm:emerald-800"
                  }`
                : ""
            }`}
        >
          <List className={`${isCollapsed ? "h-7 w-7" : "mr-3 h-7 w-7"}`} />
          {!isCollapsed && <span className="font-medium">{t("allTasks")}</span>}
        </button>
        <button
          onClick={() => router.push("/dashboard/calendar")}
          className={`flex w-full items-center rounded-lg p-3 ${
            isDarkTheme
              ? "hover:bg-purple-800/50 text-gray-100"
              : "hover:bg-gray-300/50 sm:hover:bg-gray-200/50 text-gray-800 sm:text-gray-700"
          } transition-all duration-200
            ${isCollapsed ? "justify-center" : ""} 
            ${
              pathname === "/dashboard/calendar"
                ? `${
                    isDarkTheme ? "bg-purple-700" : "bg-indigo-200 sm:bg-indigo-100"
                  } text-${isDarkTheme ? "white" : "indigo-900 sm:indigo-800"}`
                : ""
            }`}
        >
          <CalendarDays className={`${isCollapsed ? "h-7 w-7" : "mr-3 h-7 w-7"}`} />
          {!isCollapsed && <span className="font-medium">{t("calendar")}</span>}
        </button>
        <button
          onClick={() => router.push("/dashboard/projects")}
          className={`flex w-full items-center rounded-lg p-3 ${
            isDarkTheme
              ? "hover:bg-blue-800/50 text-gray-100"
              : "hover:bg-blue-300/50 sm:hover:bg-blue-200/50 text-gray-800 sm:text-gray-700"
          } transition-all duration-200
            ${isCollapsed ? "justify-center" : ""} 
            ${
              pathname === "/dashboard/projects"
                ? `${
                    isDarkTheme ? "bg-blue-700" : "bg-blue-200 sm:bg-blue-100"
                  } text-${isDarkTheme ? "white" : "blue-900 sm:blue-800"}`
                : ""
            }`}
        >
          <Folder className={`${isCollapsed ? "h-7 w-7" : "mr-3 h-7 w-7"}`} />
          {!isCollapsed && <span className="font-medium">{t("project")}</span>}
        </button>
        <button
          onClick={() => router.push("/dashboard/categories")}
          className={`flex w-full items-center rounded-lg p-3 ${
            isDarkTheme
              ? "hover:bg-blue-800/50 text-gray-100"
              : "hover:bg-blue-300/50 sm:hover:bg-blue-200/50 text-gray-800 sm:text-gray-700"
          } transition-all duration-200
            ${isCollapsed ? "justify-center" : ""} 
            ${
              pathname === "/dashboard/categories"
                ? `${
                    isDarkTheme ? "bg-blue-700" : "bg-blue-200 sm:bg-blue-100"
                  } text-${isDarkTheme ? "white" : "blue-900 sm:blue-800"}`
                : ""
            }`}
        >
          <Tag className={`${isCollapsed ? "h-7 w-7" : "mr-3 h-7 w-7"}`} />
          {!isCollapsed && <span className="font-medium">{t("categories")}</span>}
        </button>
      </nav>

      {!isCollapsed && (
        <div className="flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2
              className={`text-lg font-semibold ${isDarkTheme ? "text-purple-200" : "text-gray-900 sm:text-gray-800"}`}
            >
              {t("myCategories")}
            </h2>
            <button
              onClick={() => setNewCategory(true)}
              disabled={isCreating || isUpdating || isDeleting}
              className={`${
                isDarkTheme
                  ? "text-purple-300 hover:text-purple-200"
                  : "text-indigo-600 sm:text-indigo-500 hover:text-indigo-500 sm:hover:text-indigo-400"
              } transition-colors duration-200 ${
                isCreating || isUpdating || isDeleting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <PlusCircle className="h-6 w-6" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-t-purple-600 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      isDarkTheme
                        ? "bg-purple-900/30 hover:bg-purple-800/50"
                        : "bg-gray-50 sm:bg-white/50 hover:bg-gray-200 sm:hover:bg-gray-100"
                    } transition-all duration-200`}
                  >
                    <div className="flex items-center flex-1">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={tempCategory}
                          onChange={(e) => setTempCategory(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(category.id)}
                          onBlur={() => handleSaveEdit(category.id)}
                          className={`ml-2 flex-1 rounded-lg ${
                            isDarkTheme
                              ? "bg-purple-900/50 text-white placeholder-purple-300"
                              : "bg-gray-200 sm:bg-gray-100 text-gray-900 sm:text-gray-800 placeholder-gray-500 sm:placeholder-gray-400"
                          } border-none px-2 py-1 focus:ring-2 ${
                            isDarkTheme ? "focus:ring-purple-400" : "focus:ring-indigo-400 sm:focus:ring-indigo-300"
                          }`}
                          autoFocus
                          disabled={isUpdating || isDeleting}
                        />
                      ) : (
                        <span
                          onDoubleClick={() => {
                            // console.log("Starting edit for category:", category.id, category.name)
                            startEditing(category.id)
                          }}
                          className={`ml-2 cursor-pointer ${
                            isDarkTheme ? "text-gray-100" : "text-gray-900 sm:text-gray-700"
                          } font-medium`}
                        >
                          {category.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        // console.log("Deleting category:", category.id, category.name)
                        handleDeleteCategory(category.id)
                      }}
                      disabled={isDeleting || isCreating || isUpdating}
                      className={`${
                        isDarkTheme
                          ? "text-red-400 hover:text-red-300"
                          : "text-red-600 sm:text-red-500 hover:text-red-500 sm:hover:text-red-400"
                      } transition-colors duration-200 ${
                        isDeleting || isCreating || isUpdating ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </li>
                ))}
                {newCategory && (
                  <li
                    className={`flex items-center rounded-lg p-3 ${
                      isDarkTheme
                        ? "bg-purple-900/30 hover:bg-purple-800/50"
                        : "bg-gray-50 sm:bg-white/50 hover:bg-gray-200 sm:hover:bg-gray-100"
                    } transition-all duration-200`}
                  >
                    <div className="h-4 w-4 rounded-full bg-gray-500"></div>
                    <input
                      ref={newInputRef}
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      onBlur={handleAddCategory}
                      className={`ml-2 flex-1 rounded-lg ${
                        isDarkTheme
                          ? "bg-purple-900/50 text-white placeholder-purple-300"
                          : "bg-gray-200 sm:bg-gray-100 text-gray-900 sm:text-gray-800 placeholder-gray-500 sm:placeholder-gray-400"
                      } border-none px-2 py-1 focus:ring-2 ${
                        isDarkTheme ? "focus:ring-purple-400" : "focus:ring-indigo-400 sm:focus:ring-indigo-300"
                      }`}
                      autoFocus
                      disabled={isCreating || isDeleting}
                    />
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
