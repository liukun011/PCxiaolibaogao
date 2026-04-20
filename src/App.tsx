/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { DocumentClassificationSection } from './components/DocumentClassificationSection';
import {
  LayoutDashboard,
  FileText,
  Database,
  BookOpen,
  PenTool,
  ClipboardCheck,
  Settings,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  User,
  Ban,
  Mic,
  Play,
  Pause,
  Download,
  Building,
  Activity,
  Trash2,
  History,
  FileJson,
  FileSpreadsheet,
  FileAudio,
  FileText as FileIcon,
  CheckCircle2,
  Check,
  Layout,
  Sparkles,
  Clock,
  X,
  Maximize2,
  MoreHorizontal,
  ArrowRight,
  Target,
  BrainCircuit,
  Volume2,
  AlertTriangle,
  GitBranch,
  Edit3,
  ArrowLeft,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  Users,
  Briefcase,
  Gavel,
  Scale,
  Tag,
  Save,
  RefreshCw,
  Zap,
  PlusCircle,
  ShieldAlert,
  Lightbulb,
  Image as ImageIcon,
  Printer,
  Share2,
  Plus,
  Upload,
  Package,
  TrendingUp,
  PieChart,
  BarChart3,
  LineChart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { mockInterview, InterviewRecord, InterviewTranscript, DDQuestion } from "./types";

type ViewType = "projectList" | "dashboard" | "audit" | "edit" | "intelligence" | "questionLists" | "templates" | "templatePreview";

const loadDocxDeps = async () => {
  const [docxModule, fileSaverModule] = await Promise.all([
    import("docx"),
    import("file-saver"),
  ]);

  return {
    ...docxModule,
    saveAs: fileSaverModule.saveAs,
  };
};

const TEMPLATE_OPTIONS = [
  { id: "bank", title: "银行流贷尽调", desc: "关注经营现金流与抵押物状况", icon: Building },
  { id: "equity", title: "股权投资尽调", desc: "侧重核心壁垒与团队稳定性", icon: TrendingUp },
  { id: "general", title: "通用访谈体检", desc: "覆盖企业全貌的标准清单", icon: Activity },
] as const;

type InterviewQuestion = {
  category: string;
  question: string;
  source: string;
  type: string;
};

type QuestionCollection = {
  id: string;
  title: string;
  desc: string;
  questions: InterviewQuestion[];
};

type TemplateItem = {
  id: string;
  name: string;
  description: string;
  uploader: string;
  uploadTime: string;
  status: "enabled" | "disabled";
};

type FieldConfig = {
  type: string;
  extractionMethod: string;
  dataSource: string;
  businessRule: string;
};

const TEMPLATE_QUESTION_SETS: Record<string, any[]> = {
  bank: [
    { category: "财务状况", question: "贵司近三个月的经营性现金流情况如何？主要的回款难点在何处？", source: "模板预设", type: "preset" },
    { category: "资产情况", question: "目前用于抵质押的资产占比多少？是否存在权利受限未披露的重资产？", source: "模板预设", type: "preset" },
    { category: "经营稳定", question: "上下游结算方式近期是否有重大调整？", source: "模板预设", type: "preset" },
  ],
  equity: [
    { category: "核心壁垒", question: "公司的核心技术相比竞品有哪些不可替代的优势？", source: "模板预设", type: "preset" },
    { category: "团队构成", question: "核心研发团队的留存计划是什么？是否签署竞业协议？", source: "模板预设", type: "preset" },
    { category: "合规风控", question: "是否存在尚未了结的重大知识产权争议？", source: "模板预设", type: "preset" },
  ],
  general: [
    { category: "企业概况", question: "公司未来三年的发展战略和核心增长点是什么？", source: "模板预设", type: "preset" },
    { category: "市场环境", question: "目前的行业竞争格局如何？贵司的市场占有率处于什么水平？", source: "模板预设", type: "preset" },
  ],
};

const INITIAL_TEMPLATE_ITEMS: TemplateItem[] = [
  {
    id: "tpl-1",
    name: "授信调查报告",
    description: "用于企业客户授信前的标准化尽职调查报告模板，包含财务分析与风险评估。",
    uploader: "张三",
    uploadTime: "2026-04-10 14:30",
    status: "enabled",
  },
  {
    id: "tpl-2",
    name: "季度财务分析",
    description: "标准化的季度财务数据汇总与分析报告模板，适用于各部门季度汇报。",
    uploader: "李四",
    uploadTime: "2026-04-10 16:15",
    status: "disabled",
  },
  {
    id: "tpl-3",
    name: "尽职调查清单",
    description: "项目投资前期的尽职调查资料收集清单，涵盖法务、财务、业务等维度。",
    uploader: "王五",
    uploadTime: "2026-04-11 09:20",
    status: "enabled",
  },
];

const createDefaultField = (rule: string): FieldConfig => ({
  type: "文本",
  extractionMethod: "直接抽取",
  dataSource: "材料提取",
  businessRule: rule,
});

// Sidebar Item Component
const SidebarItem = ({ icon: Icon, label, active = false, badge = 0, onClick }: { icon: any, label: string, active?: boolean, badge?: number, onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>
    )}
  </div>
);

