import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Layers,
  Mic,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import type { QuestionCollection, TemplateItem } from "./shared/templateData";
import {
  getReportProjectStatus,
  getReportProjectStatusLabel,
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

const statusStyle: Record<
  ReportProjectStatus,
  {
    description: string;
    action: string;
    badgeClassName: string;
    iconClassName: string;
    rowClassName: string;
  }
> = {
  generating: {
    description: "报告正在生成，点进去可以看进度。",
    action: "查看进度",
    badgeClassName: "border-blue-600 bg-blue-600 text-white",
    iconClassName: "border-blue-200 bg-blue-600 text-white shadow-sm shadow-blue-100",
    rowClassName: "bg-blue-50/75 hover:bg-blue-50",
  },
  generated: {
    description: "报告已经生成，可以查看、编辑或下载。",
    action: "查看报告",
    badgeClassName: "border-green-100 bg-green-50 text-green-600",
    iconClassName: "border-slate-200 bg-white text-blue-600",
    rowClassName: "bg-white hover:bg-slate-50",
  },
  pending: {
    description: "项目已创建，补充资料后就可以生成报告。",
    action: "进入项目",
    badgeClassName: "border-slate-200 bg-white text-slate-500",
    iconClassName: "border-slate-200 bg-white text-slate-500",
    rowClassName: "bg-white hover:bg-slate-50",
  },
};

const statusOrder: Record<ReportProjectStatus, number> = {
  generating: 0,
  pending: 1,
  generated: 2,
};

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
  const enabledTemplateCount = templates.filter((template) => template.status === "enabled").length;
  const totalQuestionCount = questionCollections.reduce((total, collection) => total + collection.questions.length, 0);

  const continueProjects = [...projectRows]
    .sort((left, right) => statusOrder[left.status] - statusOrder[right.status])
    .slice(0, 6);

  const openProject = (project: ReportProject, status: ReportProjectStatus) => {
    onOpenReport({
      ...project,
      reportGenerated: status === "generated",
      reportStatus: status,
    });
  };

  const overviewItems = [
    {
      label: "全部项目",
      value: projects.length,
      desc: "当前所有报告项目",
      icon: ClipboardCheck,
    },
    {
      label: "生成中",
      value: generatingCount,
      desc: "报告正在生成",
      icon: RefreshCw,
    },
    {
      label: "已生成",
      value: generatedCount,
      desc: "可以查看和下载",
      icon: CheckCircle2,
    },
    {
      label: "未生成",
      value: pendingCount,
      desc: "还没开始生成",
      icon: FolderOpen,
    },
  ];

  return (
    <div className="flex min-h-full flex-col bg-[#F6F8FB]">
      <header className="shrink-0 border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-[1480px] px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span>首页</span>
                <span>/</span>
                <span className="text-blue-600">工作台</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">工作台</h1>
              <p className="mt-1 text-sm text-gray-500">
                看项目进度，继续处理还没完成的报告。
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-6 overflow-y-auto p-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {overviewItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate("projectList")}
              className={`group relative overflow-hidden rounded-xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${
                item.label === "生成中" && generatingCount > 0
                  ? "border-blue-200 bg-blue-50/70 shadow-blue-100"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className={`absolute inset-x-0 top-0 h-0.5 ${
                item.label === "生成中" && generatingCount > 0 ? "bg-blue-600" : "bg-slate-100 group-hover:bg-blue-500"
              }`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                  <div className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{item.value}</div>
                </div>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                  item.label === "生成中" && generatingCount > 0
                    ? "border-blue-200 bg-blue-600 text-white"
                    : "border-blue-100 bg-blue-50 text-blue-600"
                }`}>
                  <item.icon size={17} className={item.label === "生成中" && generatingCount > 0 ? "animate-spin" : ""} />
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span>{item.desc}</span>
                {item.label === "生成中" && generatingCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">正在运行</span>
                )}
              </div>
            </button>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">待处理项目</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("projectList")}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                查看全部
                <ArrowRight size={15} />
              </button>
            </div>

            {continueProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                  <PlusCircle size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold text-gray-900">还没有项目</h3>
                <p className="mt-1 text-sm text-slate-500">先新建一个报告项目，后续进度会显示在这里。</p>
                <button
                  type="button"
                  onClick={onNewProject}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
                >
                  <PlusCircle size={16} />
                  新建报告项目
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {continueProjects.map(({ project, status }) => {
                  const meta = statusStyle[status];
                  const ProjectIcon = status === "generating" ? RefreshCw : project.icon;
                  const projectDescription = project.reportStage || meta.description;

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => openProject(project, status)}
                      className={`group relative grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition-all md:grid-cols-[auto_minmax(0,1fr)_minmax(150px,auto)_auto] md:items-center ${meta.rowClassName}`}
                    >
                      {status === "generating" && <span className="absolute inset-y-0 left-0 w-1 bg-blue-600" />}
                      <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border md:flex ${meta.iconClassName}`}>
                        <ProjectIcon size={20} className={status === "generating" ? "animate-spin" : ""} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-bold text-slate-900">{project.title}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${meta.badgeClassName}`}>
                            {status === "generating" ? "正在生成" : getReportProjectStatusLabel(status)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>{project.companyName || "未填写企业"}</span>
                        </div>
                        <p className="mt-2 line-clamp-1 text-sm leading-6 text-slate-600">
                          {projectDescription}
                        </p>
                      </div>
                      <div className="text-xs text-slate-500 md:text-right">
                        {project.createdAt}
                      </div>
                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all group-hover:border-blue-200 group-hover:text-blue-700">
                          {meta.action}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">快捷入口</h2>
            </div>
            <div className="space-y-3 p-5">
              <ResourceCard
                icon={FileText}
                title="报告样例"
                value={`${templates.length} 份`}
                desc={`${enabledTemplateCount} 份可用于新建项目`}
                action="打开"
                onClick={() => onNavigate("templates")}
              />
              <ResourceCard
                icon={Layers}
                title="问题清单"
                value={`${questionCollections.length} 套`}
                desc={`${totalQuestionCount} 个问题可直接选用`}
                action="打开"
                onClick={() => onNavigate("questionLists")}
              />
              <ResourceCard
                icon={Mic}
                title="我的录音"
                value="录音资料"
                desc="查看访谈录音和转写内容"
                action="打开"
                onClick={() => onNavigate("recordings")}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ResourceCard: React.FC<{
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  desc: string;
  action: string;
  onClick: () => void;
}> = ({ icon: Icon, title, value, desc, action, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50/30"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 group-hover:border-blue-100 group-hover:bg-blue-50">
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-lg font-bold tracking-tight text-gray-900">{value}</p>
        </div>
        <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition-colors group-hover:border-blue-200 group-hover:text-blue-700">
          {action}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{desc}</p>
    </div>
  </button>
);
