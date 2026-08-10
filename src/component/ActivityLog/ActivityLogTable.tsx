"use client";

import React from "react";
import { ActivityLog, formatDate } from "@/utils/activities";
import { Globe, Monitor, Smartphone, User, ShieldCheck, ShieldAlert, Eye } from "lucide-react";

interface ActivityLogTableProps {
  activities: ActivityLog[];
  isLoading?: boolean;
  onViewAnalysis?: (activity: ActivityLog) => void;
}

const getStatusStyles = (status: string) => {
  const isSuccess = status.toLowerCase() === "success";
  return {
    badge: isSuccess
      ? "bg-green-50 text-green-700 border-green-100"
      : "bg-red-50 text-red-700 border-red-100",
    icon: isSuccess ? ShieldCheck : ShieldAlert,
    iconColor: isSuccess ? "text-green-500" : "text-red-500"
  };
};

export default function ActivityLogTable({
  activities,
  isLoading = false,
  onViewAnalysis,
}: ActivityLogTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#95D700]"></div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <User className="text-gray-400" size={32} />
        </div>
        <h3 className="text-gray-900 font-semibold">No records found</h3>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Staff Member
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Action
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Connection
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Location & IP
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Timestamp
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {activities.map((activity) => {
              const status = getStatusStyles(activity.status);
              const StatusIcon = status.icon;

              return (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {activity.staff?.photoUrl ? (
                          <img
                            src={activity.staff.photoUrl}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#95D700]/10 flex items-center justify-center border-2 border-white shadow-sm">
                            <User size={18} className="text-[#95D700]" />
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {activity.staff ? `${activity.staff.firstName} ${activity.staff.lastName}` : "Unknown Staff"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.staff?.employment?.department?.name || activity.staff?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-medium px-2 py-1 rounded-md w-fit ${
                        activity.action === 'Session Timed Out' 
                          ? "bg-amber-50 text-amber-700 border border-amber-100" 
                          : "text-gray-700 bg-gray-100"
                      }`}>
                        {activity.action}
                      </span>
                      {activity.referenceId && (activity.action.startsWith("Read CEO Message") || activity.action.startsWith("Read Announcement")) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewAnalysis) {
                              onViewAnalysis(activity);
                            }
                          }}
                          className="text-[10px] text-[#95D700] font-bold flex items-center gap-1 hover:underline mt-1"
                        >
                          <Eye size={12} />
                          View Analysis
                        </button>
                      )}
                      {activity.sessionDuration && (
                        <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                          Duration: {activity.sessionDuration}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        {activity.deviceType === "Mobile" ? <Smartphone size={14} /> : <Monitor size={14} />}
                        <span>{activity.deviceType}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {activity.browser}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Globe size={14} className="text-[#95D700]" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono tracking-tighter">
                        {activity.ipAddress}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(activity.createdAt)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${status.badge}`}>
                      <StatusIcon size={12} className={status.iconColor} />
                      {activity.status}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (shown only on small screens) */}
      <div className="lg:hidden divide-y divide-gray-100">
        {activities.map((activity) => {
          const status = getStatusStyles(activity.status);
          const StatusIcon = status.icon;

          return (
            <div key={activity.id} className="p-4 bg-white space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#95D700]/10 flex items-center justify-center">
                    <User size={18} className="text-[#95D700]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {activity.staff ? `${activity.staff.firstName} ${activity.staff.lastName}` : "Unknown Staff"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.action}
                      {activity.sessionDuration && (
                        <span className="block mt-0.5 text-[10px] text-gray-400">
                          Duration: {activity.sessionDuration}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${status.badge}`}>
                  {activity.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Connection</p>
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    {activity.deviceType === "Mobile" ? <Smartphone size={12} /> : <Monitor size={12} />}
                    {activity.deviceType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <Globe size={12} className="text-[#95D700]" />
                    {activity.location}
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 border-t border-gray-50 pt-2 flex justify-between uppercase font-bold tracking-widest">
                <span>{activity.ipAddress}</span>
                <span>{formatDate(activity.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


