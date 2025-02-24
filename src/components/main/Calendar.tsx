'use client'

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatedBackground, LightAnimatedBackground } from "@/components/ui/animated-background"
import { useTheme } from "next-themes"

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  type: 'event' | 'deadline';
}

interface CalendarProps {
  tasks: Task[];
}

const Calendar: React.FC<CalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [filter, setFilter] = useState<'all' | 'events' | 'deadlines'>('all');
  const { theme } = useTheme()

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayTasks = (day: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === day &&
             taskDate.getMonth() === currentDate.getMonth() &&
             taskDate.getFullYear() === currentDate.getFullYear() &&
             (filter === 'all' || (filter === 'events' && task.type === 'event') || (filter === 'deadlines' && task.type === 'deadline'));
    });
  };

  const getTaskColor = (type: 'event' | 'deadline') => {
    return type === 'event' ? 'bg-blue-500 dark:bg-blue-400' : 'bg-red-500 dark:bg-red-400';
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center font-bold text-gray-800 dark:text-gray-200">{day}</div>
      ))}
      {Array.from({ length: firstDayOfMonth }).map((_, index) => (
        <div key={`empty-${index}`} />
      ))}
      {Array.from({ length: daysInMonth }).map((_, index) => {
        const day = index + 1;
        const dayTasks = getDayTasks(day);
        return (
          <div
            key={day}
            className="border border-gray-200 dark:border-[#3a3a5e] p-2 h-24 overflow-y-auto hover:bg-gray-100 dark:hover:bg-[#3a3a5e] transition-colors duration-200 calendar-day-hover bg-white dark:bg-[#2a2a3e]"
          >
            <div className="font-semibold text-gray-800 dark:text-gray-200">{day}</div>
            {dayTasks.map(task => (
              <div
                key={task.id}
                className={`text-xs mt-1 p-1 rounded calendar-task ${getTaskColor(task.type)} text-white`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, index) => {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + index);
          const dayTasks = getDayTasks(day.getDate());
          
          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-[#3a3a5e] p-2 min-h-[200px] overflow-y-auto hover:bg-gray-100 dark:hover:bg-[#3a3a5e] transition-colors duration-200 calendar-day-hover bg-white dark:bg-[#2a2a3e]"
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200">{day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</div>
              {dayTasks.map(task => (
                <div
                  key={task.id}
                  className={`text-xs mt-1 p-1 rounded calendar-task ${getTaskColor(task.type)} text-white`}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 rounded-lg shadow-md min-h-screen bg-white dark:bg-[#1a1a2e] relative">
      <div className="absolute inset-0 z-0">
        {theme === "dark" ? <AnimatedBackground /> : <LightAnimatedBackground />}
      </div>
      <div className="relative z-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as 'month' | 'week')}
              className="border border-gray-300 dark:border-[#3a3a5e] bg-white dark:bg-[#2a2a3e] rounded p-1 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'events' | 'deadlines')}
              className="border border-gray-300 dark:border-[#3a3a5e] bg-white dark:bg-[#2a2a3e] rounded p-1 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="events">Events Only</option>
              <option value="deadlines">Deadlines Only</option>
            </select>
            <button
              onClick={prevMonth}
              className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a5e] transition-colors duration-200"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a5e] transition-colors duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>
    </div>
  );
};

export default Calendar;