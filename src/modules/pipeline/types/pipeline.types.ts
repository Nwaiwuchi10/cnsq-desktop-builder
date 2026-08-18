export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface PipelineReaction {
  id: string;
  emoji: string;
  author: Author;
  createdAt: string;
}

export interface PipelineCommentReaction {
  id: string;
  emoji: string;
  author: Author;
  createdAt: string;
}

export interface PipelineComment {
  id: string;
  content: string;
  author: Author;
  reactions: PipelineCommentReaction[];
  parentComment?: PipelineComment;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineIdea {
  id: string;
  title: string;
  description: string;
  author: Author;
  department?: Department;
  reactions: PipelineReaction[];
  comments: PipelineComment[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedIdeas {
  data: PipelineIdea[];
  total: number;
  limit: number;
  offset: number;
}
