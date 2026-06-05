"use client";
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, XCircle, Download, User, FileText, Edit2, Trash2, Upload, Calendar as CalendarIcon } from 'lucide-react';
import { LeaveRequest, leaveApi } from '../services/leaveApi';
import Api from '@/utils/api';
import CustomModal from '@/component/Message/Message';

const LEAVE_TYPES = [
  'Annual Leave',
  'Sick Leave',
  'Study Leave',
  'Emergency Leave',
  'Paternity Leave',
  'Maternity Leave',
  'Bereavement Leave',
  'Wedding Leave',
  'Vacation Leave',
];

interface StaffMember { id: number; firstName: string; lastName: string; }

interface LeaveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  isSupervisorMode?: boolean;
  onSuccess?: () => void;
}

const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({ isOpen, onClose, request, isSupervisorMode = false, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [messageConfig, setMessageConfig] = useState<{ isOpen: boolean; type: 'success' | 'error'; text: string }>({
    isOpen: false, type: 'success', text: ''
  });
  const [editForm, setEditForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    handoverStaffId: '',
    handoverNotes: '',
    supervisorIds: [] as number[],
  });

  useEffect(() => {
    if (isOpen && request) {
      setEditForm({
        leaveType: request.leaveType || '',
        startDate: request.startDate?.slice(0, 10) || '',
        endDate: request.endDate?.slice(0, 10) || '',
        reason: request.reason || '',
        handoverStaffId: String(request.handoverStaff?.id || ''),
        handoverNotes: request.handoverNotes || '',
        supervisorIds: request.supervisors?.map(s => s.id) || [],
      });
      setIsEditing(false);
      setFile(null);
    }
  }, [isOpen, request]);

  useEffect(() => {
    if (isEditing && staffList.length === 0) {
      Api.get('/staff-register/all/staffs/dept?limit=1000', {
        headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` }
      }).then(res => setStaffList(res.data.data || [])).catch(() => {});
    }
  }, [isEditing]);

  if (!isOpen || !request) return null;

  const isPending = request.status === 'Pending';

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd'; default: return 'th';
    }
  };

  const formatDateWithOrdinal = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year} at ${time}`;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'Pending': return <Clock className="w-4 h-4 mr-1" />;
      case 'Declined': return <XCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.leaveType || !editForm.startDate || !editForm.endDate || !editForm.reason || !editForm.handoverStaffId) {
      setMessageConfig({ isOpen: true, type: 'error', text: 'Please fill all required fields.' });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const payload = {
        leaveType: editForm.leaveType,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        reason: editForm.reason,
        handoverStaffId: parseInt(editForm.handoverStaffId),
        handoverNotes: editForm.handoverNotes,
        supervisorIds: editForm.supervisorIds,
      };
      formData.append('dto', JSON.stringify(payload));
      if (file) formData.append('file', file);
      await leaveApi.updateRequest(request.id, formData);
      setMessageConfig({ isOpen: true, type: 'success', text: 'Leave request updated successfully.' });
    } catch (err: any) {
      setMessageConfig({ isOpen: true, type: 'error', text: err.response?.data?.message || 'Failed to update request.' });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-CA');

  return (
    <>
      {messageConfig.isOpen && (
        <CustomModal
          type={messageConfig.type}
          message={messageConfig.text}
          onClose={() => {
            setMessageConfig({ ...messageConfig, isOpen: false });
            if (messageConfig.type === 'success') {
              onSuccess?.();
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
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Leave Request' : 'Leave Request Details'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {isEditing ? 'Update your leave request information below.' : 'Complete information about this leave request'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {!isEditing ? (
              /* ─── VIEW MODE ─── */
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusStyle(request.status)}`}>
                    {getStatusIcon(request.status)}{request.status}
                  </span>
                  <span className="text-gray-400 font-medium">Request #{request.id.slice(0, 4)}</span>
                </div>

                {/* Staff info in supervisor mode */}
                {isSupervisorMode && request.staff && (
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Requested By</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{request.staff.firstName} {request.staff.lastName}</p>
                  </div>
                )}

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
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDateOnly(request.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">End Date</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDateOnly(request.endDate)}</p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reason for Leave</p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{request.reason}</p>
                </div>

                <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-[#86CD23]" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Handover Person</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">{request.handoverStaff?.firstName} {request.handoverStaff?.lastName}</p>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Handover Notes</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{request.handoverNotes || 'No notes provided.'}</p>
                </div>

                {request.attachedDocument && (
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-[#86CD23]" />
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Attached Document</p>
                    </div>
                    <a href={request.attachedDocument} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 transition-all">
                      <Download className="w-4 h-4" />
                      {request.attachedDocument.split('/').pop()?.slice(-20) || 'document.pdf'}
                    </a>
                  </div>
                )}

                <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Supervisor(s)</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {request.supervisors?.length ? request.supervisors.map(s => `${s.firstName} ${s.lastName}`).join(', ') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Submitted On</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{formatDateWithOrdinal(request.submittedAt)}</p>
                    </div>
                    {request.status !== 'Pending' && (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Reviewed On</p>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{request.reviewedAt ? formatDateWithOrdinal(request.reviewedAt) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Reviewed By</p>
                          <p className="font-bold text-gray-900 dark:text-white">{request.reviewedBy ? `${request.reviewedBy.firstName} ${request.reviewedBy.lastName}` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Review Notes</p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{request.reviewNotes || 'No review notes provided.'}"</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit / Info buttons — only for non-supervisor mode */}
                {!isSupervisorMode && (
                  <div className="flex gap-3 pt-2">
                    {isPending ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#86CD23] hover:bg-[#75b41e] text-white font-bold rounded-xl shadow-md shadow-[#86CD23]/20 transition-all"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Request
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-semibold rounded-xl text-sm cursor-not-allowed">
                        <Edit2 className="w-4 h-4" /> Cannot edit — status is {request.status}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ─── EDIT MODE ─── */
              <form onSubmit={handleUpdate} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
                {/* Leave Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Leave Type <span className="text-red-500">*</span></label>
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all"
                    value={editForm.leaveType}
                    onChange={e => setEditForm({ ...editForm, leaveType: e.target.value })}
                  >
                    <option value="">Select leave type</option>
                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date <span className="text-red-500">*</span></label>
                    <input type="date" min={today}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all"
                      value={editForm.startDate}
                      onChange={e => setEditForm({ ...editForm, startDate: e.target.value, endDate: editForm.endDate < e.target.value ? '' : editForm.endDate })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">End Date <span className="text-red-500">*</span></label>
                    <input type="date" min={editForm.startDate || today}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all"
                      value={editForm.endDate}
                      onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reason <span className="text-red-500">*</span></label>
                  <textarea rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all resize-none"
                    value={editForm.reason}
                    onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                  />
                </div>

                {/* Handover Staff */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Handover Staff <span className="text-red-500">*</span></label>
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all"
                    value={editForm.handoverStaffId}
                    onChange={e => setEditForm({ ...editForm, handoverStaffId: e.target.value })}
                  >
                    <option value="">Select handover person</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </div>

                {/* Handover Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Handover Notes</label>
                  <textarea rows={2}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all resize-none"
                    value={editForm.handoverNotes}
                    onChange={e => setEditForm({ ...editForm, handoverNotes: e.target.value })}
                  />
                </div>

                {/* File */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Replace Document (Optional)</label>
                  <div className="flex items-center gap-3 p-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                    <label className="flex items-center gap-2 px-4 py-2 bg-[#86CD23] text-white rounded-lg cursor-pointer hover:bg-[#75b41e] transition-all text-sm font-bold whitespace-nowrap">
                      <Upload className="w-4 h-4" /> Choose file
                      <input type="file" className="hidden"
                        accept=".doc,.docx,.pdf,image/jpeg,image/png"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <span className="text-sm text-gray-500 truncate">{file ? file.name : 'No file chosen'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-[#86CD23] hover:bg-[#75b41e] text-white font-black rounded-xl shadow-lg shadow-[#86CD23]/20 transition-all disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaveDetailsModal;
