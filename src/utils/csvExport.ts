import { TaskDTO } from "@/dataTypes/Data-Types";

/**
 * Formats a string value by replacing underscores with spaces and capitalizing words.
 */
const formatLabel = (val?: string) => {
  if (!val) return "—";
  return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Formats a date string into a readable format (YYYY-MM-DD).
 */
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  } catch {
    return "—";
  }
};

/**
 * Escapes CSV special characters in a string.
 */
const escapeCSV = (val: any) => {
  const str = String(val ?? "").replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Exports an array of tasks to a CSV file and triggers a browser download.
 */
export const exportTasksToCSV = (tasks: TaskDTO[], fileName: string) => {
  // 1. Define Headers
  const headers = [
    "Task Title",
    "Project",
    "Sprint",
    "Status",
    "Priority",
    "Urgency",
    "Start Date",
    "Due Date",
    "Timeline",
    "Team",
    "Created By",
    "Assigned To",
    "Created At",
  ];

  // 2. Map Task Data to Rows
  const rows = tasks.map((task) => {
    const assignedTo = task.assignedTo
      ?.filter((a) => a?.staff)
      .map((a) => `${a.staff.firstName} ${a.staff.lastName}`)
      .join(", ") || "—";

    const createdBy = task.createdBy
      ? `${task.createdBy.firstName} ${task.createdBy.lastName}`
      : "—";

    return [
      task.title,
      task.project?.projectName || "—",
      task.sprint || "—",
      formatLabel(task.status),
      formatLabel(task.priority),
      formatLabel(task.urgency),
      formatDate(task.startDate),
      formatDate(task.dueDate),
      task.timeline || "—",
      task.department?.name || "—",
      createdBy,
      assignedTo,
      formatDate(task.createdAt),
    ];
  });

  // 3. Construct CSV Content
  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  // 4. Create Blob and Trigger Download
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
