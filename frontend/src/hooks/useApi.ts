import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/auth';
import { postsAPI, commentsAPI, votesAPI } from '../services/content';
import { taxonomyAPI, searchAPI, usersAPI, mediaAPI } from '../services/api';
import { 
  CreatePostRequest,
  CreateCommentRequest,
  VoteRequest
} from '../types';
import toast from 'react-hot-toast';

// Auth hooks
export const useAuth = () => {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authAPI.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authAPI.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['auth', 'profile'], data.user);
      toast.success('Welcome back!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('refreshToken');
      return refreshToken ? authAPI.logout(refreshToken) : Promise.resolve();
    },
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { levelId?: string; displayName?: string; bio?: string; avatarUrl?: string }) =>
      usersAPI.updateProfile(data),
    onSuccess: (data) => {
      console.log('useUpdateProfile - onSuccess - data received:', data);
      queryClient.setQueryData(['auth', 'profile'], data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
      console.log('useUpdateProfile - cache updated and queries invalidated');
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

// Posts hooks
export const usePosts = (params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  level?: string;
  skills?: string;
  sort?: 'hot' | 'new' | 'top';
} = {}) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => postsAPI.getPosts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useFeed = (params: {
  page?: number;
  limit?: number;
  level?: string;
  skills?: string;
} = {}) => {
  return useQuery({
    queryKey: ['feed', params],
    queryFn: () => postsAPI.getFeed(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => postsAPI.getPost(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsAPI.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePostRequest> }) =>
      postsAPI.updatePost(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.setQueryData(['posts', data.id], data);
      toast.success('Post updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update post');
    },
  });
};

export const usePublishPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => postsAPI.publishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post published successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    },
  });
};

export const useVoteOnPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: 1 | -1 }) => 
      postsAPI.voteOnPost(id, value),
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: ['posts', id] });
      
      const previousData = queryClient.getQueryData(['posts', id]);
      
      queryClient.setQueryData(['posts', id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          upvotes: old.upvotes + (value === 1 ? 1 : 0),
          downvotes: old.downvotes + (value === -1 ? 1 : 0),
        };
      });
      
      return { previousData };
    },
    onError: (error: any, variables, context) => {
      if (context) {
        queryClient.setQueryData(['posts', variables.id], context.previousData);
      }
      toast.error(error.response?.data?.message || 'Failed to vote');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useReportPost = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      postsAPI.reportPost(id, reason),
    onSuccess: () => {
      toast.success('Post reported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to report post');
    },
  });
};

export const usePostComments = (postId: string, params: {
  page?: number;
  limit?: number;
} = {}) => {
  return useQuery({
    queryKey: ['post-comments', postId, params],
    queryFn: () => postsAPI.getPostComments(postId, params),
    enabled: !!postId,
  });
};

export const useCreatePostComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: { content: string; parentId?: string } }) =>
      postsAPI.createPostComment(postId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      toast.success('Comment added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });
};

// Comments hooks
export const useComments = (postId: string, params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) => {
  return useQuery({
    queryKey: ['comments', postId, params],
    queryFn: () => commentsAPI.getComments(postId, params),
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsAPI.createComment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['post-comments', data.postId] });
      toast.success('Comment added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });
};

export const useVoteOnComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: 1 | -1 }) => 
      commentsAPI.voteOnComment(id, value),
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: ['comments'] });
      
      // Optimistically update comment vote counts
      queryClient.setQueriesData({ queryKey: ['comments'] }, (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((comment: any) =>
            comment.id === id
              ? {
                  ...comment,
                  upvotes: comment.upvotes + (value === 1 ? 1 : 0),
                  downvotes: comment.downvotes + (value === -1 ? 1 : 0),
                }
              : comment
          ),
        };
      });
      
      return { commentId: id };
    },
    onError: (error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.error('Failed to vote on comment');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
    },
  });
};

export const useReportComment = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      commentsAPI.reportComment(id, reason),
    onSuccess: () => {
      toast.success('Comment reported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to report comment');
    },
  });
};

// Votes hooks
export const useVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: VoteRequest) => votesAPI.vote(data),
    onMutate: async (data) => {
      // Optimistic update
      const queryKey = data.targetType === 'post' 
        ? ['posts', data.targetId] 
        : ['comments', data.targetId];
      
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        
        const isUpvote = data.voteType === 'upvote';
        return {
          ...old,
          upvotes: old.upvotes + (isUpvote ? 1 : 0),
          downvotes: old.downvotes + (isUpvote ? 0 : 1),
        };
      });
      
      return { previousData, queryKey };
    },
    onError: (error, data, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error('Failed to vote');
    },
    onSettled: (data, error, variables) => {
      // Refresh data
      queryClient.invalidateQueries({ 
        queryKey: [variables.targetType === 'post' ? 'posts' : 'comments'] 
      });
    },
  });
};

