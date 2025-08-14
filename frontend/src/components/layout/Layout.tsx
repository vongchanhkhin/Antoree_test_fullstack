import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/30">
      <Header />
      <Sidebar />
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-16 lg:pl-64 pb-16 lg:pb-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default Layout;
