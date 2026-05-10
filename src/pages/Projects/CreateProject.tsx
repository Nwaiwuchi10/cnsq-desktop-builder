"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";
import Image from "next/image";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employment: {
    jobTitle: string[];
  };
}
interface Department {
  id: number;
  name: string;
}
const PROJECT_STATUSES = ["not_started", "in_progress", "testing", "completed"];
const PROJECT_PRIORITIES = ["low", "medium", "high", "critical"];

export default function ProjectWizardForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  //   const token = localStorage.getItem("user-token");
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

  const totalSteps = 2;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === Project state ===
  const [projectName, setProjectName] = useState("");
  const [desc, setDesc] = useState("");
  const [timeLine, setTimeLine] = useState("");
  const [status, setStatus] = useState("not_started");
  const [priority, setPriority] = useState("medium");
  const [prodUrl, setProdUrl] = useState("");
  const [stagingUrl, setStagingUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [apk, setApk] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<number | "">("");

  // === Step 2: Assignment ===
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffId, setStaffId] = useState<number | "">("");

  const [role, setRole] = useState("");

  // === Store created projectId after step 1 ===
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<
    { staffId: number; role: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setTimeLine(`${diffDays} days`);
      } else {
        setTimeLine("");
      }
    }
  }, [startDate, endDate]);
  useEffect(() => {
    Api.get("/departments")
      .then((res) => setDepartments(res.data || []))
      .catch(() =>
        setModal({ type: "error", message: "Failed to load departments." }),
      );
  }, []);
  useEffect(() => {
    if (step === 2) {
      Api.get("/staff-register")
        .then((res) => setStaffs(res.data || []))
        .catch(() =>
          setModal({ type: "error", message: "Failed to load staff list." }),
        );
    }
  }, [step]);

  const progressPct = (step / totalSteps) * 100;

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  ////file upload handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setApk(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const removeFile = () => {
    setApk(null);
    setPreview(null);
  };
  // === Step 1: Create Project ===
  const handleCreateProject = async () => {
    if (!projectName || !desc || !startDate || !timeLine || !endDate) {
      setModal({
        type: "error",
        message: "Please fill all required project fields.",
      });
      return;
    }
    // if (!token) return;
    setSubmitting(true);
    const dto = {
      projectName,
      desc,
      status,
      priority,
      timeLine,
      apk,
      prodUrl: prodUrl || undefined,
      stagingUrl: stagingUrl || undefined,
      startDate,
      endDate,
      departmentId: Number(departmentId),
    };
    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    if (apk) formData.append("apk", apk);
    try {
      const res = await Api.post("/projects", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCreatedProjectId(res.data.id);
      setModal({ type: "success", message: "Project created successfully!" });
      next();
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to create project.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignStaff = async () => {
    if (assignments.length === 0) {
      setModal({
        type: "error",
        message: "Please add at least one staff or click Skip.",
      });
      return;
    }
    // if (!token) return;
    setSubmitting(true);
    try {
      await Api.post(
        `/projects/${createdProjectId}/assign`,
        {
          projectId: createdProjectId,
          assignments, // send the array
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setModal({ type: "success", message: "Staff assigned successfully!" });
      setTimeout(() => router.push("/project"), 1200);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to assign staff.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const skipAssign = () => {
    router.push("/project");
  };
  const filteredStaffs = staffs.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors py-2">
      {/* Header */}
      <div className="max-w-xl mx-auto px-4 mb-8 mt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={step > 1 ? back : () => router.back()}
            className="flex items-center gap-2 text-black dark:text-white hover:opacity-75"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            {step === 1 ? "Create Project" : "Assign Staff"}
          </h2>
          <div className="w-[84px]" />
        </div>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Step {step} of {totalSteps}
            </p>
            {modal?.type === "success" && (
              <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                <Check size={16} /> {modal.message}
              </span>
            )}
          </div>
          <div className="mt-3 h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#95D700] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Fields */}
          <div className="mt-6 space-y-4">
            {step === 1 && (
              <>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />

                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter project description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />
                <div>
                  <label className="block text-sm  mb-1 text-gray-600 dark:text-gray-400">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) =>
                      setDepartmentId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                >
                  {PROJECT_PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Production URL
                </label>
                <input
                  placeholder="https://example.com"
                  value={prodUrl}
                  onChange={(e) => setProdUrl(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />

                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Staging URL
                </label>
                <input
                  placeholder="https://staging.example.com"
                  value={stagingUrl}
                  onChange={(e) => setStagingUrl(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />
                {/* //file input */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Mobile App APK File
                  </label>
                  {apk ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {apk.name}
                      </span>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleFileChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2"
                    />
                  )}
                </div>

                {/* ////file input */}
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />

                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                />
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Timeline <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Auto-calculated from dates"
                  value={timeLine}
                  readOnly
                  className="w-full rounded-lg border px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  You can assign staff to this project now, or <b>skip</b> this
                  step and assign later.
                </p>

                {/* Add Staff-Role Pair */}
                <div className="flex flex-col gap-3 relative border p-3 rounded-lg bg-gray-50 dark:bg-[#1f1f1f]">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Select Staff
                  </label>
                  <input
                    type="text"
                    placeholder="Search staff by name or email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedStaff(null);
                    }}
                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-[#141414] transition-colors text-gray-600 dark:text-gray-400"
                  />

                  {/* Dropdown results */}
                  {search && !selectedStaff && (
                    <ul className="absolute top-32 left-0 right-0 bg-white dark:bg-[#141414] transition-colors text-gray-600 dark:text-gray-400 border rounded-lg max-h-40 overflow-y-auto shadow-md z-10">
                      {filteredStaffs.length === 0 && (
                        <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                          No staff found
                        </li>
                      )}
                      {filteredStaffs.map((s) => (
                        <li
                          key={s.id}
                          onClick={() => {
                            setSelectedStaff(s);
                            setSearch(
                              `${s.firstName} ${s.lastName} (${s.email})`,
                            );

                            //  Auto-fill role from employment.jobTitle (first one if array)
                            if (s.employment?.jobTitle?.length) {
                              setRole(s.employment.jobTitle[0]);
                            } else {
                              setRole("");
                            }
                          }}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:bg-gray-800"
                        >
                          {s.firstName} {s.lastName} ({s.email})
                        </li>
                      ))}
                    </ul>
                  )}
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Role
                  </label>
                  <input
                    placeholder="e.g. Lead, Contributor"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-[#1a1a1a] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                  />

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

                {/* Show Added Staff-Role Pairs */}
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
                    Assigned Staff
                  </h3>
                  {assignments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No staff added yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {assignments.map((a, idx) => {
                        const staff = staffs.find((s) => s.id === a.staffId);
                        return (
                          <li
                            key={idx}
                            className="flex justify-between text-gray-600 dark:text-gray-400 items-center border p-2 rounded-lg bg-white dark:bg-[#141414] transition-colors"
                          >
                            <span>
                              {staff?.firstName} {staff?.lastName} (
                              {staff?.email}) — <b>{a.role}</b>
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
                  )}
                </div>
              </>
            )}
          </div>

          {modal && (
            <CustomModal
              type={modal.type}
              message={modal.message}
              onClose={() => setModal(null)}
            />
          )}

          <div className="mt-8">
            {step === 1 ? (
              <button
                style={{ cursor: "pointer" }}
                onClick={handleCreateProject}
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-[#95D700] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Create Project"}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleAssignStaff}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-lg bg-[#95D700] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Assign Staff"}
                </button>
                <button
                  onClick={skipAssign}
                  className="flex-1 py-3 rounded-lg bg-gray-300 text-black dark:text-white font-semibold text-lg hover:opacity-80"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
