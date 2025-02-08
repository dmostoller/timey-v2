export interface Task {
  id: string;
  name: string;
  projectId?: string;
  clientId?: string;
  userId: string;
  isRunning: boolean;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  date: string;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Project {
  id: string;
  name: string;
  hourlyRate: number;
  userId: string;
}

export interface Client {
  id: string;
  name: string;
  userId: string;
}
