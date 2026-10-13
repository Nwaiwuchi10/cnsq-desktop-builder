import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getTicketDetails,
  updateTicketStatus,
  addTicketComment,
  assignTicket,
  updateAssignmentStatus,
  setResolutionDate,
} from '../services/ticketing.service';
import { Ticket, AssignmentStatus, TicketAssignment } from '../types/ticketing.types';
import {
  ChevronRight,
  Paperclip,
  CheckCircle2,
  UserPlus,
  Calendar,
  Clock,
  Link2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Users,
  Send,
  Loader2,
  X,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import CustomModal from '@/component/Message/Message';
import Api from '@/utils/api';

const renderWithMentions = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/20 px-1 rounded">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const isVideoUrl = (url: string) => {
  return /\.(mp4|webm|ogg|mov|mkv)(\?.*)?$/i.test(url);
};

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [ticket, setTicket] = useState<(Ticket & { isHod?: boolean; currentUserId?: number }) | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Re-assignment modal state
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [departmentStaff, setDepartmentStaff] = useState<any[]>([]);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [reassignResolutionDate, setReassignResolutionDate] = useState('');
  const [reassignNotes, setReassignNotes] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [submittingReassign, setSubmittingReassign] = useState(false);

  const filteredStaff = useMemo(() => {
    if (!staffSearchQuery.trim()) return departmentStaff;
    const q = staffSearchQuery.trim().toLowerCase();
    return departmentStaff.filter((staff) => {
      const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.toLowerCase();
      const email = (staff.email || '').toLowerCase();
      const jobTitle = Array.isArray(staff.employment?.jobTitle)
        ? staff.employment.jobTitle.join(' ').toLowerCase()
        : (staff.employment?.jobTitle || '').toLowerCase();
      return fullName.includes(q) || email.includes(q) || jobTitle.includes(q);
    });
  }, [departmentStaff, staffSearchQuery]);

  // Edit Resolution Date state
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [newResolutionDate, setNewResolutionDate] = useState('');
  const [submittingDate, setSubmittingDate] = useState(false);

  // Current user's assignment room state
  const [myStatus, setMyStatus] = useState<string>('Pending');
  const [myNotes, setMyNotes] = useState('');
  const [submittingMyStatus, setSubmittingMyStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await getTicketDetails(id as string);
      setTicket(res as any);
      if (res.resolutionDate) {
        try {
          const d = new Date(res.resolutionDate);
          setNewResolutionDate(format(d, 'yyyy-MM-dd'));
        } catch {
          setNewResolutionDate('');
        }
      }
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to load ticket details' });
    }
  };

  const currentUserId = ticket?.currentUserId || (typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null);
  const isHod = Boolean(ticket?.isHod);

  // Find assignment for current user
  const myAssignment: TicketAssignment | undefined = ticket?.assignments?.find(
    (a) => a.staffId === currentUserId
  );

  useEffect(() => {
    if (myAssignment) {
      setMyStatus(myAssignment.status);
      setMyNotes(myAssignment.staffNotes || '');
    }
  }, [myAssignment?.id, myAssignment?.status, myAssignment?.staffNotes]);

  // Status update in-flight state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (status: string) => {
    if (isUpdatingStatus || ticket?.status === status) return;
    setIsUpdatingStatus(true);
    try {
      const responseData = await updateTicketStatus(ticket!.id, status);
      setModal({ type: 'success', message: (responseData as any)?.message || `Ticket marked as ${status}` });
      fetchTicket();
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to update status' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && commentFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dto', JSON.stringify({ content: commentText }));
      commentFiles.forEach((file) => formData.append('files', file));

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

  const openReassignModal = async () => {
    if (!ticket?.department?.name) return;
    setIsReassignOpen(true);
    setLoadingStaff(true);
    setStaffSearchQuery('');
    setSelectedStaffIds(ticket.assignments?.map((a) => a.staffId) || []);
    if (ticket.resolutionDate) {
      try {
        setReassignResolutionDate(format(new Date(ticket.resolutionDate), 'yyyy-MM-dd'));
      } catch {
        setReassignResolutionDate('');
      }
    } else {
      setReassignResolutionDate('');
    }
    try {
      const res = await Api.get(
        `/staff-register/all/staffs/by-department?name=${encodeURIComponent(ticket.department.name)}`
      );
      setDepartmentStaff(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load department staff', err);
      setDepartmentStaff([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaffIds.length === 0) {
      setModal({ type: 'error', message: 'Please select at least one staff member.' });
      return;
    }

    setSubmittingReassign(true);
    try {
      await assignTicket(ticket!.id, {
        staffIds: selectedStaffIds,
        resolutionDate: reassignResolutionDate || undefined,
        notes: reassignNotes.trim() || undefined,
      });
      setModal({ type: 'success', message: 'Ticket successfully reassigned. Email & push alerts dispatched to staff.' });
      setIsReassignOpen(false);
      setReassignNotes('');
      fetchTicket();
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to reassign ticket' });
    } finally {
      setSubmittingReassign(false);
    }
  };

  const handleUpdateMyStatus = async () => {
    if (!myAssignment) return;
    setSubmittingMyStatus(true);
    try {
      await updateAssignmentStatus(myAssignment.id, {
        status: myStatus,
        staffNotes: myNotes.trim() || undefined,
      });
      setModal({
        type: 'success',
        message: `Your status has been updated to "${myStatus}". The HOD has been notified via email & dashboard.`,
      });
      fetchTicket();
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to update assignment status' });
    } finally {
      setSubmittingMyStatus(false);
    }
  };

  const handleSaveResolutionDate = async () => {
    if (!newResolutionDate) return;
    setSubmittingDate(true);
    try {
      await setResolutionDate(ticket!.id, newResolutionDate);
      setModal({ type: 'success', message: 'Expected resolution date updated successfully.' });
      setIsDateModalOpen(false);
      fetchTicket();
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to update date' });
    } finally {
      setSubmittingDate(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!ticket) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-sans">Loading...</div>;

  const isOverdue =
    ticket.status !== 'Completed' && ticket.resolutionDate && new Date(ticket.resolutionDate) < new Date();

  const allAssignedCompleted =
    ticket.assignments &&
    ticket.assignments.length > 0 &&
    ticket.assignments.every((a) => a.status === AssignmentStatus.COMPLETED);

  return (
    <div className="flex flex-col font-sans max-w-7xl mx-auto w-full p-4 md:p-0">
      {/* Header & Breadcrumbs */}
      <div className="mb-4 md:mb-6">
        {/* Mobile Back Button */}
        <div className="md:hidden flex items-center mb-6 cursor-pointer" onClick={() => router.push('/ticketing')}>
          <div className="flex items-center gap-2 text-[14px] font-bold text-gray-900 dark:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </div>
        </div>

        <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/ticketing" className="hover:text-gray-900 dark:hover:text-gray-200">
            Ticketing
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-semibold text-gray-900 dark:text-white">{ticket.ticketRef}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 md:mb-0 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-[22px] md:text-3xl font-bold text-gray-900 dark:text-white">{ticket.ticketRef}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  ticket.status === 'Open'
                    ? 'text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10'
                    : ticket.status === 'In Progress'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                    : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
                }`}
              >
                {ticket.status}
              </span>

              {isOverdue && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 flex items-center gap-1">
                  <AlertCircle size={12} /> Overdue
                </span>
              )}

              {/* Copy Ticket Link Button */}
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Copy shareable link to this ticket"
              >
                {copiedLink ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                {copiedLink ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
            <h2 className="text-[17px] md:text-xl font-bold text-[#2A2B3D] dark:text-white mb-1">{ticket.subject}</h2>
            <p className="text-[12px] md:text-sm text-gray-500 dark:text-gray-400">
              Created by{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {ticket.creator?.firstName} {ticket.creator?.lastName}
              </span>{' '}
              • {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap mt-4 md:mt-0 gap-2.5">
            {/* HOD Reassign Button */}
            {isHod && (
              <button
                onClick={openReassignModal}
                className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 bg-white dark:bg-transparent rounded-md font-bold text-[13px] flex items-center gap-1.5 transition-colors"
              >
                <UserPlus size={15} className="text-[#8ec32f]" /> Reassign Staff
              </button>
            )}

            {ticket.status !== 'In Progress' && ticket.status !== 'Completed' && (
              <button
                onClick={() => handleStatusChange('In Progress')}
                disabled={isUpdatingStatus}
                className="px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-transparent rounded-md font-bold text-[13px] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Mark as in Progress
              </button>
            )}

            {ticket.status !== 'Completed' && (
              <button
                onClick={() => handleStatusChange('Completed')}
                disabled={isUpdatingStatus}
                className="px-6 py-2 bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 rounded-md font-bold text-[13px] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isUpdatingStatus ? <Loader2 size={14} className="animate-spin text-gray-900" /> : null}
                Complete Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {isOverdue && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-900 dark:text-red-300">Attention: Ticket is Past Due</h4>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
              This ticket had an expected resolution date of{' '}
              <span className="font-bold">{format(new Date(ticket.resolutionDate!), 'PPP p')}</span>. It has not been marked as
              completed yet.
            </p>
          </div>
        </div>
      )}

      {/* All Assigned Staff Completed Banner for HOD */}
      {isHod && allAssignedCompleted && ticket.status !== 'Completed' && (
        <div className="mb-6 p-4 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-green-900 dark:text-green-300">All Assigned Staff Have Completed Their Work</h4>
              <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                The staff assigned to this ticket have marked their departmental work as Completed. You can now close and complete this ticket.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStatusChange('Completed')}
            disabled={isUpdatingStatus}
            className="px-4 py-1.5 bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 font-bold text-xs rounded-lg whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {isUpdatingStatus ? <Loader2 size={12} className="animate-spin text-gray-900" /> : null}
            Mark Ticket Completed
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="flex-1 space-y-4 md:space-y-6">
          {/* Reference / Product Link Card */}
          {ticket.link && (
            <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-blue-100 dark:border-blue-950/40 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                  <Link2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Reference / Product Evidence Link</p>
                  <a
                    href={ticket.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                  >
                    {ticket.link}
                  </a>
                </div>
              </div>
              <a
                href={ticket.link}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>Open</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Description Card */}
          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 transition-colors">
            <h3 className="text-sm md:text-lg font-bold text-[#2A2B3D] dark:text-white mb-3 md:mb-4">Description</h3>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            {/* Video Evidence & Attachments Display */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-5">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Attachments & Media Evidence ({ticket.attachments.length})
                </h4>

                <div className="space-y-4">
                  {ticket.attachments.map((url, i) => {
                    const isVideo = isVideoUrl(url);

                    if (isVideo) {
                      return (
                        <div
                          key={i}
                          className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black shadow-sm"
                        >
                          <div className="px-3 py-2 bg-gray-900 flex items-center justify-between text-xs text-gray-300">
                            <span className="font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                              Video Evidence #{i + 1}
                            </span>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                              Open in new tab <ExternalLink size={11} />
                            </a>
                          </div>
                          <video
                            controls
                            preload="metadata"
                            className="w-full max-h-96 bg-black"
                            src={url}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      );
                    }

                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-sm text-[#2A2B3D] dark:text-white bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-[#141414] rounded-md text-gray-500 dark:text-gray-400">
                          <Paperclip size={16} />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold truncate">Attachment #{i + 1}</span>
                          <span className="text-xs text-gray-400">Click to view document</span>
                        </div>
                        <ExternalLink size={14} className="text-gray-400" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Assigned Staff Department Room */}
          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm md:text-lg font-bold text-[#2A2B3D] dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-[#8ec32f]" />
                  Department Assignment Room
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Staff assigned by HOD to resolve this ticket within {ticket.department?.name}
                </p>
              </div>

              {isHod && (
                <button
                  onClick={openReassignModal}
                  className="px-3 py-1.5 bg-[#8ec32f]/15 hover:bg-[#8ec32f]/25 text-[#547517] dark:text-[#8ec32f] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  + Reassign Staff
                </button>
              )}
            </div>

            {ticket.assignments && ticket.assignments.length > 0 ? (
              <div className="space-y-3">
                {ticket.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#8ec32f]/15 text-[#547517] dark:text-[#8ec32f] font-bold flex items-center justify-center text-sm">
                        {assignment.staff?.firstName?.[0] || 'S'}
                        {assignment.staff?.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {assignment.staff?.firstName} {assignment.staff?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {assignment.staff?.employment?.jobTitle?.[0] || 'Department Staff'}
                          {assignment.completedAt && (
                            <span> • Completed {format(new Date(assignment.completedAt), 'MMM d, h:mm a')}</span>
                          )}
                        </div>
                        {assignment.notes && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 flex items-start gap-1.5">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 shrink-0">HOD Note:</span>
                            <span className="italic text-gray-600 dark:text-gray-400">"{assignment.notes}"</span>
                          </div>
                        )}
                        {assignment.staffNotes && (
                          <div className="text-xs text-[#547517] dark:text-[#8ec32f] mt-1 flex items-start gap-1.5">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 shrink-0">Staff Reply:</span>
                            <span className="italic">"{assignment.staffNotes}"</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          assignment.status === 'Completed'
                            ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : assignment.status === 'In Progress'
                            ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">
                No individual staff assigned yet. The ticket is currently handled directly by the HOD.
              </div>
            )}
          </div>

          {/* Assigned Staff Action Room (Active for the logged-in assigned staff) */}
          {myAssignment && (
            <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 transition-colors border-l-4 border-l-[#8ec32f]">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8ec32f]"></span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  My Work & Status Update (Reassigned to You)
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Update your progress status. Marking this completed sends an immediate notification and email report to your HOD.
              </p>

              {/* HOD Instruction Card */}
              {myAssignment.notes && (
                <div className="p-3 bg-gray-50/80 dark:bg-[#1a1a1a] rounded-lg border border-gray-200/80 dark:border-gray-800 text-xs mb-4">
                  <span className="font-bold text-gray-700 dark:text-gray-200 block mb-0.5">
                    HOD Instructions:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "{myAssignment.notes}"
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Your Current Assignment Status
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {['Pending', 'In Progress', 'Completed'].map((s) => {
                      const isActive = myStatus === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setMyStatus(s)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? s === 'Completed'
                                ? 'bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 shadow-sm ring-2 ring-[#8ec32f]/30'
                                : s === 'In Progress'
                                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                                : 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30'
                              : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Progress Note / Reply for HOD (Optional)
                    </label>
                    {myAssignment.staffNotes && (
                      <span className="text-[11px] text-gray-400">
                        Current: &quot;{myAssignment.staffNotes}&quot;
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={myNotes}
                    onChange={(e) => setMyNotes(e.target.value)}
                    placeholder="e.g., Code reviewed, deployed patch to staging..."
                    className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#8ec32f] focus:ring-1 focus:ring-[#8ec32f] transition-all"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleUpdateMyStatus}
                    disabled={submittingMyStatus}
                    className="px-5 py-2.5 bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {submittingMyStatus ? (
                      <Loader2 size={14} className="animate-spin text-gray-900" />
                    ) : (
                      <Send size={14} className="text-gray-900" />
                    )}
                    Update Status & Notify HOD
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity & Comments */}
          <div className="bg-white dark:bg-[#141414] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 transition-colors">
            <h3 className="text-sm md:text-lg font-bold text-[#2A2B3D] dark:text-white mb-6">Activity & Comments</h3>

            <div className="space-y-6 mb-8 border-l-2 border-gray-100 dark:border-gray-800 pl-4 md:pl-2 ml-2 md:ml-0">
              {ticket.activities?.map((activity) => (
                <div key={activity.id} className="relative pl-6">
                  <div
                    className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-[#141414] ${
                      activity.isSystemActivity ? 'bg-[#8ec32f]' : 'bg-blue-500'
                    }`}
                  ></div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {activity.isSystemActivity ? (
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{activity.content}</span>
                    ) : (
                      <>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {activity.author?.firstName} {activity.author?.lastName}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {' '}
                          commented: "{renderWithMentions(activity.content)}"
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {format(new Date(activity.createdAt), 'MMM d, yyyy, h:mm a')}
                  </div>
                  {activity.attachments && activity.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.attachments.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                        >
                          <Paperclip size={12} /> File #{i + 1}
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
                onChange={(e) => setCommentText(e.target.value)}
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
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => e.target.files && setCommentFiles(Array.from(e.target.files))}
                  />
                  <label
                    htmlFor="comment-file"
                    className="cursor-pointer inline-flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Paperclip size={14} className="text-blue-500 -rotate-45" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {commentFiles.length > 0 ? `${commentFiles.length} files` : 'Upload File / Video'}
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || (!commentText && commentFiles.length === 0)}
                  className="bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 px-5 py-1.5 rounded-md text-[13px] font-bold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column / Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
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
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                      ticket.priority === 'Urgent' || ticket.priority === 'High'
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                        : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </span>
              </div>

              {/* Expected Resolution Date with Edit option for HOD */}
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Resolution Due</span>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#2A2B3D] dark:text-white text-xs">
                      {ticket.resolutionDate ? format(new Date(ticket.resolutionDate), 'MMM d, yyyy') : 'Not set'}
                    </span>
                    {isHod && (
                      <button
                        onClick={() => setIsDateModalOpen(true)}
                        className="text-xs text-blue-500 hover:underline font-bold"
                      >
                        (Edit)
                      </button>
                    )}
                  </div>
                  {isOverdue && (
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400">Overdue</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Created</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">
                  {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
                <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">
                  {format(new Date(ticket.updatedAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Department HOD</span>
                <span className="font-bold text-[#2A2B3D] dark:text-white">
                  {ticket.assignedHod ? `${ticket.assignedHod.firstName} ${ticket.assignedHod.lastName}` : 'Unassigned'}
                </span>
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(ticket.createdAt), 'dd-MM-yyyy h:mm a')}
                  </p>
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
                  <p
                    className={`text-sm font-bold ${
                      ticket.status === 'In Progress' || ticket.status === 'Completed'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    In Progress
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ticket.status === 'In Progress' || ticket.status === 'Completed' ? 'Active' : 'Pending'}
                  </p>
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
                  <p
                    className={`text-sm font-bold ${
                      ticket.status === 'Completed' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    Completed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ticket.status === 'Completed' ? 'Finished' : 'Pending'}
                  </p>
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
                  <div
                    className={`w-5 h-5 rounded-[4px] ${
                      ticket.linkedTask.status === 'Completed' || ticket.linkedTask.status === 'Passed_Test'
                        ? 'bg-[#8ec32f]'
                        : 'border-2 border-gray-300 dark:border-gray-600'
                    } flex items-center justify-center flex-shrink-0`}
                  >
                    {(ticket.linkedTask.status === 'Completed' || ticket.linkedTask.status === 'Passed_Test') && (
                      <CheckCircle2 size={14} className="text-[#1a1b25]" />
                    )}
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
                <span className="px-3 py-1 rounded-md text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#1a1a1a]">
                  {ticket.linkedProject.projectName || ticket.linkedProject.title}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reassign Modal */}
      {isReassignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
          <div className="bg-white dark:bg-[#141414] w-full max-w-lg rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus size={18} className="text-[#8ec32f]" />
                Reassign Ticket to Department Staff
              </h3>
              <button
                onClick={() => {
                  setIsReassignOpen(false);
                  setStaffSearchQuery('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Select one or more staff members from <span className="font-bold text-gray-700 dark:text-gray-200">{ticket.department?.name}</span> to work on this ticket.
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              {/* Staff Selection List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Select Staff Member(s)
                  </label>
                  {selectedStaffIds.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#8ec32f]">
                      {selectedStaffIds.length} selected
                    </span>
                  )}
                </div>

                {/* Staff Search Input */}
                <div className="relative mb-2.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search staff by name, email, or role..."
                    className="w-full text-xs pl-8.5 pr-8 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/70 dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#8ec32f] transition-colors"
                  />
                  {staffSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setStaffSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {loadingStaff ? (
                  <div className="flex items-center justify-center py-6 text-xs text-gray-400 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <Loader2 size={16} className="animate-spin mr-2 text-[#8ec32f]" /> Loading department staff...
                  </div>
                ) : departmentStaff.length === 0 ? (
                  <div className="text-xs text-gray-400 py-6 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
                    No staff found for this department.
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div className="text-xs text-gray-400 py-6 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
                    No staff members match &quot;{staffSearchQuery}&quot;
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5">
                    {filteredStaff.map((staff) => {
                      const isChecked = selectedStaffIds.includes(staff.id);
                      return (
                        <label
                          key={staff.id}
                          className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors ${
                            isChecked ? 'bg-[#8ec32f]/10 dark:bg-[#8ec32f]/15 border border-[#8ec32f]/30' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedStaffIds((prev) =>
                                isChecked ? prev.filter((id) => id !== staff.id) : [...prev, staff.id]
                              );
                            }}
                            className="rounded border-gray-300 text-[#8ec32f] focus:ring-[#8ec32f] accent-[#8ec32f] w-4 h-4 cursor-pointer"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {staff.firstName} {staff.lastName}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                              {staff.employment?.jobTitle?.[0] || staff.email}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Expected Resolution Date */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Expected Resolution Date
                  </label>
                  {ticket.resolutionDate && (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Current:{' '}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {format(new Date(ticket.resolutionDate), 'MMM d, yyyy')}
                      </span>
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={reassignResolutionDate}
                  onChange={(e) => setReassignResolutionDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:border-[#8ec32f] transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Instructions / Notes to Assignee (Optional)
                </label>
                <textarea
                  value={reassignNotes}
                  onChange={(e) => setReassignNotes(e.target.value)}
                  placeholder="Specify particular details or tasks for the assignee..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:border-[#8ec32f]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsReassignOpen(false);
                    setStaffSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReassign || selectedStaffIds.length === 0}
                  className="px-5 py-2 bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submittingReassign ? <Loader2 size={14} className="animate-spin text-gray-900" /> : <UserPlus size={14} />}
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resolution Date Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
          <div className="bg-white dark:bg-[#141414] w-full max-w-sm rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-[#8ec32f]" />
              Set Expected Resolution Date
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Set the deadline by which this ticket should be resolved.
            </p>

            <div className="space-y-4">
              <input
                type="date"
                value={newResolutionDate}
                onChange={(e) => setNewResolutionDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:border-[#8ec32f]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResolutionDate}
                  disabled={submittingDate || !newResolutionDate}
                  className="px-4 py-2 bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  {submittingDate ? 'Saving...' : 'Save Date'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
}
