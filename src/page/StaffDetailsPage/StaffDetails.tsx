"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Api from "@/utils/api";
import ProjectCard from "../Projects/ProjectCrad";
interface Project {
  id: number;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
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
  jobTitle: string;
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
  firstName: string;
  lastName: string;
  description?: string | null;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  email: string;
  phone: string;
  photoUrl: string;
  address: Address;
  employment: Employment;
}

export default function StaffDetails() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  // ✅ Always at top level
  const [staff, setStaff] = useState<Staff | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  // const [loadingProjects, setLoadingProjects] = useState(true);

  // ✅ Staff fetch
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

  // ✅ Handle loading state safely
  if (loadingStaff) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAFAFA]">
        <p className="text-gray-500">Loading staff details...</p>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAFAFA]">
        <p className="text-red-500">Staff not found.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 mb-6 hover:text-black mt-16"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6 mb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border">
          <Image
            src={staff.photoUrl}
            alt={`${staff.firstName} ${staff.lastName}`}
            width={112}
            height={112}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {staff.firstName} {staff.lastName}
          </h2>
          <p className="text-gray-600">
            {staff.address.state}, {staff.address.city}
          </p>
          <button className="mt-2 flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#95D700] bg-[#FAFAFA] rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#95D700]"></span>
            {staff.employment?.status}
          </button>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Bio</h3>
        <div className="w-full h-[1px] bg-gray-200 mb-4"></div>
        <p className="text-gray-600">
          {staff.description || "No bio available."}
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="w-full h-[1px] bg-gray-200 mb-4"></div>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
          <p>
            <span className="font-medium">Date of Birth:</span>{" "}
            {staff.dateOfBirth}
          </p>
          <p>
            <span className="font-medium">Gender:</span> {staff.gender}
          </p>
          <p>
            <span className="font-medium">Marital Status:</span>{" "}
            {staff.maritalStatus}
          </p>
          <p>
            <span className="font-medium">Email:</span> {staff.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {staff.phone}
          </p>
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Address</h3>
        <div className="w-full h-[1px] bg-gray-200 mb-4"></div>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
          <p>
            <span className="font-medium">City:</span> {staff.address.city}
          </p>
          <p>
            <span className="font-medium">State:</span> {staff.address.state}
          </p>
          <p>
            <span className="font-medium">Country:</span>{" "}
            {staff.address.country}
          </p>
          <p>
            <span className="font-medium">Postal Code:</span>{" "}
            {staff.address.postalCode}
          </p>
        </div>
      </div>

      {/* Organization Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Organization</h3>
        <div className="w-full h-[1px] bg-gray-200 mb-4"></div>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
          <p>
            <span className="font-medium">Employee Code:</span>{" "}
            {staff.employment.employeeCode}
          </p>
          <p>
            <span className="font-medium">Job Title:</span>{" "}
            {staff.employment.jobTitle}
          </p>
          <p>
            <span className="font-medium">Employment Type:</span>{" "}
            {staff.employment.employmentType}
          </p>
          <p>
            <span className="font-medium">Work Mode:</span>{" "}
            {staff.employment.workMode}
          </p>
          <p>
            <span className="font-medium">Hire Date:</span>{" "}
            {staff.employment.hireDate}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            {staff.employment.status}
          </p>
          <p>
            <span className="font-medium">Reporting Manager:</span>{" "}
            {staff.employment.reportingManager}
          </p>
          <p>
            <span className="font-medium">Direct Report:</span>{" "}
            {staff.employment.directReport}
          </p>
          <p>
            <span className="font-medium">Department:</span>{" "}
            {staff.employment.department.name}
          </p>
          <p>
            <span className="font-medium">Role:</span>{" "}
            {staff.employment.departmentalRole.title}
          </p>
        </div>
      </div>

      {/* projects */}

      <div className="bg-white rounded-2xl shadow-sm mt-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Projects</h3>
        <div className="w-full h-[1px] bg-gray-200 mb-4"></div>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-sm">
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
  );
}
