"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle, Clock, ChevronUp, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/deadline-notification/ui/badge"
import { Progress } from "@/components/ui/deadline-notification/ui/progress"
import { AnimatePresence, motion, MotionProps } from "framer-motion"
import { HTMLAttributes } from 'react'
import type { Task } from "@/types"
import { calculateTimeRemaining } from "@/lib/tasks-data"
import { isPast } from 'date-fns'
import { useTranslation } from 'react-i18next'

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface FloatingDeadlineReminderProps {
  tasks: Task[]
  onComplete: (taskId: number) => void
  onSnooze: (taskId: number) => void
}

export default function FloatingDeadlineReminder({ tasks, onComplete, onSnooze }: FloatingDeadlineReminderProps) {
  const { t } = useTranslation('tasks')
  const [isOpen, setIsOpen] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const [remindersEnabled, setRemindersEnabled] = useState(true)

  // We load the configuration recalled from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem("deadlineRemindersEnabled")
    setRemindersEnabled(savedSetting !== null ? JSON.parse(savedSetting) : true)
  }, [])

  // Filter tasks that are approaching deadline (less than 48 hours) or overdue
  const urgentTasks = tasks
    .filter((task) => {
      if (task.completed) return false
      const timeRemaining = calculateTimeRemaining(task.dueDate)
      return isPast(new Date(task.dueDate)) || timeRemaining.days === 0 || (timeRemaining.days === 1 && timeRemaining.hours < 12)
    })
    .sort((a, b) => {
      // Sort by due date (earliest first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  // Pulse animation effect
  useEffect(() => {
    if (urgentTasks.length > 0) {
      const interval = setInterval(() => {
        setIsPulsing(true)
        setTimeout(() => setIsPulsing(false), 1000)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [urgentTasks.length])

  // If reminders are off, don't render the component
  if (!remindersEnabled) {
    return null
  }

  // Format remaining time text
  const formatRemainingTime = (task: Task) => {
    const dueDate = new Date(task.dueDate)
    if (isPast(dueDate)) {
      return { text: t('timeRemaining.overdue'), isOverdue: true }
    }
    const timeRemaining = calculateTimeRemaining(task.dueDate)
    if (timeRemaining.days === 0 && timeRemaining.hours === 0) {
      return { 
        text: t('timeRemaining.dueInMinutes', { 
          minutes: timeRemaining.minutes, 
          minutePlural: timeRemaining.minutes === 1 ? t('timeRemaining.minute') : t('timeRemaining.minutes')
        }), 
        isOverdue: false 
      }
    }
    if (timeRemaining.days === 0) {
      return { 
        text: t('timeRemaining.dueInHours', { 
          hours: timeRemaining.hours, 
          minutes: timeRemaining.minutes, 
          hourPlural: timeRemaining.hours === 1 ? t('timeRemaining.hour') : t('timeRemaining.hours'), 
          minutePlural: timeRemaining.minutes === 1 ? t('timeRemaining.minute') : t('timeRemaining.minutes')
        }), 
        isOverdue: false 
      }
    }
    return { 
      text: t('timeRemaining.dueInDays', { 
        days: timeRemaining.days, 
        hours: timeRemaining.hours, 
        minutes: timeRemaining.minutes, 
        dayPlural: timeRemaining.days > 1 ? t('timeRemaining.days') : t('timeRemaining.day')
      }), 
      isOverdue: false 
    }
  }

  // Get color for progress bar based on remaining time
  const getProgressBarColor = (task: Task) => {
    const dueDate = new Date(task.dueDate)
    if (isPast(dueDate)) {
      return "bg-red-500" // Overdue: Red
    }
    const timeRemaining = calculateTimeRemaining(task.dueDate)
    if (timeRemaining.days === 0 && timeRemaining.hours < 3) {
      return "bg-orange-500" // Less than 3 hours: Orange
    }
    if (timeRemaining.days === 0) {
      return "bg-yellow-500" // Same day, more than 3 hours: Yellow
    }
    return "bg-green-500" // Next day (less than 12 hours): Green
  }

  return (
    <>
      {/* Floating button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        {...({} as MotionDivProps)}
      >
        <motion.div animate={isPulsing ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.5 }}>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`h-14 w-14 rounded-full shadow-lg ${
              isOpen ? "bg-gray-700" : "bg-gradient-to-r from-purple-500 to-purple-600"
            }`}
            size="icon"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
            {!isOpen && urgentTasks.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white border-2 border-white p-0">
                {urgentTasks.length}
              </Badge>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Tasks dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-30 w-full max-w-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            {...({} as MotionDivProps)}
          >
            <Card className="border shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-medium">{t('deadlineReminder.upcomingDeadlines')}</h3>
                  </div>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/20">
                    {t('deadlineReminder.tasksCount', { count: urgentTasks.length })}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
                {urgentTasks.length > 0 ? (
                  <div className="divide-y">
                    {urgentTasks.map((task) => {
                      const { text, isOverdue } = formatRemainingTime(task)
                      return (
                        <div key={task.id} className="p-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1">
                              <h4 className="font-medium text-sm line-clamp-1">{task.title}</h4>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs">
                                  {isOverdue ? (
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <span className={isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}>
                                    {t('deadlineReminder.remaining')}: {text}
                                  </span>
                                </div>
                                <Badge
                                  className={`text-xs ${
                                    task.priority === "high"
                                      ? "bg-red-100 text-red-800"
                                      : task.priority === "medium"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {t(`priority.${task.priority}`)}
                                </Badge>
                              </div>
                              <Progress
                                value={isOverdue ? 100 : calculateTimeRemaining(task.dueDate).days === 0 ? 80 : 50}
                                className="h-1 mt-1.5"
                                indicatorClassName={getProgressBarColor(task)}
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full"
                                onClick={() => onSnooze(task.id)}
                              >
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="sr-only">{t('deadlineReminder.snooze')}</span>
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full"
                                onClick={() => onComplete(task.id)}
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                <span className="sr-only">{t('deadlineReminder.complete')}</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>{t('deadlineReminder.noUrgentTasks')}</p>
                  </div>
                )}
              </CardContent>

              {urgentTasks.length > 0 && (
                <CardFooter className="p-3 bg-muted/20 flex justify-center border-t">
                  <Button variant="ghost" size="sm" className="text-xs w-full" onClick={() => setIsOpen(false)}>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    {t('deadlineReminder.hide')}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}