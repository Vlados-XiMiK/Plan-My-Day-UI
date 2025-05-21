"use client"

import { useState, useEffect, useCallback } from "react"
import { useNotification } from "@/contexts/notification-context"
import { fetchCategories, createCategory, updateCategory, deleteCategory as deleteCategoryApi } from "@/api/categories"
import type { Category } from "@/types"
import { useTranslation } from "react-i18next"

// Create a global state object outside of the hook
// This ensures all instances of the hook share the same state
const globalState = {
  categories: [] as Category[],
  isLoading: true,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  listeners: new Set<() => void>(),
}

// Helper function to notify all listeners when state changes
const notifyListeners = () => {
  globalState.listeners.forEach((listener) => listener())
}

export function useCategories() {
  const { t } = useTranslation("notifications")
  const { addNotification } = useNotification()

  // Local state that will be synchronized with global state
  const [, setForceUpdate] = useState({})
  
  // Local component state (not shared between components)
  const [newCategory, setNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tempCategory, setTempCategory] = useState("")

  // Function for trimming long named categories
  const truncateName = (name: string, maxLength = 30): string => {
    if (name.length <= maxLength) return name
    return name.slice(0, maxLength - 3) + "..."
  }

  // Subscribe to global state changes
  useEffect(() => {
    const forceUpdate = () => setForceUpdate({})
    globalState.listeners.add(forceUpdate)

    return () => {
      globalState.listeners.delete(forceUpdate)
    }
  }, [])

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      if (!globalState.isLoading) return // Skip if already loaded

      try {
        const loadedCategories = await fetchCategories()
        // console.log("Loaded categories:", loadedCategories)
        globalState.categories = loadedCategories
        globalState.isLoading = false
        notifyListeners()
      } catch /* ( error)  */ { // add error for console.error 
        // console.error("Error loading categories:", error)
        addNotification("error", t("categories.loadFailed.title"), t("categories.loadFailed.message"))
        globalState.isLoading = false
        notifyListeners()
      }
    }
    loadCategories()
  }, [addNotification, t])

  // Function to reset global state
  const resetCategories = useCallback(() => {
    globalState.categories = []
    globalState.isLoading = true // Set isLoading to true to call loadCategories
    globalState.isCreating = false
    globalState.isUpdating = false
    globalState.isDeleting = false
    notifyListeners()
  }, [])

  // Function to refresh categories
  const refreshCategories = useCallback(async () => {
    try {
      const updatedCategories = await fetchCategories()
      // console.log("Refreshed categories:", updatedCategories)
      globalState.categories = updatedCategories
      notifyListeners()
    } catch /* ( error)  */ { // add error for console.error 
      // console.error("Error refreshing categories:", error)
      addNotification("error", t("categories.loadFailed.title"), t("categories.loadFailed.message"))
    }
  }, [addNotification, t])

  const isValidCategoryName = (name: string) => {
    const isValid = /^[a-zA-Zа-яА-Я0-9\s]+$/.test(name) && name.trim().length > 0
    if (!isValid) {
      // console.log(
      //  "Invalid category name:",
      //  name,
      //  "Characters:",
      //  name.split("").map((c) => c.charCodeAt(0)),
      // )
    }
    return isValid
  }

  const addCategory = useCallback(async () => {
    if (globalState.isCreating) {
      console.warn("addCategory skipped: creation already in progress")
      return
    }
    if (!isValidCategoryName(newCategoryName)) {
      addNotification("error", t("categories.invalidName.title"), t("categories.invalidName.message"))
      setNewCategory(false)
      return
    }
    const trimmedName = newCategoryName.trim()
    if (globalState.categories.some((cat) => cat.name === trimmedName)) {
      addNotification("error", t("categories.duplicateCategory.title"), t("categories.duplicateCategory.message"))
      setNewCategory(false)
      return
    }
    const newCategoryObj: Partial<Category> = {
      name: trimmedName,
      color: "#9d75b5",
    }
    globalState.isCreating = true
    notifyListeners()

    try {
      await createCategory(newCategoryObj)
      await refreshCategories()
      const truncatedName = truncateName(trimmedName)
      addNotification(
        "success",
        t("categories.categoryAdded.title"),
        t("categories.categoryAdded.message", { name: truncatedName }),
      )
    } catch /* ( error)  */ { // add error for console.error 
      // console.error("Failed to add category:", error)
      addNotification("error", t("categories.addFailed.title"), t("categories.addFailed.message"))
    } finally {
      globalState.isCreating = false
      notifyListeners()
      setNewCategory(false)
      setNewCategoryName("")
    }
  }, [addNotification, newCategoryName, refreshCategories, t])

  const deleteCategory = useCallback(
    async (id: number) => {
      if (globalState.isDeleting) {
        console.warn("deleteCategory skipped: deletion already in progress")
        return
      }

      const categoryToDelete = globalState.categories.find((cat) => cat.id === id)
      if (!categoryToDelete) {
        // console.error("Category with id", id, "not found in categories:", globalState.categories)
        addNotification("error", t("categories.deletionFailed.title"), t("categories.undefinedCategory.message"))
        return
      }

      globalState.isDeleting = true
      notifyListeners()
      const truncatedName = truncateName(categoryToDelete.name)

      try {
        await deleteCategoryApi(id)
        await refreshCategories()
        addNotification(
          "info",
          t("categories.categoryDeleted.title"),
          t("categories.categoryDeleted.message", { name: truncatedName }),
        )
      } catch /* ( error)  */ { // add error for console.error 
        // console.error("Failed to delete category:", error)
        addNotification("error", t("categories.deletionFailed.title"), t("categories.deletionFailed.message"))
      } finally {
        globalState.isDeleting = false
        notifyListeners()
      }
    },
    [addNotification, refreshCategories, t],
  )

  const startEditing = useCallback(
    (id: number | null) => {
      // If id is null, just clear the editing state
      if (id === null) {
        setEditingId(null)
        setTempCategory("")
        return
      }

      const category = globalState.categories.find((cat) => cat.id === id)
      if (!category) {
        // console.error("Category with id", id, "not found")
        addNotification("error", t("categories.undefinedCategory.title"), t("categories.undefinedCategory.message"))
        return
      }
      // console.log("startEditing called with id:", id, "category:", category)
      setEditingId(id)
      setTempCategory(category.name)
    },
    [addNotification, t],
  )

  const saveEditing = useCallback(
    async (id: number) => {
      if (globalState.isUpdating) {
        console.warn("saveEditing skipped: update already in progress")
        return
      }
      if (!isValidCategoryName(tempCategory)) {
        addNotification("error", t("categories.invalidName.title"), t("categories.invalidName.message"))
        setEditingId(null)
        return
      }
      const trimmedName = tempCategory.trim()
      const category = globalState.categories.find((cat) => cat.id === id)
      if (!category) {
        // console.error("Category with id", id, "not found")
        addNotification("error", t("categories.undefinedCategory.title"), t("categories.undefinedCategory.message"))
        setEditingId(null)
        return
      }
      if (category.name === trimmedName) {
        addNotification("info", t("categories.noChanges.title"), t("categories.noChanges.message"))
        setEditingId(null)
        return
      }
      if (globalState.categories.some((cat) => cat.id !== id && cat.name === trimmedName)) {
        addNotification("error", t("categories.duplicateCategory.title"), t("categories.duplicateCategory.message"))
        setEditingId(null)
        return
      }
      globalState.isUpdating = true
      notifyListeners()

      try {
        const updatedCategory = { name: trimmedName, color: category.color }
        await updateCategory(id, updatedCategory)
        await refreshCategories()
        const truncatedName = truncateName(trimmedName)
        addNotification(
          "success",
          t("categories.categoryUpdated.title"),
          t("categories.categoryUpdated.message", { name: truncatedName }),
        )
      } catch /* ( error)  */ { // add error for console.error 
        // console.error("Failed to update category:", error)
        addNotification("error", t("categories.updateFailed.title"), t("categories.updateFailed.message"))
      } finally {
        globalState.isUpdating = false
        notifyListeners()
        setEditingId(null)
      }
    },
    [addNotification, refreshCategories, t, tempCategory],
  )

  return {
    // Return the global state values
    categories: globalState.categories,
    isLoading: globalState.isLoading,
    isCreating: globalState.isCreating,
    isUpdating: globalState.isUpdating,
    isDeleting: globalState.isDeleting,
    // Return local state values
    newCategory,
    setNewCategory,
    newCategoryName,
    setNewCategoryName,
    editingId,
    tempCategory,
    setTempCategory,
    resetCategories,
    // Return functions
    addCategory,
    deleteCategory,
    startEditing,
    saveEditing,
    refreshCategories,
  }
}
