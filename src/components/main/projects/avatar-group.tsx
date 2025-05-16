import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/projects/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { User } from "@/types/project";
import type { ProjectMember } from "@/types/roles";
import { getUserRoleInProject } from "@/utils/roleUtils";
import CustomAvatar from "@/components/ui/Avatar";

interface AvatarGroupProps {
  users: User[];
  projectId: number; // Added to identify the project
  projectMembers: ProjectMember[]; // Added to get roles
  max?: number;
}

export function AvatarGroup({ users, projectId, projectMembers, max = 5 }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => {
          const role = getUserRoleInProject(user, projectId, projectMembers); // Get user role
          return (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                {user.avatar ? (
                  // Regular avatar with image
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback>
                      {user.username
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
                    <CustomAvatar name={user.username} size="small" />
                  </div>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.username}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {role || "No role"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}

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
  );
}