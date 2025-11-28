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
  const [priority, setPriority] = useState("Medium");
  const [urgency, setUrgency] = useState("Short_Term");
  const [dueDate, setDueDate] = useState("");
  const [timeline, setTimeline] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [token, setToken] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
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
        setStatus(t.status);
        setPriority(t.priority);
        setUrgency(t.urgency);
        setTimeline(t.timeline || "");
        setSprint(t.sprint || "");
        setProjectId(t.project.id);
        setStartDate(t.startDate ? t.startDate.split("T")[0] : "");
        setDueDate(t.dueDate ? t.dueDate.split("T")[0] : "");

        setAssignments(
          t.assignedTo.map((a) => ({
            staffId: a.staff.id,
            role: a.role,
          }))
        );

        // setStaffs(projectStaffs);
        const projectRes = await Api.get(`/projects/${t.project.id}/staffs`);
        const projectStaffs: Staff[] = projectRes.data;

        setStaffs(projectStaffs);
      } catch (err) {
        console.error("Failed to load task or staff", err);
        setModal({ type: "error", message: "Failed to load task or staff." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, taskId]);

  useEffect(() => {
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const end = new Date(dueDate);
      if (end >= start) {
        const diffDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        setTimeline(`${diffDays} days`);
      } else {
        setTimeline("");
      }
    }
  }, [startDate, dueDate]);
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await Api.patch(
        `/task/${taskId}`,
        {
          title,
          description,
          taskModule,
          status,
          priority,
          urgency,
          timeline,
          startDate,
          dueDate,
          projectId,
          sprint: sprint ? Number(sprint) : undefined,
          assignedTo: assignments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setModal({ type: "success", message: "Task updated successfully!" });
      setTimeout(() => {
        onClose();
        onUpdated();
      }, 1200);
      window.location.reload();
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
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
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
            <label className="block text-sm text-gray-700 mb-1">
              Task Title
            </label>
            <input
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />
            <label className="block text-sm text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />
            <label className="block text-sm font-medium text-gray-600">
              Task Module/Feature <span className="text-red-500"></span>
            </label>
            <input
              value={taskModule}
              onChange={(e) => setTaskModule(e.target.value)}
              placeholder="e.g. Task on Authentication, Dashboard etc"
              className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900"
            />
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Task Sprint
            </label>
            <input
              type="number"
              value={sprint}
              onChange={(e) => setSprint(Number(e.target.value))}
              placeholder="Sprint 1"
              className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />
            <label className="block text-sm text-gray-700 mb-1">
              Task Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <label className="block text-sm text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <label className="block text-sm text-gray-700 mb-1">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            >
              {URGENCIES.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
            {/* Start Date */}
            <label className="block text-sm font-medium text-gray-600">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900"
            />
            <label className="block text-sm text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />
            <label className="block text-sm text-gray-700 mb-1">Timeline</label>
            <input
              placeholder="Timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />

            {/* Assign Staff */}
            <div className="border p-3 rounded-lg bg-gray-50 text-gray-600">
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
                        (s) => s.staff?.id === selectedId
                      );
                      // Get the first job title of that staff
                      setRole(
                        selectedStaff?.staff?.employment?.jobTitle?.[0] || ""
                      );
                    } else {
                      setRole("");
                    }
                  }}
                  className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
                >
                  <option value="">-- Select Staff --</option>
                  {staffs.map((s) => (
                    <option key={s.staff.id} value={s.staff.id}>
                      {s?.staff?.firstName} {s?.staff?.lastName} (
                      {s?.staff?.email})
                    </option>
                  ))}
                </select>
                <label className="block text-sm text-gray-700 mb-1">
                  Task Role
                </label>
                <input
                  placeholder="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
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
                {assignments.map((a, idx) => {
                  const staff = staffs.find((s) => s?.staff?.id === a.staffId);
                  return (
                    <li
                      key={idx}
                      className="flex justify-between items-center border p-2 rounded-lg bg-white"
                    >
                      <span>
                        {staff?.staff?.firstName} {staff?.staff?.lastName} —{" "}
                        <b>{a.role}</b>
                      </span>
                      <button
                        onClick={() =>
                          setAssignments((prev) =>
                            prev.filter((_, i) => i !== idx)
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
