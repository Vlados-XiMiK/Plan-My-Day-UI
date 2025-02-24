import type { Metadata } from "next"
import Tasks from "@/components/main/Tasks"

export const metadata: Metadata = {
  title: "Tasks - Plan My Day",
  description: "View and manage your tasks",
}

export default function TasksView() {
  return <Tasks />
}