// Taxonomy hooks
// Taxonomy hooks - Updated to match available APIs
export const useLevels = () => {
  // Since levels API doesn't exist, return mock data for UI that matches database
  const now = new Date().toISOString();
  const mockLevels = [
    { id: 'A1', name: 'Beginner (A1)', description: 'Just starting your English journey', order: 1, createdAt: now, updatedAt: now },
    { id: 'A2', name: 'Elementary (A2)', description: 'Basic English skills', order: 2, createdAt: now, updatedAt: now },
    { id: 'B1', name: 'Pre-Intermediate (B1)', description: 'Building confidence in English', order: 3, createdAt: now, updatedAt: now },
    { id: 'B2', name: 'Intermediate (B2)', description: 'Comfortable with everyday English', order: 4, createdAt: now, updatedAt: now },
    { id: 'C1', name: 'Upper-Intermediate (C1)', description: 'Advanced English skills', order: 5, createdAt: now, updatedAt: now },
    { id: 'C2', name: 'Advanced (C2)', description: 'Near-native proficiency', order: 6, createdAt: now, updatedAt: now },
  ];
  
  return useQuery({
    queryKey: ['levels'],
    queryFn: () => Promise.resolve(mockLevels),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSkills = () => {
  // Since skills API doesn't exist, return mock data for UI that matches database
  const now = new Date().toISOString();
  const mockSkills = [
    { id: 'reading', name: 'Reading', description: 'Text comprehension and reading skills', createdAt: now, updatedAt: now },
    { id: 'writing', name: 'Writing', description: 'Written communication skills', createdAt: now, updatedAt: now },
    { id: 'listening', name: 'Listening', description: 'Audio comprehension skills', createdAt: now, updatedAt: now },
    { id: 'speaking', name: 'Speaking', description: 'Oral communication skills', createdAt: now, updatedAt: now },
    { id: 'grammar', name: 'Grammar', description: 'English grammar rules and structures', createdAt: now, updatedAt: now },
    { id: 'vocab', name: 'Vocabulary', description: 'Building word knowledge and vocabulary', createdAt: now, updatedAt: now },
  ];
  
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => Promise.resolve(mockSkills),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: taxonomyAPI.getTags,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategories = () => {
  // Since categories API doesn't exist, return empty data
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => Promise.resolve([]),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Search hooks
export const useSearch = (params: {
  query: string;
  type?: 'all' | 'posts' | 'comments' | 'users' | 'tags';
  levelId?: string;
  skills?: string;
  tags?: string;
  sort?: 'hot' | 'new' | 'top';
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => {
      // Transform params to match the v1 API
      let apiType: 'post' | 'user' | 'tag' | undefined;
      if (params.type === 'posts') apiType = 'post';
      else if (params.type === 'users') apiType = 'user';
      else if (params.type === 'tags') apiType = 'tag';
      else apiType = undefined;

      const v1Params = {
        q: params.query,
        level: params.levelId,
        tags: params.tags,
        type: apiType,
        page: params.page,
        limit: params.limit,
      };
      return searchAPI.search(v1Params);
    },
    enabled: !!params.query && params.query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['search', 'suggestions', query],
    queryFn: () => searchAPI.getSuggestions(query),
    enabled: !!query && query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Media hooks
export const useSignMediaUpload = () => {
  return useMutation({
    mutationFn: (data: { mime: string; filename: string }) => 
      mediaAPI.signUpload(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sign upload');
    },
  });
};

export const useCompleteMediaUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      postId?: string;
      url: string;
      kind: 'image' | 'video' | 'audio' | 'document';
      meta: Record<string, any>;
    }) => mediaAPI.completeUpload(data),
    onSuccess: (data, variables) => {
      if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
        queryClient.invalidateQueries({ queryKey: ['media', 'post', variables.postId] });
      }
      toast.success('Media uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete upload');
    },
  });
};

export const useMediaForPost = (postId: string) => {
  return useQuery({
    queryKey: ['media', 'post', postId],
    queryFn: () => mediaAPI.getMediaForPost(postId),
    enabled: !!postId,
  });
};
