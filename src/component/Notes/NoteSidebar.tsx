import React from "react";
import { format, isToday, isYesterday, isAfter, subDays } from "date-fns";
import { LayoutGrid, List as ListIcon, Pin, Plus, Search } from "lucide-react";
import { Note } from "@/pages/notes/page";

interface NoteSidebarProps {
  notes: Note[];
  activeNote: Note | null;
  isMobileDetail: boolean;
  isDrawerOpen: boolean;
  listStyle: "list" | "grid";
  search: string;
  onSetSearch: (val: string) => void;
  onSetListStyle: (style: "list" | "grid") => void;
  onNewNote: () => void;
  onSelectNote: (note: Note) => void;
}

export default function NoteSidebar({
  notes,
  activeNote,
  isMobileDetail,
  isDrawerOpen,
  listStyle,
  search,
  onSetSearch,
  onSetListStyle,
  onNewNote,
  onSelectNote,
}: NoteSidebarProps) {
  const groupNotes = () => {
    const today: Note[] = [];
    const yesterday: Note[] = [];
    const previous7Days: Note[] = [];
    const older: Note[] = [];

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const filteredNotes = notes.filter(n => 
      (n.title && n.title.toLowerCase().includes(search.toLowerCase())) || 
      (n.content && n.content.toLowerCase().includes(search.toLowerCase()))
    );

    filteredNotes.forEach((note) => {
      const date = new Date(note.createdAt);
      if (isToday(date)) today.push(note);
      else if (isYesterday(date)) yesterday.push(note);
      else if (isAfter(date, sevenDaysAgo)) previous7Days.push(note);
      else older.push(note);
    });

    return { today, yesterday, previous7Days, older };
  };

  const { today, yesterday, previous7Days, older } = groupNotes();

  const renderList = (groupTitle: string, list: Note[], count: number) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {groupTitle}
          </h3>
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
            {count}
          </span>
        </div>
        <div
          className={`space-y-3 ${
            listStyle === "grid" ? "grid grid-cols-2 gap-3 space-y-0" : ""
          }`}
        >
          {list.map((n) => {
            const isActive = activeNote?.id === n.id;
            return (
              <div
                key={n.id}
                onClick={() => onSelectNote(n)}
                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group ${
                  isActive
                    ? "border-[#95D700] bg-white dark:bg-[#1f1f1f] shadow-sm shadow-[#95D700]/10"
                    : "border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#1a1a1a]/60 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-[#95D700] dark:hover:border-[#95D700] hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-[15px] pr-2 flex-1 flex items-center leading-tight">
                    {n.isPinned && (
                      <Pin
                        size={14}
                        className="mr-2 text-[#95D700] fill-[#95D700]/20"
                      />
                    )}
                    <span className="truncate">{n.title || "Untitled Note"}</span>
                  </h4>
                </div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 flex justify-between items-center">
                  <span>
                    {isToday(new Date(n.updatedAt))
                      ? format(new Date(n.updatedAt), "HH:mm")
                      : format(new Date(n.updatedAt), "MMM d")}
                  </span>
                  {/* Optional preview stub or label color indicator */}
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: n.labelColor === "blue" ? "#3b82f6" :
                        n.labelColor === "green" ? "#84cc16" :
                        n.labelColor === "orange" ? "#f97316" :
                        n.labelColor === "purple" ? "#a855f7" :
                        n.labelColor === "red" ? "#ef4444" : "#9ca3af"
                    }}
                  />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`md:w-[360px] lg:w-[400px] w-full border-r border-gray-200 dark:border-gray-800 flex-col bg-[#fafafa] dark:bg-[#111111] z-10 ${
        isMobileDetail ? "hidden md:flex" : "flex"
      } ${!isDrawerOpen ? "md:hidden" : ""}`}
    >
      <div className="p-6 pb-4 border-b border-gray-200/60 dark:border-gray-800/60 flex justify-between items-center sticky top-0 bg-[#fafafa]/90 dark:bg-[#111111]/90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Notes
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewNote}
            className="p-1.5 bg-[#95D700] hover:bg-[#86c000] text-white rounded-lg transition-transform active:scale-95 shadow-sm shadow-[#95D700]/20"
            title="Create New Note"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <div className="flex space-x-1 bg-gray-200/50 dark:bg-[#222] p-1 rounded-lg">
            <button
              onClick={() => onSetListStyle("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                listStyle === "grid"
                  ? "bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onSetListStyle("list")}
              className={`p-1.5 rounded-md transition-colors ${
                listStyle === "list"
                  ? "bg-white dark:bg-[#333] shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-2 border-b border-gray-200/60 dark:border-gray-800/60">
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => onSetSearch(e.target.value)}
          className="w-full bg-gray-100 dark:bg-[#222] border-none rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#95D700] text-gray-900 dark:text-white placeholder-gray-500"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        {renderList("Today", today, today.length)}
        {renderList("Yesterday", yesterday, yesterday.length)}
        {renderList("Previous 7 Days", previous7Days, previous7Days.length)}
        {renderList("Older", older, older.length)}
        
        {(today.length + yesterday.length + previous7Days.length + older.length) === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No notes found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search term or create one</p>
          </div>
        )}
      </div>
    </div>
  );
}
