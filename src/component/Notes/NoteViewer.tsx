import React from "react";
import { format, isToday } from "date-fns";
import { Paperclip, Menu, ArrowLeft, MoreVertical, Pin, Edit2, Trash, CheckSquare, Type, List as ListIcon, Share, Link, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Note } from "@/pages/notes/page";

interface NoteViewerProps {
  activeNote: Note | null;
  isMobileDetail: boolean;
  isDrawerOpen: boolean;
  showMenu: boolean;
  onSetIsMobileDetail: (val: boolean) => void;
  onSetIsDrawerOpen: (val: boolean) => void;
  onSetShowMenu: (val: boolean) => void;
  onSetViewMode: (mode: "read" | "edit") => void;
  onPinNote: (note: Note) => void;
  onDeleteNote: (id: number) => void;
}

export default function NoteViewer({
  activeNote,
  isMobileDetail,
  isDrawerOpen,
  showMenu,
  onSetIsMobileDetail,
  onSetIsDrawerOpen,
  onSetShowMenu,
  onSetViewMode,
  onPinNote,
  onDeleteNote,
}: NoteViewerProps) {
  return (
    <div className={`flex-1 flex-col h-full bg-white dark:bg-[#141414] ${!isMobileDetail ? 'hidden md:flex' : 'flex'}`}>
      {/* Editor Header */}
      <div className="p-4 md:px-8 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md min-h-[73px] sticky top-0 z-10">
        <div className="flex items-center">
          {/* Desktop Drawer Toggle */}
          <div className="hidden md:flex items-center mr-4">
            <button onClick={() => onSetIsDrawerOpen(!isDrawerOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
              {isDrawerOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>

          {/* Mobile Back Button */}
          <div className="md:hidden flex items-center mr-2">
            <button onClick={() => onSetIsMobileDetail(false)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center text-gray-800 dark:text-gray-200">
              <ArrowLeft size={20} className="mr-1" />
              <span className="font-medium text-sm">Notes</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {activeNote && (
            <>
              <div className="flex items-center space-x-1 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm">
                <div className="relative">
                  <button onClick={() => onSetShowMenu(!showMenu)} className="p-2 rounded hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 transition-colors">
                    <MoreVertical size={18} strokeWidth={1.5} />
                  </button>
                  {showMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                      <button onClick={() => onPinNote(activeNote)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center font-medium transition-colors">
                        <Pin size={16} className="mr-3 text-gray-400 dark:text-gray-500" /> {activeNote.isPinned ? "Unpin Note" : "Pin Note"}
                      </button>
                      <button onClick={() => { onSetViewMode('edit'); onSetShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center font-medium transition-colors">
                        <Edit2 size={16} className="mr-3 text-gray-400 dark:text-gray-500" /> Edit Note
                      </button>
                      <button onClick={() => onDeleteNote(activeNote.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center font-medium transition-colors">
                        <Trash size={16} className="mr-3 text-red-400" /> Delete Note
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onSetViewMode('edit')}
                className="md:hidden p-2 bg-[#95D700]/10 text-[#95D700] rounded-lg font-medium text-sm flex items-center"
              >
                <Edit2 size={16} className="mr-1.5" /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 md:p-12 lg:px-20 xl:px-32 flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
            {activeNote?.title || "Untitled Note"}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-12 flex items-center">
            {activeNote ? (
              <>
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md mr-3 text-xs">
                  {isToday(new Date(activeNote.updatedAt)) ? "Today" : format(new Date(activeNote.updatedAt), "MMM d, yyyy")}
                </span>
                <span>{format(new Date(activeNote.updatedAt), "HH:mm a")}</span>
              </>
            ) : (
              "Unsaved Note"
            )}
          </p>

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-loose">
            {activeNote?.content || <span className="text-gray-400 italic">Empty note content...</span>}
          </div>

          {/* Display Reference Link */}
          {activeNote?.link && (
            <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-6">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center tracking-wide uppercase">
                <Link size={16} className="mr-2 text-gray-400" /> Reference Link
              </h4>
              <a href={activeNote.link.startsWith('http') ? activeNote.link : `https://${activeNote.link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-500 hover:underline break-all bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-800/50">
                {activeNote.link}
              </a>
            </div>
          )}

          {/* Display Attachments */}
          {activeNote?.attachments && activeNote.attachments.length > 0 && (
            <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center tracking-wide uppercase">
                <Paperclip size={16} className="mr-2 text-gray-400" /> Attachments
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeNote.attachments.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mr-3 shrink-0 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-105 transition-transform">
                      <Link size={18} className="text-blue-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
