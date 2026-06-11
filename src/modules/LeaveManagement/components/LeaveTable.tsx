import React from 'react';
import { Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { LeaveRequest } from '../services/leaveApi';

interface LeaveTableProps {
  data: LeaveRequest[];
  onViewDetails: (request: LeaveRequest) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSupervisorMode?: boolean;
  loading?: boolean;
  // Item 2: supervisor dual-view
  supervisorViewTab?: 'team' | 'my';
  onSupervisorViewTabChange?: (tab: 'team' | 'my') => void;
}

const LeaveTable: React.FC<LeaveTableProps> = ({
  data,
  onViewDetails,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSupervisorMode = false,
  loading = false,
  supervisorViewTab = 'team',
  onSupervisorViewTabChange,
}) => {
  const tabs = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Declined', value: 'Declined' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]';
      case 'Pending':
        return 'bg-[#FFFBEB] text-[#F59E0B] border-[#FEF3C7]';
      case 'Declined':
        return 'bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'Pending':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'Declined':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  // Item 6: determine empty state based on active tab
  const renderEmptyState = () => {
    if (activeTab === 'All') {
      // Full empty state with CTA button
      return (
        <tr>
          <td colSpan={isSupervisorMode ? 8 : 7} className="px-6 py-24 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-center group">
                <p className="text-gray-700 dark:text-gray-300 font-bold text-lg">You do not have a leave history</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Tap the button to Request a Leave</p>
              </div>
              <button
                onClick={() => (window as any).dispatchEvent(new CustomEvent('open-leave-modal'))}
                className="bg-[#86CD23] hover:bg-[#75b41e] text-white px-8 py-3 rounded-lg font-bold shadow-md shadow-[#86CD23]/20 transition-all text-sm mt-2"
              >
                Request Leave
              </button>
            </div>
          </td>
        </tr>
      );
    }

    // Filtered tabs (Pending, Approved, Declined) — simple message
    const messages: Record<string, string> = {
      Pending: 'No pending leave requests found.',
      Approved: 'No approved leave requests found.',
      Declined: 'No declined leave requests found.',
    };

    return (
      <tr>
        <td colSpan={isSupervisorMode ? 8 : 7} className="px-6 py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
              {activeTab === 'Approved' && <CheckCircle className="w-6 h-6 text-gray-400" />}
              {activeTab === 'Pending' && <Clock className="w-6 h-6 text-gray-400" />}
              {activeTab === 'Declined' && <XCircle className="w-6 h-6 text-gray-400" />}
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-base">
              {messages[activeTab] || 'No data found.'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Try switching to a different filter or checking back later.
            </p>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leave Request History</h2>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by staff name, type, or supervisor..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#86CD23] focus:border-[#86CD23] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Item 2: Supervisor dual-view switcher — only shown in supervisor mode */}
      {isSupervisorMode && onSupervisorViewTabChange && (
        <div className="px-6 pb-2 flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onSupervisorViewTabChange('team')}
              className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                supervisorViewTab === 'team'
                  ? 'bg-white dark:bg-[#141414] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Team Requests
            </button>
            <button
              onClick={() => onSupervisorViewTabChange('my')}
              className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                supervisorViewTab === 'my'
                  ? 'bg-white dark:bg-[#141414] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              My Requests
            </button>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {supervisorViewTab === 'team' ? 'Requests assigned to you as supervisor' : 'Your own leave requests'}
          </span>
        </div>
      )}

      <div className="px-6 pb-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-full border border-gray-100 dark:border-gray-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${isActive
                    ? 'bg-[#86CD23] text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
              {isSupervisorMode && supervisorViewTab === 'team' && (
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff</th>
              )}
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supervisor(s)</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={isSupervisorMode && supervisorViewTab === 'team' ? 8 : 7} className="px-6 py-20 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm font-medium">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              renderEmptyState()
            ) : (
              data.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                  {/* Item 2: Only show Staff column in team view */}
                  {isSupervisorMode && supervisorViewTab === 'team' && (
                    <td className="px-6 py-4.5 text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                      {request.staff ? `${request.staff.firstName} ${request.staff.lastName}` : 'N/A'}
                    </td>
                  )}
                  <td className="px-6 py-4.5 text-sm font-bold text-gray-900 dark:text-white">{request.leaveType}</td>
                  <td className="px-6 py-4.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4.5 text-sm text-gray-600 dark:text-gray-400 font-bold">{request.durationDays} days</td>
                  <td className="px-6 py-4.5 text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={request.supervisors?.map(s => `${s.firstName} ${s.lastName}`).join(', ')}>
                    {request.supervisors?.length ? request.supervisors.map(s => `${s.firstName} ${s.lastName}`).join(', ') : 'N/A'}
                  </td>
                  <td className="px-6 py-4.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {new Date(request.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors ${getStatusStyle(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-center">
                    <button
                      onClick={() => onViewDetails(request)}
                      className="cursor-pointer text-[#86CD23] hover:text-[#75b41e] text-sm font-bold transition-all hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveTable;
