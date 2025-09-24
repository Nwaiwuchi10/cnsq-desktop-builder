"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
interface ProjectStaff {
  staff: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    employment: {
      jobTitle: string[];
    };
  };
  role: string; // role from project assignment
}

export default function CreateTaskForm() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [token, setToken] = useState<string | null>(null);
  // const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staffs, setStaffs] = useState<ProjectStaff[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === Task State ===
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sprint, setSprint] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeline, setTimeline] = useState("");

  // === AssignedTo ===
  const [assignments, setAssignments] = useState<
    { staffId: number; role: string }[]
  >([]);
  const [staffId, setStaffId] = useState<number | "">("");
  const [role, setRole] = useState("");

  // Load token
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

  // Load staffs assigned to this project
  useEffect(() => {
    if (!projectId) return;
    Api.get(`/projects/${projectId}/staffs`)
      .then((res) => setStaffs(res.data || []))
      .catch(() =>
        setModal({
          type: "error",
          message: "Failed to load project staff list.",
        })
      );
  }, [projectId]);

  // Auto-calc timeline (days) when startDate & dueDate are set
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

  const handleCreateTask = async () => {
    if (!title || !dueDate || !startDate) {
      setModal({ type: "error", message: "Please fill required fields." });
      return;
    }
    setSubmitting(true);
    try {
      await Api.post(
        "/task",
        {
          title,
          description,
          sprint,
          startDate,
          dueDate,
          timeline,
          projectId,
          assignedTo: assignments,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModal({ type: "success", message: "Task created successfully!" });
      setTimeout(() => router.push(`/project/${projectId}`), 1200);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to create task.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-16">
      <div className="max-w-xl mx-auto px-4 mb-8 mt-14">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-black hover:opacity-75"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Create Task
          </h2>
          <div className="w-[84px]" />
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Title */}
          <label className="block text-sm font-medium">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900"
          />

          {/* Description */}
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* Sprint */}
          <label className="block text-sm font-medium mb-1">
            Task Sprint <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            placeholder="Sprint 1"
            className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900"
          />

          {/* Start Date */}
          <label className="block text-sm font-medium">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900"
          />

          {/* Due Date */}
          <label className="block text-sm font-medium">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900"
          />

          {/* Timeline (auto-calculated) */}
          <label className="block text-sm font-medium">
            Timeline (auto-calculated)
          </label>
          <input
            value={timeline}
            readOnly
            className="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
          />

          {/* Staff Assignment */}
          <div className="border p-3 rounded-lg bg-gray-50 mt-4">
            <h3 className="text-sm font-semibold mb-2">Assign Staff</h3>
            <select
              value={staffId}
              onChange={(e) => {
                const selectedId = e.target.value ? Number(e.target.value) : "";
                setStaffId(selectedId);

                if (selectedId) {
                  const selectedStaff = staffs.find(
                    (s) => s.staff.id === selectedId
                  );
                  setRole(selectedStaff?.staff.employment?.jobTitle?.[0] || ""); // Auto-fill role
                } else {
                  setRole("");
                }
              }}
              className="w-full rounded-lg border px-3 py-2 mb-2 bg-white text-gray-900"
            >
              <option value="">-- Select Staff --</option>
              {staffs.map((s) => (
                <option key={s.staff.id} value={s.staff.id}>
                  {s.staff.firstName} {s.staff.lastName} ({s.staff.email})
                </option>
              ))}
            </select>

            <input
              placeholder="Role (e.g. Lead, Contributor)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 mb-2 bg-white text-gray-900"
            />

            <button
              type="button"
              onClick={() => {
                if (!staffId || !role) {
                  setModal({
                    type: "error",
                    message: "Please select staff and enter a role.",
                  });
                  return;
                }
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

            {/* List of assigned staff */}
            <ul className="mt-3 space-y-2">
              {assignments.map((a, idx) => {
                const staffObj = staffs.find((s) => s.staff.id === a.staffId);
                return (
                  <li
                    key={idx}
                    className="flex justify-between items-center border p-2 rounded-lg bg-white"
                  >
                    <span>
                      {staffObj?.staff.firstName} {staffObj?.staff.lastName} (
                      {staffObj?.staff.email}) — <b>{a.role}</b>
                    </span>
                    <button
                      onClick={() =>
                        setAssignments((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-red-500 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Modal */}
          {modal && (
            <CustomModal
              type={modal.type}
              message={modal.message}
              onClose={() => setModal(null)}
            />
          )}

          {/* Submit */}
          <button
            style={{ cursor: "pointer" }}
            onClick={handleCreateTask}
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[#95D700] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
