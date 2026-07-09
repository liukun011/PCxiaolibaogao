import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Check,
  FileText,
  Folder,
  Mic,
  PanelLeftClose,
  PanelRightOpen,
  Plus,
  Search,
  Sparkles,
  User,
  Wrench,
  X,
} from "lucide-react";
import { type TemplateItem } from "@/src/shared/templateData";

const readinessItems = [
  "读取已有模板结构，识别章节、字段和占位符",
  "载入模板内容预览，准备进行对话式修改",
  "检查适用场景、材料清单、风险提示和结论口径",
  "打开修改模板工作区，等待用户继续补充修改要求",
];

const suggestionCards = [
  {
    title: "适用范围可能不够清晰",
    text: "请帮我细化这个模板的适用客户、业务边界和不适用场景。",
  },
  {
    title: "材料和字段可能缺失",
    text: "请补充每个章节必填字段、材料清单、附件要求和缺失时的处理规则。",
  },
  {
    title: "风险与结论口径可能需要统一",
    text: "请完善风险提示、禁忌表达、结论分级和审批建议口径。",
  },
];

const recentRecords = [
  "修改模板：授信调查报告",
  "基于「授信调查报告」...",
  "基于「不良资产」模板...",
  "生成模板",
  "修改模板：某银行信贷...",
  "生成报告：生成报告",
  "报告数据分析",
  "2024 Q1 营收总结",
  "竞品调研报告生成",
];

const PREVIEW_MIN_WIDTH = 420;
const PREVIEW_MAX_WIDTH = 760;

