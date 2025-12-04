// types/task.ts

import { StaticImageData } from "next/image";

export interface Staff {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl: string | StaticImageData | null;
  address?: {
    city: string;
    state: string;
    country: string;
  };
  employment?: {
    jobTitle: string[];
    department?: {
      name: string;
    };
    departmentalRole?: {
      title: string;
    };
  };
}

// === Departmental Role Interface ===
export interface DepartmentalRole {
  id: number;
  title: string;
  department: {
    name: string;
  };
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

export interface Member {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
  };
}

export interface LastMessage {
  text: string;
  createdAt: string; // Backend now provides this field
}

export interface ConversationResponse {
  id: string;
  members: Member[];
  lastMessage?: LastMessage;
  unreadCount: number;
}
export interface StaffResponse {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

export interface DMResponse {
  currentUserId: number;
  conversations: ConversationResponse[];
  staffMatches: StaffResponse[];
}
export interface Attachment {
  id: string;
  url: string;
  filename?: string;
  mimeType?: string;
}

export interface Reaction {
  id: string;
  emoji: string;
}

export interface Msg {
  id: string;

  name: string;
  avatar?: string;
  text: string; // REQUIRED
  me: boolean; // REQUIRED
  preview: string;
  createdAt: string;
  time: string;

  unread?: number;
  online?: boolean;
  attachments?: Attachment[];
  reactions?: Reaction[];
  parent?: Partial<Msg>;
}
export interface Message {
  id: string;

  name: string;
  avatar?: string;
  text: string; // REQUIRED
  me: boolean; // REQUIRED
  preview: string;
  createdAt: string;
  time: string;

  unread?: number;
  online?: boolean;
  attachments?: Attachment[];
  reactions?: Reaction[];
  parent?: Partial<Msg>;
}
export enum MemberRole {
  MEMBER = "member",
  ADMIN = "admin",
  OWNER = "owner",
}

export enum ConversationType {
  CHANNEL = "channel",
  PRIVATE = "private",
  DM = "dm",
  GROUP_DM = "group_dm",
}

export interface ConversationMember {
  id: string;
  conversation: Conversation | string; // for API you might get only id
  user: Staff;
  role: MemberRole;
  notificationsEnabled: boolean;
  unreadCount: number;
  joinedAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  slug?: string;
  isArchived: boolean;
  members: ConversationMember[];
  messages?: Message[];
  createdBy: Staff;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  lastMessage?: Message;
}
