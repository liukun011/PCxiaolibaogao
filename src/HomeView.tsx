import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Car,
  Check,
  ClipboardCheck,
  FileText,
  Layers3,
  MoreVertical,
  Stethoscope,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { QuestionCollection, TemplateItem } from "./shared/templateData";
import {
  getReportProjectStatus,
  type ReportProject,
  type ReportProjectStatus,
} from "./shared/projectData";

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
  { label: string; chipClassName: string; buttonClassName: string }
> = {
  pending: {
    label: "访谈中",
    chipClassName: "bg-blue-50 text-blue-600",
    buttonClassName: "bg-blue-50 text-blue-600",
  },
  generating: {
    label: "报告生成中",
    chipClassName: "bg-orange-50 text-orange-600",
    buttonClassName: "bg-orange-50 text-orange-600",
  },
  generated: {
    label: "已完成",
    chipClassName: "bg-emerald-50 text-emerald-600",
    buttonClassName: "bg-emerald-50 text-emerald-600",
  },
};

const workflowItems = [
  { step: "1", title: "AI企业洞察", icon: BarChart3 },
  { step: "2", title: "现场访谈", icon: Users },
  { step: "3", title: "智能生成报告", icon: FileText },
  { step: "4", title: "送审", icon: ClipboardCheck },
];

const statItems = [
  { title: "项目数量", value: "128", change: "12.5%", icon: BriefcaseBusiness },
  { title: "生成报告数量", value: "86", change: "18.7%", icon: FileText },
  { title: "分析资料数量", value: "362", change: "9.3%", icon: Layers3 },
  { title: "访谈次数", value: "245", change: "15.2%", icon: Users },
];

