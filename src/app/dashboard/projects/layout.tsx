import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects - Plan My Day",
  description: "Manage and track your projects efficiently with Plan My Day. Stay organized and meet deadlines with ease.",
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}