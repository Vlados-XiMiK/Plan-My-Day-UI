import ProjectsList from "@/components/main/projects/projects-list"
import type { Metadata } from "next"
import { Folder } from "lucide-react"

export const metadata: Metadata = {
  title: "Projects | Task Planner",
  description: "Manage your projects and tasks",
}

export default function ProjectsPage() {
  return (
    <main className="container py-6 h-full overflow-y-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{
                  background: "linear-gradient(to right, #8B5CF6, #C4B5FD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Projects
              </h1>
              <p className="text-sm text-muted-foreground">Manage your tasks and collaborate with your team</p>
            </div>
          </div>
        </div>
        <ProjectsList />
      </div>
    </main>
  )
}
