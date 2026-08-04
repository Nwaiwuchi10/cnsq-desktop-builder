"use client";
import Api from "./api";

export interface ActivityLog {
  id: string;
  staffId: number;
  action: string;
  deviceType: string;
  browser: string;
  location: string;
  ipAddress: string;
  status: string;
  createdAt: string;
  sessionDuration?: string | null;
  referenceId?: string | null;
  staff?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
    employment?: {
      department?: {
        id: number;
        name: string;
      };
      departmentalRole?: {
        id: number;
        title: string;
      };
    };
  };
}

export interface ActivityDirectoryResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginStats {
  totalLogins: number;
  failedAttempts: number;
  totalLogouts: number;
  uniqueStaffCount: number;
  deviceDistribution: Record<string, number>;
  browserDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
  activityTrends: Record<string, number>;
}

// Fetch staff activity directory with filters (CEO view)
export const fetchStaffActivityDirectory = async (params: {
  type?: string;
  date?: string;
  staffId?: number;
  departmentId?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ActivityDirectoryResponse> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("user-token") : null;
    const response = await Api.get("/member-activity/logs/staff-directory", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activity directory:", error);
    throw error;
  }
};

// Fetch login stats (CEO view)
export const getLoginStats = async (params: {
  type?: string;
  date?: string;
  staffId?: number;
}): Promise<LoginStats> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("user-token") : null;
    const response = await Api.get("/member-activity/stats/logins", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching login stats:", error);
    throw error;
  }
};

// Get all staff (for filter dropdowns)
export const getAllStaff = async (): Promise<
  {
    id: number;
    firstName: string;
    lastName: string;
  }[]
> => {
  try {
    const response = await Api.get("/staff-register");
    return response.data;
  } catch (error) {
    console.error("Error fetching all staff:", error);
    throw error;
  }
};

// Get all departments (for filter dropdowns)
export const getAllDepartments = async (): Promise<
  { id: number; name: string }[]
> => {
  try {
    const response = await Api.get("/departments");
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

// Format date for display
export const formatDate = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
