import apiClient from './auth';
import { 
  Post, 
  Comment, 
  PaginatedResponse, 
  CreatePostRequest, 
  UpdatePostRequest, 
  CreateCommentRequest,
  VoteRequest,
  Vote,
  Contribution,
  CreateContributionRequest,
  ContributionStats
} from '../types';

// Posts API
export const postsAPI = {
  // Get posts with filters
  getPosts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    tag?: string;
    level?: string;
    skills?: string;
    sort?: 'hot' | 'new' | 'top';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get('/v1/posts', { params });
    return response.data;
  },

  // Get feed (personalized posts)
  getFeed: async (params: {
    page?: number;
    limit?: number;
    level?: string;
    skills?: string;
  }): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get('/v1/feed', { params });
    return response.data;
  },

  // Get single post
  getPost: async (id: string): Promise<Post> => {
    const response = await apiClient.get(`/v1/posts/${id}`);
    return response.data;
  },

  // Create post
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const response = await apiClient.post('/v1/posts', data);
    return response.data;
  },

  // Update post
  updatePost: async (id: string, data: UpdatePostRequest): Promise<Post> => {
    const response = await apiClient.patch(`/v1/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/posts/${id}`);
  },

  // Publish post
  publishPost: async (id: string): Promise<Post> => {
    const response = await apiClient.post(`/v1/posts/${id}/publish`);
    return response.data;
  },

  // Vote on post (new direct endpoint)
  voteOnPost: async (id: string, value: 1 | -1): Promise<Vote> => {
    const response = await apiClient.post(`/v1/posts/${id}/votes`, { value });
    return response.data;
  },

  // Report post (new direct endpoint)
  reportPost: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/v1/posts/${id}/report`, { reason });
  },

  // Get comments for post (new direct endpoint)
  getPostComments: async (id: string, params: {
    page?: number;
    limit?: number;
  }): Promise<{ comments: Comment[]; pagination: any }> => {
    const response = await apiClient.get(`/v1/posts/${id}/comments`, { params });
    return response.data;
  },

  // Create comment on post (new direct endpoint)
  createPostComment: async (id: string, data: {
    content: string;
    parentId?: string;
  }): Promise<Comment> => {
    const response = await apiClient.post(`/v1/posts/${id}/comments`, data);
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  // Get comments for post (legacy endpoint - keeping for compatibility)
  getComments: async (postId: string, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Comment>> => {
    const response = await apiClient.get(`/comments/post/${postId}`, { 
      params
    });
    return response.data;
  },

  // Create comment (legacy endpoint - keeping for compatibility)
  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post('/comments', data);
    return response.data;
  },

  // Update comment
  updateComment: async (id: string, content: string): Promise<Comment> => {
    const response = await apiClient.patch(`/comments/${id}`, { content });
    return response.data;
  },

  // Delete comment
  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },

  // Vote on comment (new direct endpoint)
  voteOnComment: async (id: string, value: 1 | -1): Promise<Vote> => {
    const response = await apiClient.post(`/v1/comments/${id}/votes`, { value });
    return response.data;
  },

  // Report comment (new direct endpoint)
  reportComment: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/v1/comments/${id}/report`, { reason });
  },
};

// Votes API
export const votesAPI = {
  // Vote on post or comment (legacy endpoint - keeping for compatibility)
  vote: async (data: VoteRequest): Promise<Vote> => {
    const response = await apiClient.post('/votes', data);
    return response.data;
  },

  // Remove vote (legacy endpoint)
  removeVote: async (targetId: string, targetType: 'post' | 'comment'): Promise<void> => {
    await apiClient.delete(`/votes/${targetType}/${targetId}`);
  },

  // Get vote counts (legacy endpoint)
  getVoteCounts: async (targetId: string, targetType: 'post' | 'comment'): Promise<{
    upvotes: number;
    downvotes: number;
    userVote?: 'upvote' | 'downvote';
  }> => {
    const response = await apiClient.get(`/votes/${targetType}/${targetId}/counts`);
    return response.data;
  },

  // Get user votes (legacy endpoint)
  getUserVotes: async (params: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Vote>> => {
    const response = await apiClient.get('/votes/user', { params });
    return response.data;
  },
};

// Contributions API (Growth Hack)
export const contributionsAPI = {
  // Create contribution
  createContribution: async (postId: string, data: CreateContributionRequest): Promise<Contribution> => {
    const response = await apiClient.post(`/v1/posts/${postId}/contributions`, data);
    return response.data;
  },

  // Get contributions for a post
  getPostContributions: async (postId: string, status?: 'pending' | 'approved' | 'rejected'): Promise<Contribution[]> => {
    const response = await apiClient.get(`/v1/posts/${postId}/contributions`, {
      params: { status },
    });
    return response.data;
  },

  // Moderate contribution (approve/reject)
  moderateContribution: async (contributionId: string, data: {
    status: 'pending' | 'approved' | 'rejected';
    moderatorNote?: string;
  }): Promise<Contribution> => {
    const response = await apiClient.patch(`/v1/posts/contributions/${contributionId}/moderate`, data);
    return response.data;
  },

  // Get contribution stats for leaderboard
  getContributionStats: async (period: 'week' | 'month' = 'week'): Promise<ContributionStats> => {
    const response = await apiClient.get('/v1/posts/contributors/stats', {
      params: { period },
    });
    return response.data;
  },
};
