"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"
import TaskDetailModal from "./task-detail-modal"
import TaskModal from "./task-modal"
import { fetchTasks, fetchCategories } from "@/lib/tasks-data"
import { useCalendar } from "@/hooks/use-calendar"
import CalendarHeader from "./calendar-header"
import CalendarToolbar from "./calendar-toolbar"
import MonthView from "./calendar-views/month-view"
import ListView from "./calendar-views/list-view"

export default function Calendar() {
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMobile()

  // Get all calendar functionality from the custom hook
  const calendar = useCalendar()

  // Fetch tasks and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [tasksData, categoriesData] = await Promise.all([fetchTasks(), fetchCategories()])
        calendar.setTasks(tasksData)
        calendar.setCategories(categoriesData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  // For mobile, use shorter day names
  const shortDayNames = ["S", "M", "T", "W", "T", "F", "S"]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-300 flex flex-col h-full overflow-y-auto">
      {/* Calendar header */}
      <CalendarHeader
        monthName={calendar.monthName}
        currentYear={calendar.currentYear}
        currentMonth={calendar.currentMonth}
        isMobile={isMobile}
        goToToday={calendar.goToToday}
        prevMonth={calendar.prevMonth}
        nextMonth={calendar.nextMonth}
        changeMonth={calendar.changeMonth}
        changeYear={calendar.changeYear}
        getYearOptions={calendar.getYearOptions}
      />

      {/* Toolbar */}
      <CalendarToolbar
        searchQuery={calendar.searchQuery}
        setSearchQuery={calendar.setSearchQuery}
        view={calendar.view}
        setView={calendar.setView}
        categories={calendar.categories}
        selectedCategories={calendar.selectedCategories}
        toggleCategory={calendar.toggleCategory}
        clearCategoryFilters={calendar.clearCategoryFilters}
        showCompleted={calendar.showCompleted}
        toggleShowCompleted={calendar.toggleShowCompleted}
      />

      {/* Tabs for different views */}
      <Tabs
        value={calendar.view}
        className="w-full"
        onValueChange={(value) => calendar.setView(value as "month" | "list")}
      >
        {/* Month View */}
        <TabsContent value="month" className="m-0 overflow-hidden">
          <MonthView
            calendarDays={calendar.calendarDays}
            currentMonth={calendar.currentMonth}
            currentYear={calendar.currentYear}
            direction={calendar.direction}
            animationKey={calendar.animationKey}
            getTasksForDay={calendar.getTasksForDay}
            openAddTaskModal={calendar.openAddTaskModal}
            openTaskDetail={calendar.openTaskDetail}
            toggleTaskCompletion={calendar.toggleTaskCompletion}
            categoryColorMap={calendar.categoryColorMap}
            dayNames={isMobile ? shortDayNames : dayNames}
            isMobile={isMobile}
          />
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="m-0">
          <ListView
            getMonthTasks={calendar.getMonthTasks}
            direction={calendar.direction}
            animationKey={calendar.animationKey}
            openTaskDetail={calendar.openTaskDetail}
            toggleTaskCompletion={calendar.toggleTaskCompletion}
            categoryColorMap={calendar.categoryColorMap}
            showCompleted={calendar.showCompleted}
          />
        </TabsContent>
      </Tabs>

      {/* Task modal */}
      {calendar.isModalOpen && (
        <TaskModal
          isOpen={calendar.isModalOpen}
          onClose={() => calendar.setIsModalOpen(false)}
          onAddTask={calendar.addTask}
          selectedDate={calendar.selectedDate}
          categories={calendar.allCategories}
        />
      )}

      {/* Task detail modal */}
      <TaskDetailModal
        task={calendar.selectedTask}
        isOpen={!!calendar.selectedTask}
        onClose={calendar.closeTaskDetail}
        toggleTaskCompletion={calendar.toggleTaskCompletion}
      />
    </div>
  )
}
