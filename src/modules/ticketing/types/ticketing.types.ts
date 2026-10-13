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

export enum AssignmentStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export interface TicketAssignment {
  id: string;
  ticketId: string;
  staffId: number;
  staff?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    employment?: {
      jobTitle?: string[];
      department?: {
        name: string;
      };
    };
  };
  assignedById?: number;
  assignedBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
  };
  status: AssignmentStatus;
  notes?: string;
  staffNotes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
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
  resolutionDate?: string;
  link?: string;
  assignments?: TicketAssignment[];
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
