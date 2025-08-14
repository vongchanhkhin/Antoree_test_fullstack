import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Hash, User, BookOpen } from 'lucide-react';
import { usePosts } from '../hooks/useApi';
import { Post } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'posts' | 'users' | 'tags'>('posts');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Post[]>([]);

  // Mock search function - replace with actual API call
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResults([]);
      setIsSearching(false);
    }, 1000);
  };

  const searchTypes = [
    { key: 'posts', label: 'Posts', icon: BookOpen },
    { key: 'users', label: 'Users', icon: User },
    { key: 'tags', label: 'Tags', icon: Hash }
  ] as const;

  const popularSearches = [
    'Grammar tips',
    'IELTS preparation',
    'Business English',
    'Pronunciation',
    'Vocabulary building',
    'Speaking practice'
  ];

  const recentSearches = [
    'English idioms',
    'Past tense',
    'Advanced grammar'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          Search
        </h1>
        <p className="text-neutral-600">
          Find posts, users, and topics that interest you
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Search for posts, users, or topics..."
            className="pl-12 pr-12 py-4 text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <Button
          onClick={() => handleSearch(searchQuery)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          disabled={!searchQuery.trim() || isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </motion.div>

      {/* Search Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-1 mb-8 bg-white/60 backdrop-blur-lg rounded-lg p-1 border border-white/20"
      >
        {searchTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setSearchType(type.key)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              searchType === type.key
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            <type.icon className="w-4 h-4 mr-2" />
            {type.label}
          </button>
        ))}
      </motion.div>

      {/* Search Results */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isSearching ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-6">
              {searchResults.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SearchResultCard post={post} searchQuery={searchQuery} />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-neutral-500 mb-4">
                No results found for "{searchQuery}"
              </div>
              <p className="text-sm text-neutral-400">
                Try adjusting your search terms or browse popular topics below
              </p>
            </Card>
          )}
        </motion.div>
      )}

      {/* Popular Searches */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-800 mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-neutral-500" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setSearchQuery(search)}
                    className="px-3 py-2 bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700 rounded-lg text-sm transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Popular Searches */}
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center">
              <Hash className="w-5 h-5 mr-2 text-neutral-500" />
              Popular Topics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {popularSearches.map((search, index) => (
                <motion.button
                  key={search}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSearchQuery(search)}
                  className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 rounded-lg text-left transition-all group"
                >
                  <div className="text-sm font-medium text-neutral-800 group-hover:text-primary-700">
                    {search}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Trending topic
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Search Tips */}
          <Card className="p-6 bg-gradient-to-r from-accent-50 to-primary-50">
            <h3 className="font-semibold text-neutral-800 mb-4">
              Search Tips
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>• Use specific keywords for better results</li>
              <li>• Try different search types (Posts, Users, Tags)</li>
              <li>• Use quotes for exact phrases: "business english"</li>
              <li>• Search by difficulty level: beginner, intermediate, advanced</li>
            </ul>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

interface SearchResultCardProps {
  post: Post;
  searchQuery: string;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ post, searchQuery }) => {
  // Function to highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
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

          <h3 className="font-semibold text-lg text-neutral-800 mb-2">
            {highlightText(post.title, searchQuery)}
          </h3>
          
          <p className="text-neutral-600 mb-4 line-clamp-2">
            {highlightText(post.content, searchQuery)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {post.tags?.slice(0, 3).map((tag) => (
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
    </Card>
  );
};

export default SearchPage;
