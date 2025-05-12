'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Clock, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getTaskStatus } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import type { Task, Category } from '@/types'
import { HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { enUS, uk } from 'date-fns/locale'

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

type TaskDetailModalProps = {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  toggleTaskCompletion: (taskId: number) => void
  categories: Category[] // Новый проп для категорий
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  toggleTaskCompletion,
  categories,
}: TaskDetailModalProps) {
  const { t, i18n } = useTranslation('calendar')
  const [isCompleted, setIsCompleted] = useState(false)

  // Update local state when task changes
  useEffect(() => {
    if (task) {
      setIsCompleted(task.completed)
    }
  }, [task])

  if (!task) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const locale = i18n.language === 'ua' ? uk : enUS
    return format(date, 'PPPP', { locale })
  }

  const taskStatus = getTaskStatus(task)

  const handleCheckboxChange = () => {
    setIsCompleted(!isCompleted)
    toggleTaskCompletion(task.id)
  }

  // Найти категорию по ID
  const category = task.category != null ? categories.find((cat) => cat.id === task.category) : null
  const categoryName = category ? category.name : t('noCategory') // Если нет категории, отображаем "No category"

  // Extract time from dueDate
  const time = task.dueDate ? task.dueDate.split('T')[1]?.substring(0, 5) : undefined

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl overflow-hidden p-0">
        <div
          className={cn(
            'p-4',
            task.priority === 'high'
              ? 'bg-red-50 dark:bg-red-900/20'
              : task.priority === 'medium'
                ? 'bg-amber-50 dark:bg-amber-900/20'
                : 'bg-blue-50 dark:bg-blue-900/20',
            taskStatus === 'overdue' && 'border-l-4 border-red-500 dark:border-red-700',
            taskStatus === 'approaching' && 'border-l-4 border-amber-500 dark:border-amber-700',
          )}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <DialogTitle
              className={cn('text-xl font-bold flex items-center gap-2', isCompleted && 'line-through opacity-70')}
            >
              <div className="cursor-pointer">
                <Checkbox checked={isCompleted} onCheckedChange={handleCheckboxChange} className="h-6 w-6 rounded-md" />
              </div>
              <span
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{
                  backgroundColor:
                    task.priority === 'high'
                      ? 'rgb(220, 38, 38)'
                      : task.priority === 'medium'
                        ? 'rgb(217, 119, 6)'
                        : 'rgb(37, 99, 235)',
                }}
              ></span>
              {task.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              className={cn(
                'rounded-lg',
                task.priority === 'high'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : task.priority === 'medium'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
              )}
            >
              {t(`priority.${task.priority}`)}
            </Badge>
            <Badge variant="outline" className="rounded-lg">
              {categoryName} {/* Отображаем название категории */}
            </Badge>
            {taskStatus === 'overdue' && (
              <Badge variant="destructive" className="rounded-lg flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {t('status.overdue')}
              </Badge>
            )}
            {taskStatus === 'approaching' && (
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <Badge className="rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {t('status.dueSoon')}
                </Badge>
              </motion.div>
            )}
            {isCompleted && (
              <Badge className="rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {t('status.completed')}
              </Badge>
            )}
            {task.starred && (
              <Badge className="rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                ⭐ {t('starred')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(task.dueDate.split('T')[0])}</p>
            {time && (
              <div
                className={cn(
                  'flex items-center text-sm',
                  taskStatus === 'overdue'
                    ? 'text-red-500 dark:text-red-400'
                    : taskStatus === 'approaching'
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-gray-500 dark:text-gray-400',
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                {time}
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn('text-gray-700 dark:text-gray-300', isCompleted && 'opacity-70')}
            {...({} as MotionDivProps)}
          >
            {task.description || t('noDescription')}
          </motion.div>

          {task.createdAt && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {t('created')} {new Date(task.createdAt).toLocaleString(i18n.language === 'ua' ? 'uk-UA' : 'en-US')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}