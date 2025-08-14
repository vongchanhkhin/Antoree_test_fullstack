import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal, 
  ArrowLeft,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Edit,
  Trash2,
  Music
} from 'lucide-react';
import { 
  usePost, 
  usePostComments, 
  useVoteOnPost, 
  useReportPost,
  useCreatePostComment,
  useVoteOnComment,
  useReportComment,
  useAuth
} from '../hooks/useApi';
import { Comment } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ContributionModal } from '../components/ContributionModal';
import { ContributionsList } from '../components/ContributionsList';
import toast from 'react-hot-toast';
import { c } from 'framer-motion/dist/types.d-Cjd591yU';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);

  // API hooks
  const { data: post, isLoading: postLoading, error: postError } = usePost(id!);
  const { data: comments, isLoading: commentsLoading } = usePostComments(id!, { page: 1, limit: 50 });
  console.log("comments full object", comments);
  console.log("comments.comments", comments?.comments);
  const { data: user } = useAuth();
  const voteOnPost = useVoteOnPost();
  const reportPost = useReportPost();
  const createComment = useCreatePostComment();
  const voteOnComment = useVoteOnComment();
  const reportComment = useReportComment();

  if (postLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
              <div className="h-4 bg-neutral-200 rounded w-4/6"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">Error loading post</div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const handleVote = (value: 1 | -1) => {
    voteOnPost.mutate({ id: post.id, value });
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }
    
    reportPost.mutate(
      { id: post.id, reason: reportReason },
      {
        onSuccess: () => {
          setShowReportDialog(false);
          setReportReason('');
        }
      }
    );
  };

  const handleSubmitComment = () => {
    if (!commentContent.trim()) return;

    createComment.mutate(
        {
          postId: post.id,
          data: {
            content: commentContent,
            parentId: replyingTo || undefined
          }
        },
      {
        onSuccess: () => {
          setCommentContent('');
          setReplyingTo(null);
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </motion.div>

      {/* Post Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-8">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-neutral-800">{post.author.name}</h3>
                <p className="text-sm text-neutral-500">
                  {post.author.profile?.level?.name || 'Student'} • {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
              <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* Post Title & Content */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-800 mb-4">
              {post.title}
            </h1>
            <div className="prose max-w-none">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          </div>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 gap-4">
                {post.media.map((media, index) => (
                  <div key={index} className="relative">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full max-h-96 object-cover rounded-lg shadow-sm"
                      />
                    ) : media.type === 'audio' ? (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <Music className="w-5 h-5 text-accent-500" />
                          <span className="text-sm font-medium text-neutral-700">Audio</span>
                        </div>
                        <audio
                          controls
                          className="w-full"
                        >
                          <source src={media.url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(1)}
                  disabled={voteOnPost.isPending}
                  className="flex items-center space-x-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.upvotes}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(-1)}
                  disabled={voteOnPost.isPending}
                  className="flex items-center space-x-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{post.downvotes}</span>
                </Button>
              </div>

              <button className="flex items-center space-x-2 text-neutral-500 hover:text-primary-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post._count?.comments || 0} comments</span>
              </button>

              <button className="flex items-center space-x-2 text-neutral-500 hover:text-blue-600 transition-colors">
                <Share className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>

            <button className="p-2 text-neutral-500 hover:text-accent-600 hover:bg-accent-50 rounded-full transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Comment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="font-semibold text-neutral-800 mb-4">
            {replyingTo ? 'Reply to comment' : 'Add a comment'}
          </h3>
          <div className="space-y-4">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={replyingTo ? 'Write your reply...' : 'Share your thoughts...'}
              className="w-full p-4 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex items-center justify-between">
              {replyingTo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setCommentContent('');
                  }}
                >
                  Cancel Reply
                </Button>
              )}
              <div className="flex items-center space-x-2 ml-auto">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentContent.trim() || createComment.isPending}
                >
                  {createComment.isPending ? 'Posting...' : (replyingTo ? 'Reply' : 'Comment')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Comments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="font-semibold text-neutral-800 mb-6">
            Comments ({comments?.comments?.length || 0})
          </h3>
          
          {commentsLoading ? (
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
          ) : comments?.comments?.length ? (
            <div className="space-y-6">
              {comments.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={(commentId) => {
                    setReplyingTo(commentId);
                    setCommentContent('');
                  }}
                  onVote={(commentId, value) => 
                    voteOnComment.mutate({ id: commentId, value })
                  }
                  onReport={(commentId, reason) =>
                    reportComment.mutate({ id: commentId, reason })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No comments yet. Be the first to comment!
            </div>
          )}
        </Card>
      </motion.div>

      {/* Contributions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">          
          {post && (
            <ContributionsList 
              postId={post.id} 
              onRequestContribution={() => setShowContributionModal(true)}
            />
          )}
        </Card>
      </motion.div>

      {/* Contribution Modal */}
      {showContributionModal && post && (
        <ContributionModal
          isOpen={showContributionModal}
          postId={post.id}
          postTitle={post.title}
          onClose={() => setShowContributionModal(false)}
        />
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-neutral-800 mb-4">Report Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="harassment">Harassment</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!reportReason || reportPost.isPending}
                >
                  {reportPost.isPending ? 'Reporting...' : 'Report'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  onVote: (commentId: string, value: 1 | -1) => void;
  onReport: (commentId: string, reason: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onVote, onReport }) => {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }
    
    onReport(comment.id, reportReason);
    setShowReportDialog(false);
    setReportReason('');
  };

  return (
    <div className="border-l-2 border-neutral-100 pl-4">
      <div className="flex items-start space-x-3">
        <img
          src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`}
          alt={comment.author.name}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-neutral-800 text-sm">
              {comment.author.name}
            </span>
            <span className="text-xs text-neutral-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-neutral-700 text-sm mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onVote(comment.id, 1)}
                className="p-1 text-neutral-400 hover:text-green-600 transition-colors"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <span className="text-xs text-neutral-500">{comment.upvotes}</span>
              
              <button
                onClick={() => onVote(comment.id, -1)}
                className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
              <span className="text-xs text-neutral-500">{comment.downvotes}</span>
            </div>
            
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-neutral-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
            
            <button
              onClick={() => setShowReportDialog(true)}
              className="text-xs text-neutral-500 hover:text-red-600 transition-colors flex items-center space-x-1"
            >
              <Flag className="w-3 h-3" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comment Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-neutral-800 mb-4">Report Comment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="harassment">Harassment</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!reportReason}
                >
                  Report
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;
