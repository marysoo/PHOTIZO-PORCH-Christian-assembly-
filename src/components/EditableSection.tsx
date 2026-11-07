import { useState } from 'react';
import { Edit2, Save, X, UploadCloud, Trash2, Camera, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageSection, firebaseService } from '../lib/firebaseService';

interface EditableSectionProps {
  section: PageSection;
  isAdmin: boolean;
  children: React.ReactNode;
}

export default function EditableSection({ section, isAdmin, children }: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PageSection>(section);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleSave = async () => {
    await firebaseService.upsertSection(formData);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // Keep image in 100% original unenhanced state
          setFormData(prev => ({ ...prev, imageUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAdmin) return <>{children}</>;

  return (
    <div className="relative group/section border-2 border-transparent hover:border-gold/20 transition-all rounded-3xl">
      <div className="absolute -top-4 -right-4 z-40 opacity-0 group-hover/section:opacity-100 transition-opacity flex gap-2">
        <button 
          onClick={() => {
            setFormData(section);
            setIsEditing(true);
          }}
          className="p-2 bg-zinc-900 border border-gold/50 text-gold rounded-full hover:bg-gold hover:text-white transition-all shadow-xl cursor-pointer"
          title="Edit Section Content & Image"
        >
          <Edit2 size={16} />
        </button>
      </div>

      {children}

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif text-gold">Edit Section</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1 font-semibold">Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1 font-semibold">Subtitle</label>
                  <input 
                    type="text" 
                    value={formData.subtitle || ''}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1 font-semibold">Content (Markdown supported)</label>
                  <textarea 
                    rows={6}
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:border-gold outline-none font-mono text-sm"
                  />
                </div>

                {/* Section Image Management */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest block font-semibold">Section Image</label>
                  
                  {formData.imageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group/img">
                      <img 
                        src={formData.imageUrl} 
                        alt="Section Preview" 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-44 object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto(formData.imageUrl!)}
                          className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-gold text-xs rounded-full flex items-center gap-1 hover:bg-zinc-800 cursor-pointer"
                        >
                          <Eye size={14} /> View Original
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="px-3 py-1.5 bg-red-950 border border-red-800 text-red-300 text-xs rounded-full flex items-center gap-1 hover:bg-red-900 cursor-pointer"
                        >
                          <Trash2 size={14} /> Delete Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-zinc-800 hover:border-gold/50 rounded-2xl p-4 text-center transition-colors">
                      <UploadCloud className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-xs text-zinc-400 font-medium mb-2">Upload image file or enter URL below</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-gold border border-gold/30 rounded-xl text-xs font-bold cursor-pointer transition-all">
                        <Camera size={14} /> Upload Image File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}

                  <input 
                    type="text" 
                    value={formData.imageUrl || ''}
                    placeholder="Or paste image URL (https://...)"
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-gold outline-none mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3.5 bg-gold text-zinc-950 rounded-xl font-bold hover:shadow-[0_0_20px_var(--theme-glow,rgba(212,175,55,0.3))] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={18} /> Save Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3.5 border border-zinc-800 rounded-xl font-bold hover:bg-zinc-800 transition-all text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal for previewing section photo */}
      <AnimatePresence>
        {previewPhoto && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-2 right-2 p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full cursor-pointer z-10"
              >
                <X size={20} />
              </button>
              <img
                src={previewPhoto}
                alt="Original Photo View"
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-zinc-800"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
