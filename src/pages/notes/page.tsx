"use client";

import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import Api from "@/utils/api";
import NoteSidebar from "@/component/Notes/NoteSidebar";
import NoteViewer from "@/component/Notes/NoteViewer";
import NoteEditor from "@/component/Notes/NoteEditor";
import CustomModal from "@/component/Message/Message";
import { Loader2 } from "lucide-react";

export interface Note {
  id: number;
  title: string;
  content: string;
  labelColor: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  link?: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labelColor, setLabelColor] = useState("blue");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [link, setLink] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  
  // Custom Modal State
  const [modalData, setModalData] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // UI States
  const [viewMode, setViewMode] = useState<'read' | 'edit'>('read');
  const [isMobileDetail, setIsMobileDetail] = useState(false);
  const [listStyle, setListStyle] = useState<'list' | 'grid'>('list');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchNotes = useCallback(async (append = false) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("user-token");
      const res = await Api.get("/notes", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 20, search: debouncedSearch || undefined },
      });
      if (append) {
        setNotes((prev) => [...prev, ...res.data.data]);
      } else {
        setNotes(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchNotes(page > 1);
  }, [fetchNotes]);

  const handleNewNote = () => {
    setActiveNote(null);
    setTitle("");
    setContent("");
    setLabelColor("blue");
    setAttachments([]);
    setLink("");
    setUploadFiles([]);
    setViewMode('edit');
    setIsMobileDetail(true);
  };

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content || "");
    setLabelColor(note.labelColor || "blue");
    setAttachments(note.attachments || []);
    setLink(note.link || "");
    setUploadFiles([]);
    setViewMode('read');
    setIsMobileDetail(true);
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("user-token");
      
      const formData = new FormData();
      const dto = { title, content, labelColor, attachments, link, isPinned: activeNote?.isPinned || false };
      formData.append('dto', JSON.stringify(dto));
      
      uploadFiles.forEach((file) => {
        formData.append('files', file);
      });

      if (activeNote) {
        const res = await Api.patch(`/notes/${activeNote.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? res.data.data : n)));
        setActiveNote(res.data.data);
        setModalData({ type: "success", message: res.data.message || "Note updated successfully" });
      } else {
        const res = await Api.post("/notes", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes((prev) => [res.data.data, ...prev]);
        setActiveNote(res.data.data);
        setModalData({ type: "success", message: res.data.message || "Note created successfully" });
      }
      setViewMode('read');
      setUploadFiles([]);
    } catch (error: any) {
      console.error("Failed to save note", error);
      const msg = error.response?.data?.message || "Failed to save note";
      setModalData({ type: "error", message: Array.isArray(msg) ? msg[0] : msg });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("user-token");
      const res = await Api.delete(`/notes/${noteToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete));
      if (activeNote?.id === noteToDelete) {
        setActiveNote(null);
        setIsMobileDetail(false);
      }
      setShowMenu(false);
      setNoteToDelete(null);
      setModalData({ type: "success", message: res.data?.message || "Note deleted successfully" });
    } catch (error: any) {
      console.error("Failed to delete note", error);
      const msg = error.response?.data?.message || "Failed to delete note";
      setModalData({ type: "error", message: Array.isArray(msg) ? msg[0] : msg });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePinNote = async (note: Note) => {
    try {
      const token = localStorage.getItem("user-token");
      
      const formData = new FormData();
      formData.append('dto', JSON.stringify({ isPinned: !note.isPinned }));

      const res = await Api.patch(
        `/notes/${note.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes((prev) => prev.map((n) => (n.id === note.id ? res.data.data : n)).sort((a, b) => Number(b.isPinned) - Number(a.isPinned)));
      if (activeNote?.id === note.id) setActiveNote(res.data.data);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to pin note", error);
    }
  };

  return (
    <StaffLayout>
      <div className="flex h-full bg-white dark:bg-[#141414] overflow-hidden relative">
        <NoteSidebar
          notes={notes}
          activeNote={activeNote}
          isMobileDetail={isMobileDetail}
          isDrawerOpen={isDrawerOpen}
          listStyle={listStyle}
          search={search}
          onSetSearch={setSearch}
          onSetListStyle={setListStyle}
          onNewNote={handleNewNote}
          onSelectNote={handleSelectNote}
        />
        
        {viewMode === 'read' ? (
          <NoteViewer
            activeNote={activeNote}
            isMobileDetail={isMobileDetail}
            isDrawerOpen={isDrawerOpen}
            showMenu={showMenu}
            onSetIsMobileDetail={setIsMobileDetail}
            onSetIsDrawerOpen={setIsDrawerOpen}
            onSetShowMenu={setShowMenu}
            onSetViewMode={setViewMode}
            onPinNote={handlePinNote}
            onDeleteNote={setNoteToDelete}
          />
        ) : (
          <NoteEditor
            title={title}
            content={content}
            labelColor={labelColor}
            attachments={attachments}
            link={link}
            uploadFiles={uploadFiles}
            search={search}
            isMobileDetail={isMobileDetail}
            isDrawerOpen={isDrawerOpen}
            activeNote={activeNote}
            showMenu={showMenu}
            isSaving={isSaving}
            onSetTitle={setTitle}
            onSetContent={setContent}
            onSetLabelColor={setLabelColor}
            onSetAttachments={setAttachments}
            onSetLink={setLink}
            onSetUploadFiles={setUploadFiles}
            onSetSearch={setSearch}
            onSetIsMobileDetail={setIsMobileDetail}
            onSetIsDrawerOpen={setIsDrawerOpen}
            onSetShowMenu={setShowMenu}
            onSetViewMode={setViewMode}
            onSaveNote={handleSaveNote}
            onDeleteNote={setNoteToDelete}
            onPinNote={handlePinNote}
          />
        )}

        {/* Delete Confirmation Modal */}
        {noteToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 scale-in-95 duration-200">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Note?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  disabled={isDeleting}
                  onClick={() => setNoteToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a2a] dark:hover:bg-[#333] rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDeleteNote}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center"
                >
                  {isDeleting && <Loader2 size={16} className="animate-spin mr-2" />}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Message Modal */}
        {modalData && (
          <CustomModal
            type={modalData.type}
            message={modalData.message}
            onClose={() => setModalData(null)}
          />
        )}
      </div>
    </StaffLayout>
  );
}
