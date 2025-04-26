"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/types/project"
import { CalendarIcon, Clock, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { motion, MotionProps, AnimatePresence } from "framer-motion"
import CustomCalendar from "@/components/ui/projects/custom-calendar"
import { useNotification } from "@/contexts/notification-context"
import { HTMLAttributes } from 'react'

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask?: (task: Omit<Task, "id">) => void
  onEditTask?: (task: Task) => void
  task?: Task
}

export default function TaskDialog({ open, onOpenChange, onAddTask, onEditTask, task }: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<string>("medium")
  const [category, setCategory] = useState<string>("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [dueTime, setDueTime] = useState<string>("23:59") // Default time is 23:59
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { addNotification } = useNotification()

  const calendarRef = useRef<HTMLDivElement>(null)
  const calendarButtonRef = useRef<HTMLButtonElement>(null)

  const isEditing = !!task
  const isDateSelectionEnabled = title.trim() && description.trim() && priority

  // Check if selected date-time is valid (not in the past)
  const isValidDateTime = () => {
    if (!dueDate || !dueTime) return true
    const now = new Date()
    const [hours, minutes] = dueTime.split(":").map(Number)
    const selectedDateTime = new Date(dueDate)
    selectedDateTime.setHours(hours, minutes, 0, 0)
    return selectedDateTime >= now
  }

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setPriority(task.priority || "medium")
      setCategory(task.category || "")

      if (task.dueDate) {
        const date = new Date(task.dueDate)
        setDueDate(date)

        // Extract time from the date
        const hours = date.getHours().toString().padStart(2, "0")
        const minutes = date.getMinutes().toString().padStart(2, "0")
        setDueTime(`${hours}:${minutes}`)
      } else {
        setDueDate(undefined)
        setDueTime("23:59")
      }
    } else {
      // Reset form when opening for a new task
      setTitle("")
      setDescription("")
      setPriority("medium")
      setCategory("")
      setDueDate(undefined)
      setDueTime("23:59")
    }

    // Reset calendar state
    setIsCalendarOpen(false)
  }, [task, open])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation for required fields
    if (!title.trim()) {
      addNotification('error', 'Invalid Input', 'Task title is required', 5000)
      return
    }
    if (!description.trim()) {
      addNotification('error', 'Invalid Input', 'Task description is required', 5000)
      return
    }
    if (!priority) {
      addNotification('error', 'Invalid Input', 'Task priority is required', 5000)
      return
    }
    if (!dueDate) {
      addNotification('error', 'Invalid Input', 'Task due date is required', 5000)
      return
    }

    if (!isValidDateTime()) {
      addNotification('error', 'Invalid Date', 'Due date cannot be in the past', 5000)
      return
    }

    // Combine date and time if a date is selected
    let finalDueDate: string | undefined = undefined

    if (dueDate) {
      const [hours, minutes] = dueTime.split(":").map(Number)
      const dateWithTime = new Date(dueDate)
      dateWithTime.setHours(hours, minutes, 0, 0)
      finalDueDate = dateWithTime.toISOString()
    }

    const taskData = {
      title,
      description,
      completed: isEditing ? task.completed : false,
      createdAt: isEditing ? task.createdAt : new Date().toISOString(),
      dueDate: finalDueDate,
      priority: priority as "low" | "medium" | "high",
      category: category || undefined,
    }

    try {
      if (isEditing && onEditTask) {
        onEditTask({
          id: task.id,
          ...taskData,
          completion: task.completion, // Preserve completion info if it exists
        })
        addNotification('success', 'Task Updated', `Task "${title}" has been updated`, 3000)
      } else if (onAddTask) {
        onAddTask(taskData)
      }
      onOpenChange(false)
    } catch {
      addNotification(
        'error',
        isEditing ? 'Update Failed' : 'Creation Failed',
        `Failed to ${isEditing ? 'update' : 'create'} task. Please try again.`,
        5000
      )
    }
  }

  // Helper function to set default time when a date is selected
  const handleDateSelect = (date: Date) => {
    setDueDate(date)

    // Don't close the calendar if it's today's date
    const today = new Date()
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    if (!isToday) {
      setIsCalendarOpen(false)
    }

    // If no time was previously set or if this is a new task, set default time
    if (!dueTime || dueTime === "") {
      // Set default time to next hour if today is selected
      if (isToday) {
        const now = new Date()
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
        const hours = nextHour.getHours().toString().padStart(2, "0")
        const minutes = nextHour.getMinutes().toString().padStart(2, "0")
        setDueTime(`${hours}:${minutes}`)
      } else {
        setDueTime("23:59")
      }
    }
  }

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDueDate(undefined)
    setDueTime("23:59")
    addNotification('info', 'Date Cleared', 'Task due date has been removed', 3000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit task" : "Create new task"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the details of your task." : "Add a new task to your project."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              {...({} as MotionDivProps)}
            >
              <Label htmlFor="title">
                Task title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
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
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your task"
                rows={3}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              {...({} as MotionDivProps)}
            >
              <div className="grid gap-2">
                <Label htmlFor="priority">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger
                    id="priority"
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    id="category"
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              {...({} as MotionDivProps)}
            >
              <Label htmlFor="dueDate">
                Due date <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Button
                    ref={calendarButtonRef}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 pr-10",
                      !dueDate && "text-muted-foreground",
                      isCalendarOpen && "border-purple-500 ring-2 ring-purple-500/20",
                    )}
                    onClick={() => isDateSelectionEnabled && setIsCalendarOpen(!isCalendarOpen)}
                    disabled={!isDateSelectionEnabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "MMMM d, yyyy") : "Select a date"}
                    {dueDate && (
                      <span
                        onClick={clearDate}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear date</span>
                      </span>
                    )}
                  </Button>

                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div
                        ref={calendarRef}
                        className="absolute z-50 bottom-full mb-1 w-full sm:w-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        {...({} as MotionDivProps)}
                      >
                        <CustomCalendar
                          selectedDate={dueDate}
                          onDateSelect={handleDateSelect}
                          className="w-full sm:w-[280px]"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative flex items-center">
                  <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="pl-10 w-full sm:w-[120px] transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                    disabled={!dueDate}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dueDate ? 
                  isValidDateTime() ? 
                    `Task will be due on ${format(dueDate, "MMMM d, yyyy")} at ${dueTime}` : 
                    "Due date cannot be in the past" : 
                  "No due date set"}
              </p>
            </motion.div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-all duration-200 hover:bg-destructive/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700"
              disabled={dueDate && !isValidDateTime()}
            >
              {isEditing ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}