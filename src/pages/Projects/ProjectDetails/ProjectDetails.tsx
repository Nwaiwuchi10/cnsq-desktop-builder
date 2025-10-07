"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Api from "@/utils/api";
import Image, { StaticImageData } from "next/image";
import DisplayTask from "@/component/DisplayTask/DisplayTask";
import editIcon from "../../../assests/images/Button.png";
import UpdateProjectModal from "../UpdateProject/UpdateProjectModal";
import { ProjectStatus } from "@/dataTypes/Data-Types";
import AssignedToStaffModal from "../UpdateProject/AssignedToStaffModal";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";

interface Project {
  id: number;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: string;
  timeLine: string;
  prodUrl: string;
  stagingUrl: string;
  assignedTo: {
    id: number;
    role: string;
    staff: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      photoUrl: string | StaticImageData | null;
    };
  }[];
  comments: {
    id: number;
    text: string;
    staff: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
}
type AssignedTo = Project["assignedTo"][number];
export default function ProjectDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditModals, setShowEditModals] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  useEffect(() => {
    const t = localStorage.getItem("user-token");
    setToken(t);
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await Api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Failed to fetch project", err);
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProject();
  }, [id]);

  if (!project) return <p className="p-6">Loading...</p>;
  const progressValue = () => {
    switch (project.status as ProjectStatus) {
      case ProjectStatus.NOT_STARTED:
        return 0;
      case ProjectStatus.IN_PROGRESS:
        return 50;
      case ProjectStatus.TESTING:
        return 75;
      case ProjectStatus.COMPLETED:
        return 100;
      default:
        return 0;
    }
  };
  const progress = progressValue();
  // const progress = 25; // replace with actual if available
  ///// to comment on a project

  const handleAddComment = async () => {
    if (!commentText.trim()) return; // avoid empty comment
    try {
      setLoadingComment(true);
      await Api.patch(
        `/projects/${id}/add/comments`,
        {
          text: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCommentText(""); // clear input after success
      setModal({ type: "success", message: "Comment added successfully!" });
      // refresh project data to show new comment
      const res = await Api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to create project.",
      });
    } finally {
      setLoadingComment(false);
    }
  };
  const statusColors: Record<ProjectStatus, string> = {
    not_started: "bg-red-100 text-red-600",
    in_progress: "bg-yellow-100 text-yellow-600",
    testing: "bg-blue-100 text-blue-600",
    completed: "bg-green-100 text-green-600",
  };

  // 🔹 Capitalize and transform
  const formatStatus = (status: string) =>
    status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  if (loadingProject) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAFAFA]">
        <LoadingSpinner />
        {/* <p className="text-gray-500">Loading staff details...</p> */}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        {/* Back Button */}
        <div
          onClick={() => router.back()}
          className="flex pt-20 items-center gap-2 text-black cursor-pointer hover:opacity-70 mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </div>

        {/* Project Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl text-black font-bold">
            {project.projectName}
          </h1>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setShowEditModal(true)}
          >
            <Image src={editIcon} alt="edit icon" />
          </span>
        </div>
        <div
          className={`inline-block px-3 py-1 text-xs rounded-full font-medium w-fit ${
            statusColors[project.status as ProjectStatus]
          }`}
        >
          {formatStatus(project.status)}
        </div>

        {/* Dates */}
        <div className="text-gray-600 mt-2">
          <span>Timeline:</span> {project?.timeLine}
        </div>
        <div className="text-gray-600 mt-2">
          <div className="mb-2">
            <span>Start Date:</span>{" "}
            {new Date(project.startDate).toLocaleDateString()}
          </div>{" "}
          <div>
            <span>End Date:</span>{" "}
            {new Date(project.endDate).toLocaleDateString()}
          </div>
          <div className="text-gray-600 mt-2">
            <span>Stagging Link:</span>
            <a
              href={project?.stagingUrl}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {" "}
              {project?.stagingUrl}
            </a>
          </div>
          <div className="text-gray-600 mt-2">
            <span>Website Link:</span>
            <a
              href={project?.prodUrl}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {project?.prodUrl}
            </a>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 w-full max-w-lg">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{progress}% Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-lg">
            <div
              className="h-2 bg-[#78B500] rounded-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-gray-800 text-1xl font-bold leading-relaxed">
          Description
        </p>
        <p className="mt-2 text-gray-800 leading-relaxed">{project.desc}</p>

        {/* Assigned Staff */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Assigned Staff</h3>
          <div className="flex items-center mt-2">
            {project.assignedTo
              ?.slice(0, 10)
              .map((assign: AssignedTo, idx: number) => (
                <div
                  key={idx}
                  className="w-15 h-15 rounded-full overflow-hidden border-2 border-white -ml-2 first:ml-0"
                >
                  {assign.staff?.photoUrl ? (
                    <Image
                      src={assign.staff.photoUrl}
                      alt={`${assign.staff.firstName}`}
                      width={50}
                      height={50}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="bg-gray-300 w-full h-full flex items-center justify-center text-xs text-white">
                      {assign.staff?.firstName?.[0]}
                    </div>
                  )}
                </div>
              ))}
            <button
              className="w-15 h-15 text-gray-600 rounded-full bg-gray-100 border flex items-center justify-center"
              style={{ cursor: "pointer" }}
              onClick={() => setShowEditModals(true)}
            >
              +
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <MessageCircle size={18} /> Comments ({project.comments.length})
          </h3>
          {project.comments.length > 0 ? (
            <div className="space-y-3">
              {project.comments.map((c) => (
                <div key={c.id} className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-800">{c.text}</p>
                  <span className="text-xs text-gray-500">
                    {c.staff.firstName} {c.staff.lastName} •{" "}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
        </div>

        {/* Add Comment */}
        {/* Add Comment */}
        <div className="mt-6 flex items-center gap-2 w-full max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Add a comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-white text-gray-600 border rounded-lg px-3 py-2 pr-20"
            />
            <button
              onClick={handleAddComment}
              disabled={loadingComment}
              className="absolute right-1 top-1 bottom-1 px-4 bg-[#78B500] text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {loadingComment ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
        {modal && (
          <CustomModal
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(null)}
          />
        )}
        {/* <div className="mt-6 flex items-center gap-2 w-full max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Add a comment"
              className="w-full border rounded-lg px-3 py-2 pr-20" // add right padding so text doesn’t overlap button
            />
            <button className="absolute right-1 top-1 bottom-1 px-4 bg-[#78B500] text-white rounded-md hover:opacity-90">
              Post
            </button>
          </div>
        </div> */}

        <div className="mt-24">
          <DisplayTask projectId={id} />
        </div>
      </div>

      <div>
        <UpdateProjectModal
          projectId={project.id}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => window.location.reload()}
        />
      </div>

      <div>
        <AssignedToStaffModal
          projectId={project.id}
          isOpened={showEditModals}
          onClosed={() => setShowEditModals(false)}
          onUpdateds={() => window.location.reload()}
        />
      </div>
    </>
  );
}
