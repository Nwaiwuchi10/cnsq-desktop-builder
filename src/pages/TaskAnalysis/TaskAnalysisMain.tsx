"use client";

import { useEffect, useState } from "react";
import Api from "@/utils/api";
import TaskHeader from "./TaskHeader";
import CompletedTasksList from "./CompletedTasksList";
import OpenTasksList from "./OpenTasksList";
import ProductivityDashboard from "./ProductivityDashboard";
import CurrentWork from "./CurrentWork";
import ActiveTasksList from "./ActiveTasksList";
import Navbar from "@/component/Navbar/Navbar";
import Footer from "@/component/Footer/Footer";

// Type definitions
interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  urgency: string;
  progress: number;
  project: string;
  projectId: number | null;
  dueDate: string | null;
  startDate: string | null;
  sprint: number;
  createdBy: string | null;
  description?: string;
}

interface CompletedTask {
  id: number;
  title: string;
  status: string;
  completedDate: string;
  project: string;
  projectId: number | null;
}

interface OpenTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  urgency: string;
  project: string;
  projectId: number | null;
  dueDate: string | null;
  sprint: number;
  description?: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface DashboardData {
  staff: {
    id: number;
    fullName: string;
    title: string;
    department: string;
    status: string;
    photoUrl: string | null;
  };
  productivity: {
    completionRate: number;
    workloadUtilization: number;
    capacityLabel: string;
  };
  currentWork: {
    activeTasks: number;
    openTasks: number;
    completedTasks: number;
    totalTasks: number;
  };
  activeTasks: Task[];
  completedTasks: CompletedTask[];
  openTasks: OpenTask[];
}

interface TaskByStatusResponse {
  activeTasks: {
    data: Task[];
    pagination: Pagination;
  };
  completedTasks: {
    data: CompletedTask[];
    pagination: Pagination;
  };
  openTasks: {
    data: OpenTask[];
    pagination: Pagination;
  };
  summary: {
    totalActiveTasks: number;
    totalCompletedTasks: number;
    totalOpenTasks: number;
    totalTasks: number;
  };
}

interface TaskAnalysisMainProps {
  staffId: number;
}

const TaskAnalysisMain = ({ staffId }: TaskAnalysisMainProps) => {

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Active tasks state
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [activePagination, setActivePagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loadingActive, setLoadingActive] = useState(false);

  // Completed tasks state
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [completedPagination, setCompletedPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  // Open tasks state
  const [openTasks, setOpenTasks] = useState<OpenTask[]>([]);
  const [openPagination, setOpenPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loadingOpen, setLoadingOpen] = useState(false);

  // Fetch dashboard data (productivity, current work, initial task lists)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoadingDashboard(true);
        const response = await Api.get<DashboardData>(
          `/task/staff/${staffId}/dashboard`,
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoadingDashboard(false);
      }
    };

    if (staffId) {
      fetchDashboard();
    }
  }, [staffId]);

  // Fetch active tasks with pagination
  useEffect(() => {
    const fetchActiveTasks = async () => {
      try {
        setLoadingActive(true);
        const response = await Api.get<TaskByStatusResponse>(
          `/task/staff/${staffId}/tasks-by-status?activePageNum=${activePagination.currentPage}&activePageSize=${activePagination.pageSize}`,
        );
        setActiveTasks(response.data.activeTasks.data);
        setActivePagination(response.data.activeTasks.pagination);
      } catch (error) {
        console.error("Error fetching active tasks:", error);
      } finally {
        setLoadingActive(false);
      }
    };

    if (staffId) {
      fetchActiveTasks();
    }
  }, [staffId, activePagination.currentPage]);

  // Fetch completed tasks with pagination
  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        setLoadingCompleted(true);
        const response = await Api.get<TaskByStatusResponse>(
          `/tasks/staff/${staffId}/tasks-by-status?completedPageNum=${completedPagination.currentPage}&completedPageSize=${completedPagination.pageSize}`,
        );
        setCompletedTasks(response.data.completedTasks.data);
        setCompletedPagination(response.data.completedTasks.pagination);
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      } finally {
        setLoadingCompleted(false);
      }
    };

    if (staffId) {
      fetchCompletedTasks();
    }
  }, [staffId, completedPagination.currentPage]);

  // Fetch open tasks with pagination
  useEffect(() => {
    const fetchOpenTasks = async () => {
      try {
        setLoadingOpen(true);
        const response = await Api.get<TaskByStatusResponse>(
          `/tasks/staff/${staffId}/tasks-by-status?openPageNum=${openPagination.currentPage}&openPageSize=${openPagination.pageSize}`,
        );
        setOpenTasks(response.data.openTasks.data);
        setOpenPagination(response.data.openTasks.pagination);
      } catch (error) {
        console.error("Error fetching open tasks:", error);
      } finally {
        setLoadingOpen(false);
      }
    };

    if (staffId) {
      fetchOpenTasks();
    }
  }, [staffId, openPagination.currentPage]);

  const handleActivePageChange = (page: number) => {
    setActivePagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleCompletedPageChange = (page: number) => {
    setCompletedPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleOpenPageChange = (page: number) => {
    setOpenPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />
      <div className="flex-1 mt-20 py-12 px-4 sm:px-8">
        <div className="max-w-[480px] mx-auto bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8">
          <TaskHeader staffData={dashboardData?.staff ?? null} />
          <ProductivityDashboard
            staffId={staffId}
            dashboardData={dashboardData}
          />
          <CurrentWork currentWork={dashboardData?.currentWork ?? null} />
          <ActiveTasksList
            tasks={activeTasks}
            pagination={activePagination}
            onPageChange={handleActivePageChange}
            loading={loadingActive}
          />
          <CompletedTasksList
            tasks={completedTasks}
            pagination={completedPagination}
            onPageChange={handleCompletedPageChange}
            loading={loadingCompleted}
          />
          <OpenTasksList
            tasks={openTasks}
            pagination={openPagination}
            onPageChange={handleOpenPageChange}
            loading={loadingOpen}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TaskAnalysisMain;
