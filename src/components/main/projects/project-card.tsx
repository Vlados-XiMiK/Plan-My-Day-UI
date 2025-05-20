"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, Folder, MoreHorizontal, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Project, Task, User } from "@/types/project"
import type { ProjectMember, Role } from "@/types/roles"
import { AvatarGroup } from "./avatar-group"
import ProjectManageDialog from "./project-manage-dialog"
import TaskDialog from "./task-dialog"
import TaskItem from "./task-item"
import { formatDistanceToNow } from "date-fns"
import { enUS, uk } from "date-fns/locale"
import { motion, AnimatePresence, MotionProps } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/projects/alert-dialog"
import { useTranslation } from "react-i18next"
import { getUserRoleInProject, hasPermission } from "@/utils/roleUtils"
import { useNotification } from "@/contexts/notification-context"
import { HTMLAttributes } from 'react'

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface ProjectCardProps {
  project: Project
  tasks: Task[]
  roles: Role[]
  projectMembers: ProjectMember[]
  onUpdateProject: (project: Project) => void
  onDeleteProject: (projectId: number) => void
  onUpdateMembers: (projectId: number, members: ProjectMember[]) => void
  onAddTask: (task: Task) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: number) => void // Изменено с string на number
  onCreateShareLink?: () => void
  isExpanded: boolean
  onToggleExpanded: () => void
  currentUser: User // Сделали обязательным
}

