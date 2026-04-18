import React, { useEffect, useState } from 'react';
import { Activity, Monitor, Smartphone, Globe, ShieldAlert } from 'lucide-react';
import Api from '@/utils/api';
import dayjs from 'dayjs';

interface LogEntry {
  id: string; // Updated to string (UUID)
  action: string;
  deviceType: string;
  browser: string;
  location: string;
  ipAddress: string;
  status: string;
  createdAt: string;
}

export default function ActivityLogTab() {
  const [activities, setActivities] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('user-token');
        const response = await Api.get('/member-activity', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setActivities(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'Mobile') return <Smartphone className="w-[16px] h-[16px] text-gray-500" strokeWidth={1.5} />;
    return <Monitor className="w-[16px] h-[16px] text-gray-500" strokeWidth={1.5} />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden w-full p-20 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#95D700]"></div>
        <p className="text-gray-500 text-sm">Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden w-full">
      <div className="p-4 sm:p-5 md:p-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#ebf7d9] dark:bg-[#25330f] flex items-center justify-center text-[#95D700]">
            <Activity className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5">User Activity</h2>
            <p className="text-[13px] text-gray-400 dark:text-gray-500">Recent login history and account action</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        {error ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-gray-500">
            <ShieldAlert className="w-10 h-10 text-red-400" />
            <p>{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-gray-500">
            <Globe className="w-10 h-10 opacity-20" />
            <p>No activity logs found</p>
          </div>
        ) : (
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-[#f8f9fa] dark:bg-[#1a1a1a]">
              <tr>
                <th className="px-6 py-3.5 text-[12px] font-bold text-[#1f2937] dark:text-gray-300">Action</th>
                <th className="px-6 py-3.5 text-[12px] font-bold text-[#1f2937] dark:text-gray-300">Device</th>
                <th className="px-6 py-3.5 text-[12px] font-bold text-[#1f2937] dark:text-gray-300">Browser</th>
                <th className="px-6 py-3.5 text-[12px] font-bold text-[#1f2937] dark:text-gray-300">Location</th>
                <th className="px-6 py-3.5 text-[12px] font-bold text-[#1f2937] dark:text-gray-300">IP Address</th>
                <th className="px-6 py-3.5 text-[12px] font-bold text-[#1f2937] dark:text-gray-300">Timestamp</th>
                <th className="px-6 py-3.5 text-[12px] font-bold text-[#1f2937] dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#141414]">
              {activities.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors">
                  <td className={`px-6 py-4 text-[13px] ${item.status === 'Failed' ? 'text-[#ef4444]' : 'text-[#4b5563] dark:text-gray-300 font-medium'}`}>
                    {item.action}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[13px] text-[#4b5563] dark:text-gray-300">
                      {getDeviceIcon(item.deviceType)}
                      {item.deviceType}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#4b5563] dark:text-gray-300">{item.browser}</td>
                  <td className="px-6 py-4 text-[13px] text-[#4b5563] dark:text-gray-300">{item.location}</td>
                  <td className="px-6 py-4 text-[13px] text-[#4b5563] dark:text-gray-300 font-mono">{item.ipAddress}</td>
                  <td className="px-6 py-4 text-[13px] text-[#4b5563] dark:text-gray-300">
                    {dayjs(item.createdAt).format('YYYY-MM-DD hh:mm A')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[11px] font-semibold rounded-full ${item.status === 'Success' ? 'bg-[#00c853] text-white' : 'bg-[#e53935] text-white'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

