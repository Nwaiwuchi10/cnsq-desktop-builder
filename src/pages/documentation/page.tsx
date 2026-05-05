"use client";

import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import { Search, Filter, Plus, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import DocumentationItem, { Documentation } from "./components/DocumentationItem";
import AddDocumentationModal from "./components/AddDocumentationModal";
import EditDocumentationModal from "./components/EditDocumentationModal";
import DeleteDocumentationModal from "./components/DeleteDocumentationModal";
import CustomModal from "@/component/Message/Message";
import Api from "@/utils/api";

export default function DocumentationPage() {
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<Documentation | null>(null);
  const [docToDelete, setDocToDelete] = useState<Documentation | null>(null);
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const limit = 8;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchDocs = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("user-token");
      const res = await Api.get("/documentation", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          search: debouncedSearch || undefined,
        },
      });

      setDocs(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Failed to fetch documentation", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleAddDoc = async (data: { name: string; link?: string; files: File[] }) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem("user-token");

      const formData = new FormData();
      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const dto = {
        name: data.name,
        link: data.link,
      };

      formData.append("dto", JSON.stringify(dto));

      await Api.post("/documentation", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      // Refresh list
      fetchDocs();
      setIsAddModalOpen(false);
      setModalMessage({ type: "success", message: "Documentation added successfully." });
    } catch (error: any) {
      console.error("Failed to add documentation", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to add documentation. Please try again.";
      setModalMessage({ type: "error", message: errorMsg });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditDoc = async (id: string, data: { name: string; link?: string; files: File[]; existingFiles: string[] }) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem("user-token");

      const formData = new FormData();
      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const dto = {
        name: data.name,
        link: data.link,
        files: data.existingFiles, // Send the list of existing files to keep
      };

      formData.append("dto", JSON.stringify(dto));

      await Api.patch(`/documentation/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      // Refresh list
      fetchDocs();
      setIsEditModalOpen(false);
      setDocToEdit(null);
      setModalMessage({ type: "success", message: "Documentation updated successfully." });
    } catch (error: any) {
      console.error("Failed to update documentation", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to update documentation. Please try again.";
      setModalMessage({ type: "error", message: errorMsg });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;

    try {
      setIsActionLoading(true);
      const token = localStorage.getItem("user-token");
      await Api.delete(`/documentation/${docToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDocToDelete(null);
      // Fetch again or remove from local state
      // If we are on the last item of a page, we should ideally go back a page
      fetchDocs();
      setModalMessage({ type: "success", message: "Documentation deleted successfully." });
    } catch (error: any) {
      console.error("Failed to delete documentation", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to delete documentation. Ensure you have the right permissions.";
      setModalMessage({ type: "error", message: errorMsg });
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <StaffLayout>
      <div className="min-h-screen pb-12 relative">
        {modalMessage && (
          <CustomModal
            type={modalMessage.type}
            message={modalMessage.message}
            onClose={() => setModalMessage(null)}
          />
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#a1e508]/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-[#a1e508]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documentation</h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#a1e508] text-black font-bold rounded-xl hover:bg-[#86CD23] transition-all shadow-lg active:scale-[0.98]"
          >
            <Plus size={20} /> Add Documentation
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search documentation by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#a1e508] outline-none transition-all dark:text-white placeholder:text-gray-400"
            />
          </div>
          <button className="flex items-center justify-between gap-2 px-6 py-3.5 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all min-w-[140px]">
            <span>Filter by</span>
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm min-h-[400px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Documentation ({total})</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click on any document to open the link in a new tab</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#a1e508]" />
            </div>
          ) : (
            <div className="space-y-1">
              {docs.length > 0 ? (
                docs.map(doc => (
                  <DocumentationItem
                    key={doc.id}
                    doc={doc}
                    onEdit={(d) => {
                      setDocToEdit(d);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={(d) => setDocToDelete(d)}
                  />
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No documentation found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                // Simple pagination display logic to limit items if there are too many pages
                if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(page - p) > 1) {
                  if (p === 2 || p === totalPages - 1) return <span key={p} className="text-gray-400">...</span>;
                  return null;
                }

                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${page === p ? 'bg-[#a1e508] text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Modals */}
        <AddDocumentationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddDoc}
          isLoading={isActionLoading}
        />

        <EditDocumentationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setDocToEdit(null);
          }}
          doc={docToEdit}
          onUpdate={handleEditDoc}
          isLoading={isActionLoading}
        />

        <DeleteDocumentationModal
          isOpen={!!docToDelete}
          docName={docToDelete?.name || ""}
          onClose={() => setDocToDelete(null)}
          onConfirm={handleDeleteConfirm}
          isLoading={isActionLoading}
        />
      </div>
    </StaffLayout>
  );
}
