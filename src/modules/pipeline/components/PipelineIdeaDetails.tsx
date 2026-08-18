import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ThumbsUp, Heart, Flame, Lightbulb, Plus, MessageSquare, Paperclip, X, FileText, Edit, Trash2 } from 'lucide-react';
import { fetchPipelineIdea, reactToIdea, addComment, reactToComment, deletePipelineIdea, updatePipelineIdea } from '../services/pipeline.service';
import { PipelineIdea, PipelineComment, PipelineReaction } from '../types/pipeline.types';
import { format } from 'date-fns';
import api from '@/utils/api';
import EmojiPicker from 'emoji-picker-react';
import CustomModal from '@/component/Message/Message';

export default function PipelineIdeaDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [idea, setIdea] = useState<PipelineIdea | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyFiles, setReplyFiles] = useState<{ [key: string]: File[] }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('userId');
      if (storedId) setCurrentUserId(Number(storedId));
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchIdeaDetails();
    }
    fetchStaffList();
  }, [id]);

  const fetchStaffList = async () => {
    try {
      const res = await api.get('/staff-register/all/staffs/dept?page=1&limit=100');
      setStaffList(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load staff list', err);
    }
  };

  const fetchIdeaDetails = async () => {
    try {
      const data = await fetchPipelineIdea(id as string);
      setIdea(data);
    } catch (error: any) {
      console.error('Error fetching idea details', error);
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to load idea details' });
    } finally { }
  };

  const handleIdeaReaction = async (emoji: string) => {
    try {
      if (!id) return;
      await reactToIdea(id as string, emoji);
      fetchIdeaDetails();
    } catch (error) {
      console.error('Failed to react', error);
    }
  };

  const handleDeleteIdea = async () => {
    try {
      await deletePipelineIdea(id as string);
      setShowDeleteModal(false);
      setModal({ type: 'success', message: 'Idea deleted successfully' });
      setTimeout(() => router.push('/pipeline'), 1500);
    } catch (error: any) {
      setShowDeleteModal(false);
      setModal({ type: 'error', message: error.response?.data?.message || 'Failed to delete idea' });
    }
  };

  const handleCommentReaction = async (commentId: string, emoji: string) => {
    try {
      await reactToComment(commentId, emoji);
      fetchIdeaDetails();
    } catch (err) {
      setModal({ type: 'error', message: 'Failed to react to comment' });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !idea) return;
    try {
      const formData = new FormData();
      formData.append('dto', JSON.stringify({ content: commentText }));
      commentFiles.forEach(file => formData.append('files', file));

      const responseData = await addComment(idea!.id, formData);
      setCommentText('');
      setCommentFiles([]);
      setModal({ type: 'success', message: (responseData as any)?.message || 'Comment added successfully' });
      fetchIdeaDetails();
    } catch (error: any) {
      console.error('Error adding comment', error);
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to add comment' });
    } finally { }
  };

  const handleReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    const text = replyText[parentId];
    const files = replyFiles[parentId] || [];
    if (!text?.trim() || !idea || !replyingTo) return;
    try {
      const formData = new FormData();
      formData.append('dto', JSON.stringify({ content: text, parentCommentId: parentId }));
      files.forEach(file => formData.append('files', file));

      const responseData = await addComment(idea.id, formData); // Add comment handles replies too
      setReplyText({ ...replyText, [parentId]: '' });
      setReplyFiles({ ...replyFiles, [parentId]: [] });
      setReplyingTo(null);
      setModal({ type: 'success', message: (responseData as any)?.message || 'Reply added successfully' });
      fetchIdeaDetails();
    } catch (error: any) {
      console.error('Error replying', error);
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to reply' });
    } finally { }
  };

  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCommentFiles([...commentFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeCommentFile = (index: number) => {
    setCommentFiles(commentFiles.filter((_, i) => i !== index));
  };

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>, parentId: string) => {
    if (e.target.files) {
      const currentFiles = replyFiles[parentId] || [];
      setReplyFiles({ ...replyFiles, [parentId]: [...currentFiles, ...Array.from(e.target.files)] });
    }
  };

  const removeReplyFile = (parentId: string, index: number) => {
    const currentFiles = replyFiles[parentId] || [];
    setReplyFiles({ ...replyFiles, [parentId]: currentFiles.filter((_, i) => i !== index) });
  };

  // Mention parsing (rudimentary)
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbolIndex !== -1) {
      const searchStr = textBeforeCursor.substring(lastAtSymbolIndex + 1);
      if (!searchStr.includes(' ')) {
        setMentionSearch(searchStr.toLowerCase());
        setShowMentions(true);
        setMentionIndex(lastAtSymbolIndex);
      } else {
        // Space might be part of first/last name, but keep it simple for now
        if (searchStr.split(' ').length <= 2) {
          setMentionSearch(searchStr.toLowerCase());
          setShowMentions(true);
        } else {
          setShowMentions(false);
        }
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (staff: any) => {
    if (mentionIndex === -1) return;
    const name = `${staff.firstName} ${staff.lastName}`;
    const before = commentText.substring(0, mentionIndex);
    const after = commentText.substring(textareaRef.current?.selectionStart || commentText.length);
    setCommentText(`${before}@${name} ${after}`);
    setShowMentions(false);
  };

  const getDepartmentColors = (name: string) => {
    const lowerName = name?.toLowerCase() || '';
    if (lowerName.includes('engineering')) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    if (lowerName.includes('people')) return 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400';
    if (lowerName.includes('product')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    if (lowerName.includes('marketing')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@[A-Z][a-z]+\s[A-Z][a-z]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="font-bold text-[#8ec32f] cursor-pointer hover:underline">{part}</span>;
      }
      return part;
    });
  };

  const filteredStaff = staffList.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(mentionSearch)
  ).slice(0, 5);

  if (!idea) return <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading...</div>;

  const topLevelComments = idea.comments?.filter(c => !c.parentComment) || [];

  return (
    <div className="w-full h-full font-sans max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 dark:bg-[#141414]">
      <button 
        onClick={() => router.push('/pipeline')} 
        className="flex items-center gap-2 text-[13px] font-bold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Back to Pipeline
      </button>

      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-8 transition-colors">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          {idea.department ? (
            <span className={`px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[11px] md:text-[12px] font-bold ${getDepartmentColors(idea.department.name)}`}>
              {idea.department.name}
            </span>
          ) : <div></div>}
          <div className="flex items-center gap-3">
            <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">#PIPE-{idea.id.substring(0,6).toUpperCase()}</span>
            {currentUserId === idea.author.id && (
              <div className="flex items-center gap-2">
                <button onClick={() => router.push(`/pipeline/edit/${idea.id}`)} className="text-gray-500 hover:text-blue-500 transition-colors p-1" title="Edit Idea">
                  <Edit size={16} />
                </button>
                <button onClick={() => setShowDeleteModal(true)} className="text-gray-500 hover:text-red-500 transition-colors p-1" title="Delete Idea">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-[22px] md:text-[28px] font-bold text-[#1a1b25] dark:text-white mb-4 md:mb-6 leading-tight">{idea.title}</h1>
        <p className="text-[14px] md:text-[15px] text-[#4A4B57] dark:text-gray-300 mb-8 whitespace-pre-wrap leading-relaxed">{idea.description}</p>

        {idea.attachments && idea.attachments.length > 0 && (
          <div className="mb-8">
            <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Attachments</h4>
            <div className="flex flex-wrap gap-3">
              {idea.attachments.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FileText size={16} className="text-gray-500 dark:text-gray-300" />
                  <span className="text-[13px] text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{url.split('/').pop()}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <hr className="border-gray-100 dark:border-gray-700 mb-6" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] ${idea.author.firstName.startsWith('T') ? 'bg-[#e90b79]' : idea.author.firstName.startsWith('E') ? 'bg-[#1864f9]' : idea.author.firstName.startsWith('N') ? 'bg-[#00a83e]' : 'bg-[#e2690d]'}`}>
              {idea.author.firstName.charAt(0)}{idea.author.lastName.charAt(0)}
            </div>
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-[13px] font-bold text-[#1a1b25] dark:text-white">{idea.author.firstName} {idea.author.lastName}</span>
              <span className="text-[12px] text-gray-500 dark:text-gray-400">· {idea.department?.name || 'Staff'} · {format(new Date(idea.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 md:gap-2">
              <button onClick={() => handleIdeaReaction('👍')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300">
                <span className="text-[14px]">👍</span> {idea.reactions?.filter(r => r.emoji === '👍').length || 0}
              </button>
              <button onClick={() => handleIdeaReaction('❤️')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300">
                <span className="text-[14px]">❤️</span> {idea.reactions?.filter(r => r.emoji === '❤️').length || 0}
              </button>
              <button onClick={() => handleIdeaReaction('🔥')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300">
                <span className="text-[14px]">🔥</span> {idea.reactions?.filter(r => r.emoji === '🔥').length || 0}
              </button>
              <button onClick={() => handleIdeaReaction('💡')} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-300">
                <span className="text-[14px]">💡</span> {idea.reactions?.filter(r => r.emoji === '💡').length || 0}
              </button>
              <div className="relative">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 dark:text-gray-300">
                  <Plus size={14} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-10 left-0 z-50">
                    <EmojiPicker 
                      onEmojiClick={(emojiData) => {
                        handleIdeaReaction(emojiData.emoji);
                        setShowEmojiPicker(false);
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>
            <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap hidden sm:block">{idea.reactions?.length || 0} reactions</span>
          </div>
          <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap block sm:hidden text-right -mt-2">{idea.reactions?.length || 0} reactions</span>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-[18px] md:text-xl font-bold text-[#1a1b25] dark:text-white">Discussion</h2>
        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[11px] font-bold text-[#4A4B57] dark:text-gray-300">{idea.comments?.length || 0} comments</span>
      </div>

      <div className="flex gap-3 md:gap-4 mb-10">
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold bg-[#1fd27e] dark:bg-[#0f7a4e] text-[13px]">
          AO
        </div>
        <div className="flex-1 relative">
          <form onSubmit={handleAddComment} className="relative border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#141414] overflow-hidden focus-within:border-[#8ec32f] focus-within:ring-1 focus-within:ring-[#8ec32f]">
            <textarea 
              ref={textareaRef}
              value={commentText}
              onChange={handleCommentChange}
              placeholder="Share your thoughts or tag someone with @..."
              className="w-full p-4 text-[13px] focus:outline-none min-h-[100px] resize-none bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            {showMentions && filteredStaff.length > 0 && (
              <div className="absolute left-0 bottom-full mb-1 w-64 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                {filteredStaff.map(s => (
                  <div key={s.id} onClick={() => insertMention(s)} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-[13px] font-medium text-gray-900 dark:text-white">
                    {s.firstName} {s.lastName}
                  </div>
                ))}
              </div>
            )}
            
            {commentFiles.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {commentFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
                    <span className="text-[11px] text-gray-600 dark:text-gray-300 truncate max-w-[100px]">{file.name}</span>
                    <button type="button" onClick={() => removeCommentFile(i)} className="text-gray-400 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="px-4 pb-3 flex justify-end">
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="bg-[#8ec32f] hover:bg-[#7cb028] text-[#1a1b25] dark:text-white px-4 md:px-6 py-1.5 md:py-2 rounded-md font-bold text-[13px] disabled:opacity-50 transition-colors"
              >
                Comment
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-8 pl-14">
        {topLevelComments.map(comment => (
          <div key={comment.id} className="relative">
            <div className="absolute -left-14 top-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-pink-500 dark:bg-pink-700 text-sm">
                {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
              </div>
            </div>
            
            <div className="mb-2 flex items-center flex-wrap gap-1.5">
              <span className="font-bold text-[13px] text-[#1a1b25] dark:text-white">{comment.author.firstName} {comment.author.lastName}</span>
              <span className="text-[12px] text-gray-500 dark:text-gray-400">· {format(new Date(comment.createdAt), 'MMM d, yyyy')}</span>
            </div>
            
            <p className="text-[13px] text-[#4A4B57] dark:text-gray-300 leading-relaxed mb-3">
              {renderContentWithMentions(comment.content)}
            </p>

            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {comment.attachments.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <FileText size={14} className="text-gray-500 dark:text-gray-300" />
                    <span className="text-[11px] text-gray-700 dark:text-gray-300 max-w-[120px] truncate">{url.split('/').pop()}</span>
                  </a>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <button onClick={() => handleCommentReaction(comment.id, '👍')} className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 dark:bg-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors">
                <span>👍</span> {comment.reactions?.filter(r => r.emoji === '👍').length || 0}
              </button>
              <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <MessageSquare size={14} /> 
                {idea.comments?.filter(c => c.parentComment?.id === comment.id).length || 0} replies
              </button>
            </div>

            {/* Replies */}
            {idea.comments?.filter(c => c.parentComment?.id === comment.id).length > 0 && (
              <div className="mt-6 space-y-6 border-l-2 border-gray-100 dark:border-gray-800 pl-6 ml-4">
                {idea.comments?.filter(c => c.parentComment?.id === comment.id).map(reply => (
                  <div key={reply.id} className="relative">
                    <div className="absolute -left-12 top-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-blue-500 dark:bg-blue-700 text-xs">
                        {reply.author.firstName.charAt(0)}{reply.author.lastName.charAt(0)}
                      </div>
                    </div>
                    <div className="mb-1 flex items-center flex-wrap gap-1.5">
                      <span className="font-bold text-[12px] text-[#1a1b25] dark:text-white">{reply.author.firstName} {reply.author.lastName}</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">· {format(new Date(reply.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      {renderContentWithMentions(reply.content)}
                    </p>
                    
                    {reply.attachments && reply.attachments.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {reply.attachments.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <FileText size={12} className="text-gray-500 dark:text-gray-300" />
                            <span className="text-[10px] text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{url.split('/').pop()}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-4 border-l-2 border-[#8ec32f] pl-6 ml-4">
                <form onSubmit={(e) => handleReply(e, comment.id)}>
                  <textarea 
                    value={replyText[comment.id] || ''}
                    onChange={(e) => setReplyText({...replyText, [comment.id]: e.target.value})}
                    placeholder="Write a reply..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8ec32f] min-h-[80px] resize-none mb-2 bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />

                  {replyFiles[comment.id] && replyFiles[comment.id].length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {replyFiles[comment.id].map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1">
                          <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate max-w-[80px]">{file.name}</span>
                          <button type="button" onClick={() => removeReplyFile(comment.id, i)} className="text-gray-400 hover:text-red-500">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <label className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                        <Paperclip size={14} />
                        <input type="file" multiple className="hidden" onChange={(e) => handleReplyFileChange(e, comment.id)} />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setReplyingTo(null)} className="px-4 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">Cancel</button>
                      <button type="submit" disabled={!replyText[comment.id]?.trim()} className="bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 dark:text-white px-4 py-1.5 rounded-md font-bold text-xs disabled:opacity-50 transition-colors">Reply</button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
      {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Delete Idea?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you absolutely sure you want to delete this pipeline idea? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2 rounded-lg font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteIdea} className="px-5 py-2 rounded-lg font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
