import type { ProjectMember, Role } from '@/types/roles';
import type { User, Project } from '@/types/project';

// Get the role of a user in a specific project
export const getUserRoleInProject = (
  user: User,
  projectId: number,
  members: ProjectMember[],
): Role['name'] | null => {
  const member = members.find(
    (m) => m.user === user.id && m.project === projectId,
  );
  return member ? member.role_name : null;
};

// Check if a user has permission for a specific action based on their role
export const hasPermission = (
  role: Role['name'] | null,
  action: 'delete_project' | 'edit_project' | 'edit_task' | 'view_only',
): boolean => {
  if (!role) return false;

  switch (role) {
    case 'Admin':
      return true; // Full access, including delete
    case 'Moderator':
      return ['edit_project', 'edit_task', 'view_only'].includes(action); // Everything except delete
    case 'Member':
      return ['edit_task', 'view_only'].includes(action); // Can edit tasks and view
    case 'Viewer':
      return action === 'view_only'; // Only view
    default:
      return false;
  }
};

// Check if a user is the owner of a project
export const isProjectOwner = (user: User, project: Project): boolean => {
  return user.id === project.owner;
};