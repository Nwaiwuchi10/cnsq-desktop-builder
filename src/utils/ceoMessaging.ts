import Api from "./api";

export interface CeoMessageReadStats {
  totalStaff: number;
  readCount: number;
  unreadCount: number;
}

export interface CeoMessageReader {
  id: number;
  readAt: string;
  staff: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
  };
}

export const getCeoMessageReadStats = async (id: string): Promise<CeoMessageReadStats> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("user-token") : null;
    const response = await Api.get(`/ceo-messaging-center/read-stats/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getCeoMessageReaders = async (id: string): Promise<CeoMessageReader[]> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("user-token") : null;
    const response = await Api.get(`/ceo-messaging-center/readers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
