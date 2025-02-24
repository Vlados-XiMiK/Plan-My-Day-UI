import type { Metadata } from "next"
import Stats from "@/components/main/Stats"

export const metadata: Metadata = {
  title: "Productivity Stats - Plan My Day",
  description: "View and analyze your productivity stats and insights with Plan My Day. Track your tasks, events, and deadlines efficiently.",
}

export default function StatsView() {
  return <Stats />
}

