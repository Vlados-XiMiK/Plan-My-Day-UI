'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/notification-context';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryApi,
} from '@/api/categories';
import { Category } from '@/types';
import { useTranslation } from 'react-i18next';

export function useCategories() {
  const { t } = useTranslation('notifications');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCategory, setNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempCategory, setTempCategory] = useState('');
  const { addNotification } = useNotification();

  // Function for trimming long named categories
  const truncateName = (name: string, maxLength: number = 30): string => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 3) + '...';
  };

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const loadedCategories = await fetchCategories();
        console.log('Loaded categories:', loadedCategories);
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        addNotification(
          'error',
          t('categories.loadFailed.title'),
          t('categories.loadFailed.message')
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, [addNotification, t]);

  // Function to refresh categories
  const refreshCategories = async () => {
    try {
      const updatedCategories = await fetchCategories();
      console.log('Refreshed categories:', updatedCategories);
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error refreshing categories:', error);
      addNotification(
        'error',
        t('categories.loadFailed.title'),
        t('categories.loadFailed.message')
      );
    }
  };

  const isValidCategoryName = (name: string) => {
    const isValid =
      /^[a-zA-Zа-яА-Я0-9\s]+$/.test(name) && name.trim().length > 0;
    if (!isValid) {
      console.log(
        'Invalid category name:',
        name,
        'Characters:',
        name.split('').map((c) => c.charCodeAt(0))
      );
    }
    return isValid;
  };

  const addCategory = async () => {
    if (isCreating) {
      console.warn('addCategory skipped: creation already in progress');
      return;
    }
    if (!isValidCategoryName(newCategoryName)) {
      addNotification(
        'error',
        t('categories.invalidName.title'),
        t('categories.invalidName.message')
      );
      setNewCategory(false);
      return;
    }
    const trimmedName = newCategoryName.trim();
    if (categories.some((cat) => cat.name === trimmedName)) {
      addNotification(
        'error',
        t('categories.duplicateCategory.title'),
        t('categories.duplicateCategory.message')
      );
      setNewCategory(false);
      return;
    }
    const newCategoryObj: Partial<Category> = {
      name: trimmedName,
      color: '#9d75b5',
    };
    setIsCreating(true);
    try {
      await createCategory(newCategoryObj);
      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      const truncatedName = truncateName(trimmedName);
      addNotification(
        'success',
        t('categories.categoryAdded.title'),
        t('categories.categoryAdded.message', { name: truncatedName })
      );
    } catch (error) {
      console.error('Failed to add category:', error);
      addNotification(
        'error',
        t('categories.addFailed.title'),
        t('categories.addFailed.message')
      );
    } finally {
      setIsCreating(false);
      setNewCategory(false);
      setNewCategoryName('');
    }
  };

  const deleteCategory = async (id: number) => {
    if (isDeleting) {
      console.warn('deleteCategory skipped: deletion already in progress');
      return;
    }

    const categoryToDelete = categories.find((cat) => cat.id === id);
    if (!categoryToDelete) {
      console.error(
        'Category with id',
        id,
        'not found in categories:',
        categories
      );
      addNotification(
        'error',
        t('categories.deletionFailed.title'),
        t('categories.undefinedCategory.message')
      );
      return;
    }

    setIsDeleting(true);
    const truncatedName = truncateName(categoryToDelete.name);

    try {
      await deleteCategoryApi(id);
      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      addNotification(
        'info',
        t('categories.categoryDeleted.title'),
        t('categories.categoryDeleted.message', { name: truncatedName })
      );
    } catch (error) {
      console.error('Failed to delete category:', error);
      addNotification(
        'error',
        t('categories.deletionFailed.title'),
        t('categories.deletionFailed.message')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (id: number) => {
    const category = categories.find((cat) => cat.id === id);
    if (!category) {
      console.error('Category with id', id, 'not found');
      addNotification(
        'error',
        t('categories.undefinedCategory.title'),
        t('categories.undefinedCategory.message')
      );
      return;
    }
    console.log('startEditing called with id:', id, 'category:', category);
    setEditingId(id);
    setTempCategory(category.name);
  };

  const saveEditing = async (id: number) => {
    if (isUpdating) {
      console.warn('saveEditing skipped: update already in progress');
      return;
    }
    if (!isValidCategoryName(tempCategory)) {
      addNotification(
        'error',
        t('categories.invalidName.title'),
        t('categories.invalidName.message')
      );
      setEditingId(null);
      return;
    }
    const trimmedName = tempCategory.trim();
    const category = categories.find((cat) => cat.id === id);
    if (!category) {
      console.error('Category with id', id, 'not found');
      addNotification(
        'error',
        t('categories.undefinedCategory.title'),
        t('categories.undefinedCategory.message')
      );
      setEditingId(null);
      return;
    }
    if (category.name === trimmedName) {
      addNotification(
        'info',
        t('categories.noChanges.title'),
        t('categories.noChanges.message')
      );
      setEditingId(null);
      return;
    }
    if (categories.some((cat) => cat.name === trimmedName)) {
      addNotification(
        'error',
        t('categories.duplicateCategory.title'),
        t('categories.duplicateCategory.message')
      );
      setEditingId(null);
      return;
    }
    setIsUpdating(true);
    try {
      const updatedCategory = { name: trimmedName, color: category.color };
      await updateCategory(id, updatedCategory);
      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      const truncatedName = truncateName(trimmedName);
      addNotification(
        'success',
        t('categories.categoryUpdated.title'),
        t('categories.categoryUpdated.message', { name: truncatedName })
      );
    } catch (error) {
      console.error('Failed to update category:', error);
      addNotification(
        'error',
        t('categories.updateFailed.title'),
        t('categories.updateFailed.message')
      );
    } finally {
      setIsUpdating(false);
      setEditingId(null);
    }
  };

  return {
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
    refreshCategories, // Добавляем функцию рефетча
  };
}