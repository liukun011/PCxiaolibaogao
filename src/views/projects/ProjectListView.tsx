﻿import React, { useEffect, useRef, useState } from "react";
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
  TEMPLATE_QUESTION_SETS,
  createDefaultField,
  getTemplateCategoryTitle,
  type FieldConfig,
  type InterviewQuestion,
  type QuestionCollection,
  type TemplateItem,
} from "@/src/shared/templateData";
import {
  getReportProjectStatus,
  getReportProjectStatusLabel,
  type ReportProject,
  type ReportProjectStatus,
} from "@/src/shared/projectData";

export const ProjectListView = ({
  onSelectProject,
  onStartIntelligence,
  onDirectNew,
  projects,
  setProjects,
  createRequest = 0,
  onCreateRequestHandled,
}: {
  onSelectProject: (project: ReportProject) => void,
  onStartIntelligence: () => void,
  onDirectNew: (projectName: string, companyName: string, template: string, initialQuestions: any[], targetType?: string, targetCode?: string, enableAI?: boolean) => void,
  projects: ReportProject[],
  setProjects: React.Dispatch<React.SetStateAction<ReportProject[]>>,
  createRequest?: number,
  onCreateRequestHandled?: () => void,
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [showDirectNewModal, setShowDirectNewModal] = useState(false);
  const [customProjectName, setCustomProjectName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("bank");
  const [targetType, setTargetType] = useState<"company" | "individual">("company");
  const [targetCode, setTargetCode] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    title: "",
    desc: "",
  });
  const [generatedReportIds, setGeneratedReportIds] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem("generatedReportIds") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const refreshGeneratedReportIds = () => {
      try {
        setGeneratedReportIds(JSON.parse(window.localStorage.getItem("generatedReportIds") || "[]"));
      } catch {
        setGeneratedReportIds([]);
      }
    };

    window.addEventListener("focus", refreshGeneratedReportIds);
    window.addEventListener("storage", refreshGeneratedReportIds);

    return () => {
      window.removeEventListener("focus", refreshGeneratedReportIds);
      window.removeEventListener("storage", refreshGeneratedReportIds);
    };
  }, []);

  useEffect(() => {
    if (createRequest > 0) {
      setShowDirectNewModal(true);
      onCreateRequestHandled?.();
    }
  }, [createRequest, onCreateRequestHandled]);

  const handleCreateProject = () => {
    if (!customProjectName.trim()) {
      return;
    }

    const trimmedProjectName = customProjectName.trim();
    const trimmedCompanyName = newProjectName.trim();

    setProjects((previous) => [
      {
        id: Math.max(0, ...previous.map((project) => project.id)) + 1,
        title: trimmedProjectName,
        companyName: trimmedCompanyName || "未填写企业",
        desc: trimmedCompanyName
          ? `企业名称为“${trimmedCompanyName}”，已创建报告项目，待补充资料并生成报告。`
          : "已创建报告项目，待补充企业信息、资料和问题清单后生成报告。",
        createdBy: "当前用户",
        createdAt: new Date().toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).replace(/\//g, "-"),
        icon: ClipboardCheck,
        reportGenerated: false,
      },
      ...previous,
    ]);

    onDirectNew(
      trimmedProjectName,
      trimmedCompanyName,
      selectedTemplate,
      [...TEMPLATE_QUESTION_SETS[selectedTemplate]],
      targetType,
      targetCode,
      true,
    );
    setShowDirectNewModal(false);
    setCustomProjectName("");
    setNewProjectName("");
    setNewProjectDescription("");
    setTargetType("company");
    setTargetCode("");
  };

  const handleEditProject = (event: React.MouseEvent, project: ReportProject) => {
    event.stopPropagation();
    setEditingProjectId(project.id);
    setEditProjectForm({
      title: project.title,
      desc: project.desc,
    });
  };

  const handleSaveProjectInfo = () => {
    if (!editingProjectId || !editProjectForm.title.trim()) {
      return;
    }

    setProjects((previous) =>
      previous.map((project) =>
        project.id === editingProjectId
          ? {
              ...project,
              title: editProjectForm.title.trim(),
              desc: editProjectForm.desc.trim(),
            }
          : project,
      ),
    );
    setEditingProjectId(null);
  };

  const handleDeleteProject = (event: React.MouseEvent, projectTitle: string) => {
    event.stopPropagation();
    window.confirm(`确认删除尽调项目“${projectTitle}”吗？`);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-gray-100 shrink-0">
        <h1 className="text-base font-bold text-gray-800">报告管理</h1>
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
              <span>新建报告项目</span>
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
                  <h3 className="text-base font-bold text-gray-900">新建报告项目</h3>
                  <button onClick={() => setShowDirectNewModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          名称 <span className="text-red-500">*</span>
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
                          企业名称
                        </label>
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="请输入企业名称或信用代码（选填）"
                          className="w-full py-3 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                          描述
                        </label>
                        <textarea
                          value={newProjectDescription}
                          onChange={(e) => setNewProjectDescription(e.target.value)}
                          placeholder="请输入报告项目描述（选填）"
                          rows={3}
                          className="w-full resize-none py-3 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium leading-6"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">请选择报告模板</label>
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

      <AnimatePresence>
        {editingProjectId !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProjectId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 px-7 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">编辑报告基本信息</h3>
                  </div>
                  <button
                    onClick={() => setEditingProjectId(null)}
                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-5 px-7 py-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    报告项目名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={editProjectForm.title}
                    onChange={(event) => setEditProjectForm((previous) => ({ ...previous, title: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="请输入报告项目名称"
                    required
                  />
                  {!editProjectForm.title.trim() && (
                    <p className="text-xs font-medium text-red-500">报告项目名称为必填项。</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">描述</label>
                  <textarea
                    value={editProjectForm.desc}
                    onChange={(event) => setEditProjectForm((previous) => ({ ...previous, desc: event.target.value }))}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="请输入报告项目描述（选填）"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-7 py-5">
                <button
                  onClick={() => setEditingProjectId(null)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveProjectInfo}
                  disabled={!editProjectForm.title.trim()}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  保存
                </button>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {projects.map((project) => {
            const reportStatus: ReportProjectStatus = getReportProjectStatus(project, generatedReportIds);
            const reportStatusTitle =
              reportStatus === "generated" ? "报告已生成" : reportStatus === "generating" ? "报告生成中" : "报告未生成";

            return (
              <motion.div
                key={project.id}
                whileHover={{ y: -4, boxShadow: "0 18px 40px -24px rgba(15, 23, 42, 0.35)" }}
                onClick={() =>
                  onSelectProject({
                    ...project,
                    reportGenerated: reportStatus === "generated",
                    reportStatus,
                  })
                }
                className={`group flex h-56 cursor-pointer flex-col rounded-2xl border p-6 transition-all ${
                  reportStatus === "generating"
                    ? "border-blue-200 bg-blue-50/50 shadow-sm hover:border-blue-300 hover:bg-white hover:shadow-lg"
                    : reportStatus === "generated"
                      ? "border-gray-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-lg"
                      : "border-dashed border-slate-300 bg-slate-50/80 shadow-sm hover:border-slate-400 hover:bg-white hover:shadow-md"
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
                      reportStatus === "generating"
                        ? "bg-white text-blue-600 ring-blue-100"
                        : reportStatus === "generated"
                          ? "bg-blue-50 text-blue-600 ring-blue-100"
                          : "bg-white text-slate-400 ring-slate-200"
                    }`}>
                      {reportStatus === "generating" ? <RefreshCw size={22} className="animate-spin" /> : <project.icon size={22} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`truncate text-base font-bold ${
                        reportStatus === "pending" ? "text-slate-600" : "text-gray-800"
                      }`} title={project.title}>
                        {project.title}
                      </h3>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="max-w-full truncate rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600" title={project.companyName}>
                          {project.companyName || "未填写公司名称"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${
                      reportStatus === "generated"
                        ? "border-green-100 bg-green-50 text-green-600"
                        : reportStatus === "generating"
                          ? "border-blue-100 bg-blue-50 text-blue-600"
                          : "border-slate-200 bg-white text-slate-500"
                    }`}
                    title={reportStatusTitle}
                  >
                    {getReportProjectStatusLabel(reportStatus)}
                  </span>
                </div>

                <div className="min-h-0 flex-1">
                  <p className={`line-clamp-3 text-sm leading-6 ${
                    reportStatus === "pending" ? "text-slate-400" : "text-gray-500"
                  }`} title={project.desc}>
                    {project.desc || "暂无描述。"}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
                  <div className="min-w-0 flex-1 text-xs text-gray-400">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <User size={12} className="shrink-0" />
                        <span className="truncate">{project.createdBy}</span>
                      </span>
                      <span className="h-3 w-px shrink-0 bg-gray-200" />
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Clock size={12} className="shrink-0" />
                        <span className="truncate">{project.createdAt}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => handleEditProject(event, project)}
                      className="rounded-md p-1.5 text-blue-500 transition-colors hover:bg-blue-50"
                      title="编辑报告名称"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => handleDeleteProject(event, project.title)}
                      className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// Dashboard View Component (Project Detail)
