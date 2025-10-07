"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CustomModal from "@/component/Message/Message";
import Api from "@/utils/api";
import { AxiosError } from "axios";

export default function UploadTasksPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [token, setToken] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "sheet">("file");
  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("user-token");
      if (!t) {
        router.push("/login");
      } else {
        setToken(t);
      }
    }
  }, [router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && f.name.toLowerCase().endsWith(".csv")) {
      setFile(f);
      setStatus(null);
    } else {
      setFile(null);
      setStatus("Please choose a valid .csv file");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!projectId) {
      setModal({ type: "error", message: "Project ID missing from URL." });
      return;
    }

    if (!token) {
      setModal({
        type: "error",
        message: "User token not found in localStorage. Please log in again.",
      });
      return;
    }

    const form = new FormData();
    if (mode === "file") {
      if (!file) {
        setModal({ type: "error", message: "Please select a CSV file." });
        return;
      }
      form.append("file", file);
    } else {
      if (!sheetUrl.trim()) {
        setModal({
          type: "error",
          message: "Please enter a valid Google Sheets link.",
        });
        return;
      }
      form.append("googleSheetUrl", sheetUrl.trim());
    }

    try {
      setLoading(true);

      const res = await Api.post(`/task/${projectId}/bulk-upload`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      setModal({
        type: "success",
        message: `Successfully created ${data.createdCount} tasks in project "${data.project?.name}".`,
      });

      // Redirect after success
      setTimeout(() => router.push(`/project/${projectId}`), 1500);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Upload failed. Please try again.";
      setModal({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-16">
      {/* Header */}
      <div className="max-w-xl mx-auto px-4 mb-8 mt-14">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-black hover:opacity-75"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Bulk Upload Tasks
          </h2>
          <div className="w-[84px]" />
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <p className="text-gray-600 text-sm mb-4">
            Upload multiple tasks at once using a CSV file or Google Sheets
            link.
          </p>

          {/* Mode Selection */}
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={mode === "file"}
                onChange={() => setMode("file")}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Upload CSV File</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={mode === "sheet"}
                onChange={() => setMode("sheet")}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Google Sheets Link</span>
            </label>
          </div>

          {/* Input Section */}
          {mode === "file" ? (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                CSV File
              </label>
              <input
                accept=".csv"
                type="file"
                onChange={handleFileChange}
                className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected columns: <br />
                <code>
                  title, description, sprint, status, priority, urgency,
                  dueDate, startDate, timeline, assigned_staff_email, role
                </code>
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Google Sheets Link
              </label>
              <input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/...."
                className="w-full rounded-lg border px-3 py-2 bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                The sheet should be public or exportable as CSV.
              </p>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className="mt-3 p-3 rounded bg-gray-50 text-sm">{status}</div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#95D700] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Tasks"}
          </button>

          {/* Modal */}
          {modal && (
            <CustomModal
              type={modal.type}
              message={modal.message}
              onClose={() => setModal(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
