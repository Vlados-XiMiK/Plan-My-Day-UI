"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, Folder, MoreHorizontal, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Project, Task, User } from "@/types/project"
import type { ProjectMember } from "@/types/roles"
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
import { currentUser } from "@/lib/project-data"
import { HTMLAttributes } from 'react'
import { useTranslation } from "react-i18next"
import { getUserRoleInProject, hasPermission } from "@/utils/roleUtils"

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface ProjectCardProps {
  project: Project
  projectMembers: ProjectMember[]
  onUpdateProject: (project: Project) => void
  onDeleteProject: (projectId: number) => void
  onUpdateMembers: (projectId: number, members: ProjectMember[]) => void // Added
  isExpanded: boolean
  onToggleExpanded: () => void
  currentUser?: User
}

export default function ProjectCard({
  project,
  projectMembers,
  onUpdateProject,
  onDeleteProject,
  onUpdateMembers, // Added
  isExpanded,
  onToggleExpanded,
  currentUser: userProp,
}: ProjectCardProps) {
  const { t, i18n } = useTranslation('projects')
  const [manageOpen, setManageOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const mockCurrentUser: User = userProp || currentUser

  const toggleExpanded = () => {
    onToggleExpanded()
  }

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = project.tasks.map((task) => {
      if (task.id === taskId) {
        if (!task.completed) {
          return {
            ...task,
            completed: true,
            completion: {
              completedBy: mockCurrentUser.id.toString(),
              completedAt: new Date().toISOString(),
            },
          }
        }
        else {
          const { completion, ...rest } = task
          return { ...rest, completed: false }
        }
      }
      return task
    })

    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      tasks_count: updatedTasks.length,
    })
  }

  const handleAddTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...task,
    }

    onUpdateProject({
      ...project,
      tasks: [...project.tasks, newTask],
      tasks_count: project.tasks.length + 1,
    })

    setTaskDialogOpen(false)
  }

  const handleEditTask = (task: Task) => {
    const updatedTasks = project.tasks.map((t) => (t.id === task.id ? task : t))

    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      tasks_count: updatedTasks.length,
    })

    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = project.tasks.filter((task) => task.id !== taskId)

    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      tasks_count: updatedTasks.length,
    })

    if (editingTask && editingTask.id === taskId) {
      setEditingTask(null)
    }
  }

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task)
  }

  const handleDeleteProject = () => {
    onDeleteProject(project.id)
    setDeleteDialogOpen(false)
  }

  // Check user permissions using roleUtils
  const userRole = getUserRoleInProject(mockCurrentUser, project.id, projectMembers)
  const canEdit = hasPermission(userRole, 'edit_project')
  const canComplete = hasPermission(userRole, 'edit_task')
  const isCreator = project.owner === mockCurrentUser.id

  const completedTasksCount = project.tasks.filter((task) => task.completed).length
  const createdDate = new Date(project.created_at)

  const getUserById = (userId: string) => {
    return projectMembers.find((member) => member.user.toString() === userId)?.user_details
  }

  const formatCreatedDate = () => {
    const locale = i18n.language === 'ua' ? uk : enUS
    return formatDistanceToNow(createdDate, { addSuffix: true, locale })
  }

  // Handle member updates
  const handleUpdateMembers = (members: ProjectMember[]) => {
    // TODO: Implement actual member update logic (e.g., update project-data.ts or send to API)
    console.log('ProjectCard: Updating members for project', project.id, 'with members:', members);
    onUpdateMembers(project.id, members);
  };

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
                <span className="font-medium">{project.tasks.length}</span> {t('project_card.tasksCompleted')}
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
                      {project.tasks.length === 0 ? (
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

                        {project.tasks.length > 0 && (
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
        projectMembers={projectMembers} // Use prop instead of []
        open={manageOpen}
        onOpenChange={setManageOpen}
        onUpdateProject={onUpdateProject}
        onUpdateMembers={handleUpdateMembers} // Use implemented function
        onDeleteProject={onDeleteProject}
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