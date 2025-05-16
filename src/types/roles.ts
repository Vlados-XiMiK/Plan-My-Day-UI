export interface Role {
  id: number;
  name: 'Admin' | 'Moderator' | 'Member' | 'Viewer';
}

export interface ProjectMember {
  id: number;
  user: number;
  user_name: string;
  user_details: {
    id: number;
    username: string;
    email: string;
    avatar: string
  };
  project: number;
  role: number;
  role_name: Role['name'];
}