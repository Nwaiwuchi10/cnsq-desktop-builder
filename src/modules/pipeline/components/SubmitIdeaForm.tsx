import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bold, Italic, Link2, List, Paperclip, X, HelpCircle } from 'lucide-react';
import { createPipelineIdea, updatePipelineIdea } from '../services/pipeline.service';
import api from '@/utils/api';
import CustomModal from '@/component/Message/Message';

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

interface SubmitIdeaFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SubmitIdeaForm({ initialData, onSuccess, onCancel }: SubmitIdeaFormProps = {}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [departmentId, setDepartmentId] = useState(initialData?.department?.id?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [departments, setDepartments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // @mention state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);

  useEffect(() => {
    fetchDepartments();
    fetchStaff();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to load departments', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff-register/all/staffs/dept?page=1&limit=100');
      setStaffList(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Failed to load staff list', error);
    }
  };

  // ── Description / @mention handler ──────────────────────────
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);

    const match = value.match(/@(\w*)$/);
    if (match) {
      setMentionSearch(match[1].toLowerCase());
      setMentionIndex(value.lastIndexOf('@'));
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionIndex(-1);
    }
  };

  const insertMention = (staff: StaffMember) => {
    if (mentionIndex === -1 || !descRef.current) return;
    const before = description.substring(0, mentionIndex);
    const after = description.substring(descRef.current.selectionStart);
    const fullName = `${staff.firstName} ${staff.lastName}`;
    setDescription(`${before}@${fullName} ${after}`);
    setShowMentions(false);
    setMentionIndex(-1);
    setTimeout(() => descRef.current?.focus(), 0);
  };

  const filteredStaff = staffList
    .filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(mentionSearch)
    )
    .slice(0, 5);

  // ── Toolbar: insert formatting markers into textarea ─────────
  const wrapSelection = (wrapper: string) => {
    const el = descRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = description.slice(start, end) || 'text';
    const newText =
      description.slice(0, start) +
      `${wrapper}${selected}${wrapper}` +
      description.slice(end);
    setDescription(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + wrapper.length, start + wrapper.length + selected.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const el = descRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const newText = description.slice(0, start) + text + description.slice(start);
    setDescription(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleBold = () => wrapSelection('**');
  const handleItalic = () => wrapSelection('_');
  const handleList = () => insertAtCursor('\n- ');
  const handleLink = () => {
    const el = descRef.current;
    if (!el) return;
    const selected = description.slice(el.selectionStart, el.selectionEnd) || 'link text';
    const start = el.selectionStart;
    const newText = description.slice(0, start) + `[${selected}](url)` + description.slice(el.selectionEnd);
    setDescription(newText);
    setTimeout(() => el.focus(), 0);
  };
  const handleAtMention = () => {
    insertAtCursor('@');
    setShowMentions(true);
    setMentionSearch('');
    setMentionIndex((descRef.current?.selectionStart ?? description.length));
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setModal({ type: 'error', message: 'Title and description are required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const dto = {
        title,
        description,
        departmentId: departmentId ? Number(departmentId) : undefined,
      };
      formData.append('dto', JSON.stringify(dto));
      files.forEach((file) => formData.append('files', file));

      let responseData;
      if (initialData) {
        responseData = await updatePipelineIdea(initialData.id, formData);
      } else {
        responseData = await createPipelineIdea(formData);
      }
      
      setModal({ type: 'success', message: (responseData as any)?.message || `Idea ${initialData ? 'updated' : 'submitted'} successfully!` });
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/pipeline');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting idea', error);
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to submit idea' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full h-full font-sans max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} /> Back to Pipeline
        </button>
        <h1 className="text-[22px] md:text-3xl font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2">
          {initialData ? 'Edit Idea' : 'Submit a New Idea'}
        </h1>
        <p className="text-[13px] md:text-[15px] text-gray-500 dark:text-gray-400">
          {initialData ? 'Update your idea details and save the changes.' : 'Share your idea with the team. Great ideas can come from anywhere.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* ── Form (wider) ── */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
        >
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2">
                Idea Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your idea a clear, descriptive title"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#8ec32f] transition-colors"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2">
                Department <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 pl-4 pr-10 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#8ec32f] transition-colors"
                >
                  <option value="">Select a department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description with formatting toolbar + @mentions */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative border border-gray-200 dark:border-gray-700 focus-within:border-[#8ec32f] rounded-xl overflow-visible transition-colors">
                {/* Mention dropdown – rendered above the border */}
                {showMentions && filteredStaff.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                    {filteredStaff.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => insertMention(s)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer group transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#8ec32f]/20 flex items-center justify-center text-[#8ec32f] font-bold text-xs group-hover:scale-110 transition-transform">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  ref={descRef}
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your idea in detail. Use **bold**, _italic_, - lists, or @mention a colleague."
                  className="w-full p-4 text-sm bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-y min-h-[200px] rounded-t-xl"
                  required
                />

                {/* Formatting Toolbar */}
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
                  <div className="flex gap-1 text-gray-500 dark:text-gray-400">
                    <button
                      type="button"
                      onClick={handleBold}
                      title="Bold (**text**)"
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleItalic}
                      title="Italic (_text_)"
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Italic size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleLink}
                      title="Insert link"
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Link2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleList}
                      title="Bullet list"
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <List size={15} />
                    </button>
                    {/* @ mention button */}
                    <button
                      type="button"
                      onClick={handleAtMention}
                      title="Mention someone"
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-[#8ec32f] transition-colors font-bold text-[15px] leading-none"
                    >
                      @
                    </button>
                    {/* Attachment */}
                    <label
                      title="Attach file"
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Paperclip size={15} />
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                    Markdown + @mentions
                  </span>
                </div>
              </div>

              {/* Attached files */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[12px] font-bold text-gray-700 dark:text-gray-300">
                    Attachments ({files.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5"
                      >
                        <span className="text-[12px] text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                          {file.name}
                        </span>
                        <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit / Cancel */}
            {/* Submit/Cancel Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !title || !description}
                className="bg-[#8ec32f] hover:bg-[#7cb028] text-[#1a1b25] px-8 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#1a1b25] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  initialData ? 'Save Changes' : 'Submit Idea'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ── Tips sidebar ── */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={18} className="text-[#8ec32f]" />
              <h3 className="font-bold text-gray-900 dark:text-white text-[14px]">Tips for a great idea</h3>
            </div>
            <ul className="space-y-4 mb-6">
              {[
                'Be specific about the problem you want to solve',
                'Explain the potential impact',
                'Consider who would benefit',
                'Keep it concise but complete',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8ec32f] mt-1.5 flex-shrink-0" />
                  <p className="text-[13px] text-gray-600 dark:text-gray-400">{tip}</p>
                </li>
              ))}
            </ul>


          </div>
        </div>
      </div>
      {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
}
