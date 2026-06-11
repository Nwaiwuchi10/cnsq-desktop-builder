import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Upload } from 'lucide-react';
import Api from '@/utils/api';
import { leaveApi } from '../services/leaveApi';
import CustomModal from '@/component/Message/Message';

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
}

interface RequestLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM = {
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  handoverStaffId: '',
  handoverNotes: '',
  supervisorIds: [] as number[],
};

const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [messageConfig, setMessageConfig] = useState<{ isOpen: boolean, type: 'success' | 'error', text: string }>({
    isOpen: false,
    type: 'success',
    text: ''
  });
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  // Item 9: track auto-added supervisor IDs so they are visually distinguished
  const [autoAddedIds, setAutoAddedIds] = useState<number[]>([]);
  // Store current user's own staff ID so they don't appear in handover/supervisor lists
  const [currentStaffId, setCurrentStaffId] = useState<number | null>(null);

  const leaveTypes = [
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

  const [showNotice, setShowNotice] = useState(true);

  // Item 4: Reset form every time modal opens (isOpen flips to true)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset everything
      setFormData({ ...INITIAL_FORM });
      setFile(null);
      setShowNotice(true);
      setAutoAddedIds([]);
      setCurrentStaffId(null);
      fetchStaffAndPreloadSupervisors();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Item 9: fetch staff list AND current user profile to pre-add default supervisors
  const fetchStaffAndPreloadSupervisors = async () => {
    try {
      const [staffRes, profileRes] = await Promise.allSettled([
        Api.get('/staff-register/all/staffs/dept?limit=1000', {
          headers: { Authorization: `Bearer ${localStorage.getItem("user-token")}` }
        }),
        Api.get('/staff-register/staff/viewProfile', {
          headers: { Authorization: `Bearer ${localStorage.getItem("user-token")}` }
        }),
      ]);

      let allStaff: StaffMember[] = [];
      if (staffRes.status === 'fulfilled') {
        allStaff = staffRes.value.data.data || [];
        setStaffList(allStaff);
      }

      // Try to resolve reporting manager & direct report to staff IDs
      if (profileRes.status === 'fulfilled' && allStaff.length > 0) {
        const profileData = profileRes.value.data;
        // Store current user's ID to exclude them from dropdowns
        if (profileData?.id) {
          setCurrentStaffId(profileData.id);
        }
        const employment = profileData?.employment;
        const preAddedIds: number[] = [];

        const findByName = (name: string): StaffMember | undefined => {
          if (!name) return undefined;
          const parts = name.trim().toLowerCase().split(/\s+/);
          return allStaff.find(s => {
            const first = s.firstName.toLowerCase();
            const last = s.lastName.toLowerCase();
            if (parts.length >= 2) {
              return first === parts[0] && last === parts.slice(1).join(' ');
            }
            return first === parts[0] || last === parts[0];
          });
        };

        if (employment?.reportingManager) {
          const manager = findByName(employment.reportingManager);
          if (manager && !preAddedIds.includes(manager.id)) {
            preAddedIds.push(manager.id);
          }
        }

        if (employment?.directReport) {
          const report = findByName(employment.directReport);
          if (report && !preAddedIds.includes(report.id)) {
            preAddedIds.push(report.id);
          }
        }

        if (preAddedIds.length > 0) {
          setAutoAddedIds(preAddedIds);
          setFormData(prev => ({
            ...prev,
            supervisorIds: preAddedIds,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching staff/profile:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason || !formData.handoverStaffId || formData.supervisorIds.length === 0) {
      setMessageConfig({ isOpen: true, type: 'error', text: 'Please fill all required fields' });
      return;
    }

    if (formData.endDate < formData.startDate) {
      setMessageConfig({ isOpen: true, type: 'error', text: 'End date must be on or after start date' });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      const payload = {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        handoverStaffId: parseInt(formData.handoverStaffId),
        handoverNotes: formData.handoverNotes,
        supervisorIds: formData.supervisorIds,
      };

      data.append('dto', JSON.stringify(payload));
      if (file) {
        data.append('file', file);
      }

      await leaveApi.createRequest(data);
      setMessageConfig({ isOpen: true, type: 'success', text: 'Leave request submitted successfully' });
    } catch (error: any) {
      setMessageConfig({ isOpen: true, type: 'error', text: error.response?.data?.message || 'Failed to submit request' });
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
              onSuccess();
              onClose();
            }
          }}
        />
      )}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 overflow-hidden">
        <div
          className="bg-white dark:bg-[#141414] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl relative flex flex-col animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start shrink-0">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Request Leave of Absence</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submit a leave request with handover details for supervisor approval</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0 ml-4">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">

            {/* Informational Notice */}
            {showNotice && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
                <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-black">!</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Please read before submitting</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                    Once your leave request has been submitted, it <span className="font-bold">cannot be deleted.</span> If you need to cancel or remove it, please contact your HR Administrator or a system admin directly.
                  </p>
                </div>
                <button onClick={() => setShowNotice(false)} className="shrink-0 p-1 rounded-full text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <form id="leave-request-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1 bg-opacity-20 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-[#86CD23]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leave Request Form</h3>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {/* Leave Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Leave Type <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all"
                      value={formData.leaveType}
                      onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    >
                      <option value="">Select leave type</option>
                      {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="date"
                          min={today}
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all appearance-none"
                          value={formData.startDate}
                          onChange={(e) => {
                            const newStartDate = e.target.value;
                            setFormData({
                              ...formData,
                              startDate: newStartDate,
                              endDate: formData.endDate && formData.endDate < newStartDate ? '' : formData.endDate
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">End Date <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="date"
                          min={formData.startDate || today}
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all appearance-none"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reason for Leave <span className="text-red-500">*</span></label>
                    <textarea
                      rows={3}
                      placeholder="Please provide a detailed reason for your leave request..."
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all resize-none"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>

                  {/* Handover Staff */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Handover Staff <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all"
                      value={formData.handoverStaffId}
                      onChange={(e) => setFormData({ ...formData, handoverStaffId: e.target.value })}
                    >
                      <option value="">Select person to handover to</option>
                      {staffList
                        .filter(staff => staff.id !== currentStaffId)
                        .map(staff => (
                          <option key={staff.id} value={staff.id}>{staff.firstName} {staff.lastName}</option>
                        ))}
                    </select>
                  </div>

                  {/* Handover Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Handover Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Provide detailed handover notes to guide the person covering for you..."
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all resize-none"
                      value={formData.handoverNotes}
                      onChange={(e) => setFormData({ ...formData, handoverNotes: e.target.value })}
                    />
                  </div>

                  {/* Attached Document */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attach Document (Optional)</label>
                    <div className="flex items-center gap-3 p-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                      <label className="flex items-center gap-2 px-4 py-2 bg-[#86CD23] text-white rounded-lg cursor-pointer hover:bg-[#75b41e] transition-all text-sm font-bold whitespace-nowrap">
                        <Upload className="w-4 h-4" />
                        Choose file
                        <input
                          type="file"
                          className="hidden"
                          accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <span className="text-sm text-gray-500 truncate">
                        {file ? file.name : 'No Chosen file'}
                      </span>
                    </div>
                  </div>

                  {/* Supervisor Selection — Item 9: with auto-added defaults */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Supervisors <span className="text-red-500">*</span>
                      </label>
                      {autoAddedIds.length > 0 && (
                        <span className="text-[10px] text-[#86CD23] font-bold bg-[#86CD23]/10 px-2 py-0.5 rounded-full">
                          {autoAddedIds.length} auto-added from your profile
                        </span>
                      )}
                    </div>

                    {/* Selected Supervisors Tags */}
                    {formData.supervisorIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.supervisorIds.map(id => {
                          const s = staffList.find(st => st.id === id);
                          const isAutoAdded = autoAddedIds.includes(id);
                          return s ? (
                            <div
                              key={id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                                isAutoAdded
                                  ? 'bg-[#86CD23]/10 border-[#86CD23]/30 dark:bg-[#86CD23]/10 dark:border-[#86CD23]/30'
                                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              {isAutoAdded && (
                                <span className="text-[9px] font-black text-[#86CD23] uppercase tracking-wider">Default</span>
                              )}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {s.firstName} {s.lastName}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, supervisorIds: formData.supervisorIds.filter(sid => sid !== id) });
                                  if (isAutoAdded) setAutoAddedIds(autoAddedIds.filter(aid => aid !== id));
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    <select
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86CD23] transition-all"
                      value=""
                      onChange={(e) => {
                        const id = parseInt(e.target.value);
                        if (id && !formData.supervisorIds.includes(id)) {
                          setFormData({ ...formData, supervisorIds: [...formData.supervisorIds, id] });
                        }
                      }}
                    >
                      <option value="">+ Add additional supervisor</option>
                      {staffList
                        .filter(staff => !formData.supervisorIds.includes(staff.id) && staff.id !== currentStaffId)
                        .map(staff => (
                          <option key={staff.id} value={staff.id}>{staff.firstName} {staff.lastName}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 md:px-8 py-2.5 md:py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="leave-request-form"
              disabled={loading}
              className="px-6 cursor-pointer md:px-8 py-2.5 md:py-3 bg-[#86CD23] hover:bg-[#75b41e] text-white font-black rounded-xl shadow-lg shadow-[#86CD23]/20 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestLeaveModal;
