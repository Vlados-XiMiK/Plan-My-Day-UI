'use client'

import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Project } from '@/types/project'
import { motion, MotionProps } from 'framer-motion'
import { currentUser } from '@/lib/project-data'
import { HTMLAttributes } from 'react'
import { useNotification } from '@/contexts/notification-context'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/projects/avatar'
import { Badge } from '@/components/ui/badge'

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject: (project: Omit<Project, 'id'>) => void
}

export default function CreateProjectDialog({ open, onOpenChange, onCreateProject }: CreateProjectDialogProps) {
  const { t } = useTranslation(['popups', 'notifications'])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { addNotification } = useNotification()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      addNotification('error', t('notifications:invalidInput.title'), t('notifications:invalidInput.message'), 5000)
      return
    }

    try {
      onCreateProject({
        title,
        description,
        createdBy: currentUser,
        members: [currentUser],
        tasks: [],
        createdAt: new Date().toISOString(),
      })

      addNotification('success', t('notifications:projectCreated.title'), t('notifications:projectCreated.message', { title }), 5000)

      setTitle('')
      setDescription('')
      onOpenChange(false)
    } catch {
      addNotification('error', t('notifications:projectCreationFailed.title'), t('notifications:projectCreationFailed.message'), 5000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('popups:create_project.title')}</DialogTitle>
            <DialogDescription>{t('popups:create_project.description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              {...({} as MotionDivProps)}
            >
              <Label htmlFor="title">{t('popups:create_project.labels.title')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('popups:create_project.placeholders.title')}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
            </motion.div>
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              {...({} as MotionDivProps)}
            >
              <Label htmlFor="description">{t('popups:create_project.labels.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('popups:create_project.placeholders.description')}
                rows={3}
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
            </motion.div>
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              {...({} as MotionDivProps)}
            >
              <Label>{t('popups:create_project.labels.teamMembers')}</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 bg-purple-500/10 border-purple-500/20"
                >
                  {currentUser.avatar ? (
                    <Avatar className="h-5 w-5 border-2 border-purple-500/20">
                      <AvatarImage src={currentUser.avatar || '/placeholder.svg'} alt={currentUser.name} />
                      <AvatarFallback>
                        {currentUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-5 w-5 rounded-full overflow-hidden flex items-center justify-center bg-purple-500 text-white text-[10px] font-bold flex-shrink-0">
                      {currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <span>{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">{t('popups:create_project.currentUser')}</span>
                </Badge>
              </div>
            </motion.div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-all duration-200 hover:bg-destructive/10"
            >
              {t('popups:create_project.buttons.cancel')}
            </Button>
            <Button
              type="submit"
              className="transition-all duration-300 hover:shadow-md bg-purple-500 hover:bg-purple-600"
            >
              {t('popups:create_project.buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}