const demoCards = [
  {
    title: "华东制造业调研项目",
    industry: "制造业",
    phase: "现场访谈",
    progress: 60,
    updatedAt: "2024-05-20 14:30",
    icon: Building2,
    status: "pending" as ReportProjectStatus,
  },
  {
    title: "新能源企业尽调报告",
    industry: "新能源",
    phase: "报告生成",
    progress: 75,
    updatedAt: "2024-05-20 11:20",
    icon: Zap,
    status: "generating" as ReportProjectStatus,
  },
  {
    title: "连锁零售门店访谈项目",
    industry: "零售消费",
    phase: "智能生成报告",
    progress: 40,
    updatedAt: "2024-05-19 16:45",
    icon: BriefcaseBusiness,
    status: "generating" as ReportProjectStatus,
  },
  {
    title: "生物医药投资分析",
    industry: "生物医药",
    phase: "送审",
    progress: 90,
    updatedAt: "2024-05-19 09:15",
    icon: Stethoscope,
    status: "generating" as ReportProjectStatus,
  },
  {
    title: "智能汽车行业研究",
    industry: "智能制造",
    phase: "完成",
    progress: 100,
    updatedAt: "2024-05-18 17:30",
    icon: Car,
    status: "generated" as ReportProjectStatus,
  },
  {
    title: "城市商业地产调研",
    industry: "房地产",
    phase: "现场访谈",
    progress: 30,
    updatedAt: "2024-05-18 10:05",
    icon: Building2,
    status: "pending" as ReportProjectStatus,
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  projects,
  templates,
  questionCollections,
  onNavigate,
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

  const recentProjects = demoCards.map((card, index) => {
    const realProject = projectRows[index];
    return {
      ...card,
      project: realProject?.project,
      status: realProject?.status ?? card.status,
    };
  });

  const totalQuestionCount = questionCollections.reduce((total, collection) => total + collection.questions.length, 0);
  const enabledTemplateCount = templates.filter((template) => template.status === "enabled").length;

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
    <div className="min-h-full overflow-y-auto bg-[#f5f8fd] p-5 text-slate-900">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-4">
        <section className="relative min-h-[150px] overflow-hidden rounded-2xl bg-[#0756d8] px-7 py-6 text-white shadow-[0_12px_28px_rgba(37,99,235,0.16)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_26%,rgba(110,193,255,0.55),transparent_26%),linear-gradient(115deg,#0442c8_0%,#0868f0_52%,#0b8dff_100%)]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="absolute -right-6 bottom-0 top-0 hidden w-[46%] items-center justify-center lg:flex">
            <div className="relative h-[120px] w-[380px]">
              <div className="absolute left-[72px] top-6 h-20 w-36 rounded-xl border border-cyan-200/50 bg-white/12 shadow-xl shadow-cyan-300/20 backdrop-blur-md" />
              <div className="absolute right-10 top-1 h-28 w-48 rounded-xl border border-cyan-100/50 bg-white/14 shadow-xl shadow-blue-950/20 backdrop-blur-md">
                <div className="m-3.5 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border-[10px] border-cyan-200/80 border-r-white/20" />
                  <div className="space-y-2">
                    <div className="h-1.5 w-24 rounded-full bg-white/60" />
                    <div className="h-1.5 w-16 rounded-full bg-white/35" />
                    <div className="h-1.5 w-28 rounded-full bg-white/35" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 h-24 w-[168px] rounded-xl border border-cyan-100/50 bg-white/16 p-3.5 shadow-xl backdrop-blur-md">
                <div className="flex h-full items-end gap-2">
                  {[38, 62, 48, 82, 74, 96].map((height) => (
                    <span key={height} className="w-2.5 rounded-t bg-cyan-100/80" style={{ height: height * 0.68 }} />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-4 left-6 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-100/60 bg-white/18 text-base font-black shadow-xl backdrop-blur-md">
                AI
              </div>
            </div>
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl font-bold tracking-normal md:text-3xl">欢迎使用小狸报告</h1>
            <p className="mt-3 text-sm font-medium text-blue-50 md:text-base">从洞察到报告，一站式智能生成</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {workflowItems.map((item, index) => (
            <div key={item.step} className="relative">
              <WorkflowCard {...item} />
              {index < workflowItems.length - 1 && (
                <span className="pointer-events-none absolute -right-6 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#f5f8fd] text-blue-600 xl:flex">
                  <ArrowRight size={27} strokeWidth={3} />
                </span>
              )}
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statItems.map((item, index) => (
            <StatCard
              key={item.title}
              {...item}
              detail={index === 0 ? `${projects.length} 个当前项目` : index === 1 ? `${enabledTemplateCount} 个可用模板` : index === 2 ? `${totalQuestionCount} 个问题项` : "较上周"}
            />
          ))}
        </section>

        <section className="rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70">
          <div className="mb-3 flex items-center justify-between px-2 py-1">
            <h2 className="text-base font-bold text-slate-900">最近处理的项目</h2>
            <button
              type="button"
              onClick={() => onNavigate("projectList")}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              查看全部项目
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {recentProjects.map((projectCard) => (
              <ProjectCard
                key={projectCard.title}
                {...projectCard}
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
  icon: LucideIcon;
}> = ({ step, title, icon: Icon }) => (
  <div className="flex min-h-[82px] items-center gap-3.5 rounded-xl bg-white px-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-200">
      {step}
    </span>
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      <Icon size={25} strokeWidth={2.4} />
    </span>
    <h3 className="whitespace-nowrap text-sm font-medium tracking-normal text-slate-800">{title}</h3>
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  detail: string;
  icon: LucideIcon;
}> = ({ title, value, change, detail, icon: Icon }) => (
  <div className="relative min-h-[108px] overflow-hidden rounded-xl bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70">
    <div className="flex items-center gap-4">
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
      <Icon size={24} strokeWidth={2.2} />
    </span>
    <div className="min-w-0 pr-16">
      <p className="whitespace-nowrap text-xs font-bold text-slate-500">{title}</p>
      <div className="mt-1 text-3xl font-bold leading-none tracking-normal text-slate-900">{value}</div>
      <div className="mt-2.5 flex items-center gap-2 whitespace-nowrap text-xs">
        <span className="font-bold text-emerald-600">↑ {change}</span>
        <span className="text-slate-400">{detail}</span>
      </div>
    </div>
    </div>
    <div className="absolute bottom-4 right-4">
      <Sparkline />
    </div>
  </div>
);

const Sparkline: React.FC = () => (
  <div className="hidden h-9 w-16 shrink-0 items-end lg:flex 2xl:w-20">
    <svg viewBox="0 0 96 48" className="h-full w-full" fill="none" aria-hidden="true">
      <path
        d="M2 39 L15 24 L28 32 L42 10 L58 20 L72 4 L86 15 L94 9"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const ProjectCard: React.FC<{
  title: string;
  industry: string;
  phase: string;
  progress: number;
  updatedAt: string;
  status: ReportProjectStatus;
  icon: LucideIcon;
  onClick: () => void;
}> = ({ title, industry, phase, progress, updatedAt, status, icon: Icon, onClick }) => {
  const meta = statusMeta[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[218px] flex-col rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-100">
            <Icon size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs font-medium text-slate-400">{industry}</p>
          </div>
        </div>
        <MoreVertical size={18} className="shrink-0 text-slate-300" />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-400">当前阶段</span>
          <span className={`rounded-md px-2.5 py-1 font-bold ${meta.chipClassName}`}>{phase}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
          <span className="w-10 text-right text-sm font-bold text-slate-700">{progress}%</span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-xs font-bold text-slate-400">更新时间</p>
        <p className="mt-1.5 text-sm font-medium text-slate-500">{updatedAt}</p>
      </div>

      <div className="mt-auto flex justify-center pt-3">
        <span className={`inline-flex min-w-16 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold ${meta.buttonClassName}`}>
          {status === "generated" && <Check size={15} className="mr-1" />}
          {meta.label}
        </span>
      </div>
    </button>
  );
};
