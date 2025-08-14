import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Edit, Plus, HelpCircle, Clock, CheckCircle, XCircle, ThumbsUp } from 'lucide-react';
import { usePostContributions, useModerateContribution } from '../hooks/useContributions';
import { Contribution } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAuth } from '../hooks/useApi';

interface ContributionsListProps {
  postId: string;
  onRequestContribution: () => void;
}

export const ContributionsList: React.FC<ContributionsListProps> = ({
  postId,
  onRequestContribution,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { data: user } = useAuth();
  
  const { data: contributions = [], isLoading } = usePostContributions(
    postId,
    filter === 'all' ? undefined : filter
  );
  
  const moderateContributionMutation = useModerateContribution();

  const handleModerate = async (contributionId: string, status: 'approved' | 'rejected', note?: string) => {
    await moderateContributionMutation.mutateAsync({
      contributionId,
      data: {
        status,
        moderatorNote: note,
      },
    });
  };

  const contributionTypeLabels = {
    edit: { label: 'Content Edit', icon: Edit, color: 'blue', points: 10 },
    add_example: { label: 'Add Example', icon: Plus, color: 'green', points: 15 },
    add_question: { label: 'Add Question', icon: HelpCircle, color: 'purple', points: 5 },
  };

  const statusLabels = {
    pending: { label: 'Pending', icon: Clock, color: 'orange' },
    approved: { label: 'Approved', icon: CheckCircle, color: 'green' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'red' },
  };

  // Check if user is moderator (admin or teacher role)
  const isModerator = user?.role === 'admin' || user?.role === 'teacher';

  // Filter approved contributions for highlight section
  const pendingContributions = contributions.filter(c => c.status === 'pending');
  const approvedContributions = contributions.filter(c => c.status === 'approved');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-800">
            Community Contributions ({contributions.length})
          </h3>
        </div>
        <Button onClick={onRequestContribution} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Contribute
        </Button>
      </div>

      {/* Filter Tabs */}
      {(isModerator || contributions.length > 0) && (
        <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All' },
            { key: 'approved', label: 'Approved' },
            ...(isModerator ? [{ key: 'pending', label: 'Pending' }] : []),
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                filter === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Approved Contributions Highlight */}
      {approvedContributions.length > 0 && filter === 'all' && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <ThumbsUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Approved Contributions ({approvedContributions.length})
            </span>
          </div>
          <div className="space-y-2">
            {approvedContributions.slice(0, 3).map((contribution) => {
              const typeInfo = contributionTypeLabels[contribution.type];
              const TypeIcon = typeInfo.icon;
              return (
                <div key={contribution.id} className="text-sm text-green-700">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="w-3 h-3" />
                    <span className="font-medium">{typeInfo.label}</span>
                    <span className="text-green-600">+{typeInfo.points} points</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Contributions List */}
      {contributions.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-neutral-600 mb-2">
            No contributions yet
          </h4>
          <p className="text-neutral-500 mb-4">
            Be the first to contribute and help enrich this post's content!
          </p>
          <Button onClick={onRequestContribution} className="mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create first contribution
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {contributions.map((contribution) => {
            const typeInfo = contributionTypeLabels[contribution.type];
            const statusInfo = statusLabels[contribution.status];
            const TypeIcon = typeInfo.icon;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={contribution.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                      <TypeIcon className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full 
                          ${typeInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                          ${typeInfo.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                          ${typeInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
                        `}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeInfo.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                          ${statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                          ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                          ${statusInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </span>
                        {contribution.status === 'approved' && (
                          <span className="text-xs text-green-600 font-medium">
                            +{typeInfo.points} points
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-neutral-800 mb-2">
                        <strong>Content:</strong> {contribution.content}
                      </div>
                      {contribution.description && (
                        <div className="text-sm text-neutral-600 mb-2">
                          <strong>Description:</strong> {contribution.description}
                        </div>
                      )}
                      <div className="text-xs text-neutral-500">
                        By {contribution.contributor.profile?.displayName || contribution.contributor.email} • 
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  {isModerator && contribution.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerate(contribution.id, 'approved')}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerate(contribution.id, 'rejected')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Moderator Note */}
                {contribution.moderatorNote && (
                  <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="text-xs font-medium text-neutral-700 mb-1">
                      Moderator Review
                    </div>
                    <div className="text-sm text-neutral-600">
                      {contribution.moderatorNote}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};