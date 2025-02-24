'use client';

import { useState } from 'react';
import { useNotification } from '@/contexts/notification-context';

export function useCategories(initialCategories: string[] = ['Work', 'Personal', 'Shopping']) {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempCategory, setTempCategory] = useState('');
  const { addNotification } = useNotification();

  const isValidCategoryName = (name: string) => {
    return /^[a-zA-Z\s]+$/.test(name) && name.trim().length > 0;
  };

  const addCategory = () => {
    if (!isValidCategoryName(newCategoryName)) {
      addNotification('error', 'Invalid Name', 'Category name must contain only Latin letters and cannot be empty.');
      setNewCategory(false);
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      addNotification('error', 'Duplicate Category', 'This category already exists.');
      setNewCategory(false);
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    addNotification('success', 'Category Added', `Category "${newCategoryName.trim()}" added.`);
    setNewCategory(false);
    setNewCategoryName('');
  };

  const deleteCategory = (index: number) => {
    const categoryToDelete = categories[index];
    setCategories(categories.filter((_, i) => i !== index));
    addNotification('info', 'Category Deleted', `Category "${categoryToDelete}" deleted.`);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempCategory(categories[index]);
  };

  const saveEditing = (index: number) => {
    if (!isValidCategoryName(tempCategory)) {
      addNotification('error', 'Invalid Name', 'Category name must contain only Latin letters and cannot be empty.');
      setEditingIndex(null);
      return;
    }
    if (categories[index] === tempCategory.trim()) {
      addNotification('info', 'No Changes', 'No changes were made.');
      setEditingIndex(null);
      return;
    }
    if (categories.includes(tempCategory.trim())) {
      addNotification('error', 'Duplicate Category', 'This category already exists.');
      setEditingIndex(null);
      return;
    }
    const updatedCategories = [...categories];
    updatedCategories[index] = tempCategory.trim();
    setCategories(updatedCategories);
    addNotification('success', 'Category Updated', `Category "${tempCategory.trim()}" updated.`);
    setEditingIndex(null);
  };

  return {
    categories,
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