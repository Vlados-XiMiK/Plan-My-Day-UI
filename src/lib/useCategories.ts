'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/notification-context';
import { fetchCategories } from '@/lib/tasks-data';
import { Category } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempCategory, setTempCategory] = useState('');
  const { addNotification } = useNotification();

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const loadedCategories = await fetchCategories();
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        addNotification('error', 'Load Failed', 'Failed to load categories.');
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, [addNotification]);

  const isValidCategoryName = (name: string) => {
    return /^[a-zA-Z\s]+$/.test(name) && name.trim().length > 0;
  };

  const addCategory = () => {
    if (!isValidCategoryName(newCategoryName)) {
      addNotification('error', 'Invalid Name', 'Category name must contain only Latin letters and cannot be empty.');
      setNewCategory(false);
      return;
    }
    const trimmedName = newCategoryName.trim();
    if (categories.some((cat) => cat.name === trimmedName)) {
      addNotification('error', 'Duplicate Category', 'This category already exists.');
      setNewCategory(false);
      return;
    }
    const newCategoryObj: Category = {
      name: trimmedName,
      color: '#9d75b5', // Default color (gray); can be customized later
    };
    setCategories([...categories, newCategoryObj]);
    addNotification('success', 'Category Added', `Category "${trimmedName}" added.`);

    // Placeholder API call - replace with real endpoint when available
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategoryObj),
    }).catch(() =>
      addNotification('error', 'Add Failed', 'An error occurred while adding the category.')
    );

    setNewCategory(false);
    setNewCategoryName('');
  };

  const deleteCategory = (index: number) => {
    const categoryToDelete = categories[index];
    setCategories(categories.filter((_, i) => i !== index));
    addNotification('info', 'Category Deleted', `Category "${categoryToDelete.name}" deleted.`);

    // Placeholder API call - replace with real endpoint when available
    fetch(`/api/categories/${categoryToDelete.name}`, { method: 'DELETE' }).catch(() =>
      addNotification('error', 'Deletion Failed', 'An error occurred while deleting the category.')
    );
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempCategory(categories[index].name);
  };

  const saveEditing = (index: number) => {
    if (!isValidCategoryName(tempCategory)) {
      addNotification('error', 'Invalid Name', 'Category name must contain only Latin letters and cannot be empty.');
      setEditingIndex(null);
      return;
    }
    const trimmedName = tempCategory.trim();
    if (categories[index].name === trimmedName) {
      addNotification('info', 'No Changes', 'No changes were made.');
      setEditingIndex(null);
      return;
    }
    if (categories.some((cat) => cat.name === trimmedName)) {
      addNotification('error', 'Duplicate Category', 'This category already exists.');
      setEditingIndex(null);
      return;
    }
    const updatedCategories = [...categories];
    updatedCategories[index] = { ...updatedCategories[index], name: trimmedName };
    setCategories(updatedCategories);
    addNotification('success', 'Category Updated', `Category "${trimmedName}" updated.`);

    // Placeholder API call - replace with real endpoint when available
    fetch(`/api/categories/${categories[index].name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, color: categories[index].color }),
    }).catch(() =>
      addNotification('error', 'Update Failed', 'An error occurred while updating the category.')
    );

    setEditingIndex(null);
  };

  return {
    categories,
    isLoading,
    newCategory,
    setNewCategory,
    newCategoryName,
    setNewCategoryName,
    editingIndex,
    tempCategory,
    setTempCategory,
    addCategory,
    deleteCategory,
    startEditing,
    saveEditing,
  };
}