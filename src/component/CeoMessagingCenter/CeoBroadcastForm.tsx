"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  Paperclip, 
  Users, 
  Type, 
  Bold, 
  Italic, 
  List,
  Layout,
  AlertTriangle,
  FileText,
  Save,
  Loader2
} from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "../Message/Message";

interface CeoBroadcastFormProps {
  message?: any; // For editing
  onClose: () => void;
  onSuccess: () => void;
}

interface Department {
  id: number;
  name: string;
}

const CeoBroadcastForm: React.FC<CeoBroadcastFormProps> = ({ message, onClose, onSuccess }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [title, setTitle] = useState(message?.title || "");
  const [description, setDescription] = useState(message?.description || "");
  const [targetType, setTargetType] = useState(message?.isAllStaff ? "all" : message?.targetDepartment ? "department" : "all");
  const [targetDeptId, setTargetDeptId] = useState<string>(message?.targetDepartment?.id?.toString() || "");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [modal, setModal] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await Api.get("/departments/all");
      setDepartments(res.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleSubmit = async (status: 'SENT' | 'DRAFT') => {
    if (!title.trim() || !description.trim()) {
      setModal({ type: "error", message: "Please enter both title and message content." });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("user-token");
      const formData = new FormData();
      
      const dto = {
        title,
        description,
        status,
        isAllStaff: targetType === "all",
        targetDepartmentId: targetType === "department" ? parseInt(targetDeptId) : undefined
      };

      formData.append("dto", JSON.stringify(dto));
      files.forEach(file => formData.append("files", file));

      if (message?.id) {
        await Api.patch(`/ceo-messaging-center/${message.id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
      } else {
        await Api.post("/ceo-messaging-center", formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
      }

      setModal({ 
        type: "success", 
        message: status === 'SENT' ? "Message broadcasted successfully!" : "Draft saved successfully!" 
      });
      
      setTimeout(() => {
        setModal(null);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setModal({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to process message." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#141414] w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/5">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#1a1a1a]/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {message?.id ? "Edit Message" : "New Broadcast Message"}
            </h2>
            <p className="text-gray-500 text-sm font-medium">Create a new announcement for staff</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-2xl text-gray-400 hover:text-red-500 transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            {/* Target Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider pl-1">Target Audience</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86CD23] w-5 h-5 pointer-events-none" />
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#86CD23]/20 focus:border-[#86CD23] transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="all">Broadcast to All Staff</option>
                    <option value="department">Specific Department</option>
                  </select>
                </div>
              </div>

              {targetType === "department" && (
                <div className="space-y-2 animate-in slide-in-from-right duration-300">
                  <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider pl-1">Select Department</label>
                  <div className="relative">
                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86CD23] w-5 h-5 pointer-events-none" />
                    <select
                      value={targetDeptId}
                      onChange={(e) => setTargetDeptId(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#86CD23]/20 focus:border-[#86CD23] transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="">Choose a team...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Title Field */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider pl-1">Message Title</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a catchy title for your message..."
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#86CD23]/20 focus:border-[#86CD23] transition-all font-bold"
                />
              </div>
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider pl-1">Message Body</label>
              <div className="relative bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#86CD23]/20 focus-within:border-[#86CD23] transition-all">
                {/* Editor Toolbar */}
                <div className="flex items-center gap-1.5 p-3 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-black/20">
                  <button className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"><Bold size={16} /></button>
                  <button className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"><Italic size={16} /></button>
                  <button className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"><List size={16} /></button>
                  <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                  <button className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"><Type size={16} /></button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write your announcement detail here..."
                  rows={8}
                  className="w-full bg-transparent p-4 focus:outline-none font-medium resize-none text-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider pl-1">Attachments</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-[#86CD23] text-sm font-bold hover:underline"
                >
                  <Paperclip size={16} />
                  Add files
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700 group">
                      <span className="text-xs font-bold text-gray-600 truncate max-w-[120px]">{file.name}</span>
                      <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <button
              onClick={() => handleSubmit('DRAFT')}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-transparent border-2 border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={20} />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('SENT')}
              disabled={loading}
              className="w-full flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[#86CD23] hover:bg-[#7ab520] text-black rounded-2xl font-black transition-all shadow-lg shadow-[#86CD23]/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send size={20} />
              )}
              Send Broadcast Now
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <CustomModal 
          type={modal.type} 
          message={modal.message} 
          onClose={() => setModal(null)} 
        />
      )}
    </div>
  );
};

export default CeoBroadcastForm;
