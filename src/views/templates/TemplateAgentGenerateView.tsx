import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  Bot,
  ChevronDown,
  ChevronRight,
  Check,
  Clock3,
  Database,
  Edit3,
  FileText,
  Folder,
  FolderOpen,
  List,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Share2,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from "lucide-react";
import { type TemplateItem } from "@/src/shared/templateData";

type PopoverType = "skills" | "files" | "knowledge" | null;
type ActiveMenu = "chat" | "files" | "skills" | "templates";
type MockMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
};
type MockFolderNode = {
  id: string;
  name: string;
  children?: MockFolderNode[];
};
type MockFileCard = {
  id: string;
  title: string;
  type: "folder" | "markdown";
  meta: string;
};
type AgentTemplateCard = {
  id: string;
  name: string;
  category: string;
  status: "enabled" | "disabled";
  description: string;
  time: string;
};

const mockSkills = ["材料归纳", "财务分析", "风险识别", "访谈问题生成", "尽调报告撰写"];
const mockFiles = ["企业资料 / 营业执照.pdf", "企业资料 / 近三年财报.xlsx", "访谈录音 / 负责人访谈.mp3"];
const mockKnowledgeBases = ["银行流贷尽调知识库", "企业授信审查规则库", "不良资产处置案例库"];
const agentTemplateCategories = [
  "全部",
  "信贷尽调",
  "不良资产",
  "投资分析",
  "风险审查",
  "市场分析",
  "经营分析",
  "行业研究",
  "产品调研",
  "供应商评估",
  "招商引资",
];

const mockAgentTemplates: AgentTemplateCard[] = [
  {
    id: "credit-survey",
    name: "授信调查报告",
    category: "信贷尽调",
    status: "enabled",
    description: "适用于企业授信调查、客户经营情况分析与风险判断。",
    time: "2026-12-31 13:49:44",
  },
  {
    id: "bank-credit",
    name: "某银行信贷报告模板",
    category: "信贷尽调",
    status: "disabled",
    description: "500万~2000万中小企业贷款，尽职调查报告模板。",
    time: "2026-06-11 18:10:07",
  },
  {
    id: "distressed-assets",
    name: "不良资产",
    category: "不良资产",
    status: "disabled",
    description: "不良资产处理、尽职调查报告模板。不良资产尽职调查、企业评估。",
    time: "2026-06-18 16:21:09",
  },
  {
    id: "leasing",
    name: "创新业务租赁",
    category: "信贷尽调",
    status: "enabled",
    description: "面向融资租赁业务，梳理客户资产、现金流、还款来源与风险缓释措施。",
    time: "2026-01-26 13:49:44",
  },
  {
    id: "bjyh-dd",
    name: "BJYH尽调报告",
    category: "信贷尽调",
    status: "enabled",
    description: "围绕企业基本情况、财务质量、信用风险和授信建议形成完整尽调结论。",
    time: "2025-11-20 15:38:42",
  },
  {
    id: "investment-risk",
    name: "投资项目风险审查意见书",
    category: "风险审查",
    status: "enabled",
    description: "用于投资项目立项、风险审查、投后关注事项和决策建议输出。",
    time: "2025-11-20 15:38:42",
  },
];

const mockFolderTree: MockFolderNode[] = [
  {
    id: "all",
    name: "全部文件",
    children: [
      {
        id: "project-docs",
        name: "项目文档",
        children: [
          { id: "requirements", name: "需求分析" },
          { id: "technical-plan", name: "技术方案" },
        ],
      },
      { id: "business-research", name: "业务研究报告" },
      {
        id: "product-planning",
        name: "产品规划与架构",
        children: [
          { id: "v1-archive", name: "V1.0 归档" },
          { id: "v2-iteration", name: "V2.0 迭代" },
        ],
      },
      { id: "recordings", name: "录音文件" },
      { id: "uncategorized", name: "未分类文件" },
      { id: "shared", name: "共享文件" },
      { id: "trash", name: "回收站" },
    ],
  },
];

