'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
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
import type { ProjectMember, Role } from '@/types/roles'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/projects/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ChevronDown, ChevronUp, Copy, Link, Trash2, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { enUS, uk } from 'date-fns/locale'
import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import CustomAvatar from '@/components/ui/Avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/projects/popover'
import CustomCalendar from '@/components/ui/projects/custom-calendar'
import { cn } from '@/lib/utils'
import { useNotification } from '@/contexts/notification-context'
import { useTranslation } from 'react-i18next'
import { HTMLAttributes } from 'react'
import { createProjectShareLink, leaveProject, kickUser, getProjectShareLinks, deleteProjectShareLink } from '@/api/projects'

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface ProjectManageDialogProps {
  project: Project
  projectMembers: ProjectMember[]
  roles: Role[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateProject: (project: Project) => void
  onUpdateMembers: (members: ProjectMember[]) => void
  onDeleteProject: (projectId: number) => void
  currentUser: User
  canEdit: boolean
  isCreator: boolean
  onLeaveProject?: (projectId: number) => void // Новый пропс
}

export default function ProjectManageDialog({
  project,
  projectMembers,
  roles,
  open,
  onOpenChange,
  onUpdateProject,
  onUpdateMembers,
  onDeleteProject,
  currentUser,
  canEdit,
  isCreator,
  onLeaveProject, // Добавляем в параметры
}: ProjectManageDialogProps) {
  const { t, i18n } = useTranslation(['projects', 'notifications'])
  const { addNotification } = useNotification()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<number, ProjectMember['role_name']>>({})
  const [hasRoleChanges, setHasRoleChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('details')
  const [inviteLink, setInviteLink] = useState('')
  const [usageLimit, setUsageLimit] = useState<number>(1)
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined)
  const [inviteRole, setInviteRole] = useState<string>('Viewer')
  const [linkId, setLinkId] = useState<number | null>(null)
  const [isLinkGenerated, setIsLinkGenerated] = useState(false)
  const [isInviteSectionExpanded, setIsInviteSectionExpanded] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inviteSectionRef = useRef<HTMLDivElement>(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Загрузка существующей ссылки при разворачивании секции приглашения
  useEffect(() => {
    if (isInviteSectionExpanded) {
      const fetchShareLink = async () => {
        try {
          const shareLinksData = await getProjectShareLinks(project.id)
          const activeLink = shareLinksData.results.find(
            (link) => link.is_active && new Date(link.expires_at) > new Date()
          )
          if (activeLink) {
            setInviteLink(activeLink.share_url)
            setUsageLimit(activeLink.max_uses)
            setExpirationDate(new Date(activeLink.expires_at))
            setInviteRole(activeLink.role_name)
            setLinkId(activeLink.id)
            setIsLinkGenerated(true)
          } else {
            setInviteLink('')
            setUsageLimit(1)
            setExpirationDate(undefined)
            setInviteRole('Viewer')
            setLinkId(null)
            setIsLinkGenerated(false)
          }
        } catch (error) {
          console.error('Error fetching share link:', error)
          addNotification(
            'error',
            t('notifications:fetchShareLinkError.title', 'Error'),
            t('notifications:fetchShareLinkError.message', 'Failed to load share link.'),
            5000
          )
        }
      }

      fetchShareLink()
    }
  }, [isInviteSectionExpanded, project.id, t, addNotification])

  // Сброс полей при закрытии диалога
  useEffect(() => {
    if (!open) {
      setInviteLink('')
      setUsageLimit(1)
      setExpirationDate(undefined)
      setInviteRole('Viewer')
      setLinkId(null)
      setIsLinkGenerated(false)
      setIsInviteSectionExpanded(false)
      setActiveTab('details')
      setName(project.name)
      setDescription(project.description)
      setPendingRoleChanges({})
      setHasRoleChanges(false)
    }
  }, [open, project.name, project.description])

  useEffect(() => {
    if (isInviteSectionExpanded && scrollContainerRef.current && inviteSectionRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current && inviteSectionRef.current) {
          scrollContainerRef.current.scrollTo({
            top: inviteSectionRef.current.offsetTop,
            behavior: 'smooth',
          })
        }
      }, 100)
    }
  }, [isInviteSectionExpanded])

  const formatDate = (date: Date, formatStr: string) => {
    const locale = i18n.language === 'ua' ? uk : enUS
    return format(date, formatStr, { locale })
  }

  const handleUpdateMemberRole = (userId: number, role: ProjectMember['role_name']) => {
    setPendingRoleChanges((prev) => {
      const newChanges = { ...prev, [userId]: role }
      setHasRoleChanges(true)
      return newChanges
    })
    const member = projectMembers.find((m) => m.user === userId)
    if (member) {
      addNotification(
        'info',
        t('notifications:roleChangePending.title'),
        t('notifications:roleChangePending.message', {
          name: member.user_details.username,
          role: t(`projects:project_manage.roles.${role.toLowerCase()}`),
        }),
        3000
      )
    }
  }

  const saveRoleChanges = () => {
    const updatedMembers = projectMembers
      .map((member) => {
        if (pendingRoleChanges[member.user] && pendingRoleChanges[member.user] !== member.role_name) {
          return {
            ...member,
            role_name: pendingRoleChanges[member.user],
            role: roles.find((r) => r.name === pendingRoleChanges[member.user])!.id,
          }
        }
        return null
      })
      .filter((member): member is ProjectMember => member !== null)

    console.log('Saving role changes:', {
      projectId: project.id,
      updatedMembers: updatedMembers.map((m) => ({
        user: m.user,
        role: m.role,
        role_name: m.role_name,
      })),
    })

    onUpdateMembers(updatedMembers)
    setPendingRoleChanges({})
    setHasRoleChanges(false)
    addNotification(
      'success',
      t('notifications:rolesUpdated.title'),
      t('notifications:rolesUpdated.message'),
      3000
    )
  }

  const cancelRoleChanges = () => {
    setPendingRoleChanges({})
    setHasRoleChanges(false)
    addNotification(
      'info',
      t('notifications:roleChangesCancelled.title'),
      t('notifications:roleChangesCancelled.message'),
      3000
    )
  }

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit && !isCreator) {
      addNotification(
        'error',
        t('notifications:permissionDenied.title'),
        t('notifications:permissionDenied.updateProject'),
        5000
      )
      onOpenChange(false)
      return
    }
    if (hasRoleChanges) {
      saveRoleChanges()
    }
    onUpdateProject({
      ...project,
      name,
      description,
    })
    addNotification(
      'success',
      t('notifications:projectUpdated.title'),
      t('notifications:projectUpdated.message', { title: name }),
      3000
    )
    onOpenChange(false)
  }

  const handleRemoveMember = async (userId: number) => {
    if (!canEdit && !isCreator) {
      addNotification(
        'error',
        t('notifications:permissionDenied.title'),
        t('notifications:permissionDenied.removeMember'),
        5000
      )
      return
    }
    try {
      await kickUser(project.id, { user: userId })
      const member = projectMembers.find((m) => m.user === userId)
      const updatedMembers = projectMembers.filter((m) => m.user !== userId)
      onUpdateMembers(updatedMembers)
      if (member) {
        addNotification(
          'success',
          t('notifications:memberRemoved.title'),
          t('notifications:memberRemoved.message', { name: member.user_details.username }),
          3000
        )
      }
    } catch (error) {
      addNotification(
        'error',
        t('notifications:removeMemberError.title'),
        t('notifications:removeMemberError.message'),
        5000
      )
    }
  }

  const handleLeaveProject = async () => {
    if (isCreator) {
      addNotification(
        'error',
        t('notifications:permissionDenied.title'),
        t('notifications:permissionDenied.creatorCannotLeave'),
        5000
      )
      return
    }
    try {
      onLeaveProject?.(project.id) // Вызываем onLeaveProject для рефетча
      onOpenChange(false)
    } catch (error) {
    }
  }

  const generateInviteLink = async () => {
    if (!usageLimit || usageLimit < 1) {
      addNotification(
        'error',
        t('notifications:invalidInput.title'),
        t('notifications:invalidInput.usageLimit'),
        5000
      )
      return
    }
    if (!expirationDate) {
      addNotification(
        'error',
        t('notifications:invalidInput.title'),
        t('notifications:invalidInput.expirationDate'),
        5000
      )
      return
    }
    const currentDate = new Date()
    if (expirationDate < currentDate) {
      addNotification(
        'error',
        t('notifications:invalidInput.title'),
        t('notifications:invalidInput.invalidExpirationDate'),
        5000
      )
      return
    }
    try {
      const role = roles.find((r) => r.name === 'Viewer')
      if (!role) {
        addNotification(
          'error',
          t('notifications:invalidInput.title'),
          t('notifications:invalidInput.invalidRole'),
          5000
        )
        return
      }
      const newLink = await createProjectShareLink(project.id, {
        role: role.id,
        max_uses: usageLimit,
        expires_at: expirationDate.toISOString(),
      })
      setInviteLink(newLink.share_url)
      setLinkId(newLink.id)
      setIsLinkGenerated(true)
      addNotification(
        'success',
        t('notifications:inviteLinkGenerated.title'),
        t('notifications:inviteLinkGenerated.message'),
        3000
      )
    } catch (error) {
      addNotification(
        'error',
        t('notifications:createShareLinkError.title'),
        t('notifications:createShareLinkError.message'),
        5000
      )
    }
  }

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    addNotification(
      'success',
      t('notifications:linkCopied.title'),
      t('notifications:linkCopied.message'),
      3000
    )
  }

  const deleteInviteLink = async () => {
    if (linkId) {
      try {
        await deleteProjectShareLink(project.id, linkId)
        addNotification(
          'success',
          t('notifications:linkDeleted.title'),
          t('notifications:linkDeleted.message'),
          3000
        )
      } catch (error) {
        addNotification(
          'error',
          t('notifications:deleteShareLinkError.title', 'Error'),
          t('notifications:deleteShareLinkError.message', 'Failed to delete share link.'),
          5000
        )
        return
      }
    }
    setInviteLink('')
    setUsageLimit(1)
    setExpirationDate(undefined)
    setInviteRole('Viewer')
    setLinkId(null)
    setIsLinkGenerated(false)
  }

  const toggleInviteSection = () => {
    setIsInviteSectionExpanded(!isInviteSectionExpanded)
  }

  const isGenerateButtonDisabled = !usageLimit || usageLimit < 1 || !expirationDate
  const createdDate = new Date(project.created_at)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('projects:project_manage.title')}</DialogTitle>
          <DialogDescription>
            {canEdit || isCreator
              ? t('projects:project_manage.description.edit')
              : t('projects:project_manage.description.view')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">{t('projects:project_manage.tabs.details')}</TabsTrigger>
            <TabsTrigger value="members">{t('projects:project_manage.tabs.members')}</TabsTrigger>
          </TabsList>

          <div ref={scrollContainerRef} className="max-h-[60vh] overflow-y-auto pr-1 -mr-1">
            <TabsContent value="details">
              <form onSubmit={handleUpdateProject} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">{t('projects:project_manage.labels.title')}</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!canEdit && !isCreator}
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">{t('projects:project_manage.labels.description')}</Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    disabled={!canEdit && !isCreator}
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  {t('projects:project_manage.createdOn')} {formatDate(createdDate, 'MMMM d, yyyy \',\' h:mm')}
                </div>

                <DialogFooter>
                  {!isCreator && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLeaveProject}
                      className="mr-auto transition-all duration-200 hover:bg-destructive/10 text-destructive"
                    >
                      {t('projects:project_manage.buttons.leaveProject')}
                    </Button>
                  )}
                  {(canEdit || isCreator) && (
                    <Button
                      type="submit"
                      className="transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700"
                    >
                      {t('projects:project_manage.buttons.save')}
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="members">
              <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="space-y-4">
                  {projectMembers.length > 0 ? (
                    projectMembers.map((member, index) => (
                      <motion.div
                        key={member.user}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-all duration-200 gap-2"
                        {...({} as MotionDivProps)}
                      >
                        <div className="flex items-center space-x-3">
                          {member.user_details.avatar ? (
                            <Avatar className="border-2 border-background shadow-sm">
                              <AvatarImage src={member.user_details.avatar} alt={member.user_details.username} />
                              <AvatarFallback>
                                {member.user_details.username
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="border-2 border-background rounded-full shadow-sm">
                              <CustomAvatar name={member.user_details.username} size="small" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{member.user_details.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.user_details.email}
                              {member.user === project.owner ? ` ${t('projects:project_manage.creator')}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          {(canEdit || isCreator) && member.user !== project.owner ? (
                            <>
                              <Select
                                value={pendingRoleChanges[member.user] || member.role_name}
                                onValueChange={(value: ProjectMember['role_name']) =>
                                  handleUpdateMemberRole(member.user, value)
                                }
                              >
                                <SelectTrigger
                                  className={`h-8 min-w-[160px] ${
                                    pendingRoleChanges[member.user]
                                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                      : ''
                                  }`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                      {t(`projects:project_manage.roles.${role.name.toLowerCase()}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveMember(member.user)}
                                className="h-8 w-8 text-destructive transition-all duration-200 hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">{t('projects:project_manage.buttons.removeMember')}</span>
                              </Button>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-md">
                              {t(`projects:project_manage.roles.${member.role_name.toLowerCase()}`)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('projects:project_manage.noMembers')}</p>
                  )}
                </div>

                {(canEdit || isCreator) && (
                  <div className="mt-6 space-y-4">
                    <div className="text-sm font-medium">{t('projects:project_manage.labels.inviteMembers')}</div>
                    <div ref={inviteSectionRef} className="border rounded-md overflow-hidden">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={toggleInviteSection}
                        className="w-full flex items-center justify-between p-3 h-auto hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center text-sm font-medium">
                          <Link className="h-4 w-4 mr-1.5 text-purple-500" />
                          {t('projects:project_manage.labels.inviteViaLink')}
                        </div>
                        {isInviteSectionExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>

                      <AnimatePresence>
                        {isInviteSectionExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                            {...({} as MotionDivProps)}
                          >
                            <div className="p-4 space-y-4 bg-muted/30 border-t">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="usage-limit" className="text-xs">
                                    {t('projects:project_manage.labels.usageLimit')}
                                  </Label>
                                  <Input
                                    id="usage-limit"
                                    type="number"
                                    min={1}
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(Number.parseInt(e.target.value) || 0)}
                                    placeholder={t('projects:project_manage.placeholders.usageLimit')}
                                    className={`transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 ${
                                      isLinkGenerated ? 'bg-muted cursor-not-allowed' : ''
                                    }`}
                                    disabled={isLinkGenerated}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="expiration-date" className="text-xs">
                                    {t('projects:project_manage.labels.expiresOn')}
                                  </Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        id="expiration-date"
                                        variant="outline"
                                        className={cn(
                                          'w-full justify-start text-left font-normal transition-all duration-200 focus:ring-2 focus:ring-purple-500/20',
                                          !expirationDate && 'text-muted-foreground',
                                          isLinkGenerated && 'bg-muted cursor-not-allowed'
                                        )}
                                        disabled={isLinkGenerated}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {expirationDate
                                          ? formatDate(expirationDate, 'PPP')
                                          : t('projects:project_manage.placeholders.selectDate')}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 pointer-events-auto">
                                      <CustomCalendar
                                        selectedDate={expirationDate}
                                        onDateSelect={(date: Date | undefined) => {
                                          if (date && date >= today) {
                                            setExpirationDate(date)
                                          }
                                        }}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="invite-role" className="text-xs">
                                  {t('projects:project_manage.labels.role')}
                                </Label>
                                <Input
                                  id="invite-role"
                                  value={t(`projects:project_manage.roles.viewer`)}
                                  readOnly
                                  className="bg-muted cursor-not-allowed"
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label htmlFor="invite-link" className="text-xs">
                                    {t('projects:project_manage.labels.inviteLink')}
                                  </Label>
                                  {!isLinkGenerated && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={generateInviteLink}
                                      disabled={isGenerateButtonDisabled}
                                      className="h-7 transition-all duration-200 hover:bg-purple-500/10 bg-purple-500 hover:bg-purple-600 text-white"
                                    >
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      {t('projects:project_manage.buttons.generateLink')}
                                    </Button>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    id="invite-link"
                                    value={inviteLink}
                                    readOnly
                                    placeholder={t('projects:project_manage.placeholders.inviteLink')}
                                    className={`transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 ${
                                      isLinkGenerated ? 'bg-white dark:bg-gray-800' : 'bg-muted'
                                    }`}
                                  />
                                  {isLinkGenerated && (
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={copyLinkToClipboard}
                                        className="flex-shrink-0 transition-all duration-200 hover:bg-purple-500/10"
                                        title={t('projects:project_manage.buttons.copyLink')}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={deleteInviteLink}
                                        className="flex-shrink-0 transition-all duration-200 hover:bg-destructive/10 text-destructive"
                                        title={t('projects:project_manage.buttons.deleteLink')}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                {isLinkGenerated && (
                                  <p className="text-xs text-muted-foreground">
                                    {t('projects:project_manage.linkInfo', {
                                      usageLimit,
                                      expirationDate: formatDate(expirationDate!, 'MMMM d, yyyy'),
                                      plural: usageLimit !== 1 ? '' : '',
                                    })}
                                    <br />
                                    <span className="text-amber-500 dark:text-amber-400">
                                      {t('projects:project_manage.linkWarning')}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                {(canEdit || isCreator) && hasRoleChanges && (
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelRoleChanges}
                      className="transition-all duration-200 hover:bg-destructive/10"
                    >
                      {t('projects:project_manage.buttons.cancel')}
                    </Button>
                    <Button
                      type="button"
                      onClick={saveRoleChanges}
                      className="transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700"
                    >
                      {t('projects:project_manage.buttons.saveRoles')}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}