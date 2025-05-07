import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Productivity Stats - Plan My Day",
  description: "View and analyze your productivity stats and insights with Plan My Day. Track your tasks, events, and deadlines efficiently.",
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}