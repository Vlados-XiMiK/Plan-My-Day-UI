"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/calendar/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/calendar/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/calendar/select"
import { Textarea } from "@/components/ui/calendar/textarea"
import type { Task } from "@/types"

type TaskModalProps = {
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "starred">) => void
  selectedDate: string | null
  categories: string[]
}

export default function TaskModal({ isOpen, onClose, onAddTask, selectedDate, categories }: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [category, setCategory] = useState(categories[0] || "Работа")
  const [description, setDescription] = useState("")
  const [time, setTime] = useState("09:00")

  // Add validation for past dates and times
  // Add state for validation error
  const [validationError, setValidationError] = useState<string | null>(null)

  // Update the handleSubmit function to check if the date and time are in the past
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (title.trim() && selectedDate) {
      // Create the dueDate by combining the date and time
      const dueDate = `${selectedDate}T${time}:00`

      // Check if the selected date and time are in the past
      const selectedDateTime = new Date(dueDate)
      const currentDateTime = new Date()

      if (selectedDateTime < currentDateTime) {
        setValidationError("Cannot create tasks in the past. Please select a future date and time.")
        return
      }

      // Clear any previous validation errors
      setValidationError(null)

      onAddTask({
        title: title.trim(),
        description: description.trim() || "",
        dueDate,
        category,
        priority,
        completed: false,
        date: selectedDate, // Add the date field for compatibility
      })
      setTitle("")
      setPriority("medium")
      setCategory(categories[0] || "Работа")
      setDescription("")
      setTime("09:00")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Add Task for {formatDate(selectedDate)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={selectedDate || ""} disabled className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details about this task"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="rounded-lg max-h-[200px] overflow-y-auto">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="text-blue-600 dark:text-blue-400">
                  Low
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-amber-600 dark:text-amber-400">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="text-red-600 dark:text-red-400">
                  High
                </Label>
              </div>
            </RadioGroup>
          </div>

          {validationError && <div className="text-sm text-red-500 font-medium">{validationError}</div>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