export const AITemplateChatView = ({
  template,
  onBack,
}: {
  template: TemplateItem;
  onBack: () => void;
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(560);
  const [isPreviewResizing, setIsPreviewResizing] = useState(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(560);

  useEffect(() => {
    if (!isPreviewResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = resizeStartWidthRef.current + resizeStartXRef.current - event.clientX;
      setPreviewWidth(Math.min(PREVIEW_MAX_WIDTH, Math.max(PREVIEW_MIN_WIDTH, nextWidth)));
    };

    const handleMouseUp = () => {
      setIsPreviewResizing(false);
    };

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPreviewResizing]);

  const handlePreviewResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    resizeStartXRef.current = event.clientX;
    resizeStartWidthRef.current = previewWidth;
    setIsPreviewResizing(true);
  };

  return (
    <div className="flex h-full min-h-0 bg-[#f6f9ff] text-slate-900">
      {isLeftSidebarExpanded ? (
        <aside className="flex w-[252px] shrink-0 flex-col border-r border-slate-200/80 bg-[#f2f8fb]">
          <div className="flex items-center justify-between px-5 pb-5 pt-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-500 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-white hover:text-blue-600"
                aria-label="返回模板列表"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-lg font-bold tracking-normal text-slate-950">报告智能体</h1>
            </div>
            <button
              type="button"
              onClick={() => setIsLeftSidebarExpanded(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-500 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-white hover:text-blue-600"
              aria-label="收起侧栏"
              title="收起侧栏"
            >
              <PanelLeftClose size={19} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-5">
            <button
              type="button"
              className="flex h-11 w-full items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 px-4 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              <Plus size={18} />
              新建对话
            </button>

            <nav className="mt-5 space-y-1">
              {[
                { label: "文件", icon: Folder },
                { label: "技能", icon: Bot },
                { label: "报告模板", icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-blue-600"
                  >
                    <Icon size={19} className="text-slate-500" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-9">
              <div className="flex items-center justify-between px-3">
                <p className="text-sm font-medium text-slate-400">最近记录</p>
                <Search size={18} className="text-slate-500" />
              </div>
              <div className="mt-3 space-y-1.5">
                {recentRecords.map((record, index) => (
                  <button
                    key={record}
                    type="button"
                    className={`block w-full truncate rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      index === 0
                        ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                        : "text-slate-700 hover:bg-white/70 hover:text-blue-600"
                    }`}
                  >
                    {record}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 ring-4 ring-white/70">
                <User size={21} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">演示用户</p>
                <p className="text-sm text-slate-500">进入工作台</p>
              </div>
              <button
                type="button"
                className="grid h-8 w-8 grid-cols-2 gap-1 p-1 text-slate-500 transition-colors hover:text-blue-600"
                aria-label="工作台入口"
              >
                <span className="rounded-sm border border-current" />
                <span className="rounded-sm border border-current" />
                <span className="rounded-sm border border-current" />
                <span className="rounded-sm border border-current" />
              </button>
            </div>
          </div>
        </aside>
      ) : (
      <aside className="relative flex w-[68px] shrink-0 flex-col items-center border-r border-slate-200/80 bg-[#f2f8fb] py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-500 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-white hover:text-blue-600"
          aria-label="返回模板列表"
        >
          <ArrowLeft size={19} />
        </button>

        <button
          type="button"
          onClick={() => setIsLeftSidebarExpanded(true)}
          className="absolute -right-3 top-20 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600"
          aria-label="展开侧栏"
          title="展开侧栏"
        >
          <PanelRightOpen size={15} />
        </button>

        <div className="mt-8 flex flex-col items-center gap-5 text-slate-500">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600"
            aria-label="新建对话"
          >
            <Plus size={19} />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600"
            aria-label="文件"
          >
            <Folder size={19} />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600"
            aria-label="技能"
          >
            <Bot size={19} />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600"
            aria-label="报告模板"
          >
            <FileText size={19} />
          </button>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 transition-colors hover:text-blue-600"
            aria-label="演示用户"
          >
            <User size={20} />
          </button>
        </div>
      </aside>
      )}

      <main className="relative flex min-w-0 flex-1 overflow-hidden bg-[#f7fbff]">
        <div className="pointer-events-none absolute left-[10%] top-[-140px] h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-170px] left-[38%] h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />

        <section className="relative z-10 flex min-w-0 flex-1 flex-col px-8 py-8">
          <div className="mb-8 flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-medium text-blue-600 shadow-sm">
                帮我修改「{template.name}」模板。
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-600 text-sm font-bold text-white">
                我
              </span>
            </div>
            {!isPreviewOpen && (
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:text-blue-600"
                aria-label="展开右侧预览"
              >
                <PanelLeftClose size={18} className="rotate-180" />
              </button>
            )}
          </div>

          <div className="mx-auto w-full max-w-[760px]">
            <div className="mb-3 flex items-start gap-3">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm">
                AI
              </span>
              <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_44px_rgba(30,41,59,0.08)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">模板修改已就绪</h2>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        已打开「{template.name}」，右侧模板内容已展开
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                    可修改
                  </span>
                </div>

                <div className="space-y-3">
                  {readinessItems.map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check size={13} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item}</p>
                        <p className="mt-0.5 text-xs text-slate-400">已完成</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-left transition-colors hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-blue-100">
                      <FileText size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{template.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">报告模板 · 已打开 · 点击查看右侧模板</p>
                    </div>
                  </div>
                  <span className="text-lg text-slate-400">›</span>
                </button>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                  <h3 className="mb-3 text-sm font-bold text-amber-700">推荐继续确认的问题</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {suggestionCards.map((card) => (
                      <button
                        key={card.title}
                        type="button"
                        onClick={() => setPrompt(card.text)}
                        className="rounded-xl border border-amber-200 bg-white p-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50"
                      >
                        <p className="text-xs font-bold text-slate-800">{card.title}</p>
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{card.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-center pt-8">
            <div className="w-full max-w-[980px] rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_54px_rgba(30,41,59,0.08)]">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[76px] w-full resize-none bg-transparent px-2 py-2 text-base leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="今天帮你做些什么？ / 调用技能"
              />
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-blue-600"
                  >
                    <FileText size={15} />
                    {template.name}
                    <X size={13} />
                  </button>
                  <button type="button" className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600">
                    <FileText size={15} />
                    {template.name}
                  </button>
                  <button type="button" className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600">
                    <Wrench size={15} />
                    选择技能
                  </button>
                  <button type="button" className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600">
                    <Folder size={15} />
                    我的文件
                  </button>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-50"
                    aria-label="添加材料"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-50"
                    aria-label="语音输入"
                  >
                    <Mic size={18} />
                  </button>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-200 text-white shadow-[0_10px_24px_rgba(37,99,235,0.12)] transition-colors hover:bg-blue-500"
                    aria-label="发送"
                  >
                    <ArrowUp size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {isPreviewOpen && (
        <aside
          className="relative z-10 flex shrink-0 flex-col border-l border-slate-200 bg-white"
          style={{ width: previewWidth }}
        >
          <div
            role="separator"
            aria-orientation="vertical"
            title="拖拽调整预览宽度"
            onMouseDown={handlePreviewResizeStart}
            className="group absolute -left-1 top-0 z-30 flex h-full w-2 cursor-col-resize items-center justify-center"
          >
            <span
              className={`h-full w-0.5 transition-colors ${
                isPreviewResizing ? "bg-blue-400" : "bg-transparent group-hover:bg-blue-300"
              }`}
            />
          </div>
          <div className="flex h-[60px] items-center justify-between border-b border-slate-100 px-6">
            <h2 className="text-base font-bold text-slate-900">{template.name}</h2>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 transition-colors hover:text-blue-600"
              aria-label="收起右侧预览"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 px-8 py-8">
            <div className="mx-auto min-h-[900px] w-full max-w-[440px] bg-white px-12 py-20 shadow-sm">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-black">{template.name}</h1>
                <p className="mt-7 text-xs font-bold text-black">Due Diligence And Valuation Recommendations Report</p>
                <div className="mt-8 space-y-5 text-[24px] font-bold text-red-400">
                  <p className="inline-block bg-red-50 px-2">委托方名称</p>
                  <p className="bg-red-50 px-2">报告主题</p>
                </div>
                <div className="mt-28 space-y-5 text-[22px] font-bold text-red-400">
                  <p className="bg-red-50 px-2">报告出具机构</p>
                  <p className="bg-red-50 px-2">报告日期</p>
                  <p className="bg-red-50 px-2">报告名称</p>
                </div>
              </div>

              <div className="mt-16 text-sm text-black">
                <h2 className="text-center font-bold">一、拟处置资产基本情况</h2>
                <h3 className="mt-5 font-bold">（一）债权基本情况</h3>
                <p className="mt-4 text-center text-xs">表1债权情况一览表</p>
                <div className="mt-3 grid grid-cols-7 border border-slate-400 text-center text-[10px]">
                  {["债务人", "担保方式", "保证人", "抵押物", "贷款本金", "贷款余额", "备注"].map((item) => (
                    <div key={item} className="border-r border-slate-300 px-1 py-2 font-bold last:border-r-0">
                      {item}
                    </div>
                  ))}
                  {["债务人", "担保方式", "保证人", "抵押物", "贷款本金", "贷款余额", "备注"].map((item) => (
                    <div key={`${item}-placeholder`} className="border-r border-t border-slate-300 px-1 py-2 text-red-400 last:border-r-0">
                      {item}
                    </div>
                  ))}
                </div>
                <p className="mt-3 bg-red-50 px-2 py-1 text-xs text-red-400">债权基本情况概述</p>
                <h3 className="mt-5 font-bold">（二）涉诉信息查询</h3>
              </div>
            </div>
          </div>
        </aside>
        )}
      </main>
    </div>
  );
};
