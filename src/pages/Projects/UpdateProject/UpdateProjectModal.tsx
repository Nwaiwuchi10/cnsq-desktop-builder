"use client";

import { useEffect, useState } from "react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import { Check, X } from "lucide-react";
import CustomModal from "@/component/Message/Message";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface ProjectAssignment {
  id: number;
  role: string;
  staff: Staff;
}

interface Project {
  id: number;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: string;
  timeLine: string;
  prodUrl?: string;
  stagingUrl?: string;
  assignedTo: ProjectAssignment[];
}
interface Department {
  id: number;
  name: string;
}

const PROJECT_STATUSES = ["not_started", "in_progress", "testing", "completed"];
const PROJECT_PRIORITIES = ["low", "medium", "high", "critical"];

export default function UpdateProjectModal({
  projectId,
  isOpen,
  onClose,
  onUpdated,
}: {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void; // callback to refresh parent
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === Form states ===
  const [projectName, setProjectName] = useState("");
  const [desc, setDesc] = useState("");
  const [timeLine, setTimeLine] = useState("");
  const [status, setStatus] = useState("not_started");
  const [priority, setPriority] = useState("medium");
  const [prodUrl, setProdUrl] = useState("");
  const [stagingUrl, setStagingUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignments, setAssignments] = useState<
    { staffId: number; role: string }[]
  >([]);
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staffId, setStaffId] = useState<number | "">("");
  const [role, setRole] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  useEffect(() => {
    Api.get("/departments")
      .then((res) => setDepartments(res.data || []))
      .catch(() =>
        setModal({ type: "error", message: "Failed to load departments." })
      );
  }, []);
  // === Fetch project + staff ===
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectRes, staffRes] = await Promise.all([
          Api.get(`/projects/${projectId}`),
          Api.get("/staff-register"),
        ]);

        const p: Project = projectRes.data;
        setProjectName(p.projectName);
        setDesc(p.desc || "");
        setTimeLine(p.timeLine || "");
        setStatus(p.status);
        setPriority(p.priority);
        setProdUrl(p.prodUrl || "");
        setStagingUrl(p.stagingUrl || "");
        setStartDate(p.startDate?.split("T")[0]);
        setEndDate(p.endDate?.split("T")[0]);

        setAssignments(
          p.assignedTo.map((a) => ({
            staffId: a.staff.id,
            role: a.role,
          }))
        );

        setStaffs(staffRes.data || []);
      } catch (err) {
        console.error("Failed to load project or staff", err);
        setModal({ type: "error", message: "Failed to load project." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, projectId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("user-token");
      await Api.patch(
        `/projects/${projectId}`,
        {
          projectName,
          desc,
          timeLine,
          status,
          priority,
          prodUrl,
          stagingUrl,
          startDate,
          endDate,
          assignments,
          departmentId: Number(departmentId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setModal({ type: "success", message: "Project updated successfully!" });
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
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Update Project</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm text-gray-700 mb-1">
              Project Name
            </label>
            <input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />
            <label className="block text-sm text-gray-700 mb-1">
              Decription
            </label>
            <textarea
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />

            <div>
              <label className="block text-sm  mb-1 text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) =>
                  setDepartmentId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="block text-sm text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <label className="block text-sm text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            >
              {PROJECT_PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <label className="block text-sm text-gray-700 mb-1">
              Production Link
            </label>
            <input
              placeholder="Production URL"
              value={prodUrl}
              onChange={(e) => setProdUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />
            <label className="block text-sm text-gray-700 mb-1">
              Stagging Link
            </label>
            <input
              placeholder="Staging URL"
              value={stagingUrl}
              onChange={(e) => setStagingUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />
            <label className="block text-sm text-gray-700 mb-1">
              Tiimeline
            </label>
            <input
              placeholder="Timeline"
              value={timeLine}
              onChange={(e) => setTimeLine(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
            />

            <div>
              <div>
                <div>
                  {" "}
                  <label className="block text-sm text-gray-700 mb-1">
                    Start Date
                  </label>
                </div>
                <div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full flex-1 border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <div>
                  {" "}
                  <label className="block text-sm text-gray-700 mt-4 mb-1">
                    End Date
                  </label>
                </div>
                <div>
                  {" "}
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full flex-1 border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Assign Staff */}
            <div className="border p-3 rounded-lg bg-gray-50 text-gray-600">
              <h3 className="font-medium mb-2">Assign Staff</h3>
              <div className="flex flex-col gap-3">
                <select
                  value={staffId}
                  onChange={(e) =>
                    setStaffId(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
                >
                  <option value="">-- Select Staff --</option>
                  {staffs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </option>
                  ))}
                </select>
                <label className="block text-sm text-gray-700 mb-1">
                  Project Role
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
                  const staff = staffs.find((s) => s.id === a.staffId);
                  return (
                    <li
                      key={idx}
                      className="flex justify-between items-center border p-2 rounded-lg bg-white text-gray-600"
                    >
                      <span>
                        {staff?.firstName} {staff?.lastName} — <b>{a.role}</b>
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
            className="w-full py-3 bg-[#95D700] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
