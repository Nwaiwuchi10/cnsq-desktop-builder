"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";
import { useParams } from "next/navigation";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CreateTaskForm() {
  const router = useRouter();
  const params = useParams();

  const projectId = Number(params?.id);

  console.log("projectId", projectId);
  const [token, setToken] = useState<string | null>(null);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === Task State ===
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeline, setTimeline] = useState("");

  // === AssignedTo ===
  const [assignments, setAssignments] = useState<
    { staffId: number; role: string }[]
  >([]);
  const [staffId, setStaffId] = useState<number | "">("");
  const [role, setRole] = useState("");

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

  useEffect(() => {
    Api.get("/staff-register")
      .then((res) => setStaffs(res.data || []))
      .catch(() =>
        setModal({ type: "error", message: "Failed to load staff list." })
      );
  }, []);

  const handleCreateTask = async () => {
    if (!title || !dueDate || !timeline) {
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
          dueDate,
          timeline,
          projectId,
          assignedTo: assignments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
          <label className="block text-sm font-medium">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            pattern="[A-Za-z]+"
            placeholder="Enter task title"
            className="w-full rounded-lg border px-3 py-2"
          />

          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="w-full rounded-lg border px-3 py-2"
          />

          <label className="block text-sm font-medium">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />

          <label className="block text-sm font-medium">
            Timeline <span className="text-red-500">*</span>
          </label>
          <input
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="e.g. 2 weeks"
            className="w-full rounded-lg border px-3 py-2"
          />

          {/* Staff Assignment */}
          <div className="border p-3 rounded-lg bg-gray-50 mt-4">
            <h3 className="text-sm font-semibold mb-2">Assign Staff</h3>
            <select
              value={staffId}
              onChange={(e) =>
                setStaffId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded-lg border px-3 py-2 mb-2"
            >
              <option value="">-- Select Staff --</option>
              {staffs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.email})
                </option>
              ))}
            </select>

            <input
              placeholder="Role (e.g. Lead, Contributor)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 mb-2"
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
                const staff = staffs.find((s) => s.id === a.staffId);
                return (
                  <li
                    key={idx}
                    className="flex justify-between items-center border p-2 rounded-lg bg-white"
                  >
                    <span>
                      {staff?.firstName} {staff?.lastName} ({staff?.email}) —{" "}
                      <b>{a.role}</b>
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

          {modal && (
            <CustomModal
              type={modal.type}
              message={modal.message}
              onClose={() => setModal(null)}
            />
          )}

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
