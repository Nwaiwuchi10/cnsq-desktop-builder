"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
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

const STORAGE_KEY = "staff-onboarding-form";

export default function StaffOnboardingForm() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ✅ Now using modal messages
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === STATE ===
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [dateOfBirth, setDob] = useState<string>("");
  const [gender, setGender] = useState<Gender>("Male");
  const [maritalStatus, setMarital] = useState<Marital | "">("");
  const [hobbies, setHobbies] = useState<string>("");

  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [postalCode, setPostal] = useState<string>("");

  const [jobTitle, setJobTitle] = useState<string>("");
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("Full-Time");
  const [workMode, setWorkMode] = useState<WorkMode>("Onsite");
  const [hireDate, setHireDate] = useState<string>("");
  const [reportingManager, setReportingManager] = useState<string>("");
  const [directReport, setDirectReport] = useState<string>("");
  const [contractEndDate, setContractEndDate] = useState<string>("");
  const [status, setStatus] = useState<EmpStatus>("Active");
  const [workLocation, setWorkLocation] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [departmentalRoleId, setDepartmentalRoleId] = useState<number | "">("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<DepartmentalRole[]>([]);

  // File upload
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // === Load saved draft from localStorage ===
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, unknown>;

      const setters: Record<string, (value: unknown) => void> = {
        firstName: (v) => setFirstName(String(v)),
        lastName: (v) => setLastName(String(v)),
        email: (v) => setEmail(String(v)),
        phone: (v) => setPhone(String(v)),
        dateOfBirth: (v) => setDob(String(v)),
        gender: (v) => setGender(v as Gender),
        maritalStatus: (v) => setMarital(v as Marital | ""),
        hobbies: (v) => setHobbies(String(v)),

        city: (v) => setCity(String(v)),
        state: (v) => setState(String(v)),
        country: (v) => setCountry(String(v)),
        postalCode: (v) => setPostal(String(v)),

        jobTitle: (v) => setJobTitle(String(v)),
        employmentType: (v) => setEmploymentType(v as EmploymentType),
        workMode: (v) => setWorkMode(v as WorkMode),
        hireDate: (v) => setHireDate(String(v)),
        reportingManager: (v) => setReportingManager(String(v)),
        directReport: (v) => setDirectReport(String(v)),
        contractEndDate: (v) => setContractEndDate(String(v)),
        status: (v) => setStatus(v as EmpStatus),
        workLocation: (v) => setWorkLocation(String(v)),
        departmentId: (v) => setDepartmentId(v !== "" ? Number(v) : ""),
        departmentalRoleId: (v) =>
          setDepartmentalRoleId(v !== "" ? Number(v) : ""),
      };

      Object.entries(parsed).forEach(([key, value]) => {
        if (value !== undefined && setters[key]) {
          setters[key](value);
        }
      });
    }
  }, []);

  // === Auto-save draft ===
  useEffect(() => {
    const draft = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      hobbies,
      city,
      state,
      country,
      postalCode,
      jobTitle,
      employmentType,
      workMode,
      hireDate,
      reportingManager,
      directReport,
      contractEndDate,
      status,
      workLocation,
      departmentId,
      departmentalRoleId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    maritalStatus,
    hobbies,
    city,
    state,
    country,
    postalCode,
    jobTitle,
    employmentType,
    workMode,
    hireDate,
    reportingManager,
    directReport,
    contractEndDate,
    status,
    workLocation,
    departmentId,
    departmentalRoleId,
  ]);

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

  const totalSteps = 3;
  const progressPct = (step / totalSteps) * 100;

  // === Navigation ===
  const next = () => {
    if (
      step === 1 &&
      (!firstName || !lastName || !email || !phone || !dateOfBirth)
    ) {
      setModal({
        type: "error",
        message: "Fill all required personal fields.",
      });
      return;
    }
    if (step === 2 && (!city || !state || !country)) {
      setModal({ type: "error", message: "Provide city, state, and country." });
      return;
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  // === Handle file ===
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

  // === Submit ===
  const handleSubmit = async () => {
    if (
      !jobTitle ||
      !employmentType ||
      !workMode ||
      !hireDate ||
      !reportingManager ||
      !directReport ||
      !departmentId ||
      !departmentalRoleId
    ) {
      setModal({
        type: "error",
        message: "Please complete required employment fields.",
      });
      return;
    }

    setSubmitting(true);

    const dto = {
      firstName,
      lastName,
      description: hobbies || undefined,
      dateOfBirth,
      gender,
      maritalStatus: maritalStatus || undefined,
      email,
      phone,
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
      await Api.post("/staff-register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModal({ type: "success", message: "Staff created successfully." });
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => router.push("/staff"), 1200);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to create staff.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-16">
      {/* Header */}
      <div className="max-w-xl mx-auto px-4 mb-8 mt-14">
        <div className="flex items-center justify-between">
          <button
            onClick={step > 1 ? back : () => router.back()}
            className="flex items-center gap-2 text-black hover:opacity-75"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Enter New Staff Details
          </h2>
          <div className="w-[84px]" />
        </div>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-medium">
              Step {step} of {totalSteps}
            </p>
            {modal?.type === "success" && (
              <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                <Check size={16} /> {modal.message}
              </span>
            )}
            {/* {success && (
              <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                <Check size={16} /> {success}
              </span>
            )} */}
          </div>
          <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#95D700] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Fields */}
          <div className="mt-6 space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(
                        /[^A-Za-z\s]/g,
                        ""
                      );
                      setFirstName(onlyLetters);
                    }}
                    // onChange={(e) => setFirstName(e.target.value)}
                    pattern="[A-Za-z]+"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    pattern="[A-Za-z]+"
                    value={lastName}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(
                        /[^A-Za-z\s]/g,
                        ""
                      );
                      setLastName(onlyLetters);
                    }}
                    // onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {GENDERS.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMarital(e.target.value as Marital)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">-- Select --</option>
                    {MARITALS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Hobbies
                  </label>
                  <input
                    value={hobbies}
                    onChange={(e) => setHobbies(e.target.value)}
                    placeholder="e.g., reading, football"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                {/* Profile Pic Upload */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Staff Photo
                  </label>
                  {preview ? (
                    <div className="relative inline-block">
                      <Image
                        src={preview}
                        alt="Preview"
                        width={96} // required
                        height={96} // required
                        className="h-24 w-24 rounded-full object-cover"
                      />
                      {/* <img
                        src={preview}
                        alt="Preview"
                        className="h-24 w-24 rounded-full object-cover"
                      /> */}
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  )}
                </div>
              </>
            )}

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
                    Job Title *
                  </label>
                  <input
                    type="text"
                    pattern="[A-Za-z]+"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
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
                  <input
                    type="text"
                    pattern="[A-Za-z]+"
                    value={reportingManager}
                    onChange={(e) => setReportingManager(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Direct Report *
                  </label>
                  <input
                    type="text"
                    pattern="[A-Za-z]+"
                    value={directReport}
                    onChange={(e) => setDirectReport(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
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
          {modal && (
            <CustomModal
              type={modal.type}
              message={modal.message}
              onClose={() => setModal(null)}
            />
          )}

          {/* Only Next/Submit button */}
          <div className="mt-8">
            {step < totalSteps ? (
              <button
                onClick={next}
                className="w-full py-3 rounded-lg bg-[#95D700] text-white font-semibold text-lg hover:opacity-90"
              >
                Next
              </button>
            ) : (
              <button
                style={{ cursor: "pointer" }}
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-[#95D700] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Create Staff"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
