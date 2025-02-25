import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calendar - Plan My Day",
  description: "View and manage your tasks in the Plan My Day calendar",
}

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}