import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  TrendingUp,
  Clock,
  Star,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Tag,
  Eye,
  Users,
  ChevronDown,
  Share,
  Bookmark,
  Music
} from 'lucide-react';
import { 
  useFeed, 
  useSearch, 
  useVoteOnPost, 
  usePosts
} from '../hooks/useApi';
import { Post } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

type FeedType = 'trending' | 'recent' | 'top' | 'following';

const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | FeedType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    tags: [] as string[],
    dateRange: '',
    minVotes: 0
  });

  // API hooks - use existing usePosts for 'all' tab and new hooks for others
  const { data: allPosts, isLoading: allPostsLoading, error: allPostsError } = usePosts();
  // Note: useFeed might not be working properly, falling back to usePosts for now
  // const { 
  //   data: feedData, 
  //   isLoading: feedLoading, 
  //   error: feedError 
  // } = useFeed(activeTab as FeedType);

  const {
    data: searchResults,
    isLoading: searchLoading,
    refetch: performSearch
  } = useSearch({ query: searchQuery });

  const voteOnPost = useVoteOnPost();

  // Determine which data to show
  const getPostsData = () => {
    if (searchQuery) {
      return { 
        data: (searchResults as any)?.posts || (searchResults as any)?.data, 
        isLoading: searchLoading, 
        error: null 
      };
    }
    // Use allPosts.data since API now returns {data: [...], pagination: {...}}
    return { posts: allPosts?.data, isLoading: allPostsLoading, error: allPostsError };
  };

  const { posts, isLoading, error } = getPostsData();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      performSearch();
    }
  }, [performSearch]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery(''); // Clear search when changing tabs
  };

  const handleVote = (postId: string, value: 1 | -1) => {
    voteOnPost.mutate({ id: postId, value });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (searchQuery) {
      performSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      tags: [],
      dateRange: '',
      minVotes: 0
    });
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">Error loading posts</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Card>
    );
  }

  const feedTabs = [
    { id: 'all', label: 'All Posts', icon: null },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'top', label: 'Top Rated', icon: Star },
    { id: 'following', label: 'Following', icon: Users }
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-bold text-neutral-800 mb-2">
          Community Feed
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Discover trending discussions, share your knowledge, and connect with fellow learners
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search posts, topics, or users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-3"
              />
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-neutral-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Categories</option>
                      <option value="general">General</option>
                      <option value="javascript">JavaScript</option>
                      <option value="react">React</option>
                      <option value="nodejs">Node.js</option>
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>

                  {/* Min Votes Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Minimum Votes
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minVotes}
                      onChange={(e) => handleFilterChange('minVotes', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Feed Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {feedTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'outline'}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex items-center space-x-2"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Posts Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-8 w-full">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-neutral-200 rounded w-1/4 mb-3"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
                  <div className="h-5 bg-neutral-200 rounded w-full mb-3"></div>
                  <div className="h-5 bg-neutral-200 rounded w-full mb-3"></div>
                  <div className="h-5 bg-neutral-200 rounded w-5/6 mb-6"></div>
                  <div className="flex space-x-3 mb-6">
                    <div className="h-8 bg-neutral-200 rounded-full w-20"></div>
                    <div className="h-8 bg-neutral-200 rounded-full w-24"></div>
                    <div className="h-8 bg-neutral-200 rounded-full w-16"></div>
                  </div>
                  <div className="flex items-center space-x-8 pt-6 border-t border-neutral-200">
                    <div className="h-6 bg-neutral-200 rounded w-16"></div>
                    <div className="h-6 bg-neutral-200 rounded w-12"></div>
                    <div className="h-6 bg-neutral-200 rounded w-12"></div>
                    <div className="h-6 bg-neutral-200 rounded w-16"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : posts?.length ? (
          <div className="space-y-8">
            {posts.map((post: Post, index: number) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onVote={handleVote}
                onClick={() => navigate(`/posts/${post.id}`)}
              />
            ))}
            
            {/* Load More Button */}
            <div className="text-center py-8">
              <Button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={isLoading}
                className="px-8 py-3"
              >
                {isLoading ? 'Loading...' : 'Load More Posts'}
              </Button>
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-neutral-500">
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium mb-2">No posts found</h3>
                  <p>Try adjusting your search terms or filters</p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                  <p>Be the first to start a discussion!</p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate('/post/new')}
                  >
                    Create First Post
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

interface PostCardProps {
  post: Post;
  index: number;
  onVote: (postId: string, value: 1 | -1) => void;
  onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, index, onVote, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      <Card className="p-8 cursor-pointer hover:shadow-lg transition-shadow w-full" onClick={onClick}>
        {/* Post Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={post.author.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.profile?.displayName || post.author.name)}&background=random`}
              alt={post.author.profile?.displayName || post.author.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h4 className="font-medium text-neutral-800 text-lg">{post.author.profile?.displayName || post.author.name}</h4>
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <span>{post.author.profile?.level?.name || 'Student'}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-neutral-800 mb-4 leading-tight">
            {post.title}
          </h3>
          <p className="text-neutral-600 text-lg leading-relaxed line-clamp-4">
            {post.content}
          </p>
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
                      onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
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
          <div className="flex flex-wrap gap-3 mb-6">
            {post.tags.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-2 bg-primary-100 text-primary-700 text-sm rounded-full font-medium"
              >
                <Tag className="w-4 h-4 mr-2" />
                {tag.name}
              </span>
            ))}
            {post.tags.length > 5 && (
              <span className="text-sm text-neutral-500 px-3 py-2">
                +{post.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(post.id, 1);
                }}
                className="flex items-center space-x-2 text-neutral-500 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-50"
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="text-base font-medium">{post.upvotes}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(post.id, -1);
                }}
                className="flex items-center space-x-2 text-neutral-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
              >
                <ThumbsDown className="w-5 h-5" />
                <span className="text-base font-medium">{post.downvotes}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-neutral-500">
              <MessageCircle className="w-5 h-5" />
              <span className="text-base">{post._count?.comments || 0}</span>
            </div>

            <div className="flex items-center space-x-2 text-neutral-500">
              <Eye className="w-5 h-5" />
              <span className="text-base">{(post as any).views || 0}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle share
              }}
              className="flex items-center space-x-2 text-neutral-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
            >
              <Share className="w-5 h-5" />
              <span className="text-base">Share</span>
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked 
                ? 'text-accent-600 bg-accent-100' 
                : 'text-neutral-500 hover:text-accent-600 hover:bg-accent-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeedPage;
