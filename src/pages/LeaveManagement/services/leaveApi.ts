import Api from "@/utils/api";

export interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Cancelled' | 'Completed';
  submittedAt: string;
  staff: {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  handoverStaff: {
    id: number;
    firstName: string;
    lastName: string;
  };
  supervisors: Array<{
    id: number;
    firstName: string;
    lastName: string;
  }>;
  reviewNotes?: string;
  reviewedBy?: {
    id?: number;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  attachedDocument?: string;
  handoverNotes?: string;
}

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  cancelled: number;
  completed: number;
}

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("user-token") : null;
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const leaveApi = {
  getHistory: async (search?: string, status?: string) => {
    const response = await Api.get<LeaveRequest[]>("/leave-request/me", {
      params: { search: search || undefined, status: status || undefined },
      headers: getHeaders()
    });
    return response.data;
  },
  getStats: async () => {
    const response = await Api.get<LeaveStats>("/leave-request/me/stats", {
      headers: getHeaders()
    });
    return response.data;
  },
  getAdminHistory: async (search?: string) => {
    const response = await Api.get<LeaveRequest[]>("/leave-request/admin/all", {
      params: { search },
      headers: getHeaders()
    });
    return response.data;
  },
  getAdminStats: async () => {
    const response = await Api.get<LeaveStats>("/leave-request/admin/stats", {
      headers: getHeaders()
    });
    return response.data;
  },
  createRequest: async (formData: FormData) => {
    const response = await Api.post("/leave-request", formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getDetails: async (id: string) => {
    const response = await Api.get<LeaveRequest>(`/leave-request/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },
  getSupervisorHistory: async (search?: string) => {
    const response = await Api.get<LeaveRequest[]>("/leave-request/supervisor/all", {
      params: { search },
      headers: getHeaders()
    });
    return response.data;
  },
  getSupervisorStats: async () => {
    const response = await Api.get<LeaveStats>("/leave-request/supervisor/stats", {
      headers: getHeaders()
    });
    return response.data;
  },
  getSupervisorMe: async (search?: string, status?: string) => {
    const response = await Api.get<LeaveRequest[]>("/leave-request/supervisor/me", {
      params: { search: search || undefined, status: status || undefined },
      headers: getHeaders()
    });
    return response.data;
  },
  isSupervisorCheck: async () => {
    const response = await Api.get<{ isSupervisor: boolean }>("/leave-request/supervisor/check", {
      headers: getHeaders()
    });
    return response.data;
  },
  updateStatus: async (id: string, status: 'Approved' | 'Declined', reviewNotes: string) => {
    const response = await Api.patch(`/leave-request/${id}/status`, {
      status,
      reviewNotes
    }, {
      headers: getHeaders()
    });
    return response.data;
  },
  updateRequest: async (id: string, formData: FormData) => {
    const response = await Api.patch(`/leave-request/${id}`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
