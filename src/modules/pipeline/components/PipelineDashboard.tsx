import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ThumbsUp, MessageSquare, Plus, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPipelineIdeas } from '../services/pipeline.service';
import { PipelineIdea, PaginatedIdeas } from '../types/pipeline.types';
import { format } from 'date-fns';
import Api from '@/utils/api';

const PAGE_SIZE = 10;

export default function PipelineDashboard() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<PaginatedIdeas | null>(null);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [sort, setSort] = useState('Latest');
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  // Reset offset whenever filters change
  useEffect(() => {
    setOffset(0);
  }, [search, departmentId, sort]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    loadIdeas();
  }, [search, departmentId, offset, sort]);

  const fetchDepartments = async () => {
    try {
      const response = await Api.get('/departments');
      setDepartments(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to load departments', error);
    }
  };

  const loadIdeas = async () => {
    setIsLoading(true);
    try {
      const sortParam = sort === 'Most Reactions' ? 'reactions' : 'latest';
      const data = await fetchPipelineIdeas(search, departmentId, PAGE_SIZE, offset, sortParam);
      setIdeas(data);
    } catch (error) {
      console.error('Failed to load ideas', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLOR_PALETTES = [
    { border: 'border-l-[#8ec32f]', bg: 'bg-[#8ec32f]/20', text: 'text-[#6a9321] dark:text-[#8ec32f]' }, // Green
    { border: 'border-l-[#f43f5e]', bg: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400' }, // Rose/Pink
    { border: 'border-l-[#3b82f6]', bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' }, // Blue
    { border: 'border-l-[#f97316]', bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400' }, // Orange
    { border: 'border-l-[#8b5cf6]', bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400' }, // Purple
    { border: 'border-l-[#06b6d4]', bg: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-400' }, // Cyan
    { border: 'border-l-[#14b8a6]', bg: 'bg-teal-100 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-400' }, // Teal
    { border: 'border-l-[#f59e0b]', bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' }, // Amber
  ];

  const getDepartmentColorSet = (id: number | string | undefined) => {
    if (!id) return { border: 'border-l-gray-300 dark:border-l-gray-600', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
    const num = typeof id === 'string' ? parseInt(id, 10) : id;
    const index = (!isNaN(num) ? num : 0) % COLOR_PALETTES.length;
    return COLOR_PALETTES[index];
  };

  const getInitials = (first: string, last: string) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  // Use data directly from server (already sorted)
  const sortedIdeas = ideas?.data ? [...ideas.data] : [];

  // Pagination helpers
  const total = ideas?.total ?? 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  const goToPrev = () => setOffset(Math.max(0, offset - PAGE_SIZE));
  const goToNext = () => setOffset(offset + PAGE_SIZE);

  return (
    <div className="w-full h-full font-sans max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Share ideas, spark conversations, and build the future together.</p>
        </div>
        <button
          onClick={() => router.push('/pipeline/new')}
          className="bg-[#8ec32f] hover:bg-[#7cb028] text-[#1a1b25] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
        >
          <Plus size={16} /> New Idea
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:border-[#8ec32f] bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative w-full md:w-48">
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 pl-4 pr-10 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#8ec32f] font-medium transition-colors"
            >
              <option value="">Department</option>
              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
          <div className="relative w-full md:w-48">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 pl-4 pr-10 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#8ec32f] font-medium transition-colors"
            >
              <option value="Latest">Sort: Latest</option>
              <option value="Most Reactions">Sort: Most Reactions</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading ideas...</div>
        ) : sortedIdeas.length === 0 ? (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl py-12 px-6 shadow-sm flex flex-col items-center justify-center text-center mt-4 transition-colors">
            <div className="w-16 h-16 bg-[#f2fae1] dark:bg-[#8ec32f]/20 rounded-full flex items-center justify-center mb-5">
              <Lightbulb size={28} className="text-[#8ec32f]" strokeWidth={2.5} />
            </div>
            <h3 className="text-[16px] md:text-[17px] font-bold text-gray-900 dark:text-white mb-2 leading-tight">No ideas found</h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6 max-w-[280px]">
              Share an idea with your team or department to spark new conversations.
            </p>
            <button
              onClick={() => router.push('/pipeline/new')}
              className="bg-[#8ec32f] hover:bg-[#7cb028] text-[#1a1b25] w-full md:w-auto md:px-8 py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-xl leading-none">+</span> Create Idea
            </button>
          </div>
        ) : (
          sortedIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => router.push(`/pipeline/${idea.id}`)}
              className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow cursor-pointer flex flex-col"
            >
              <div className={`border-l-[4px] pl-4 mb-4 ${getDepartmentColorSet(idea.department?.id).border}`}>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pr-4">{idea.title}</h2>
                  {idea.department && (
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${getDepartmentColorSet(idea.department.id).bg} ${getDepartmentColorSet(idea.department.id).text}`}>
                      {idea.department.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {idea.description}
                </p>
              </div>

              <div className="flex justify-between items-center mt-auto pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-blue-600">
                    {getInitials(idea.author.firstName, idea.author.lastName)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-gray-900 dark:text-white">{idea.author.firstName} {idea.author.lastName}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{format(new Date(idea.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ThumbsUp size={16} />
                    <span className="text-[13px] font-bold">{idea.reactions?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <MessageSquare size={16} />
                    <span className="text-[13px] font-bold">{idea.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p className="text-center md:text-left">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total} ideas
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span className="px-3 py-2 text-[13px] font-bold text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={goToNext}
              disabled={!hasNext}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
