import React from "react";
import { Briefcase, Clock, CheckCircle2, CheckCircleIcon } from "lucide-react";

interface CurrentWorkData {
  activeTasks: number;
  openTasks: number;
  completedTasks: number;
  totalTasks: number;
}

interface CurrentWorkProps {
  currentWork: CurrentWorkData | null;
}

const CurrentWork = ({ currentWork }: CurrentWorkProps) => {
  if (!currentWork) {
    return (
      <div className="mt-8">
        <h3 className="text-[#95D700] text-xs font-bold uppercase tracking-wider mb-4">
          CURRENT WORK
        </h3>
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-[#95D700] text-xs font-bold uppercase tracking-wider mb-4">
        CURRENT WORK
      </h3>
      <div className="grid grid-cols-3 gap-3 wrap">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-start bg-white dark:bg-[#1a1a1a] transition-colors">
          <Briefcase
            className="text-gray-400 mb-3"
            size={20}
            strokeWidth={1.5}
          />
          <span className="font-bold text-xl text-gray-900 dark:text-gray-100 leading-none">
            {currentWork.activeTasks}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
            Active Tasks
          </span>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-start bg-white dark:bg-[#1a1a1a] transition-colors">
          <Clock className="text-gray-400 mb-3" size={20} strokeWidth={1.5} />
          <span className="font-bold text-xl text-gray-900 dark:text-gray-100 leading-none">
            {currentWork.openTasks}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
            Open Tasks
          </span>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-start bg-white dark:bg-[#1a1a1a] transition-colors">
          <CheckCircle2
            className="text-[#95D700] mb-3"
            size={20}
            strokeWidth={1.5}
          />
          <span className="font-bold text-xl text-[#95D700] leading-none">
            {currentWork.completedTasks}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
            Completed Tasks
          </span>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-start bg-white dark:bg-[#1a1a1a] transition-colors">
          <CheckCircleIcon
            className="text-[#95D700] mb-3"
            size={20}
            strokeWidth={1.5}
          />
          <span className="font-bold text-xl text-[#95D700] leading-none">
            {currentWork.totalTasks}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
            Total Tasks
          </span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWork;
