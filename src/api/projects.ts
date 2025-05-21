import axiosClient from './axiosClient';
import type { PaginatedProjects, Project, PaginatedTasks, Task, PaginatedProjectShareLinks, ProjectShareLink, User } from '@/types/project';
import type { ProjectMember, Role } from '@/types/roles';

// Get list of projects
export const getProjects = async (page: number = 1): Promise<PaginatedProjects> => {
  const response = await axiosClient.get(`/projects/?page=${page}`);
  return response.data;
};

// Create a new project
export const createProject = async (data: { name: string; description: string }): Promise<Project> => {
  const response = await axiosClient.post('/projects/', data);
  return response.data;
};

// Join a project via share link
export const joinProject = async (token: string): Promise<Project> => {
  const response = await axiosClient.post(`/projects/join/${token}/`);
  return response.data;
};

// Get project memberships
export const getProjectMemberships = async (page: number = 1): Promise<{ count: number; next: string | null; previous: string | null; results: ProjectMember[] }> => {
  const response = await axiosClient.get(`/projects/project-memberships/?page=${page}`);
  return response.data;
};

// Get project membership by ID
export const getProjectMembershipById = async (id: number): Promise<ProjectMember> => {
  const response = await axiosClient.get(`/projects/project-memberships/${id}/`);
  return response.data;
};

// Get project roles
export const getProjectRoles = async (): Promise<{ count: number; next: string | null; previous: string | null; results: Role[] }> => {
  const response = await axiosClient.get('/projects/roles/');
  return response.data;
};

// Get project role by ID
export const getProjectRoleById = async (id: number): Promise<Role> => {
  const response = await axiosClient.get(`/projects/roles/${id}/`);
  return response.data;
};

// Get project by ID
export const getProjectById = async (id: number): Promise<Project> => {
  const response = await axiosClient.get(`/projects/${id}/`);
  return response.data;
};

// Update project
export const updateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
  const response = await axiosClient.put(`/projects/${id}/`, data);
  return response.data;
};

// Partially update project
export const partialUpdateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
  const response = await axiosClient.patch(`/projects/${id}/`, data);
  return response.data;
};

// Delete project
export const deleteProject = async (id: number): Promise<void> => {
  await axiosClient.delete(`/projects/${id}/`);
};

// Assign role to a user in a project
export const assignRole = async (projectId: number, data: { user: number; role: number }): Promise<ProjectMember> => {
  console.log(`Sending assign role request: projectId=${projectId}, data=`, {
    user_id: data.user,
    role_id: data.role,
  });
  const response = await axiosClient.post(`/projects/${projectId}/assign_role/`, {
    user_id: data.user,
    role_id: data.role,
  });
  return response.data;
};

// Kick a user from a project
export const kickUser = async (projectId: number, data: { user: number }): Promise<void> => {
  const response = await axiosClient.post(`/projects/${projectId}/kick/`, {
    user_id: data.user,
  });
  return response.data;
};

// Leave a project
export const leaveProject = async (projectId: number): Promise<void> => {
  await axiosClient.post(`/projects/${projectId}/leave/`);
};

// Get share links for a project
export const getProjectShareLinks = async (projectId: number, page: number = 1): Promise<PaginatedProjectShareLinks> => {
  const response = await axiosClient.get(`/projects/${projectId}/share_links/?page=${page}`);
  return response.data;
};

// Create a share link for a project
export const createProjectShareLink = async (projectId: number, data: { role: number; max_uses: number; expires_at: string }): Promise<ProjectShareLink> => {
  const response = await axiosClient.post(`/projects/${projectId}/share_links/`, data);
  return response.data;
};

// Get share link by ID
export const getProjectShareLinkById = async (projectId: number, id: number): Promise<ProjectShareLink> => {
  const response = await axiosClient.get(`/projects/${projectId}/share_links/${id}/`);
  return response.data;
};

// Update share link
export const updateProjectShareLink = async (projectId: number, id: number, data: Partial<ProjectShareLink>): Promise<ProjectShareLink> => {
  const response = await axiosClient.put(`/projects/${projectId}/share_links/${id}/`, data);
  return response.data;
};

// Partially update share link
export const partialUpdateProjectShareLink = async (projectId: number, id: number, data: Partial<ProjectShareLink>): Promise<ProjectShareLink> => {
  const response = await axiosClient.patch(`/projects/${projectId}/share_links/${id}/`, data);
  return response.data;
};

// Delete share link
export const deleteProjectShareLink = async (projectId: number, id: number): Promise<void> => {
  await axiosClient.delete(`/projects/${projectId}/share_links/${id}/`);
};

// Get tasks for a project
export const getProjectTasks = async (projectId: number, page: number = 1): Promise<PaginatedTasks> => {
  const response = await axiosClient.get(`/projects/${projectId}/tasks/?page=${page}`);
  return response.data;
};

// Get favorite tasks for a project
export const getFavoriteTasks = async (projectId: number): Promise<PaginatedTasks> => {
  const response = await axiosClient.get(`/projects/${projectId}/tasks/favorites/`);
  return response.data;
};

// Get tasks due today for a project
export const getTodayTasks = async (projectId: number): Promise<PaginatedTasks> => {
  const response = await axiosClient.get(`/projects/${projectId}/tasks/today/`);
  return response.data;
};

// Create a task
export const createTask = async (projectId: number, data: Partial<Task>): Promise<Task> => {
  const response = await axiosClient.post(`/projects/${projectId}/tasks/`, data);
  return response.data;
};

// Get task by ID
export const getTaskById = async (projectId: number, id: string): Promise<Task> => {
  const response = await axiosClient.get(`/projects/${projectId}/tasks/${id}/`);
  return response.data;
};

// Update task
export const updateTask = async (projectId: number, id: string, data: Partial<Task>): Promise<Task> => {
  const response = await axiosClient.put(`/projects/${projectId}/tasks/${id}/`, data);
  return response.data;
};

// Partially update task
export const partialUpdateTask = async (projectId: number, id: string, data: Partial<Task>): Promise<Task> => {
  const response = await axiosClient.patch(`/projects/${projectId}/tasks/${id}/`, data);
  return response.data;
};

// Delete task
export const deleteTask = async (projectId: number, id: string): Promise<void> => {
  await axiosClient.delete(`/projects/${projectId}/tasks/${id}/`);
};

// Move task
export const moveTask = async (projectId: number, id: string, data: { position: number }): Promise<Task> => {
  const response = await axiosClient.post(`/projects/${projectId}/tasks/${id}/move_task/`, data);
  return response.data;
};

// Toggle task completion
export const toggleTaskCompleted = async (projectId: number, id: string): Promise<Task> => {
  const response = await axiosClient.post(`/projects/${projectId}/tasks/${id}/toggle_completed/`);
  return response.data;
};

// Toggle task favorite
export const toggleTaskFavorite = async (projectId: number, id: string): Promise<Task> => {
  const response = await axiosClient.post(`/projects/${projectId}/tasks/${id}/toggle_favorite/`);
  return response.data;
};

// Get current user profile
export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosClient.get('/account/profile/');
  return {
    id: response.data.id,
    username: response.data.username,
    email: response.data.email,
    avatar: '',
  };
};