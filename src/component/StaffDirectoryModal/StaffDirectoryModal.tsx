"use client";

import { Mail, MapPin, Phone, X } from "lucide-react";
import Image from "next/image";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";
import Link from "next/link";
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
interface StaffDirectoryModalProps {
  department: string;
  staffList: Staff[];
  loading: boolean;
  onClose: () => void;
}

export default function StaffDirectoryModal({
  department,
  staffList,
  loading,
  onClose,
}: StaffDirectoryModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {department} Department & Job Title
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : staffList.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            No staff found under {department}.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffList.map((person) => (
              <div
                key={person.id}
                className="flex flex-col justify-between border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
              >
                {/* Profile Picture + Name + Role */}
                <div className="flex items-center gap-4">
                  <Image
                    src={person?.photoUrl || "/default-avatar.png"}
                    alt={`${person.firstName} ${person.lastName}`}
                    width={50}
                    height={50}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold">
                      {person.firstName} {person.lastName}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {person?.employment?.jobTitle?.length ? (
                        person.employment.jobTitle.map(
                          (title: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                            >
                              {title}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Not Assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="mt-4">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
                    {person?.employment?.department?.name || "No Department"}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
                  <Mail size={16} />
                  <span>{person?.email}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <Phone size={16} />
                  <span>{person?.phone}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>
                    {person.address?.city}, {person.address?.state}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap mt-4 gap-2">
                    {person?.employment?.jobTitle?.length ? (
                      person?.employment?.jobTitle.map(
                        (title: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                          >
                            {title}
                          </span>
                        ),
                      )
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Not Assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* View Profile */}
                <Link href={`/staff/${person.uuid}`} className="w-full">
                  <button className="mt-6 w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-[#78B500] transition">
                    View Profile
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
