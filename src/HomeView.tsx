import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock,
  ClipboardCheck,
  FileText,
  Layers3,
  Mic,
  RefreshCw,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { QuestionCollection, TemplateItem } from "./shared/templateData";
import {
  getReportProjectStatus,
  type ReportProject,
  type ReportProjectStatus,
} from "./shared/projectData";
import heroVisual from "./assets/home-hero-visual.png";

type HomeNavigationTarget = "projectList" | "templates" | "questionLists" | "recordings";

type HomeViewProps = {
  projects: ReportProject[];
  templates: TemplateItem[];
  questionCollections: QuestionCollection[];
  onNavigate: (target: HomeNavigationTarget) => void;
  onNewProject: () => void;
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

export const HomeView: React.FC<HomeViewProps> = ({
  projects,
  templates,
  questionCollections,
  onNavigate,
  onNewProject,
  onOpenReport,
}) => {
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
              onClick={onNewProject}
              className="mt-5 inline-flex h-9 items-center gap-3 rounded-full bg-blue-600 px-5 text-sm font-medium text-white shadow-[0_10px_18px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 sm:mt-6 xl:mt-6"
            >
              开始新报告
              <ArrowRight size={18} />
            </button>
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
