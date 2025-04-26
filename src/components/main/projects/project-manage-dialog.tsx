"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Project, User } from "@/types/project"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/projects/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, UserPlus } from "lucide-react"
import { format } from "date-fns"
import { motion, MotionProps } from "framer-motion"
import CustomAvatar from "@/components/ui/Avatar"
import { useNotification } from "@/contexts/notification-context"
import { HTMLAttributes } from 'react'

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface ProjectManageDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateProject: (project: Project) => void
  currentUser?: User
  canEdit: boolean
  isCreator: boolean
}

const roleLabels = {
  full_access: "Full access",
  read_only: "Read only",
  complete_only: "Complete tasks only",
}

export default function ProjectManageDialog({
  project,
  open,
  onOpenChange,
  onUpdateProject,
  canEdit,
  isCreator,
}: ProjectManageDialogProps) {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [members, setMembers] = useState<User[]>(project.members)
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, string>>({})
  const [hasRoleChanges, setHasRoleChanges] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [activeTab, setActiveTab] = useState<string>("details")
  const { addNotification } = useNotification()

  const handleUpdateMemberRole = (userId: string, role: string) => {
    setPendingRoleChanges((prev) => {
      const newChanges = { ...prev, [userId]: role }
      setHasRoleChanges(true)
      return newChanges
    })
    const member = members.find((m) => m.id === userId)
    if (member) {
      addNotification("info", "Role Change Pending", `Role for ${member.name} set to ${roleLabels[role as keyof typeof roleLabels]}`, 3000)
    }
  }

  const saveRoleChanges = () => {
    try {
      const updatedMembers = members.map((member) => {
        if (pendingRoleChanges[member.id]) {
          return {
            ...member,
            role: pendingRoleChanges[member.id] as "full_access" | "read_only" | "complete_only",
          }
        }
        return member
      })

      setMembers(updatedMembers)
      setPendingRoleChanges({})
      setHasRoleChanges(false)
      addNotification("success", "Roles Updated", "Team member roles have been updated", 3000)
    } catch {
      addNotification("error", "Update Failed", "Failed to update member roles. Please try again.", 5000)
    }
  }

  const cancelRoleChanges = () => {
    setPendingRoleChanges({})
    setHasRoleChanges(false)
    addNotification("info", "Changes Cancelled", "Pending role changes have been cancelled", 3000)
  }

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault()

    // Only allow updates if user has permission
    if (!canEdit && !isCreator) {
      addNotification("error", "Permission Denied", "You do not have permission to update this project", 5000)
      onOpenChange(false)
      return
    }

    // Validate title
    if (!title.trim()) {
      addNotification("error", "Invalid Input", "Project title is required", 5000)
      return
    }

    try {
      // Apply any pending role changes before saving
      if (hasRoleChanges) {
        saveRoleChanges()
      }

      onUpdateProject({
        ...project,
        title,
        description,
        members,
      })

      addNotification("success", "Project Updated", `Project "${title}" has been updated`, 3000)
      onOpenChange(false)
    } catch {
      addNotification("error", "Update Failed", "Failed to update project. Please try again.", 5000)
    }
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberEmail.trim() || (!canEdit && !isCreator)) {
      if (!newMemberEmail.trim()) {
        addNotification("error", "Invalid Input", "Email address is required", 5000)
      } else {
        addNotification("error", "Permission Denied", "You do not have permission to add members", 5000)
      }
      return
    }

    try {
      // In a real app, you would send an invitation and add the user after they accept
      // This is just a mock implementation
      const newMember: User = {
        id: `user-${Date.now()}`,
        name: newMemberEmail.split("@")[0], // Just for demo
        email: newMemberEmail,
        avatar: "", // No avatar for new members
        role: "read_only", // Default to read_only
      }

      setMembers([...members, newMember])
      setNewMemberEmail("")
      addNotification("success", "Member Added", `${newMember.name} has been added to the project`, 3000)
    } catch {
      addNotification("error", "Addition Failed", "Failed to add member. Please try again.", 5000)
    }
  }

  const handleRemoveMember = (userId: string) => {
    if (!canEdit && !isCreator) {
      addNotification("error", "Permission Denied", "You do not have permission to remove members", 5000)
      return
    }

    try {
      const member = members.find((m) => m.id === userId)
      setMembers(members.filter((member) => member.id !== userId))
      if (member) {
        addNotification("success", "Member Removed", `${member.name} has been removed from the project`, 3000)
      }
    } catch {
      addNotification("error", "Removal Failed", "Failed to remove member. Please try again.", 5000)
    }
  }

  const createdDate = new Date(project.createdAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Project</DialogTitle>
          <DialogDescription>
            {canEdit || isCreator
              ? "Update project details or manage team members."
              : "View project details and team members."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleUpdateProject} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Project title</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!canEdit && !isCreator}
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={!canEdit && !isCreator}
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                Created on {format(createdDate, "MMMM d, yyyy 'at' h:mm a")}
              </div>

              {(canEdit || isCreator) && (
                <DialogFooter>
                  <Button
                    type="submit"
                    className="transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              )}
            </form>
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto pr-2">
              <div className="space-y-4">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-all duration-200 gap-2"
                    {...({} as MotionDivProps)}
                  >
                    <div className="flex items-center space-x-3">
                      {member.avatar ? (
                        // Regular avatar with image
                        <Avatar className="border-2 border-background shadow-sm">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        // Custom avatar with initials
                        <div className="border-2 border-background rounded-full shadow-sm">
                          <CustomAvatar name={member.name} size="small" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                          {member.id === project.createdBy.id ? " (Creator)" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      {(canEdit || isCreator) && member.id !== project.createdBy.id ? (
                        <>
                          <Select
                            value={pendingRoleChanges[member.id] || member.role}
                            onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                          >
                            <SelectTrigger
                              className={`h-8 min-w-[160px] ${
                                pendingRoleChanges[member.id]
                                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                  : ""
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full_access">Full access</SelectItem>
                              <SelectItem value="read_only">Read only</SelectItem>
                              <SelectItem value="complete_only">Complete tasks only</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id)}
                            className="h-8 w-8 text-destructive transition-all duration-200 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove member</span>
                          </Button>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-md">
                          {roleLabels[member.role as keyof typeof roleLabels] || member.role}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {(canEdit || isCreator) && (
                <form onSubmit={handleAddMember} className="mt-6 space-y-4">
                  <div className="text-sm font-medium">Add team member</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Email address"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      type="email"
                      className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <Button
                      type="submit"
                      className="transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </form>
              )}
              {(canEdit || isCreator) && hasRoleChanges && (
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelRoleChanges}
                    className="transition-all duration-200 hover:bg-destructive/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={saveRoleChanges}
                    className="transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700"
                  >
                    Save role changes
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}