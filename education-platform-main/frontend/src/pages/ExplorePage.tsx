import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, TrendingUp, Clock, Star } from 'lucide-react';
import { usePosts } from '../hooks/useApi';
import { Post } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ExplorePage: React.FC = () => {
  const { data: posts, isLoading, error } = usePosts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'trending' | 'recent' | 'popular'>('trending');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">Error loading posts</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Card>
    );
  }

  const sortOptions = [
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'recent', label: 'Recent', icon: Clock },
    { key: 'popular', label: 'Popular', icon: Star }
  ] as const;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          Explore
        </h1>
        <p className="text-neutral-600">
          Discover amazing content from the English learning community
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        {/* Sort Options */}
        <div className="flex space-x-1 bg-white/60 backdrop-blur-lg rounded-lg p-1 border border-white/20">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                sortBy === option.key
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <option.icon className="w-4 h-4 mr-2" />
              {option.label}
            </button>
          ))}
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-white/60 backdrop-blur-lg rounded-lg p-1 border border-white/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:text-primary-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:text-primary-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </motion.div>

      {/* Posts Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
        }
      >
        {posts?.data?.map((post: Post, index: number) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {viewMode === 'grid' ? (
              <ExploreCard post={post} />
            ) : (
              <ExploreListItem post={post} />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <Button variant="outline" size="lg">
          Load More Content
        </Button>
      </motion.div>
    </div>
  );
};

interface ExploreCardProps {
  post: Post;
}

const ExploreCard: React.FC<ExploreCardProps> = ({ post }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
              alt={post.author.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-neutral-700">
              {post.author.name}
            </span>
          </div>
          <span className="text-xs text-neutral-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="font-semibold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md"
              >
                #{tag.name}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>{post.upvotes} upvotes</span>
          <span>{post._count?.comments || 0} comments</span>
        </div>
      </div>
    </Card>
  );
};

const ExploreListItem: React.FC<ExploreCardProps> = ({ post }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <img
            src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
            alt={post.author.name}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">
                {post.author.name}
              </span>
              <span className="text-xs text-neutral-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h3 className="font-semibold text-lg text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
              {post.title}
            </h3>
            
            <p className="text-neutral-600 mb-4 line-clamp-2">
              {post.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {post.tags?.slice(0, 4).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                <span>{post.upvotes} upvotes</span>
                <span>{post._count?.comments || 0} comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExplorePage;
