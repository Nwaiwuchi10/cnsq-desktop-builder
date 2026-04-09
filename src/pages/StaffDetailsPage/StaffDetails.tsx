"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Api from "@/utils/api";
import ProjectCard from "../Projects/ProjectCrad";
import editIcon from "../../assests/images/Button.png";
import UpdateProfileModal from "../UpdateStaffProfile/UpdateStaffProfileModal";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";
import StaffCompletionModal from "@/component/StaffCompletionModal/StaffCompletionModal";
interface Project {
  id: number;
  uuid: string;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;

  department: {
    id: number;
    name: string;
  };
  endDate: string;
  priority: "high" | "medium" | "low";
  timeLine: string;
  assignedTo: {
    id: number;
    role: string;
    staff: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      photoUrl?: string;
    };
  }[];
  comments: {
    id: number;
    content: string;
    staff: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
    employment?: {
      department?: {
        name?: string;
      };
    };
  };
}
interface Address {
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface Department {
  name: string;
  description: string;
}

interface DepartmentalRole {
  title: string;
  description: string;
}

interface Employment {
  employeeCode: string;
  jobTitle: string[];
  employmentType: string;
  workMode: string;
  hireDate: string;
  reportingManager: string;
  directReport: string;
  contractEndDate?: string | null;
  status: string;
  workLocation?: string | null;
  department: Department;
  departmentalRole: DepartmentalRole;
}

interface Staff {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  description?: string | null;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  email: string;
  phone: string;
  hobbies: string[];
  photoUrl: string;
  address: Address;
  employment: Employment;
}

interface CompletionData {
  staffId: number;
  staffName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  performance: {
    level: "GREEN" | "YELLOW" | "RED";
    colorCode: string;
    label: "Excellent" | "Moderate" | "Needs Attention";
  };
}

export default function StaffDetails() {
  const params = useParams();
  const uuid = params?.uuid as string;
  const router = useRouter();

  // ✅ Always at top level
  const [staffUUid, setStaffUUid] = useState<Staff | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [completionData, setCompletionData] = useState<CompletionData | null>(
    null,
  );
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loadingCompletion, setLoadingCompletion] = useState(false);

  useEffect(() => {
    const Id = localStorage.getItem("userId");
    if (Id) {
      setUserId(Number(Id));
    }
  }, []);
  // const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!uuid) return;

