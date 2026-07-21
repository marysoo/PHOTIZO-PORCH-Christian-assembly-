import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  X, 
  ChevronRight, 
  BookOpen,
  Tag,
  AlertCircle,
  FileText
} from 'lucide-react';
import { firebaseService, BlogPost } from '../lib/firebaseService';

interface BlogProps {
  isAdmin: boolean;
}

const CATEGORIES = ['All', 'Devotional', 'Announcement', 'Sermon Note', 'Outreach', 'Testimonial'];

export default function Blog({ isAdmin }: BlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Prophet Japeth Tsukwas');
  const [category, setCategory] = useState('Devotional');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load posts
  useEffect(() => {
    const unsub = firebaseService.subscribeBlogPosts((data) => {
      setPosts(data);
    });
    return () => unsub();
  }, []);

  // Handle Form open for Add
  const handleAddPost = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setAuthor('Prophet Japeth Tsukwas');
    setCategory('Devotional');
    setSummary('');
    setImageUrl('');
    setFormError('');
    setIsFormOpen(true);
  };

  // Handle Form open for Edit
  const handleEditPost = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening the details modal
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setAuthor(post.author);
    setCategory(post.category || 'Devotional');
    setSummary(post.summary || '');
    setImageUrl(post.imageUrl || '');
    setFormError('');
    setIsFormOpen(true);
  };

  // Handle Delete
  const handleDeletePost = async (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the post "${post.title}"?`)) {
      try {
        await firebaseService.deleteBlogPost(post.id!);
      } catch (error) {
        console.error('Failed to delete blog post', error);
      }
    }
  };

  // Image Upload and Compression
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.src = event.target.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Target max resolution of 1000px for the longer edge to remain crisp and load fast
          const maxDimension = 1000;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setFormError('Could not compress image. Browser canvas error.');
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.75 quality for an extremely light footprint (<100KB)
          try {
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
            setImageUrl(compressedDataUrl);
          } catch (e) {
            setFormError('Image security constraints prevented compression.');
          }
        };
        img.onerror = () => {
          setFormError('Failed to load image. The file may be corrupted.');
        };
      }
    };
    reader.onerror = () => {
      setFormError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      setFormError('Title, Author, and Content are required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    // Generate summary automatically if not provided
    const blogSummary = summary.trim() || content.trim().substring(0, 160) + (content.trim().length > 160 ? '...' : '');

    const postData: BlogPost = {
      id: editingPost?.id,
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      date: editingPost?.date || new Date().toISOString().split('T')[0],
      category,
      summary: blogSummary,
      imageUrl: imageUrl || undefined
    };

    try {
      await firebaseService.upsertBlogPost(postData);
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving the blog post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter posts based on Category and Search Query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="blog" className="py-24 px-6 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/10 to-zinc-950 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold tracking-wider uppercase mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ministry Publications</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-sans font-medium tracking-tight text-white">
              The Porch <span className="text-gold">Gazette</span>
            </h2>
            <p className="mt-3 text-zinc-400 max-w-xl text-sm leading-relaxed">
              Deeper revelations, ministry news, outreach updates, and monthly spiritual devotionals compiled by the leadership.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleAddPost}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-zinc-950 font-bold text-sm tracking-wider uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Publication</span>
            </button>
          )}
        </div>

        {/* Controls: Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-10 pb-8 border-b border-zinc-900">
          {/* Categories Tab */}
          <div className="flex flex-wrap gap-2 order-2 lg:order-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gold text-zinc-950 border-gold shadow-[0_0_12px_rgba(212,175,55,0.15)] font-bold'
                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md w-full order-1 lg:order-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search publications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-full pl-11 pr-5 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Blog Grid */}
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
            <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-zinc-500 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">No Publications Found</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm">
              We couldn't find any blog posts matching your search query or selected category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                layoutId={`post-container-${post.id}`}
                onClick={() => setSelectedPost(post)}
                className="flex flex-col bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group hover:bg-zinc-900/50 transition-all duration-300 relative"
              >
                {/* Banner Image */}
                <div className="relative h-56 w-full overflow-hidden bg-zinc-950 border-b border-zinc-900">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-700">
                      <FileText className="w-12 h-12 stroke-[1.2] opacity-40 mb-2" />
                      <span className="text-xs font-mono tracking-widest uppercase">Porch Publication</span>
                    </div>
                  )}

                  {/* Category overlay */}
                  {post.category && (
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-bold text-gold tracking-wider uppercase">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{post.category}</span>
                    </div>
                  )}

                  {/* Admin controls inside the card */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 p-1.5 rounded-full shadow-lg">
                      <button
                        onClick={(e) => handleEditPost(post, e)}
                        className="p-2 text-zinc-400 hover:text-gold transition-colors rounded-full hover:bg-zinc-900 cursor-pointer"
                        title="Edit Post"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePost(post, e)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-full hover:bg-zinc-900 cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Info and Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold/60" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gold/60" />
                        {post.author}
                      </span>
                    </div>

                    <h3 className="text-xl font-sans font-medium text-zinc-100 group-hover:text-white line-clamp-2 transition-colors mb-2.5 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-900/80 flex items-center justify-between text-xs font-bold text-gold tracking-wide uppercase">
                    <span>Read Article</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* READ FULL POST MODAL */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl z-10"
            >
              {/* Close button overlay */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scrollable container */}
              <div className="overflow-y-auto flex-1">
                {/* Banner/Header */}
                <div className="relative h-64 md:h-80 w-full bg-zinc-950">
                  {selectedPost.imageUrl ? (
                    <img
                      src={selectedPost.imageUrl}
                      alt={selectedPost.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-700 border-b border-zinc-800">
                      <FileText className="w-16 h-16 stroke-[1.2] opacity-30 mb-2" />
                      <span className="text-xs font-mono tracking-widest uppercase">The Porch Gazette</span>
                    </div>
                  )}

                  {/* Category tag */}
                  {selectedPost.category && (
                    <div className="absolute bottom-6 left-8 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/90 backdrop-blur-sm border border-zinc-800 text-xs font-bold text-gold tracking-wider uppercase">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{selectedPost.category}</span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-500 mb-4">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold/60" />
                      Published on {selectedPost.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gold/60" />
                      By {selectedPost.author}
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-sans font-medium text-white tracking-tight mb-6 leading-tight">
                    {selectedPost.title}
                  </h1>

                  {/* Summary Callout */}
                  {selectedPost.summary && selectedPost.summary !== selectedPost.content && (
                    <div className="p-5 rounded-2xl bg-zinc-950 border-l-2 border-gold text-zinc-300 text-sm italic mb-8 leading-relaxed">
                      {selectedPost.summary}
                    </div>
                  )}

                  {/* Body Content with formatted paragraphs */}
                  <div className="text-zinc-300 text-sm md:text-base leading-relaxed space-y-5 whitespace-pre-wrap font-sans">
                    {selectedPost.content}
                  </div>
                </div>
              </div>

              {/* Bottom footer bar with closing trigger */}
              <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-6 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE & EDIT FORM MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmitting) setIsFormOpen(false);
              }}
              className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gold/10 text-gold rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {editingPost ? 'Edit Gazette Post' : 'Add New Gazette Post'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Staff Portal • Ministry Publication Manager
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {formError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Publication Title
                    </label>
                    <input
                      key={editingPost?.id || 'new'}
                      type="text"
                      placeholder="e.g. Navigating Seasons of Wilderness"
                      defaultValue={editingPost ? editingPost.title : ''}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={200}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                      required
                    />
                  </div>

                  {/* Category and Author Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                      >
                        {CATEGORIES.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Author Byline
                      </label>
                      <input
                        key={editingPost?.id || 'new'}
                        type="text"
                        placeholder="e.g. Prophet Japeth Tsukwas"
                        defaultValue={editingPost ? editingPost.author : 'Prophet Japeth Tsukwas'}
                        onChange={(e) => setAuthor(e.target.value)}
                        maxLength={100}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Summary / Teaser */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Short Summary / Teaser <span className="text-[10px] text-zinc-600 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      key={editingPost?.id || 'new'}
                      placeholder="A short teaser or hook to describe the article. If left empty, it will auto-extract from content."
                      defaultValue={editingPost ? editingPost.summary || '' : ''}
                      onChange={(e) => setSummary(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all resize-none"
                    />
                  </div>

                  {/* Body Content */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Main Content
                    </label>
                    <textarea
                      key={editingPost?.id || 'new'}
                      placeholder="Write your article details here. Support linebreaks for neat paragraphs."
                      defaultValue={editingPost ? editingPost.content : ''}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all resize-y min-h-[150px]"
                      required
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Featured Banner Image
                    </label>
                    
                    {imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
                        <img 
                          src={imageUrl} 
                          alt="Banner preview" 
                          className="w-full h-48 object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Banner
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                          dragActive 
                            ? 'border-gold bg-gold/5' 
                            : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="file"
                          id="blog-image-file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-500 mb-3">
                          <ImageIcon className="w-6 h-6 text-gold/60" />
                        </div>
                        <p className="text-sm font-medium text-zinc-300">
                          Drag and drop your image, or{' '}
                          <label 
                            htmlFor="blog-image-file" 
                            className="text-gold hover:underline cursor-pointer font-semibold"
                          >
                            browse files
                          </label>
                        </p>
                        <p className="text-xs text-zinc-500 mt-1.5">
                          Supports PNG, JPG, WEBP • Automatically optimized on upload
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button bar */}
                <div className="flex items-center justify-end gap-4 p-6 border-t border-zinc-800 bg-zinc-950 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-gold text-zinc-950 font-bold text-xs tracking-wider uppercase hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:active:scale-100 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                  >
                    {isSubmitting ? 'Publishing...' : (editingPost ? 'Update Publication' : 'Publish Article')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
