import type { Metadata } from "next"
import Calendar from "@/components/main/Calendar"
import { Task } from "@/components/main/Calendar"

const sampleTasks: Task[] = [
  { id: 1, title: 'Project meeting', dueDate: '2025-02-24T10:00:00', type: 'event' },
  { id: 2, title: 'Dentist appointment', dueDate: '2025-02-25T14:30:00', type: 'event' },
  { id: 3, title: 'Submit report', dueDate: '2025-02-15T17:00:00', type: 'deadline' },
]

export const metadata: Metadata = {
  title: "Calendar - Plan My Day",
  description: "View and manage your tasks in the Plan My Day calendar",
}

export default function CalendarView() {
  return <Calendar tasks={sampleTasks} />
}