import React, { useState, useEffect } from 'react';
import { getTickets, getTicketStats } from '../services/ticketing.service';
import { Ticket, TicketStats, PaginatedTickets } from '../types/ticketing.types';
import TicketTable from './TicketTable';
import CreateTicketModal from './CreateTicketModal';
import EditTicketModal from './EditTicketModal';
import { Search, Calendar, Clock, RefreshCw, Check, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TicketingDashboard() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [paginatedTickets, setPaginatedTickets] = useState<PaginatedTickets | null>(null);
  const [isHod, setIsHod] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priority, setPriority] = useState<string>('');

  const [pageNum, setPageNum] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [staffName, setStaffName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    try {
      const statsData = await getTicketStats();
      setStats(statsData);

      let params: Record<string, any> = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        staffName: staffName || undefined,
      };

      if (activeTab === 'received') {
        params.receivedPageNum = pageNum;
        params.receivedPageSize = 10;
        params.receivedSearch = search;
        if (priority) params.receivedPriority = priority;
      } else if (activeTab === 'my') {
        params.myPageNum = pageNum;
        params.myPageSize = 10;
        params.mySearch = search;
        if (priority) params.myPriority = priority;
      } else {
        params.allPageNum = pageNum;
        params.allPageSize = 10;
        params.allSearch = search;
        if (priority) params.allPriority = priority;
      }

      const res = await getTickets(params);
      setIsHod(res.isHod);
      setCurrentUserId(res.currentUserId);

      if (activeTab === 'received') setPaginatedTickets(res.receivedTickets);
      else if (activeTab === 'my') setPaginatedTickets(res.myTickets);
      else setPaginatedTickets(res.allTickets);
    } catch (error) {
      console.error('Error fetching tickets', error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab, pageNum, search, priority, startDate, endDate, staffName]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPageNum(1);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value === 'All' ? '' : e.target.value);
    setPageNum(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setPriority('');
    setStartDate('');
    setEndDate('');
    setStaffName('');
    setPageNum(1);
  };

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="flex justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 dark:text-white mb-1">
              {activeTab === 'received' ? 'Received Tickets' : activeTab === 'my' ? 'My Tickets' : 'All Tickets'}
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              {activeTab === 'received' ? 'Tickets submitted to your department' : activeTab === 'my' ? 'Tickets created by you' : 'Track and manage all company tickets'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-bold text-[13px] flex items-center gap-1.5 md:gap-2 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span className="hidden md:inline">Create Ticket</span>
          <span className="md:hidden">New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Total Tickets */}
        <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start justify-between bg-white dark:bg-[#141414]">
          <div>
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1">Total Tickets</p>
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.total || 0}</h2>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
            <Calendar size={18} className="text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        {/* Open Tickets */}
        <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start justify-between bg-white dark:bg-[#141414]">
          <div>
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1">Open</p>
            <h2 className="text-3xl font-bold text-orange-500 dark:text-orange-400">{stats?.open || 0}</h2>
          </div>
          <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
            <Clock size={18} className="text-orange-500 dark:text-orange-400" />
          </div>
        </div>

        {/* In Progress */}
        <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start justify-between bg-white dark:bg-[#141414]">
          <div>
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1">In Progress</p>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats?.inProgress || 0}</h2>
          </div>
          <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        {/* Completed */}
        <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start justify-between bg-white dark:bg-[#141414]">
          <div>
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1">Completed</p>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.completed || 0}</h2>
          </div>
          <div className="p-2.5 bg-green-50 dark:bg-green-500/10 rounded-xl">
            <Check size={18} className="text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
        {/* Tabs */}
        <div className="flex space-x-2 text-[13px] font-medium overflow-x-auto pb-1 scrollbar-hide w-full max-w-full md:w-auto">
          <button
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${statusFilter === 'All' && activeTab === 'all' ? 'bg-[#8ec32f] text-gray-900 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-transparent'}`}
            onClick={() => { setStatusFilter('All'); setActiveTab('all'); setPageNum(1); }}
          >
            All Tickets ({stats?.total || 0})
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'my' ? 'bg-[#8ec32f] text-gray-900 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-transparent'}`}
            onClick={() => { setActiveTab('my'); setStatusFilter('All'); setPageNum(1); }}
          >
            My Tickets
          </button>

          {/* Conditional Tabs based on Role or Received Tickets */}
          {(isHod || activeTab === 'received') && (
            <button
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'received' ? 'bg-[#8ec32f] text-gray-900 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-transparent'}`}
              onClick={() => { setActiveTab('received'); setStatusFilter('All'); setPageNum(1); }}
            >
              Received / Assigned Tickets
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          {/* General Search */}
          <div className="relative flex-1 min-w-[200px] md:w-[240px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search subject, ref..."
              value={search}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-[#8ec32f] w-full bg-white dark:bg-[#141414] text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter by Logged Staff Name */}
          {/* <div className="relative min-w-[170px] md:w-[190px]">
            <input
              type="text"
              placeholder="Filter by staff name..."
              value={staffName}
              onChange={(e) => { setStaffName(e.target.value); setPageNum(1); }}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-[#8ec32f] w-full bg-white dark:bg-[#141414] text-gray-900 dark:text-white"
            />
          </div> */}

          {/* Date Range: Start */}
          {/* <div className="flex items-center gap-1.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-400">From:</span>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPageNum(1); }}
              className="bg-transparent text-gray-900 dark:text-white focus:outline-none text-xs"
            />
          </div> */}

          {/* Date Range: End */}
          {/* <div className="flex items-center gap-1.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-400">To:</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPageNum(1); }}
              className="bg-transparent text-gray-900 dark:text-white focus:outline-none text-xs"
            />
          </div> */}

          {/* Priority Select */}
          <div className="relative shrink-0 w-[110px] md:w-auto">
            <select
              value={priority || 'All'}
              onChange={handlePriorityChange}
              className="appearance-none bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 pl-3 md:pl-4 pr-8 md:pr-10 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#8ec32f] w-full"
            >
              <option value="All">All Priority</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 md:px-3 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

          {/* Clear Filters Button */}
          {/* {(search || staffName || startDate || endDate || priority) && (
            <button
              onClick={handleClearFilters}
              title="Reset all filters"
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <RefreshCw size={12} /> Clear
            </button>
          )} */}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <TicketTable
          tickets={paginatedTickets?.data || []}
          statusFilter={statusFilter}
          fetchTickets={fetchTickets}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onEditTicket={(ticket) => setTicketToEdit(ticket)}
          currentUserId={currentUserId}
        />
      </div>

      {paginatedTickets && paginatedTickets.totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-gray-500 gap-4 w-full">
          <p className="text-center md:text-left w-full md:w-auto">
            Showing {(pageNum - 1) * paginatedTickets.pageSize + 1} to {Math.min(pageNum * paginatedTickets.pageSize, paginatedTickets.total)} of {paginatedTickets.total} entries
          </p>
          <div className="flex space-x-2">
            <button
              disabled={pageNum === 1}
              onClick={() => setPageNum(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pageNum === paginatedTickets.totalPages}
              onClick={() => setPageNum(prev => Math.min(paginatedTickets.totalPages, prev + 1))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTickets}
      />

      <EditTicketModal
        isOpen={!!ticketToEdit}
        onClose={() => setTicketToEdit(null)}
        onSuccess={fetchTickets}
        ticket={ticketToEdit}
      />
    </div>
  );
}
