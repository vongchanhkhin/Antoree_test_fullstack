import React, { useState, useRef } from 'react';
import { useCreatePost } from '../hooks/useApi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Eye, 
  Upload,
  FileImage,
  Music,
  X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { CLOUDINARY_CONFIG, getUploadUrl } from '../config/cloudinary';

interface UploadedMedia {
  id: string;
  type: 'image' | 'audio';
  url: string;
  name: string;
}

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const createPostMutation = useCreatePost();

  // Upload files to Cloudinary
  const uploadToCloudinary = async (files: File[]): Promise<UploadedMedia[]> => {
    const uploadPromises = files.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

        const response = await fetch(getUploadUrl(), {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
          id: data.public_id,
          name: file.name,
          url: data.secure_url,
          type: file.type.startsWith('image/') ? 'image' as const : 'audio' as const,
        };
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((result): result is NonNullable<typeof result> => result !== null);
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Validate files
      const validFiles = files.filter(file => {
        if (!CLOUDINARY_CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not a supported image format`);
          return false;
        }
        
        if (file.size > CLOUDINARY_CONFIG.MAX_IMAGE_SIZE) {
          toast.error(`${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        
        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      const uploadedFiles = await uploadToCloudinary(validFiles);
      setUploadedMedia(prev => [...prev, ...uploadedFiles]);
      
      toast.success(`Successfully uploaded ${uploadedFiles.length} image(s)`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Validate files
      const validFiles = files.filter(file => {
        if (!CLOUDINARY_CONFIG.SUPPORTED_AUDIO_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not a supported audio format`);
          return false;
        }
        
        if (file.size > CLOUDINARY_CONFIG.MAX_AUDIO_SIZE) {
          toast.error(`${file.name} is too large. Maximum size is 50MB`);
          return false;
        }
        
        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      const uploadedFiles = await uploadToCloudinary(validFiles);
      setUploadedMedia(prev => [...prev, ...uploadedFiles]);
      
      toast.success(`Successfully uploaded ${uploadedFiles.length} audio file(s)`);
    } catch (error) {
      toast.error('Failed to upload audio files');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };

  const removeMedia = (id: string) => {
    setUploadedMedia(prev => prev.filter(media => media.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Extract media with type and URL for the post
    const mediaData = uploadedMedia.map(media => ({
      type: media.type,
      url: media.url,
    }));
    
    const payload = {
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      categoryId: formData.category || undefined,
      difficulty: formData.difficulty,
      skills: [], // TODO: Add skill selection to form if needed
      status: 'published' as 'published',
      media: mediaData, // Include uploaded media with type and URL
    };
    createPostMutation.mutate(payload, {
      onSuccess: () => {
        setIsSubmitting(false);
        navigate('/feed');
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          Create New Post
        </h1>
        <p className="text-neutral-600">
          Share your knowledge and help others learn English
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Write a clear, descriptive title..."
                    required
                    className="text-lg"
                  />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Content *
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center px-3 py-1 rounded-lg text-sm transition-colors ${
                          isPreview 
                            ? 'bg-primary-100 text-primary-700' 
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                    </div>
                  </div>
                  
                  {isPreview ? (
                    <div className="min-h-[200px] p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                      <div className="prose prose-sm max-w-none">
                        {formData.content ? (
                          <p className="whitespace-pre-wrap">{formData.content}</p>
                        ) : (
                          <p className="text-neutral-400 italic">Nothing to preview...</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Share your knowledge, ask questions, or start a discussion..."
                      required
                      rows={12}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                    />
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tags
                  </label>
                  <Input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="grammar, vocabulary, speaking (comma separated)"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Add up to 5 tags to help others find your post
                  </p>
                </div>

                {/* Category and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a category...</option>
                      <option value="grammar">Grammar</option>
                      <option value="vocabulary">Vocabulary</option>
                      <option value="speaking">Speaking</option>
                      <option value="writing">Writing</option>
                      <option value="listening">Listening</option>
                      <option value="reading">Reading</option>
                      <option value="general">General Discussion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.title || !formData.content || isSubmitting || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Publishing...' : 'Publish Post'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Media Upload */}
            <Card className="p-4">
              <h3 className="font-medium text-neutral-800 mb-3">
                Add Media
              </h3>
              
              {/* Upload Buttons */}
              <div className="space-y-3">
                {/* Image Upload */}
                <button 
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-4 border-2 border-dashed border-neutral-200 rounded-lg hover:border-primary-300 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileImage className="w-8 h-8 mx-auto text-neutral-400 group-hover:text-primary-500 mb-2" />
                  <p className="text-sm text-neutral-600 group-hover:text-primary-600">
                    {isUploading ? 'Uploading...' : 'Upload Images'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    JPG, PNG, GIF up to 10MB
                  </p>
                </button>

                {/* Audio Upload */}
                <button 
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-4 border-2 border-dashed border-neutral-200 rounded-lg hover:border-accent-300 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Music className="w-8 h-8 mx-auto text-neutral-400 group-hover:text-accent-500 mb-2" />
                  <p className="text-sm text-neutral-600 group-hover:text-accent-600">
                    {isUploading ? 'Uploading...' : 'Upload Audio'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    MP3, WAV, OGG up to 50MB
                  </p>
                </button>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleAudioUpload}
                className="hidden"
              />

              {/* Uploaded Media Preview */}
              {uploadedMedia.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">
                    Uploaded Files ({uploadedMedia.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadedMedia.map((media) => (
                      <div
                        key={media.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {media.type === 'image' ? (
                            <FileImage className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          ) : (
                            <Music className="w-4 h-4 text-accent-500 flex-shrink-0" />
                          )}
                          <span className="text-sm text-neutral-600 truncate">
                            {media.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia(media.id)}
                          className="p-1 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Writing Tips */}
            <Card className="p-4 bg-gradient-to-r from-accent-50 to-primary-50">
              <h3 className="font-medium text-neutral-800 mb-3">
                Writing Tips
              </h3>
              <ul className="text-sm text-neutral-600 space-y-2">
                <li>• Use clear, descriptive titles</li>
                <li>• Break content into paragraphs</li>
                <li>• Add relevant tags for discoverability</li>
                <li>• Include examples when explaining concepts</li>
                <li>• Be respectful and constructive</li>
              </ul>
            </Card>

            {/* Popular Tags */}
            <Card className="p-4">
              <h3 className="font-medium text-neutral-800 mb-3">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {['grammar', 'vocabulary', 'speaking', 'writing', 'pronunciation', 'ielts'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                      if (!currentTags.includes(tag)) {
                        const newTags = [...currentTags, tag].join(', ');
                        setFormData(prev => ({ ...prev, tags: newTags }));
                      }
                    }}
                    className="px-2 py-1 bg-neutral-100 hover:bg-primary-100 text-neutral-700 hover:text-primary-700 text-xs rounded-md transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
