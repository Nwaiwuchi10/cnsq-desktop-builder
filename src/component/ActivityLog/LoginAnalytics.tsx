"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { LoginStats } from "@/utils/activities";
import { Globe, TrendingUp, ShieldAlert, LogIn, LogOut, Users } from "lucide-react";

interface LoginAnalyticsProps {
  stats: LoginStats | null;
  isLoading: boolean;
}

const COLORS = ["#95D700", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"];

export default function LoginAnalytics({ stats, isLoading }: LoginAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#95D700]"></div>
      </div>
    );
  }

  if (!stats) return null;

  // Transform data for charts
  const trendData = Object.entries(stats.activityTrends).map(([name, value]) => ({
    name,
    count: value,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const deviceData = Object.entries(stats.deviceDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const browserData = Object.entries(stats.browserDistribution).map(([name, value]) => ({
    name,
    count: value,
  }));

  const locationData = Object.entries(stats.locationDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Logins", value: stats.totalLogins, icon: LogIn, color: "#95D700", bg: "bg-[#95D700]/10" },
          { label: "Failed Attempts", value: stats.failedAttempts, icon: ShieldAlert, color: "#EF4444", bg: "bg-red-50 dark:bg-red-950/20" },
          { label: "Total Logouts", value: stats.totalLogouts, icon: LogOut, color: "#3B82F6", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { label: "Total Staff", value: stats.uniqueStaffCount, icon: Users, color: "#8B5CF6", bg: "bg-purple-50 dark:bg-purple-950/20" },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-[#141414] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${item.bg}`} style={{ color: item.color }}>
                <item.icon size={20} />
              </div>
              <div className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-lg">
                STABLE
              </div>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{item.label}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-[#141414] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Velocity</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Volume tracking over the selected period</p>
            </div>
            <TrendingUp size={20} className="text-[#95D700]" />
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#95D700" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#95D700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderRadius: '16px', border: '1px solid #374151', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                  labelStyle={{ color: '#F3F4F6', fontWeight: 'bold' }}
                  itemStyle={{ color: '#95D700', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#95D700" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white dark:bg-[#141414] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Device Fleet</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderRadius: '16px', border: '1px solid #374151', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {deviceData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Browser Stats */}
        <div className="bg-white dark:bg-[#141414] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Browser Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={browserData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2A2A2A" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderRadius: '16px', border: '1px solid #374151', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#95D700" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Insights */}
        <div className="bg-white dark:bg-[#141414] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Geo Distribution</h3>
          <div className="space-y-6">
            {locationData.map((loc, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-[#95D700]" />
                    <span className="font-medium text-gray-600 dark:text-gray-400">{loc.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{loc.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-50 dark:bg-[#1a1a1a] rounded-full overflow-hidden transition-colors">
                  <div
                    className="h-full bg-[#95D700] rounded-full transition-all duration-1000"
                    style={{ width: `${(loc.value / (stats.totalLogins || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {locationData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <Globe size={40} className="mb-2 opacity-10" />
                <p className="text-sm">Regional data pending...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


