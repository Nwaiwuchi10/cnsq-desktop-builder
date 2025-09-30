"use client";

import { useEffect, useState } from "react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import { X } from "lucide-react";
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

export default function AssignedToStaffModal({
  projectId,
  isOpened,
  onClosed,
  onUpdateds,
}: {
  projectId: number;
  isOpened: boolean;
  onClosed: () => void;
  onUpdateds: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [assignments, setAssignments] = useState<
    { staffId: number; role: string }[]
  >([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [role, setRole] = useState("");

  // === Fetch project + staff ===
  useEffect(() => {
    if (!isOpened) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectRes, staffRes] = await Promise.all([
          Api.get(`/projects/${projectId}`),
          Api.get("/staff-register"),
        ]);

        const p: Project = projectRes.data;
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
  }, [isOpened, projectId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("user-token");
      await Api.patch(
        `/projects/${projectId}`,
        { assignments },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModal({ type: "success", message: "Project updated successfully!" });
      setTimeout(() => {
        onClosed();
        onUpdateds();
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

  if (!isOpened) return null;

  // filter staffs by search
  const filteredStaffs = staffs.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Update Project Assigned Staffs
          </h2>
          <button onClick={onClosed}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {/* Assign Staff */}
            <div className="border p-3 rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2 text-gray-600">Assign Staff</h3>
              <div className="flex flex-col gap-3 relative">
                {/* Search input */}
                <input
                  type="text"
                  placeholder="Search staff by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedStaff(null);
                  }}
                  className="w-full border rounded-lg px-3 py-2 bg-white text-gray-600"
                />

                {/* Dropdown results */}
                {search && !selectedStaff && (
                  <ul className="absolute top-12 left-0 right-0 bg-white text-gray-600 border rounded-lg max-h-40 overflow-y-auto shadow-md z-10">
                    {filteredStaffs.length === 0 && (
                      <li className="px-3 py-2 text-gray-500">
                        No staff found
                      </li>
                    )}
                    {filteredStaffs.map((s) => (
                      <li
                        key={s.id}
                        onClick={() => {
                          setSelectedStaff(s);
                          setSearch(
                            `${s.firstName} ${s.lastName} (${s.email})`
                          );
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {s.firstName} {s.lastName} ({s.email})
                      </li>
                    ))}
                  </ul>
                )}

                {/* Role input */}
                <input
                  placeholder="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white text-gray-600"
                />

                {/* Add button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedStaff || !role) return;
                    setAssignments((prev) => [
                      ...prev,
                      { staffId: selectedStaff.id, role },
                    ]);
                    setSearch("");
                    setSelectedStaff(null);
                    setRole("");
                  }}
                  className="px-4 py-2 bg-[#78B500] text-white rounded-lg hover:opacity-90"
                >
                  Add Staff
                </button>
              </div>

              {/* Assigned staff list */}
              <ul className="mt-3 space-y-2">
                {assignments.map((a, idx) => {
                  const staff = staffs.find((s) => s.id === a.staffId);
                  return (
                    <li
                      key={idx}
                      className="flex justify-between items-center border p-2 rounded-lg bg-white"
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
