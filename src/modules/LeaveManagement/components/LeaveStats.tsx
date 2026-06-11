import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  textColor: string;
}

const StatCard: React.FC<StatProps> = ({ label, value, icon: Icon, iconColor, textColor }) => (
  <div className="flex bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 items-center justify-between shadow-sm">
    <div className="flex flex-col">
      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{label}</span>
      <span className={`text-3xl font-bold ${textColor}`}>{value}</span>
    </div>
    <div className={`p-3 rounded-full ${iconColor} bg-opacity-10`}>
      <Icon className={`w-8 h-8 ${iconColor.replace('bg-', 'text-')}`} strokeWidth={1.5} />
    </div>
  </div>
);

interface LeaveStatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    declined: number;
    cancelled: number;
    completed: number;
  };
}

const LeaveStats: React.FC<LeaveStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <StatCard 
        label="Total Requests" 
        value={stats.total} 
        icon={Calendar} 
        iconColor="text-blue-500" 
        textColor="text-gray-900 dark:text-white" 
      />
      <StatCard 
        label="Pending" 
        value={stats.pending} 
        icon={Clock} 
        iconColor="text-orange-500" 
        textColor="text-orange-500" 
      />
      <StatCard 
        label="Approved" 
        value={stats.approved} 
        icon={CheckCircle} 
        iconColor="text-green-500" 
        textColor="text-green-500" 
      />
      <StatCard 
        label="Declined" 
        value={stats.declined} 
        icon={XCircle} 
        iconColor="text-red-500" 
        textColor="text-red-500" 
      />
    </div>
  );
};

export default LeaveStats;