// Material Card Component
const MaterialCard = ({ icon: Icon, title, date, status = "completed", onClick }: { icon: any, title: string, date: string, status?: "completed" | "pending" | "error", onClick?: () => void }) => (
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

// Interview Item Component
const InterviewItem = ({ title, date, duration, onClick }: { title: string, date: string, duration: string, onClick: () => void }) => (
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

const TemplatesView = ({
  templates,
  setTemplates,
  onOpenTemplate,
}: {
  templates: TemplateItem[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateItem[]>>;
  onOpenTemplate: (template: TemplateItem, isNew?: boolean) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "parsing">("idle");
  const uploadTimersRef = useRef<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "enable" | "disable" | "delete" | null;
    template: TemplateItem | null;
  }>({ isOpen: false, action: null, template: null });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    template: TemplateItem | null;
    name: string;
    description: string;
  }>({ isOpen: false, template: null, name: "", description: "" });

  useEffect(() => {
    return () => {
      uploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const filteredTemplates = templates.filter((template) =>
    [template.name, template.description, template.uploader]
      .join(" ")
      .toLowerCase()
      .includes(searchKeyword.trim().toLowerCase()),
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    uploadTimersRef.current = [];
    setUploadStatus("uploading");

    const uploadTimer = window.setTimeout(() => {
      setUploadStatus("parsing");
    }, 900);

    const finishTimer = window.setTimeout(() => {
      const now = new Date();
      const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const nextTemplate: TemplateItem = {
        id: `tpl-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: "新上传的自定义模板，请点击编辑补充模板描述。",
        uploader: "当前用户",
        uploadTime: formatted,
        status: "enabled",
      };
      setTemplates((prev) => [nextTemplate, ...prev]);
      setUploadStatus("idle");
      event.target.value = "";
      onOpenTemplate(nextTemplate, true);
    }, 2600);

    uploadTimersRef.current.push(uploadTimer, finishTimer);
  };

  const openConfirmModal = (action: "enable" | "disable" | "delete", template: TemplateItem) => {
    setConfirmModal({ isOpen: true, action, template });
  };

  const executeAction = () => {
    if (!confirmModal.template || !confirmModal.action) return;

    if (confirmModal.action === "delete") {
      setTemplates((prev) => prev.filter((item) => item.id !== confirmModal.template?.id));
    } else {
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === confirmModal.template?.id
            ? { ...item, status: confirmModal.action === "enable" ? "enabled" : "disabled" }
            : item,
        ),
      );
    }

    setConfirmModal({ isOpen: false, action: null, template: null });
  };

  const openEditModal = (template: TemplateItem) => {
    setEditModal({
      isOpen: true,
      template,
      name: template.name,
      description: template.description,
    });
  };

  const saveEdit = () => {
    if (!editModal.template || !editModal.name.trim()) return;
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === editModal.template?.id
          ? { ...item, name: editModal.name.trim(), description: editModal.description.trim() }
          : item,
      ),
    );
    setEditModal({ isOpen: false, template: null, name: "", description: "" });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">我的模板</h1>
          <p className="mt-2 text-sm text-gray-500">统一管理报告模板，支持上传、启停、编辑和删除。</p>
          <p className="mt-2 text-sm text-amber-700">当报告生成结果不准确时，可以在这里修改模板规则后，再返回尽调详情重新生成报告。</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="请搜索模板名称"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-blue-500 sm:w-72"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleUploadClick}
            disabled={uploadStatus !== "idle"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploadStatus === "idle" ? <Plus size={16} /> : <RefreshCw size={16} className="animate-spin" />}
            <span>{uploadStatus === "uploading" ? "上传中..." : uploadStatus === "parsing" ? "解析中..." : "上传模板"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,.pdf,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => onOpenTemplate(template)}
              className={`group flex h-56 flex-col rounded-2xl border p-6 transition-all ${
                template.status === "enabled"
                  ? "border-gray-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-lg"
                  : "border-gray-100 bg-gray-50 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${template.status === "enabled" ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                  <FileText size={22} />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${template.status === "enabled" ? "bg-green-50 text-green-600" : "bg-gray-200 text-gray-500"}`}>
                  {template.status === "enabled" ? "已启用" : "已禁用"}
                </span>
              </div>

              <div className="min-h-0 flex-1">
                <h3 className="truncate text-base font-bold text-gray-800" title={template.name}>
                  {template.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500" title={template.description}>
                  {template.description}
                </p>
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    <span className="max-w-[110px] truncate">{template.uploader}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>{template.uploadTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      openConfirmModal(template.status === "enabled" ? "disable" : "enable", template);
                    }}
                    className={`rounded-md p-1.5 transition-colors ${template.status === "enabled" ? "text-amber-500 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                    title={template.status === "enabled" ? "禁用模板" : "启用模板"}
                  >
                    {template.status === "enabled" ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditModal(template);
                    }}
                    className="rounded-md p-1.5 text-blue-500 transition-colors hover:bg-blue-50"
                    title="编辑模板"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      openConfirmModal("delete", template);
                    }}
                    className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
                    title="删除模板"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText size={24} />
            </div>
            <p className="text-base font-bold text-gray-800">没有找到匹配的模板</p>
            <p className="mt-2 text-sm text-gray-500">可以换个关键词试试，或者直接上传一个新模板。</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {uploadStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm"
          >
            <div className="flex min-w-[260px] flex-col items-center gap-5 rounded-3xl bg-white px-8 py-8 shadow-xl">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                {uploadStatus === "parsing" && <FileText size={24} className="text-blue-600" />}
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{uploadStatus === "uploading" ? "正在上传..." : "正在解析..."}</p>
                <p className="mt-1 text-sm text-gray-500">{uploadStatus === "uploading" ? "请稍候，文件传输中" : "AI 正在提取模板结构与内容"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.isOpen && confirmModal.template && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${confirmModal.action === "delete" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  <AlertCircle size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {confirmModal.action === "delete"
                    ? "确认删除模板？"
                    : confirmModal.action === "enable"
                      ? "确认启用模板？"
                      : "确认禁用模板？"}
                </h3>
              </div>
              <p className="mb-6 text-sm leading-6 text-gray-600">
                {confirmModal.action === "delete"
                  ? `您确定要删除模板“${confirmModal.template.name}”吗？此操作不可恢复。`
                  : `您确定要${confirmModal.action === "enable" ? "启用" : "禁用"}模板“${confirmModal.template.name}”吗？`}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, action: null, template: null })}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={executeAction}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${confirmModal.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  确认
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModal.isOpen && editModal.template && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Edit3 size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">编辑模板信息</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">模板名称</label>
                  <input
                    value={editModal.name}
                    onChange={(event) => setEditModal((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="请输入模板名称"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">模板描述</label>
                  <textarea
                    value={editModal.description}
                    onChange={(event) => setEditModal((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="请输入模板描述"
                    className="h-24 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditModal({ isOpen: false, template: null, name: "", description: "" })}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={saveEdit}
                  disabled={!editModal.name.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TemplatePreviewView = ({
  template,
  isNew,
  onBack,
}: {
  template: TemplateItem;
  isNew?: boolean;
  onBack: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeConfig, setActiveConfig] = useState<string | "global" | null>(null);
  const [formData, setFormData] = useState<Record<string, FieldConfig>>({
    companyNameRule: createDefaultField("优先从企业基本信息目录下的营业执照中提取，如果没有则从其他资料中补充。"),
    jurisdictionRule: createDefaultField("由手动录入或访谈资料识别。"),
    investigatorRule: createDefaultField("由项目成员手动维护。"),
    industryRule: createDefaultField("优先来自工商信息，其次来自访谈和文档资料。"),
    applyAmountRule: createDefaultField("来自授信申请材料或访谈确认结果。"),
    guaranteeMethodRule: createDefaultField("来自授信方案材料及访谈记录。"),
    establishTimeRule: createDefaultField("来自营业执照或工商登记信息。"),
    registeredCapitalRule: createDefaultField("来自营业执照或工商登记信息。"),
    registeredAddressRule: createDefaultField("来自营业执照。"),
    actualAddressRule: createDefaultField("优先来自访谈，如未提及则沿用注册地址。"),
    historyChangeRule: createDefaultField("来自历史沿革材料、工商变更记录及访谈补充。"),
    equityStructureRule: createDefaultField("来自股权结构图、工商穿透数据或客户提供材料。"),
    financeDescRule: createDefaultField("来自近三年财务报表与最近一期管理报表，并结合访谈进行解释。"),
  });

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const updateField = (key: string, value: FieldConfig) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderEditableField = (configKey: string) => {
    const value = formData[configKey];
    if (!value) return null;

    if (!isEditing) {
      return <span className="text-red-500">{value.businessRule}</span>;
    }

    return (
      <button
        onClick={() => setActiveConfig(configKey)}
        className={`group flex w-full items-center justify-between rounded border border-dashed px-3 py-2 text-left text-sm transition-all ${
          activeConfig === configKey
            ? "border-blue-500 bg-blue-100 text-blue-800 shadow-sm"
            : "border-blue-200 bg-blue-50/60 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <span className="truncate pr-3">{value.businessRule}</span>
        <Settings size={14} className={`shrink-0 ${activeConfig === configKey ? "text-blue-600" : "text-blue-400 opacity-0 group-hover:opacity-100"}`} />
      </button>
    );
  };

  const activeFieldConfig = activeConfig && activeConfig !== "global" ? formData[activeConfig] : null;

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-gray-800">{template.name}.docx</h1>
              {isNew && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                  刚刚上传
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setActiveConfig("global")}
                className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-100"
              >
                <Settings size={16} />
                全局配置
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setActiveConfig(null);
                }}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                <X size={16} />
                取消
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setActiveConfig(null);
                  setShowToast(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-100"
              >
                <Save size={16} />
                保存修改
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setActiveConfig("global");
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              <Edit3 size={16} />
              编辑模板
            </button>
          )}

          <div className="mx-1 h-6 w-px bg-gray-200" />

          <button className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
            <Download size={16} />
            下载源文件
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 justify-center overflow-auto p-8">
          <div className="min-h-[1056px] w-full max-w-[900px] rounded-sm border border-gray-200 bg-white p-12 shadow-sm md:p-16">
            <div className="mx-auto space-y-6 font-serif text-[14px] text-gray-800">
              <div className="mb-8 space-y-2 text-center">
                <h1 className="text-2xl font-bold text-gray-900">小微企业授信业务尽职调查报告</h1>
                <p className="text-sm text-gray-600">（适用于 2000 万元以下公司授信业务）</p>
              </div>

              <section>
                <h2 className="mb-0 border border-black bg-gray-100 p-1 text-lg font-bold">一、报审方案及尽调情况</h2>
                <table className="w-full border-collapse border border-black text-center text-sm">
                  <tbody>
                    <tr>
                      <td className="w-32 border border-black bg-gray-50 p-2">企业名称</td>
                      <td colSpan={3} className="border border-black p-2 text-left">{renderEditableField("companyNameRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">归属管辖</td>
                      <td className="border border-black p-2">{renderEditableField("jurisdictionRule")}</td>
                      <td className="w-32 border border-black bg-gray-50 p-2">调查人（双人）</td>
                      <td className="border border-black p-2">{renderEditableField("investigatorRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">行业分类</td>
                      <td className="border border-black p-2">{renderEditableField("industryRule")}</td>
                      <td className="border border-black bg-gray-50 p-2">申请额度</td>
                      <td className="border border-black p-2">{renderEditableField("applyAmountRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">担保方式</td>
                      <td colSpan={3} className="border border-black p-2 text-left">{renderEditableField("guaranteeMethodRule")}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="mt-6">
                <h2 className="mb-0 border border-black bg-gray-100 p-1 text-lg font-bold">二、申请人基本情况</h2>
                <table className="w-full border-collapse border border-black text-center text-sm">
                  <tbody>
                    <tr>
                      <td className="w-32 border border-black bg-gray-50 p-2">成立时间</td>
                      <td className="border border-black p-2">{renderEditableField("establishTimeRule")}</td>
                      <td className="w-24 border border-black bg-gray-50 p-2">注册资本</td>
                      <td className="border border-black p-2">{renderEditableField("registeredCapitalRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">注册地址</td>
                      <td colSpan={3} className="border border-black p-2 text-left">{renderEditableField("registeredAddressRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">实际经营地址</td>
                      <td colSpan={3} className="border border-black p-2 text-left">{renderEditableField("actualAddressRule")}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="space-y-4 border border-t-0 border-black p-4">
                  <div>
                    <p className="font-bold">介绍历史沿革和主营业务变动情况：</p>
                    <div className="mt-2">{renderEditableField("historyChangeRule")}</div>
                  </div>
                  <div>
                    <p className="font-bold">股权结构如下（可图示或列表）：</p>
                    <div className="mt-2">{renderEditableField("equityStructureRule")}</div>
                  </div>
                </div>
              </section>

              <section className="mt-6">
                <h2 className="mb-0 border border-black bg-gray-100 p-1 text-lg font-bold">三、财务情况说明</h2>
                <div className="border border-t-0 border-black p-4">
                  {renderEditableField("financeDescRule")}
                </div>
              </section>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex w-[380px] shrink-0 flex-col border-l border-gray-200 bg-white">
            {!activeConfig ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-400">
                <Settings size={48} className="mb-4 text-gray-200" />
                <p>请在左侧选择需要配置的字段，或点击右上角进行全局配置</p>
              </div>
            ) : activeConfig === "global" ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
                    <Settings size={16} className="text-purple-600" />
                    模板全局处理逻辑配置
                  </h3>
                  <button
                    onClick={() => setActiveConfig(null)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 space-y-6 overflow-auto p-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800">全局处理策略</label>
                    <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                      <input type="radio" name="globalStrategy" className="mt-1" defaultChecked />
                      <div>
                        <div className="text-sm font-medium text-gray-800">精准匹配优先</div>
                        <div className="mt-0.5 text-xs text-gray-500">严格按字段配置提取，缺失则留空，不做主观推断。</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                      <input type="radio" name="globalStrategy" className="mt-1" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">智能补全优先</div>
                        <div className="mt-0.5 text-xs text-gray-500">规则提取失败时，允许模型结合上下文进行补全。</div>
                      </div>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800">全局前置处理</label>
                    <textarea
                      rows={5}
                      defaultValue={"1. 对图片与 PDF 统一做 OCR 识别。\n2. 提取访谈录音中的关键实体信息。\n3. 对姓名、证件号等敏感信息进行脱敏。"}
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-purple-500"
                    />
                  </div>
                </div>
              </>
            ) : activeFieldConfig ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
                    <Settings size={16} className="text-blue-600" />
                    配置字段属性
                  </h3>
                  <button
                    onClick={() => setActiveConfig(null)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 space-y-5 overflow-auto p-6">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Database size={14} className="text-gray-400" />
                      数据来源
                    </label>
                    <input
                      value={activeFieldConfig.dataSource}
                      onChange={(event) => updateField(activeConfig, { ...activeFieldConfig, dataSource: event.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <BookOpen size={14} className="text-gray-400" />
                      业务规则
                    </label>
                    <textarea
                      rows={5}
                      value={activeFieldConfig.businessRule}
                      onChange={(event) => updateField(activeConfig, { ...activeFieldConfig, businessRule: event.target.value })}
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">字段类型</label>
                    <select
                      value={activeFieldConfig.type}
                      onChange={(event) => updateField(activeConfig, { ...activeFieldConfig, type: event.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    >
                      <option>文本</option>
                      <option>数字</option>
                      <option>布尔</option>
                      <option>时间</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">抽取方式</label>
                    <select
                      value={activeFieldConfig.extractionMethod}
                      onChange={(event) => updateField(activeConfig, { ...activeFieldConfig, extractionMethod: event.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    >
                      <option>直接抽取</option>
                      <option>归纳总结</option>
                      <option>计算</option>
                    </select>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-green-100 bg-white px-5 py-4 shadow-xl"
          >
            <CheckCircle2 size={20} className="text-green-600" />
            <div>
              <p className="text-sm font-bold text-gray-900">模板修改已保存</p>
              <p className="text-xs text-gray-500">新的字段规则已同步到模板配置中。</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("projectList");
  const [editInitialTab, setEditInitialTab] = useState<"conflict" | "traceability" | "templateRules">("conflict");
  const [dashboardSection, setDashboardSection] = useState<"questions" | null>(null);
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATE_ITEMS);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [isNewTemplatePreview, setIsNewTemplatePreview] = useState(false);
  const [questionCollections, setQuestionCollections] = useState<QuestionCollection[]>(() =>
    TEMPLATE_OPTIONS.map((template) => ({
      id: template.id,
      title: template.title,
      desc: template.desc,
      questions: (TEMPLATE_QUESTION_SETS[template.id] || []).map((item) => ({ ...item })),
    })),
  );
  const [intelligenceSource, setIntelligenceSource] = useState<"projectList" | "dashboard">("projectList");
  const [intelligenceInitialStep, setIntelligenceInitialStep] = useState<"input" | "confirm" | "loading" | "results">("input");
  const [intelligenceResult, setIntelligenceResult] = useState<any>(null);
  const [isBackgroundAnalyzing, setIsBackgroundAnalyzing] = useState(false);
  const [hasBackgroundResult, setHasBackgroundResult] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  const handlePlayToggle = () => setIsPlaying(!isPlaying);

  const handleDownloadDocx = async () => {
    const {
      AlignmentType,
      Document,
      HeadingLevel,
      Packer,
      Paragraph,
      TextRun,
      saveAs,
    } = await loadDocxDeps();
    const projectName = intelligenceResult?.companyName || "A公司";
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `${projectName}流贷尽调报告`,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: "1. 企业基本情况",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun(`${projectName}（以下简称“公司”）成立于2010年，总部位于上海市张江高科技园区。公司是一家专注于工业自动化设备研发、生产及销售的高新技术企业。经过十余年的发展，公司已在细分领域建立了较强的技术壁垒，拥有多项核心专利技术。`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun("截至2024年底，公司注册资本为人民币5000万元，员工总数超过300人，其中研发人员占比超过40%。公司主要产品涵盖了智能组装线、精密检测设备以及工业机器人集成系统，广泛应用于电子制造、汽车零部件及新能源行业。"),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              text: "2. 行业背景与地位",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun("随着全球制造业向智能化、数字化转型，工业自动化行业迎来了快速增长期。国内政策持续支持“中国制造2025”，为本土自动化设备厂商提供了广阔的市场空间。"),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${projectName}流贷尽调报告.docx`);
  };

  const handleDownloadConflictDocx = async () => {
    const { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun, saveAs } =
      await loadDocxDeps();
    const conflicts = [
      { id: 1, type: "数据不一致", field: "2024年营业收入", sourceA: "财务报表 (1.2亿)", sourceB: "访谈记录 (1.5亿)", severity: "高风险" },
      { id: 2, type: "逻辑冲突", field: "还款计划", sourceA: "销售回款覆盖", sourceB: "抵押物变现", severity: "中风险" },
      { id: 3, type: "信息缺失", field: "股权变动", sourceA: "工商信息 (有变动)", sourceB: "访谈记录 (无变动)", severity: "高风险" },
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: "报告冲突标记清单", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "生成时间: " + new Date().toLocaleString(), spacing: { after: 400 } }),
            ...conflicts.flatMap(c => [
              new Paragraph({ text: `${c.type}: ${c.field}`, heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ children: [new TextRun({ text: "风险等级: ", bold: true }), new TextRun(c.severity)] }),
              new Paragraph({ children: [new TextRun({ text: "来源 A: ", bold: true }), new TextRun(c.sourceA)] }),
              new Paragraph({ children: [new TextRun({ text: "来源 B: ", bold: true }), new TextRun(c.sourceB)] }),
              new Paragraph({ text: "", spacing: { after: 200 } }),
            ])
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "报告冲突标记清单.docx");
  };

  const handleDownloadTraceabilityDocx = async () => {
    const { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun, saveAs } =
      await loadDocxDeps();
    const projectName = intelligenceResult?.companyName || "A公司";
    const traces = [
      { id: 1, section: "第一章：企业基本情况", content: `${projectName}成立于2010年，主要从事工业自动化设备的研发与生产...`, source: "工商登记信息 / 官方网站", confidence: "98%" },
      { id: 2, section: "第二章：财务状况分析", content: "2024年实现营业收入1.2亿元，净利润1500万元，同比增长12%...", source: `${projectName}2024年财务报表.pdf (第12页)`, confidence: "100%" },
      { id: 3, section: "第三章：访谈核心观点", content: "受访人表示，公司未来三年将重点布局新能源汽车零部件市场...", source: "访谈录音 (02:55 - 03:45)", confidence: "92%" },
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: "报告内容溯源分析", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "生成时间: " + new Date().toLocaleString(), spacing: { after: 400 } }),
            ...traces.flatMap(t => [
              new Paragraph({ text: t.section, heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ children: [new TextRun({ text: "报告内容: ", bold: true }), new TextRun({ text: t.content, italics: true })] }),
              new Paragraph({ children: [new TextRun({ text: "溯源出处: ", bold: true }), new TextRun(t.source)] }),
              new Paragraph({ children: [new TextRun({ text: "AI 置信度: ", bold: true }), new TextRun(t.confidence)] }),
              new Paragraph({ text: "", spacing: { after: 200 } }),
            ])
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "报告溯源分析报告.docx");
  };

  // Simulate audio progress
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => (prev + 1) % 300); // loop for demo
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const scrollToTranscript = (startTime: number) => {
    setCurrentTime(startTime);
    setIsPlaying(true);
  };

  const handleStartBackgroundAI = (baseData?: any) => {
    setIsBackgroundAnalyzing(true);
    setHasBackgroundResult(false);

    if (baseData) {
      setIntelligenceResult({ ...baseData, isPending: true, isSkip: false });
    } else {
      setIntelligenceResult((prev: any) => ({ ...prev, isPending: true, isSkip: false }));
    }

    const workingData = baseData || intelligenceResult;
    const currentQs = workingData?.questions || [];
    const companyName = workingData?.companyName || "未知企业";
    const template = workingData?.template || "bank";
    const targetType = workingData?.targetType || "company";
    const targetCode = workingData?.targetCode || "";

    // 模拟：如果有“测试”、“虚拟”、“未知”等字眼，或者名字太短，视为企查查/公开渠道搜不到的情况
    const isNotFound = companyName.includes("测试") || companyName.includes("空") || companyName.includes("虚拟") || companyName === "未知企业";

    setTimeout(() => {
      setIntelligenceResult((prev: any) => {
        let newCompanyData: any;
        let aiQuestions: any[] = [];
        let newGuidelines: any[] = [];

        if (isNotFound) {
          // 搜不到的情况
          newCompanyData = {
            overview: { industry: "无法匹配", scale: "无法匹配", location: "全网未留痕" },
            financialAnomalies: [],
            litigation: { count: 0, details: "未在涉诉平台及工商网络中匹配到精确主体" },
            pledges: { count: 0, detail: "无关联记录" }
          };
          aiQuestions = [
            { category: "主体资质异常 (AI识别)", question: `系统未能从企查查、法院网等公开渠道检索到【${companyName}】${targetCode ? `(${targetCode})` : ""}的有效核准信息，且系统当前未纳入充足底层资料。请详细说明当前的实际运营主体名称，并在会后补充提供最新的营业执照副本或相关身份证明文件。`, source: "AI 数据盲区警示", type: "material" }
          ];
          newGuidelines = [
            { tag: "主体存疑", preference: "高度警惕" },
            { tag: "补充基础底稿", preference: "必须执行" }
          ];
        } else {
          // 能搜到的情况
          newCompanyData = targetType === "individual" ? {
            overview: { industry: "个人用户", scale: "个人尽调", location: "未知" },
            financialAnomalies: [],
            litigation: { count: targetCode ? 2 : 1, details: targetCode ? "法院执行网查询到相关诉讼及被执行记录" : "关联裁判文书1份" },
            pledges: { count: 0, detail: "无关联抵押记录" }
          } : {
            overview: { industry: "未知行业", scale: "中型企业", location: "上海市张江高科技园区" },
            financialAnomalies: [
              { type: "营收增长放缓", detail: "表现低于行业平均水平(12%)", severity: "medium" },
              { type: "应收账款周转率下降", detail: "应收账款周转天数从90天延长至125天", severity: "high" }
            ],
            litigation: { count: 2, details: "涉及买卖合同纠纷" },
            pledges: { count: 1, detail: "大股东股权质押比例为35%" }
          };
          aiQuestions = targetType === "individual"
            ? [
              { category: "诉讼违约风险 (AI挖掘)", question: `经法院执行网检索，发现【${companyName}】${targetCode ? `(相关证件:${targetCode})` : ""}近期存在诉讼或被执行案件，请说明纠纷的具体细节及后续影响？`, source: "AI 深度挖掘", type: "material" },
              { category: "个人信用风险 (AI挖掘)", question: `我们注意到您的信用记录有异常波动，是否存在未结清的隐匿个人担保？`, source: "AI 深度挖掘", type: "material" }
            ]
            : [
              { category: "合规风险 (AI挖掘)", question: "公司近三年的税务合规证明是否完整？", source: "AI 深度挖掘", type: "material" },
              { category: "市场竞争 (AI挖掘)", question: "面对行业新进入者的价格战，应对策略是什么？", source: "AI 深度挖掘", type: "material" }
            ];
          newGuidelines = [
            { tag: targetType === "individual" ? "个人征信" : "环保违规", preference: "重点关注" },
            { tag: targetType === "individual" ? "过度消费" : "应收账款异常", preference: "审慎介入" }
          ];
        }

        return {
          ...prev,
          isSkip: false,
          isPending: false,
          companyData: newCompanyData,
          questions: currentQs,
          aiQuestions: aiQuestions,
          guidelines: newGuidelines
        };
      });
      setIsBackgroundAnalyzing(false);
      setHasBackgroundResult(true);
    }, 6000);
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <BrainCircuit size={20} />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">星启</span>
        </div>

        <nav className="flex-1 py-4">
          <SidebarItem icon={ClipboardCheck} label="尽调管理" active={currentView === "projectList" || currentView === "dashboard"} onClick={() => setCurrentView("projectList")} />
          <SidebarItem icon={BookOpen} label="我的模板" active={currentView === "templates"} onClick={() => setCurrentView("templates")} />
          <SidebarItem
            icon={HelpCircle}
            label="问题清单"
            active={currentView === "questionLists"}
            onClick={() => setCurrentView("questionLists")}
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-600 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
              张
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">个人中心</span>
              <span className="text-[10px] opacity-70">高级分析师</span>
            </div>
            <ChevronRight size={16} className="ml-auto" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {currentView === "projectList" && (
          <ProjectListView
            onSelectProject={() => setCurrentView("dashboard")}
            onStartIntelligence={() => {
              setIntelligenceSource("projectList");
              setIntelligenceInitialStep("input");
              setCurrentView("intelligence");
            }}
            onDirectNew={(projectName, name, template, initialQs, targetType, targetCode, enableAI) => {
              const hasCompanyName = Boolean(name.trim());
              const shouldStartBackgroundAI = enableAI !== false && hasCompanyName;
              const initRes = {
                projectName: projectName,
                companyName: name,
                targetType: targetType || "company",
                targetCode: targetCode || "",
                isSkip: !shouldStartBackgroundAI,
                isPending: shouldStartBackgroundAI,
                template: template,
                questions: initialQs
              };
              setCurrentView("dashboard");
              if (shouldStartBackgroundAI) {
                handleStartBackgroundAI(initRes);
              } else {
                setIntelligenceResult(initRes);
                setIsBackgroundAnalyzing(false);
                setHasBackgroundResult(false);
              }
            }}
          />
        )}

        {currentView === "dashboard" && (
          <DashboardView
            onBack={() => {
              setCurrentView("projectList");
              setDashboardSection(null);
            }}
            onEdit={() => {
              setEditInitialTab("conflict");
              setCurrentView("edit");
            }}
            onAudit={() => setCurrentView("audit")}
            onDownload={handleDownloadDocx}
            onOpenModal={() => setIsModalOpen(true)}
            onStartIntelligence={(step) => {
              setIntelligenceSource("dashboard");
              setIntelligenceInitialStep(step || "confirm");
              setCurrentView("intelligence");
            }}
            intelligenceResult={intelligenceResult}
            setIntelligenceResult={setIntelligenceResult}
            isBackgroundAnalyzing={isBackgroundAnalyzing}
            hasBackgroundResult={hasBackgroundResult}
            onViewBackgroundResult={() => {
              setHasBackgroundResult(false);
            }}
            onStartBackgroundAI={() => handleStartBackgroundAI()}
            onOpenTemplates={() => {
              setEditInitialTab("templateRules");
              setCurrentView("edit");
            }}
            initialSection={dashboardSection}
            onSectionHandled={() => setDashboardSection(null)}
            questionCollections={questionCollections}
            setQuestionCollections={setQuestionCollections}
          />
        )}

        {currentView === "questionLists" && (
          <QuestionListView
            collections={questionCollections}
            setCollections={setQuestionCollections}
          />
        )}

        {currentView === "templates" && (
          <TemplatesView
            templates={templates}
            setTemplates={setTemplates}
            onOpenTemplate={(template, isNew) => {
              setSelectedTemplate(template);
              setIsNewTemplatePreview(Boolean(isNew));
              setCurrentView("templatePreview");
            }}
          />
        )}

        {currentView === "templatePreview" && selectedTemplate && (
          <TemplatePreviewView
            template={selectedTemplate}
            isNew={isNewTemplatePreview}
            onBack={() => {
              setCurrentView("templates");
              setIsNewTemplatePreview(false);
            }}
          />
        )}

        {currentView === "audit" && (
          <AuditView
            onBack={() => setCurrentView("dashboard")}
            onDownloadConflict={handleDownloadConflictDocx}
            onDownloadTraceability={handleDownloadTraceabilityDocx}
            intelligenceResult={intelligenceResult}
          />
        )}

        {currentView === "edit" && (
          <EditReportView
            onBack={() => setCurrentView("dashboard")}
            onDownload={handleDownloadDocx}
            onDownloadConflict={handleDownloadConflictDocx}
            onDownloadTraceability={handleDownloadTraceabilityDocx}
            intelligenceResult={intelligenceResult}
            initialSideTab={editInitialTab}
            templates={templates}
            setTemplates={setTemplates}
          />
        )}

        {currentView === "intelligence" && (
          <IntelligenceView
            onBack={() => setCurrentView(intelligenceSource === "projectList" ? "projectList" : "dashboard")}
            onComplete={(result) => {
              if (result) {
                setIntelligenceResult(result);
                // In a real app, we'd add these to the project's questions
              }
              setCurrentView("dashboard");
            }}
            initialCompanyName={intelligenceResult?.companyName || ""}
            initialStep={intelligenceInitialStep}
          />
        )}
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-6xl h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Mic size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{mockInterview.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Clock size={12} /> {mockInterview.date}</span>
                    <span className="flex items-center gap-1"><Volume2 size={12} /> 时长: {mockInterview.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Transcription & Player */}
              <div className="flex-1 flex flex-col border-r border-gray-100 bg-gray-50/30">
                {/* Audio Player Visualizer */}
                <div className="p-8 pb-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-end justify-between gap-1 h-12">
                      {[...Array(40)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: isPlaying ? [10, Math.random() * 40 + 10, 10] : 10 }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                          className={`w-1 rounded-full ${i * 7.5 < (currentTime / 300) * 300 ? "bg-blue-600" : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={handlePlayToggle}
                        className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                      >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                      </button>
                      <div className="flex-1 space-y-2">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                          <div
                            className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-300"
                            style={{ width: `${(currentTime / 300) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-gray-400">
                          <span>{Math.floor(currentTime / 60).toString().padStart(2, '0')}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                          <span>05:00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transcription List */}
                <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-6" ref={transcriptContainerRef}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <FileText size={16} className="text-blue-600" />
                      录音转写全文
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {mockInterview.transcripts.map((item) => (
                      <div
                        key={item.id}
                        className={`group p-4 rounded-2xl transition-all cursor-pointer border border-transparent ${currentTime >= item.startTime && currentTime < item.startTime + 20 ? "bg-blue-50 border-blue-100 shadow-sm" : "hover:bg-white hover:border-gray-100 hover:shadow-sm"}`}
                        onClick={() => scrollToTranscript(item.startTime)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.speaker === "访谈员" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                            {item.speaker}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">{item.timestamp}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${currentTime >= item.startTime && currentTime < item.startTime + 20 ? "text-blue-900 font-medium" : "text-gray-600"}`}>
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Interview Details & Questions */}
              <div className="w-96 flex flex-col bg-white border-l border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gray-50/20">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    访谈要点与详情
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">本次访谈关注的核心问题与背景资料</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Interview Summary */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">访谈摘要</h4>
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <p className="text-xs text-blue-900 leading-relaxed font-medium">
                        本次访谈主要围绕企业 2024 年营收增长放缓及应收账款周转率下降问题展开。受访人详细说明了市场竞争加剧及下游客户账期延长的背景，并提出了初步的整改计划。
                      </p>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">访谈问题清单</h4>
                    <div className="space-y-3">
                      {mockInterview.questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 transition-all shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                              {idx + 1}
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{q.category || "尽调要点"}</span>
                              <p className="text-sm font-bold text-gray-800 leading-snug">{q.question}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// --- New View Components ---

const QuestionListView = ({
  collections,
  setCollections,
}: {
  collections: QuestionCollection[];
  setCollections: React.Dispatch<React.SetStateAction<QuestionCollection[]>>;
}) => {
  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id || "bank");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const addQuestionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!collections.find((item) => item.id === activeCollectionId)) {
      setActiveCollectionId(collections[0]?.id || "bank");
    }
  }, [activeCollectionId, collections]);

  const activeCollection = collections.find((item) => item.id === activeCollectionId);

  const handleCreateCollection = () => {
    if (!newCollectionTitle.trim()) return;
    const nextCollection: QuestionCollection = {
      id: `custom-${Date.now()}`,
      title: newCollectionTitle.trim(),
      desc: newCollectionDesc.trim() || "自定义问题集合",
      questions: [],
    };
    setCollections((prev) => [...prev, nextCollection]);
    setActiveCollectionId(nextCollection.id);
    setShowCreateForm(false);
    setNewCollectionTitle("");
    setNewCollectionDesc("");
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !activeCollection) return;
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === activeCollection.id
          ? {
              ...collection,
              questions: [
                ...collection.questions,
                {
                  category: "未分类",
                  question: newQuestionText.trim(),
                  source: "问题清单预设",
                  type: "preset",
                },
              ],
            }
          : collection,
      ),
    );
    setNewQuestionText("");
    window.setTimeout(() => {
      addQuestionTextareaRef.current?.focus();
    }, 0);
  };

  const handleAddQuestionAndClose = () => {
    if (!newQuestionText.trim() || !activeCollection) return;
    handleAddQuestion();
    setShowAddQuestionForm(false);
  };

  const handleStartEditQuestion = (index: number, item: InterviewQuestion) => {
    setEditingQuestionIndex(index);
    setEditingQuestionText(item.question);
  };

  const handleSaveQuestion = () => {
    if (editingQuestionIndex === null || !activeCollection || !editingQuestionText.trim()) return;
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === activeCollection.id
          ? {
              ...collection,
              questions: collection.questions.map((item, index) =>
                index === editingQuestionIndex
                  ? { ...item, question: editingQuestionText.trim() }
                  : item,
              ),
            }
          : collection,
      ),
    );
    setEditingQuestionIndex(null);
    setEditingQuestionText("");
  };

  const handleDeleteQuestion = (index: number) => {
    if (!activeCollection) return;
    const target = activeCollection.questions[index];
    if (!target) return;
    const confirmed = window.confirm(`确认删除问题“${target.question}”吗？`);
    if (!confirmed) return;
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === activeCollection.id
          ? { ...collection, questions: collection.questions.filter((_, itemIndex) => itemIndex !== index) }
          : collection,
      ),
    );
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-8 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">问题清单</h1>
            <p className="mt-1 text-sm text-gray-500">集中管理问题集合，并维护集合内的问题。</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-8">
        <div className="grid h-full gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-gray-400">问题集合</p>
                  <p className="mt-2 text-sm text-gray-500">选择一套问题清单进行管理</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm((prev) => !prev);
                    setShowAddQuestionForm(false);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${showCreateForm ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  <PlusCircle size={14} />
                  <span>新建</span>
                </button>
              </div>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-3">
              <AnimatePresence>
                {showCreateForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-3 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60"
                  >
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                        <BookOpen size={14} />
                        <span>新建问题集合</span>
                      </div>
                      <input
                        type="text"
                        value={newCollectionTitle}
                        onChange={(e) => setNewCollectionTitle(e.target.value)}
                        placeholder="输入问题集合名称..."
                        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <input
                        type="text"
                        value={newCollectionDesc}
                        onChange={(e) => setNewCollectionDesc(e.target.value)}
                        placeholder="输入问题集合说明（选填）..."
                        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewCollectionTitle("");
                            setNewCollectionDesc("");
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleCreateCollection}
                          disabled={!newCollectionTitle.trim()}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          创建问题集合
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {collections.map((collection) => {
                  const isActive = activeCollectionId === collection.id;
                  return (
                    <button
                      key={collection.id}
                      onClick={() => setActiveCollectionId(collection.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${isActive ? "border-blue-200 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-100 hover:bg-blue-50/40"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-800">{collection.title}</p>
                          <p className="mt-1 truncate text-xs text-gray-500">{collection.desc}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                          {collection.questions.length}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-gray-400">当前集合</p>
                  <h2 className="mt-2 text-xl font-bold text-gray-800">{activeCollection?.title || "未选择问题集合"}</h2>
                  <p className="mt-1 text-sm text-gray-500">{activeCollection?.desc || "请选择左侧问题集合"}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddQuestionForm((prev) => !prev);
                    setShowCreateForm(false);
                  }}
                  disabled={!activeCollection}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${showAddQuestionForm ? "border-amber-500 bg-amber-500 text-white" : "border-amber-200 bg-white text-amber-600 hover:bg-amber-50"} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Plus size={16} />
                  <span>新增问题</span>
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
              <AnimatePresence>
                {showAddQuestionForm && activeCollection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b border-gray-100"
                  >
                    <div className="space-y-3 bg-amber-50/40 p-5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                        <Plus size={14} />
                        <span>新增问题</span>
                      </div>
                      <textarea
                        ref={addQuestionTextareaRef}
                        autoFocus
                        rows={3}
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                            e.preventDefault();
                            handleAddQuestion();
                          }
                        }}
                        placeholder="输入问题内容..."
                        className="w-full resize-none rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowAddQuestionForm(false);
                            setNewQuestionText("");
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleAddQuestionAndClose}
                          disabled={!newQuestionText.trim()}
                          className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          保存
                        </button>
                        <button
                          onClick={handleAddQuestion}
                          disabled={!newQuestionText.trim()}
                          className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          保存并继续新增
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="divide-y divide-gray-100">
                {activeCollection?.questions.length ? (
                  activeCollection.questions.map((item, index) => (
                    <div key={`${activeCollection.id}-${index}`} className="p-5 transition-colors hover:bg-gray-50/70">
                      {editingQuestionIndex === index ? (
                        <div className="space-y-3">
                          <textarea
                            autoFocus
                            rows={3}
                            value={editingQuestionText}
                            onChange={(e) => setEditingQuestionText(e.target.value)}
                            className="w-full resize-none rounded-xl border border-blue-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingQuestionIndex(null)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleSaveQuestion}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-blue-700"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{item.category}</span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">预设问题</span>
                            </div>
                            <p className="mt-3 text-sm font-medium leading-7 text-gray-800">{item.question}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEditQuestion(index, item)}
                              className="rounded-lg border border-gray-200 p-2 text-gray-400 transition-all hover:bg-white hover:text-blue-600"
                              title="编辑问题"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(index)}
                              className="rounded-lg border border-gray-200 p-2 text-gray-400 transition-all hover:bg-white hover:text-red-600"
                              title="删除问题"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    <BookOpen size={32} className="mx-auto opacity-20" />
                    <p className="mt-3 text-sm font-medium">当前问题集合还没有问题</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Project List View Component
const ProjectListView = ({ onSelectProject, onStartIntelligence, onDirectNew }: { onSelectProject: () => void, onStartIntelligence: () => void, onDirectNew: (projectName: string, companyName: string, template: string, initialQuestions: any[], targetType?: string, targetCode?: string, enableAI?: boolean) => void }) => {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [showDirectNewModal, setShowDirectNewModal] = useState(false);
  const [customProjectName, setCustomProjectName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("bank");
  const [targetType, setTargetType] = useState<"company" | "individual">("company");
  const [targetCode, setTargetCode] = useState("");

  const handleCreateProject = () => {
    if (!customProjectName.trim()) {
      return;
    }

    onDirectNew(
      customProjectName.trim(),
      newProjectName.trim(),
      selectedTemplate,
      [...TEMPLATE_QUESTION_SETS[selectedTemplate]],
      targetType,
      targetCode,
      true,
    );
    setShowDirectNewModal(false);
    setCustomProjectName("");
    setNewProjectName("");
    setTargetType("company");
    setTargetCode("");
  };

  const projects = [
    { id: 1, title: "a", desc: "公司名称为“小狸报告”，主营AI智能报告生成。面向数字化转...", time: "2026-03-19 16:09:08", icon: FileText },
    { id: 2, title: "a", desc: "公司名称为“a”，主营业务未提供，财务状况未提供相关信息...", time: "2026-03-13 14:15:34", icon: User },
    { id: 3, title: "1", desc: "公司名称为“未提供”，主营业务未提供相关信息，财务状况未...", time: "2026-03-07 14:01:01", icon: MessageSquare },
    { id: 4, title: "b", desc: "访谈小总结未生成，请刷新生成。", time: "2026-03-03 16:54:20", icon: MessageSquare },
    { id: 5, title: "11", desc: "公司名称为“未提供”，主营业务未提供相关信息，财务状况未...", time: "2026-03-02 15:07:28", icon: User },
    { id: 6, title: "aa", desc: "访谈小总结未生成，请刷新生成。", time: "2026-03-02 15:07:23", icon: Mic },
    { id: 7, title: "aa", desc: "访谈小总结未生成，请刷新生成。", time: "2026-03-02 15:06:53", icon: FileText },
    { id: 8, title: "a", desc: "访谈小总结未生成，请刷新生成。", time: "2026-02-25 15:23:39", icon: FileIcon },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-gray-100 shrink-0">
        <h1 className="text-xl font-bold text-gray-800">尽调管理</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="请搜索尽调项目"
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => {
                setShowDirectNewModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <PlusCircle size={16} />
              <span>新建尽调项目</span>
            </button>
          </div>
        </div>
      </header>

      {/* Direct New Modal */}
      <AnimatePresence>
        {showDirectNewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDirectNewModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">新建尽调项目</h3>
                  <button onClick={() => setShowDirectNewModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          尽调项目名称 *
                        </label>
                        <input
                          type="text"
                          autoFocus
                          value={customProjectName}
                          onChange={(e) => setCustomProjectName(e.target.value)}
                          placeholder="例如：2024Q3小狸科技流贷尽调方案"
                          className="w-full py-3 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          企业名称 / 信用代码
                        </label>
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="请输入企业名称或信用代码（选填）"
                          className="w-full py-3 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">请选择初始尽调模板</label>
                      <div className="relative">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="w-full py-3 px-5 pr-10 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium cursor-pointer"
                        >
                          {TEMPLATE_OPTIONS.map((tpl) => (
                            <option key={tpl.id} value={tpl.id}>
                              {tpl.title} - {tpl.desc}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setShowDirectNewModal(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleCreateProject}
                        disabled={!customProjectName.trim()}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                      >
                        新建 <ArrowRight size={16} />
                      </button>
                    </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-8 space-y-8">
        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center p-1 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              进行中
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'archived' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              已归档
            </button>
          </div>
          <div className="text-sm text-gray-400">共 {projects.length} 个项目</div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              onClick={onSelectProject}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer flex gap-4 group"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <project.icon size={32} />
              </div>
              <div className="flex flex-col justify-between min-w-0">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800 truncate">{project.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{project.desc}</p>
                </div>
                <div className="text-[10px] text-gray-400 mt-2">
                  更新时间：{project.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};


// Dashboard View Component (Project Detail)
const DashboardView = ({ onBack, onEdit, onAudit, onDownload, onOpenModal, onStartIntelligence, onStartBackgroundAI, onOpenTemplates, intelligenceResult, setIntelligenceResult, isBackgroundAnalyzing, hasBackgroundResult, onViewBackgroundResult, initialSection, onSectionHandled, questionCollections, setQuestionCollections }: {
  onBack: () => void,
  onEdit: () => void,
  onAudit: () => void,
  onDownload: () => void,
  onOpenModal: () => void,
  onStartIntelligence: (step?: "input" | "confirm" | "loading") => void,
  onStartBackgroundAI?: () => void,
  onOpenTemplates: () => void,
  intelligenceResult?: any,
  setIntelligenceResult: (res: any) => void,
  isBackgroundAnalyzing?: boolean,
  hasBackgroundResult?: boolean,
  onViewBackgroundResult?: () => void,
  initialSection?: "questions" | null,
  onSectionHandled?: () => void,
  questionCollections: QuestionCollection[],
  setQuestionCollections: React.Dispatch<React.SetStateAction<QuestionCollection[]>>
}) => {
  const projectName = intelligenceResult?.companyName || "A公司";
  const dashboardProjectName = intelligenceResult?.projectName?.trim() || "未命名尽调项目";
  const dashboardCompanyName = intelligenceResult?.companyName?.trim() || "未填写企业名称";
  const questionsSectionRef = useRef<HTMLElement>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  useEffect(() => {
    if (intelligenceResult?.isSkip) {
      setQuestions([]);
    } else if (intelligenceResult?.questions) {
      setQuestions(prev => {
        const existing = new Set(prev.map(q => q.question));
        const newQs = intelligenceResult.questions.filter((q: any) => !existing.has(q.question));
        return [...newQs, ...prev];
      });
    } else {
      // Default mock questions if not skipped and no results yet
      setQuestions([
        { category: "财务状况", question: "公司2024年营收增长放缓，主要受哪些市场因素影响？", source: "财务报表分析", type: "material" },
        { category: "经营风险", question: "核心技术团队的稳定性如何？是否存在竞业禁止协议？", source: "企业介绍分析", type: "material" },
        { category: "市场竞争", question: "面对行业新进入者的价格战，公司的应对策略是什么？", source: "市场地位分析", type: "material" }
      ]);
    }
  }, [intelligenceResult]);

  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crawlingLog, setCrawlingLog] = useState<string[]>([]);
  const [discoveredData, setDiscoveredData] = useState<any[]>([]);
  const [privacyShieldEnabled, setPrivacyShieldEnabled] = useState(true);

  const handleStartInternalAnalysis = () => {
    setIsAnalyzing(true);
    setCrawlingLog([]);
    setDiscoveredData([]);

    const logs = [
      "正在连接企查查 API...",
      "正在抓取企业基本信息及产品介绍...",
      "正在查询法院执行网失信被执行人记录...",
      "正在同步国家税务总局欠税及处罚信息...",
      "正在分析股东结构及历史股权变更...",
      "正在识别权益性投资 (投资机构)...",
      "正在抓取股权质押及动产抵押登记...",
      "正在根据上传资料生成补充访谈问题...",
      "分析完成！"
    ];

    const discoveries = [
      { label: "企业概况", value: "已抓取", icon: Info },
      { label: "产品信息", value: "3项核心产品", icon: Package },
      { label: "股东结构", value: "3名主要股东", icon: Users },
      { label: "法律诉讼", value: "2条风险记录", icon: Gavel },
      { label: "股权质押", value: "1条质押记录", icon: GitBranch },
      { label: "税务处罚", value: "1条欠税记录", icon: AlertTriangle },
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setCrawlingLog(prev => [...prev, log]);
        if (index > 0 && index <= discoveries.length) {
          setDiscoveredData(prev => [...prev, discoveries[index - 1]]);
        }
      }, index * 600);
    });

    setTimeout(() => {
      const result = {
        companyName: projectName,
        isSkip: false,
        companyData: {
          overview: { industry: "工业自动化", scale: "中型企业", location: "上海市张江高科技园区" },
          financialAnomalies: [
            { type: "营收增长放缓", detail: "2024年营收增长率仅为5%，低于行业平均水平(12%)", severity: "medium" },
            { type: "应收账款周转率下降", detail: "应收账款周转天数从90天延长至125天", severity: "high" }
          ],
          litigation: { count: 2, details: "涉及2起买卖合同纠纷，涉案金额约150万元" },
          pledges: { count: 1, detail: "大股东股权质押比例为35%" }
        },
        aiQuestions: [
          { category: "财务状况", question: "应收账款周转天数大幅延长的主要原因是什么？是否有坏账风险？", source: "AI 深度挖掘", type: "material" },
          { category: "经营风险", question: "核心技术团队的稳定性如何？是否存在竞业禁止协议？", source: "AI 深度挖掘", type: "material" },
          { category: "合规性", question: "公司近三年的税务合规证明是否完整？是否存在未决税务争议？", source: "AI 深度挖掘", type: "material" },
          { category: "供应链", question: "前五大供应商的依赖度较高，是否有备选方案 or 长期协议保障？", source: "AI 深度挖掘", type: "material" },
          { category: "人力资源", question: "核心技术人员的股权激励计划执行情况如何？", source: "AI 深度挖掘", type: "material" },
          { category: "市场竞争", question: "面对行业新进入者的价格战，公司的应对策略是什么？", source: "AI 深度挖掘", type: "material" },
          { category: "财务状况", question: "2024年营收增长放缓，主要受哪些市场因素影响？", source: "AI 深度挖掘", type: "material" },
          { category: "经营风险", question: "公司核心竞争优势是什么？主要的技术壁垒体现在哪些方面？", source: "AI 深度挖掘", type: "material" },
          { category: "合规性", question: "关于2023年印花税未按期申报及欠税记录，目前是否已补缴完毕？", source: "AI 深度挖掘", type: "material" },
          { category: "供应链", question: "公司将核心生产线设备进行动产抵押，是否会影响日常生产经营的稳定性？", source: "AI 深度挖掘", type: "material" }
        ],
        questions: intelligenceResult?.questions || [],
        guidelines: [
          { tag: "高新企业", preference: "优先支持" },
          { tag: "环保违规", preference: "重点关注" },
          { tag: "应收账款异常", preference: "审慎介入" }
        ]
      };
      setIntelligenceResult(result);
      setPendingQuestions(result.aiQuestions.map((q: any) => ({ ...q, selected: true })));
      setIsAnalyzing(false);
      setShowIntelligenceModal(true);
    }, 6500);
  };

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newQuestionInput, setNewQuestionInput] = useState("");
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [textMaterial, setTextMaterial] = useState("");
  const [hasDocumentMaterials, setHasDocumentMaterials] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<{ category: string, question: string, source: string, type: string, selected: boolean }[]>([]);
  const [questionListMode, setQuestionListMode] = useState<"default" | "ai">("default");
  const [currentPresetTemplate, setCurrentPresetTemplate] = useState<string>(intelligenceResult?.template || "bank");
  const [showPresetTemplatePanel, setShowPresetTemplatePanel] = useState(false);
  const [isGeneratingAIInsights, setIsGeneratingAIInsights] = useState(false);
  const [aiInsightLogs, setAIInsightLogs] = useState<string[]>([]);
  const [showAIInsightToast, setShowAIInsightToast] = useState(false);
  const [showHeaderEditModal, setShowHeaderEditModal] = useState(false);
  const [headerProjectNameInput, setHeaderProjectNameInput] = useState("");
  const [headerCompanyNameInput, setHeaderCompanyNameInput] = useState("");
  const aiInsightTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      aiInsightTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (intelligenceResult?.template) {
      setCurrentPresetTemplate(intelligenceResult.template);
    }
  }, [intelligenceResult?.template]);

  useEffect(() => {
    setHeaderProjectNameInput(intelligenceResult?.projectName?.trim() || "");
    setHeaderCompanyNameInput(intelligenceResult?.companyName?.trim() || "");
  }, [intelligenceResult?.projectName, intelligenceResult?.companyName]);

  useEffect(() => {
    if (initialSection !== "questions") return;

    const timer = window.setTimeout(() => {
      questionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      onSectionHandled?.();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [initialSection, onSectionHandled]);

  const hasCompanyName = Boolean((intelligenceResult?.companyName || "").trim());
  const hasTextMaterial = Boolean(textMaterial.trim());
  const canUseAIInsights = hasCompanyName || hasDocumentMaterials || hasTextMaterial;
  const aiInsightRequirementText = `存在企业名称、文档资料或文本资料中的任意一项后，即可使用 AI 洞察。`;

  const ensurePendingQuestions = () => {
    if (pendingQuestions.length === 0 && intelligenceResult?.aiQuestions?.length) {
      setPendingQuestions(intelligenceResult.aiQuestions.map((q: any) => ({ ...q, selected: true })));
    }
  };

  const buildAIInsightQuestions = () => {
    if (intelligenceResult?.aiQuestions?.length) {
      return intelligenceResult.aiQuestions;
    }

    const company = intelligenceResult?.companyName || projectName;
    return [
      { category: "财务状况", question: `结合 ${company} 当前回款周期，是否存在应收账款持续拉长或坏账准备不足的情况？`, source: "AI 洞察", type: "material" },
      { category: "合规性", question: `围绕 ${company} 最近三年的税务申报与工商变更，是否存在尚未解释清楚的合规风险点？`, source: "AI 洞察", type: "material" },
      { category: "经营风险", question: `${company} 的核心客户与核心供应商集中度是否过高，对经营稳定性会产生什么影响？`, source: "AI 洞察", type: "material" },
      { category: "市场竞争", question: `${company} 在当前行业价格竞争下，毛利率和订单质量是否还能维持稳定？`, source: "AI 洞察", type: "material" },
      { category: "财务状况", question: `${company} 近两期经营性现金流与利润表现是否存在背离，主要原因是什么？`, source: "AI 洞察", type: "material" },
      { category: "合规性", question: `${company} 近期是否存在行政处罚、欠税、环保或劳动合规方面的潜在争议？`, source: "AI 洞察", type: "material" },
      { category: "经营风险", question: `${company} 目前最依赖的客户或项目是什么，一旦波动会对经营产生多大影响？`, source: "AI 洞察", type: "material" },
      { category: "供应链", question: `${company} 的关键供应商替代难度如何，是否存在单点依赖或议价能力偏弱问题？`, source: "AI 洞察", type: "material" },
      { category: "人力资源", question: `${company} 核心管理层与关键技术人员是否稳定，是否存在离职或激励失效风险？`, source: "AI 洞察", type: "material" },
      { category: "市场竞争", question: `${company} 所在细分市场的竞争格局是否变化，是否出现明显的价格战或客户流失迹象？`, source: "AI 洞察", type: "material" },
      { category: "资产情况", question: `${company} 的主要抵押、质押或受限资产是否会影响后续融资和经营安排？`, source: "AI 洞察", type: "material" },
      { category: "治理结构", question: `${company} 股东结构、实际控制人安排或历史股权变动中，是否存在需要重点解释的事项？`, source: "AI 洞察", type: "material" },
      { category: "回款管理", question: `${company} 主要客户的回款周期、信用政策和逾期情况是否出现阶段性恶化？`, source: "AI 洞察", type: "material" },
      { category: "订单质量", question: `${company} 当前在手订单的毛利率、履约难度和验收节奏是否存在明显分化？`, source: "AI 洞察", type: "material" },
    ];
  };

  const startAIInsightGeneration = ({ preserveCurrentView = false }: { preserveCurrentView?: boolean } = {}) => {
    aiInsightTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    aiInsightTimersRef.current = [];
    setAIInsightLogs([]);
    setIsGeneratingAIInsights(true);
    setPendingQuestions([]);

    if (!preserveCurrentView) {
      setQuestionListMode("ai");
    }

    const logs = [
      "正在整理企业抓取结果与已有资料...",
      "正在识别高风险追问点与管理层答复缺口...",
      "正在生成分主题访谈问题，并进行重复问题合并...",
      "正在输出可直接导入的问题清单...",
    ];

    logs.forEach((log, index) => {
      const timer = window.setTimeout(() => {
        setAIInsightLogs((prev) => [...prev, log]);
      }, index * 700);
      aiInsightTimersRef.current.push(timer);
    });

    const finishTimer = window.setTimeout(() => {
      const generatedQuestions = buildAIInsightQuestions();
      setPendingQuestions(generatedQuestions.map((q: any) => ({ ...q, selected: true })));
      setIntelligenceResult((prev: any) => (
        prev
          ? { ...prev, aiQuestions: generatedQuestions }
          : { companyName: projectName, aiQuestions: generatedQuestions }
      ));
      setIsGeneratingAIInsights(false);
      setShowAIInsightToast(true);
    }, logs.length * 700 + 500);

    aiInsightTimersRef.current.push(finishTimer);
  };

  const handleConfirmAIQuestions = () => {
    const selectedQs = pendingQuestions.filter(q => q.selected).map(({ selected, ...rest }) => rest);
    setQuestions(prev => {
      const existing = new Set(prev.map(q => q.question));
      const merged = selectedQs.filter(q => !existing.has(q.question));
      return [...merged, ...prev];
    });
    setQuestionListMode("default");
  };

  const togglePendingQuestion = (index: number) => {
    setPendingQuestions(prev => prev.map((q, i) => i === index ? { ...q, selected: !q.selected } : q));
  };

  const handleOpenAIQuestionList = () => {
    if (!canUseAIInsights) {
      return;
    }

    if (isGeneratingAIInsights) {
      return;
    }

    if (questionListMode === "ai") {
      setQuestionListMode("default");
      return;
    }

    if (pendingQuestions.length > 0 || intelligenceResult?.aiQuestions?.length) {
      ensurePendingQuestions();
      setQuestionListMode("ai");
      return;
    }

    startAIInsightGeneration({ preserveCurrentView: true });
  };

  const handleRegenerateAIInsights = () => {
    if (!canUseAIInsights) {
      return;
    }

    startAIInsightGeneration({ preserveCurrentView: questionListMode === "default" });
  };

  const handleToggleQuestionList = () => {
    if (questionListMode === "default" && !intelligenceResult?.aiQuestions?.length && pendingQuestions.length === 0) {
      startAIInsightGeneration({ preserveCurrentView: true });
      return;
    }

    ensurePendingQuestions();
    setQuestionListMode(prev => prev === "default" ? "ai" : "default");
  };

  const handleSelectPresetTemplate = (templateId: string) => {
    if (templateId !== currentPresetTemplate) {
      const nextTemplateLabel = questionCollections.find((item) => item.id === templateId)?.title || "新的问题清单";
      const confirmed = window.confirm(`确认切换到“${nextTemplateLabel}”吗？`);
      if (!confirmed) return;
    }

    setQuestionListMode("default");
    setCurrentPresetTemplate(templateId);
    setShowPresetTemplatePanel(false);
  };

  const handleOpenQuestionListSwitch = () => {
    setShowPresetTemplatePanel(true);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveHeaderInfo = () => {
    setIntelligenceResult((prev: any) => ({
      ...(prev || {}),
      projectName: headerProjectNameInput.trim() || "未命名尽调项目",
      companyName: headerCompanyNameInput.trim(),
    }));
    setShowHeaderEditModal(false);
  };

  const startEditing = (index: number, text: string) => {
    setEditingIndex(index);
    setEditValue(text);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    setQuestions(prev => prev.map((q, i) => i === editingIndex ? { ...q, question: editValue } : q));
    setEditingIndex(null);
  };

  const handleAddManualQuestion = () => {
    if (!newQuestionInput.trim()) return;
    const newQ = {
      category: "手动补充",
      question: newQuestionInput,
      source: "用户手动添加",
      type: "manual"
    };
    setQuestions(prev => [...prev, newQ]);
    setNewQuestionInput("");
  };

  const insightReasonMap: Record<string, string> = {
    "财务状况": "结合财务指标波动与回款质量生成",
    "经营风险": "结合经营稳定性与人员结构生成",
    "合规性": "结合工商、税务与司法线索生成",
    "供应链": "结合上下游依赖与履约稳定性生成",
    "人力资源": "结合核心团队稳定性生成",
    "市场竞争": "结合行业竞争格局与订单质量生成",
    "资产情况": "结合抵押质押与资产受限信息生成",
    "治理结构": "结合股东结构与历史变更线索生成",
    "回款管理": "结合客户信用政策与回款表现生成",
    "订单质量": "结合订单结构与履约节奏生成",
  };
  const currentCollection = questionCollections.find((item) => item.id === currentPresetTemplate);
  const presetQuestions = currentCollection?.questions || [];
  const activeQuestions = questions.filter((q) => !(q.type === "preset" || q.source.includes("模板预设") || q.source.includes("系统预制")));
  const currentPresetTemplateLabel = currentCollection?.title || "问题清单";
  const selectedAIQuestionCount = pendingQuestions.filter((q) => q.selected).length;
  const rawCompanyData = intelligenceResult?.companyData?.result || intelligenceResult?.companyData || {};
  const companyOverview = intelligenceResult?.companyData?.overview;
  const financialAnomalies = intelligenceResult?.companyData?.financialAnomalies || [];
  const formatCompanyDate = (value?: number | null) => {
    if (!value) return "暂无";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "暂无";
    return date.toLocaleDateString("zh-CN");
  };
  const companyOverviewItems = [
    { label: "企业名称", value: rawCompanyData.name || intelligenceResult?.companyName || "暂无" },
    { label: "企业状态", value: rawCompanyData.regStatus || "暂无" },
    { label: "法定代表人", value: rawCompanyData.legalPersonName || "暂无" },
    { label: "统一社会信用代码", value: rawCompanyData.creditCode || "暂无" },
    { label: "注册资本", value: rawCompanyData.regCapital || rawCompanyData.actualCapital || "暂无" },
    { label: "成立日期", value: rawCompanyData.estiblishTime ? formatCompanyDate(rawCompanyData.estiblishTime) : "暂无" },
    { label: "所属行业", value: rawCompanyData.industry || rawCompanyData.industryAll?.categoryBig || companyOverview?.industry || "暂无" },
    { label: "人员规模", value: rawCompanyData.staffNumRange || rawCompanyData.socialStaffNum || companyOverview?.employees || companyOverview?.scale || "暂无" },
    { label: "注册地址", value: rawCompanyData.regLocation || companyOverview?.location || "暂无" },
  ];
  const companyDetailItems = [
    { label: "公司类型", value: rawCompanyData.companyOrgType || "暂无" },
    { label: "股票简称", value: rawCompanyData.bondName || rawCompanyData.alias || "暂无" },
    { label: "股票代码", value: rawCompanyData.bondNum || "暂无" },
    { label: "登记机关", value: rawCompanyData.regInstitute || "暂无" },
    { label: "注册号", value: rawCompanyData.regNumber || "暂无" },
    { label: "组织机构代码", value: rawCompanyData.orgNumber || "暂无" },
    { label: "核准日期", value: rawCompanyData.approvedTime ? formatCompanyDate(rawCompanyData.approvedTime) : "暂无" },
    { label: "曾用名", value: rawCompanyData.historyNames || rawCompanyData.historyNameList?.join("；") || "暂无" },
  ];
  const riskHighlights = [
    intelligenceResult?.companyData?.litigation?.count
      ? { label: "法律诉讼", value: `${intelligenceResult.companyData.litigation.count} 条`, tone: "text-red-600" }
      : null,
    intelligenceResult?.companyData?.pledges?.count
      ? { label: "股权质押", value: `${intelligenceResult.companyData.pledges.count} 笔`, tone: "text-orange-600" }
      : null,
    intelligenceResult?.companyData?.taxPenalty?.count
      ? { label: "税务处罚", value: `${intelligenceResult.companyData.taxPenalty.count} 条`, tone: "text-amber-600" }
      : null,
  ].filter(Boolean) as { label: string; value: string; tone: string }[];
  const detailSummaryItems = [
    ...companyDetailItems,
    ...riskHighlights.map((item) => ({ label: item.label, value: item.value, tone: item.tone })),
    ...(financialAnomalies.length > 0
      ? financialAnomalies.map((item: any, idx: number) => ({
          label: `财务异常 ${idx + 1}`,
          value: item.detail ? `${item.title || item.type || "财务异常"}：${item.detail}` : item.title || item.type || "财务异常",
          tone: "text-orange-600",
        }))
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-8 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="cursor-pointer hover:text-blue-600" onClick={onBack}>尽调管理</span>
              <ChevronRight size={14} />
              <span className="text-gray-800 font-medium">{dashboardProjectName}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-400">企业名称：</span>
                <span className="font-medium text-gray-800">{dashboardCompanyName}</span>
              </div>
              <button
                onClick={() => setShowHeaderEditModal(true)}
                title="修改项目名称和企业名称"
                aria-label="修改项目名称和企业名称"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <Edit3 size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <button
              onClick={onOpenTemplates}
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              更换模板
            </button>
            <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700">
              重新生成
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Edit3 size={16} />
              <span>报告工作台</span>
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              <Download size={16} />
              <span>下载 DOCX</span>
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100">
              <ClipboardCheck size={16} />
              <span>归档报告</span>
            </button>
            {false && (
              <button className="rounded-xl border border-gray-200 p-2 text-gray-400 transition-colors hover:bg-gray-50">
                <History size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* AI 智能分析模块恢复展示 */}
        {true && (
          <>
            <section className="grid grid-cols-1 gap-6">
              <div className={`transition-all relative overflow-hidden ${(intelligenceResult && !intelligenceResult.isSkip && !intelligenceResult.isPending)
                ? 'p-6 rounded-2xl shadow-sm border bg-white border-blue-100'
                : (isBackgroundAnalyzing || (intelligenceResult && intelligenceResult.isPending))
                  ? 'rounded-2xl border-2 border-blue-400 border-opacity-50 shadow-md shadow-blue-100/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
                  : 'p-6 rounded-2xl shadow-sm border bg-white border-dashed border-blue-200'
                }`}>
                {isBackgroundAnalyzing || (intelligenceResult && intelligenceResult.isPending) ? (
                  <div className="p-6 relative">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 z-0"
                    />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white shadow-sm rounded-[1rem] flex items-center justify-center text-blue-600 relative shrink-0">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[3px] border-blue-100 border-t-blue-600 rounded-[1rem]"
                          />
                          <BrainCircuit size={28} className="animate-pulse drop-shadow-sm" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-1">
                            企业数据抓取中
                          </h2>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-blue-900/60 text-sm font-medium">正在调取全网检索接口，执行深度隐患筛查，此过程不影响您当前的操作</p>
                            <span className="flex gap-1 ml-1">
                              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (intelligenceResult && !intelligenceResult.isSkip) ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <BrainCircuit size={24} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-800">企业数据抓取已完成</h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (intelligenceResult?.aiQuestions && pendingQuestions.length === 0) {
                            setPendingQuestions(intelligenceResult.aiQuestions.map((q: any) => ({ ...q, selected: true })));
                          }
                          setShowIntelligenceModal(true);
                        }}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                      >
                        <Layout size={16} />
                        <span>查看抓取结果</span>
                      </button>
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-100"
                        title="重新分析"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <BrainCircuit size={24} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-800">企业数据抓取</h2>
                        <p className="text-gray-400 text-xs mt-0.5">全网数据深度抓取，精准识别访谈重点</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2"
                    >
                      <Zap size={16} />
                      开始抓取
                    </button>
                  </div>
                )}
              </div>
            </section>

            {showIntelligenceModal && intelligenceResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-5xl h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <BrainCircuit size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">企业数据抓取结果</h2>
                    <p className="text-sm text-blue-600 font-medium">深度扫描结果 · {intelligenceResult.companyData?.overview?.industry}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntelligenceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-600" />
                        企业概况
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {companyOverviewItems.map((item) => (
                        <div key={item.label} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-xs font-medium text-gray-400">{item.label}</p>
                          <p className="mt-2 text-sm font-bold leading-6 text-gray-800 break-all">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {detailSummaryItems.length > 0 && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={18} className="text-blue-600" />
                        <h3 className="text-base font-bold text-gray-800">抓取结果明细</h3>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {detailSummaryItems.map((item) => (
                          <div key={`${item.label}-${item.value}`} className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-4">
                            <p className="text-xs font-medium text-gray-400">{item.label}</p>
                            <p className={`mt-2 text-sm font-semibold leading-6 break-all ${"tone" in item && item.tone ? item.tone : "text-gray-800"}`}>
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                <button
                  onClick={() => setShowIntelligenceModal(false)}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
            )}
          </>
        )}

        {/* Materials Sections */}
        <div className="space-y-8">
          <DocumentClassificationSection
            sectionNumber={1}
            title="文档资料"
            onFilesStateChange={setHasDocumentMaterials}
          />
          
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                2. 文本资料
              </h2>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <textarea
                value={textMaterial}
                onChange={(event) => setTextMaterial(event.target.value)}
                placeholder="请输入需要补充的文本资料内容..."
                className="min-h-[220px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-7 text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>
          </section>

          {/* 3. 访谈记录 */}
          <section className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                3. 访谈记录
              </h2>
            </div>
            <div className="space-y-3">
              <InterviewItem
                title="与财务总监关于2024年营收波动的访谈"
                date="2025-03-03 14:30"
                duration="45:20"
                onClick={onOpenModal}
              />
              <InterviewItem
                title="与生产主管关于产能利用率的现场交流"
                date="2025-03-03 16:15"
                duration="28:10"
                onClick={onOpenModal}
              />
            </div>
          </section>

          {/* 4. 访谈问题清单 */}
          <section ref={questionsSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                4. 访谈问题清单
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAIQuestionList}
                  disabled={!canUseAIInsights}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${!canUseAIInsights ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400" : questionListMode === "ai" ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700" : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                  title={!canUseAIInsights ? aiInsightRequirementText : undefined}
                >
                  <Sparkles size={14} />
                  <span>{questionListMode === "ai" ? "退出AI洞察" : "AI洞察"}</span>
                </button>
                {(isGeneratingAIInsights || pendingQuestions.length > 0 || intelligenceResult?.aiQuestions?.length) && (
                  <button
                    onClick={handleRegenerateAIInsights}
                    className="rounded-lg border border-blue-200 bg-white p-2 text-blue-600 transition-all hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="重新AI洞察"
                    disabled={isGeneratingAIInsights || !canUseAIInsights}
                  >
                    <RefreshCw size={14} className={isGeneratingAIInsights ? "animate-spin" : ""} />
                  </button>
                )}
                <button
                  onClick={handleOpenQuestionListSwitch}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
                >
                  <span>切换问题清单</span>
                </button>
                {questionListMode === "default" && (
                  <button
                    onClick={() => setShowManualAdd(!showManualAdd)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${showManualAdd ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <Plus size={14} />
                    <span>手动添加</span>
                  </button>
                )}
              </div>
            </div>

            {!canUseAIInsights && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
                {aiInsightRequirementText}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {questionListMode === "ai" ? "AI洞察问题清单" : "当前问题清单"}
                </span>
                {questionListMode === "ai" ? (
                  <div className="flex items-center gap-2">
                    {pendingQuestions.length > 0 && (
                      <button
                        onClick={() => {
                          const allSelected = pendingQuestions.every(q => q.selected);
                          setPendingQuestions(pendingQuestions.map(q => ({ ...q, selected: !allSelected })));
                        }}
                        className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:bg-blue-100"
                      >
                        {pendingQuestions.every(q => q.selected) ? '取消全选' : '全选'}
                      </button>
                    )}
                    <button
                      onClick={handleConfirmAIQuestions}
                      disabled={pendingQuestions.filter(q => q.selected).length === 0}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      导入到当前清单
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium">当前预制：{currentPresetTemplateLabel}</span>
                )}
              </div>

              {questionListMode === "default" && (
                <>
                  <AnimatePresence>
                    {showManualAdd && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-gray-100"
                      >
                        <div className="p-4 bg-blue-50/30">
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              type="text"
                              value={newQuestionInput}
                              onChange={(e) => setNewQuestionInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddManualQuestion()}
                              placeholder="输入访谈问题..."
                              className="flex-1 py-2 px-4 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                            />
                            <button
                              onClick={handleAddManualQuestion}
                              disabled={!newQuestionInput.trim()}
                              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-200"
                            >
                              添加
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="max-h-[600px] overflow-y-auto">
                    {isGeneratingAIInsights && (
                      <div className="m-5 mb-0 rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="relative mt-1 h-14 w-14 shrink-0 rounded-[1.25rem] bg-white text-blue-600 shadow-sm">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 rounded-[1.25rem] border-2 border-blue-100 border-t-blue-500 border-r-indigo-400"
                            />
                            <motion.div
                              animate={{ scale: [0.92, 1.06, 0.92], opacity: [0.35, 0.8, 0.35] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute inset-1 rounded-[1rem] bg-gradient-to-br from-blue-100/70 to-indigo-100/30"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles size={22} />
                            </div>
                            <motion.span
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                              className="absolute -right-1 top-1 h-2.5 w-2.5 rounded-full bg-blue-500"
                            />
                            <motion.span
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                              className="absolute bottom-1 -left-1 h-2 w-2 rounded-full bg-indigo-400"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h3 className="text-base font-bold text-slate-900">AI洞察生成中</h3>
                                <p className="mt-1 text-sm text-slate-500">正在后台生成补充问题，你可以继续编辑当前问题清单。</p>
                              </div>
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                {Math.min(aiInsightLogs.length + 1, 4)}/4
                              </span>
                            </div>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                              <motion.div
                                initial={{ width: "12%" }}
                                animate={{ width: `${Math.min(((aiInsightLogs.length + 1) / 4) * 100, 100)}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              />
                            </div>
                            <div className="mt-4 space-y-2">
                              {aiInsightLogs.map((log, index) => (
                                <motion.div
                                  key={`${log}-${index}`}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex items-center gap-2 text-sm text-slate-600"
                                >
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                  <span>{log}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {(Object.entries([...presetQuestions, ...activeQuestions].reduce((acc, q) => {
                      if (!acc[q.category]) acc[q.category] = [];
                      acc[q.category].push(q);
                      return acc;
                    }, {} as Record<string, InterviewQuestion[]>)) as [string, InterviewQuestion[]][]).map(([category, catQuestions]) => (
                      <div key={category} className="border-b border-gray-50 last:border-0">
                        <div className="bg-gray-50/50 px-6 py-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{catQuestions.length} 个问题</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {catQuestions.map((q, i) => {
                            const globalIndex = questions.indexOf(q);
                            const isPresetQuestion = globalIndex === -1;

                            return (
                              <motion.div
                                key={`${category}-${i}-${q.question}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-6 hover:bg-blue-50/30 transition-colors group relative"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${q.source.includes('AI') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {q.source}
                                      </span>
                                      {q.type === 'material' && (
                                        <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-medium">
                                          <Database size={10} />
                                          关联资料
                                        </span>
                                      )}
                                    </div>
                                    {editingIndex === globalIndex ? (
                                      <div className="flex items-center gap-2 mt-1">
                                        <textarea
                                          autoFocus
                                          rows={2}
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && saveEdit()}
                                          className="flex-1 py-2 px-3 border border-blue-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                                        />
                                        <div className="flex flex-col gap-1">
                                          <button onClick={saveEdit} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"><Check size={14} /></button>
                                          <button onClick={() => setEditingIndex(null)} className="p-2 text-gray-400 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm"><X size={14} /></button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-800 font-medium leading-relaxed">{q.question}</p>
                                    )}
                                  </div>
                                  {!isPresetQuestion && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-6">
                                      <button
                                        onClick={() => startEditing(globalIndex, q.question)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-100 transition-all"
                                        title="编辑问题"
                                      >
                                        <Edit3 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuestion(globalIndex)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-100 transition-all"
                                        title="删除问题"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {questionListMode === "ai" && (
                <div className="max-h-[600px] overflow-y-auto p-5">
                  <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-blue-900">AI洞察问题清单</p>
                        <p className="mt-1 text-sm text-blue-800">
                          这里展示 AI 洞察生成的补充访谈问题，勾选后可一键导入到当前访谈问题清单。
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700">
                          共 {pendingQuestions.length} 个问题
                        </span>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          已选 {selectedAIQuestionCount} 个
                        </span>
                      </div>
                    </div>
                  </div>
                  {isGeneratingAIInsights && (
                    <div className="mb-5 rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="relative mt-1 h-14 w-14 shrink-0 rounded-[1.25rem] bg-white text-blue-600 shadow-sm">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-[1.25rem] border-2 border-blue-100 border-t-blue-500 border-r-indigo-400"
                          />
                          <motion.div
                            animate={{ scale: [0.92, 1.06, 0.92], opacity: [0.35, 0.8, 0.35] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-1 rounded-[1rem] bg-gradient-to-br from-blue-100/70 to-indigo-100/30"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles size={22} />
                          </div>
                          <motion.span
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                            className="absolute -right-1 top-1 h-2.5 w-2.5 rounded-full bg-blue-500"
                          />
                          <motion.span
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                            className="absolute bottom-1 -left-1 h-2 w-2 rounded-full bg-indigo-400"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-base font-bold text-slate-900">AI洞察生成中</h3>
                              <p className="mt-1 text-sm text-slate-500">正在把抓取结果转成可直接访谈的问题清单</p>
                            </div>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                              {Math.min(aiInsightLogs.length + 1, 4)}/4
                            </span>
                          </div>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                            <motion.div
                              initial={{ width: "12%" }}
                              animate={{ width: `${Math.min(((aiInsightLogs.length + 1) / 4) * 100, 100)}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            />
                          </div>
                          <div className="mt-4 space-y-2">
                            {aiInsightLogs.map((log, index) => (
                              <motion.div
                                key={`${log}-${index}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-sm text-slate-600"
                              >
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span>{log}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4">
                    {pendingQuestions.length > 0 ? (
                      pendingQuestions.map((q, idx) => (
                        <motion.div
                          key={`${q.question}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => togglePendingQuestion(idx)}
                          className={`p-5 border rounded-2xl flex items-start gap-4 transition-all cursor-pointer group relative overflow-hidden ${q.selected
                            ? 'bg-blue-50/50 border-blue-300 shadow-sm ring-1 ring-blue-300'
                            : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                            }`}
                        >
                          <div className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition-all ${q.selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {q.selected ? <Check size={20} /> : idx + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${q.selected ? 'bg-blue-200 text-blue-800' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                  AI洞察
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${q.selected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                  {q.category}
                                </span>
                              </div>
                              <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${q.selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {q.selected ? '已选中' : '点击选中'}
                              </div>
                            </div>
                            <p className={`text-base font-semibold leading-7 transition-colors ${q.selected ? 'text-blue-950' : 'text-gray-800'
                              }`}>
                              {q.question}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded-full bg-purple-100 px-2.5 py-1 font-bold text-purple-700">
                                {q.source}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                                {insightReasonMap[q.category] || "结合现有外部线索自动生成"}
                              </span>
                            </div>
                          </div>
                          <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${q.selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white text-transparent'
                            }`}>
                            <Check size={14} />
                          </div>
                        </motion.div>
                      ))
                    ) : isGeneratingAIInsights ? null : (
                      <div className="rounded-[1.75rem] border-2 border-dashed border-gray-100 p-12 text-center text-gray-400">
                        <Sparkles size={40} className="mx-auto opacity-20" />
                        <p className="mt-3 text-sm font-medium">暂未生成 AI 洞察问题</p>
                        <button
                          onClick={startAIInsightGeneration}
                          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700"
                        >
                          立即生成
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  {questionListMode === "ai"
                    ? `共 ${pendingQuestions.length} 个 AI 洞察问题`
                    : `共 ${questions.length} 个访谈问题`}
                </button>
              </div>
            </div>
          </section>
        </div>
        {/* AI 智能分析确认弹窗恢复展示 */}
        {true && (
          <AnimatePresence>
            {showConfirmModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfirmModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-12 space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mx-auto">
                    <Clock size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">确认开始企业数据抓取？</h2>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-blue-600"><Zap size={16} /></div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        系统将启动全网数据抓取引擎
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-amber-600"><AlertCircle size={16} /></div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        由于涉及大量实时数据处理，<span className="text-amber-600 font-bold">整个过程预计需要 1-2 分钟</span>，请保持页面开启。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      if (onStartBackgroundAI) {
                        onStartBackgroundAI();
                      } else {
                        handleStartInternalAnalysis();
                      }
                    }}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
                  >
                    立即开始分析 <Zap size={20} />
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm"
                  >
                    取消
                  </button>
                </div>
              </motion.div>
            </div>
            )}
          </AnimatePresence>
        )}

        <AnimatePresence>
          {showPresetTemplatePanel && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPresetTemplatePanel(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                className="relative w-full max-w-lg rounded-[1.75rem] bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">选择问题清单</h3>
                  <button
                    onClick={() => setShowPresetTemplatePanel(false)}
                    className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {questionCollections.map((template) => {
                    const templateQuestions = template.questions || [];
                    const isActive = currentPresetTemplate === template.id;

                    return (
                      <button
                        key={template.id}
                        onClick={() => handleSelectPresetTemplate(template.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${isActive ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"}`}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">{template.title}</div>
                          <div className="mt-1 text-xs text-slate-500">{templateQuestions.length} 个预制问题</div>
                        </div>
                        {isActive ? (
                          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">
                            当前
                          </span>
                        ) : (
                          <ChevronRight size={16} className="text-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAIInsightToast && !isGeneratingAIInsights && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className="fixed bottom-8 right-8 z-[120] w-[360px] rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_16px_48px_-12px_rgba(37,99,235,0.25)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <Sparkles size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">AI洞察已生成完成</h4>
                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        已生成 {pendingQuestions.length} 个补充问题，可直接导入访谈问题清单。
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAIInsightToast(false)}
                      className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setQuestionListMode("ai");
                        setShowAIInsightToast(false);
                      }}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      查看 AI洞察
                    </button>
                    <button
                      onClick={() => setShowAIInsightToast(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      稍后处理
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Internal Analysis Loading Modal */}
        <AnimatePresence>
          {isAnalyzing && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950">
              <div className="flex flex-col items-center gap-12 max-w-4xl w-full text-center relative">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 border-4 border-blue-500/10 border-t-blue-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                    <BrainCircuit size={64} className="animate-pulse" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <div className="space-y-4 text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">Crawling Engine Log</h3>
                    <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 font-mono text-xs h-80 overflow-y-auto space-y-3 backdrop-blur-xl">
                      {crawlingLog.map((log, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 text-blue-400/80"
                        >
                          <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                          <span className={i === crawlingLog.length - 1 ? "text-blue-400 font-bold" : ""}>{log}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">Real-time Discoveries</h3>
                    <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 h-80 overflow-y-auto backdrop-blur-xl">
                      <div className="grid grid-cols-2 gap-3">
                        {discoveredData.map((data, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2"
                          >
                            <div className="text-blue-400"><data.icon size={16} /></div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">{data.label}</div>
                            <div className="text-xs text-white font-bold">{data.value}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showHeaderEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">修改表头信息</h3>
                  <p className="mt-1 text-sm text-slate-500">可在这里调整尽调项目名称和企业名称。</p>
                </div>
                <button
                  onClick={() => setShowHeaderEditModal(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">项目名称</span>
                  <input
                    value={headerProjectNameInput}
                    onChange={(event) => setHeaderProjectNameInput(event.target.value)}
                    placeholder="请输入尽调项目名称"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">企业名称</span>
                  <input
                    value={headerCompanyNameInput}
                    onChange={(event) => setHeaderCompanyNameInput(event.target.value)}
                    placeholder="请输入企业名称"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowHeaderEditModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveHeaderInfo}
                  className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasBackgroundResult && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] bg-white p-6 rounded-2xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)] border border-blue-100 w-96 flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                <Zap size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">企业数据抓取已完成！</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  系统已为您抓取该企业的全网数据并提炼深度线索，发现多项重要异常特征，建议立即查看。
                </p>
              </div>
              <button
                onClick={onViewBackgroundResult}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  if (onViewBackgroundResult) onViewBackgroundResult();
                  setShowIntelligenceModal(true);
                  if (intelligenceResult?.aiQuestions) {
                    setPendingQuestions(intelligenceResult.aiQuestions.map((q: any) => ({ ...q, selected: true })));
                  }
                }}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                立即查看分析报告
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Intelligence View Component
const IntelligenceView = ({ onBack, onComplete, initialCompanyName = "", initialStep = "input" }: {
  onBack: () => void,
  onComplete: (result?: any) => void,
  initialCompanyName?: string,
  initialStep?: "input" | "confirm" | "loading" | "result"
}) => {
  const [step, setStep] = useState<"input" | "loading" | "result">(
    initialStep === "loading" ? "loading" : "input"
  );
  const [showConfirmModal, setShowConfirmModal] = useState(initialStep === "confirm");
  const [activeTab, setActiveTab] = useState<"data" | "questions" | "guidelines">("data");
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [files, setFiles] = useState<File[]>([]);
  const [crawlingLog, setCrawlingLog] = useState<string[]>([]);
  const [discoveredData, setDiscoveredData] = useState<{ label: string, value: string, icon: any }[]>([]);
  const [privacyShieldEnabled, setPrivacyShieldEnabled] = useState(true);

  const [questions, setQuestions] = useState([
    { category: "预制问题", question: "公司的核心竞争优势是什么？主要的技术壁垒体现在哪些方面？", source: "系统预制", type: "preset" },
    { category: "预制问题", question: "未来三年的业务增长点及市场扩张计划如何？", source: "系统预制", type: "preset" },
    { category: "资料补充", question: "上传的《2024年财务审计报告》中提到的一笔大额预付款项，其具体背景及回收计划如何？", source: "上传资料分析", type: "material" },
    { category: "权益性投资", question: "公司引入某某资本作为股东的背景是什么？是否存在对赌协议或回购条款？", source: "股东变更记录", type: "supplemental" },
    { category: "权益性投资", question: "对北京某某机器人有限公司的15%股权投资，是否涉及核心业务协同？目前投资收益如何？", source: "对外投资数据", type: "supplemental" },
    { category: "法律诉讼", question: "针对(2023)沪0115民初XXXX号合同纠纷，公司是否计提了足额预计负债？", source: "法院执行网自动抓取", type: "supplemental" },
    { category: "股权质押", question: "大股东张三质押股权的资金用途是什么？若股价波动触发平仓线，有何应对措施？", source: "企查查实时抓取", type: "supplemental" },
    { category: "动产抵押", question: "公司将核心生产线设备进行动产抵押，是否会影响日常生产经营的稳定性？", source: "动产抵押登记", type: "supplemental" },
    { category: "财务异常", question: "财务数据显示应收账款周转率异常，请说明前五大欠款方的账龄结构及坏账计提政策。", source: "财务异常分析", type: "supplemental" },
    { category: "税务处罚", question: "关于2023年印花税未按期申报及欠税记录，目前是否已补缴完毕？是否存在税务信用降级风险？", source: "税务系统抓取", type: "supplemental" }
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState<number[]>(
    [0, 1] // Initial preset questions
  );

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ = {
      category: "手动补充",
      question: newQuestionText,
      source: "用户手动添加",
      type: "manual"
    };
    setQuestions(prev => [...prev, newQ]);
    setSelectedQuestionIndices(prev => [...prev, questions.length]);
    setNewQuestionText("");
  };

  const companyData = {
    name: companyName || "上海某某科技股份有限公司",
    unifiedCode: "91310115MA1K3XXXXX",
    legalPerson: "张三",
    idNumber: "3101151990********",
    establishDate: "2015-06-12",
    address: "上海市浦东新区某某路888号",
    products: ["智能制造管理系统", "工业互联网平台", "数字化工厂解决方案"],
    financialAnomalies: [
      { type: "应收账款异常", detail: "应收账款周转率连续三年下降，且远低于行业平均水平", severity: "high" },
      { type: "现金流背离", detail: "净利润与经营活动现金流净额存在较大缺口", severity: "medium" }
    ],
    shareholders: [
      { name: "张三", ratio: "45%", type: "自然人", equityChange: "2023年增持5%" },
      { name: "李四", ratio: "25%", type: "自然人", equityChange: "无变动" },
      { name: "某某资本(投资机构)", ratio: "20%", type: "权益性投资", equityChange: "2022年A轮进入" }
    ],
    equityInvestments: [
      { target: "北京某某机器人有限公司", ratio: "15%", date: "2022-03", type: "权益性投资" },
      { target: "深圳某某传感器技术有限公司", ratio: "10%", date: "2021-11", type: "权益性投资" }
    ],
    litigations: [
      { date: "2023-10-15", caseNo: "(2023)沪0115民初XXXX号", reason: "买卖合同纠纷", role: "被告", amount: "120.5万元", status: "审理中", source: "法院执行网" },
      { date: "2022-05-20", caseNo: "(2022)沪0115执XXXX号", reason: "劳动争议", role: "被执行人", amount: "5.2万元", status: "已结案", source: "企查查" }
    ],
    pledges: [
      { type: "股权质押", pledgor: "张三", pledgee: "某某银行上海分行", amount: "1000万股", date: "2023-08-01", status: "有效" },
      { type: "动产抵押", pledgor: "公司", pledgee: "融资租赁公司", amount: "生产线设备", date: "2023-05-12", status: "履行中" }
    ],
    penalties: [
      { date: "2023-03-12", type: "税务处罚", reason: "未按期申报印花税", amount: "0.2万元", authority: "国家税务总局", detail: "含欠税记录" },
      { date: "2022-09-05", type: "行政处罚", reason: "环保设施运行不规范", amount: "5万元", authority: "上海市生态环境局", detail: "行政处罚" }
    ]
  };

  const guidelines = [
    { tag: "高新企业", preference: "优先支持", detail: "符合机构对硬科技赛道的偏好" },
    { tag: "法律风险", preference: "审慎关注", detail: "存在未结案的大额合同纠纷" },
    { tag: "质押率高", preference: "风险预警", detail: "大股东质押比例接近警戒线" },
    { tag: "税务合规", preference: "合规要求", detail: "存在欠税记录，需核实合规性" }
  ];

  const maskText = (text: string) => {
    if (!privacyShieldEnabled || !text) return text;
    return text.replace(/上海某某科技股份有限公司/g, "【已屏蔽企业】")
      .replace(/某某/g, "XX")
      .replace(/张三/g, "张*")
      .replace(/李四/g, "李*")
      .replace(/王五/g, "王*")
      .replace(/\d{18}/g, "******************")
      .replace(/1[3-9]\d{9}/g, (match) => match.substring(0, 3) + "****" + match.substring(7))
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
        const [user, domain] = match.split('@');
        return user.substring(0, 2) + "****@" + domain;
      });
  };

  const toggleQuestion = (index: number) => {
    setSelectedQuestionIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllQuestions = () => {
    if (selectedQuestionIndices.length === questions.length) {
      setSelectedQuestionIndices([]);
    } else {
      setSelectedQuestionIndices(questions.map((_, i) => i));
    }
  };

  const presetQuestions = [
    { category: "预制问题", question: "公司的核心竞争优势是什么？主要的技术壁垒体现在哪些方面？", source: "系统预制", type: "preset" },
    { category: "预制问题", question: "未来三年的业务增长点及市场扩张计划如何？", source: "系统预制", type: "preset" },
  ];

  useEffect(() => {
    if (initialStep === "loading") {
      handleStartAnalysis();
    }
  }, []);

  const handleStartAnalysis = () => {
    setStep("loading");
    const logs = [
      "正在连接企查查 API...",
      "正在抓取企业基本信息及产品介绍...",
      "正在查询法院执行网失信被执行人记录...",
      "正在同步国家税务总局欠税及处罚信息...",
      "正在分析股东结构及历史股权变更...",
      "正在识别权益性投资 (投资机构)...",
      "正在抓取股权质押及动产抵押登记...",
      "正在根据上传资料生成补充访谈问题...",
      "分析完成！"
    ];

    const discoveries = [
      { label: "企业概况", value: "已抓取", icon: Info },
      { label: "产品信息", value: "3项核心产品", icon: Package },
      { label: "股东结构", value: "3名主要股东", icon: Users },
      { label: "法律诉讼", value: "2条风险记录", icon: Gavel },
      { label: "股权质押", value: "1条质押记录", icon: GitBranch },
      { label: "税务处罚", value: "1条欠税记录", icon: AlertTriangle },
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setCrawlingLog(prev => [...prev, log]);
        if (index > 0 && index <= discoveries.length) {
          setDiscoveredData(prev => [...prev, discoveries[index - 1]]);
        }
      }, index * 600);
    });

    setTimeout(() => setStep("result"), 6500);
  };

  if (step === "input") {
    return (
      <div className="flex-1 flex bg-slate-50 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 p-12 space-y-10"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200">
                <BrainCircuit size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">新建企业数据抓取</h2>
              <p className="text-slate-500">输入企业信息，小狸将自动抓取全网数据，用于补充企业外部信息与风险线索</p>
            </div>

            {/* Privacy Shield Banner */}
            <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${privacyShieldEnabled ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${privacyShieldEnabled ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                  {privacyShieldEnabled ? <Shield size={20} /> : <Eye size={20} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">隐私盾 (Privacy Shield)</div>
                  <div className="text-[10px] text-slate-500">自动屏蔽敏感企业及个人信息，确保合规</div>
                </div>
              </div>
              <button
                onClick={() => setPrivacyShieldEnabled(!privacyShieldEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${privacyShieldEnabled ? 'bg-orange-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacyShieldEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">企业名称 / 统一社会信用代码</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="例如：上海某某科技股份有限公司"
                  className="w-full py-5 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">个人姓名 / 身份证号 (可选)</label>
                <input
                  type="text"
                  placeholder="用于抓取个人失信及关联风险"
                  className="w-full py-5 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">上传参考资料 (可选)</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
                    }
                  }}
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-all group"
                >
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                    <Upload size={20} />
                  </div>
                  <div className="text-sm font-bold text-slate-600">点击或拖拽上传资料</div>
                  <div className="text-[10px] text-slate-400">支持 PDF, Word, Excel, 图片等格式</div>
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-100 group">
                        <FileText size={12} />
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={!companyName}
                  className={`w-full py-5 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 ${companyName ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  下一步：开始分析 <ArrowRight size={20} />
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm"
                >
                  返回
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Confirm Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfirmModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-12 space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mx-auto">
                    <Clock size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">确认开始企业数据抓取？</h2>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-blue-600"><Zap size={16} /></div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        系统将启动全网数据抓取引擎
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-amber-600"><AlertCircle size={16} /></div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        由于涉及大量实时数据处理，<span className="text-amber-600 font-bold">整个过程预计需要 1-2 分钟</span>，请保持页面开启。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      handleStartAnalysis();
                    }}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
                  >
                    立即开始分析 <Zap size={20} />
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm"
                    >
                      返回修改
                    </button>
                    <button
                      onClick={() => onComplete({ companyName, isSkip: true })}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                    >
                      暂不分析，直接新建
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 overflow-hidden">
        <div className="flex flex-col items-center gap-12 max-w-4xl w-full text-center relative">
          {privacyShieldEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-16 flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest"
            >
              <Shield size={14} />
              <span>Privacy Shield Active</span>
            </motion.div>
          )}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-40 h-40 border-4 border-blue-500/10 border-t-blue-500 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-blue-500">
              <BrainCircuit size={64} className="animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Log Panel */}
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">Crawling Engine Log</h3>
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 font-mono text-xs h-80 overflow-y-auto space-y-3 backdrop-blur-xl">
                {crawlingLog.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 text-blue-400/80"
                  >
                    <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="leading-relaxed">{log}</span>
                    {i === crawlingLog.length - 1 && log !== "分析完成！" && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping mt-1" />}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Discovery Panel */}
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">Data Discoveries</h3>
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                  {discoveredData.map((data, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <data.icon size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{data.label}</div>
                        <div className="text-sm text-white font-medium">{data.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {discoveredData.length < 6 && (
                  <div className="p-4 border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
                    <RefreshCw size={20} className="text-slate-700 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
              <span>Analysis Progress</span>
              <span>{Math.min(Math.round((crawlingLog.length / 10) * 100), 100)}%</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((crawlingLog.length / 10) * 100), 100}%` }}
                className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-500 rounded-full"
              />
            </div>
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setStep("input")}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded-full text-xs font-bold transition-all border border-white/5"
              >
                取消并返回
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {maskText(companyData.name)}
              <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">数据抓取中</span>
            </h1>
            <p className="text-xs text-gray-500">统一社会信用代码: {companyData.unifiedCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrivacyShieldEnabled(!privacyShieldEnabled)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-medium transition-all hover:shadow-md active:scale-95 ${privacyShieldEnabled ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
          >
            {privacyShieldEnabled ? <Shield size={14} /> : <Eye size={14} />}
            <span>隐私盾: {privacyShieldEnabled ? '已开启' : '已关闭'}</span>
          </button>
          <button
            onClick={() => {
              const selected = questions.filter((_, i) => selectedQuestionIndices.includes(i));
              onComplete({
                companyData,
                questions: selected,
                guidelines: guidelines
              });
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Zap size={16} />
            完成并进入项目
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Download size={16} />
            导出分析报告
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Tabs */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("data")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'data' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Database size={18} />
            全网抓取数据
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'questions' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={18} />
              补充访谈问题
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'questions' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
              {questions.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "data" && (
              <div className="space-y-8 max-w-5xl mx-auto">
                {/* Basic Info & Products */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Info size={18} className="text-blue-600" />
                      企业及产品概况
                    </h3>
                    <span className="text-xs text-gray-400">数据来源: 企查查 / 官网</span>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">法定代表人</span>
                        <span className="font-medium">{maskText(companyData.legalPerson)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">成立日期</span>
                        <span className="font-medium">{companyData.establishDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">注册地址</span>
                        <span className="font-medium text-right ml-4">{maskText(companyData.address)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-sm text-gray-500">核心产品/服务</span>
                      <div className="flex flex-wrap gap-2">
                        {companyData.products.map((p, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Financial Anomalies */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-orange-600" />
                      财务异常分析
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {companyData.financialAnomalies.map((a, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                        <div className={`mt-1 p-1.5 rounded-lg ${a.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                          <AlertCircle size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{a.type}</h4>
                          <p className="text-xs text-gray-600 mt-1">{a.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Shareholders & Equity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Users size={18} className="text-indigo-600" />
                        股东情况与历史变更
                      </h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-gray-50">
                            <th className="pb-2 font-medium">股东名称</th>
                            <th className="pb-2 font-medium">持股比例</th>
                            <th className="pb-2 font-medium">变更记录</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {companyData.shareholders.map((s, i) => (
                            <tr key={i}>
                              <td className="py-3">
                                <div className="font-medium">{maskText(s.name)}</div>
                                <div className="text-[10px] text-gray-400">{s.type}</div>
                              </td>
                              <td className="py-3 text-blue-600 font-bold">{s.ratio}</td>
                              <td className="py-3 text-gray-500 text-xs">{s.equityChange}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase size={18} className="text-emerald-600" />
                        权益性投资 (投资机构)
                      </h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-gray-50">
                            <th className="pb-2 font-medium">被投资企业</th>
                            <th className="pb-2 font-medium">持股比例</th>
                            <th className="pb-2 font-medium">投资类型</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {companyData.equityInvestments.map((e, i) => (
                            <tr key={i}>
                              <td className="py-3 font-medium">{maskText(e.target)}</td>
                              <td className="py-3 text-emerald-600 font-bold">{e.ratio}</td>
                              <td className="py-3 text-gray-500">{e.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                {/* Pledges & Mortgages */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <GitBranch size={18} className="text-blue-600" />
                      股权质押与动产抵押
                    </h3>
                    <span className="text-xs text-gray-400">数据来源: 企查查 / 动产融资统一登记系统</span>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companyData.pledges.map((p, i) => (
                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${p.type === '股权质押' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {p.type === '股权质押' ? <Users size={16} /> : <Package size={16} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold">{p.type}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{p.status}</span>
                            </div>
                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                              <div className="flex justify-between"><span>出质人:</span> <span>{maskText(p.pledgor)}</span></div>
                              <div className="flex justify-between"><span>质权人:</span> <span>{p.pledgee}</span></div>
                              <div className="flex justify-between"><span>数额/内容:</span> <span className="font-medium text-gray-900">{p.amount}</span></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Litigation & Penalties */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Gavel size={18} className="text-red-600" />
                      法律诉讼、失信与税务处罚
                    </h3>
                    <span className="text-xs text-gray-400">数据来源: 法院执行网 / 企查查 / 税务局</span>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">法律诉讼与失信记录</h4>
                      <div className="space-y-3">
                        {companyData.litigations.map((l, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <Scale size={16} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm">{l.reason}</span>
                                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{l.role}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{l.caseNo} | {l.date} | 来源: {l.source}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-red-600">{l.amount}</p>
                              <p className="text-xs text-gray-400">{l.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">行政处罚与欠税记录</h4>
                      <div className="space-y-3">
                        {companyData.penalties.map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <FileText size={16} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm">{p.reason}</span>
                                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{p.type}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{p.authority} | {p.date} | {p.detail}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-orange-600">{p.amount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* AI Questions Preview */}
                <section className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/30 flex items-center justify-between">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-600" />
                      AI 访谈问题清单预览
                    </h3>
                    <button
                      onClick={() => setActiveTab("questions")}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      查看全部问题
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    {questions.slice(0, 3).map((q, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="mt-1 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-100 px-1.5 py-0.5 rounded-full">{q.category}</span>
                          </div>
                          <p className="text-sm text-gray-700 font-medium leading-relaxed">{maskText(q.question)}</p>
                        </div>
                      </div>
                    ))}
                    {questions.length > 3 && (
                      <p className="text-center text-xs text-gray-400 pt-2 italic">... 还有 {questions.length - 3} 个针对性访谈问题已生成</p>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "questions" && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-md">
                      <MessageSquare size={14} />
                      <span>访谈清单已生成</span>
                    </div>
                    <h2 className="text-3xl font-bold">访谈问题清单 (预制 + 补充)</h2>
                    <p className="text-blue-100 max-w-xl">小狸已根据上传资料及全网抓取的风险点，为您自动生成了针对性的访谈问题。</p>
                  </div>
                  <div className="absolute right-[-40px] top-[-40px] opacity-10">
                    <BrainCircuit size={240} />
                  </div>
                </div>

                {/* Add Custom Question */}
                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                        placeholder="输入您想补充的访谈问题..."
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <button
                      onClick={handleAddQuestion}
                      disabled={!newQuestionText.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <Plus size={16} />
                      添加问题
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    <MessageSquare size={12} />
                    <span>访谈清单生成结果</span>
                  </div>
                  <button
                    onClick={handleSelectAllQuestions}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 hover:bg-blue-50 rounded-lg border border-blue-100"
                  >
                    {selectedQuestionIndices.length === questions.length ? "取消全选" : "全选所有问题"}
                  </button>
                </div>

                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {questions.map((q, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => toggleQuestion(i)}
                      className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group cursor-pointer relative ${selectedQuestionIndices.includes(i)
                        ? 'border-blue-300 ring-1 ring-blue-300'
                        : 'border-gray-100 opacity-80'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${q.type === 'preset' ? 'bg-gray-100 text-gray-600' :
                              q.type === 'material' ? 'bg-emerald-100 text-emerald-700' :
                                q.type === 'manual' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-blue-100 text-blue-700'
                              }`}>
                              {q.category}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Database size={10} /> 来源: {q.source}
                            </span>
                          </div>
                          <p className={`text-gray-800 font-medium leading-relaxed text-lg ${!selectedQuestionIndices.includes(i) && 'text-gray-400'}`}>
                            {q.type === 'manual' ? q.question : maskText(q.question)}
                          </p>
                        </div>
                        <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${selectedQuestionIndices.includes(i) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200'
                          }`}>
                          {selectedQuestionIndices.includes(i) && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// --- New View Components ---

const DocxToolbar = () => (
  <div className="h-10 border-b border-gray-200 bg-gray-50 flex items-center px-4 gap-1 sticky top-16 z-20 shadow-sm">
    <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-2">
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="撤销"><Undo size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="重做"><Redo size={14} /></button>
    </div>
    <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-2">
      <select className="text-xs bg-transparent border-none focus:ring-0 text-gray-700 font-medium">
        <option>宋体 (SimSun)</option>
        <option>微软雅黑</option>
        <option>Times New Roman</option>
      </select>
      <select className="text-xs bg-transparent border-none focus:ring-0 text-gray-700 font-medium w-12">
        <option>12</option>
        <option>14</option>
        <option>16</option>
      </select>
    </div>
    <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 font-bold" title="加粗">B</button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 italic" title="倾斜">I</button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 underline" title="下划线">U</button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 line-through" title="删除线">S</button>
    </div>
    <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignLeft size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignCenter size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignRight size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignJustify size={14} /></button>
    </div>
    <div className="flex items-center gap-1">
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="插入表格"><Table size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="插入图片"><ImageIcon size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="查找替换"><Search size={14} /></button>
    </div>
  </div>
);

type MaterialPreviewData = {
  title: string;
  section: string;
  source: string;
  excerpt: string;
  targetId: string;
  tab: "conflict" | "traceability";
};

const MaterialPreviewDialog = ({
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

const AuditView = ({ onBack, onDownloadConflict, onDownloadTraceability, intelligenceResult }: {
  onBack: () => void,
  onDownloadConflict: () => void,
  onDownloadTraceability: () => void,
  intelligenceResult?: any
}) => {
  const projectName = intelligenceResult?.companyName || "A公司";
  const [activeTab, setActiveTab] = useState<"conflict" | "traceability">("conflict");
  const auditTargetRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [materialPreview, setMaterialPreview] = useState<MaterialPreviewData | null>(null);
  const [auditSections, setAuditSections] = useState([
    {
      id: "company",
      title: "企业基本情况",
      paragraphs: [
        `${projectName}成立于2010年，总部位于上海市张江高科技园区。公司是一家专注于工业自动化设备研发、生产及销售的高新技术企业。`,
        "截至2024年底，公司注册资本为人民币5000万元。截至2024年底，公司实现营业收入约1.2亿元。公司主要产品涵盖智能组装线、精密检测设备以及工业机器人集成系统。",
      ],
    },
    {
      id: "financial",
      title: "财务状况分析",
      paragraphs: [
        "2024年实现营业收入1.2亿元，净利润1500万元。公司整体财务表现稳健。",
        "在还款来源方面，公司计划通过销售回款完全覆盖本次贷款本息。",
      ],
    },
    {
      id: "interview",
      title: "访谈核心观点",
      paragraphs: [
        "受访人表示，公司未来三年将重点布局新能源汽车零部件市场，并同步推进区域客户结构优化。",
        "访谈记录显示，公司近一年无重大股权变动，股东结构整体保持稳定。",
      ],
    },
  ]);

  const conflicts = [
    {
      id: 1,
      type: "数据不一致",
      field: "2024年营业收入",
      page: 1,
      targetId: "audit-company-revenue",
      sources: [
        { id: "report", label: "报告内容", content: "财务报表 (1.2亿)", tone: "neutral" },
        { id: "interview", label: "访谈记录", content: "管理层访谈 (1.5亿)", tone: "warning", resolvedText: "截至2024年底，公司实现营业收入约1.5亿元。" },
        { id: "ledger", label: "销售台账", content: "销售台账汇总 (1.38亿)", tone: "warning", resolvedText: "截至2024年底，公司实现营业收入约1.38亿元。" },
      ],
    },
    {
      id: 2,
      type: "逻辑冲突",
      field: "还款计划",
      page: 1,
      targetId: "audit-industry-repayment",
      sources: [
        { id: "report", label: "报告内容", content: "销售回款覆盖", tone: "neutral" },
        { id: "pledge", label: "抵押方案", content: "抵押物变现", tone: "warning", resolvedText: "在还款来源方面，公司计划通过抵押物变现覆盖本次贷款本息。" },
        { id: "meeting", label: "会议纪要", content: "销售回款 + 股东增信联合覆盖", tone: "warning", resolvedText: "在还款来源方面，公司计划通过销售回款与股东增信联合覆盖本次贷款本息。" },
      ],
    },
    {
      id: 3,
      type: "信息缺失",
      field: "股权变动",
      page: 2,
      targetId: "audit-interview-equity",
      sources: [
        { id: "report", label: "报告内容", content: "访谈记录 (无变动)", tone: "neutral" },
        { id: "registry", label: "工商信息", content: "工商信息 (有变动)", tone: "warning", resolvedText: "访谈记录显示，公司近一年存在股权变动，股东结构发生调整。" },
      ],
    },
  ];

  const traces = [
    {
      id: 1,
      section: "第一章：企业基本情况",
      content: `${projectName}成立于2010年，主要从事工业自动化设备的研发与生产...`,
      source: "工商登记信息 / 官方网站",
      confidence: 0.98,
      targetId: "audit-company-overview",
      materialTitle: `${projectName}工商登记与官网摘要`,
      materialExcerpt: `${projectName}成立于2010年，注册地位于上海市张江高科技园区，经营范围包括工业自动化设备研发、生产、销售与技术服务。官网公开材料显示，公司已形成智能组装线、精密检测设备及工业机器人集成三类核心产品线。`,
    },
    {
      id: 2,
      section: "第二章：财务状况分析",
      content: "2024年实现营业收入1.2亿元，净利润1500万元，同比增长12%...",
      source: `${projectName}2024年财务报表.pdf (第12页)`,
      confidence: 1.0,
      targetId: "audit-industry-financials",
      materialTitle: `${projectName}2024年财务报表摘录`,
      materialExcerpt: "2024年度公司实现营业收入120,000,000元，净利润15,000,000元，经营活动现金流保持净流入。主营业务毛利率较上年基本稳定，应收账款余额同比增长但仍处于可控区间。",
    },
    {
      id: 3,
      section: "第三章：访谈核心观点",
      content: "受访人表示，公司未来三年将重点布局新能源汽车零部件市场...",
      source: "访谈录音 (02:55 - 03:45)",
      confidence: 0.92,
      targetId: "audit-interview-outlook",
      materialTitle: "管理层访谈录音转写",
      materialExcerpt: "受访管理层表示，未来三年公司将重点布局新能源汽车零部件市场，并围绕核心客户推进区域交付网络建设。同时会逐步优化客户结构，提升高毛利项目的占比。",
    },
  ];

  const registerAuditTarget = (targetId: string) => (node: HTMLParagraphElement | null) => {
    auditTargetRefs.current[targetId] = node;
  };

  const jumpToAuditTarget = (targetId: string, tab: "conflict" | "traceability") => {
    setActiveTab(tab);
    setActiveTargetId(targetId);

    window.requestAnimationFrame(() => {
      auditTargetRefs.current[targetId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const applyAuditConflictSource = (targetId: string, resolvedText?: string) => {
    if (!resolvedText) {
      jumpToAuditTarget(targetId, "conflict");
      return;
    }

    const paragraphMap: Record<string, { sectionId: string; index: number }> = {
      "audit-company-revenue": { sectionId: "company", index: 1 },
      "audit-industry-repayment": { sectionId: "financial", index: 1 },
      "audit-interview-equity": { sectionId: "interview", index: 1 },
    };

    const target = paragraphMap[targetId];
    if (!target) {
      return;
    }

    setAuditSections((previous) =>
      previous.map((section) =>
        section.id === target.sectionId
          ? {
              ...section,
              paragraphs: section.paragraphs.map((paragraph, index) =>
                index === target.index ? resolvedText : paragraph,
              ),
            }
          : section,
      ),
    );

    jumpToAuditTarget(targetId, "conflict");
  };

  const renderAuditParagraph = (targetId: string, tab: "conflict" | "traceability", highlightText: string, text: string) => {
    if (activeTab !== tab || !text.includes(highlightText)) {
      return text;
    }

    const start = text.indexOf(highlightText);
    const before = text.slice(0, start);
    const middle = text.slice(start, start + highlightText.length);
    const after = text.slice(start + highlightText.length);
    const highlightClass =
      tab === "conflict"
        ? "bg-orange-100 border-b-2 border-orange-400 cursor-help px-1"
        : "bg-purple-50 border-b-2 border-purple-300 cursor-help px-1";

    return (
      <>
        {before}
        <span className={highlightClass}>{middle}</span>
        {after}
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 h-screen overflow-hidden">
      <header className="h-16 border-b border-gray-200 px-8 flex items-center justify-between bg-white z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">报告智能核查模式</h2>
              <p className="text-[10px] text-gray-500">{projectName} - 冲突标记与溯源合一</p>
            </div>
          </div>
        </div>
        <div />
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Report Document */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-200/50 flex flex-col items-center border-r border-gray-300">
          <div className="w-[700px] bg-white shadow-xl border border-gray-300 min-h-[1000px] p-[60px] space-y-6 relative mb-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-8 font-serif">{projectName}流贷尽调报告 (草案)</h1>
            {auditSections.map((section, sectionIndex) => (
              <section key={section.id} className={`space-y-4 ${sectionIndex > 0 ? "mt-8" : ""}`}>
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-800 pb-1 font-serif">
                  {sectionIndex + 1}. {section.title}
                </h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => {
                  const targetId = `audit-${section.id}-${paragraphIndex === 0 ? section.id === "company" ? "overview" : section.id === "financial" ? "financials" : "outlook" : section.id === "company" ? "revenue" : section.id === "financial" ? "repayment" : "equity"}`;

                  const paragraphContent =
                    targetId === "audit-company-overview"
                      ? renderAuditParagraph(targetId, "traceability", `${projectName}成立于2010年，总部位于上海市张江高科技园区。`, paragraph)
                      : targetId === "audit-company-revenue"
                        ? renderAuditParagraph(targetId, "conflict", "截至2024年底，公司实现营业收入约1.2亿元", paragraph)
                        : targetId === "audit-industry-financials"
                          ? renderAuditParagraph(targetId, "traceability", "2024年实现营业收入1.2亿元，净利润1500万元", paragraph)
                          : targetId === "audit-industry-repayment"
                            ? renderAuditParagraph(targetId, "conflict", "销售回款完全覆盖", paragraph)
                            : targetId === "audit-interview-outlook"
                              ? renderAuditParagraph(targetId, "traceability", "公司未来三年将重点布局新能源汽车零部件市场", paragraph)
                              : renderAuditParagraph(targetId, "conflict", "无重大股权变动", paragraph);

                  return (
                    <p
                      key={targetId}
                      ref={registerAuditTarget(targetId)}
                      className={`text-gray-700 leading-relaxed text-sm text-justify indent-8 relative group scroll-mt-24 ${
                        activeTargetId === targetId
                          ? activeTab === "conflict"
                            ? "rounded-xl ring-2 ring-amber-300 ring-offset-4 ring-offset-white"
                            : "rounded-xl ring-2 ring-fuchsia-300 ring-offset-4 ring-offset-white"
                          : ""
                      }`}
                    >
                      {paragraphContent}
                    </p>
                  );
                })}
              </section>
            ))}
            <div className="absolute bottom-4 right-8 text-[10px] text-gray-300">Page 1</div>
          </div>
        </div>

        {/* Right Side: Audit Panel */}
        <div className="w-[450px] bg-white flex flex-col shadow-[-10px_0_15px_rgba(0,0,0,0.02)]">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 shrink-0">
            <button
              onClick={() => setActiveTab("conflict")}
              className={`flex-1 py-4 text-xs font-bold transition-all relative ${activeTab === "conflict" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
                }`}
            >
              冲突标记 ({conflicts.length})
              {activeTab === "conflict" && <motion.div layoutId="auditTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />}
            </button>
            <button
              onClick={() => setActiveTab("traceability")}
              className={`flex-1 py-4 text-xs font-bold transition-all relative ${activeTab === "traceability" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
                }`}
            >
              报告溯源 ({traces.length})
              {activeTab === "traceability" && <motion.div layoutId="auditTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "conflict" ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">冲突明细</h3>
                  <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded">AI 自动检测</span>
                </div>
                {conflicts.map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => jumpToAuditTarget(c.targetId, "conflict")}
                    className="cursor-pointer border border-gray-100 rounded-xl p-5 hover:border-orange-300 transition-all bg-white shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-gray-400 font-mono">#{idx + 1}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-4">{c.type}: {c.field}</h4>
                    <div className="space-y-3">
                      {c.sources.map((source) => (
                        <div
                          key={source.id}
                          className={`rounded-lg border p-3 ${
                            source.tone === 'warning'
                              ? 'border-orange-100 bg-orange-50/60'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className={`text-[10px] font-bold ${
                              source.tone === 'warning' ? 'text-orange-500' : 'text-gray-400'
                            }`}>
                              {source.label}
                            </span>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                applyAuditConflictSource(c.targetId, source.resolvedText);
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              采纳
                            </button>
                          </div>
                          <p className={`mt-2 text-xs italic ${
                            source.tone === 'warning' ? 'text-gray-700 font-medium' : 'text-gray-600'
                          }`}>
                            "{source.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-end">
                      <button className="text-[10px] text-gray-400 hover:text-gray-600">忽略此冲突</button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">溯源证据链</h3>
                  <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">AI 自动关联</span>
                </div>
                {traces.map(t => (
                  <div
                    key={t.id}
                    onClick={() => jumpToAuditTarget(t.targetId, "traceability")}
                    className="space-y-4 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider">{t.section}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-gray-400">置信度</span>
                        <span className="text-[10px] font-bold text-green-600">{(t.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-purple-200 transition-colors">
                      <p className="text-xs text-gray-500 leading-relaxed italic mb-3">"{t.content}"</p>
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <Database size={12} className="text-purple-400" />
                        <span className="text-[10px] font-bold text-gray-700">出处：<span className="text-blue-600">{t.source}</span></span>
                      </div>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setMaterialPreview({
                          title: t.materialTitle,
                          section: t.section,
                          source: t.source,
                          excerpt: t.materialExcerpt,
                          targetId: t.targetId,
                          tab: "traceability",
                        });
                      }}
                      className="w-full py-2 text-[10px] font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>查看原始素材</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <MaterialPreviewDialog
        preview={materialPreview}
        onClose={() => setMaterialPreview(null)}
        onLocate={jumpToAuditTarget}
      />
    </div>
  );
};

const EditReportView = ({
  onBack,
  onDownload,
  onDownloadConflict,
  onDownloadTraceability,
  intelligenceResult,
  initialSideTab,
  templates,
  setTemplates,
}: {
  onBack: () => void,
  onDownload: () => void,
  onDownloadConflict: () => void,
  onDownloadTraceability: () => void,
  intelligenceResult?: any,
  initialSideTab?: "conflict" | "traceability" | "templateRules",
  templates: TemplateItem[],
  setTemplates: React.Dispatch<React.SetStateAction<TemplateItem[]>>
}) => {
  const projectName = intelligenceResult?.companyName || "A公司";
  const [activeAuditTab, setActiveAuditTab] = useState<"conflict" | "traceability" | "templateRules">(initialSideTab || "conflict");
  const editTargetRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeEditTargetId, setActiveEditTargetId] = useState<string | null>(null);
  const [materialPreview, setMaterialPreview] = useState<MaterialPreviewData | null>(null);
  const templateUploadInputRef = useRef<HTMLInputElement>(null);
  const templateUploadTimersRef = useRef<number[]>([]);
  const [templateUploadStatus, setTemplateUploadStatus] = useState<"idle" | "uploading" | "parsing">("idle");
  const [showWorkbenchTemplateSwitcher, setShowWorkbenchTemplateSwitcher] = useState(false);
  const [workbenchActiveTemplateId, setWorkbenchActiveTemplateId] = useState<string | null>(
    templates.find((item) => item.status === "enabled")?.id || templates[0]?.id || null,
  );
  const [templateConfirmModal, setTemplateConfirmModal] = useState<{
    isOpen: boolean;
    action: "enable" | "disable" | "delete" | null;
    template: TemplateItem | null;
  }>({ isOpen: false, action: null, template: null });
  const [templateEditModal, setTemplateEditModal] = useState<{
    isOpen: boolean;
    template: TemplateItem | null;
    name: string;
    description: string;
  }>({ isOpen: false, template: null, name: "", description: "" });
  const [workbenchTemplatePreview, setWorkbenchTemplatePreview] = useState<TemplateItem | null>(null);
  const [workbenchPreviewIsNew, setWorkbenchPreviewIsNew] = useState(false);

  useEffect(() => {
    if (initialSideTab) {
      setActiveAuditTab(initialSideTab);
    }
  }, [initialSideTab]);

  useEffect(() => {
    return () => {
      templateUploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!templates.length) {
      setWorkbenchActiveTemplateId(null);
      return;
    }

    const currentExists = templates.some((item) => item.id === workbenchActiveTemplateId);
    if (currentExists) {
      return;
    }

    setWorkbenchActiveTemplateId(templates.find((item) => item.status === "enabled")?.id || templates[0].id);
  }, [templates, workbenchActiveTemplateId]);
  const [reportSections, setReportSections] = useState([
    {
      id: "company",
      title: "企业基本情况",
      paragraphs: [
        `${projectName}（以下简称“公司”）成立于2010年，总部位于上海市张江高科技园区。公司是一家专注于工业自动化设备研发、生产及销售的高新技术企业。经过十余年的发展，公司已在细分领域建立了较强的技术壁垒，拥有多项核心专利技术。`,
        "截至2024年底，公司注册资本为人民币5000万元，员工总数超过300人，其中研发人员占比超过40%。公司实现营业收入约1.2亿元，公司主要产品涵盖智能组装线、精密检测设备以及工业机器人集成系统，广泛应用于电子制造、汽车零部件及新能源行业。",
        "从股权结构看，控股股东及核心管理层保持稳定，经营团队对公司技术路线与重点客户资源具有较强控制力。近年来公司持续投入研发平台建设，在机器视觉、柔性产线集成及智能检测算法方面形成了较为完整的技术体系。",
      ],
    },
    {
      id: "industry",
      title: "行业背景与地位",
      paragraphs: [
        "随着全球制造业向智能化、数字化转型，工业自动化行业迎来了快速增长期。国内政策持续支持“中国制造2025”，为本土自动化设备厂商提供了广阔的市场空间。",
        "在行业竞争格局方面，头部企业向平台化、系统化方案延伸，中型厂商则更强调交付效率与细分场景能力。公司当前在华东区域装备制造客户中具备一定口碑优势，但在全国性项目获取、渠道覆盖与服务网络方面仍存在继续提升空间。",
      ],
    },
    {
      id: "financial",
      title: "财务状况分析",
      paragraphs: [
        "2024年实现营业收入1.2亿元，净利润1500万元，公司整体财务表现保持稳健，现金流与订单储备处于可控区间。结合已获取财务资料，公司主营业务收入仍为设备销售与产线集成服务，两类收入贡献占比较高。",
        "从资产质量看，应收账款规模随着业务扩张有所上升，部分项目回款周期受下游验收节奏影响而拉长。存货主要由在产品、原材料及部分备货设备构成，整体仍与项目制经营特点相匹配，但后续需持续关注大额项目交付与回款联动情况。",
        "在还款来源安排上，公司预计通过销售回款完全覆盖本次贷款本息，同时辅以核心股东增信与设备抵押作为补充保障。该表述仍需结合访谈纪要、授信方案及财务测算进一步核验。",
      ],
    },
    {
      id: "operations",
      title: "经营与交付情况",
      paragraphs: [
        "公司目前收入主要来源于汽车零部件、3C 电子及新能源装备客户，前五大客户贡献度相对较高，但客户合作年限整体较长，复购率处于合理水平。订单获取模式以销售跟进与行业口碑转介绍为主，大型项目通常伴随较长的商务谈判和验收周期。",
        "从生产交付角度看，公司采用研发、装配、集成联动模式，关键零部件部分外采，核心调试与软件集成由内部团队完成。若未来订单规模进一步扩大，需要继续观察人员、产能与项目管理体系能否同步支撑。",
      ],
    },
    {
      id: "interview",
      title: "访谈核心观点",
      paragraphs: [
        "受访人表示，公司未来三年将重点布局新能源汽车零部件市场，并同步推进区域客户结构优化。",
        "访谈记录显示，公司近一年无重大股权变动，股东结构整体保持稳定。管理层同时强调，当前新增订单中来自新能源客户的占比正在上升，但尚需时间验证其利润率与回款质量能否持续稳定。",
      ],
    },
    {
      id: "risk",
      title: "风险评估与建议",
      paragraphs: [
        "综合现有资料，公司核心风险主要集中在项目制业务带来的回款波动、订单集中度较高以及个别关键客户验收周期偏长等方面。若宏观制造业投资节奏放缓，可能对新增订单签约和交付回款产生一定影响。",
        "建议在后续授信审查中，重点核查近 12 个月主要客户回款明细、在手订单履约进度、核心设备抵押落实情况以及股东增信安排的可执行性，并结合访谈内容进一步验证管理层对未来收入增长与现金流改善的判断依据。",
      ],
    },
  ]);
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [reportDraftSections, setReportDraftSections] = useState<
    Array<{ id: string; title: string; paragraphs: string[] }>
  >([]);

  const conflicts = [
    {
      id: 1,
      type: "数据不一致",
      field: "2024年营业收入",
      page: 1,
      targetId: "edit-company-1",
      sources: [
        { id: "report", label: "报告内容", content: "财务报表 (1.2亿)", tone: "neutral" },
        { id: "interview", label: "访谈记录", content: "管理层访谈 (1.5亿)", tone: "warning", resolvedText: "截至2024年底，公司实现营业收入约1.5亿元，公司主要产品涵盖智能组装线、精密检测设备以及工业机器人集成系统，广泛应用于电子制造、汽车零部件及新能源行业。" },
        { id: "ledger", label: "销售台账", content: "销售台账汇总 (1.38亿)", tone: "warning", resolvedText: "截至2024年底，公司实现营业收入约1.38亿元，公司主要产品涵盖智能组装线、精密检测设备以及工业机器人集成系统，广泛应用于电子制造、汽车零部件及新能源行业。" },
      ],
    },
    {
      id: 2,
      type: "逻辑冲突",
      field: "还款计划",
      page: 1,
      targetId: "edit-financial-2",
      sources: [
        { id: "report", label: "报告内容", content: "销售回款覆盖", tone: "neutral" },
        { id: "pledge", label: "抵押方案", content: "抵押物变现", tone: "warning", resolvedText: "在还款来源安排上，公司预计通过抵押物变现覆盖本次贷款本息，同时辅以核心股东增信与设备抵押作为补充保障。该表述仍需结合访谈纪要、授信方案及财务测算进一步核验。" },
        { id: "meeting", label: "会议纪要", content: "销售回款 + 股东增信联合覆盖", tone: "warning", resolvedText: "在还款来源安排上，公司预计通过销售回款与股东增信联合覆盖本次贷款本息，同时辅以设备抵押作为补充保障。该表述仍需结合访谈纪要、授信方案及财务测算进一步核验。" },
      ],
    },
    {
      id: 3,
      type: "信息缺失",
      field: "股权变动",
      page: 2,
      targetId: "edit-interview-1",
      sources: [
        { id: "report", label: "报告内容", content: "访谈记录 (无变动)", tone: "neutral" },
        { id: "registry", label: "工商信息", content: "工商信息 (有变动)", tone: "warning", resolvedText: "访谈记录显示，公司近一年存在股权变动，股东结构发生调整。管理层同时强调，当前新增订单中来自新能源客户的占比正在上升，但尚需时间验证其利润率与回款质量能否持续稳定。" },
      ],
    },
  ];

  const traces = [
    {
      id: 1,
      section: "第一章：企业基本情况",
      content: `${projectName}成立于2010年，主要从事工业自动化设备的研发与生产...`,
      source: "工商登记信息 / 官方网站",
      confidence: 0.98,
      targetId: "edit-company-0",
      materialTitle: `${projectName}工商登记与官网摘要`,
      materialExcerpt: `${projectName}成立于2010年，注册地位于上海市张江高科技园区，经营范围包括工业自动化设备研发、生产、销售与技术服务。官网公开材料显示，公司已形成智能组装线、精密检测设备及工业机器人集成三类核心产品线。`,
    },
    {
      id: 2,
      section: "第三章：财务状况分析",
      content: "2024年实现营业收入1.2亿元，净利润1500万元，同比增长12%...",
      source: `${projectName}2024年财务报表.pdf (第12页)`,
      confidence: 1.0,
      targetId: "edit-financial-0",
      materialTitle: `${projectName}2024年财务报表摘录`,
      materialExcerpt: "2024年度公司实现营业收入120,000,000元，净利润15,000,000元，经营活动现金流保持净流入。主营业务毛利率较上年基本稳定，应收账款余额同比增长但仍处于可控区间。",
    },
    {
      id: 3,
      section: "第五章：访谈核心观点",
      content: "受访人表示，公司未来三年将重点布局新能源汽车零部件市场...",
      source: "访谈录音 (02:55 - 03:45)",
      confidence: 0.92,
      targetId: "edit-interview-0",
      materialTitle: "管理层访谈录音转写",
      materialExcerpt: "受访管理层表示，未来三年公司将重点布局新能源汽车零部件市场，并围绕核心客户推进区域交付网络建设。同时会逐步优化客户结构，提升高毛利项目的占比。",
    },
  ];

  const getSectionTargetId = (sectionId: string, paragraphIndex: number) => `edit-${sectionId}-${paragraphIndex}`;

  const registerEditTarget = (targetId: string) => (node: HTMLElement | null) => {
    editTargetRefs.current[targetId] = node;
  };

  const jumpToEditTarget = (targetId: string, tab: "conflict" | "traceability") => {
    setActiveAuditTab(tab);
    setActiveEditTargetId(targetId);

    window.requestAnimationFrame(() => {
      editTargetRefs.current[targetId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const applyEditConflictSource = (targetId: string, resolvedText?: string) => {
    if (!resolvedText) {
      jumpToEditTarget(targetId, "conflict");
      return;
    }

    const sectionMap: Record<string, { sectionId: string; index: number }> = {
      "edit-company-1": { sectionId: "company", index: 1 },
      "edit-financial-2": { sectionId: "financial", index: 2 },
      "edit-interview-1": { sectionId: "interview", index: 1 },
    };

    const target = sectionMap[targetId];
    if (!target) {
      return;
    }

    setReportSections((previous) =>
      previous.map((section) =>
        section.id === target.sectionId
          ? {
              ...section,
              paragraphs: section.paragraphs.map((paragraph, index) =>
                index === target.index ? resolvedText : paragraph,
              ),
            }
          : section,
      ),
    );

    if (isEditingDocument) {
      setReportDraftSections((previous) =>
        previous.map((section) =>
          section.id === target.sectionId
            ? {
                ...section,
                paragraphs: section.paragraphs.map((paragraph, index) =>
                  index === target.index ? resolvedText : paragraph,
                ),
              }
            : section,
        ),
      );
    }

    jumpToEditTarget(targetId, "conflict");
  };

  const startDocumentEdit = () => {
    setReportDraftSections(
      reportSections.map((section) => ({
        ...section,
        paragraphs: [...section.paragraphs],
      })),
    );
    setIsEditingDocument(true);
  };

  const cancelDocumentEdit = () => {
    setIsEditingDocument(false);
    setReportDraftSections([]);
  };

  const saveDocumentEdit = () => {
    setReportSections(
      reportDraftSections.map((section, index) => ({
        ...section,
        title: section.title.trim() || reportSections[index]?.title || section.title,
        paragraphs: section.paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean),
      })),
    );
    cancelDocumentEdit();
  };

  const updateDraftSectionTitle = (sectionIndex: number, value: string) => {
    setReportDraftSections((previous) =>
      previous.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              title: value,
            }
          : section,
      ),
    );
  };

  const updateDraftParagraph = (sectionIndex: number, paragraphIndex: number, value: string) => {
    setReportDraftSections((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const nextParagraphs = [...section.paragraphs];
        nextParagraphs[paragraphIndex] = value;

        return {
          ...section,
          paragraphs: nextParagraphs,
        };
      }),
    );
  };

  const renderHighlightedParagraph = (sectionId: string, paragraphIndex: number, text: string) => {
    const highlightRules = {
      company: {
        0: {
          tab: "traceability" as const,
          text: `${projectName}（以下简称“公司”）成立于2010年，总部位于上海市张江高科技园区。`,
          className: "rounded bg-fuchsia-100 px-1 ring-1 ring-fuchsia-300 shadow-[0_0_0_1px_rgba(217,70,239,0.08)]",
        },
        1: {
          tab: "conflict" as const,
          text: "公司实现营业收入约1.2亿元，",
          className: "rounded bg-amber-200 px-1 ring-1 ring-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]",
        },
      },
      financial: {
        0: {
          tab: "traceability" as const,
          text: "2024年实现营业收入1.2亿元，净利润1500万元，",
          className: "rounded bg-fuchsia-100 px-1 ring-1 ring-fuchsia-300 shadow-[0_0_0_1px_rgba(217,70,239,0.08)]",
        },
        2: {
          tab: "conflict" as const,
          text: "销售回款完全覆盖",
          className: "rounded bg-amber-200 px-1 ring-1 ring-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]",
        },
      },
      interview: {
        0: {
          tab: "traceability" as const,
          text: "公司未来三年将重点布局新能源汽车零部件市场",
          className: "rounded bg-fuchsia-100 px-1 ring-1 ring-fuchsia-300 shadow-[0_0_0_1px_rgba(217,70,239,0.08)]",
        },
        1: {
          tab: "conflict" as const,
          text: "无重大股权变动",
          className: "rounded bg-amber-200 px-1 ring-1 ring-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]",
        },
      },
    } as const;

    const rule = highlightRules[sectionId as keyof typeof highlightRules]?.[paragraphIndex as 0 | 1 | 2];

    if (!rule || activeAuditTab !== rule.tab || !text.includes(rule.text)) {
      return text;
    }

    const highlightStart = text.indexOf(rule.text);
    const before = text.slice(0, highlightStart);
    const highlighted = text.slice(highlightStart, highlightStart + rule.text.length);
    const after = text.slice(highlightStart + rule.text.length);

    return (
      <>
        {before}
        <span className={rule.className}>{highlighted}</span>
        {after}
      </>
    );
  };

  const currentWorkbenchTemplate =
    templates.find((template) => template.id === workbenchActiveTemplateId) ||
    templates.find((template) => template.status === "enabled") ||
    templates[0] ||
    null;

  const openWorkbenchTemplate = (template: TemplateItem, isNew = false) => {
    setWorkbenchTemplatePreview(template);
    setWorkbenchPreviewIsNew(isNew);
  };

  const handleWorkbenchTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    templateUploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    templateUploadTimersRef.current = [];
    setTemplateUploadStatus("uploading");

    const uploadTimer = window.setTimeout(() => {
      setTemplateUploadStatus("parsing");
    }, 900);

    const finishTimer = window.setTimeout(() => {
      const now = new Date();
      const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const nextTemplate: TemplateItem = {
        id: `tpl-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: "新上传的自定义模板，请点击编辑补充模板描述。",
        uploader: "当前用户",
        uploadTime: formatted,
        status: "enabled",
      };
      setTemplates((prev) => [nextTemplate, ...prev]);
      setWorkbenchActiveTemplateId(nextTemplate.id);
      setTemplateUploadStatus("idle");
      event.target.value = "";
      openWorkbenchTemplate(nextTemplate, true);
    }, 2600);

    templateUploadTimersRef.current.push(uploadTimer, finishTimer);
  };

  const executeWorkbenchTemplateAction = () => {
    if (!templateConfirmModal.template || !templateConfirmModal.action) return;

    if (templateConfirmModal.action === "delete") {
      setTemplates((prev) => prev.filter((item) => item.id !== templateConfirmModal.template?.id));
    } else {
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === templateConfirmModal.template?.id
            ? { ...item, status: templateConfirmModal.action === "enable" ? "enabled" : "disabled" }
            : item,
        ),
      );
    }

    setTemplateConfirmModal({ isOpen: false, action: null, template: null });
  };

  const handleSelectWorkbenchTemplate = (template: TemplateItem) => {
    if (template.status !== "enabled") {
      setTemplateConfirmModal({
        isOpen: true,
        action: "enable",
        template,
      });
    }
    setWorkbenchActiveTemplateId(template.id);
    setShowWorkbenchTemplateSwitcher(false);
  };

  const saveWorkbenchTemplateEdit = () => {
    if (!templateEditModal.template || !templateEditModal.name.trim()) return;
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === templateEditModal.template?.id
          ? { ...item, name: templateEditModal.name.trim(), description: templateEditModal.description.trim() }
          : item,
      ),
    );
    setTemplateEditModal({ isOpen: false, template: null, name: "", description: "" });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-gray-100">
      <header className="h-16 shrink-0 border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 bg-white z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{projectName}流贷尽调报告.docx</h2>
              <p className="text-[10px] text-gray-500">正在自动保存...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditingDocument ? (
            <>
              <button
                onClick={cancelDocumentEdit}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={saveDocumentEdit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                保存
              </button>
            </>
          ) : (
            <button
              onClick={startDocumentEdit}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Edit3 size={16} />
              <span>编辑</span>
            </button>
          )}
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Download size={16} />
            <span>导出 DOCX</span>
          </button>
        </div>
      </header>
      <DocxToolbar />
      <div className="min-h-0 flex-1 flex overflow-hidden">
        {/* Editor Sidebar */}
        <div className="hidden h-full w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-6 lg:block">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">报告目录</h3>
          <ul className="space-y-2">
            {reportSections.map((section, index) => (
              <li
                key={section.id}
                className={`cursor-pointer rounded-lg p-2 text-sm flex items-center gap-2 ${
                  index === 0 ? "bg-blue-50 font-bold text-blue-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-blue-600" : "bg-gray-300"}`} />
                {index + 1}. {section.title}
              </li>
            ))}
          </ul>
        </div>
        {/* Main Editor Area */}
        <div className="min-w-0 h-full flex-1 overflow-y-auto bg-gray-200/50 px-12 py-10">
          {/* Word-like Page Container */}
          <div className="mx-auto w-full max-w-[960px] flex justify-center">
            <div className="w-[880px] bg-white shadow-2xl border border-gray-300 min-h-[1320px] p-[108px] space-y-10 relative mb-12">
            {/* Ruler Simulation */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-50 border-b border-gray-200 flex items-center px-4 overflow-hidden opacity-50">
              <div className="flex gap-4 text-[8px] text-gray-400 font-mono">
                <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
              </div>
            </div>
            {/* Page Header Decoration */}
            <div className="absolute top-10 left-0 right-0 flex justify-center">
              <div className="w-1/2 h-px bg-gray-100" />
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-900 mb-12 font-serif">{projectName}流贷尽调报告</h1>

            {(isEditingDocument ? reportDraftSections : reportSections).map((section, sectionIndex) => (
              <section key={section.id} className="space-y-4">
                <div className="border-b-2 border-gray-800 pb-1">
                  {isEditingDocument ? (
                    <input
                      value={section.title}
                      onChange={(event) => updateDraftSectionTitle(sectionIndex, event.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xl font-bold text-gray-800 outline-none transition focus:border-blue-500 font-serif"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-800 font-serif">
                      {sectionIndex + 1}. {section.title}
                    </h2>
                  )}
                </div>

                {isEditingDocument ? (
                  <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <textarea
                        key={`${section.id}-${paragraphIndex}`}
                        ref={registerEditTarget(getSectionTargetId(section.id, paragraphIndex)) as React.Ref<HTMLTextAreaElement>}
                        value={paragraph}
                        onChange={(event) => updateDraftParagraph(sectionIndex, paragraphIndex, event.target.value)}
                        className={`min-h-[120px] w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-7 text-gray-700 outline-none transition focus:border-blue-500 ${
                          activeEditTargetId === getSectionTargetId(section.id, paragraphIndex)
                            ? "border-blue-300 ring-2 ring-blue-200"
                            : "border-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p
                      key={`${section.id}-${paragraphIndex}`}
                      ref={registerEditTarget(getSectionTargetId(section.id, paragraphIndex)) as React.Ref<HTMLParagraphElement>}
                      className={`text-gray-700 leading-relaxed text-justify indent-8 scroll-mt-24 ${
                        activeEditTargetId === getSectionTargetId(section.id, paragraphIndex)
                          ? "rounded-xl ring-2 ring-blue-200 ring-offset-4 ring-offset-white"
                          : ""
                      }`}
                    >
                      {renderHighlightedParagraph(section.id, paragraphIndex, paragraph)}
                    </p>
                  ))
                )}
              </section>
            ))}

            {/* Page Footer Decoration */}
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1">
              <div className="w-1/4 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-300">第 1 页 / 共 12 页</span>
            </div>
          </div>
          </div>
        </div>

        <div className="hidden h-full min-h-0 w-[380px] shrink-0 border-l border-gray-200 bg-white lg:flex lg:flex-col xl:w-[420px]">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                {activeAuditTab === "templateRules" ? <Settings size={18} /> : <ClipboardCheck size={18} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {activeAuditTab === "templateRules" ? "模板规则面板" : "报告核查面板"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {activeAuditTab === "templateRules"
                    ? "直接在工作台里调整模板规则，再重新生成报告"
                    : "编辑时同步查看冲突与溯源结果"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 border-b border-gray-100">
            <button
              onClick={() => setActiveAuditTab("conflict")}
              className={`relative flex-1 px-4 py-3 text-xs font-bold transition-colors ${
                activeAuditTab === "conflict" ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              冲突标记 ({conflicts.length})
              {activeAuditTab === "conflict" && (
                <motion.div layoutId="editAuditTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
              )}
            </button>
            <button
              onClick={() => setActiveAuditTab("traceability")}
              className={`relative flex-1 px-4 py-3 text-xs font-bold transition-colors ${
                activeAuditTab === "traceability" ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              报告溯源 ({traces.length})
              {activeAuditTab === "traceability" && (
                <motion.div layoutId="editAuditTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
            <button
              onClick={() => setActiveAuditTab("templateRules")}
              className={`relative flex-1 px-4 py-3 text-xs font-bold transition-colors ${
                activeAuditTab === "templateRules" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              模板规则
              {activeAuditTab === "templateRules" && (
                <motion.div layoutId="editAuditTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            {activeAuditTab === "templateRules" ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">模板规则</p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    这里保留工作台真正需要的模板能力。你可以切换当前模板、上传模板，并直接进入模板规则编辑。
                  </p>
                </div>

                {currentWorkbenchTemplate ? (
                  <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">{currentWorkbenchTemplate.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  currentWorkbenchTemplate.status === "enabled"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {currentWorkbenchTemplate.status === "enabled" ? "已启用" : "已禁用"}
                              </span>
                              <span className="text-[11px] text-gray-400">当前工作台模板</span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-gray-600">{currentWorkbenchTemplate.description}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1"><User size={12} />{currentWorkbenchTemplate.uploader}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{currentWorkbenchTemplate.uploadTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center">
                    <p className="text-sm font-bold text-gray-800">当前还没有可用模板</p>
                    <p className="mt-2 text-xs text-gray-500">可以先上传模板，再回到工作台里编辑规则。</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setShowWorkbenchTemplateSwitcher(true)}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">切换模板</p>
                      <p className="mt-1 text-xs text-gray-500">从“我的模板”已有模板中选择当前工作台使用的模板</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                  <button
                    onClick={() => currentWorkbenchTemplate && openWorkbenchTemplate(currentWorkbenchTemplate)}
                    disabled={!currentWorkbenchTemplate}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">编辑规则</p>
                      <p className="mt-1 text-xs text-gray-500">进入当前模板的字段规则与全局逻辑配置</p>
                    </div>
                    <Edit3 size={16} className="text-blue-500" />
                  </button>
                  <button
                    onClick={() => templateUploadInputRef.current?.click()}
                    disabled={templateUploadStatus !== "idle"}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {templateUploadStatus === "uploading"
                          ? "上传中..."
                          : templateUploadStatus === "parsing"
                            ? "解析中..."
                            : "上传模板"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">新增模板后可直接进入规则编辑</p>
                    </div>
                    {templateUploadStatus === "idle" ? (
                      <Plus size={16} className="text-blue-500" />
                    ) : (
                      <RefreshCw size={16} className="animate-spin text-blue-500" />
                    )}
                  </button>
                  <input
                    ref={templateUploadInputRef}
                    type="file"
                    accept=".doc,.docx,.pdf,.txt"
                    className="hidden"
                    onChange={handleWorkbenchTemplateUpload}
                  />
                </div>
              </div>
            ) : activeAuditTab === "conflict" ? (
              <>
                {conflicts.map((conflict, index) => (
                  <div
                    key={conflict.id}
                    onClick={() => jumpToEditTarget(conflict.targetId, "conflict")}
                    className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-end">
                      <span className="text-[10px] font-mono text-gray-400">#{index + 1}</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">{conflict.type}: {conflict.field}</h4>
                    <p className="mt-1 text-[11px] text-gray-400">定位页码：第 {conflict.page} 页</p>
                    <div className="mt-4 space-y-3">
                      {conflict.sources.map((source) => (
                        <div
                          key={source.id}
                          className={`rounded-xl border p-3 ${
                            source.tone === "warning"
                              ? "border-orange-100 bg-orange-50/60"
                              : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${
                              source.tone === "warning" ? "text-orange-500" : "text-gray-400"
                            }`}>
                              {source.label}
                            </div>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                applyEditConflictSource(conflict.targetId, source.resolvedText);
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              采纳
                            </button>
                          </div>
                          <p className={`mt-2 text-xs ${
                            source.tone === "warning" ? "text-gray-700" : "text-gray-600"
                          }`}>
                            {source.content}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-end border-t border-gray-100 pt-4">
                      <button className="text-[11px] text-gray-400 hover:text-gray-600">忽略</button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {traces.map((trace) => (
                  <div
                    key={trace.id}
                    onClick={() => jumpToEditTarget(trace.targetId, "traceability")}
                    className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-purple-200 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600">{trace.section}</h4>
                      <span className="text-[10px] font-bold text-green-600">{(trace.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <p className="rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">"{trace.content}"</p>
                    <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500">原始出处</div>
                      <p className="mt-1 text-xs text-gray-700">{trace.source}</p>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setMaterialPreview({
                          title: trace.materialTitle,
                          section: trace.section,
                          source: trace.source,
                          excerpt: trace.materialExcerpt,
                          targetId: trace.targetId,
                          tab: "traceability",
                        });
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 py-2 text-[11px] font-bold text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <span>查看原始素材</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <MaterialPreviewDialog
        preview={materialPreview}
        onClose={() => setMaterialPreview(null)}
        onLocate={jumpToEditTarget}
      />

      <AnimatePresence>
        {showWorkbenchTemplateSwitcher && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWorkbenchTemplateSwitcher(false)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-xl rounded-[1.75rem] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">选择工作台模板</h3>
                  <p className="mt-1 text-sm text-slate-500">这里只切换当前报告工作台使用的模板，不会把整个“我的模板”页面搬进来。</p>
                </div>
                <button
                  onClick={() => setShowWorkbenchTemplateSwitcher(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {templates.map((template) => {
                  const isActive = template.id === currentWorkbenchTemplate?.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelectWorkbenchTemplate(template)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                          : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">{template.name}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              template.status === "enabled" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {template.status === "enabled" ? "已启用" : "已禁用"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{template.description}</p>
                      </div>
                      {isActive ? (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">当前</span>
                      ) : (
                        <ChevronRight size={16} className="text-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      <AnimatePresence>
        {templateUploadStatus !== "idle" && activeAuditTab === "templateRules" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-white/30 backdrop-blur-sm"
          >
            <div className="flex min-w-[260px] flex-col items-center gap-5 rounded-3xl bg-white px-8 py-8 shadow-xl">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                {templateUploadStatus === "parsing" && <FileText size={24} className="text-blue-600" />}
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{templateUploadStatus === "uploading" ? "正在上传..." : "正在解析..."}</p>
                <p className="mt-1 text-sm text-gray-500">{templateUploadStatus === "uploading" ? "请稍候，文件传输中" : "AI 正在提取模板结构与内容"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {templateConfirmModal.isOpen && templateConfirmModal.template && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${templateConfirmModal.action === "delete" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  <AlertCircle size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {templateConfirmModal.action === "delete"
                    ? "确认删除模板？"
                    : templateConfirmModal.action === "enable"
                      ? "确认启用模板？"
                      : "确认禁用模板？"}
                </h3>
              </div>
              <p className="mb-6 text-sm leading-6 text-gray-600">
                {templateConfirmModal.action === "delete"
                  ? `您确定要删除模板“${templateConfirmModal.template.name}”吗？此操作不可恢复。`
                  : `您确定要${templateConfirmModal.action === "enable" ? "启用" : "禁用"}模板“${templateConfirmModal.template.name}”吗？`}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setTemplateConfirmModal({ isOpen: false, action: null, template: null })}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={executeWorkbenchTemplateAction}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${templateConfirmModal.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  确认
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {templateEditModal.isOpen && templateEditModal.template && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Edit3 size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">编辑模板信息</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">模板名称</label>
                  <input
                    value={templateEditModal.name}
                    onChange={(event) => setTemplateEditModal((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="请输入模板名称"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">模板描述</label>
                  <textarea
                    value={templateEditModal.description}
                    onChange={(event) => setTemplateEditModal((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="请输入模板描述"
                    className="h-24 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setTemplateEditModal({ isOpen: false, template: null, name: "", description: "" })}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={saveWorkbenchTemplateEdit}
                  disabled={!templateEditModal.name.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {workbenchTemplatePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white"
          >
            <TemplatePreviewView
              template={workbenchTemplatePreview}
              isNew={workbenchPreviewIsNew}
              onBack={() => {
                setWorkbenchTemplatePreview(null);
                setWorkbenchPreviewIsNew(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- DSL Engine View Component ---