export default function ProjectCard({
  project,
  tasks,
  roles,
  projectMembers,
  onUpdateProject,
  onDeleteProject,
  onUpdateMembers,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onCreateShareLink,
  isExpanded,
  onToggleExpanded,
  currentUser,
}: ProjectCardProps) {
  const { t, i18n } = useTranslation(['projects', 'notifications'])
  const { addNotification } = useNotification()
  const [manageOpen, setManageOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const toggleExpanded = () => {
    onToggleExpanded()
  }

  const handleTaskToggle = (taskId: number) => { // Изменено с string на number
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      completed_at: task.completed ? null : new Date().toISOString(),
      completed_by: task.completed ? null : currentUser.id,
      completed_by_name: task.completed ? null : currentUser.username,
      updated_at: new Date().toISOString(),
    }

    onUpdateTask(updatedTask)
    addNotification(
      updatedTask.completed ? 'success' : 'info',
      updatedTask.completed
        ? t('notifications:taskCompleted.title')
        : t('notifications:taskReopened.title'),
      updatedTask.completed
        ? t('notifications:taskCompleted.message', { title: task.title })
        : t('notifications:taskReopened.message', { title: task.title }),
      3000
    )
  }

  const handleAddTask = (
    task: Omit<Task, "id" | "user" | "user_name" | "created_at" | "updated_at" | "completed_at" | "completed_by" | "completed_by_name">
  ) => {
    const newTask: Task = {
      id: 0, // Временный ID, будет заменён API
      ...task,
      user: currentUser.id,
      user_name: currentUser.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      completed_by: null,
      completed_by_name: null,
    }

    onAddTask(newTask)
    setTaskDialogOpen(false)
    addNotification(
      'success',
      t('notifications:taskCreated.title'),
      t('notifications:taskCreated.message', { title: newTask.title }),
      3000
    )
  }

  const handleEditTask = (task: Task) => {
    onUpdateTask(task)
    setEditingTask(null)
    addNotification(
      'success',
      t('notifications:taskUpdated.title'),
      t('notifications:taskUpdated.message', { title: task.title }),
      3000
    )
  }

  const handleDeleteTask = (taskId: number) => { // Изменено с string на number
    onDeleteTask(taskId)
    if (editingTask && editingTask.id === taskId) {
      setEditingTask(null)
    }
    const task = tasks.find((t) => t.id === taskId)
    addNotification(
      'success',
      t('notifications:taskDeleted.title'),
      t('notifications:taskDeleted.message', { title: task?.title || '' }),
      3000
    )
  }

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task)
  }

  const handleDeleteProject = () => {
    onDeleteProject(project.id)
    setDeleteDialogOpen(false)
    addNotification(
      'success',
      t('notifications:projectDeleted.title'),
      t('notifications:projectDeleted.message', { title: project.name }),
      3000
    )
  }

  const userRole = getUserRoleInProject(currentUser, project.id, projectMembers)
  const canEdit = hasPermission(userRole, 'edit_project')
  const canComplete = hasPermission(userRole, 'edit_task')
  const isCreator = project.owner === currentUser.id

  const completedTasksCount = tasks.filter((task) => task.completed).length
  const createdDate = new Date(project.created_at)

  const getUserById = (userId: number | null) => {
    if (!userId) return undefined
    return projectMembers.find((member) => member.user === userId)?.user_details
  }

  const formatCreatedDate = () => {
    const locale = i18n.language === 'ua' ? uk : enUS
    return formatDistanceToNow(createdDate, { addSuffix: true, locale })
  }

  const handleUpdateMembers = (members: ProjectMember[]) => {
    onUpdateMembers(project.id, members)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
        className="h-full"
        {...({} as MotionDivProps)}
      >
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full border-t-4 border-t-purple-500">
          <CardHeader className="pb-3 relative">
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Folder className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex items-start justify-between ml-10">
              <div>
                <h3 className="text-lg font-semibold line-clamp-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setManageOpen(true)}
                className={`h-8 w-8 rounded-full transition-all duration-200 hover:bg-purple-500/10 flex-shrink-0 ${
                  !canEdit && !isCreator ? "opacity-50" : ""
                }`}
                title={(!canEdit && !isCreator) ? t('project_card.noEditPermission') : t('project_card.buttons.settings')}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t('project_card.buttons.settings')}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-1">{t('project_card.created')} {formatCreatedDate()}</span>
              </div>
              <AvatarGroup
                users={projectMembers.map((m) => m.user_details)}
                projectId={project.id}
                projectMembers={projectMembers}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch pt-0">
            <div className="flex items-center justify-between py-2">
              <div className="text-sm">
                <span className="font-medium text-purple-500">{completedTasksCount}</span> {t('project_card.of')}{" "}
                <span className="font-medium">{tasks.length}</span> {t('project_card.tasksCompleted')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="h-8 px-2 transition-all duration-200 hover:bg-purple-500/10 flex-shrink-0"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">{t('project_card.buttons.collapse')}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">{t('project_card.buttons.expand')}</span>
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  key={`expanded-${project.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                  {...({} as MotionDivProps)}
                >
                  <div className="mt-2 space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                          <p className="text-sm text-muted-foreground">{t('project_card.noTasks')}</p>
                          {canEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 transition-all duration-200 hover:bg-purple-500/10"
                              onClick={() => setTaskDialogOpen(true)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              {t('project_card.buttons.addTask')}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <AnimatePresence>
                          {tasks.map((task, index) => (
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
                                completedByUser={task.completed_by ? getUserById(task.completed_by) : undefined}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>

                    {canEdit && (
                      <div className="flex flex-wrap gap-2 justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="transition-all duration-200 hover:bg-destructive/10 text-destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash className="mr-1 h-4 w-4" />
                          <span className="hidden sm:inline">{t('project_card.buttons.deleteProject')}</span>
                          <span className="sm:hidden">{t('project_card.buttons.delete')}</span>
                        </Button>

                        {tasks.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:bg-purple-500/10 hover:border-purple-500/50"
                            onClick={() => setTaskDialogOpen(true)}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            <span className="hidden sm:inline">{t('project_card.buttons.addTask')}</span>
                            <span className="sm:hidden">{t('project_card.buttons.add')}</span>
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
        projectMembers={projectMembers}
        open={manageOpen}
        onOpenChange={setManageOpen}
        onUpdateProject={onUpdateProject}
        onUpdateMembers={handleUpdateMembers}
        onDeleteProject={onDeleteProject}
        currentUser={currentUser}
        canEdit={canEdit}
        isCreator={isCreator}
        roles={roles}
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
            <AlertDialogTitle>{t('project_card.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('project_card.deleteDialog.description', { title: project.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('project_card.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('project_card.deleteDialog.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}