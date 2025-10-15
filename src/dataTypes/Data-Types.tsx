// types/task.ts
export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

export interface TaskAssignment {
  id: number;
  staff: Staff;
  role?: string;
}

export interface Project {
  id: number;
  projectName: string;
}
export interface TaskComment {
  id: number;
  task: TaskDTO;
  text: string;
  staff: Staff;
  fileUrl?: string;
  mentionedStaff: Staff;
  createdAt: string;
}
export interface TaskDTO {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  taskModule?: string;
  fileUrl?: string;
  urgency?: string;
  startDate?: string;
  dueDate?: string;
  timeline?: string;
  createdAt: string;
  sprint?: number;
  completed_Date?: string;
  updatedAt?: string;
  project: Project;
  assignedTo: TaskAssignment[];
  comments: TaskComment[];
}
export enum ProjectStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  TESTING = "testing",
  COMPLETED = "completed",
}
export interface ProjectAssignment {
  id: number;
  role: string;
  staff: Staff;
}

export interface Projects {
  id: number;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: string;
  timeLine: string;
  prodUrl?: string;
  stagingUrl?: string;
  assignedTo: ProjectAssignment[];
}
export const PROJECT_STATUSES = [
  "not_started",
  "in_progress",
  "testing",
  "completed",
];
export const PROJECT_PRIORITIES = ["low", "medium", "high", "critical"];
