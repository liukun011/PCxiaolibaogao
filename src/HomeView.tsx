import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  FileText,
  Layers3,
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
  { phase: string; action: string; chipClassName: string; buttonClassName: string }
> = {
  pending: {
    phase: "准备资料",
    action: "进入项目",
    chipClassName: "bg-blue-50 text-blue-600",
    buttonClassName: "bg-blue-50 text-blue-600",
  },
  generating: {
    phase: "生成报告",
    action: "查看进度",
    chipClassName: "bg-orange-50 text-orange-600",
    buttonClassName: "bg-orange-50 text-orange-600",
  },
  generated: {
    phase: "查看报告",
    action: "查看报告",
    chipClassName: "bg-emerald-50 text-emerald-600",
    buttonClassName: "bg-emerald-50 text-emerald-600",
  },
};

const workflowItems = [
  { step: "1", title: "选择报告样例", desc: "确定报告结构", icon: FileText },
  { step: "2", title: "准备项目资料", desc: "上传资料与录音", icon: ClipboardCheck },
  { step: "3", title: "AI资料分析", desc: "提取问题与风险", icon: Layers3 },
  { step: "4", title: "生成报告", desc: "查看编辑下载", icon: BriefcaseBusiness },
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

  const generatingCount = projectRows.filter((item) => item.status === "generating").length;
  const generatedCount = projectRows.filter((item) => item.status === "generated").length;
  const pendingCount = projectRows.filter((item) => item.status === "pending").length;
  const recentProjects = projectRows.slice(0, 6);
  const totalQuestionCount = questionCollections.reduce((total, collection) => total + collection.questions.length, 0);
  const enabledTemplateCount = templates.filter((template) => template.status === "enabled").length;
  const statItems = [
    {
      title: "报告项目",
      value: String(projects.length),
      detail: `${pendingCount} 个未生成`,
      icon: BriefcaseBusiness,
    },
    {
      title: "生成中",
      value: String(generatingCount),
      detail: "正在生成报告",
      icon: ClipboardCheck,
    },
    {
      title: "已生成",
      value: String(generatedCount),
      detail: "可查看和下载",
      icon: FileText,
    },
    {
      title: "可用样例",
      value: String(templates.length),
      detail: `${enabledTemplateCount} 份可用`,
      icon: Layers3,
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

        <section className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workflowItems.map((item, index) => (
            <div key={item.step} className="relative">
              <WorkflowCard {...item} />
              {index < workflowItems.length - 1 && (
                <span className="pointer-events-none absolute -right-5 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#f6f9ff] text-blue-500 xl:flex">
                  <ArrowRight size={24} strokeWidth={2.4} />
                </span>
              )}
            </div>
          ))}
        </section>

        <section className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map((item, index) => (
            <StatCard
              key={item.title}
              {...item}
              subDetail={index === 3 ? `${totalQuestionCount} 个问题项` : undefined}
            />
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

          <div className="grid auto-rows-max grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
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
  <div className="flex min-h-[68px] items-center gap-3.5 rounded-xl bg-white px-4 shadow-[0_8px_20px_rgba(15,23,42,0.055)] ring-1 ring-slate-200/70 xl:min-h-[74px]">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 ring-1 ring-blue-100">
      {step}
    </span>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
      <Icon size={22} strokeWidth={2} />
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
  detail: string;
  subDetail?: string;
  icon: LucideIcon;
}> = ({ title, value, detail, subDetail, icon: Icon }) => (
  <div className="relative min-h-[88px] overflow-hidden rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.055)] ring-1 ring-slate-200/70 xl:min-h-[96px]">
    <div className="flex items-center gap-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Icon size={22} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="whitespace-nowrap text-xs font-semibold text-slate-500">{title}</p>
        <div className="mt-1 text-[26px] font-semibold leading-none tracking-normal text-slate-900">{value}</div>
        <div className="mt-2 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs text-slate-400">
          <span className="truncate">{detail}</span>
          {subDetail && <span className="truncate">{subDetail}</span>}
        </div>
      </div>
    </div>
  </div>
);

const ProjectCard: React.FC<{
  project: ReportProject;
  status: ReportProjectStatus;
  onClick: () => void;
}> = ({ project, status, onClick }) => {
  const meta = statusMeta[status];
  const Icon = project.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[216px] flex-col rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-200 2xl:min-h-[232px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <Icon size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-semibold text-slate-900">{project.title}</h3>
            <p className="mt-1 text-xs font-medium text-slate-400">{project.companyName || "未填写企业"}</p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-400">当前状态</span>
          <span className={`rounded-md px-2.5 py-1 font-semibold ${meta.chipClassName}`}>{meta.phase}</span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-500">
          {status === "generating" ? project.reportStage || "报告正在生成" : project.desc || "暂无项目描述"}
        </p>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-xs font-semibold text-slate-400">更新时间</p>
        <p className="mt-1.5 text-sm font-medium text-slate-500">{project.createdAt}</p>
      </div>

      <div className="mt-auto flex justify-center pt-3">
        <span className={`inline-flex min-w-16 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold ${meta.buttonClassName}`}>
          {status === "generated" && <Check size={15} className="mr-1" />}
          {meta.action}
        </span>
      </div>
    </button>
  );
};
