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
import { loadDocxDeps } from "./utils/loadDocxDeps";
import { SidebarItem } from "./components/SidebarItem";
import { AuditView } from "./views/audit/AuditView";
import { DashboardView } from "./views/dashboard/DashboardView";
import { IntelligenceView } from "./views/intelligence/IntelligenceView";
import { ProjectListView } from "./views/projects/ProjectListView";
import { QuestionListView } from "./views/questionLists/QuestionListView";
import { EditReportView } from "./views/report/EditReportView";
import { TemplatePreviewView } from "./views/templates/TemplatePreviewView";
import { TemplatesView } from "./views/templates/TemplatesView";
import {
  INITIAL_TEMPLATE_ITEMS,
  TEMPLATE_OPTIONS,
  TEMPLATE_QUESTION_SETS,
  type QuestionCollection,
  type TemplateItem,
  type ViewType,
} from "./shared/templateData";

export default function App() {
  const initialUrlParams = new URLSearchParams(window.location.search);
  const requestedView = initialUrlParams.get("view");
  const requestedTemplateId = initialUrlParams.get("templateId");
  const requestedReportTitle = initialUrlParams.get("reportTitle");
  const requestedCompanyName = initialUrlParams.get("companyName");
  const initialStandaloneShell = requestedView === "dashboard" || requestedView === "templatePreview";
  const initialView: ViewType =
    requestedView === "dashboard" || requestedView === "templatePreview" ? requestedView : "projectList";

  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [standaloneShell, setStandaloneShell] = useState(initialStandaloneShell);
  const [editInitialTab, setEditInitialTab] = useState<"conflict" | "traceability">("conflict");
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
  const [intelligenceInitialStep, setIntelligenceInitialStep] = useState<"input" | "confirm" | "loading" | "result">("input");
  const [intelligenceResult, setIntelligenceResult] = useState<any>(() =>
    requestedView === "dashboard"
      ? {
          projectName: requestedReportTitle || "未命名尽调项目",
          companyName: requestedCompanyName || requestedReportTitle || "",
          isSkip: true,
          isPending: false,
          questions: [],
          template: "bank",
        }
      : null,
  );
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

  const openDashboardInNewTab = (project: { id: number; title: string; desc: string }) => {
    const params = new URLSearchParams({
      view: "dashboard",
      reportId: String(project.id),
      reportTitle: project.title,
      companyName: project.title,
    });
    window.open(`${window.location.pathname}?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const openTemplateInNewTab = (template: TemplateItem) => {
    const params = new URLSearchParams({
      view: "templatePreview",
      templateId: template.id,
    });
    window.open(`${window.location.pathname}?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const showSidebar = !standaloneShell;

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-sans overflow-hidden">
      {/* Sidebar */}
      {showSidebar && <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <BrainCircuit size={20} />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">星启</span>
        </div>

        <nav className="flex-1 py-4">
          <SidebarItem icon={ClipboardCheck} label="尽调管理" active={currentView === "projectList" || currentView === "dashboard"} onClick={() => {
            setStandaloneShell(false);
            setCurrentView("projectList");
          }} />
          <SidebarItem icon={BookOpen} label="我的模板" active={currentView === "templates"} onClick={() => {
            setStandaloneShell(false);
            setCurrentView("templates");
          }} />
          <SidebarItem
            icon={HelpCircle}
            label="问题清单"
            active={currentView === "questionLists"}
            onClick={() => {
              setStandaloneShell(false);
              setCurrentView("questionLists");
            }}
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
      </aside>}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {currentView === "projectList" && (
          <ProjectListView
            onSelectProject={openDashboardInNewTab}
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
              setStandaloneShell(false);
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
              window.history.replaceState(null, "", window.location.pathname);
              setStandaloneShell(false);
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
              const template = templates.find((item) => item.id === intelligenceResult?.template) || templates[0];
              if (template) {
                openTemplateInNewTab(template);
              }
            }}
            initialSection={dashboardSection}
            onSectionHandled={() => setDashboardSection(null)}
            questionCollections={questionCollections}
            setQuestionCollections={setQuestionCollections}
            templates={templates}
            onPreviewTemplate={openTemplateInNewTab}
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
              openTemplateInNewTab(template);
              if (isNew) {
                setSelectedTemplate(template);
                setIsNewTemplatePreview(true);
              }
            }}
          />
        )}

        {currentView === "templatePreview" && (selectedTemplate || requestedTemplateId) && (
          <TemplatePreviewView
            template={selectedTemplate || templates.find((template) => template.id === requestedTemplateId) || templates[0]}
            isNew={isNewTemplatePreview}
            onBack={() => {
              window.history.replaceState(null, "", window.location.pathname);
              setStandaloneShell(false);
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

// --- New View Components ---