const mockFileCardsByFolder: Record<string, MockFileCard[]> = {
  all: [
    { id: "project-docs", title: "项目文档", type: "folder", meta: "文件夹" },
    { id: "business-research", title: "业务研究报告", type: "folder", meta: "文件夹" },
    { id: "product-planning", title: "产品规划与架构", type: "folder", meta: "文件夹" },
    { id: "api-guide", title: "第三方应用接口 API 接入指南与说明.md", type: "markdown", meta: "235 KB · 2024-04-28" },
  ],
  "project-docs": [
    { id: "requirements", title: "需求分析", type: "folder", meta: "文件夹" },
    { id: "technical-plan", title: "技术方案", type: "folder", meta: "文件夹" },
    { id: "project-brief", title: "项目背景说明.md", type: "markdown", meta: "128 KB · 2024-04-18" },
  ],
  "business-research": [
    { id: "industry-report", title: "行业研究报告.md", type: "markdown", meta: "326 KB · 2024-04-22" },
    { id: "market-note", title: "市场访谈纪要.md", type: "markdown", meta: "96 KB · 2024-04-20" },
  ],
  "product-planning": [
    { id: "v1-archive", title: "V1.0 归档", type: "folder", meta: "文件夹" },
    { id: "v2-iteration", title: "V2.0 迭代", type: "folder", meta: "文件夹" },
    { id: "roadmap", title: "产品路线图.md", type: "markdown", meta: "185 KB · 2024-04-26" },
  ],
  recordings: [
    { id: "interview-audio", title: "客户访谈录音.mp3", type: "markdown", meta: "18.5 MB · 2024-04-28" },
  ],
  trash: [
    { id: "deleted-draft", title: "旧版材料草稿.md", type: "markdown", meta: "已删除 · 2024-03-31" },
  ],
};

const findFolderName = (nodes: MockFolderNode[], folderId: string): string | null => {
  for (const node of nodes) {
    if (node.id === folderId) return node.name;
    const childResult = node.children ? findFolderName(node.children, folderId) : null;
    if (childResult) return childResult;
  }
  return null;
};

