import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contributionsAPI } from '../services/content';
import { CreateContributionRequest } from '../types';
import { toast } from 'react-hot-toast';

// Hook to create contribution
export const useCreateContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CreateContributionRequest }) =>
      contributionsAPI.createContribution(postId, data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['contributions', postId] });
      toast.success('Đóng góp của bạn đã được gửi và đang chờ duyệt!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Không thể gửi đóng góp. Vui lòng thử lại.';
      toast.error(message);
    },
  });
};

// Hook to get contributions for a post
export const usePostContributions = (postId: string, status?: 'pending' | 'approved' | 'rejected') => {
  return useQuery({
    queryKey: ['contributions', postId, status],
    queryFn: () => contributionsAPI.getPostContributions(postId, status),
    enabled: !!postId,
  });
};

// Hook to moderate contribution
export const useModerateContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      contributionId, 
      data 
    }: { 
      contributionId: string; 
      data: { status: 'pending' | 'approved' | 'rejected'; moderatorNote?: string } 
    }) =>
      contributionsAPI.moderateContribution(contributionId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['contribution-stats'] });
      
      if (result.status === 'approved') {
        toast.success('Đóng góp đã được duyệt và người đóng góp đã nhận điểm thưởng!');
      } else if (result.status === 'rejected') {
        toast.success('Đóng góp đã bị từ chối.');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Không thể duyệt đóng góp. Vui lòng thử lại.';
      toast.error(message);
    },
  });
};

// Hook to get contribution stats for leaderboard
export const useContributionStats = (period: 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['contribution-stats', period],
    queryFn: () => contributionsAPI.getContributionStats(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
