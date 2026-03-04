"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Api from "@/utils/api";
import TaskAnalysisMain from "@/pages/TaskAnalysis/TaskAnalysisMain";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";

const page = () => {
  const params = useParams();
  const uuid = params?.uuid as string;
  const [staffId, setStaffId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid) return;

    const fetchStaffId = async () => {
      try {
        const res = await Api.get(`/staff-register/data/${uuid}`);
        setStaffId(res.data.id);
      } catch (error) {
        console.error("Error fetching staff data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffId();
  }, [uuid]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!staffId) {
    return <div className="p-6 text-center text-red-500">Staff not found</div>;
  }

  return (
    <div>
      <TaskAnalysisMain staffId={staffId} />
    </div>
  );
};

export default page;
