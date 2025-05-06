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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Project, User } from '@/types/project'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/projects/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { enUS, uk } from 'date-fns/locale'
import { motion, MotionProps } from 'framer-motion'
import CustomAvatar from '@/components/ui/Avatar'
import { useNotification } from '@/contexts/notification-context'
import { useTranslation } from 'react-i18next'
import { HTMLAttributes } from 'react'

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface ProjectManageDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateProject: (project: Project) => void
  currentUser?: User
  canEdit: boolean
  isCreator: boolean
}

export default function ProjectManageDialog({
  project,
  open,
  onOpenChange,
  onUpdateProject,
  canEdit,
  isCreator,
}: ProjectManageDialogProps) {
  const { t, i18n } = useTranslation(['projects', 'notifications'])
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [members, setMembers] = useState<User[]>(project.members)
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, string>>({})
  const [hasRoleChanges, setHasRoleChanges] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [activeTab, setActiveTab] = useState<string>('details')
  const { addNotification } = useNotification()

  // Выбор локали date-fns на основе текущего языка
  const locale = i18n.language === 'ua' ? uk : enUS
  const dateFormat = i18n.language === 'ua' ? "d MMMM yyyy 'о' HH:mm" : "MMMM d, yyyy 'at' h:mm a"

  const handleUpdateMemberRole = (userId: string, role: string) => {
    setPendingRoleChanges((prev) => {
      const newChanges = { ...prev, [userId]: role }
      setHasRoleChanges(true)
      return newChanges
    })
    const member = members.find((m) => m.id === userId)
    if (member) {
      addNotification(
        'info',
        t('notifications:roleChangePending.title'),
        t('notifications:roleChangePending.message', {
          name: member.name,
          role: t(`projects:project_manage.roles.${role}`),
        }),
        3000,
      )
    }
  }

  const saveRoleChanges = () => {
    try {
      const updatedMembers = members.map((member) => {
        if (pendingRoleChanges[member.id]) {
          return {
            ...member,
            role: pendingRoleChanges[member.id] as 'full_access' | 'read_only' | 'complete_only',
          }
        }
        return member
      })

      setMembers(updatedMembers)
      setPendingRoleChanges({})
      setHasRoleChanges(false)
      addNotification('success', t('notifications:rolesUpdated.title'), t('notifications:rolesUpdated.message'), 3000)
    } catch {
      addNotification('error', t('notifications:roleUpdateFailed.title'), t('notifications:roleUpdateFailed.message'), 5000)
    }
  }

  const cancelRoleChanges = () => {
    setPendingRoleChanges({})
    setHasRoleChanges(false)
    addNotification('info', t('notifications:roleChangesCancelled.title'), t('notifications:roleChangesCancelled.message'), 3000)
  }

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault()

    if (!canEdit && !isCreator) {
      addNotification(
        'error',
        t('notifications:permissionDenied.title'),
        t('notifications:permissionDenied.updateProject'),
        5000,
      )
      onOpenChange(false)
      return
    }

    if (!title.trim()) {
      addNotification('error', t('notifications:invalidInput.title'), t('notifications:invalidInput.projectTitle'), 5000)
      return
    }

    try {
      if (hasRoleChanges) {
        saveRoleChanges()
      }

      onUpdateProject({
        ...project,
        title,
        description,
        members,
      })

      addNotification('success', t('notifications:projectUpdated.title'), t('notifications:projectUpdated.message', { title }), 3000)
      onOpenChange(false)
    } catch {
      addNotification('error', t('notifications:projectUpdateFailed.title'), t('notifications:projectUpdateFailed.message'), 5000)
    }
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberEmail.trim() || (!canEdit && !isCreator)) {
      if (!newMemberEmail.trim()) {
        addNotification('error', t('notifications:invalidInput.title'), t('notifications:invalidInput.email'), 5000)
      } else {
        addNotification(
          'error',
          t('notifications:permissionDenied.title'),
          t('notifications:permissionDenied.addMember'),
          5000,
        )
      }
      return
    }

    try {
      const newMember: User = {
        id: `user-${Date.now()}`,
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        avatar: '',
        role: 'read_only',
      }

      setMembers([...members, newMember])
      setNewMemberEmail('')
      addNotification(
        'success',
        t('notifications:memberAdded.title'),
        t('notifications:memberAdded.message', { name: newMember.name }),
        3000,
      )
    } catch {
      addNotification('error', t('notifications:memberAdditionFailed.title'), t('notifications:memberAdditionFailed.message'), 5000)
    }
  }

  const handleRemoveMember = (userId: string) => {
    if (!canEdit && !isCreator) {
      addNotification(
        'error',
        t('notifications:permissionDenied.title'),
        t('notifications:permissionDenied.removeMember'),
        5000,
      )
      return
    }

    try {
      const member = members.find((m) => m.id === userId)
      setMembers(members.filter((member) => member.id !== userId))
      if (member) {
        addNotification(
          'success',
          t('notifications:memberRemoved.title'),
          t('notifications:memberRemoved.message', { name: member.name }),
          3000,
        )
      }
    } catch {
      addNotification('error', t('notifications:memberRemovalFailed.title'), t('notifications:memberRemovalFailed.message'), 5000)
    }
  }

  const createdDate = new Date(project.createdAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] max-w-[95vw] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>{t('projects:project_manage.title')}</DialogTitle>
          <DialogDescription>
            {canEdit || isCreator
              ? t('projects:project_manage.description.edit')
              : t('projects:project_manage.description.view')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='details' value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='details'>{t('projects:project_manage.tabs.details')}</TabsTrigger>
            <TabsTrigger value='members'>{t('projects:project_manage.tabs.members')}</TabsTrigger>
          </TabsList>

          <TabsContent value='details'>
            <form onSubmit={handleUpdateProject} className='space-y-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-title'>{t('projects:project_manage.labels.title')}</Label>
                <Input
                  id='edit-title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!canEdit && !isCreator}
                  className='transition-all duration-200 focus:ring-2 focus:ring-purple-500/20'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='edit-description'>{t('projects:project_manage.labels.description')}</Label>
                <Textarea
                  id='edit-description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={!canEdit && !isCreator}
                  className='transition-all duration-200 focus:ring-2 focus:ring-purple-500/20'
                />
              </div>

              <div className='text-sm text-muted-foreground'>
                {t('projects:project_manage.createdOn')} {format(createdDate, dateFormat, { locale })}
              </div>

              {(canEdit || isCreator) && (
                <DialogFooter>
                  <Button
                    type='submit'
                    className='transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700'
                  >
                    {t('projects:project_manage.buttons.save')}
                  </Button>
                </DialogFooter>
              )}
            </form>
          </TabsContent>

          <TabsContent value='members'>
            <div className='space-y-4 py-4 max-h-[400px] overflow-y-auto pr-2'>
              <div className='space-y-4'>
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className='flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-all duration-200 gap-2'
                    {...({} as MotionDivProps)}
                  >
                    <div className='flex items-center space-x-3'>
                      {member.avatar ? (
                        <Avatar className='border-2 border-background shadow-sm'>
                          <AvatarImage src={member.avatar || '/placeholder.svg'} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className='border-2 border-background rounded-full shadow-sm'>
                          <CustomAvatar name={member.name} size='small' />
                        </div>
                      )}
                      <div>
                        <p className='text-sm font-medium'>{member.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {member.email}
                          {member.id === project.createdBy.id ? ` ${t('projects:project_manage.creator')}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2 mt-2 sm:mt-0'>
                      {(canEdit || isCreator) && member.id !== project.createdBy.id ? (
                        <>
                          <Select
                            value={pendingRoleChanges[member.id] || member.role}
                            onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                          >
                            <SelectTrigger
                              className={`h-8 min-w-[160px] ${
                                pendingRoleChanges[member.id]
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : ''
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='full_access'>{t('projects:project_manage.roles.full_access')}</SelectItem>
                              <SelectItem value='read_only'>{t('projects:project_manage.roles.read_only')}</SelectItem>
                              <SelectItem value='complete_only'>{t('projects:project_manage.roles.complete_only')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleRemoveMember(member.id)}
                            className='h-8 w-8 text-destructive transition-all duration-200 hover:bg-destructive/10'
                          >
                            <Trash2 className='h-4 w-4' />
                            <span className='sr-only'>{t('projects:project_manage.buttons.removeMember')}</span>
                          </Button>
                        </>
                      ) : (
                        <div className='text-sm text-muted-foreground px-3 py-1 bg-muted rounded-md'>
                          {t(`projects:project_manage.roles.${member.role}`)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {(canEdit || isCreator) && (
                <form onSubmit={handleAddMember} className='mt-6 space-y-4'>
                  <div className='text-sm font-medium'>{t('projects:project_manage.labels.addMember')}</div>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <Input
                      placeholder={t('projects:project_manage.placeholders.email')}
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      type='email'
                      className='flex-1 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20'
                    />
                    <Button
                      type='submit'
                      className='transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700'
                    >
                      <UserPlus className='mr-2 h-4 w-4' />
                      {t('projects:project_manage.buttons.add')}
                    </Button>
                  </div>
                </form>
              )}
              {(canEdit || isCreator) && hasRoleChanges && (
                <div className='flex justify-end gap-2 mt-4 pt-4 border-t'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={cancelRoleChanges}
                    className='transition-all duration-200 hover:bg-destructive/10'
                  >
                    {t('projects:project_manage.buttons.cancel')}
                  </Button>
                  <Button
                    type='button'
                    onClick={saveRoleChanges}
                    className='transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700'
                  >
                    {t('projects:project_manage.buttons.saveRoles')}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}