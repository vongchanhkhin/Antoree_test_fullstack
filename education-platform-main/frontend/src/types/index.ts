// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'student' | 'teacher' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  points: number;
  levelId?: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
  level?: Level;
}

export interface AuthResponse {
  user: User;
  profile?: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
  bio?: string;
}

// Content Types
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  categoryId?: string;
  levelId?: string;
  skills: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
  status: 'draft' | 'published' | 'archived';
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  author: User;
  category?: Category;
  level?: Level;
  tags: Tag[];
  media: Media[];
  _count: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  author: User;
  post: Post;
  replies?: Comment[];
  _count: {
    replies: number;
  };
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: 'upvote' | 'downvote';
  createdAt: string;
}

// Taxonomy Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  parent?: Category;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    postTags: number;
  };
}

export interface Level {
  id: string;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

// Media Types
export interface Media {
  type: 'image' | 'audio' | 'video';
  url: string;
}

// Contribution Types (Growth Hack)
export interface Contribution {
  id: string;
  postId: string;
  contributorId: string;
  type: 'edit' | 'add_example' | 'add_question';
  content: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  moderatorId?: string;
  moderatorNote?: string;
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  contributor: User;
  moderator?: User;
}

export interface CreateContributionRequest {
  type: 'edit' | 'add_example' | 'add_question';
  content: string;
  description?: string;
}

export interface ContributionStats {
  period: 'week' | 'month';
  totalContributions: number;
  topContributors: {
    contributor: User;
    totalContributions: number;
    totalPoints: number;
    contributions: Contribution[];
  }[];
}

// Search Types
export interface SearchRequest {
  query: string;
  type?: 'all' | 'posts' | 'comments' | 'users' | 'tags';
  levelId?: string;
  skills?: string;
  tags?: string;
  sort?: 'hot' | 'new' | 'top';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  query: string;
  results: {
    posts: Post[];
    comments: Comment[];
    users: User[];
    tags: Tag[];
  };
  counts: {
    posts: number;
    comments: number;
    users: number;
    tags: number;
  };
}

// Learning Types
export interface LearningArtifact {
  id: string;
  postId?: string;
  type: 'quiz' | 'flashcard' | 'exercise';
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
  post?: Post;
  questions?: Question[];
  flashcards?: Flashcard[];
}

export interface Question {
  id: string;
  artifactId: string;
  stem: string;
  explanation?: string;
  orderNo: number;
  createdAt: string;
  updatedAt: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  orderNo: number;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  artifactId: string;
  front: string;
  back: string;
  example?: string;
  orderNo: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// Form Types
export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  levelId?: string;
  skills: string[];
  tags: string[];
  media?: Media[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
  status: 'draft' | 'published';
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentId?: string;
}

export interface VoteRequest {
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: 'upvote' | 'downvote';
}

// UI State Types
export interface FilterState {
  search: string;
  levelId?: string;
  skills: string[];
  tags: string[];
  sort: 'hot' | 'new' | 'top';
  page: number;
  limit: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

export interface OnboardingState {
  step: 'level' | 'skills' | 'complete';
  selectedLevel?: string;
  selectedSkills: string[];
  isCompleted: boolean;
}
