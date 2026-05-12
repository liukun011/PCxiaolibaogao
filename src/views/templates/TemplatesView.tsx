import React, { useEffect, useRef, useState } from "react";
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
import { DocumentClassificationSection } from "@/src/components/DocumentClassificationSection";
import { DocxToolbar } from "@/src/components/DocxToolbar";
import { MaterialPreviewDialog, type MaterialPreviewData } from "@/src/components/MaterialPreviewDialog";
import { mockInterview, type InterviewRecord, type InterviewTranscript, type DDQuestion } from "@/src/types";
import {
  TEMPLATE_OPTIONS,
  TEMPLATE_SCOPE_OPTIONS,
  TEMPLATE_QUESTION_SETS,
  createDefaultField,
  getTemplateCategoryTitle,
  getTemplateScopeTitle,
  type FieldConfig,
  type InterviewQuestion,
  type QuestionCollection,
  type TemplateItem,
  type TemplateScope,
} from "@/src/shared/templateData";
export const TemplatesView = ({
  templates,
  setTemplates,
  onOpenTemplate,
}: {
  templates: TemplateItem[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateItem[]>>;
  onOpenTemplate: (template: TemplateItem, isNew?: boolean) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleInputRef = useRef<HTMLInputElement>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [uploadModal, setUploadModal] = useState<{
    isOpen: boolean;
    category: string;
    applicationScope: TemplateScope;
    name: string;
    description: string;
    file: File | null;
  }>({ isOpen: false, category: TEMPLATE_OPTIONS[0].id, applicationScope: "personal", name: "", description: "", file: null });
  const [uploadModalError, setUploadModalError] = useState("");
  const uploadTimersRef = useRef<number[]>([]);
  const [sampleGenerateModal, setSampleGenerateModal] = useState<{
    isOpen: boolean;
    category: string;
    applicationScope: TemplateScope;
    name: string;
    description: string;
    files: File[];
  }>({ isOpen: false, category: TEMPLATE_OPTIONS[0].id, applicationScope: "personal", name: "", description: "", files: [] });
  const [sampleGenerateError, setSampleGenerateError] = useState("");
  const sampleGenerateTimersRef = useRef<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "enable" | "disable" | "delete" | null;
    template: TemplateItem | null;
  }>({ isOpen: false, action: null, template: null });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    template: TemplateItem | null;
    category: string;
    name: string;
    description: string;
  }>({ isOpen: false, template: null, category: TEMPLATE_OPTIONS[0].id, name: "", description: "" });

  useEffect(() => {
    return () => {
      uploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      sampleGenerateTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const filteredTemplates = templates.filter((template) =>
    [template.name, template.description, template.uploader, template.category, getTemplateScopeTitle(template.applicationScope)]
      .join(" ")
      .toLowerCase()
      .includes(searchKeyword.trim().toLowerCase()),
  );

  const handleUploadClick = () => {
    setUploadModal({
      isOpen: true,
      category: TEMPLATE_OPTIONS[0].id,
      applicationScope: "personal",
      name: "",
      description: "",
      file: null,
    });
    setUploadModalError("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const isAllowedFile = file && /\.(doc|docx|md)$/i.test(file.name);

    if (file && !isAllowedFile) {
      setUploadModal((prev) => ({ ...prev, file: null }));
      setUploadModalError("仅支持上传 Word 或 MD 文件");
      event.target.value = "";
      return;
    }

    setUploadModal((prev) => ({
      ...prev,
      file: file ?? null,
      name: prev.name || (file ? file.name.replace(/\.[^/.]+$/, "") : prev.name),
    }));
    setUploadModalError("");
  };

  const closeUploadModal = () => {
    setUploadModal({
      isOpen: false,
      category: TEMPLATE_OPTIONS[0].id,
      applicationScope: "personal",
      name: "",
      description: "",
      file: null,
    });
    setUploadModalError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitTemplateUpload = () => {
    if (!uploadModal.category.trim()) {
      setUploadModalError("请选择模板分类");
      return;
    }

    if (!uploadModal.name.trim()) {
      setUploadModalError("请输入模板名称");
      return;
    }

    if (!uploadModal.file) {
      setUploadModalError("请选择本机模板文件");
      return;
    }

    if (!/\.(doc|docx|md)$/i.test(uploadModal.file.name)) {
      setUploadModalError("仅支持上传 Word 或 MD 文件");
      return;
    }

    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const nextTemplate: TemplateItem = {
      id: `tpl-${Date.now()}`,
      name: uploadModal.name.trim(),
      description: uploadModal.description.trim() || "用户上传的自定义模板。",
      uploader: "当前用户",
      uploadTime: formatted,
      status: "parsing" as any,
      category: uploadModal.category,
      applicationScope: uploadModal.applicationScope,
    };

    setTemplates((prev) => [nextTemplate, ...prev]);
    setUploadModal({
      isOpen: false,
      category: TEMPLATE_OPTIONS[0].id,
      applicationScope: "personal",
      name: "",
      description: "",
      file: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const finishTimer = window.setTimeout(() => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === nextTemplate.id ? { ...t, status: "enabled" } : t)),
      );
    }, 5000);

    uploadTimersRef.current.push(finishTimer);
  };

  const handleSampleGenerateClick = () => {
    setSampleGenerateModal({
      isOpen: true,
      category: TEMPLATE_OPTIONS[0].id,
      applicationScope: "personal",
      name: "",
      description: "",
      files: [],
    });
    setSampleGenerateError("");
  };

  const handleSampleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const invalidFile = files.find((file) => !/\.(doc|docx|md|pdf)$/i.test(file.name));

    if (invalidFile) {
      setSampleGenerateModal((prev) => ({ ...prev, files: [] }));
      setSampleGenerateError("仅支持上传 Word、PDF 或 MD 样例文件");
      event.target.value = "";
      return;
    }

    setSampleGenerateModal((prev) => ({
      ...prev,
      files,
      name: prev.name || (files[0] ? `${files[0].name.replace(/\.[^/.]+$/, "")}模板` : prev.name),
    }));
    setSampleGenerateError(files.length > 0 && files.length < 2 ? "请至少选择 2 个样例文件" : "");
  };

  const closeSampleGenerateModal = () => {
    setSampleGenerateModal({
      isOpen: false,
      category: TEMPLATE_OPTIONS[0].id,
      applicationScope: "personal",
      name: "",
      description: "",
      files: [],
    });
    setSampleGenerateError("");
    if (sampleInputRef.current) {
      sampleInputRef.current.value = "";
    }
  };

  const submitSampleGenerate = () => {
    if (!sampleGenerateModal.category.trim()) {
      setSampleGenerateError("请选择模板分类");
      return;
    }

    if (!sampleGenerateModal.name.trim()) {
      setSampleGenerateError("请输入模板名称");
      return;
    }

    if (sampleGenerateModal.files.length < 2) {
      setSampleGenerateError("请至少选择 2 个样例文件");
      return;
    }

    if (sampleGenerateModal.files.some((file) => !/\.(doc|docx|md|pdf)$/i.test(file.name))) {
      setSampleGenerateError("仅支持上传 Word、PDF 或 MD 样例文件");
      return;
    }

    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const nextTemplate: TemplateItem = {
      id: `tpl-${Date.now()}`,
      name: sampleGenerateModal.name.trim(),
      description: sampleGenerateModal.description.trim() || `基于 ${sampleGenerateModal.files.length} 个样例生成的模板。`,
      uploader: "当前用户",
      uploadTime: formatted,
      status: "parsing" as any,
      category: sampleGenerateModal.category,
      applicationScope: sampleGenerateModal.applicationScope,
    };

    setTemplates((prev) => [nextTemplate, ...prev]);
    setSampleGenerateModal({
      isOpen: false,
      category: TEMPLATE_OPTIONS[0].id,
      applicationScope: "personal",
      name: "",
      description: "",
      files: [],
    });
    if (sampleInputRef.current) {
      sampleInputRef.current.value = "";
    }

    const finishTimer = window.setTimeout(() => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === nextTemplate.id ? { ...t, status: "enabled" } : t)),
      );
    }, 8000);

    sampleGenerateTimersRef.current.push(finishTimer);
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
      category: template.category || TEMPLATE_OPTIONS[0].id,
      name: template.name,
      description: template.description,
    });
  };

  const saveEdit = () => {
    if (!editModal.template || !editModal.category.trim() || !editModal.name.trim()) return;
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === editModal.template?.id
          ? {
              ...item,
              category: editModal.category,
              name: editModal.name.trim(),
              description: editModal.description.trim(),
            }
          : item,
      ),
    );
    setEditModal({ isOpen: false, template: null, category: TEMPLATE_OPTIONS[0].id, name: "", description: "" });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">我的模板</h1>
          <p className="mt-2 text-sm text-gray-500">模板的业务规则是否合理，决定报告生成的准确性。</p>
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
            onClick={handleSampleGenerateClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <Sparkles size={16} />
            <span>通过样例生成</span>
          </button>
          <button
            onClick={handleUploadClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus size={16} />
            <span>上传模板</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredTemplates.map((template) => {
            const isParsing = (template.status as string) === "parsing";
            return (
              <div
                key={template.id}
                onClick={() => {
                  if (!isParsing) onOpenTemplate(template);
                }}
                className={`group flex h-56 flex-col rounded-2xl border p-6 transition-all ${
                  isParsing
                    ? "border-gray-200 bg-gray-50/50 cursor-not-allowed"
                    : template.status === "enabled"
                      ? "border-gray-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-lg cursor-pointer"
                      : "border-dashed border-slate-300 bg-slate-50/80 shadow-sm hover:border-slate-400 hover:bg-white hover:shadow-md cursor-pointer"
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
                      isParsing
                        ? "bg-gray-100 text-gray-400 ring-gray-200"
                        : template.status === "enabled"
                          ? "bg-blue-50 text-blue-600 ring-blue-100"
                          : "bg-white text-slate-400 ring-slate-200"
                    }`}>
                      {isParsing ? <RefreshCw size={22} className="animate-spin" /> : <FileText size={22} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`truncate text-base font-bold ${template.status === "enabled" ? "text-gray-800" : "text-slate-600"} ${isParsing ? "opacity-60" : ""}`}
                        title={template.name}
                      >
                        {template.name}
                      </h3>
                      <div className={`mt-1 flex min-w-0 flex-wrap items-center gap-1.5 ${isParsing ? "opacity-60" : ""}`}>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          {getTemplateCategoryTitle(template.category)}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                          {getTemplateScopeTitle(template.applicationScope)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${
                    isParsing
                      ? "border-blue-100 bg-blue-50 text-blue-600"
                      : template.status === "enabled"
                        ? "border-green-100 bg-green-50 text-green-600"
                        : "border-slate-200 bg-white text-slate-500"
                  }`}>
                    {isParsing ? "解析中" : template.status === "enabled" ? "已启用" : "已禁用"}
                  </span>
                </div>

                <div className="min-h-0 flex-1">
                  <p className={`line-clamp-3 text-sm leading-6 ${template.status === "enabled" ? "text-gray-500" : "text-slate-400"} ${isParsing ? "opacity-60" : ""}`} title={template.description}>
                    {template.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                  <div className={`min-w-0 flex-1 text-xs ${template.status === "enabled" ? "text-gray-400" : "text-slate-400"} ${isParsing ? "opacity-60" : ""}`}>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <User size={12} className="shrink-0" />
                        <span className="truncate">{template.uploader}</span>
                      </span>
                      <span className="h-3 w-px shrink-0 bg-gray-200" />
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Clock size={12} className="shrink-0" />
                        <span className="truncate">{template.uploadTime}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isParsing) return;
                        openConfirmModal(template.status === "enabled" ? "disable" : "enable", template);
                      }}
                      disabled={isParsing}
                      className={`rounded-md p-1.5 transition-colors ${isParsing ? "text-gray-300 cursor-not-allowed" : template.status === "enabled" ? "text-amber-500 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                      title={template.status === "enabled" ? "禁用模板" : "启用模板"}
                    >
                      {template.status === "enabled" ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isParsing) return;
                        openEditModal(template);
                      }}
                      disabled={isParsing}
                      className={`rounded-md p-1.5 transition-colors ${isParsing ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-blue-50"}`}
                      title="编辑模板"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isParsing) return;
                        openConfirmModal("delete", template);
                      }}
                      disabled={isParsing}
                      className={`rounded-md p-1.5 transition-colors ${isParsing ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:bg-red-50"}`}
                      title="删除模板"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
        {uploadModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={closeUploadModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">上传模板</h3>
                  <p className="mt-1 text-sm text-gray-500">补充基础信息后，上传本机模板文件生成模板。</p>
                </div>
                <button
                  onClick={closeUploadModal}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    模板分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadModal.category}
                    onChange={(event) =>
                      setUploadModal((prev) => ({ ...prev, category: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white"
                  >
                    {TEMPLATE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    应用范围 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TEMPLATE_SCOPE_OPTIONS.map((option) => {
                      const isActive = uploadModal.applicationScope === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setUploadModal((prev) => ({ ...prev, applicationScope: option.id }))
                          }
                          className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-colors ${
                            isActive
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-white"
                          }`}
                        >
                          {option.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    模板名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={uploadModal.name}
                    onChange={(event) =>
                      setUploadModal((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="请输入模板名称，最多50个字符"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">模板描述</label>
                  <textarea
                    value={uploadModal.description}
                    onChange={(event) =>
                      setUploadModal((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="请输入模板描述，最多300个字符"
                    className="min-h-24 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    模板文件 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-4 text-left transition-colors hover:bg-blue-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-gray-800">
                        {uploadModal.file?.name || "选择本机模板文件"}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">支持 .doc、.docx</span>
                    </span>
                    <Upload size={18} className="shrink-0 text-blue-600" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {uploadModalError && (
                  <p className="text-xs font-medium text-red-500">{uploadModalError}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeUploadModal}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={submitTemplateUpload}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>上传生成模板</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {sampleGenerateModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={closeSampleGenerateModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">通过样例生成模板</h3>
                  <p className="mt-1 text-sm text-gray-500">上传多个报告样例，生成可复用的模板配置。</p>
                </div>
                <button
                  onClick={closeSampleGenerateModal}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    模板分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={sampleGenerateModal.category}
                    onChange={(event) =>
                      setSampleGenerateModal((prev) => ({ ...prev, category: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white"
                  >
                    {TEMPLATE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    应用范围 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TEMPLATE_SCOPE_OPTIONS.map((option) => {
                      const isActive = sampleGenerateModal.applicationScope === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setSampleGenerateModal((prev) => ({ ...prev, applicationScope: option.id }))
                          }
                          className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-colors ${
                            isActive
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-white"
                          }`}
                        >
                          {option.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    模板名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={sampleGenerateModal.name}
                    onChange={(event) =>
                      setSampleGenerateModal((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="请输入模板名称，最多50个字符"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">模板描述</label>
                  <textarea
                    value={sampleGenerateModal.description}
                    onChange={(event) =>
                      setSampleGenerateModal((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="请输入模板描述，最多300个字符"
                    className="min-h-24 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    样例文件 <span className="text-red-500">*</span>
                  </label>
                  <p className="mb-2 text-xs text-gray-500">至少选择 2 个样例文件。</p>
                  <button
                    type="button"
                    onClick={() => sampleInputRef.current?.click()}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-4 text-left transition-colors hover:bg-blue-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-gray-800">
                        {sampleGenerateModal.files.length > 0
                          ? `已选择 ${sampleGenerateModal.files.length} 个样例文件`
                          : "选择本机样例文件"}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">支持 .doc、.docx、.pdf、.md</span>
                    </span>
                    <Upload size={18} className="shrink-0 text-blue-600" />
                  </button>
                  {sampleGenerateModal.files.length > 0 && (
                    <div className="mt-2 max-h-28 space-y-1 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-3">
                      {sampleGenerateModal.files.map((file) => (
                        <div key={`${file.name}-${file.lastModified}`} className="flex items-center gap-2 text-xs text-gray-600">
                          <FileIcon size={14} className="shrink-0 text-blue-500" />
                          <span className="min-w-0 flex-1 truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    ref={sampleInputRef}
                    type="file"
                    multiple
                    accept=".doc,.docx,.pdf,.md"
                    className="hidden"
                    onChange={handleSampleFilesChange}
                  />
                </div>

                {sampleGenerateError && (
                  <p className="text-xs font-medium text-red-500">{sampleGenerateError}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeSampleGenerateModal}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={submitSampleGenerate}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <Sparkles size={16} />
                  <span>生成模板</span>
                </button>
              </div>
            </motion.div>
          </div>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    模板分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editModal.category}
                    onChange={(event) => setEditModal((prev) => ({ ...prev, category: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  >
                    {TEMPLATE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    模板名称 <span className="text-red-500">*</span>
                  </label>
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
                  onClick={() => setEditModal({ isOpen: false, template: null, category: TEMPLATE_OPTIONS[0].id, name: "", description: "" })}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={saveEdit}
                  disabled={!editModal.category.trim() || !editModal.name.trim()}
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
