// app/projects/page.tsx
import type { Metadata } from "next"
import Project from "@/components/main/projects/project"

export const metadata: Metadata = {
  title: "Projects | Task Planner",
  description: "Manage your projects and tasks",
}

export default function ProjectsPage() {
  return <Project />
}