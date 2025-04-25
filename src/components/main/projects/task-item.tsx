"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type { Task, User } from "@/types/project"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Check, Clock, Edit, Trash2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/projects/avatar"
import { motion, MotionProps } from "framer-motion"
import { HTMLAttributes } from 'react'

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface TaskItemProps {
  task: Task
  onToggleComplete: () => void
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
  canComplete: boolean
  completedByUser?: User
}

export default function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  canEdit,
  canComplete,
  completedByUser,
}: TaskItemProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  }

  const categoryColors = {
    design:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    development:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    testing:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    marketing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  }

  const createdDate = new Date(task.createdAt)
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  const completedDate = task.completion ? new Date(task.completion.completedAt) : null

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`rounded-lg border p-3 transition-all duration-300 hover:shadow-md ${
          task.completed ? "bg-muted/50 border-green-200 dark:border-green-900" : "bg-card"
        }`}
        {...({} as MotionDivProps)}
      >
        <div className="flex items-start gap-3">
          {canComplete ? (
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={onToggleComplete}
              className="mt-1 transition-all duration-300 data-[state=checked]:bg-purple-600 data-[state=checked]:text-white flex-shrink-0"
            />
          ) : (
            <div className="w-4 h-4 mt-1 flex items-center justify-center flex-shrink-0">
              {task.completed ? (
                <Check className="h-4 w-4 text-purple-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <label
                htmlFor={canComplete ? task.id : undefined}
                className={`font-medium line-clamp-2 ${task.completed ? "text-muted-foreground line-through" : ""}`}
              >
                {task.title}
              </label>

              <div className="flex items-center gap-1 flex-shrink-0">
                {canEdit && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 transition-all duration-200 hover:bg-purple-500/10"
                          onClick={onEdit}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit task</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit task</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive transition-all duration-200 hover:bg-destructive/10"
                          onClick={onDelete}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete task</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete task</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            {task.description && (
              <p
                className={`text-sm line-clamp-2 ${
                  task.completed ? "text-muted-foreground line-through" : "text-muted-foreground"
                }`}
              >
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {task.priority && (
                <Badge
                  variant="outline"
                  className={`${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.default} transition-all duration-300 hover:shadow-sm text-xs`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
                </Badge>
              )}

              {task.category && (
                <Badge
                  variant="outline"
                  className={`${categoryColors[task.category as keyof typeof categoryColors] || categoryColors.default} transition-all duration-300 hover:shadow-sm text-xs`}
                >
                  {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-1">Created {formatDistanceToNow(createdDate, { addSuffix: true })}</span>
              </div>

              {dueDate && (
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="line-clamp-1">
                    Due {format(dueDate, "MMM d")} at {format(dueDate, "HH:mm")}
                  </span>
                </div>
              )}

              {task.completed && completedByUser && completedDate && (
                <div className="flex items-center gap-1 mt-1 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                  <Check className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">Completed by</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        {completedByUser.avatar ? (
                          <Avatar className="h-4 w-4 mr-1">
                            <AvatarImage
                              src={completedByUser.avatar || "/placeholder.svg"}
                              alt={completedByUser.name}
                            />
                            <AvatarFallback className="text-[8px]">
                              {completedByUser.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="inline-flex h-4 w-4 mr-1 rounded-full overflow-hidden flex-shrink-0 items-center justify-center bg-purple-500 text-white text-[8px] font-bold">
                            {completedByUser.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium line-clamp-1">{completedByUser.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Completed {formatDistanceToNow(completedDate, { addSuffix: true })}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
