import React, { useState, useEffect } from 'react';
import { createTicket } from '../services/ticketing.service';
import Api from '@/utils/api';
import CustomModal from '@/component/Message/Message';
import { X, UploadCloud, Loader2 } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [linkedProject, setLinkedProject] = useState('');
  const [linkedTask, setLinkedTask] = useState('');
  const [link, setLink] = useState('');

  // Dynamic fields
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    } else {
      // Reset state when closed
      setProjectSearch('');
      setTaskSearch('');
      setLinkedProject('');
      setLinkedTask('');
      setProjects([]);
      setTasks([]);
      setShowProjectDropdown(false);
      setShowTaskDropdown(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (departmentId) {
      // Immediately clear previous selections
      setLinkedProject('');
      setLinkedTask('');
      setProjectSearch('');
      setTaskSearch('');

      // Fetch projects for this department
      setLoadingProjects(true);
      Api.get(`/projects?departmentId=${departmentId}`)
        .then(res => setProjects(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
        .catch(() => setProjects([]))
        .finally(() => setLoadingProjects(false));

      // Fetch tasks for this department (no project selected yet)
      fetchTasks(departmentId, '');
    } else {
      setProjects([]);
      setTasks([]);
      setLinkedProject('');
      setLinkedTask('');
      setProjectSearch('');
      setTaskSearch('');
    }
  }, [departmentId]);

  useEffect(() => {
    if (departmentId) {
      fetchTasks(departmentId, linkedProject);
      if (!linkedProject) return;
      setLinkedTask('');
      setTaskSearch('');
    }
  }, [linkedProject]);

  const fetchTasks = async (deptId: string, projId: string) => {
    setLoadingTasks(true);
    let url = `/task?`;
    if (projId) {
      url += `projectId=${projId}`;
    } else if (deptId) {
      url += `departmentId=${deptId}`;
    }
    try {
      const res = await Api.get(url);
      setTasks(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch {
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await Api.get('/departments');
      setDepartments(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !departmentId || !description) {
      setModal({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const dtoParams: any = {
        subject,
        departmentId: Number(departmentId),
        priority,
        description,
      };
      if (linkedProject) dtoParams.linkedProjectId = Number(linkedProject);
      if (linkedTask) dtoParams.linkedTaskId = Number(linkedTask);
      if (link.trim()) dtoParams.link = link.trim();

      formData.append('dto', JSON.stringify(dtoParams));

      files.forEach((file) => {
        formData.append('files', file);
      });

      const responseData = await createTicket(formData);
      setModal({ type: 'success', message: (responseData as any)?.message || 'Ticket created successfully' });
      onSuccess();
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setModal({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to create ticket' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setDepartmentId('');
    setPriority('Medium');
    setDescription('');
    setLink('');
    setFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 left-0 right-0 bottom-0 md:top-0 md:inset-0 z-40 md:z-50 flex items-start md:items-center justify-center bg-[#F8F9FA] dark:bg-[#0d0d0d] md:bg-black/40 md:dark:bg-black/60 font-sans md:p-4">
      <div className="bg-[#F8F9FA] dark:bg-[#141414] md:bg-white md:dark:bg-[#141414] w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[500px] md:rounded-2xl md:shadow-xl flex flex-col overflow-hidden transition-colors">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center px-5 pt-6 pb-2 bg-[#F8F9FA] dark:bg-[#141414] sticky top-0 z-10 transition-colors">
          <button onClick={handleClose} className="flex items-center gap-2 text-[14px] font-bold text-gray-900 dark:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-3 pb-5 md:p-6 border-b border-gray-200 dark:border-gray-800 md:border-gray-100 relative">
            <h2 className="text-[20px] md:text-[17px] font-bold text-[#3B3C4A] dark:text-white">Create New Ticket</h2>
            <button
              onClick={handleClose}
              className="hidden md:block absolute top-1/2 -translate-y-1/2 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-1.5">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#8ec32f] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="e.g. Office supplies request"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-1.5">Description <span className="text-red-500">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#8ec32f] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white transition-colors placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                placeholder="Provide details of your request..."
              ></textarea>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-1.5">Department <span className="text-red-500">*</span></label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#8ec32f] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white transition-colors appearance-none"
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute bottom-0 right-0 top-[26px] flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
              <div className="flex-1 relative">
                <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-1.5">Priority <span className="text-red-500">*</span></label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#8ec32f] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white transition-colors appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <div className="pointer-events-none absolute bottom-0 right-0 top-[26px] flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-1.5">Linked Project <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={projectSearch}
                    onFocus={() => setShowProjectDropdown(true)}
                    onBlur={() => setTimeout(() => setShowProjectDropdown(false), 200)}
                    onChange={(e) => {
                      setProjectSearch(e.target.value);
                      setShowProjectDropdown(true);
                      if (!e.target.value) setLinkedProject('');
                    }}
                    placeholder={loadingProjects ? '' : 'Search projects...'}
                    disabled={loadingProjects}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 pr-9 text-[13px] focus:outline-none focus:border-[#8ec32f] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white transition-colors disabled:cursor-wait"
                  />
                  {loadingProjects && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <Loader2 size={15} className="animate-spin text-[#8ec32f]" />
                    </div>
                  )}
                  {showProjectDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] max-h-[150px] overflow-y-auto">
                      {loadingProjects ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                          <Loader2 size={14} className="animate-spin" /> Loading...
                        </div>
                      ) : projects.length === 0 ? (
                        <div className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400 text-center">
                          {departmentId ? 'No projects in this department' : 'Select a department first'}
                        </div>
                      ) : (
                        projects
                          .filter(p => p.projectName?.toLowerCase().includes(projectSearch.toLowerCase()) || p.title?.toLowerCase().includes(projectSearch.toLowerCase()))
                          .map(project => (
                            <div
                              key={project.id}
                              className="px-4 py-2 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setLinkedProject(project.id.toString());
                                setProjectSearch(project.projectName || project.title);
                                setShowProjectDropdown(false);
                              }}
                            >
                              {project.projectName || project.title}
                            </div>
                          ))
                      )}
                      {!loadingProjects && projects.length > 0 && projects.filter(p => p.projectName?.toLowerCase().includes(projectSearch.toLowerCase()) || p.title?.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400 text-center">No matches found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 relative">
                <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-1.5">Linked Task <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={taskSearch}
                    onFocus={() => setShowTaskDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTaskDropdown(false), 200)}
                    onChange={(e) => {
                      setTaskSearch(e.target.value);
                      setShowTaskDropdown(true);
                      if (!e.target.value) setLinkedTask('');
                    }}
                    placeholder={!departmentId ? 'Select department first' : loadingTasks ? '' : 'Search tasks...'}
                    disabled={!departmentId || loadingTasks}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 pr-9 text-[13px] focus:outline-none focus:border-[#8ec32f] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
                  />
                  {loadingTasks && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <Loader2 size={15} className="animate-spin text-[#8ec32f]" />
                    </div>
                  )}
                  {showTaskDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] max-h-[150px] overflow-y-auto">
                      {!departmentId ? (
                        <div className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400 text-center">Select department first</div>
                      ) : loadingTasks ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                          <Loader2 size={14} className="animate-spin" /> Loading...
                        </div>
                      ) : tasks.length === 0 ? (
                        <div className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400 text-center">No tasks available</div>
                      ) : (
                        tasks
                          .filter(t => t.title?.toLowerCase().includes(taskSearch.toLowerCase()))
                          .map(task => (
                            <div
                              key={task.id}
                              className="px-4 py-2 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setLinkedTask(task.id.toString());
                                setTaskSearch(task.title);
                                setShowTaskDropdown(false);
                              }}
                            >
                              {task.title}
                            </div>
                          ))
                      )}
                      {!loadingTasks && tasks.length > 0 && tasks.filter(t => t.title?.toLowerCase().includes(taskSearch.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400 text-center">No matches found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-1.5">
                Reference / Product Link (Optional)
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://... (e.g. Figma, Loom video, reproduction or product issue link)"
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-[13px] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:border-[#8ec32f]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-1.5">Attachments & Video Evidence</label>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] rounded-xl py-6 px-4 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files));
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center">
                  <UploadCloud size={24} className="mb-3 text-gray-400 dark:text-gray-500" />
                  <p className="text-[13px] text-gray-600 dark:text-gray-300 font-medium"><span className="text-[#8ec32f] font-bold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">Images, PDF, or Video Evidence (MP4, WEBM, MOV up to 50MB)</p>
                </div>
              </div>
              {files.length > 0 && (
                <div className="mt-2 text-[12px] text-gray-500 dark:text-gray-400">
                  {files.map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            <div className="pt-5 pb-8 md:pb-0 flex flex-row gap-3 md:justify-end border-t border-gray-100 dark:border-gray-800 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 md:flex-none px-6 py-3 md:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-[14px] md:text-[13px] font-bold text-gray-700 dark:text-gray-300 bg-transparent md:bg-white md:dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-gray-800 md:hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer flex-1 md:flex-none px-6 py-3 md:py-2.5 bg-[#8ec32f] rounded-lg text-[14px] md:text-[13px] font-bold text-gray-900 hover:bg-[#7cb028] disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}
    </div>
  );
}
