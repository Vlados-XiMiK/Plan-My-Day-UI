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
import type { Project, User } from '@/types/project'
import { UserPlus, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/projects/avatar'
import { Badge } from '@/components/ui/badge'
import { motion, MotionProps } from 'framer-motion'
import { availableUsers, currentUser } from '@/lib/project-data'
import { HTMLAttributes } from 'react'
import { useNotification } from '@/contexts/notification-context'
import { useTranslation } from 'react-i18next'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [showUserSearch, setShowUserSearch] = useState(false)
  const { addNotification } = useNotification()

  const filteredUsers = availableUsers.filter(
    (user) =>
      !selectedUsers.some((selected) => selected.id === user.id) &&
      user.id !== currentUser.id &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
        members: [currentUser, ...selectedUsers],
        tasks: [],
        createdAt: new Date().toISOString(),
      })

      addNotification('success', t('notifications:projectCreated.title'), t('notifications:projectCreated.message', { title }), 5000)

      setTitle('')
      setDescription('')
      setSelectedUsers([])
      setSearchTerm('')
      setShowUserSearch(false)
      onOpenChange(false)
    } catch {
      addNotification('error', t('notifications:projectCreationFailed.title'), t('notifications:projectCreationFailed.message'), 5000)
    }
  }

  const addUser = (user: User) => {
    setSelectedUsers([...selectedUsers, { ...user, role: 'read_only' }])
    setSearchTerm('')
    addNotification('success', t('notifications:memberAdded.title'), t('notifications:memberAdded.message', { name: user.name }), 3000)
  }

  const removeUser = (userId: string) => {
    const removedUser = selectedUsers.find((user) => user.id === userId)
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
    if (removedUser) {
      addNotification('info', t('notifications:memberRemoved.title'), t('notifications:memberRemoved.message', { name: removedUser.name }), 3000)
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

                {selectedUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {user.avatar ? (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-5 w-5 rounded-full overflow-hidden flex items-center justify-center bg-purple-500 text-white text-[10px] font-bold flex-shrink-0">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <span>{user.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-destructive/10 transition-colors duration-200"
                        onClick={() => removeUser(user.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">{t('popups:create_project.buttons.remove', { name: user.name })}</span>
                      </Button>
                    </Badge>
                  </motion.div>
                ))}

                {!showUserSearch && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 transition-all duration-200 hover:bg-purple-500/10"
                    onClick={() => setShowUserSearch(true)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    {t('popups:create_project.buttons.addMember')}
                  </Button>
                )}
              </div>

              {showUserSearch && (
                <motion.div
                  className="border rounded-md p-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  {...({} as MotionDivProps)}
                >
                  <Input
                    placeholder={t('popups:create_project.placeholders.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <div className="max-h-[150px] overflow-y-auto space-y-1">
                    {filteredUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-colors duration-200"
                        onClick={() => addUser(user)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        {...({} as MotionDivProps)}
                      >
                        <div className="flex items-center gap-2">
                          {user.avatar ? (
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                              <AvatarFallback>
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-6 w-6 rounded-full overflow-hidden flex items-center justify-center bg-purple-500 text-white text-xs font-bold flex-shrink-0">
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 transition-all duration-200 hover:bg-purple-500/10"
                        >
                          {t('popups:create_project.buttons.add')}
                        </Button>
                      </motion.div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-2">{t('popups:create_project.noUsersFound')}</div>
                    )}
                  </div>
                </motion.div>
              )}
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
              className="transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700"
            >
              {t('popups:create_project.buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}