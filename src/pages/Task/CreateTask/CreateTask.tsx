"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";
import { StaticImageData } from "next/image";

interface Project {
  id: number;
  uuid: string;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: string;
  timeLine: string;
  prodUrl: string;
  stagingUrl: string;
  apk?: string;
  assignedTo: {
    id: number;
    role: string;
    staff: {
      id: number;
      uuid: string;
      firstName: string;
      lastName: string;
      email: string;
      photoUrl: string | StaticImageData | null;
    };
  }[];
  comments: {
    id: number;
    text: string;
    staff: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
}
interface Staff {
  id: number;
  uuid: string;
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
const TASK_STATUSES = [
  "Not_started",
  "In_progress",
  "Ready_To_Test",
  "Testing_In_Progress",
  "On_Hold",
  "Failed_Test",
  "Passed_Test",
  "Dev_Completed",
  "Completed",
];

const PRIORITIES = ["Low", "Medium", "High"];
const URGENCIES = ["Short_Term", "Med_Term", "High_Term", "Immediately"];
export default function CreateTaskForm() {
  const router = useRouter();
  const params = useParams();

  const projectId = params?.uuid as string;

  const [token, setToken] = useState<string | null>(null);
  // const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staffs, setStaffs] = useState<ProjectStaff[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === Task State ===
  const [projectUuid, setProjectUuid] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [taskModule, setTaskModule] = useState("");
  const [description, setDescription] = useState("");
  const [sprint, setSprint] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeline, setTimeline] = useState("");
  const [status, setStatus] = useState("Not_started");
  const [priority, setPriority] = useState("Medium");
  const [urgency, setUrgency] = useState("Short_Term");
  const [loadingProject, setLoadingProject] = useState(true);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [userDepartmentId, setUserDepartmentId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedDeptName, setSelectedDeptName] = useState<string | "">("");
  const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");

