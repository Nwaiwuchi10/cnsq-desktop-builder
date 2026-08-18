import React, { useState } from 'react';
import { Ticket } from '../types/ticketing.types';
import { updateTicketStatus } from '../services/ticketing.service';
import { MoreVertical, Check, Eye, Trash2, Clock, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import CustomModal from '@/component/Message/Message';

interface TicketTableProps {
  tickets: Ticket[];
  statusFilter: string;
  fetchTickets: () => void;
  onOpenCreateModal: () => void;
  onEditTicket?: (ticket: Ticket) => void;
  currentUserId?: number | null;
}

export default function TicketTable({ tickets, statusFilter, fetchTickets, onOpenCreateModal, onEditTicket, currentUserId }: TicketTableProps) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredTickets = statusFilter === 'All'
    ? tickets
    : tickets.filter(t => t.status === statusFilter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-blue-600 bg-blue-50';
      case 'Low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-yellow-600 bg-yellow-50';
      case 'In Progress': return 'text-blue-600 bg-blue-50';
      case 'Completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      const responseData = await updateTicketStatus(ticketId, status);
      setModal({ type: 'success', message: (responseData as any)?.message || 'Status updated successfully' });
      setOpenDropdown(null);
      fetchTickets();
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to update status' });
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-400">
              <th className="py-4 font-bold text-black dark:text-white whitespace-nowrap px-4">Ticket ID</th>
              <th className="py-4 font-bold text-black dark:text-white whitespace-nowrap px-4">Subject</th>
              <th className="py-4 font-bold text-black dark:text-white whitespace-nowrap px-4">Department</th>
              <th className="py-4 font-bold text-black dark:text-white whitespace-nowrap px-4">Priority</th>
              <th className="py-4 font-bold text-black dark:text-white whitespace-nowrap px-4">Created</th>
              <th className="py-4 font-bold text-black dark:text-white whitespace-nowrap px-4">Status</th>
              <th className="py-4 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white">{ticket.ticketRef}</td>
                <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300 min-w-[200px]">{ticket.subject}</td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{ticket.department?.name}</td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === ticket.id ? null : ticket.id)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none p-2"
                  >
                    <MoreVertical size={18} />
                  </button>

                  <div className="relative">
                    {openDropdown === ticket.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 py-1">
                        <button
                          onClick={() => router.push(`/ticketing/${ticket.id}`)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye size={14} className="text-gray-400 dark:text-gray-500" /> View
                        </button>
                        {ticket.status !== 'In Progress' && (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'In Progress')}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 cursor-pointer"
                          >
                            <Check size={14} /> In Progress
                          </button>
                        )}
                        {ticket.creator?.id === currentUserId && (
                          <>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                if (onEditTicket) onEditTicket(ticket);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => { setModal({ type: 'success', message: 'Ticket deleted' }); setOpenDropdown(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={7} className="py-20 text-center bg-white dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-14 h-14 bg-[#f2fae1] dark:bg-[#1a2310] rounded-full flex items-center justify-center mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8ec32f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2">You have not created any tickets yet</h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6 max-w-[280px] mx-auto">
                      Tap below to Request assistance or file a department report
                    </p>
                    <button
                      onClick={onOpenCreateModal}
                      className="bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 px-8 py-3 rounded-lg font-bold text-[14px] flex items-center gap-2 transition-colors w-11/12 justify-center max-w-[300px]"
                    >
                      <span className="text-xl leading-none">+</span> Create Ticket
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col space-y-3">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[13px] font-bold text-gray-900 dark:text-white">{ticket.ticketRef}</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1 leading-tight">{ticket.subject}</h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-4">{ticket.department?.name}</p>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="relative">
                  <button onClick={() => setOpenDropdown(openDropdown === ticket.id ? null : ticket.id)} className="hover:text-gray-600 transition-colors p-1">
                    <MoreVertical size={16} />
                  </button>
                  {openDropdown === ticket.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 py-1">
                      <button
                        onClick={() => router.push(`/ticketing/${ticket.id}`)}
                        className="w-full text-left px-4 py-2.5 text-[13px] text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-3 cursor-pointer"
                      >
                        <Eye size={16} className="text-gray-400 dark:text-gray-500" /> View
                      </button>
                      {ticket.status !== 'In Progress' && (
                        <button
                          onClick={() => handleStatusChange(ticket.id, 'In Progress')}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-blue-500 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 cursor-pointer"
                        >
                          <Check size={16} /> In Progress
                        </button>
                      )}
                      {ticket.creator?.id === currentUserId && (
                        <>
                          <button
                            onClick={() => {
                              setOpenDropdown(null);
                              if (onEditTicket) onEditTicket(ticket);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] text-orange-500 dark:text-orange-400 font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-3 cursor-pointer"
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => { setModal({ type: 'success', message: 'Ticket deleted' }); setOpenDropdown(null); }}
                            className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 cursor-pointer"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center mt-4">
            <div className="w-16 h-16 bg-[#f2fae1] dark:bg-[#1a2310] rounded-full flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8ec32f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2 leading-tight">You have not created any tickets yet</h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6 max-w-[280px]">
              Tap below to Request assistance or file a department report
            </p>
            <button
              onClick={onOpenCreateModal}
              className="bg-[#8ec32f] hover:bg-[#7cb028] text-gray-900 w-full py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-xl leading-none">+</span> Create Ticket
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet Menu (Removed in favor of popover) */}
      {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
}
