import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import SearchPage from './pages/SearchPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';

// Layout
import Layout from './components/layout/Layout';

// Hooks
import { useAuth } from './hooks/useApi';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Auth Guard Component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user, isLoading, error } = useAuth();

  console.log('AuthGuard - user data:', user);
  console.log('AuthGuard - isLoading:', isLoading);
  console.log('AuthGuard - error:', error);
  console.log('AuthGuard - user.profile?.levelId:', user?.profile?.levelId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding
  // For now, only check for levelId since skills are stored in bio field
  if (!user.profile?.levelId) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Public Route Guard (redirects authenticated users)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user, isLoading } = useAuth();

  console.log('ProtectedRoute - user data:', user);
  console.log('ProtectedRoute - isLoading:', isLoading);
  console.log('ProtectedRoute - user.profile?.levelId:', user?.profile?.levelId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (user) {
    // Check if user needs onboarding
    // For now, only check for levelId since skills are stored in bio field
    if (!user.profile?.levelId) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 bg-pattern">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Onboarding route */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }
            >
              <Route index element={<Navigate to="/feed" replace />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="posts/:id" element={<PostDetailPage />} />
              <Route path="post/new" element={<CreatePostPage />} />
              <Route path="post/:id/edit" element={<CreatePostPage />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
