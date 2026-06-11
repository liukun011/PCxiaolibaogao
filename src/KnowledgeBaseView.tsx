import React from "react";
import { BookOpen } from "lucide-react";

type KnowledgeBaseViewProps = {
  // Add any props KnowledgeBaseView might need
};

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = () => {
  return (
    <div className="flex flex-col flex-1 bg-white p-8">
      <div className="flex items-center gap-4 text-gray-800">
        <BookOpen size={24} />
        <h1 className="text-xl font-bold">知识库</h1>
      </div>
      <p className="mt-4 text-gray-600">这里将汇集公司内部的知识文档、操作指南和行业洞察。</p>
      {/* Add categories, search, article list here */}
    </div>
  );
};