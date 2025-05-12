'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useMobile } from '@/hooks/use-mobile'
import TaskDetailModal from './task-detail-modal'
import TaskModal from './task-modal'
import { fetchAllTasks, fetchCategories } from '@/lib/tasks-data'
import { useCalendar } from '@/hooks/use-calendar'
import CalendarHeader from './calendar-header'
import CalendarToolbar from './calendar-toolbar'
import MonthView from './calendar-views/month-view'
import ListView from './calendar-views/list-view'
import { useTranslation } from 'react-i18next'
import { isAuthenticated } from '@/api/auth'
import Loader from '@/components/ui/preloader'

export default function Calendar() {
  const { t } = useTranslation('calendar')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const isMobile = useMobile()

  const calendar = useCalendar()

  useEffect(() => {
    async function checkAuth() {
      const auth = await isAuthenticated()
      setIsAuth(auth)
      setAuthLoading(false)

      if (!auth) {
        router.replace('/auth/login')
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const loadData = async () => {
      if (!isAuth) return
      setIsLoading(true)
      console.log('Fetching data...'); // Логирование для отладки
      try {
        const [tasksData, categoriesData] = await Promise.all([fetchAllTasks(), fetchCategories()]);
        calendar.setTasks(tasksData);
        calendar.setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        calendar.setTasks([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuth) {
      loadData();
    }
  }, [isAuth, calendar.setTasks, calendar.setCategories]); // Зависимости только от isAuth и стабильных функций

  const dayNames = [
    t('dayNames.0'),
    t('dayNames.1'),
    t('dayNames.2'),
    t('dayNames.3'),
    t('dayNames.4'),
    t('dayNames.5'),
    t('dayNames.6'),
  ]
  const shortDayNames = [
    t('shortDayNames.0'),
    t('shortDayNames.1'),
    t('shortDayNames.2'),
    t('shortDayNames.3'),
    t('shortDayNames.4'),
    t('shortDayNames.5'),
    t('shortDayNames.6'),
  ]

  if (authLoading) {
    return <Loader />
  }

  if (!isAuth) {
    return null
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-300 flex flex-col h-full overflow-y-auto">
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

      <Tabs
        value={calendar.view}
        className="w-full"
        onValueChange={(value) => calendar.setView(value as 'month' | 'list')}
      >
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

      {calendar.isModalOpen && (
        <TaskModal
          isOpen={calendar.isModalOpen}
          onClose={() => calendar.setIsModalOpen(false)}
          onAddTask={calendar.addTask}
          selectedDate={calendar.selectedDate}
          categories={calendar.categories}
        />
      )}

      <TaskDetailModal
        task={calendar.selectedTask}
        isOpen={!!calendar.selectedTask}
        onClose={calendar.closeTaskDetail}
        toggleTaskCompletion={calendar.toggleTaskCompletion}
      />
    </div>
  )
}