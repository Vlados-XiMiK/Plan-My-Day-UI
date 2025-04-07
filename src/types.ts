export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  starred: boolean;
}

export interface User {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
}

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