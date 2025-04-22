"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Clock, FolderIcon, CheckCircle2, Circle, CheckCircle, Star } from "lucide-react"
import { TooltipContent } from "@/components/ui/calendar/tooltip"
import { getPriorityColorClass } from "@/lib/calendar-utils"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

type TaskTooltipProps = {
  task: Task
  toggleTaskCompletion: (taskId: number) => void
}

export default function TaskTooltip({ task, toggleTaskCompletion }: TaskTooltipProps) {
  // Use local state to provide immediate visual feedback
  const [isCompleted, setIsCompleted] = useState(task.completed)

  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Update local state for immediate feedback
    setIsCompleted(!isCompleted)

    // Call the actual toggle function
    toggleTaskCompletion(task.id)
  }

  // Extract time from dueDate
  const time = task.dueDate ? task.dueDate.split("T")[1]?.substring(0, 5) : undefined

  return (
    <TooltipContent side="bottom" className="max-w-[300px] p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="font-medium flex items-center gap-1">
          <span className={getPriorityColorClass(task.priority)}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          {task.starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
        </div>
        <div className="flex-shrink-0 cursor-pointer" onClick={handleToggleCompletion}>
          <div
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200",
              isCompleted
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
            )}
          >
            {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </div>
        </div>
      </div>
      <div className="font-semibold text-sm mt-1">{task.title}</div>
      {task.description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">{task.description}</div>
      )}
      <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center mr-3">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(task.dueDate.split("T")[0]).toLocaleDateString()}
        </div>
        {time && (
          <span className="flex items-center mr-2">
            <Clock className="h-3 w-3 mr-1" />
            {time}
          </span>
        )}
        <span className="capitalize flex items-center">
          <FolderIcon className="h-3 w-3 mr-1" />
          {task.category}
        </span>
      </div>
      {isCompleted && (
        <div className="mt-1 flex items-center text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
        </div>
      )}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Created: {new Date(task.createdAt).toLocaleString()}
      </div>
    </TooltipContent>
  )
}
