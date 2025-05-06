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

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface ProjectManageDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  currentUser?: User
  canEdit: boolean
  isCreator: boolean
}


export default function ProjectManageDialog({
  project,
  open,
  onOpenChange,
  onUpdateProject,
  onDeleteProject,
  currentUser,
  canEdit,
  isCreator,
}: ProjectManageDialogProps) {
  const { t, i18n } = useTranslation(['projects', 'notifications'])
  const { addNotification } = useNotification()
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [members, setMembers] = useState<User[]>(project.members)
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, string>>({})
  const [hasRoleChanges, setHasRoleChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('details')
  const [inviteLink, setInviteLink] = useState('')
  const [usageLimit, setUsageLimit] = useState<number>(1)
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined)
  const [isLinkGenerated, setIsLinkGenerated] = useState(false)
  const [isInviteSectionExpanded, setIsInviteSectionExpanded] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inviteSectionRef = useRef<HTMLDivElement>(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    if (!open) {
      setInviteLink('')
      setUsageLimit(1)
      setExpirationDate(undefined)
      setIsLinkGenerated(false)
      setIsInviteSectionExpanded(false)
      setActiveTab('details')
    }
  }, [open])

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

  // Format date with locale
  const formatDate = (date: Date, formatStr: string) => {
    const locale = i18n.language === 'ua' ? uk : enUS
    return format(date, formatStr, { locale })
  }

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
    addNotification(
      'success',
      t('notifications:rolesUpdated.title'),
      t('notifications:rolesUpdated.message'),
      3000,
    )
  }

  const cancelRoleChanges = () => {
    setPendingRoleChanges({})
    setHasRoleChanges(false)
    addNotification(
      'info',
      t('notifications:roleChangesCancelled.title'),
      t('notifications:roleChangesCancelled.message'),
      3000,
    )
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
    if (hasRoleChanges) {
      saveRoleChanges()
    }
    onUpdateProject({
      ...project,
      title,
      description,
      members,
    })
    addNotification(
      'success',
      t('notifications:projectUpdated.title'),
      t('notifications:projectUpdated.message', { title }),
      3000,
    )
    onOpenChange(false)
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
  }

  const handleLeaveProject = () => {
    if (isCreator) {
      addNotification(
        'error',
        t('notifications:permissionDenied.title'),
        t('notifications:permissionDenied.creatorCannotLeave'),
        5000,
      )
      return
    }
    const updatedMembers = members.filter((member) => member.id !== currentUser?.id)
    onUpdateProject({
      ...project,
      members: updatedMembers,
    })
    onOpenChange(false)
    if (currentUser) {
      onDeleteProject(project.id)
      addNotification(
        'success',
        t('notifications:leftProject.title'),
        t('notifications:leftProject.message'),
        3000,
      )
    }
  }

  const generateInviteLink = () => {
    if (!usageLimit || usageLimit < 1) {
      addNotification(
        'error',
        t('notifications:invalidInput.title'),
        t('notifications:invalidInput.usageLimit'),
        5000,
      )
      return
    }
    if (!expirationDate) {
      addNotification(
        'error',
        t('notifications:invalidInput.title'),
        t('notifications:invalidInput.expirationDate'),
        5000,
      )
      return
    }
    const currentDate = new Date()
    if (expirationDate < currentDate) {
      addNotification(
        'error',
        t('notifications:invalidInput.title'),
        t('notifications:invalidInput.invalidExpirationDate'),
        5000,
      )
      return
    }
    const randomString = Math.random().toString(36).substring(2, 10)
    const newLink = `https://taskplanner.app/invite/${randomString}`
    setInviteLink(newLink)
    setIsLinkGenerated(true)
    addNotification(
      'success',
      t('notifications:inviteLinkGenerated.title'),
      t('notifications:inviteLinkGenerated.message'),
      3000,
    )
  }

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    addNotification(
      'success',
      t('notifications:linkCopied.title'),
      t('notifications:linkCopied.message'),
      3000,
    )
  }

  const deleteInviteLink = () => {
    setInviteLink('')
    setIsLinkGenerated(false)
    addNotification(
      'success',
      t('notifications:linkDeleted.title'),
      t('notifications:linkDeleted.message'),
      3000,
    )
  }

  const toggleInviteSection = () => {
    setIsInviteSectionExpanded(!isInviteSectionExpanded)
  }

  const isGenerateButtonDisabled = !usageLimit || usageLimit < 1 || !expirationDate
  const createdDate = new Date(project.createdAt)

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
                  <Label htmlFor="edit-title">{t('projects:project_manage.labels.title')}</Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                  {t('projects:project_manage.createdOn')} {formatDate(createdDate, "MMMM d, yyyy ',' h:mm")}
                </div>

                <DialogFooter>
                  {!isCreator && currentUser && (
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
                  {members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-all duration-200 gap-2"
                      {...({} as MotionDivProps)}
                    >
                      <div className="flex items-center space-x-3">
                        {member.avatar ? (
                          <Avatar className="border-2 border-background shadow-sm">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="border-2 border-background rounded-full shadow-sm">
                            <CustomAvatar name={member.name} size="small" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                            {member.id === project.createdBy.id ? ` ${t('projects:project_manage.creator')}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        {(canEdit || isCreator) && member.id !== project.createdBy.id ? (
                          <>
                            <Select
                              value={pendingRoleChanges[member.id] || member.role}
                              onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                            >
                              <SelectTrigger
                                className={`h-8 min-w-[160px] ${
                                  pendingRoleChanges[member.id]
                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                    : ""
                                }`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full_access">{t('projects:project_manage.roles.full_access')}</SelectItem>
                                <SelectItem value="read_only">{t('projects:project_manage.roles.read_only')}</SelectItem>
                                <SelectItem value="complete_only">{t('projects:project_manage.roles.complete_only')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.id)}
                              className="h-8 w-8 text-destructive transition-all duration-200 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">{t('projects:project_manage.buttons.removeMember')}</span>
                            </Button>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-md">
                            {t(`projects:project_manage.roles.${member.role}`)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
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
                            animate={{ height: "auto", opacity: 1 }}
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
                                      isLinkGenerated ? "bg-muted cursor-not-allowed" : ""
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
                                          "w-full justify-start text-left font-normal transition-all duration-200 focus:ring-2 focus:ring-purple-500/20",
                                          !expirationDate && "text-muted-foreground",
                                          isLinkGenerated && "bg-muted cursor-not-allowed",
                                        )}
                                        disabled={isLinkGenerated}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {expirationDate ? formatDate(expirationDate, "PPP") : t('projects:project_manage.placeholders.selectDate')}
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
                                      isLinkGenerated ? "bg-white dark:bg-gray-800" : "bg-muted"
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
                                      expirationDate: formatDate(expirationDate!, "MMMM d, yyyy"),
                                      plural: usageLimit !== 1 ? "" : ""
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