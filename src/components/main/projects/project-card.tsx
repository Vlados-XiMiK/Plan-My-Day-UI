'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Folder, MoreHorizontal, Plus, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { Project, Task, User } from '@/types/project'
import { AvatarGroup } from './avatar-group'
import ProjectManageDialog from './project-manage-dialog'
import TaskDialog from './task-dialog'
import TaskItem from './task-item'
import { formatDistanceToNow } from 'date-fns'
import { enUS, uk } from 'date-fns/locale'
import { motion, MotionProps, AnimatePresence } from 'framer-motion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/projects/alert-dialog'
import { currentUser } from '@/lib/project-data'
import { HTMLAttributes } from 'react'
import { useNotification } from '@/contexts/notification-context'
import { useTranslation } from 'react-i18next'

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface ProjectCardProps {
  project: Project
  onUpdateProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  isExpanded: boolean
  onToggleExpanded: () => void
  currentUser?: User
}

export default function ProjectCard({
  project,
  onUpdateProject,
  onDeleteProject,
  isExpanded,
  onToggleExpanded,
  currentUser: userProp,
}: ProjectCardProps) {
  const { t, i18n } = useTranslation(['projects', 'notifications'])
  const [manageOpen, setManageOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { addNotification } = useNotification()

  // Выбор локали date-fns на основе текущего языка
  const locale = i18n.language === 'ua' ? uk : enUS

  const mockCurrentUser: User = userProp || currentUser

  const toggleExpanded = () => {
    onToggleExpanded()
  }

  const handleTaskToggle = (taskId: string) => {
    try {
      const updatedTasks = project.tasks.map((task) => {
        if (task.id === taskId) {
          if (!task.completed) {
            return {
              ...task,
              completed: true,
              completion: {
                completedBy: mockCurrentUser.id,
                completedAt: new Date().toISOString(),
              },
            }
          } else {
            const { ...rest } = task
            return { ...rest, completed: false }
          }
        }
        return task
      })

      onUpdateProject({
        ...project,
        tasks: updatedTasks,
      })
    } catch {
      addNotification('error', t('notifications:taskStatusUpdateFailed.title'), t('notifications:taskStatusUpdateFailed.message'), 5000)
    }
  }

  const handleAddTask = (task: Omit<Task, 'id'>) => {
    try {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...task,
      }

      onUpdateProject({
        ...project,
        tasks: [...project.tasks, newTask],
      })

      addNotification('success', t('notifications:taskCreated.title'), t('notifications:taskCreated.message', { title: task.title }), 3000)
      setTaskDialogOpen(false)
    } catch {
      addNotification('error', t('notifications:taskCreationFailed.title'), t('notifications:taskCreationFailed.message'), 5000)
    }
  }

  const handleEditTask = (task: Task) => {
    try {
      const updatedTasks = project.tasks.map((t) => (t.id === task.id ? task : t))

      onUpdateProject({
        ...project,
        tasks: updatedTasks,
      })

      setEditingTask(null)
    } catch {
      addNotification('error', t('notifications:taskUpdateFailed.title'), t('notifications:taskUpdateFailed.message'), 5000)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    try {
      const updatedTasks = project.tasks.filter((task) => task.id !== taskId)

      onUpdateProject({
        ...project,
        tasks: updatedTasks,
      })

      if (editingTask && editingTask.id === taskId) {
        setEditingTask(null)
      }
    } catch {
      addNotification('error', t('notifications:taskDeletionFailed.title'), t('notifications:taskDeletionFailed.message'), 5000)
    }
  }

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task)
  }

  const handleDeleteProject = () => {
    try {
      onDeleteProject(project.id)
      addNotification('success', t('notifications:projectDeleted.title'), t('notifications:projectDeleted.message', { title: project.title }), 3000)
      setDeleteDialogOpen(false)
    } catch {
      addNotification('error', t('notifications:projectDeletionFailed.title'), t('notifications:projectDeletionFailed.message'), 5000)
    }
  }

  const userRole = project.members.find((member) => member.id === mockCurrentUser.id)?.role || 'read_only'
  const canEdit = userRole === 'full_access'
  const canComplete = userRole === 'full_access' || userRole === 'complete_only'
  const isCreator = project.createdBy.id === mockCurrentUser.id

  const completedTasksCount = project.tasks.filter((task) => task.completed).length
  const createdDate = new Date(project.createdAt)

  const getUserById = (userId: string) => {
    return project.members.find((member) => member.id === userId)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
        className='h-full'
        {...({} as MotionDivProps)}
      >
        <Card className='overflow-hidden transition-all duration-300 hover:shadow-lg h-full border-t-4 border-t-purple-500'>
          <CardHeader className='pb-3 relative'>
            <div className='absolute top-3 left-3 w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center'>
              <Folder className='h-4 w-4 text-purple-500' />
            </div>
            <div className='flex items-start justify-between ml-10'>
              <div>
                <h3 className='text-lg font-semibold line-clamp-1'>{project.title}</h3>
                <p className='text-sm text-muted-foreground line-clamp-2'>{project.description}</p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setManageOpen(true)}
                className={`h-8 w-8 rounded-full transition-all duration-200 hover:bg-purple-500/10 flex-shrink-0 ${
                  !canEdit && !isCreator ? 'opacity-50' : ''
                }`}
                title={t('projects:project_card.buttons.settingsTitle', { title: !canEdit && !isCreator ? t('projects:project_card.noEditPermission') : t('projects:project_card.settings') })}
              >
                <MoreHorizontal className='h-4 w-4' />
                <span className='sr-only'>{t('projects:project_card.buttons.settings')}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pb-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center text-sm text-muted-foreground'>
                <Clock className='mr-1 h-3 w-3 flex-shrink-0' />
                <span className='line-clamp-1'>
                  {t('projects:project_card.created')} {formatDistanceToNow(createdDate, { addSuffix: true, locale })}
                </span>
              </div>
              <AvatarGroup users={project.members} />
            </div>
          </CardContent>
          <CardFooter className='flex flex-col items-stretch pt-0'>
            <div className='flex items-center justify-between py-2'>
              <div className='text-sm'>
                <span className='font-medium text-purple-500'>{completedTasksCount}</span>{' '}
                {t('projects:project_card.of')}{' '}
                <span className='font-medium'>{project.tasks.length}</span>{' '}
                {t('projects:project_card.tasksCompleted')}
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleExpanded}
                className='h-8 px-2 transition-all duration-200 hover:bg-purple-500/10 flex-shrink-0'
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className='mr-1 h-4 w-4' />
                    <span className='hidden sm:inline'>{t('projects:project_card.buttons.collapse')}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className='mr-1 h-4 w-4' />
                    <span className='hidden sm:inline'>{t('projects:project_card.buttons.expand')}</span>
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  key={`expanded-${project.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className='overflow-hidden'
                  {...({} as MotionDivProps)}
                >
                  <div className='mt-2 space-y-4 border-t pt-4'>
                    <div className='space-y-2'>
                      {project.tasks.length === 0 ? (
                        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center'>
                          <p className='text-sm text-muted-foreground'>{t('projects:project_card.noTasks')}</p>
                          {canEdit && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='mt-2 transition-all duration-200 hover:bg-purple-500/10'
                              onClick={() => setTaskDialogOpen(true)}
                            >
                              <Plus className='mr-1 h-3 w-3' />
                              {t('projects:project_card.buttons.addTask')}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <AnimatePresence>
                          {project.tasks.map((task, index) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <TaskItem
                                task={task}
                                onToggleComplete={() => handleTaskToggle(task.id)}
                                onEdit={() => openEditTaskDialog(task)}
                                onDelete={() => handleDeleteTask(task.id)}
                                canEdit={canEdit}
                                canComplete={canComplete}
                                completedByUser={task.completion ? getUserById(task.completion.completedBy) : undefined}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>

                    {canEdit && (
                      <div className='flex flex-wrap gap-2 justify-between'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='transition-all duration-200 hover:bg-destructive/10 text-destructive'
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash className='mr-1 h-4 w-4' />
                          <span className='hidden sm:inline'>{t('projects:project_card.buttons.deleteProject')}</span>
                          <span className='sm:hidden'>{t('projects:project_card.buttons.delete')}</span>
                        </Button>

                        {project.tasks.length > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='transition-all duration-200 hover:bg-purple-500/10 hover:border-purple-500/50'
                            onClick={() => setTaskDialogOpen(true)}
                          >
                            <Plus className='mr-1 h-4 w-4' />
                            <span className='hidden sm:inline'>{t('projects:project_card.buttons.addTask')}</span>
                            <span className='sm:hidden'>{t('projects:project_card.buttons.add')}</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        </Card>
      </motion.div>

      <ProjectManageDialog
        project={project}
        open={manageOpen}
        onOpenChange={setManageOpen}
        onUpdateProject={onUpdateProject}
        currentUser={mockCurrentUser}
        canEdit={canEdit}
        isCreator={isCreator}
      />

      {canEdit && (
        <>
          <TaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} onAddTask={handleAddTask} />

          {editingTask && (
            <TaskDialog
              open={!!editingTask}
              onOpenChange={() => setEditingTask(null)}
              onEditTask={handleEditTask}
              task={editingTask}
            />
          )}
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('projects:project_card.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('projects:project_card.deleteDialog.description', { title: project.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('projects:project_card.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('projects:project_card.deleteDialog.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}