import React, { useState } from 'react';
import { X, Download, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { LeaveRequest, leaveApi } from '../services/leaveApi';
import CustomModal from '@/component/Message/Message';

interface LeaveApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  onSuccess: () => void;
  // Item 3: current logged-in user (supervisor)
  currentUser?: { firstName?: string; lastName?: string } | null;
}

const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({ isOpen, onClose, request, onSuccess, currentUser }) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'Approved' | 'Declined' | null>(null);
  const [messageConfig, setMessageConfig] = useState<{isOpen: boolean, type: 'success' | 'error', text: string}>({
    isOpen: false,
    type: 'success',
    text: ''
  });

  if (!isOpen || !request) return null;

  // Item 1: check if the request has already been actioned
  const isAlreadyActioned = request.status === 'Approved' || request.status === 'Declined';

  const handleAction = async (status: 'Approved' | 'Declined') => {
    if (!reviewNotes.trim()) {
      setMessageConfig({ isOpen: true, type: 'error', text: 'Please provide approval notes before proceeding' });
      return;
    }

    setLoading(true);
    setActionType(status);
    try {
      await leaveApi.updateStatus(request.id, status, reviewNotes);
      setMessageConfig({ isOpen: true, type: 'success', text: `Request ${status.toLowerCase()} successfully` });
    } catch (error: any) {
      setMessageConfig({ isOpen: true, type: 'error', text: error.response?.data?.message || 'Failed to update status' });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Declined': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      {messageConfig.isOpen && (
        <CustomModal 
          type={messageConfig.type}
          message={messageConfig.text}
          onClose={() => {
            setMessageConfig({ ...messageConfig, isOpen: false });
            if (messageConfig.type === 'success') {
              onSuccess();
              onClose();
            }
          }}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-[#141414] w-full max-w-xl rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Leave Request Details</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Review the leave request details and provide your decision</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Item 3: Reviewer name + current status banner */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusStyle(request.status)}`}>
              {request.status === 'Approved' && <CheckCircle className="w-4 h-4" />}
              {request.status === 'Declined' && <XCircle className="w-4 h-4" />}
              {request.status}
            </span>
            {currentUser && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <User className="w-3.5 h-3.5" />
                <span>Reviewing as: <span className="font-bold text-gray-700 dark:text-gray-300">{currentUser.firstName} {currentUser.lastName}</span></span>
              </div>
            )}
          </div>

          <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-2 scrollbar-hide">
             {/* Staff Name */}
             <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Staff Name</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{request.staff?.firstName} {request.staff?.lastName}</p>
            </div>

            {/* Leave Type & Duration */}
            <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Leave Type</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{request.leaveType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{request.durationDays} days</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDateOnly(request.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">End Date</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDateOnly(request.endDate)}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reason for Leave</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {request.reason}
              </p>
            </div>

            {/* Handover */}
            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[#86CD23]" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Handover Person</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {request.handoverStaff?.firstName} {request.handoverStaff?.lastName}
              </p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Handover Notes</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {request.handoverNotes || 'No notes provided.'}
              </p>
            </div>

            {/* Document */}
            {request.attachedDocument && (
              <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#86CD23]" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Attached Document</p>
                </div>
                <a 
                  href={request.attachedDocument} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 transition-all"
                >
                  <Download className="w-4 h-4" />
                  {request.attachedDocument.split('/').pop()?.slice(-20) || 'document.pdf'}
                </a>
              </div>
            )}

            {/* If already actioned: show review info + hide action inputs */}
            {isAlreadyActioned ? (
              <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Review Information</p>
                {request.reviewedBy && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Reviewed By</p>
                    <p className="font-bold text-gray-900 dark:text-white">{request.reviewedBy.firstName} {request.reviewedBy.lastName}</p>
                  </div>
                )}
                {request.reviewNotes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Review Notes</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{request.reviewNotes}"</p>
                  </div>
                )}
                {/* Item 1: Visual indicator that this was already acted on */}
                <div className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg font-semibold text-sm ${
                  request.status === 'Approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {request.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  This request has already been {request.status.toLowerCase()}
                </div>
              </div>
            ) : (
              /* Approval Notes — only shown for Pending requests */
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {/* Item 3: Note label clarifies who is approving */}
                  Your Approval Notes <span className="text-red-500">*</span>
                  {currentUser && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      — {currentUser.firstName} {currentUser.lastName}
                    </span>
                  )}
                </label>
                <textarea 
                  rows={4}
                  placeholder="Add any notes or conditions for approval..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all resize-none shadow-sm"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Item 1: Actions — hidden if already approved/declined */}
          {!isAlreadyActioned && (
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => handleAction('Declined')}
                disabled={loading}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-600/20 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {loading && actionType === 'Declined' ? 'Declining...' : 'Decline'}
              </button>
              <button 
                onClick={() => handleAction('Approved')}
                disabled={loading}
                className="flex-1 py-4 bg-[#86CD23] hover:bg-[#75b41e] text-white font-black rounded-xl shadow-lg shadow-[#86CD23]/20 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {loading && actionType === 'Approved' ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default LeaveApprovalModal;
