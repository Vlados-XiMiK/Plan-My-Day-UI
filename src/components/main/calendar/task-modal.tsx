'use client'

import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/calendar/radio-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useNotification } from '@/contexts/notification-context'
import type { Task } from '@/types'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { enUS, uk } from 'date-fns/locale'

type TaskModalProps = {
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'starred'>) => void
  selectedDate: string | null
  categories: string[]
}

export default function TaskModal({ isOpen, onClose, onAddTask, selectedDate, categories }: TaskModalProps) {
  const { t, i18n } = useTranslation(['popups', 'notifications'])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [category, setCategory] = useState(categories[0] || t('calendar_popup.defaultCategory', { ns: 'popups' }))
  const [description, setDescription] = useState('')
  const [time, setTime] = useState('09:00')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Use the hook for notifications
  const { addNotification } = useNotification()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (title.trim() && selectedDate) {
      const dueDate = `${selectedDate}T${time}:00`
      const selectedDateTime = new Date(dueDate)
      const currentDateTime = new Date()

      // Check for past date
      if (selectedDateTime < currentDateTime) {
        setValidationError(t('calendar_popup.validation.pastDate', { ns: 'popups' }))
        return
      }

      // Clear validation errors
      setValidationError(null)

      // Create a task
      onAddTask({
        title: title.trim(),
        description: description.trim() || '',
        dueDate,
        category,
        priority,
        completed: false,
        date: selectedDate,
      })

      // Add a notification about successful task creation
      addNotification(
        'success',
        t('taskCreated.title', { ns: 'notifications' }),
        t('taskCreated.message', { ns: 'notifications', title: title.trim() })
      )

      // Reset the form
      setTitle('')
      setPriority('medium')
      setCategory(categories[0] || t('calendar_popup.defaultCategory', { ns: 'popups' }))
      setDescription('')
      setTime('09:00')
      onClose()
    } else {
      // If the title is empty, show the notification
      if (!title.trim()) {
        setValidationError(t('calendar_popup.validation.taskTitleRequired', { ns: 'popups' }))
      }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const locale = i18n.language === 'ua' ? uk : enUS
    return format(date, 'PPPP', { locale })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>{t('calendar_popup.addTask', { ns: 'popups', date: formatDate(selectedDate) })}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('calendar_popup.taskTitle', { ns: 'popups' })}</Label>
            <Input
              id="title"
              placeholder={t('calendar_popup.placeholder.taskTitle', { ns: 'popups' })}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t('calendar_popup.date', { ns: 'popups' })}</Label>
              <Input id="date" type="date" value={selectedDate || ''} disabled className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">{t('calendar_popup.time', { ns: 'popups' })}</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('calendar_popup.descriptionOptional', { ns: 'popups' })}</Label>
            <Textarea
              id="description"
              placeholder={t('calendar_popup.placeholder.description', { ns: 'popups' })}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('calendar_popup.category', { ns: 'popups' })}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder={t('calendar_popup.placeholder.category', { ns: 'popups' })} />
              </SelectTrigger>
              <SelectContent className="rounded-lg max-h-[200px] overflow-y-auto">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('calendar_popup.priorityLabel', { ns: 'popups' })}</Label>
            <RadioGroup
              value={priority}
              onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="text-blue-600 dark:text-blue-400">
                  {t('calendar_popup.priority.low', { ns: 'popups' })}
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-amber-600 dark:text-amber-400">
                  {t('calendar_popup.priority.medium', { ns: 'popups' })}
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="text-red-600 dark:text-red-400">
                  {t('calendar_popup.priority.high', { ns: 'popups' })}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {validationError && <div className="text-sm text-red-500 font-medium">{validationError}</div>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
              {t('calendar_popup.cancel', { ns: 'popups' })}
            </Button>
            <Button type="submit" className="rounded-lg">
              {t('calendar_popup.addTaskButton', { ns: 'popups' })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}