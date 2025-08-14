import apiClient from './auth';
import { 
  Tag, 
  SearchRequest,
  SearchResponse,
  PaginatedResponse
} from '../types';

// Taxonomy API
export const taxonomyAPI = {
  // Tags (v1 endpoint)
  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get('/v1/tags');
    return response.data;
  },

  // Tags (legacy endpoint - keeping for compatibility)
  getTagsLegacy: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Tag>> => {
    const response = await apiClient.get('/taxonomy/tags', { params });
    return response.data;
  },

  getPopularTags: async (limit?: number): Promise<Tag[]> => {
    const response = await apiClient.get('/taxonomy/tags/popular', {
      params: { limit }
    });
    return response.data;
  },

  searchTags: async (query: string, limit?: number): Promise<Tag[]> => {
    const response = await apiClient.get('/taxonomy/tags/search', {
      params: { q: query, limit }
    });
    return response.data;
  },

  createTag: async (data: {
    name: string;
    description?: string;
  }): Promise<Tag> => {
    const response = await apiClient.post('/taxonomy/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: {
    name?: string;
    description?: string;
  }): Promise<Tag> => {
    const response = await apiClient.patch(`/taxonomy/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string): Promise<void> => {
    await apiClient.delete(`/taxonomy/tags/${id}`);
  },

  getTagById: async (id: string): Promise<Tag> => {
    const response = await apiClient.get(`/taxonomy/tags/${id}`);
    return response.data;
  },

  getTagBySlug: async (slug: string): Promise<Tag> => {
    const response = await apiClient.get(`/taxonomy/tags/slug/${slug}`);
    return response.data;
  },
};

// Search API
export const searchAPI = {
  // Enhanced v1 search
  search: async (params: {
    q: string;
    tags?: string;
    level?: string;
    type?: 'post' | 'user' | 'tag';
    page?: number;
    limit?: number;
  }): Promise<SearchResponse | PaginatedResponse<any>> => {
    const response = await apiClient.get('/v1/search', { params });
    return response.data;
  },

  // Legacy global search
  searchLegacy: async (params: SearchRequest): Promise<SearchResponse | PaginatedResponse<any>> => {
    const response = await apiClient.get('/search', { params });
    return response.data;
  },

  // Search suggestions
  getSuggestions: async (query: string, limit = 10): Promise<{
    posts: Array<{ id: string; title: string; type: 'post' }>;
    users: Array<{ id: string; profile: { username: string; displayName: string }; type: 'user' }>;
    tags: Array<{ id: string; name: string; slug: string; type: 'tag' }>;
  }> => {
    const response = await apiClient.get('/search/suggestions', {
      params: { q: query, limit }
    });
    return response.data;
  },
};

// Media API
export const mediaAPI = {
  // Create media record
  createMedia: async (data: {
    postId?: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    kind: 'image' | 'video' | 'audio' | 'document';
    alt?: string;
  }) => {
    const response = await apiClient.post('/v1/media', data);
    return response.data;
  },

  // Get media for post
  getMediaForPost: async (postId: string) => {
    const response = await apiClient.get(`/v1/media/post/${postId}`);
    return response.data;
  },

  // Update media
  updateMedia: async (id: string, data: {
    alt?: string;
    filename?: string;
  }) => {
    const response = await apiClient.patch(`/v1/media/${id}`, data);
    return response.data;
  },

  // Delete media
  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/media/${id}`);
  },

  // Sign upload URL (new v1 endpoint)
  signUpload: async (data: {
    mime: string;
    filename: string;
  }): Promise<{
    uploadUrl: string;
    publicUrl: string;
    signature: string;
  }> => {
    const response = await apiClient.post('/v1/media/sign', data);
    return response.data;
  },

  // Complete upload (new v1 endpoint)
  completeUpload: async (data: {
    postId?: string;
    url: string;
    kind: 'image' | 'video' | 'audio' | 'document';
    meta: Record<string, any>;
  }) => {
    const response = await apiClient.post('/v1/media/complete', data);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  // Get all users (admin/teacher only)
  getUsers: async (roleId?: string): Promise<any[]> => {
    const response = await apiClient.get('/users', {
      params: { roleId }
    });
    return response.data;
  },

  // Get teachers
  getTeachers: async (): Promise<any[]> => {
    const response = await apiClient.get('/users/teachers');
    return response.data;
  },

  // Get learners (admin/teacher only)  
  getLearners: async (): Promise<any[]> => {
    const response = await apiClient.get('/users/learners');
    return response.data;
  },

  // Get moderators (admin only)
  getModerators: async (): Promise<any[]> => {
    const response = await apiClient.get('/users/moderators');
    return response.data;
  },

  // Get user profile
  getUserProfile: async (): Promise<any> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Get specific user (admin/teacher only)
  getUser: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Update own profile
  updateProfile: async (data: any): Promise<any> => {
    console.log('Updating profile with data:', data);
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
