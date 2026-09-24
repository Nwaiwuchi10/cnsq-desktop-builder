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
    <div className={`flex-1 min-w-0 flex-col h-full bg-white dark:bg-[#141414] ${!isMobileDetail ? 'hidden md:flex' : 'flex'}`}>
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
          
          {/* Action Buttons for Note Details (Switches to Edit Mode) */}
          {activeNote && (
            <div className="flex items-center space-x-1 ml-4 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-[#1a1a1a]">
               <button onClick={() => onSetViewMode('edit')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Checklist">
                  <CheckSquare size={16} />
               </button>
               
               <button onClick={() => onSetViewMode('edit')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 font-serif font-bold text-sm flex items-center justify-center w-8 h-8" title="Format Text">
                  Aa
               </button>

               <button onClick={() => onSetViewMode('edit')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Add Link Inline">
                  <Link size={16} />
               </button>
               
               <button onClick={() => onSetViewMode('edit')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Attach File">
                  <Paperclip size={16} />
               </button>
               
               <button onClick={() => onSetViewMode('edit')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Share Note">
                  <Share size={16} />
               </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {activeNote && (
            <>
               <button onClick={() => onSetViewMode('edit')} className="p-2 bg-gray-100 dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 transition-colors" title="Edit Note">
                 <Edit2 size={18} strokeWidth={1.5} />
               </button>
              <div className="flex items-center space-x-1 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm">
                <div className="relative">
                  <button onClick={() => onSetShowMenu(!showMenu)} className="p-2 rounded hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 transition-colors">
                    <MoreVertical size={18} strokeWidth={1.5} />
                  </button>
                  {showMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                      <button onClick={() => onSetViewMode('edit')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center font-medium transition-colors">
                        <Edit2 size={16} className="mr-3 text-gray-400 dark:text-gray-500" /> Edit Note
                      </button>
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

          <div 
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-loose"
            dangerouslySetInnerHTML={{ __html: activeNote?.content || '<span class="text-gray-400 italic">Empty note content...</span>' }}
          />

          {/* Backward compatibility rendering for existing old notes that had separate attachments/links */}
          {((activeNote?.attachments && activeNote.attachments.length > 0) || (activeNote?.link && activeNote.link.trim() !== '')) && (
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 opacity-70">
              <h5 className="text-xs uppercase font-bold text-gray-500 mb-4 flex items-center">
                Legacy Attached Items
              </h5>
              
              {activeNote?.link && activeNote.link.trim() !== '' && (
                <div className="mb-4">
                  <a href={activeNote.link.startsWith('http') ? activeNote.link : `https://${activeNote.link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-500 hover:underline break-all bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg text-sm border border-blue-100 dark:border-blue-800/50">
                    <Link size={14} className="mr-1.5" /> {activeNote.link}
                  </a>
                </div>
              )}

              {activeNote?.attachments && activeNote.attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeNote.attachments.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-[#1f1f1f] rounded-lg border border-gray-200 dark:border-gray-800 transition-colors group text-sm"
                    >
                      <Paperclip size={14} className="text-gray-400 mr-2 group-hover:text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400 truncate font-medium">{link.split('/').pop()}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Force native list styles inside the viewer area since Tailwind resets them */}
      <style>{`
        .prose ul:not([style*="list-style-type: none"]) { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .prose ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .prose li { display: list-item !important; margin-bottom: 0.25rem; }
        .prose h1, .prose h2, .prose h3 { margin-top: 1rem; margin-bottom: 0.5rem; }
      `}</style>
    </div>
  );
}