    const fetchStaff = async () => {
      try {
        const res = await Api.get(`/staff-register/data/${uuid}`);
        setStaffUUid(res.data);
        // If we don't have an ID, we won't trigger the second fetch, so stop loading here
        if (!res.data?.id) {
          setLoadingStaff(false);
        }
      } catch (err) {
        console.error(err);
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [uuid]);
  // ✅ Staff fetch

  const id = staffUUid?.id;
  useEffect(() => {
    if (!id) return;

    const fetchStaff = async () => {
      try {
        const res = await Api.get(`/staff-register/${id}`);
        setStaff(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [id]);

  // ✅ Projects fetch
  useEffect(() => {
    if (!id) return;

    const fetchProjects = async () => {
      try {
        const res = await Api.get(`/projects/staff/all/${id}`);
        setProjects(res.data.data || []); // return empty array if none
      } catch (err) {
        console.error("Error fetching projects:", err);
        setProjects([]); // fallback
      } finally {
        // setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [id]);

  // ✅ Fetch staff completion level
  useEffect(() => {
    if (!id) return;

    const fetchCompletionLevel = async () => {
      try {
        setLoadingCompletion(true);
        const res = await Api.get(`/task/staff/${id}/completion-level`);
        setCompletionData(res.data);
      } catch (err) {
        console.error("Error fetching completion level:", err);
      } finally {
        setLoadingCompletion(false);
      }
    };

    fetchCompletionLevel();
  }, [id]);

  // ✅ Handle loading state safely
  if (loadingStaff) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors">
        <LoadingSpinner />
        {/* <p className="text-gray-500 dark:text-gray-400">Loading staff details...</p> */}
      </div>
    );
  }

  if (!staffUUid || !staff) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors">
        <p className="text-red-500">Staff not found.</p>
      </div>
    );
  }
  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d0d0d] p-4 sm:p-8 transition-colors">
        {/* Back Button */}
        <div className="flex justify-between items-center mt-16 mb-6">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {/* Edit icon */}
          {userId === Number(id) && (
            <span
              className="cursor-pointer"
              onClick={() => setShowEditModal(true)}
            >
              <Image src={editIcon} alt="edit icon" />
            </span>
          )}
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-transparent dark:border-gray-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mb-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden border dark:border-gray-700">
                <Image
                  src={staff?.photoUrl || "/default-avatar.png"}
                  alt={`${staff?.firstName} ${staff?.lastName}`}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Completion Indicator */}
              {completionData && (
                <div
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform duration-200"
                  style={{
                    backgroundColor: completionData.performance.colorCode,
                  }}
                  onClick={() => setShowCompletionModal(true)}
                  title="Click to view workload status"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setShowCompletionModal(true);
                    }
                  }}
                />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl text-gray-800 dark:text-gray-100 font-semibold">
                {staff?.firstName} {staff?.lastName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {staff.address.state}, {staff.address.city}
              </p>
              <button className="mt-2 sm:mx-0 mx-auto flex items-center justify-center gap-2 px-3 py-1 text-sm font-medium text-[#95D700] bg-[#FAFAFA] dark:bg-[#1a1a1a] rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#95D700]"></span>
                {staff.employment?.status}
              </button>
            </div>
          </div>

          <Link href={`/staff/${uuid}/task`}>
            <button className="px-6 py-2 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-[#78B500] transition h-11">
              View Task
            </button>
          </Link>
        </div>

        {/* Bio Section */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-transparent dark:border-gray-800 p-6 mb-6 transition-colors">
          <h3 className="text-lg text-gray-600 dark:text-gray-300 font-semibold mb-2">Bio</h3>
          <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {staff.description || "No bio available."}
          </p>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-transparent dark:border-gray-800 p-6 mb-6 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-300">
            Personal Information
          </h3>
          <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800 mb-4"></div>
          <div className="grid sm:grid-cols-2 gap-4 text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Date of Birth:</span>{" "}
              {staff.dateOfBirth
                ? staff.dateOfBirth.replace(/^\d{4}/, "****")
                : "N/A"}
            </p>

            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Gender:</span> {staff.gender}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Marital Status:</span>{" "}
              {staff.maritalStatus}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Email:</span> {staff.email}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Phone:</span> {staff.phone}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Hobbies:</span>{" "}
              <div className="flex flex-wrap gap-2 mt-1">
                {staff?.hobbies?.length ? (
                  staff.hobbies.map((title: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs"
                    >
                      {title}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm"></span>
                )}
              </div>
              {/* {staff.employment.jobTitle} */}
            </p>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-transparent dark:border-gray-800 p-6 mb-6 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-300">Address</h3>
          <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800 mb-4"></div>
          <div className="grid sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-400">
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">City:</span> {staff.address.city}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">State:</span> {staff.address.state}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Country:</span>{" "}
              {staff.address.country}
            </p>
          </div>
        </div>

        {/* Organization Section */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-transparent dark:border-gray-800 p-6 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-300">
            Organization
          </h3>
          <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800 mb-4"></div>
          <div className="grid sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-400">
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Employee Code:</span>{" "}
              {staff.employment.employeeCode}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Job Title:</span>{" "}
              <div className="flex flex-wrap gap-2 mt-1">
                {staff?.employment?.jobTitle?.length ? (
                  staff.employment.jobTitle.map((title: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs"
                    >
                      {title}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Not Assigned</span>
                )}
              </div>
              {/* {staff.employment.jobTitle} */}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Employment Type:</span>{" "}
              {staff.employment.employmentType}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Work Mode:</span>{" "}
              {staff.employment.workMode}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Hire Date:</span>{" "}
              {staff.employment.hireDate}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Status:</span>{" "}
              {staff.employment.status}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Reporting Manager:</span>{" "}
              {staff.employment.reportingManager}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Direct Report:</span>{" "}
              {staff.employment.directReport}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Department:</span>{" "}
              {staff.employment.department.name}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-200">Departmental Unit:</span>{" "}
              {staff.employment.departmentalRole.title}
            </p>
          </div>
        </div>

        {/* projects */}

        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-transparent dark:border-gray-800 mt-6 p-6 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-300">Projects</h3>
          <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800 mb-4"></div>
          {projects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No project found for this staff.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
        {/* projects */}
      </div>

      <div>
        {showEditModal && (
          <UpdateProfileModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onUpdated={() => {
              setShowEditModal(false);
              // refetch staff after update
              Api.get(`/staff-register/${id}`).then((res) =>
                setStaff(res.data),
              );
            }}
          />
        )}

        <StaffCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          data={completionData}
        />
      </div>
    </>
  );
}
