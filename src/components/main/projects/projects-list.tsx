"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutGrid, LayoutList, PlusCircle } from "lucide-react"
import ProjectCard from "./project-card"
import CreateProjectDialog from "./create-project-dialog"
import type { Project } from "@/types/project"
import { initialProjects } from "@/lib/project-data"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type ViewMode = "list" | "grid"

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid") // Default to grid view

  // Add a state to track which projects are expanded
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  const handleCreateProject = (newProject: Omit<Project, "id">) => {
    // In a real app, you would make an API call to create the project
    const project: Project = {
      id: `project-${Date.now()}`,
      ...newProject,
    }

    setProjects([...projects, project])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((project) => project.id !== projectId))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TooltipProvider>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="list" aria-label="List view">
                  <LayoutList className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </TooltipProvider>

        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center relative">
          <div className="relative w-64 h-64 mb-6">
            {/* Background elements */}
            <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-70 animate-pulse"></div>

            {/* Animated folder */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 transition-all duration-700 hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500"
              >
                <path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
                <path d="M2 13h10" />
                <path d="M5 16l-3 3 3 3" />
              </svg>
            </div>

            {/* Floating elements */}
            <div
              className="absolute w-20 h-20 top-0 right-0 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-green-500"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <div
              className="absolute w-16 h-16 bottom-0 left-0 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-bounce"
              style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-blue-500"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            {/* Task list element */}
            <div
              className="absolute w-14 h-14 bottom-5 right-5 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center animate-bounce"
              style={{ animationDuration: "3.5s", animationDelay: "0.7s" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7 text-yellow-500"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
          </div>

          {/* Animated text - more explicit styling */}
          <div className="relative mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-lg blur-lg opacity-75 animate-pulse"></div>
            <div className="relative px-7 py-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-500 shadow-lg">
              <h3
                className="text-4xl font-extrabold tracking-tight"
                style={{
                  background: "linear-gradient(to right, #8B5CF6, #C4B5FD, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                PROJECTS
              </h3>
              <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 mt-2 rounded-full"></div>
              <div className="flex justify-center mt-3">
                <div
                  className="w-3 h-3 rounded-full bg-purple-600 mx-1 animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-purple-500 mx-1 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-purple-400 mx-1 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>

          <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No projects yet</h4>
          <p className="mb-6 mt-2 text-muted-foreground max-w-md">
            Create your first project to start organizing your tasks and collaborating with your team.
          </p>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Project
          </Button>

          {/* Decorative dots */}
          <div className="absolute bottom-4 left-4 flex space-x-1">
            <div
              className="w-2 h-2 rounded-full bg-purple-300 animate-ping"
              style={{ animationDuration: "1.5s" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-purple-400 animate-ping"
              style={{ animationDuration: "1.5s", animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-purple-500 animate-ping"
              style={{ animationDuration: "1.5s", animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project.id} className="w-full">
                  <ProjectCard
                    project={project}
                    onUpdateProject={handleUpdateProject}
                    onDeleteProject={handleDeleteProject}
                    isExpanded={expandedProjects.has(project.id)}
                    onToggleExpanded={() => toggleProjectExpanded(project.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  isExpanded={expandedProjects.has(project.id)}
                  onToggleExpanded={() => toggleProjectExpanded(project.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}