  // === AssignedTo ===
  const [assignments, setAssignments] = useState<
    { staffId: number; role: string }[]
  >([]);
  const [staffId, setStaffId] = useState<number | "">("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoadingProject(false);
        return;
      }
      try {
        const res = await Api.get(`/projects/data/${projectId}`);
        setProjectUuid(res.data);
      } catch (err) {
        console.error("Failed to fetch project", err);
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // Load all projects and departments if no projectId is provided
  useEffect(() => {
    if (projectId) return;

    const fetchInitialData = async () => {
      try {
        const [projRes, deptRes] = await Promise.all([
          Api.get("/projects"),
          Api.get("/departments"),
        ]);
        setAllProjects(projRes.data || []);
        setDepartments(deptRes.data || []);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  }, [projectId]);
  // Load user profile to get department
  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await Api.get("/staff-register/staff/viewProfile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDepartment(res.data?.employment?.department?.name || null);
        setUserDepartmentId(res.data?.employment?.department?.id || null);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchProfile();
  }, [token]);

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

  // Load staffs (either project-specific or departmental)
  useEffect(() => {
    if (projectId) {
      if (!projectUuid?.id) return;
      Api.get(`/projects/${projectUuid?.id}/staffs`)
        .then((res) => {
          const clean = (res.data || []).filter(
            (s: any) => s && s.staff && s.staff.id,
          );
          setStaffs(clean);
        })
        .catch(() =>
          setModal({
            type: "error",
            message: "Failed to load project staff list.",
          }),
        );
    } else {
      // Use selectedDeptName if set, otherwise fallback to userDepartment
      const deptToFetch = selectedDeptName || userDepartment;
      if (deptToFetch) {
        Api.get(
          `/staff-register/all/staffs/by-department?name=${encodeURIComponent(deptToFetch)}`,
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
      }
    }
  }, [projectId, projectUuid?.id, userDepartment, selectedDeptName]);

  // useEffect(() => {
  //   if (!projectUuid?.id) return;
  //   Api.get(`/projects/${projectUuid?.id}/staffs`)
  //     .then((res) => setStaffs(res.data || []))
  //     .catch(() =>
  //       setModal({
  //         type: "error",
  //         message: "Failed to load project staff list.",
  //       })
  //     );
  // }, [projectUuid?.id]);

  // Auto-calc timeline (days) when startDate & dueDate are set
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

  const handleCreateTask = async () => {
    if (projectId && !projectUuid?.id) {
      setModal({
        type: "error",
        message: "Project not loaded yet. Try again.",
      });
      return;
    }
    if (!title || !dueDate || !startDate || !sprint) {
      setModal({ type: "error", message: "Please fill required fields." });
      return;
    }
    if (assignments.length === 0) {
      setModal({
        type: "error",
        message:
          "Please assign at least one staff to this task before creating it.",
      });
      return;
    }
    setSubmitting(true);
    const data = {
      title,
      description,
      taskModule,
      sprint,
      status: status || "Not_started",
      priority: priority || "Medium",
      urgency: urgency || "Short_Term",
      startDate,
      dueDate,
      // startDate: new Date(startDate).toISOString(),
      // dueDate: new Date(dueDate).toISOString(),
      timeline,
      projectId: projectUuid?.id || null, // allow null for departmental tasks
      departmentId: selectedDeptId || userDepartmentId,
      departmentName: selectedDeptName || userDepartment,
      assignedTo: assignments,
    };

    console.log("Creating task with data nfo:", data);
    try {
      await Api.post("/task", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ type: "success", message: "Task created successfully!" });
      setTimeout(() => {
        if (projectId) {
          router.push(`/project/${projectId}`);
        } else {
          router.push("/task");
        }
      }, 1200);
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
    <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors py-4">
      <div className="max-w-xl mx-auto px-4 mb-8 mt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-black dark:text-white hover:opacity-75"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Create Task
          </h2>
          <div className="w-[84px]" />
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          {/* Department Selection (only if no projectId in URL) */}
          {!projectId && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Select Department <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDeptId(Number(val));
                  const dept = departments.find((d) => d.id === Number(val));
                  setSelectedDeptName(dept?.name || "");
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1 italic">
                Select a department to filter the assignment staff list.
              </p>
            </div>
          )}

          {/* Project Selection (only if no projectId in URL) */}
          {/* {!projectId && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Select Project <span className="text-red-500">*</span>
              </label>
              <select
                value={projectUuid?.uuid || ""}
                onChange={(e) => {
                  const selected = allProjects.find(p => p.uuid === e.target.value);
                  setProjectUuid(selected || null);
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
              >
                <option value="">-- Choose Project --</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.uuid}>{p.projectName}</option>
                ))}
              </select>
            </div>
          )} */}

          {/* Title */}
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
          />

          {/* Description */}
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white border-gray-700"
          />
          {/* Task Module/Feature */}
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Task Module/Feature <span className="text-red-500"></span>
          </label>
          <input
            value={taskModule}
            onChange={(e) => setTaskModule(e.target.value)}
            placeholder="e.g. Task on Authentication, Dashboard etc"
            className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
          />
          {/* Sprint */}
          <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
            Task Sprint <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            placeholder="Sprint 1"
            className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
          />
          {/* status, urgency and priority */}
          {/* Status */}
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Task Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Priority */}
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
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

          {/* Urgency */}
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Urgency
          </label>
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
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
          />

          {/* Due Date */}
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
          />

          {/* Timeline (auto-calculated) */}
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Timeline (auto-calculated)
          </label>
          <input
            value={timeline}
            readOnly
            className="w-full rounded-lg border px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
          />

          {/* Staff Assignment */}
          <div className="border p-3 rounded-lg bg-gray-50 dark:bg-[#1f1f1f] mt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
              Assign Staff
            </h3>
            <select
              value={staffId}
              onChange={(e) => {
                const selectedId = e.target.value ? Number(e.target.value) : "";
                setStaffId(selectedId);

                if (selectedId) {
                  const selectedStaff = staffs.find(
                    (s) => s && s.staff && s.staff.id === selectedId,
                  );

                  setRole(selectedStaff?.staff.employment?.jobTitle?.[0] || ""); // Auto-fill role
                } else {
                  setRole("");
                }
              }}
              className="w-full rounded-lg border px-3 py-2 mb-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
            >
              <option value="">-- Select Staff --</option>
              {staffs
                ?.filter((s) => s && s.staff && s.staff.id)
                .map((s) => (
                  <option key={s.staff.id} value={s.staff.id}>
                    {s.staff.firstName} {s.staff.lastName} ({s.staff.email})
                  </option>
                ))}
            </select>

            <input
              placeholder="Role (e.g. Lead, Contributor)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 mb-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white"
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
              {assignments
                ?.filter((a) => a && a.staffId)
                .map((a, idx) => {
                  const staffObj = staffs.find(
                    (s) => s && s.staff && s.staff.id === a.staffId,
                  );

                  return (
                    <li
                      key={idx}
                      className="flex justify-between items-center border p-2 rounded-lg bg-white dark:bg-[#141414] transition-colors text-gray-600 dark:text-gray-400"
                    >
                      <span>
                        {staffObj?.staff.firstName} {staffObj?.staff.lastName} (
                        {staffObj?.staff.email}) — <b>{a.role}</b>
                      </span>
                      <button
                        onClick={() =>
                          setAssignments((prev) =>
                            prev.filter((_, i) => i !== idx),
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
