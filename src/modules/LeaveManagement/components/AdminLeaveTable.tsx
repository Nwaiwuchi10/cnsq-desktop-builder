import React from 'react';
import { Search, ChevronDown, Filter, CheckCircle, Clock, XCircle, MinusCircle } from 'lucide-react';
import { LeaveRequest } from '../services/leaveApi';

interface AdminLeaveTableProps {
  data: LeaveRequest[];
  onViewDetails: (request: LeaveRequest) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AdminLeaveTable: React.FC<AdminLeaveTableProps> = ({ 
  data, 
  onViewDetails, 
  activeTab, 
  setActiveTab,
  searchQuery,
  setSearchQuery
}) => {
  const tabs = ['All', 'Pending', 'Approved', 'Declined', 'Cancelled', 'Completed'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const getDayCount = (count: number) => {
    const tabCounts: {[key: string]: number} = {
        'All': data.length,
        'Pending': data.filter(r => r.status === 'Pending').length,
        'Approved': data.filter(r => r.status === 'Approved').length,
        'Declined': data.filter(r => r.status === 'Declined').length,
        'Cancelled': data.filter(r => r.status === 'Cancelled').length,
        'Completed': data.filter(r => r.status === 'Completed').length,
    }
    return tabCounts;
  };

  const counts = getDayCount(data.length);

  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Staff Leave Requests</h2>
            
            <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                type="text" 
                placeholder="Search by staff name, type, or supervisor..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#86CD23] focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 text-sm cursor-pointer">
                <Filter className="w-4 h-4" />
                <select className="bg-transparent outline-none cursor-pointer">
                <option>All Staff</option>
                </select>
                <ChevronDown className="w-4 h-4" />
            </div>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-[#86CD23] text-white shadow-md shadow-[#86CD23]/20' 
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab} ({counts[tab] || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supervisor</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Requested</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium whitespace-nowrap">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No leave requests found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((request) => (
                <tr 
                    key={request.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                    onClick={() => onViewDetails(request)}
                >
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                    {request.staff?.firstName} {request.staff?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{request.leaveType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {request.supervisors?.[0]?.firstName} {request.supervisors?.[0]?.lastName || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(request.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
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

export default AdminLeaveTable;
