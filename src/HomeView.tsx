import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  Clock,
  ClipboardCheck,
  FileText,
  Layers3,
  Mic,
  RefreshCw,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { QuestionCollection, TemplateItem } from "./shared/templateData";
import { TEMPLATE_OPTIONS } from "./shared/templateData";
import {
  getReportProjectStatus,
  type ReportProject,
  type ReportProjectStatus,
} from "./shared/projectData";
import heroVisual from "./assets/home-hero-visual.png";
import scenarioCredit from "./assets/scenarios/scenario-credit.png";
import scenarioLeasing from "./assets/scenarios/scenario-leasing.png";
import scenarioNpl from "./assets/scenarios/scenario-npl.png";
import scenarioResearch from "./assets/scenarios/scenario-research.png";

type HomeNavigationTarget = "projectList" | "templates" | "questionLists" | "recordings";

type HomeViewProps = {
  projects: ReportProject[];
  templates: TemplateItem[];
  questionCollections: QuestionCollection[];
  onNavigate: (target: HomeNavigationTarget) => void;
  onCreateProject: (projectName: string, companyName: string, template: string) => void;
  onOpenReport: (report: ReportProject) => void;
};

const statusMeta: Record<
  ReportProjectStatus,
  { phase: string; chipClassName: string }
> = {
  pending: {
    phase: "准备资料",
    chipClassName: "border-blue-100 bg-blue-50 text-blue-600",
  },
  generating: {
    phase: "报告生成中",
    chipClassName: "border-orange-100 bg-orange-50 text-orange-600",
  },
  generated: {
    phase: "报告已生成",
    chipClassName: "border-emerald-100 bg-emerald-50 text-emerald-600",
  },
};

const workflowItems = [
  { step: "1", title: "选择报告样例", desc: "确定报告结构", icon: FileText },
  { step: "2", title: "整理项目资料", desc: "上传资料与录音", icon: ClipboardCheck },
  { step: "3", title: "AI分析资料", desc: "提炼要点与风险", icon: Layers3 },
  { step: "4", title: "补充访谈信息", desc: "完善关键问题", icon: Mic },
  { step: "5", title: "AI生成报告", desc: "查看编辑下载", icon: BriefcaseBusiness },
];

const scenarioItems = [
  {
    title: "银行信贷报告",
    desc: "用于贷款审批、授信决策及企业深度分析，辅助梳理经营情况、影像风险，强化信贷决策能力。",
    theme: "credit",
    imageSrc: scenarioCredit,
  },
  {
    title: "融资租赁报告",
    desc: "适用于企业融资、租赁资质评估与交易结构分析，判断租赁物、租用人经营状况、偿债风险。",
    theme: "lease",
    imageSrc: scenarioLeasing,
  },
  {
    title: "不良资产尽调报告",
    desc: "用于不良资产评估、催收方案制定与风险处置，识别债务与资产风险状况，发掘潜在价值与回收空间。",
    theme: "distressed",
    imageSrc: scenarioNpl,
  },
  {
    title: "投研报告",
    desc: "用于行业研究、投资分析与标的企业跟踪，聚焦企业经营状况与前景，助力投资决策优化。",
    theme: "research",
    imageSrc: scenarioResearch,
  },
] satisfies Array<{
  title: string;
  desc: string;
  theme: "credit" | "lease" | "distressed" | "research";
  imageSrc: string;
}>;

