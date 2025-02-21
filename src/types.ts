interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  starred: boolean;
  assignedTo: string | null; // User or group ID
  groupId: string | null;    // Group ID
}

interface User {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}