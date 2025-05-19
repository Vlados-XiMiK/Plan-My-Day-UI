"use client"

import type React from "react"
import { useState, useRef, useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Edit, X, Check, Loader2 } from "lucide-react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform} from "framer-motion"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useCategories } from "@/lib/useCategories"
import { useTranslation } from "react-i18next"

// Анимации
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2, ease: [0.6, 0.05, 0.01, 0.99] } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } },
  hover: { scale: 1.03, boxShadow: "0 12px 30px -5px rgba(124, 58, 237, 0.15)", transition: { duration: 0.3 } },
}

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.95 },
}

export default function CategoriesPage() {
  const { t } = useTranslation(["notifications", "categories"])
  const {
    categories,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
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
  const isMobile = useMobile()

  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const newInputRef = useRef<HTMLInputElement>(null)

  const lineWidth = useMotionValue(0)
  const springLineWidth = useSpring(lineWidth, { stiffness: 120, damping: 25 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
      lineWidth.set(100)
    }, 300)
    return () => clearTimeout(timer)
  }, [lineWidth])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    await addCategory()
    newInputRef.current?.focus()
  }

  const handleDeleteCategory = async (id: number) => {
    await deleteCategory(id)
  }

  const handleEditCategory = (id: number) => {
    startEditing(id)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSaveEdit = async (id: number) => {
    await saveEditing(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent, id?: number) => {
    if (e.key === "Enter") {
      if (id) {
        handleSaveEdit(id);  // обрабатываем редактирование
      } else {
        handleAddCategory();  // добавляем категорию
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-1xl mx-auto relative">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
        className="mb-8 text-center sm:text-left"
      >
        <motion.h1
          className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400"
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          {t("categories:title")}
        </motion.h1>
        <motion.div
          style={{ width: useTransform(springLineWidth, [0, 100], ["0%", "100%"]) }}
          className="h-1 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 mt-2 rounded-full"
        />
      </motion.div>

      {/* Форма добавления */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mb-8"
      >
        <Card className="border-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {t("categories:newCategoryLabel")}
                </label>
                <Input
                  ref={newInputRef}
                  placeholder={t("categories:newCategoryPlaceholder")}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={20}
                  className="rounded-lg border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                  disabled={isCreating || isUpdating || isDeleting}
                />
              </div>
              <motion.div variants={buttonVariants}>
                <Button
                  onClick={handleAddCategory}
                  disabled={isCreating || isUpdating || isDeleting || !newCategoryName.trim()}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  {t("categories:createButton")}
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Список категорий */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isPageLoaded ? "show" : "hidden"}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div className="text-center py-12">
              <motion.div
                className="mx-auto w-12 h-12 border-4 border-t-purple-600 border-gray-200 dark:border-gray-700 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </motion.div>
          ) : categories.length === 0 ? (
            <motion.div className="text-center py-12">
              <motion.div
                className="mx-auto w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4"
                animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              >
                <div className="text-purple-500 dark:text-purple-300 text-4xl">📋</div>
              </motion.div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">
                {t("categories:noCategoriesTitle")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">{t("categories:noCategoriesMessage")}</p>
            </motion.div>
          ) : (
            categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                layout
                layoutId={`category-${category.id}`}
                className="w-full"
              >
                <Card
                  className={cn(
                    "border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl",
                    editingId === category.id && "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900",
                  )}
                >
                  <AnimatePresence mode="wait">
                    {editingId === category.id ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="w-10 h-10 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                          />
                          <Input
                            ref={inputRef}
                            value={tempCategory}
                            onChange={(e) => setTempCategory(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, category.id)}
                            maxLength={20}
                            className="flex-1 rounded-lg border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-purple-500"
                            disabled={isUpdating || isDeleting}
                          />
                          <motion.div variants={buttonVariants}>
                            <Button
                              size="icon"
                              variant="outline"
                              disabled={isUpdating || isDeleting}
                              onClick={() => handleSaveEdit(category.id)}
                              className="h-10 w-10 rounded-lg border-gray-200 text-green-600 dark:border-gray-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          </motion.div>
                          <motion.div variants={buttonVariants}>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => startEditing(null)}
                              className="h-10 w-10 rounded-lg border-gray-200 text-gray-500 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="normal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 flex items-center"
                      >
                        <motion.div
                          className="w-10 h-10 rounded-lg mr-3 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        />
                        <motion.span
                          className="flex-1 font-medium text-gray-800 dark:text-gray-200"
                          whileHover={{ x: 3 }}
                        >
                          {category.name}
                        </motion.span>
                        <div className="flex gap-2">
                          <motion.div variants={buttonVariants}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditCategory(category.id)}
                              className="h-9 w-9 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              disabled={isCreating || isUpdating || isDeleting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div variants={buttonVariants}>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={isCreating || isUpdating || isDeleting}
                              onClick={() => handleDeleteCategory(category.id)}
                              className="h-9 w-9 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-500 dark:text-red-400" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Плавающая кнопка для мобильных */}
      <AnimatePresence>
        {isMobile && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={() => newInputRef.current?.focus()}
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 shadow-lg hover:shadow-xl"
              disabled={isCreating || isUpdating || isDeleting}
            >
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                transition={{
                  rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                }}
              >
                <Plus className="h-6 w-6" />
              </motion.div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Фоновые декоративные элементы */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-purple-600 dark:bg-purple-800 opacity-5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-[5%] w-72 h-72 rounded-full bg-indigo-600 dark:bg-indigo-800 opacity-5 blur-3xl"
          animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }}
        />
      </div>
    </div>
  )
}