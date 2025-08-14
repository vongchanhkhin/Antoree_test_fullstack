import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, CheckCircle, ArrowRight, BookOpen, Target } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useLevels, useSkills, useUpdateProfile } from '../../hooks/useApi';
import { Level, Skill } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'level' | 'skills' | 'complete'>('level');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const { data: levels, isLoading: levelsLoading } = useLevels();
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const updateProfileMutation = useUpdateProfile();

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevel(levelId);
    setStep('skills');
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleComplete = async () => {
    try {
      console.log('handleComplete - Starting profile update...');
      console.log('handleComplete - Selected level:', selectedLevel);
      console.log('handleComplete - Selected skills:', selectedSkills);
      
      // Save profile with selected level
      const updatedUser = await updateProfileMutation.mutateAsync({
        levelId: selectedLevel,
        // Note: Skills are not stored in profile table yet
        // We could add bio to include selected skills for now
        bio: selectedSkills.length > 0 
          ? `Focused on: ${selectedSkills.map(skillId => skills?.find(s => s.id === skillId)?.name).join(', ')}`
          : undefined
      });
      
      console.log('handleComplete - Profile updated successfully:', updatedUser);
      console.log('handleComplete - Updated levelId:', updatedUser?.profile?.levelId);
      
      // Force refetch of auth data to ensure cache is up to date
      await queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
      
      // Wait a bit more to ensure React Query cache is updated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      navigate('/feed');
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Don't prevent navigation if profile update fails
      navigate('/feed');
    }
  };

  const getLevelColor = (order: number) => {
    const colors = [
      'from-green-400 to-green-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-red-400 to-red-600',
      'from-pink-400 to-pink-600',
    ];
    return colors[order % colors.length];
  };

  if (levelsLoading || skillsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['level', 'skills', 'complete'].map((stepName, index) => (
              <React.Fragment key={stepName}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step === stepName || 
                    (['skills', 'complete'].includes(step) && stepName === 'level') ||
                    (step === 'complete' && stepName === 'skills')
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 text-neutral-400'
                  }`}
                >
                  {stepName === 'level' ? '1' : stepName === 'skills' ? '2' : '3'}
                </motion.div>
                {index < 2 && (
                  <div className={`w-12 h-1 rounded ${
                    (['skills', 'complete'].includes(step) && index === 0) ||
                    (step === 'complete' && index === 1)
                      ? 'bg-primary-600'
                      : 'bg-neutral-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Level Selection */}
        {step === 'level' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="text-center"
          >
            <BookOpen className="mx-auto h-16 w-16 text-primary-600 mb-6" />
            <h2 className="text-3xl font-bold text-gradient mb-4">
              What's your English level?
            </h2>
            <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
              Choose your current English proficiency level. This helps us personalize your learning experience.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {levels?.map((level: Level) => (
                <motion.div
                  key={level.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    hover={false}
                    onClick={() => handleLevelSelect(level.id)}
                    className="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getLevelColor(level.order)} flex items-center justify-center mb-4 mx-auto`}>
                      <span className="text-white font-bold text-lg">{level.name}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{level.name}</h3>
                    <p className="text-neutral-600 text-sm">
                      {level.description || `${level.name} level English proficiency`}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Skills Selection */}
        {step === 'skills' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="text-center"
          >
            <Target className="mx-auto h-16 w-16 text-secondary-500 mb-6" />
            <h2 className="text-3xl font-bold text-gradient mb-4">
              What do you want to focus on?
            </h2>
            <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
              Select the skills you'd like to improve. You can choose multiple areas.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              {skills?.map((skill: Skill) => (
                <motion.div
                  key={skill.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    hover={false}
                    padding="sm"
                    onClick={() => handleSkillToggle(skill.id)}
                    className={`cursor-pointer transition-all ${
                      selectedSkills.includes(skill.id)
                        ? 'ring-2 ring-secondary-500 bg-secondary-50'
                        : 'hover:ring-2 hover:ring-secondary-300'
                    }`}
                  >
                    {selectedSkills.includes(skill.id) && (
                      <CheckCircle className="w-5 h-5 text-secondary-500 mb-2 mx-auto" />
                    )}
                    <h3 className="font-medium text-sm">{skill.name}</h3>
                    {skill.description && (
                      <p className="text-xs text-neutral-500 mt-1">{skill.description}</p>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep('level')}
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('complete')}
                disabled={selectedSkills.length === 0}
                icon={ArrowRight}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-full flex items-center justify-center mb-6"
            >
              <Star className="h-8 w-8 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gradient mb-4">
              You're all set!
            </h2>
            <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
              Great! We've personalized your learning experience based on your selections. 
              Let's start your English learning journey!
            </p>

            <Card className="max-w-md mx-auto mb-8">
              <h3 className="font-semibold mb-4">Your Profile:</h3>
              <div className="text-left space-y-2">
                <p><strong>Level:</strong> {levels?.find(l => l.id === selectedLevel)?.name}</p>
                <p><strong>Focus Areas:</strong></p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSkills.map(skillId => {
                    const skill = skills?.find(s => s.id === skillId);
                    return (
                      <span
                        key={skillId}
                        className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs"
                      >
                        {skill?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep('skills')}
                disabled={updateProfileMutation.isPending}
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                isLoading={updateProfileMutation.isPending}
                icon={ArrowRight}
                size="lg"
              >
                Start Learning
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