export const TemplateAgentGenerateView = ({
  template,
  onBack,
}: {
  template: TemplateItem;
  onBack: () => void;
}) => {
  const [prompt, setPrompt] = useState("");
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("chat");
  const [activeFolder, setActiveFolder] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["all", "project-docs", "product-planning"]);
  const [activeTemplateName, setActiveTemplateName] = useState(template.name);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState("全部");
  const [templateSearch, setTemplateSearch] = useState("");
  const [openMoreMenuId, setOpenMoreMenuId] = useState<string | null>(null);
  const [templateStatusOverrides, setTemplateStatusOverrides] = useState<Record<string, AgentTemplateCard["status"]>>({});
  const [activePopover, setActivePopover] = useState<PopoverType>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill],
    );
  };

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders((current) =>
      current.includes(folderId) ? current.filter((item) => item !== folderId) : [...current, folderId],
    );
  };

  const activeFolderName = findFolderName(mockFolderTree, activeFolder) || "全部文件";
  const currentFileCards = mockFileCardsByFolder[activeFolder] || [];
  const filteredAgentTemplates = mockAgentTemplates.filter((item) => {
    const status = templateStatusOverrides[item.id] || item.status;
    const matchesCategory = activeTemplateCategory === "全部" || item.category === activeTemplateCategory;
    const matchesSearch = !templateSearch.trim() || item.name.includes(templateSearch.trim());
    return Boolean(status) && matchesCategory && matchesSearch;
  });

  const renderFolderNode = (node: MockFolderNode, level = 0) => {
    const hasChildren = Boolean(node.children?.length);
    const expanded = expandedFolders.includes(node.id);
    const selected = activeFolder === node.id;
    const FolderIcon = node.id === "trash" ? Trash2 : expanded && hasChildren ? FolderOpen : Folder;

    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => {
            setActiveFolder(node.id);
            if (hasChildren && !expanded) {
              toggleFolderExpanded(node.id);
            }
          }}
          className={`flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-medium transition-colors ${
            selected ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-white hover:text-blue-600"
          }`}
          style={{ paddingLeft: 8 + level * 16 }}
        >
          {hasChildren ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                toggleFolderExpanded(node.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleFolderExpanded(node.id);
                }
              }}
              className="flex h-4 w-4 items-center justify-center text-slate-400"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span className="h-4 w-4" />
          )}
          <FolderIcon size={16} className={selected ? "text-blue-500" : "text-slate-400"} />
          <span className="truncate">{node.name}</span>
        </button>
        {hasChildren && expanded && <div className="mt-1 space-y-1">{node.children?.map((child) => renderFolderNode(child, level + 1))}</div>}
      </div>
    );
  };

  const handleSend = () => {
    if (isGenerating) return;

    const userPrompt =
      prompt.trim() || `基于「${activeTemplateName}」模板，结合当前选择的材料与技能，生成一份报告。`;

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: userPrompt,
      },
    ]);
    setPrompt("");
    setActivePopover(null);
    setIsGenerating(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: `已收到。当前将基于「${activeTemplateName}」模板${selectedSkills.length ? `，结合 ${selectedSkills.join("、")} 等技能` : ""}${selectedFile ? `，参考文件「${selectedFile}」` : ""}${selectedKnowledgeBase ? `，调用「${selectedKnowledgeBase}」` : ""}，模拟生成报告任务。当前为前端 mock 演示，暂未调用真实智能体接口。`,
        },
      ]);
      setIsGenerating(false);
    }, 700);
  };

  return (
    <div className="flex h-full min-h-0 bg-[#f6f9ff] text-slate-900">
      <aside className="flex w-[314px] shrink-0 flex-col border-r border-slate-200/80 bg-[#f2f8fb]">
        <div className="flex items-center justify-between px-8 pb-5 pt-6">
          <h1 className="text-[20px] font-bold tracking-normal text-slate-950">报告智能体</h1>
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-500 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-white hover:text-blue-600"
            aria-label="返回模板列表"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-5">
          <button
            type="button"
            onClick={() => {
              setActiveMenu("chat");
              setActivePopover(null);
            }}
            className={`flex h-[50px] w-full items-center gap-3 rounded-xl border px-5 text-[16px] font-medium transition-colors ${
              activeMenu === "chat"
                ? "border-blue-200 bg-blue-50/70 text-blue-600"
                : "border-transparent text-slate-700 hover:bg-white/70 hover:text-blue-600"
            }`}
          >
            <Plus size={20} />
            新建对话
          </button>

          <nav className="mt-5 space-y-2">
            {[
              { id: "files", label: "文件", icon: Folder },
              { id: "skills", label: "技能", icon: Bot },
              { id: "templates", label: "报告模板", icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeMenu === item.id;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActiveMenu(item.id as ActiveMenu);
                    setActivePopover(null);
                  }}
                  className={`flex h-12 w-full items-center gap-4 rounded-xl px-4 text-left text-[16px] font-medium transition-colors ${
                    active ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100" : "text-slate-700 hover:bg-white/70 hover:text-blue-600"
                  }`}
                >
                  <Icon size={21} className={active ? "text-blue-500" : "text-slate-500"} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-10">
            <div className="flex items-center justify-between px-3">
              <p className="text-[15px] font-medium text-slate-400">最近记录</p>
              <Search size={20} className="text-slate-500" />
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                "修改模板：授信调查报告",
                "基于「不良资产」模板，帮我...",
                "生成模板",
                "修改模板：某银行信贷报告模...",
                "生成报告：生成报告",
                "报告数据分析",
                "2024 Q1 营收总结",
                "竞品调研报告生成",
              ].map((record, index) => (
                <button
                  key={record}
                  type="button"
                  className={`block w-full truncate rounded-lg px-3 py-2.5 text-left text-[16px] font-medium transition-colors ${
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

        <div className="border-t border-slate-200/80 px-7 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 ring-4 ring-white/70">
              <User size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-medium text-slate-900">演示用户</p>
              <p className="text-[15px] text-slate-500">进入工作台</p>
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

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f7fc]">
        <div className="pointer-events-none absolute left-[18%] top-[-120px] h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-160px] right-[12%] h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
        {activeMenu === "files" ? (
          <section className="relative z-10 flex min-h-0 flex-1 bg-[#f7fbff]">
            <aside className="flex w-[268px] shrink-0 flex-col border-r border-slate-200/80 bg-white/75">
              <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
                <h2 className="text-base font-bold text-slate-900">目录结构</h2>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  aria-label="新增目录"
                >
                  <Plus size={17} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-1">{mockFolderTree.map((node) => renderFolderNode(node))}</div>
              </div>
            </aside>

            <section className="min-w-0 flex-1 overflow-y-auto px-7 py-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {activeFolderName} <span className="text-sm font-medium text-slate-400">共 {currentFileCards.length} 项</span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">当前为文件管理 mock 页面，数据仅用于前端演示。</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {[
                    { label: "上传", icon: Upload },
                    { label: "创建文件", icon: FileText },
                    { label: "列表", icon: List },
                    { label: "排序", icon: ArrowUpDown },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600"
                      >
                        <Icon size={15} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentFileCards.length ? (
                <div className="grid grid-cols-4 gap-4 2xl:grid-cols-5">
                  {currentFileCards.map((item) => {
                    const isFolder = item.type === "folder";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="group flex min-h-[118px] items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isFolder ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {isFolder ? <Folder size={22} /> : <FileText size={22} />}
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-bold leading-5 text-slate-800 group-hover:text-blue-600">
                            {item.title}
                          </span>
                          <span className="mt-2 block text-xs font-medium text-slate-400">{item.meta}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 text-sm font-medium text-slate-400">
                  当前目录暂无文件
                </div>
              )}
            </section>
          </section>
        ) : activeMenu === "templates" ? (
          <section className="relative z-10 min-h-0 flex-1 overflow-y-auto px-7 py-7">
            <div className="mb-6 flex items-start justify-between gap-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">报告模板</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">沉淀成熟报告结构，快速复用高质量业务模板</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex h-10 w-[260px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-400 shadow-sm">
                  <Search size={16} />
                  <input
                    value={templateSearch}
                    onChange={(event) => setTemplateSearch(event.target.value)}
                    placeholder="搜索模板名称"
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Plus size={16} />
                  生成模板
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600"
                >
                  <Share2 size={16} />
                  模板分享
                </button>
              </div>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {agentTemplateCategories.map((category) => {
                const active = activeTemplateCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveTemplateCategory(category)}
                    className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                      active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-blue-600"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
              {filteredAgentTemplates.map((item) => {
                const status = templateStatusOverrides[item.id] || item.status;
                const enabled = status === "enabled";
                return (
                  <article
                    key={item.id}
                    className="relative flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                          <FileText size={22} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-slate-900">{item.name}</h3>
                          <span className="mt-2 inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                          enabled
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        {enabled ? "已启用" : "已禁用"}
                      </span>
                    </div>

                    <p className="mt-5 line-clamp-3 min-h-[66px] text-sm leading-6 text-slate-600">{item.description}</p>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-slate-400">
                        <Clock3 size={15} />
                        <span className="truncate">{item.time}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTemplateName(item.name);
                            setPrompt(`基于「${item.name}」模板，帮我生成一份报告。`);
                            setActiveMenu("chat");
                            setOpenMoreMenuId(null);
                          }}
                          className="group/action relative rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          <FileText size={16} />
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg group-hover/action:block">
                            使用智能体生成报告
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTemplateName(item.name);
                            setMessages((current) => [
                              ...current,
                              {
                                id: `ai-template-${Date.now()}`,
                                role: "ai",
                                content: `当前为前端模拟：已进入「${item.name}」的 AI 修改模板流程。`,
                              },
                            ]);
                            setActiveMenu("chat");
                            setOpenMoreMenuId(null);
                          }}
                          className="group/action relative rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Bot size={16} />
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg group-hover/action:block">
                            修改模板
                          </span>
                        </button>
                        <div className="relative" onMouseLeave={() => setOpenMoreMenuId(null)}>
                          <button
                            type="button"
                            onClick={() => setOpenMoreMenuId((current) => (current === item.id ? null : item.id))}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMoreMenuId === item.id && (
                            <div className="absolute bottom-full right-0 z-40 mb-2 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_32px_rgba(15,23,42,0.14)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setTemplateStatusOverrides((current) => ({
                                    ...current,
                                    [item.id]: enabled ? "disabled" : "enabled",
                                  }));
                                  setOpenMoreMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
                              >
                                <Check size={14} />
                                {enabled ? "禁用" : "启用"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setOpenMoreMenuId(null)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
                              >
                                <Edit3 size={14} />
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => setOpenMoreMenuId(null)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                删除
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {!filteredAgentTemplates.length && (
              <div className="mt-8 flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 text-sm font-medium text-slate-400">
                暂无匹配模板
              </div>
            )}
          </section>
        ) : activeMenu === "skills" ? (
          <section className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-8">
            <div className="rounded-3xl border border-slate-200 bg-white/90 px-12 py-10 text-center shadow-[0_18px_54px_rgba(30,41,59,0.08)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Bot size={24} />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">技能管理 mock</h2>
              <p className="mt-2 text-sm text-slate-500">当前入口仅切换选中态，完整页面后续可继续扩展。</p>
            </div>
          </section>
        ) : (
          <>
        <header className="relative z-10 shrink-0 px-8 py-5" />

        <section className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-8 pb-16 pt-4">
          <div className="w-full max-w-[980px]">
            <div className="mb-8 text-center">
              <h2 className="text-[32px] font-bold tracking-normal text-slate-900">
                今天想生成什么报告？
              </h2>
              <p className="mt-3 text-sm font-medium text-slate-500">
                选择合适的模板与技能，生成深度、高质量的报告
              </p>
            </div>

            {messages.length > 0 && (
              <div className="mb-6 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === "user"
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                          : "border border-slate-100 bg-white text-slate-600"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-medium text-blue-600 shadow-sm">
                      正在根据当前模板和选择项模拟生成报告...
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_18px_54px_rgba(30,41,59,0.08)] ring-1 ring-white/80">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[86px] w-full resize-none bg-transparent px-2 py-2 text-base leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="今天帮你做些什么？ / 调用技能"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600">
                  <FileText size={14} />
                  {activeTemplateName}
                </span>
                {selectedSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                    title="点击取消选择"
                  >
                    {skill}
                    <X size={13} />
                  </button>
                ))}
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    <Folder size={13} />
                    {selectedFile.split(" / ").pop()}
                    <X size={13} />
                  </button>
                )}
                {selectedKnowledgeBase && (
                  <button
                    type="button"
                    onClick={() => setSelectedKnowledgeBase(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    <Database size={13} />
                    {selectedKnowledgeBase}
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="relative mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
                  <button
                    type="button"
                    title={`当前模板：${activeTemplateName}`}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600"
                  >
                    <FileText size={15} />
                    {activeTemplateName}
                    <ChevronDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePopover((current) => (current === "skills" ? null : "skills"))}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600"
                  >
                    <Wrench size={15} />
                    {selectedSkills.length ? `已选择 ${selectedSkills.length} 个技能` : "选择技能"}
                    <ChevronDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePopover((current) => (current === "files" ? null : "files"))}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600"
                  >
                    <Folder size={15} />
                    我的文件
                    <ChevronDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePopover((current) => (current === "knowledge" ? null : "knowledge"))}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600"
                  >
                    <Database size={15} />
                    知识库
                    <ChevronDown size={13} />
                  </button>
                </div>
                {activePopover && (
                  <div className="absolute bottom-full left-0 z-30 mb-3 w-[280px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
                    {activePopover === "skills" && (
                      <div>
                        <p className="px-3 pb-2 pt-1 text-xs font-bold text-slate-400">选择技能</p>
                        {mockSkills.map((skill) => {
                          const selected = selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                                selected ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{skill}</span>
                              {selected && <Check size={15} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {activePopover === "files" && (
                      <div>
                        <p className="px-3 pb-2 pt-1 text-xs font-bold text-slate-400">我的文件</p>
                        {mockFiles.map((file) => (
                          <button
                            key={file}
                            type="button"
                            onClick={() => {
                              setSelectedFile(file);
                              setActivePopover(null);
                            }}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                              selectedFile === file ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Folder size={15} />
                            <span className="truncate">{file}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {activePopover === "knowledge" && (
                      <div>
                        <p className="px-3 pb-2 pt-1 text-xs font-bold text-slate-400">知识库</p>
                        {mockKnowledgeBases.map((knowledgeBase) => (
                          <button
                            key={knowledgeBase}
                            type="button"
                            onClick={() => {
                              setSelectedKnowledgeBase(knowledgeBase);
                              setActivePopover(null);
                            }}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                              selectedKnowledgeBase === knowledgeBase ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Database size={15} />
                            <span className="truncate">{knowledgeBase}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-50"
                    aria-label="添加材料"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-50"
                    aria-label="语音输入"
                  >
                    <Mic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isGenerating}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-200 text-white shadow-[0_10px_24px_rgba(37,99,235,0.12)] transition-colors hover:bg-blue-500"
                    aria-label="发送"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
};
