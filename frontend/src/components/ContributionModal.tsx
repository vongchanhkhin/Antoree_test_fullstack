import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Plus, HelpCircle, Send } from 'lucide-react';
import { useCreateContribution } from '../hooks/useContributions';
import Card from './ui/Card';
import Button from './ui/Button';
import { toast } from 'react-hot-toast';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
}) => {
  const [selectedType, setSelectedType] = useState<'edit' | 'add_example' | 'add_question'>('edit');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  
  const createContributionMutation = useCreateContribution();

  const contributionTypes = [
    {
      id: 'edit' as const,
      title: 'Edit Content',
      description: 'Fix typos, grammar, or improve content quality',
      icon: Edit,
      points: '+5 points',
      placeholder: 'Enter content to edit or replace...',
    },
    {
      id: 'add_example' as const,
      title: 'Add Example',
      description: 'Add illustrative examples to clarify content',
      icon: Plus,
      points: '+10 points',
      placeholder: 'Enter specific example to illustrate...',
    },
    {
      id: 'add_question' as const,
      title: 'Add Question',
      description: 'Suggest related questions for further discussion',
      icon: HelpCircle,
      points: '+15 points',
      placeholder: 'Enter question related to the content...',
    },
  ];

  const selectedTypeData = contributionTypes.find(type => type.id === selectedType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter contribution content');
      return;
    }

    try {
      await createContributionMutation.mutateAsync({
        postId,
        data: {
          type: selectedType,
          content: content.trim(),
          description: description.trim() || undefined,
        },
      });
      
      // Reset form
      setContent('');
      setDescription('');
      onClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">Contribute to Post</h2>
                  <p className="text-neutral-600 mt-1 truncate">{postTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Type Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Choose contribution type</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {contributionTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedType === type.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Icon className={`w-5 h-5 mt-0.5 ${
                              selectedType === type.id ? 'text-primary-600' : 'text-neutral-500'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-medium ${
                                  selectedType === type.id ? 'text-primary-800' : 'text-neutral-800'
                                }`}>
                                  {type.title}
                                </h4>
                                <span className={`text-sm font-medium ${
                                  selectedType === type.id ? 'text-primary-600' : 'text-neutral-500'
                                }`}>
                                  {type.points}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600 mt-1">{type.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Contribution Content *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={selectedTypeData.placeholder}
                    rows={6}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Description Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Ghi chú thêm (tùy chọn)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Giải thích thêm về đóng góp của bạn..."
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={createContributionMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createContributionMutation.isPending || !content.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createContributionMutation.isPending ? 'Sending...' : 'Submit Contribution'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
