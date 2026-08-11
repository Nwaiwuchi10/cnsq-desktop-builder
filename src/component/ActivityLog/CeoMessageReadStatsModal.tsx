"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, Users, Eye } from "lucide-react";
import { getCeoMessageReadStats, getCeoMessageReaders, CeoMessageReadStats, CeoMessageReader } from "@/utils/ceoMessaging";

interface Props {
  messageId: string;
  title: string;
  onClose: () => void;
}

const CeoMessageReadStatsModal: React.FC<Props> = ({
  messageId,
  title,
  onClose,
}) => {
  const [stats, setStats] = useState<CeoMessageReadStats | null>(null);
  const [readers, setReaders] = useState<CeoMessageReader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, readersData] = await Promise.all([
          getCeoMessageReadStats(messageId),
          getCeoMessageReaders(messageId),
        ]);
        setStats(statsData);
        setReaders(readersData);
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
        <div className="bg-white dark:bg-[#141414] border border-transparent dark:border-gray-800 transition-colors p-8 rounded-3xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#95D700]/20 border-t-[#95D700] rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-[#141414] border border-transparent dark:border-gray-800 transition-colors w-full max-w-4xl rounded-[32px] p-8 relative shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-400 dark:text-gray-500" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[#95D700]/10 rounded-lg text-[#95D700]">
              <Eye size={20} />
            </div>
            <span className="text-[#95D700] font-bold text-xs uppercase tracking-widest">Message Analytics</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Detailed breakdown of staff engagement for this CEO message.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard 
            label="Total Recipients" 
            value={stats?.totalStaff} 
            icon={Users}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-950/20"
          />
          <StatCard 
            label="Staff Read" 
            value={stats?.readCount} 
            icon={CheckCircle}
            color="text-[#95D700]"
            bg="bg-[#95D700]/10"
            percentage={stats?.totalStaff ? Math.round((stats.readCount / stats.totalStaff) * 100) : 0}
          />
          <StatCard 
            label="Unread" 
            value={stats?.unreadCount} 
            icon={X}
            color="text-red-500 dark:text-red-400"
            bg="bg-red-50 dark:bg-red-950/20"
          />
        </div>

        {/* Readers List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            Read by
            <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                {readers.length}
            </span>
          </h3>

          {readers.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No staff has read this message yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readers.map((reader) => (
                <div
                  key={reader.id}
                  className="flex items-center gap-4 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-md hover:border-[#95D700]/30 dark:hover:border-[#95D700]/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-850 flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden">
                    {reader.staff.photoUrl ? (
                      <img
                        src={reader.staff.photoUrl}
                        alt="staff"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#95D700] font-bold text-sm bg-[#95D700]/10">
                        {reader.staff.firstName[0]}{reader.staff.lastName[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {reader.staff.firstName} {reader.staff.lastName}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
                      Read on {new Date(reader.readAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-500 dark:text-green-400">
                    <CheckCircle size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 dark:bg-gray-800 text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-gray-700 transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default CeoMessageReadStatsModal;

/* ---------- Helper Component ---------- */

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
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
            <Icon size={18} />
        </div>
        {percentage !== undefined && (
            <span className="text-[10px] font-black bg-green-50 dark:bg-green-950/25 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                {percentage}%
            </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value ?? 0}</p>
    </div>
  );
};

