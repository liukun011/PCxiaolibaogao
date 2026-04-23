import { ChevronRight, Clock, Mic } from "lucide-react";

// Interview Item Component
export const InterviewItem = ({ title, date, duration, onClick }: { title: string, date: string, duration: string, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer group"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <Mic size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</span>
        <span className="text-[10px] text-gray-400">{date}</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100">
        <Clock size={10} />
        <span>{duration}</span>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
    </div>
  </div>
);
