'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LayoutGrid, LayoutList, PlusCircle } from 'lucide-react'
import ProjectCard from './project-card'
import CreateProjectDialog from './create-project-dialog'
import type { Project, ProjectShareLink, Task } from '@/types/project'
import type { ProjectMember } from '@/types/roles'
import { initialProjects, projectMembers, projectShareLinks, projectTasks, currentUser } from '@/lib/project-data'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotification } from '@/contexts/notification-context'
import { roles } from '@/lib/project-data'

type ViewMode = 'list' | 'grid'

export default function ProjectsList() {
  const { t } = useTranslation(['projects', 'notifications'])
  const { addNotification } = useNotification()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [members, setMembers] = useState<ProjectMember[]>(projectMembers)
  const [shareLinks, setShareLinks] = useState<ProjectShareLink[]>(projectShareLinks)
  const [tasksByProject, setTasksByProject] = useState<{ [projectId: number]: Task[] }>(
    initialProjects.reduce((acc, project) => ({
      ...acc,
      [project.id]: projectTasks.filter((task) => task.user === project.owner), // Начальная фильтрация (заменить на API)
    }), {})
  )
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set())
  const [shareRole, setShareRole] = useState<string>('Viewer')
  const [maxUses, setMaxUses] = useState<string>('5')
  const [expiresAt, setExpiresAt] = useState<string>('')

  const toggleProjectExpanded = (projectId: number) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  const handleCreateProject = (newProject: Omit<Project, 'id'>) => {
    const projectId = Math.max(...projects.map((p) => p.id), 0) + 1
    const project: Project = {
      id: projectId,
      name: newProject.name,
      description: newProject.description,
      owner: newProject.owner,
      tasks_count: 0,
      created_at: newProject.created_at,
    }

    const newMember: ProjectMember = {
      id: Math.max(...members.map((m) => m.id), 0) + 1,
      user: currentUser.id,
      user_name: currentUser.username,
      user_details: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        avatar: currentUser.avatar,
      },
      project: projectId,
      role: 1,
      role_name: 'Admin',
    }

    setProjects([...projects, project])
    setMembers([...members, newMember])
    setTasksByProject((prev) => ({ ...prev, [projectId]: [] }))
    setIsCreateDialogOpen(false)
  }

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
  }

  const handleDeleteProject = (projectId: number) => {
    setProjects(projects.filter((project) => project.id !== projectId))
    setMembers(members.filter((member) => member.project !== projectId))
    setTasksByProject((prev) => {
      const newTasks = { ...prev }
      delete newTasks[projectId]
      return newTasks
    })
    setShareLinks(shareLinks)
  }

  const handleUpdateMembers = (projectId: number, updatedMembers: ProjectMember[]) => {
    const otherMembers = members.filter((m) => m.project !== projectId)
    setMembers([...otherMembers, ...updatedMembers])
    console.log('ProjectsList: Updated members for project', projectId, 'to:', updatedMembers)
  }

  const handleAddTask = (projectId: number, newTask: Task) => {
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newTask],
    }))
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, tasks_count: (tasksByProject[projectId] || []).length + 1 }
          : project
      )
    )
    addNotification(
      'success',
      t('notifications:taskCreated.title'),
      t('notifications:taskCreated.message', { taskName: newTask.title }),
      3000
    )
  }

  const handleUpdateTask = (projectId: number, updatedTask: Task) => {
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: prev[projectId].map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    }))
    addNotification(
      'success',
      t('notifications:taskUpdated.title'),
      t('notifications:taskUpdated.message', { taskName: updatedTask.title }),
      3000
    )
  }

  const handleDeleteTask = (projectId: number, taskId: string) => {
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: prev[projectId].filter((task) => task.id !== taskId),
    }))
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, tasks_count: (tasksByProject[projectId] || []).length - 1 }
          : project
      )
    )
    addNotification(
      'success',
      t('notifications:taskDeleted.title'),
      t('notifications:taskDeleted.message'),
      3000
    )
  }

  const openShareDialog = (projectId: number) => {
    setSelectedProjectId(projectId)
    setShareRole('Viewer')
    setMaxUses('5')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setExpiresAt(tomorrow.toISOString().split('T')[0])
    setIsShareDialogOpen(true)
  }

  const handleCreateShareLink = () => {
    if (!selectedProjectId) return

    if (!expiresAt || new Date(expiresAt) <= new Date()) {
      addNotification(
        'error',
        t('notifications:invalidInput.title'),
        t('notifications:invalidInput.shareLinkExpiresAt'),
        5000
      )
      return
    }

    if (!maxUses || parseInt(maxUses) <= 0) {
      addNotification(
        'error',
        t('notifications:invalidInput.title'),
        t('notifications:invalidInput.shareLinkMaxUses'),
        5000
      )
      return
    }

    const newShareLink: ProjectShareLink = {
      id: Math.max(...shareLinks.map((link) => link.id), 0) + 1,
      share_url: `http://localhost:8000/api/v1/projects/join/${crypto.randomUUID()}/`,
      role_name: shareRole,
      max_uses: parseInt(maxUses),
      expires_at: new Date(expiresAt).toISOString(),
      is_active: true,
      created_by: currentUser.username,
      created_at: new Date().toISOString(),
    }

    setShareLinks([...shareLinks, newShareLink])
    setIsShareDialogOpen(false)
    addNotification(
      'success',
      t('notifications:shareLinkCreated.title'),
      t('notifications:shareLinkCreated.message', { projectId: selectedProjectId }),
      3000
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <TooltipProvider>
          <ToggleGroup
            type='single'
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value='list' aria-label={t('projects:projects_list.tooltips.listView')}>
                  <LayoutList className='h-4 w-4' />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>{t('projects:projects_list.tooltips.listView')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value='grid' aria-label={t('projects:projects_list.tooltips.gridView')}>
                  <LayoutGrid className='h-4 w-4' />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>{t('projects:projects_list.tooltips.gridView')}</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </TooltipProvider>

        <Button onClick={() => setIsCreateDialogOpen(true)} className='bg-purple-600 hover:bg-purple-700'>
          <PlusCircle className='mr-2 h-4 w-4' />
          {t('projects:projects_list.buttons.newProject')}
        </Button>
      </div>

      {projects?.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center relative'>
          <div className='relative w-64 h-64 mb-6'>
            <div className='absolute inset-0 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-70 animate-pulse'></div>
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 transition-all duration-700 hover:scale-110'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-purple-500'
              >
                <path d='M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1' />
                <path d='M2 13h10' />
                <path d='M5 16l-3 3 3 3' />
              </svg>
            </div>
            <div
              className='absolute w-20 h-20 top-0 right-0 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-bounce'
              style={{ animationDuration: '3s' }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-10 h-10 text-green-500'
              >
                <path d='M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' />
                <path d='m9 12 2 2 4-4' />
              </svg>
            </div>
            <div
              className='absolute w-16 h-16 bottom-0 left-0 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-bounce'
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-8 h-8 text-blue-500'
              >
                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                <circle cx='9' cy='7' r='4' />
                <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
                <path d='M16 3.13a4 4 0 0 1 0 7.75' />
              </svg>
            </div>
            <div
              className='absolute w-14 h-14 bottom-5 right-5 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center animate-bounce'
              style={{ animationDuration: '3.5s', animationDelay: '0.7s' }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-7 h-7 text-yellow-500'
              >
                <line x1='8' y1='6' x2='21' y2='6'></line>
                <line x1='8' y1='12' x2='21' y2='12'></line>
                <line x1='8' y1='18' x2='21' y2='18'></line>
                <line x1='3' y1='6' x2='3.01' y2='6'></line>
                <line x1='3' y1='12' x2='3.01' y2='12'></line>
                <line x1='3' y1='18' x2='3.01' y2='18'></line>
              </svg>
            </div>
          </div>
          <div className='relative mb-4'>
            <div className='absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-lg blur-lg opacity-75 animate-pulse'></div>
            <div className='relative px-7 py-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-500 shadow-lg'>
              <h3
                className='text-4xl font-extrabold tracking-tight'
                style={{
                  background: 'linear-gradient(to right, #8B5CF6, #C4B5FD, #8B5CF6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {t('projects:projects_list.title')}
              </h3>
              <div className='h-1 w-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 mt-2 rounded-full'></div>
              <div className='flex justify-center mt-3'>
                <div
                  className='w-3 h-3 rounded-full bg-purple-600 mx-1 animate-bounce'
                  style={{ animationDelay: '0s' }}
                ></div>
                <div
                  className='w-3 h-3 rounded-full bg-purple-500 mx-1 animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className='w-3 h-3 rounded-full bg-purple-400 mx-1 animate-bounce'
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
          <h4 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            {t('projects:projects_list.noProjects')}
          </h4>
          <p className='mb-6 mt-2 text-muted-foreground max-w-md'>
            {t('projects:projects_list.noProjectsDescription')}
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className='bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg'
          >
            <PlusCircle className='mr-2 h-4 w-4' />
            {t('projects:projects_list.buttons.createFirstProject')}
          </Button>
          <div className='absolute bottom-4 left-4 flex space-x-1'>
            <div
              className='w-2 h-2 rounded-full bg-purple-300 animate-ping'
              style={{ animationDuration: '1.5s' }}
            ></div>
            <div
              className='w-2 h-2 rounded-full bg-purple-400 animate-ping'
              style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}
            ></div>
            <div
              className='w-2 h-2 rounded-full bg-purple-500 animate-ping'
              style={{ animationDuration: '1.5s', animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className='grid gap-6'>
              {projects.map((project) => {
                const filteredMembers = members.filter((m) => m.project === project.id)
                const filteredTasks = tasksByProject[project.id] || []
                return (
                  <div key={project.id} className='w-full'>
                    <ProjectCard
                      project={project}
                      tasks={filteredTasks}
                      projectMembers={filteredMembers}
                      onUpdateProject={handleUpdateProject}
                      onDeleteProject={handleDeleteProject}
                      onUpdateMembers={handleUpdateMembers}
                      onAddTask={(task) => handleAddTask(project.id, task)}
                      onUpdateTask={(task) => handleUpdateTask(project.id, task)}
                      onDeleteTask={(taskId) => handleDeleteTask(project.id, taskId)}
                      onCreateShareLink={() => openShareDialog(project.id)}
                      isExpanded={expandedProjects.has(project.id)}
                      onToggleExpanded={() => toggleProjectExpanded(project.id)}
                      currentUser={currentUser}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {projects.map((project) => {
                const filteredMembers = members.filter((m) => m.project === project.id)
                const filteredTasks = tasksByProject[project.id] || []
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasks={filteredTasks}
                    projectMembers={filteredMembers}
                    onUpdateProject={handleUpdateProject}
                    onDeleteProject={handleDeleteProject}
                    onUpdateMembers={handleUpdateMembers}
                    onAddTask={(task) => handleAddTask(project.id, task)}
                    onUpdateTask={(task) => handleUpdateTask(project.id, task)}
                    onDeleteTask={(taskId) => handleDeleteTask(project.id, taskId)}
                    onCreateShareLink={() => openShareDialog(project.id)}
                    isExpanded={expandedProjects.has(project.id)}
                    onToggleExpanded={() => toggleProjectExpanded(project.id)}
                    currentUser={currentUser}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleCreateProject}
      />
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className='sm:max-w-[500px] max-w-[95vw]'>
          <DialogHeader>
            <DialogTitle>{t('projects:share_dialog.title')}</DialogTitle>
            <DialogDescription>{t('projects:share_dialog.description')}</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='role'>{t('projects:share_dialog.labels.role')}</Label>
              <Select value={shareRole} onValueChange={setShareRole}>
                <SelectTrigger id='role'>
                  <SelectValue placeholder={t('projects:share_dialog.placeholders.role')} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='maxUses'>{t('projects:share_dialog.labels.maxUses')}</Label>
              <Input
                id='maxUses'
                type='number'
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder={t('projects:share_dialog.placeholders.maxUses')}
                min='1'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='expiresAt'>{t('projects:share_dialog.labels.expiresAt')}</Label>
              <Input
                id='expiresAt'
                type='date'
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                placeholder={t('projects:share_dialog.placeholders.expiresAt')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsShareDialogOpen(false)}
            >
              {t('projects:share_dialog.buttons.cancel')}
            </Button>
            <Button
              type='button'
              onClick={handleCreateShareLink}
              className='bg-purple-600 hover:bg-purple-700'
            >
              {t('projects:share_dialog.buttons.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}