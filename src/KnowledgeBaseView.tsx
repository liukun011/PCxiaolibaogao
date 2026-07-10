import React from "react";
import { BookOpen } from "lucide-react";

type KnowledgeBaseViewProps = {
  // Add any props KnowledgeBaseView might need
};

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = () => {
  return (
    <div className="flex flex-col flex-1 bg-white px-8 py-6">
      <div className="flex items-center gap-3 text-slate-900">
        <BookOpen size={24} className="text-slate-700" />
        <h1 className="text-xl font-bold leading-7 tracking-normal text-slate-900">知识库</h1>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-500">这里将汇集公司内部的知识文档、操作指南和行业洞察。</p>
      {/* Add categories, search, article list here */}
    </div>
  );
};
