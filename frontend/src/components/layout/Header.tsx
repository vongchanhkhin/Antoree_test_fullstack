import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, User, LogOut, Settings, Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth, useLogout } from '../../hooks/useApi';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: user } = useAuth();
  const logoutMutation = useLogout();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <Link to="/feed" className="flex items-center ml-2 lg:ml-0">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center mr-3"
              >
                <span className="text-white font-bold text-sm">E</span>
              </motion.div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                English Platform
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, users, topics..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 rounded-md text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-md text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* Profile Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-1 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-neutral-700">
                  {user?.name}
                </span>
              </motion.button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 py-1 z-50"
                >
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <hr className="my-1 border-neutral-200" />
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </motion.header>
  );
};

export default Header;
