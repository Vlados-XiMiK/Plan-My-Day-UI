import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/projects/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { User } from "@/types/project"
import CustomAvatar from "@/components/ui/Avatar"

interface AvatarGroupProps {
  users: User[]
  max?: number
}

export function AvatarGroup({ users, max = 5 }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max)
  const remainingCount = users.length - max

  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              {user.avatar ? (
                // Regular avatar with image
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                // Custom avatar with initials
                <div className="border-2 border-background rounded-full">
                  <CustomAvatar name={user.name} size="small" />
                </div>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="flex h-8 w-8 items-center justify-center border-2 border-background bg-muted">
                <span className="text-xs font-medium">+{remainingCount}</span>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more team members</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
