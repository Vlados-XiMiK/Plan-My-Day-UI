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

// src/types.ts

export interface Feature {
  title: string;
  subtitle?: string;
  description: string;
  details: string;
  color?: string;
}

export interface Features {
  title: string;
  [key: string]: Feature | string;
}

export interface FeaturesPage {
  subtitle: string;
  [key: string]: Feature | string;
}

export interface Translation {
  features: Features;
  featuresPage: FeaturesPage;
}