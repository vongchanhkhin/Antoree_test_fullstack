import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useRegister } from '../../hooks/useApi';
import { RegisterRequest } from '../../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
      navigate('/onboarding');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-secondary-500 to-primary-600 rounded-full flex items-center justify-center mb-6"
          >
            <UserPlus className="h-8 w-8 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gradient">
            Join our community!
          </h2>
          <p className="mt-2 text-neutral-600">
            Start your English learning adventure today
          </p>
        </motion.div>

        <Card className="max-w-md mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="Enter your full name"
              error={errors.name?.message}
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />

            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Create a password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={registerMutation.isPending}
              icon={UserPlus}
            >
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-xs text-neutral-500"
        >
          <p>
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-primary-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-primary-600">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
