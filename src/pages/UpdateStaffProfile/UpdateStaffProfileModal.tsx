"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import Image from "next/image";
import CustomModal from "@/component/Message/Message";

const GENDERS = ["Male", "Female", "Other"] as const;
const MARITALS = ["Single", "Married", "Divorced", "Widowed"] as const;
const EMPLOYMENT_TYPES = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Intern",
] as const;
const WORK_MODES = ["Onsite", "Remote", "Hybrid"] as const;
const EMPLOYMENT_STATUS = [
  "Active",
  "Inactive",
  "Suspended",
  "Terminated",
] as const;

type Gender = (typeof GENDERS)[number];
type Marital = (typeof MARITALS)[number];
type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
type WorkMode = (typeof WORK_MODES)[number];
type EmpStatus = (typeof EMPLOYMENT_STATUS)[number];

interface Department {
  id: number;
  name: string;
}
interface DepartmentalRole {
  id: number;
  title: string;
  department: Department;
}
interface Staff {
  id: number;
  firstName: string;
  lastName: string;
}
interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function UpdateProfileModal({
  isOpen,
  onClose,
  onUpdated,
}: UpdateProfileModalProps) {
  // === LocalStorage userId ===
  const [userId, setUserId] = useState<number | null>(null);

  // === Steps ===
  const [step, setStep] = useState<number>(1);
  const totalSteps = 3;
  const progressPct = (step / totalSteps) * 100;

  // === Flags ===
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ✅ Modal messages
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === STATE (all onboarding fields) ===
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [maritalStatus, setMarital] = useState<Marital | "">("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [description, setDescription] = useState(""); // ✅ New field

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostal] = useState("");

  const [jobTitle, setJobTitle] = useState<string[]>([]);
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("Full-Time");
  const [workMode, setWorkMode] = useState<WorkMode>("Onsite");
  const [hireDate, setHireDate] = useState("");
  const [reportingManager, setReportingManager] = useState("");
  const [directReport, setDirectReport] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [status, setStatus] = useState<EmpStatus>("Active");
  const [workLocation, setWorkLocation] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [departmentalRoleId, setDepartmentalRoleId] = useState<number | "">("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<DepartmentalRole[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);

  // === File Upload ===
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // === Localstorage ===
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setUserId(Number(id));
    }
  }, []);

  // === Fetch staff details for prefill ===
  useEffect(() => {
    if (!isOpen || !userId) return;

    setLoading(true);
    Api.get(`/staff-register/${userId}`)
      .then((res) => {
        const s = res.data;

        // Prefill all inputs
        setFirstName(s.firstName || "");
        setLastName(s.lastName || "");
        setEmail(s.email || "");
        setPhone(s.phone || "");
        setDob(s.dateOfBirth || "");
        setGender(s.gender || "Male");
        setMarital(s.maritalStatus || "");
        setHobbies(s.hobbies || []);
        setDescription(s.description || ""); // ✅

        setCity(s.address?.city || "");
        setState(s.address?.state || "");
        setCountry(s.address?.country || "");
        setPostal(s.address?.postalCode || "");

        setJobTitle(s.employment?.jobTitle || []);
        setEmploymentType(s.employment?.employmentType || "Full-Time");
        setWorkMode(s.employment?.workMode || "Onsite");
        setHireDate(s.employment?.hireDate || "");
        setReportingManager(s.employment?.reportingManager || "");
        setDirectReport(s.employment?.directReport || "");
        setContractEndDate(s.employment?.contractEndDate || "");
        setStatus(s.employment?.status || "Active");
        setWorkLocation(s.employment?.workLocation || "");
        setDepartmentId(s.employment?.departmentId || "");
        setDepartmentalRoleId(s.employment?.departmentalRoleId || "");

        if (s.photoUrl) setPreview(s.photoUrl);
      })
      .catch(() =>
        setModal({ type: "error", message: "Failed to load staff data." })
      )
      .finally(() => setLoading(false));
  }, [isOpen, userId]);
  useEffect(() => {
    Api.get("/staff-register")
      .then((res) => setStaffs(res.data || []))
      .catch(() =>
        setModal({ type: "error", message: "Failed to load staff list." })
      );
  }, []);
  // === Fetch dropdowns ===
  useEffect(() => {
    Api.get("/departments")
      .then((res) => setDepartments(res.data || []))
      .catch(() =>
        setModal({ type: "error", message: "Failed to load departments." })
      );
  }, []);

  useEffect(() => {
    Api.get("/departmental-role")
      .then((res) => setRoles(res.data || []))
      .catch(() =>
        setModal({ type: "error", message: "Failed to load roles." })
      );
  }, []);

  // === Helpers ===
  const addJobTitle = () => {
    if (jobTitleInput.trim() && !jobTitle.includes(jobTitleInput.trim())) {
      setJobTitle([...jobTitle, jobTitleInput.trim()]);
      setJobTitleInput("");
    }
  };
  const removeJobTitle = (title: string) => {
    setJobTitle(jobTitle.filter((t) => t !== title));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setPhoto(f);
      setPreview(URL.createObjectURL(f));
    }
  };
  const removeFile = () => {
    setPhoto(null);
    setPreview(null);
  };

  // === Navigation ===
  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  // === Submit Update ===
  const handleUpdate = async () => {
    if (!userId) return;

    setSubmitting(true);

    const dto = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      maritalStatus: maritalStatus || undefined,
      hobbies: hobbies.length ? hobbies : undefined,
      description,
      address: { city, state, country, postalCode: postalCode || undefined },
      employment: {
        jobTitle,
        employmentType,
        workMode,
        hireDate,
        reportingManager,
        directReport,
        contractEndDate: contractEndDate || undefined,
        status,
        workLocation: workLocation || undefined,
        departmentId: Number(departmentId),
        departmentalRoleId: Number(departmentalRoleId),
      },
    };

    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    if (photo) formData.append("imgFile", photo);

    try {
      await Api.patch(`/staff-register/${userId}/update-profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModal({ type: "success", message: "Profile updated successfully." });
      setTimeout(() => {
        onUpdated();
      }, 1200);
    } catch (e) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to update staff.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={step > 1 ? back : onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} /> <span>Back</span>
          </button>
          <h2 className="text-xl font-semibold">Update Profile</h2>
          <div className="w-[64px]" />
        </div>

        <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#95D700]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-6">Loading...</p>
        ) : (
          <div className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* === Same steps from onboarding (Step 1, 2, 3) === */}
            {/* Add description field in Step 1 */}
            {step === 1 && (
              <>
                {/* First Name */}
                <div>
                  <label className="block text-sm mb-1">First Name *</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                {/* Last Name */}
                <div>
                  <label className="block text-sm mb-1">Last Name *</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-sm mb-1">Phone *</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                {/* DOB */}
                <div>
                  <label className="block text-sm mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                {/* Gender */}
                <div>
                  <label className="block text-sm mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {GENDERS.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                {/* Marital */}
                <div>
                  <label className="block text-sm mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMarital(e.target.value as Marital)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">-- Select --</option>
                    {MARITALS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                {/* Hobbies */}
                <div>
                  <label className="block text-sm mb-1">Hobbies</label>
                  <input
                    value={hobbies.join(", ")}
                    onChange={(e) =>
                      setHobbies(
                        e.target.value
                          .split(",")
                          .map((h) => h.trim())
                          .filter((h) => h)
                      )
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                {/* ✅ Description */}
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                {/* Photo */}
                <div>
                  <label className="block text-sm mb-1">Staff Photo</label>
                  {preview ? (
                    <div className="relative inline-block">
                      <Image
                        src={preview}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  )}
                </div>
              </>
            )}

            {/* Step 2 (Address) & Step 3 (Employment) should follow exactly like onboarding code */}
            {/* ... for brevity I can paste the same structure as your StaffOnboardingForm */}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    pattern="[A-Za-z]+"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    value={state}
                    pattern="[A-Za-z]+"
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={country}
                    pattern="[A-Za-z]+"
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostal(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Job Titles *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={jobTitleInput}
                      onChange={(e) => setJobTitleInput(e.target.value)}
                      placeholder="e.g., Frontend Developer"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={addJobTitle}
                      className="px-3 py-2 bg-[#95D700] text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {jobTitle.map((t) => (
                      <span
                        key={t}
                        className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeJobTitle(t)}
                          className="text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Employment Type *
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) =>
                      setEmploymentType(e.target.value as EmploymentType)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Work Mode *
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {WORK_MODES.map((w) => (
                      <option key={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Hire Date *
                  </label>
                  <input
                    type="date"
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Reporting Manager *
                  </label>
                  <select
                    value={reportingManager}
                    onChange={(e) => setReportingManager(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">-- Select Manager --</option>
                    {staffs.map((staff) => (
                      <option
                        key={staff.id}
                        value={`${staff.firstName} ${staff.lastName}`}
                      >
                        {staff.firstName} {staff.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Direct Report *
                  </label>
                  <select
                    value={directReport}
                    onChange={(e) => setDirectReport(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">-- Select Direct Report --</option>
                    {staffs.map((staff) => (
                      <option
                        key={staff.id}
                        value={`${staff.firstName} ${staff.lastName}`}
                      >
                        {staff.firstName} {staff.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Reporting Manager *
                  </label>
                  <select
                    value={reportingManager}
                    onChange={(e) => setReportingManager(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">-- Select Manager --</option>
                    {staffs.map((staff) => (
                      <option
                        key={staff.id}
                        value={`${staff.firstName} ${staff.lastName}`}
                      >
                        {staff.firstName} {staff.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Direct Report *
                  </label>
                  <select
                    value={directReport}
                    onChange={(e) => setDirectReport(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">-- Select Direct Report --</option>
                    {staffs.map((staff) => (
                      <option
                        key={staff.id}
                        value={`${staff.firstName} ${staff.lastName}`}
                      >
                        {staff.firstName} {staff.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Contract End Date
                  </label>
                  <input
                    type="date"
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Employment Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmpStatus)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {EMPLOYMENT_STATUS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Work Location
                  </label>
                  <input
                    type="text"
                    pattern="[A-Za-z]+"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) =>
                      setDepartmentId(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Departmental Role *
                  </label>
                  <select
                    value={departmentalRoleId}
                    onChange={(e) =>
                      setDepartmentalRoleId(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title} ({role.department?.name || "No Dept"})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          {step < totalSteps ? (
            <button
              onClick={next}
              className="px-4 py-2 bg-[#95D700] text-white rounded-lg"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={submitting}
              className="px-4 py-2 bg-[#95D700] text-white rounded-lg disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update"}
            </button>
          )}
        </div>

        {modal && (
          <CustomModal
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </div>
  );
}
