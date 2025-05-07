import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tasks - Plan My Day",
  description: "View and manage your tasks",
}

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}