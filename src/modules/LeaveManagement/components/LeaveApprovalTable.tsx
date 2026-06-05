import React from 'react';
import { Search, ChevronDown, Filter, Loader2 } from 'lucide-react';
import { LeaveRequest } from '../services/leaveApi';

interface LeaveApprovalTableProps {
  data: LeaveRequest[];
  loading?: boolean;
  onViewDetails: (request: LeaveRequest) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const LeaveApprovalTable: React.FC<LeaveApprovalTableProps> = ({
  data,
  loading = false,
  onViewDetails,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Leave Requests</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Leave requests assigned to you awaiting review</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by staff name, type..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#86CD23] focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#86CD23] animate-spin" />
                    <p className="text-gray-400 text-sm">Loading leave requests...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No pending leave requests</p>
                    <p className="text-gray-400 text-sm">
                      {searchQuery ? 'Try a different search term.' : 'You have no requests awaiting your review.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      {request.staff?.photoUrl ? (
                        <img src={request.staff.photoUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#86CD23]/20 flex items-center justify-center text-xs font-bold text-[#86CD23]">
                          {request.staff?.firstName?.charAt(0)}{request.staff?.lastName?.charAt(0)}
                        </div>
                      )}
                      <span>{request.staff?.firstName} {request.staff?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                      {request.leaveType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} –{' '}
                    {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{request.durationDays} days</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(request.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewDetails(request)}
                      className="cursor-pointer text-[#86CD23] hover:text-[#75b41e] text-sm font-bold transition-all hover:underline"
                    >
                      View & Review
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

export default LeaveApprovalTable;
