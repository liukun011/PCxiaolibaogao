import { CheckCircle2, Clock } from "lucide-react";

// Material Card Component
export const MaterialCard = ({ icon: Icon, title, date, status = "completed", onClick }: { icon: any, title: string, date: string, status?: "completed" | "pending" | "error", onClick?: () => void }) => (
  <div
    onClick={onClick}
    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${status === "completed" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</span>
          {status === "completed" && <CheckCircle2 size={14} className="text-green-500" />}
          {status === "pending" && <Clock size={14} className="text-orange-500" />}
        </div>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
    </div>
  </div>
);
