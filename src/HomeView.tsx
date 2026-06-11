import React from "react";
import { LayoutDashboard } from "lucide-react";

type HomeViewProps = {
  // Add any props HomePage might need, e.g., onNavigate to other sections
};

export const HomeView: React.FC<HomeViewProps> = () => {
  return (
    <div className="flex flex-col flex-1 bg-white p-8">
      <div className="flex items-center gap-4 text-gray-800">
        <LayoutDashboard size={24} />
        <h1 className="text-xl font-bold">首页</h1>
      </div>
      <p className="mt-4 text-gray-600">欢迎回到您的工作台。这里将展示您的报告概览、待办事项和快速访问。</p>
      {/* Add more content for a comprehensive homepage */}
    </div>
  );
};