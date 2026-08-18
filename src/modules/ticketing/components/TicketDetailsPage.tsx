import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTicketDetails, updateTicketStatus, addTicketComment } from '../services/ticketing.service';
import { Ticket } from '../types/ticketing.types';
import { ChevronRight, Paperclip, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import CustomModal from '@/component/Message/Message';

const renderWithMentions = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return <span key={i} className="text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/20 px-1 rounded">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await getTicketDetails(id as string);
      setTicket(res);
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to load ticket details' });
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const responseData = await updateTicketStatus(ticket!.id, status);
      setModal({ type: 'success', message: (responseData as any)?.message || `Ticket marked as ${status}` });
      fetchTicket();
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to update status' });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && commentFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dto', JSON.stringify({ content: commentText }));
      commentFiles.forEach(file => formData.append('files', file));

      const responseData = await addTicketComment(ticket!.id, formData);
      setCommentText('');
      setCommentFiles([]);
      setModal({ type: 'success', message: (responseData as any)?.message || 'Comment added' });
      fetchTicket();
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to add comment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticket) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-sans">Loading...</div>;

  return (
    <div className="flex flex-col font-sans max-w-7xl mx-auto w-full p-4 md:p-0">
      {/* Header & Breadcrumbs */}
      <div className="mb-4 md:mb-6">

        {/* Mobile Back Button */}
        <div className="md:hidden flex items-center mb-6 cursor-pointer" onClick={() => router.push('/ticketing')}>
          <div className="flex items-center gap-2 text-[14px] font-bold text-gray-900 dark:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </div>
        </div>

        <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/ticketing" className="hover:text-gray-900 dark:hover:text-gray-200">Ticketing</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-semibold text-gray-900 dark:text-white">{ticket.ticketRef}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 md:mb-0 w-full md:w-auto">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[22px] md:text-3xl font-bold text-gray-900 dark:text-white">{ticket.ticketRef}</h1>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${ticket.status === 'Open' ? 'text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10' :
                  ticket.status === 'In Progress' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
                }`}>
                {ticket.status}
              </span>
            </div>
            <h2 className="text-[17px] md:text-xl font-bold text-[#2A2B3D] dark:text-white mb-1">{ticket.subject}</h2>
            <p className="text-[12px] md:text-sm text-gray-500 dark:text-gray-400">
              Created by <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.creator.firstName} {ticket.creator.lastName}</span> • {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
            </p>
          </div>

          <div className="flex mt-4 md:mt-0 gap-3">
            {ticket.status !== 'In Progress' && ticket.status !== 'Completed' && (
              <button
                onClick={() => handleStatusChange('In Progress')}
                className="px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-transparent rounded-md font-bold text-[13px] transition-colors"
              >
                Mark as in Progress
              </button>
            )}
            {ticket.status !== 'Completed' && (
              <button
                onClick={() => handleStatusChange('Completed')}
                className="px-6 py-2 bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 rounded-md font-bold text-[13px] transition-colors"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="flex-1 space-y-4 md:space-y-6">
          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 transition-colors">
            <h3 className="text-sm md:text-lg font-bold text-[#2A2B3D] dark:text-white mb-3 md:mb-4">Description</h3>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="hidden md:block mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Attachments</h4>
                <div className="flex flex-col gap-2">
                  {ticket.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[#2A2B3D] dark:text-white bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                      <div className="p-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-md">
                        <Paperclip size={16} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Attachment_{i + 1}.pdf</span>
                        <span className="text-xs text-gray-400">1.2 MB • PDF File</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 block md:hidden transition-colors">
            {/* On mobile, Ticket Details go under description */}
            <h3 className="text-sm md:text-lg font-bold text-[#2A2B3D] dark:text-white mb-4">Ticket Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Department</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">{ticket.department?.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Priority</span>
                <span className="font-bold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ticket.priority === 'Urgent' || ticket.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${ticket.priority === 'Urgent' || ticket.priority === 'High' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'}`}>
                    {ticket.priority}
                  </span>
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Created</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">{format(new Date(ticket.updatedAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Assigned HOD</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">{ticket.assignedHod ? `${ticket.assignedHod.firstName} ${ticket.assignedHod.lastName}` : 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 block md:hidden transition-colors">
            <h3 className="text-sm md:text-lg font-bold text-[#2A2B3D] dark:text-white mb-6">Status Tracker</h3>

            <div className="space-y-6">
              <div className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border-[3px] border-yellow-500 flex items-center justify-center bg-white dark:bg-[#141414] z-10">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 absolute top-6 -bottom-6"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-600 dark:text-yellow-500">Open</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(ticket.createdAt), 'dd-MM-yyyy h:mm a')}</p>
                </div>
              </div>

              <div className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  {ticket.status === 'In Progress' || ticket.status === 'Completed' ? (
                    <div className="w-6 h-6 rounded-full border-[3px] border-blue-500 flex items-center justify-center bg-white dark:bg-[#141414] z-10">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-[3px] border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] z-10"></div>
                  )}
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 absolute top-6 -bottom-6"></div>
                </div>
                <div>
                  <p className={`text-sm font-bold ${ticket.status === 'In Progress' || ticket.status === 'Completed' ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>In Progress</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Pending</p>
                </div>
              </div>

              <div className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  {ticket.status === 'Completed' ? (
                    <div className="w-6 h-6 rounded-full border-[3px] border-gray-500 dark:border-gray-400 flex items-center justify-center bg-white dark:bg-[#141414] z-10">
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-[3px] border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] z-10"></div>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-bold ${ticket.status === 'Completed' ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>Completed</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 block md:hidden transition-colors">
              <h3 className="text-sm font-bold text-[#2A2B3D] dark:text-white mb-4">Attachments</h3>
              <div className="flex flex-col gap-2">
                {ticket.attachments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[#2A2B3D] dark:text-white bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <div className="p-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-md text-gray-600 dark:text-gray-400">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px]">supplies_list.pdf</span>
                      <span className="text-xs text-gray-400">1.2 MB • PDF File</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 transition-colors">
            <h3 className="text-sm md:text-lg font-bold text-[#2A2B3D] dark:text-white mb-6">Activity & Comments</h3>

            <div className="space-y-6 mb-8 border-l-2 border-gray-100 dark:border-gray-800 pl-4 md:pl-2 ml-2 md:ml-0">
              {ticket.activities?.map((activity) => (
                <div key={activity.id} className="relative pl-6">
                  <div className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-[#141414] ${activity.isSystemActivity ? 'bg-[#8ec32f]' : 'bg-blue-500'}`}></div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {activity.isSystemActivity ? (
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{activity.content}</span>
                    ) : (
                      <>
                        <span className="font-bold text-gray-900 dark:text-white">{activity.author?.firstName} {activity.author?.lastName}</span>
                        <span className="text-gray-600 dark:text-gray-400"> commented: "{renderWithMentions(activity.content)}"</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {format(new Date(activity.createdAt), 'MMM d, yyyy, h:mm a')}
                  </div>
                  {activity.attachments && activity.attachments.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {activity.attachments.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                          <Paperclip size={12} /> File
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment or internal note... (Use @ to mention someone)"
                className="w-full text-sm p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#8ec32f] resize-none mb-4 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                rows={2}
              />
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">Add Attachment</div>
                  <input
                    type="file"
                    id="comment-file"
                    multiple
                    className="hidden"
                    onChange={e => e.target.files && setCommentFiles(Array.from(e.target.files))}
                  />
                  <label htmlFor="comment-file" className="cursor-pointer inline-flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Paperclip size={14} className="text-blue-500 -rotate-45" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {commentFiles.length > 0 ? `${commentFiles.length} files` : 'Upload File'}
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || (!commentText && commentFiles.length === 0)}
                  className="bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 px-5 py-1.5 rounded-md text-[13px] font-bold disabled:opacity-50 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (Desktop Only) */}
        {/* Right Column (Desktop Only) */}
        <div className="hidden md:block w-full lg:w-80 space-y-6">
          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Ticket Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Department</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">{ticket.department?.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Priority</span>
                <span className="font-bold flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${ticket.priority === 'Urgent' || ticket.priority === 'High' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'}`}>
                    {ticket.priority}
                  </span>
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Created</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">{format(new Date(ticket.updatedAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Assigned HOD</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">{ticket.assignedHod ? `${ticket.assignedHod.firstName} ${ticket.assignedHod.lastName}` : 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Status Tracker</h3>

            <div className="space-y-6">
              <div className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border-[3px] border-yellow-500 flex items-center justify-center bg-white dark:bg-[#141414] z-10">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 absolute top-6 -bottom-6"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-600 dark:text-yellow-500">Open</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(ticket.createdAt), 'dd-MM-yyyy h:mm a')}</p>
                </div>
              </div>

              <div className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  {ticket.status === 'In Progress' || ticket.status === 'Completed' ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white z-10">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-[3px] border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] z-10"></div>
                  )}
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 absolute top-6 -bottom-6"></div>
                </div>
                <div>
                  <p className={`text-sm font-bold ${ticket.status === 'In Progress' || ticket.status === 'Completed' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>In Progress</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.status === 'In Progress' || ticket.status === 'Completed' ? 'Updated' : 'Pending'}</p>
                </div>
              </div>

              <div className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  {ticket.status === 'Completed' ? (
                    <div className="w-6 h-6 rounded-full bg-[#8ec32f] flex items-center justify-center text-[#1a1b25] z-10">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-[3px] border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] z-10"></div>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-bold ${ticket.status === 'Completed' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>Completed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.status === 'Completed' ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Tasks */}
          {ticket.linkedTask && (
            <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Linked Tasks</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded-[4px] ${ticket.linkedTask.status === 'Completed' || ticket.linkedTask.status === 'Passed_Test' ? 'bg-[#8ec32f]' : 'border-2 border-gray-300 dark:border-gray-600'} flex items-center justify-center flex-shrink-0`}>
                    {(ticket.linkedTask.status === 'Completed' || ticket.linkedTask.status === 'Passed_Test') && <CheckCircle2 size={14} className="text-[#1a1b25]" />}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ticket.linkedTask.title}</span>
                </label>
              </div>
            </div>
          )}

          {/* Linked Project */}
          {ticket.linkedProject && (
            <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Linked Project</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Project</span>
                <span className="px-3 py-1 rounded-md text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#1a1a1a]">{ticket.linkedProject.projectName || ticket.linkedProject.title}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
}
