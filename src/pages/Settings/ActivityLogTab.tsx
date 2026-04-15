import React from 'react';
import { Activity, Monitor, Smartphone } from 'lucide-react';

export default function ActivityLogTab() {
  const activities = [
    {
      id: 1,
      action: 'Logged In',
      deviceType: 'Desktop',
      browser: 'Chrome on Windows',
      location: 'Lagos, Nigeria',
      ip: '197.210.x.x',
      timestamp: '2026-04-14 09:23 AM',
      status: 'Success',
    },
    {
      id: 2,
      action: 'Password change',
      deviceType: 'Mobile',
      browser: 'Safari on iOS',
      location: 'Lagos, Nigeria',
      ip: '197.210.x.x',
      timestamp: '2026-04-14 09:23 AM',
      status: 'Success',
    },
    {
      id: 3,
      action: 'Logged In',
      deviceType: 'Desktop',
      browser: 'Chrome on macOS',
      location: 'Lagos, Nigeria',
      ip: '197.210.x.x',
      timestamp: '2026-04-14 09:23 AM',
      status: 'Success',
    },
    {
      id: 4,
      action: 'Profile Updated',
      deviceType: 'Desktop',
      browser: 'Chrome on Windows',
      location: 'Lagos, Nigeria',
      ip: '197.210.x.x',
      timestamp: '2026-04-14 09:23 AM',
      status: 'Success',
    },
    {
      id: 5,
      action: 'Login attempt failed',
      deviceType: 'Mobile',
      browser: 'Chrome on Android',
      location: 'Unknown',
      ip: '197.210.x.x',
      timestamp: '2026-04-14 09:23 AM',
      status: 'Failed',
    },
  ];

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
                <td className={`px-6 py-4 text-[13px] ${item.status === 'Failed' ? 'text-[#ef4444]' : 'text-[#4b5563] dark:text-gray-300'}`}>
                  {item.action}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[13px] text-[#4b5563] dark:text-gray-300">
                    {item.deviceType === 'Desktop' ? <Monitor className="w-[16px] h-[16px] text-gray-500" strokeWidth={1.5} /> : <Smartphone className="w-[16px] h-[16px] text-gray-500" strokeWidth={1.5} />}
                    {item.deviceType}
                  </div>
                </td>
                <td className="px-6 py-4 text-[13px] text-[#4b5563] dark:text-gray-300">{item.browser}</td>
                <td className="px-6 py-4 text-[13px] text-[#4b5563] dark:text-gray-300">{item.location}</td>
                <td className="px-6 py-4 text-[13px] text-[#4b5563] dark:text-gray-300">{item.ip}</td>
                <td className="px-6 py-4 text-[13px] text-[#4b5563] dark:text-gray-300">{item.timestamp}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 text-[11px] font-medium rounded-full ${item.status === 'Success' ? 'bg-[#00c853] text-white' : 'bg-[#e53935] text-white'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
