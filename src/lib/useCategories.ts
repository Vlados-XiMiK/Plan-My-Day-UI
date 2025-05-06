'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/notification-context';
import { fetchCategories } from '@/lib/tasks-data';
import { Category } from '@/types';
import { useTranslation } from 'react-i18next';

export function useCategories() {
  const { t } = useTranslation('notifications');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        addNotification('error', t('categories.loadFailed.title'), t('categories.loadFailed.message'));
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, [addNotification, t]);

  const isValidCategoryName = (name: string) => {
    // We resolve Latin and Cyrillic letters, numbers and spaces; special characters are prohibited
    const isValid = /^[a-zA-Zа-яА-Я0-9\s]+$/.test(name) && name.trim().length > 0;
    if (!isValid) {
      console.log('Invalid category name:', name, 'Characters:', name.split('').map(c => c.charCodeAt(0)));
    }
    return isValid;
  };

  const addCategory = () => {
    if (!isValidCategoryName(newCategoryName)) {
      addNotification('error', t('categories.invalidName.title'), t('categories.invalidName.message'));
      setNewCategory(false);
      return;
    }
    const trimmedName = newCategoryName.trim();
    if (categories.some((cat) => cat.name === trimmedName)) {
      addNotification('error', t('categories.duplicateCategory.title'), t('categories.duplicateCategory.message'));
      setNewCategory(false);
      return;
    }
    const newCategoryObj: Category = {
      name: trimmedName,
      color: '#9d75b5', // Default color (gray); can be customized later
    };
    setCategories([...categories, newCategoryObj]);
    const truncatedName = truncateName(trimmedName);
    addNotification('success', t('categories.categoryAdded.title'), t('categories.categoryAdded.message', { name: truncatedName }));

    // Placeholder API call - replace with real endpoint when available
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategoryObj),
    }).catch(() =>
      addNotification('error', t('categories.addFailed.title'), t('categories.addFailed.message'))
    );

    setNewCategory(false);
    setNewCategoryName('');
  };

  const deleteCategory = (index: number) => {
    const categoryToDelete = categories[index];
    const truncatedName = truncateName(categoryToDelete.name);
    setCategories(categories.filter((_, i) => i !== index));
    addNotification('info', t('categories.categoryDeleted.title'), t('categories.categoryDeleted.message', { name: truncatedName }));

    // Placeholder API call - replace with real endpoint when available
    fetch(`/api/categories/${categoryToDelete.name}`, { method: 'DELETE' }).catch(() =>
      addNotification('error', t('categories.deletionFailed.title'), t('categories.deletionFailed.message'))
    );
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempCategory(categories[index].name);
  };

  const saveEditing = (index: number) => {
    if (!isValidCategoryName(tempCategory)) {
      addNotification('error', t('categories.invalidName.title'), t('categories.invalidName.message'));
      setEditingIndex(null);
      return;
    }
    const trimmedName = tempCategory.trim();
    if (categories[index].name === trimmedName) {
      addNotification('info', t('categories.noChanges.title'), t('categories.noChanges.message'));
      setEditingIndex(null);
      return;
    }
    if (categories.some((cat) => cat.name === trimmedName)) {
      addNotification('error', t('categories.duplicateCategory.title'), t('categories.duplicateCategory.message'));
      setEditingIndex(null);
      return;
    }
    const updatedCategories = [...categories];
    updatedCategories[index] = { ...updatedCategories[index], name: trimmedName };
    setCategories(updatedCategories);
    const truncatedName = truncateName(trimmedName);
    addNotification('success', t('categories.categoryUpdated.title'), t('categories.categoryUpdated.message', { name: truncatedName }));

    // Placeholder API call - replace with real endpoint when available
    fetch(`/api/categories/${categories[index].name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, color: categories[index].color }),
    }).catch(() =>
      addNotification('error', t('categories.updateFailed.title'), t('categories.updateFailed.message'))
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