"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, Users, Eye } from "lucide-react";
import Api from "@/utils/api";

interface Props {
  messageId: string;
  title: string;
  onClose: () => void;
}

interface ReadStats {
  totalStaff: number;
  readCount: number;
  unreadCount: number;
}

interface Reader {
  id: number;
  readAt: string;
  staff: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
  };
}

const CeoMessageReadersModal: React.FC<Props> = ({
  messageId,
  title,
  onClose,
}) => {
  const [stats, setStats] = useState<ReadStats | null>(null);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("user-token");
        const [statsRes, readersRes] = await Promise.all([
          Api.get(`/ceo-messaging-center/read-stats/${messageId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          Api.get(`/ceo-messaging-center/readers/${messageId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setStats(statsRes.data);
        setReaders(readersRes.data);
      } catch (error) {
        console.error("Failed to load CEO message read stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [messageId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#141414] transition-colors p-8 rounded-3xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#86CD23]/20 border-t-[#86CD23] rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-[#141414] transition-colors w-full max-w-4xl rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-400 dark:text-gray-500 sm:w-6 sm:h-6" />
        </button>

        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <div className="p-1.5 bg-[#86CD23]/10 rounded-lg text-[#86CD23]">
              <Eye size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[#86CD23] font-bold text-[10px] sm:text-xs uppercase tracking-widest">Message Analytics</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight truncate pr-8">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Engagement breakdown for this broadcast.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <StatCard 
            label="Total Recipients" 
            value={stats?.totalStaff} 
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard 
            label="Staff Read" 
            value={stats?.readCount} 
            icon={CheckCircle}
            color="text-[#86CD23]"
            bg="bg-[#86CD23]/10"
            percentage={stats?.totalStaff ? Math.round((stats.readCount / stats.totalStaff) * 100) : 0}
          />
          <StatCard 
            label="Unread" 
            value={stats?.unreadCount} 
            icon={X}
            color="text-red-500"
            bg="bg-red-50"
          />
        </div>

        {/* Readers List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2">
            Read by
            <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                {readers.length}
            </span>
          </h3>

          {readers.length === 0 ? (
            <div className="py-8 sm:py-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                No staff has read this message yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {readers.map((reader) => (
                <div
                  key={reader.id}
                  className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 transition-colors rounded-2xl p-3 sm:p-4 hover:shadow-md hover:border-[#86CD23]/40 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden">
                    {reader.staff.photoUrl ? (
                      <img
                        src={reader.staff.photoUrl}
                        alt="staff"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#86CD23] font-bold text-xs sm:text-sm bg-[#86CD23]/10">
                        {reader.staff.firstName[0]}{reader.staff.lastName[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                      {reader.staff.firstName} {reader.staff.lastName}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                      Read on {new Date(reader.readAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500 dark:text-green-400">
                    <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800 transition-colors flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10 text-sm"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default CeoMessageReadersModal;

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  bg,
  percentage
}: {
  label: string;
  value?: number;
  icon: any;
  color: string;
  bg: string;
  percentage?: number;
}) => {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] transition-colors border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1.5 sm:mb-3">
        <div className={`p-1 sm:p-2 rounded-lg sm:rounded-xl ${bg} ${color} dark:bg-opacity-20`}>
            <Icon size={14} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        {percentage !== undefined && (
            <span className="text-[8px] sm:text-[10px] font-black bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-1 sm:px-2 py-0.5 rounded-full">
                {percentage}%
            </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-[8px] sm:text-xs font-bold uppercase tracking-wider truncate">{label}</p>
      <p className="text-base sm:text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5 sm:mt-1">{value ?? 0}</p>
    </div>
  );
};