export const HomeView: React.FC<HomeViewProps> = ({
  projects,
  templates,
  questionCollections,
  onNavigate,
  onCreateProject,
  onOpenReport,
}) => {
  const [showDirectNewModal, setShowDirectNewModal] = useState(false);
  const [customProjectName, setCustomProjectName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("bank");
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

  const projectRows = useMemo(
    () =>
      projects.map((project) => ({
        project,
        status: getReportProjectStatus(project, generatedReportIds),
      })),
    [generatedReportIds, projects],
  );

  const recentProjects = projectRows.slice(0, 4);
  const statItems = [
    {
      title: "项目数量",
      value: "128",
      change: "12.5%",
      icon: BriefcaseBusiness,
    },
    {
      title: "报告生成数量",
      value: "86",
      change: "18.7%",
      icon: FileText,
    },
    {
      title: "分析资料数量",
      value: "362",
      change: "9.3%",
      icon: Layers3,
    },
    {
      title: "访谈次数",
      value: "245",
      change: "15.2%",
      icon: Users,
    },
  ];

  const openProject = (project: ReportProject | undefined, status: ReportProjectStatus) => {
    if (!project) {
      onNavigate("projectList");
      return;
    }

    onOpenReport({
      ...project,
      reportGenerated: status === "generated",
      reportStatus: status,
    });
  };

  const handleCreateProject = () => {
    const trimmedProjectName = customProjectName.trim();
    if (!trimmedProjectName) {
      return;
    }

    onCreateProject(trimmedProjectName, newProjectName.trim(), selectedTemplate);
    setShowDirectNewModal(false);
    setCustomProjectName("");
    setNewProjectName("");
    setNewProjectDescription("");
    setSelectedTemplate("bank");
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#f6f9ff] p-3 text-slate-900 sm:p-4 xl:p-5">
      <div className="flex min-h-full w-full flex-col gap-3">
        <section className="relative min-h-[132px] shrink-0 overflow-hidden rounded-xl bg-[#dbeaff] px-5 py-6 shadow-[0_10px_28px_rgba(37,99,235,0.09)] ring-1 ring-blue-100/70 sm:min-h-[156px] sm:px-7 sm:py-8 lg:min-h-[168px] xl:min-h-[178px] xl:px-10 xl:py-9 2xl:min-h-[190px]">
          <div className="absolute inset-0 bg-[linear-gradient(101deg,#eef6ff_0%,#dcecff_38%,#c3dcff_68%,#3f78f4_100%)]" />
          <img
            src={heroVisual}
            alt=""
            className="absolute bottom-0 right-0 hidden h-full w-[73%] object-cover object-right lg:block"
          />
          <div className="absolute inset-y-0 left-0 w-[56%] bg-gradient-to-r from-[#eef6ff] via-[#e5f1ff]/95 to-transparent" />
          <div className="relative z-10 max-w-xl">
            <h1 className="text-2xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-[26px] xl:text-[28px]">欢迎使用小狸报告</h1>
            <p className="mt-4 text-sm font-medium text-slate-700">选择样例、整理资料，一键生成尽调报告</p>
            <button
              type="button"
              onClick={() => setShowDirectNewModal(true)}
              className="mt-5 inline-flex h-9 items-center gap-3 rounded-full bg-blue-600 px-5 text-sm font-medium text-white shadow-[0_10px_18px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 sm:mt-6 xl:mt-6"
            >
              开始新报告
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <section className="shrink-0 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)] ring-1 ring-slate-200/70">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <h2 className="text-base font-bold text-slate-900">适用场景</h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 xl:gap-4">
            {scenarioItems.map((item) => (
              <ScenarioCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="shrink-0 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.055)] ring-1 ring-slate-200/70">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {workflowItems.map((item, index) => (
              <div key={item.step} className="relative">
                <WorkflowCard {...item} />
                {index < workflowItems.length - 1 && (
                  <span className="pointer-events-none absolute -right-4 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-500 xl:flex">
                    <ArrowRight size={23} strokeWidth={2.4} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </section>

        <section className="flex min-h-[320px] flex-1 flex-col rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70">
          <div className="mb-2 flex shrink-0 items-center justify-between px-2 py-1">
            <h2 className="text-base font-semibold text-slate-900">最近处理的项目</h2>
            <button
              type="button"
              onClick={() => onNavigate("projectList")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              查看全部项目
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="grid auto-rows-max grid-cols-1 items-start gap-6 md:grid-cols-2 2xl:grid-cols-4">
            {recentProjects.map((projectCard) => (
              <ProjectCard
                key={projectCard.project.id}
                project={projectCard.project}
                status={projectCard.status}
                onClick={() => openProject(projectCard.project, projectCard.status)}
              />
            ))}
          </div>
        </section>

      </div>

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
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">新建报告项目</h3>
                  <button
                    type="button"
                    onClick={() => setShowDirectNewModal(false)}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="ml-1 text-sm font-bold text-gray-700">
                        名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={customProjectName}
                        onChange={(event) => setCustomProjectName(event.target.value)}
                        placeholder="例如：2024Q3小狸科技流贷尽调方案"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 font-medium text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-sm font-bold text-gray-700">企业名称</label>
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(event) => setNewProjectName(event.target.value)}
                        placeholder="请输入企业名称或信用代码（选填）"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 font-medium text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-sm font-bold text-gray-700">描述</label>
                      <textarea
                        value={newProjectDescription}
                        onChange={(event) => setNewProjectDescription(event.target.value)}
                        placeholder="请输入报告项目描述（选填）"
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 font-medium leading-6 text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-sm font-bold text-gray-700">请选择报告模板</label>
                    <div className="relative">
                      <select
                        value={selectedTemplate}
                        onChange={(event) => setSelectedTemplate(event.target.value)}
                        className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 pr-10 font-medium text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {TEMPLATE_OPTIONS.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.title} - {template.desc}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowDirectNewModal(false)}
                      className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-200"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      disabled={!customProjectName.trim()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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
    </div>
  );
};

const WorkflowCard: React.FC<{
  step: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}> = ({ step, title, desc, icon: Icon }) => (
  <div className="flex min-h-[58px] items-center gap-3 rounded-xl px-2 xl:min-h-[64px]">
    <span className="flex w-4 shrink-0 items-center justify-center text-xs font-semibold text-blue-500">
      {step}
    </span>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
      <Icon size={20} strokeWidth={2} />
    </span>
    <span className="min-w-0">
      <h3 className="whitespace-nowrap text-sm font-semibold tracking-normal text-slate-800">{title}</h3>
      <p className="mt-1 whitespace-nowrap text-xs font-medium text-slate-400">{desc}</p>
    </span>
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}> = ({ title, value, change, icon: Icon }) => (
  <div className="relative min-h-[88px] overflow-hidden rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.055)] ring-1 ring-slate-200/70 xl:min-h-[96px]">
    <div className="flex items-center gap-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Icon size={22} strokeWidth={2} />
      </span>
      <div className="min-w-0 pr-20">
        <p className="whitespace-nowrap text-xs font-semibold text-slate-500">{title}</p>
        <div className="mt-1 text-[26px] font-semibold leading-none tracking-normal text-slate-900">{value}</div>
        <div className="mt-2 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs text-slate-400">
          <span className="font-semibold text-emerald-600">↑ {change}</span>
          <span>较上期</span>
        </div>
      </div>
    </div>
    <div className="absolute bottom-4 right-4 hidden h-8 w-16 items-end lg:flex 2xl:w-20">
      <Sparkline />
    </div>
  </div>
);

const ScenarioCard: React.FC<{
  title: string;
  desc: string;
  theme: "credit" | "lease" | "distressed" | "research";
  imageSrc: string;
}> = ({ title, desc, theme, imageSrc }) => {
  const themeClass = {
    credit: {
      card: "border-blue-200/80 bg-gradient-to-br from-[#eef7ff] via-white to-[#eaf3ff]",
      title: "text-blue-900",
      glow: "bg-blue-200/20",
    },
    lease: {
      card: "border-violet-200/80 bg-gradient-to-br from-[#f4efff] via-white to-[#f0e8ff]",
      title: "text-violet-950",
      glow: "bg-violet-200/20",
    },
    distressed: {
      card: "border-orange-200/80 bg-gradient-to-br from-[#fff1e9] via-white to-[#fff4ef]",
      title: "text-red-950",
      glow: "bg-orange-200/20",
    },
    research: {
      card: "border-emerald-200/80 bg-gradient-to-br from-[#f0faea] via-white to-[#f6fbec]",
      title: "text-emerald-900",
      glow: "bg-emerald-200/20",
    },
  }[theme];

  return (
    <div className={`group relative flex min-h-[168px] overflow-hidden rounded-xl border p-4 shadow-[0_8px_20px_rgba(15,23,42,0.055)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.09)] ${themeClass.card}`}>
      <div className="absolute bottom-3 left-3 top-3 flex w-[46%] items-center justify-center rounded-2xl p-3">
        <span className={`pointer-events-none absolute inset-4 rounded-full blur-2xl ${themeClass.glow}`} />
        <img
          src={imageSrc}
          alt=""
          className="relative z-10 max-h-[132px] max-w-[156px] object-contain drop-shadow-[0_14px_18px_rgba(15,23,42,0.12)]"
          draggable={false}
        />
      </div>
      <div className="relative z-10 ml-auto flex w-[48%] min-w-0 flex-col justify-center">
        <h3 className={`text-base font-bold leading-6 ${themeClass.title}`}>{title}</h3>
        <p className="mt-3 text-xs font-medium leading-5 text-slate-700">{desc}</p>
      </div>
    </div>
  );
};

const Sparkline: React.FC = () => (
  <svg viewBox="0 0 96 48" className="h-full w-full" fill="none" aria-hidden="true">
    <path
      d="M2 39 L15 24 L28 32 L42 10 L58 20 L72 4 L86 15 L94 9"
      stroke="#2563eb"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProjectCard: React.FC<{
  project: ReportProject;
  status: ReportProjectStatus;
  onClick: () => void;
}> = ({ project, status, onClick }) => {
  const meta = statusMeta[status];
  const Icon = project.icon;
  const isGenerating = status === "generating";
  const isGenerated = status === "generated";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-56 cursor-pointer flex-col rounded-2xl border p-6 text-left transition-all hover:-translate-y-1 ${
        isGenerating
          ? "border-blue-200 bg-blue-50/50 shadow-sm hover:border-blue-300 hover:bg-white hover:shadow-lg"
          : isGenerated
            ? "border-gray-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-lg"
            : "border-dashed border-slate-300 bg-slate-50/80 shadow-sm hover:border-slate-400 hover:bg-white hover:shadow-md"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
              isGenerating
                ? "bg-white text-blue-600 ring-blue-100"
                : isGenerated
                  ? "bg-blue-50 text-blue-600 ring-blue-100"
                  : "bg-white text-slate-400 ring-slate-200"
            }`}
          >
            {isGenerating ? <RefreshCw size={22} className="animate-spin" /> : <Icon size={22} />}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className={`truncate text-base font-bold ${status === "pending" ? "text-slate-600" : "text-gray-800"}`}
              title={project.title}
            >
              {project.title}
            </h3>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
              <span
                className="max-w-full truncate rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600"
                title={project.companyName}
              >
                {project.companyName || "未填写公司名称"}
              </span>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.chipClassName}`}>
          {meta.phase}
        </span>
      </div>

      <div className="min-h-0 flex-1">
        <p
          className={`line-clamp-3 text-sm leading-6 ${status === "pending" ? "text-slate-400" : "text-gray-500"}`}
          title={project.desc}
        >
          {isGenerating ? project.reportStage || "报告正在生成" : project.desc || "暂无描述。"}
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
      </div>
    </button>
  );
};
