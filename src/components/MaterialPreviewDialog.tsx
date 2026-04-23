import { ArrowRight, X } from "lucide-react";
export type MaterialPreviewData = {
  title: string;
  section: string;
  source: string;
  excerpt: string;
  targetId: string;
  tab: "conflict" | "traceability";
};

export const MaterialPreviewDialog = ({
  preview,
  onClose,
  onLocate,
}: {
  preview: MaterialPreviewData | null;
  onClose: () => void;
  onLocate: (targetId: string, tab: "conflict" | "traceability") => void;
}) => {
  if (!preview) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-500">原始素材</p>
            <h3 className="text-xl font-bold text-gray-900">{preview.title}</h3>
            <p className="text-sm text-gray-500">{preview.section}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">素材来源</div>
            <p className="mt-2 text-sm leading-6 text-gray-700">{preview.source}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">原文摘录</div>
            <p className="mt-3 text-sm leading-7 text-gray-700">{preview.excerpt}</p>
          </div>

        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            关闭
          </button>
          <button
            onClick={() => {
              onLocate(preview.targetId, preview.tab);
              onClose();
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ArrowRight size={16} />
            <span>定位到正文</span>
          </button>
        </div>
      </div>
    </div>
  );
};


