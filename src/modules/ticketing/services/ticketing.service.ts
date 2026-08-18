import Api from "@/utils/api";
import { Ticket, TicketStats, TicketActivity, PaginatedTickets } from "../types/ticketing.types";

export const getTickets = async (params: {
  myPageNum?: number;
  myPageSize?: number;
  mySearch?: string;
  receivedPageNum?: number;
  receivedPageSize?: number;
  receivedSearch?: string;
  allPageNum?: number;
  allPageSize?: number;
  allSearch?: string;
} = {}): Promise<{ myTickets: PaginatedTickets, receivedTickets: PaginatedTickets, allTickets: PaginatedTickets, isHod: boolean, currentUserId: number }> => {
  const { data } = await Api.get("/ticketing", { params });
  return data;
};

export const getTicketStats = async (): Promise<TicketStats> => {
  const { data } = await Api.get("/ticketing/stats");
  return data;
};

export const getTicketDetails = async (id: string): Promise<Ticket> => {
  const { data } = await Api.get(`/ticketing/${id}`);
  return data;
};

export const createTicket = async (formData: FormData): Promise<Ticket> => {
  const { data } = await Api.post("/ticketing", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateTicketStatus = async (
  id: string,
  status: string
): Promise<Ticket> => {
  const { data } = await Api.patch(`/ticketing/${id}/status`, { status });
  return data;
};

export const updateTicket = async (
  id: string,
  formData: FormData
): Promise<Ticket> => {
  const { data } = await Api.patch(`/ticketing/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const addTicketComment = async (
  id: string,
  formData: FormData
): Promise<TicketActivity> => {
  const { data } = await Api.post(`/ticketing/${id}/comments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
