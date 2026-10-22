"use client";

import { useEffect, useState } from "react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import CustomModal from "@/component/Message/Message";
import { useRouter } from "next/navigation";
interface StaffEmployment {
  jobTitle: string[];
}
interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employment?: StaffEmployment;
  staff: Staff;
}

interface TaskAssignment {
  staffId: number;
  role: string;
}
interface ProjectAssignment {
  staff: Staff;
}
interface Task {
  id: number;
  title: string;
  description?: string;
  taskModule?: string;
  status: string;
  priority: string;
  urgency: string;
  sprint: number;
  startDate: string;
  dueDate?: string;
  timeline?: string;
  projectId?: number;
  departmentId?: number;
  departmentName?: string;
  project: { id: number; projectName: string; assignedTo: ProjectAssignment[] };
  assignedTo: { id: number; role: string; staff: Staff }[];
}

const TASK_STATUSES = [
  "Not_started",
  "In_progress",
  "Ready_To_Test",
  "Testing_In_Progress",
  "Failed_Test",
  "On_Hold",
  "Passed_Test",
  "Dev_Completed",
  "Completed",
];

const PRIORITIES = ["Low", "Medium", "High"];
const URGENCIES = ["Short_Term", "Med_Term", "High_Term", "Immediately"];

export default function TaskUpdateModal({
  taskId,
  isOpen,
  onClose,
  onUpdated,
}: {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const router = useRouter();
  // === Form state ===
  const [title, setTitle] = useState("");
  const [taskModule, setTaskModule] = useState("");
  const [description, setDescription] = useState("");
  const [sprint, setSprint] = useState<number | "">("");
  const [status, setStatus] = useState("Not_started");
  const [customStatus, setCustomStatus] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [urgency, setUrgency] = useState("Short_Term");
  const [dueDate, setDueDate] = useState("");
  const [timeline, setTimeline] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [selectedDeptName, setSelectedDeptName] = useState<string | "">("");
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");
  const [token, setToken] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staffId, setStaffId] = useState<number | "">("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("user-token");
      if (!t) {
        router.push("/login");
      } else {
        setToken(t);
      }
    }
  }, [router]);
  // === Load task + staff ===

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Step 1: Fetch the task
        const taskRes = await Api.get(`/task/${taskId}`);
        const t: Task = taskRes.data;

        setTitle(t.title);
        setDescription(t.description || "");
        setTaskModule(t.taskModule || "");
        setStatus((t as any).customStatus ? "Other" : t.status);
        setCustomStatus((t as any).customStatus || "");
        setPriority(t.priority);
        setUrgency(t.urgency);
        setTimeline(t.timeline || "");
        setSprint(t.sprint || "");
        setProjectId(t.project?.id || (t as any).linkedProjectId || "");
        setStartDate(t.startDate ? t.startDate.split("T")[0] : "");
        setDueDate(t.dueDate ? t.dueDate.split("T")[0] : "");

        const initialDept = (t as any).departmentName || "";
        const initialDeptId = (t as any).departmentId || "";
        setSelectedDeptName(initialDept);
        setSelectedDeptId(initialDeptId);

        setAssignments(
          t.assignedTo
            ?.filter((a) => a && a.staff && a.staff.id)
            .map((a) => ({
              staffId: a.staff.id,
              role: a.role,
            })) || [],
        );

        // Step 2: Fetch departments & projects
        const [deptRes, projRes] = await Promise.all([
          Api.get("/departments"),
          Api.get("/projects"),
        ]);
        setDepartments(deptRes.data || []);
        setAllProjects(projRes.data || []);

        // Step 3: Handle staff fetching
        const effectiveProjectId = t.project?.id || (t as any).linkedProjectId;
        if (effectiveProjectId) {
          const projectRes = await Api.get(`/projects/${effectiveProjectId}/staffs`);
          setStaffs(projectRes.data || []);
        } else if (initialDept) {
          const staffRes = await Api.get(
            `/staff-register/all/staffs/by-department?name=${encodeURIComponent(initialDept)}`,
          );
          const clean = (staffRes.data || [])
            .filter((s: any) => s && s.id)
            .map((s: any) => ({
              staff: {
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                employment: s.employment || { jobTitle: [] },
              },
              role: s.employment?.departmentalRole?.title || "Staff Member",
            }));
          setStaffs(clean);
        } else {
          // Fallback: fetch all staff if no project and no department is set
          const staffRes = await Api.get("/staff-register/all/staffs/dept?limit=1000");
          const clean = (staffRes.data?.data || [])
            .filter((s: any) => s && s.id)
            .map((s: any) => ({
              staff: {
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                employment: s.employment || { jobTitle: [] },
              },
              role: s.employment?.departmentalRole?.title || "Staff Member",
            }));
          setStaffs(clean);
        }
      } catch (err) {
        console.error("Failed to load task or staff", err);
        setModal({ type: "error", message: "Failed to load task or staff." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, taskId]);

  // Load staffs when department or project changes
  useEffect(() => {
    if (!isOpen) return;

    if (projectId) {
      Api.get(`/projects/${projectId}/staffs`)
        .then((res) => setStaffs(res.data || []))
        .catch(() =>
          setModal({
            type: "error",
            message: "Failed to load project staff list.",
          }),
        );
    } else if (selectedDeptName) {
      Api.get(
        `/staff-register/all/staffs/by-department?name=${encodeURIComponent(selectedDeptName)}`,
      )
        .then((res) => {
          const clean = (res.data || [])
            .filter((s: any) => s && s.id)
            .map((s: any) => ({
              staff: {
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                employment: s.employment || { jobTitle: [] },
              },
              role: s.employment?.departmentalRole?.title || "Staff Member",
            }));
          setStaffs(clean);
        })
        .catch(() =>
          setModal({
            type: "error",
            message: "Failed to load departmental staff list.",
          }),
        );
    } else {
      // Fallback to fetch all staff
      Api.get("/staff-register/all/staffs/dept?limit=1000")
        .then((res) => {
          const clean = (res.data?.data || [])
            .filter((s: any) => s && s.id)
            .map((s: any) => ({
              staff: {
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                employment: s.employment || { jobTitle: [] },
              },
              role: s.employment?.departmentalRole?.title || "Staff Member",
            }));
          setStaffs(clean);
        })
        .catch(() =>
          setModal({
            type: "error",
            message: "Failed to load staff list.",
          }),
        );
    }
  }, [selectedDeptName, projectId, isOpen]);

  useEffect(() => {
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const end = new Date(dueDate);
      if (end >= start) {
        const diffDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        );
        setTimeline(`${diffDays} days`);
      } else {
        setTimeline("");
      }
    }
  }, [startDate, dueDate]);

  const handleSubmit = async () => {
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      setModal({
        type: "error",
        message: "Due date cannot be before start date.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await Api.patch(
        `/task/${taskId}`,
        {
          title,
          description,
          taskModule,
          status: status === "Other" ? "Not_started" : status,
          customStatus: status === "Other" ? customStatus : null, // send null to clear it if they switched back to enum
          priority,
          urgency,
          timeline,
          startDate,
          dueDate,
          projectId: projectId || null,
          departmentId: selectedDeptId || undefined,
          departmentName: selectedDeptName || undefined,
          sprint: sprint ? Number(sprint) : undefined,
          assignedTo: assignments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setModal({ type: "success", message: "Task updated successfully!" });
      setTimeout(() => {
        onClose();
        onUpdated();
      }, 1200);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Update failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Update Task</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {/* Project Selection (Optional) */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Project <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                value={projectId || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : "";
                  setProjectId(val);
                }}
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
              >
                <option value="">-- Choose Project (Optional) --</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1 italic">
                You can optionally change or link this task to a project.
              </p>
            </div>

            {/* Department Selection (only if no project) */}
            {!projectId && (
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Task Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSelectedDeptId(val);
                    const dept = departments.find((d) => d.id === val);
                    setSelectedDeptName(dept?.name || "");
                  }}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1 italic">
                  Changing department will refresh the staff selection list below.
                </p>
              </div>
            )}
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Task Title
            </label>
            <input
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
            />
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
            />
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Task Module/Feature <span className="text-red-500"></span>
            </label>
            <input
              value={taskModule}
              onChange={(e) => setTaskModule(e.target.value)}
              placeholder="e.g. Task on Authentication, Dashboard etc"
              className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
            />
            {projectId && (
              <>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Task Sprint
                </label>
                <input
                  type="number"
                  value={sprint}
                  onChange={(e) =>
                    setSprint(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="Sprint 1"
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />
              </>
            )}
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Task Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                if (e.target.value !== "Other") {
                  setCustomStatus("");
                }
              }}
              className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
              <option value="Other">Other (Custom)</option>
            </select>
            
            {/* Custom Status - Only show if 'Other' is selected */}
            {status === "Other" && (
              <div className="mt-3">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Custom Status
                </label>
                <input
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="Type your own status..."
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            )}
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
            >
              <option value="">-- Select Urgency --</option>
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {u.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            {/* Start Date */}
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
            />
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
            />
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Timeline (auto-calculated)
            </label>
            <input
              value={timeline}
              readOnly
              className="w-full rounded-lg border px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            />

            {/* Assign Staff */}
            <div className="border p-3 rounded-lg bg-gray-50 dark:bg-[#1f1f1f] text-gray-600 dark:text-gray-400">
              <h3 className="font-medium mb-2">Assign Staff</h3>
              <div className="flex flex-col gap-3">
                <select
                  value={staffId}
                  onChange={(e) => {
                    const selectedId = e.target.value
                      ? Number(e.target.value)
                      : "";
                    setStaffId(selectedId);

                    if (selectedId) {
                      const selectedStaff = staffs.find(
                        (s) => s && s.staff && s.staff.id === selectedId,
                      );

                      // Get the first job title of that staff
                      setRole(
                        selectedStaff?.staff?.employment?.jobTitle?.[0] || "",
                      );
                    } else {
                      setRole("");
                    }
                  }}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                >
                  <option value="">-- Select Staff --</option>
                  {staffs
                    ?.filter((s) => s && s.staff && s.staff.id)
                    .map((s) => (
                      <option key={s.staff.id} value={s.staff.id}>
                        {s?.staff?.firstName} {s?.staff?.lastName} (
                        {s?.staff?.email})
                      </option>
                    ))}
                </select>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Task Role
                </label>
                <input
                  placeholder="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!staffId || !role) return;
                    setAssignments((prev) => [
                      ...prev,
                      { staffId: Number(staffId), role },
                    ]);
                    setStaffId("");
                    setRole("");
                  }}
                  className="px-4 py-2 bg-[#78B500] text-white rounded-lg hover:opacity-90"
                >
                  Add Staff
                </button>
              </div>

              <ul className="mt-3 space-y-2">
                {assignments
                  ?.filter((a) => a && a.staffId)
                  .map((a, idx) => {
                    const staff = staffs.find(
                      (s) => s?.staff?.id === a.staffId,
                    );
                    return (
                      <li
                        key={idx}
                        className="flex justify-between items-center border p-2 rounded-lg bg-white dark:bg-[#141414] transition-colors"
                      >
                        <span>
                          {staff?.staff?.firstName} {staff?.staff?.lastName} —{" "}
                          <b>{a.role}</b>
                        </span>
                        <button
                          onClick={() =>
                            setAssignments((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        )}

        {modal && (
          <CustomModal
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(null)}
          />
        )}

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full cursor-pointer py-3 bg-[#95D700] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
