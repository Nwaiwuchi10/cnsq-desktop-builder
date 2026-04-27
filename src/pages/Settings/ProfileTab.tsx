"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import Image from "next/image";
import CustomModal from "@/component/Message/Message";

const GENDERS = ["Male", "Female"] as const;
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

export default function ProfileTab() {
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
  const [hobbiesinput, setHobbiesInput] = useState("");
  
  // === Localstorage ===
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setUserId(Number(id));
    }
  }, []);

  // === Fetch staff details for prefill ===
  useEffect(() => {
    if (!userId) return;

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
        setDescription(s.description || ""); 

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
        setModal({ type: "error", message: "Failed to load profile data." })
      )
      .finally(() => setLoading(false));
  }, [userId]);

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
      
      // Optionally reset step to 1 after success
      setTimeout(() => {
         setStep(1);
         setModal(null);
      }, 2000);
    } catch (e) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#141414] w-full rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 max-w-4xl min-h-[60vh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={back}
              className="flex justify-center items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          )}
          <div>
             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">Step {step} of {totalSteps}</p>
          </div>
        </div>
      </div>

      <div className="mt-2 h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-[#95D700] transition-all duration-300 ease-in-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#95D700]"></div>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Photo Upload spanning full width or partial */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Staff Photo</label>
                <div className="flex items-center gap-4">
                  {preview ? (
                    <div className="relative inline-block">
                      <Image
                        src={preview}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-sm"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
                        No Photo
                    </div>
                  )}
                  <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#95D700]/10 file:text-[#7ab000] hover:file:bg-[#95D700]/20 transition-colors cursor-pointer"
                    />
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              {/* DOB */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                >
                  {GENDERS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              {/* Marital */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marital Status</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMarital(e.target.value as Marital)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                >
                  <option value="">-- Select --</option>
                  {MARITALS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              
              {/* Hobbies */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hobbies
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hobbiesinput}
                    onChange={(e) => setHobbiesInput(e.target.value)}
                    placeholder="e.g., Reading, Football"
                    className="flex-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        hobbiesinput.trim() &&
                        !hobbies.includes(hobbiesinput.trim())
                      ) {
                        setHobbies([...hobbies, hobbiesinput.trim()]);
                        setHobbiesInput("");
                      }
                    }}
                    className="px-6 py-2 bg-[#95D700] hover:bg-[#86CD23] text-white rounded-lg transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {hobbies.map((hobby) => (
                    <span
                      key={hobby}
                      className="bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium"
                    >
                      {hobby}
                      <button
                        type="button"
                        onClick={() =>
                          setHobbies(hobbies.filter((h) => h !== hobby))
                        }
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tell us more about yourself
                </label>
                <textarea
                  value={description}
                  rows={4}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  pattern="[A-Za-z]+"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State *
                </label>
                <input
                  value={state}
                  pattern="[A-Za-z]+"
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  value={country}
                  pattern="[A-Za-z]+"
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostal(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Titles *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                    placeholder="e.g., Frontend Developer"
                    className="flex-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={addJobTitle}
                    className="px-6 py-2 bg-[#95D700] hover:bg-[#86CD23] text-white rounded-lg transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {jobTitle.map((t) => (
                    <span
                      key={t}
                      className="bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeJobTitle(t)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employment Type *
                </label>
                <select
                  value={employmentType}
                  onChange={(e) =>
                    setEmploymentType(e.target.value as EmploymentType)
                  }
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Mode *
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                >
                  {WORK_MODES.map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hire Date *
                </label>
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reporting Manager *
                </label>
                <select
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Direct Report *
                </label>
                <select
                  value={directReport}
                  onChange={(e) => setDirectReport(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Location
                </label>
                <input
                  type="text"
                  pattern="[A-Za-z]+"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department *
                </label>
                <select
                  value={departmentId}
                  onChange={(e) =>
                    setDepartmentId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Departmental Role *
                </label>
                <select
                  value={departmentalRoleId}
                  onChange={(e) =>
                    setDepartmentalRoleId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-shadow"
                >
                  <option value="">-- Select Role --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.title} ({role.department?.name || "No Dept"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      {!loading && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          {step < totalSteps ? (
            <button
              onClick={next}
              className="px-6 py-2.5 bg-[#95D700] hover:bg-[#86CD23] text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={submitting}
              className="px-8 py-2.5 bg-[#95D700] hover:bg-[#86CD23] text-white rounded-lg disabled:opacity-50 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[140px]"
            >
              {submitting ? (
                <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Updating...
                </>
              ) : (
                "Save Updates"
              )}
            </button>
          )}
        </div>
      )}

      {modal && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
