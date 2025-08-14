import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Compass, 
  Search, 
  PlusCircle, 
  BookOpen, 
  Users, 
  Settings,
  Zap
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Feed', href: '/feed', icon: Home },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Create Post', href: '/post/new', icon: PlusCircle },
  { name: 'Learning', href: '/learning', icon: BookOpen },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'AI Lab', href: '/ai-lab', icon: Zap },
];

const Sidebar: React.FC = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:w-64 lg:flex lg:flex-col"
      >
        <div className="flex-1 flex flex-col pt-20 pb-4 bg-white/60 backdrop-blur-lg border-r border-white/20">
          <div className="flex-1 flex flex-col overflow-y-auto px-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center w-full"
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                          isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-primary-500'
                        }`}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-3 inline-block py-0.5 px-2 text-xs bg-red-100 text-red-800 rounded-full"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-white/50"
            >
              <h3 className="text-sm font-medium text-neutral-800 mb-3">
                Your Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Posts Read</span>
                  <span className="font-medium text-primary-600">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Comments</span>
                  <span className="font-medium text-secondary-600">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Points</span>
                  <span className="font-medium text-accent-600">156</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                  <span>Weekly Goal</span>
                  <span>76%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '76%' }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Popular Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <h3 className="text-sm font-medium text-neutral-800 mb-3 px-4">
                Popular Topics
              </h3>
              <div className="space-y-1">
                {['Grammar', 'Vocabulary', 'Speaking', 'Writing', 'IELTS'].map((tag, index) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                  >
                    #{tag}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-neutral-200">
            <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-lg border-t border-white/20 z-50"
      >
        <div className="flex justify-around py-2">
          {navigation.slice(0, 5).map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-neutral-600 hover:text-primary-600'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <item.icon
                    className={`h-5 w-5 mb-1 ${
                      isActive ? 'text-primary-600' : 'text-neutral-400'
                    }`}
                  />
                  <span className="text-xs">{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </motion.nav>
    </>
  );
};

export default Sidebar;
