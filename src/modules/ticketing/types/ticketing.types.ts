export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export interface TicketActivity {
  id: string;
  content: string;
  isSystemActivity: boolean;
  attachments?: string[];
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketRef: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  attachments?: string[];
  department: {
    id: number;
    name: string;
  };
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedHod?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  linkedProject?: {
    id: number;
    title?: string;
    projectName?: string;
  } | null;
  linkedTask?: {
    id: number;
    title: string;
    status: string;
  } | null;
  activities?: TicketActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
}
