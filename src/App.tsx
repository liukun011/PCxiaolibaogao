/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
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
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

type ViewType = "projectList" | "dashboard" | "audit" | "edit" | "intelligence";

// Sidebar Item Component
const SidebarItem = ({ icon: Icon, label, active = false, badge = 0 }: { icon: any, label: string, active?: boolean, badge?: number }) => (
  <div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>
    )}
  </div>
);

// Process Step Component
const ProcessStep = ({ icon: Icon, title, desc, active = false, completed = false }: { icon: any, title: string, desc: string, active?: boolean, completed?: boolean }) => (
  <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${active ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-gray-50 border-gray-100"}`}>
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${active ? "bg-blue-600 text-white" : "bg-white text-blue-600 shadow-sm"}`}>
      <Icon size={24} />
      {completed && (
        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
          <CheckCircle2 size={12} />
        </div>
      )}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-gray-800">{title}</span>
      <span className="text-xs text-gray-400">{desc}</span>
    </div>
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

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("projectList");
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
          <SidebarItem icon={ClipboardCheck} label="尽调管理" active={currentView === "projectList" || currentView === "dashboard"} />
          <SidebarItem icon={BookOpen} label="我的模板" />
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
              const initRes = {
                projectName: projectName,
                companyName: name,
                targetType: targetType || "company",
                targetCode: targetCode || "",
                isSkip: enableAI === false,
                isPending: enableAI !== false,
                template: template,
                questions: initialQs
              };
              setCurrentView("dashboard");
              if (enableAI !== false) {
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
            onBack={() => setCurrentView("projectList")}
            onEdit={() => setCurrentView("edit")}
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
            intelligenceResult={intelligenceResult}
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

// Project List View Component
const ProjectListView = ({ onSelectProject, onStartIntelligence, onDirectNew }: { onSelectProject: () => void, onStartIntelligence: () => void, onDirectNew: (projectName: string, companyName: string, template: string, initialQuestions: any[], targetType?: string, targetCode?: string, enableAI?: boolean) => void }) => {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [showDirectNewModal, setShowDirectNewModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [customProjectName, setCustomProjectName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("bank");
  const [editingQuestions, setEditingQuestions] = useState<any[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [targetType, setTargetType] = useState<"company" | "individual">("company");
  const [targetCode, setTargetCode] = useState("");
  const [enableAI, setEnableAI] = useState(true);

  const templates = [
    { id: "bank", title: "银行流贷尽调", desc: "关注经营现金流与抵押物状况", icon: Building },
    { id: "equity", title: "股权投资尽调", desc: "侧重核心壁垒与团队稳定性", icon: TrendingUp },
    { id: "general", title: "通用访谈体检", desc: "覆盖企业全貌的标准清单", icon: Activity }
  ];

  const templateQuestions: Record<string, any[]> = {
    bank: [
      { category: "财务状况", question: "贵司近三个月的经营性现金流情况如何？主要的回款难点在何处？", source: "模板预设", type: "preset" },
      { category: "资产情况", question: "目前用于抵质押的资产占比多少？是否存在权利受限未披露的重资产？", source: "模板预设", type: "preset" },
      { category: "经营稳定", question: "上下游结算方式近期是否有重大调整？", source: "模板预设", type: "preset" }
    ],
    equity: [
      { category: "核心壁垒", question: "公司的核心技术相比竞品有哪些不可替代的优势？", source: "模板预设", type: "preset" },
      { category: "团队构成", question: "核心研发团队的留存计划是什么？是否签署竞业协议？", source: "模板预设", type: "preset" },
      { category: "合规风控", question: "是否存在尚未了结的重大知识产权争议？", source: "模板预设", type: "preset" }
    ],
    general: [
      { category: "企业概况", question: "公司未来三年的发展战略和核心增长点是什么？", source: "模板预设", type: "preset" },
      { category: "市场环境", question: "目前的行业竞争格局如何？贵司的市场占有率处于什么水平？", source: "模板预设", type: "preset" }
    ]
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // 防止失去焦点导致的点击被吞
    if (!customProjectName.trim() || !newProjectName.trim()) return;
    setEditingQuestions([...templateQuestions[selectedTemplate]]);
    setModalStep(2);
  };

  const handleCreateProject = () => {
    onDirectNew(customProjectName.trim(), newProjectName.trim(), selectedTemplate, editingQuestions, targetType, targetCode, enableAI);
    setShowDirectNewModal(false);
    setModalStep(1);
    setCustomProjectName("");
    setNewProjectName("");
    setTargetType("company");
    setTargetCode("");
    setEnableAI(true);
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
                setModalStep(1);
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
                  <h3 className="text-xl font-bold text-gray-900">
                    {modalStep === 1 ? "新建尽调项目" : "编辑基础问题集合"}
                  </h3>
                  <button onClick={() => setShowDirectNewModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                {modalStep === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
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
                          受调主体名称 / 标识代码 *
                        </label>
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="请输入企业名称，也可输入信用代码"
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
                          {templates.map((tpl) => (
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

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">上传参考资料 (可选)</label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Files dropped in DirectNewModal:", e.dataTransfer.files);
                        }}
                        onClick={() => document.getElementById('direct-file-upload')?.click()}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-100 hover:border-blue-300 transition-all group"
                      >
                        <input id="direct-file-upload" type="file" multiple className="hidden" />
                        <Upload size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                        <div className="text-xs font-bold text-gray-600">点击或拖拽上传资料</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 group cursor-pointer transition-all hover:shadow-sm" onClick={() => setEnableAI(!enableAI)}>
                      <div>
                        <div className="text-sm font-bold text-gray-900">同步开启全网 AI 搜索</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">自动搜集公开涉诉、财务预警并生成针对性补充提纲</div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEnableAI(!enableAI); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${enableAI ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableAI ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setShowDirectNewModal(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleNextStep}
                        onMouseDown={handleNextStep}
                        disabled={!newProjectName.trim()}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                      >
                        下一步：编辑问题 <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      已加载 <strong>{templates.find(t => t.id === selectedTemplate)?.title}</strong> 的预设访谈问题。系统在创建后还将自动开启后台 AI 全网检索分析并给您推送补充问题。
                    </p>

                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {editingQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white border text-sm border-gray-100 p-3 rounded-xl flex items-start gap-3 group relative">
                          <div className="text-blue-600 mt-0.5"><MessageSquare size={16} /></div>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mr-2">{q.category}</span>
                            <span className="text-gray-800">{q.question}</span>
                          </div>
                          <button
                            onClick={() => setEditingQuestions(prev => prev.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center pt-2">
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={e => setNewQuestionText(e.target.value)}
                        placeholder="添加手动补充问题..."
                        className="flex-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newQuestionText.trim()) {
                            setEditingQuestions(prev => [...prev, { category: "自定义", question: newQuestionText.trim(), source: "手动", type: "manual" }]);
                            setNewQuestionText("");
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newQuestionText.trim()) {
                            setEditingQuestions(prev => [...prev, { category: "自定义", question: newQuestionText.trim(), source: "手动", type: "manual" }]);
                            setNewQuestionText("");
                          }
                        }}
                        className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => setModalStep(1)}
                        className="py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2 text-sm"
                      >
                        返回
                      </button>
                      <button
                        onClick={handleCreateProject}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm"
                      >
                        确认清单，创建项目
                      </button>
                    </div>
                  </motion.div>
                )}
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
const DashboardView = ({ onBack, onEdit, onAudit, onDownload, onOpenModal, onStartIntelligence, onStartBackgroundAI, intelligenceResult, setIntelligenceResult, isBackgroundAnalyzing, hasBackgroundResult, onViewBackgroundResult }: {
  onBack: () => void,
  onEdit: () => void,
  onAudit: () => void,
  onDownload: () => void,
  onOpenModal: () => void,
  onStartIntelligence: (step?: "input" | "confirm" | "loading") => void,
  onStartBackgroundAI?: () => void,
  intelligenceResult?: any,
  setIntelligenceResult: (res: any) => void,
  isBackgroundAnalyzing?: boolean,
  hasBackgroundResult?: boolean,
  onViewBackgroundResult?: () => void
}) => {
  const projectName = intelligenceResult?.companyName || "A公司";
  const [questions, setQuestions] = useState<any[]>([]);

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
  const [modalActiveTab, setModalActiveTab] = useState<"data" | "questions" | "guidelines">("data");
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
  const [pendingQuestions, setPendingQuestions] = useState<{ category: string, question: string, source: string, type: string, selected: boolean }[]>([]);

  const handleConfirmAIQuestions = () => {
    const selectedQs = pendingQuestions.filter(q => q.selected).map(({ selected, ...rest }) => rest);
    setQuestions(prev => [...selectedQs, ...prev]);
    setPendingQuestions([]);
    setShowIntelligenceModal(false);
  };

  const togglePendingQuestion = (index: number) => {
    setPendingQuestions(prev => prev.map((q, i) => i === index ? { ...q, selected: !q.selected } : q));
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
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

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-blue-600" onClick={onBack}>尽调管理</span>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">{projectName} - 尽调详情</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
          <ClipboardCheck size={16} />
          <span>归档报告</span>
        </button>
      </header>

      <div className="p-8 space-y-8">
        {/* DD Progress Flow */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">尽调流程</h2>
          <div className="flex items-center gap-4">
            <ProcessStep icon={FileText} title="收集企业资料" desc="快速上传或填基本信息" completed />
            <div className="flex-1 h-px bg-gray-100" />
            <ProcessStep icon={BrainCircuit} title="AI 智能分析" desc="自动分析识别访谈重点" completed />
            <div className="flex-1 h-px bg-gray-100" />
            <ProcessStep icon={Mic} title="进行现场访谈" desc="高效访谈实时记录完整信息" active />
            <div className="flex-1 h-px bg-gray-100" />
            <ProcessStep icon={FileSpreadsheet} title="生成专业报告" desc="自动整合内容生成报告" />
          </div>
        </section>

        {/* AI Intelligence Pre-check Results Summary / Entry Point */}
        <section className="grid grid-cols-1 gap-6">
          <div className={`transition-all relative overflow-hidden ${(intelligenceResult && !intelligenceResult.isSkip && !intelligenceResult.isPending)
            ? 'p-6 rounded-2xl shadow-sm border bg-white border-blue-100'
            : (isBackgroundAnalyzing || (intelligenceResult && intelligenceResult.isPending))
              ? 'rounded-2xl border-2 border-blue-400 border-opacity-50 shadow-md shadow-blue-100/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
              : 'p-6 rounded-2xl shadow-sm border bg-white border-dashed border-blue-200'
            }`}>
            {isBackgroundAnalyzing || (intelligenceResult && intelligenceResult.isPending) ? (
              <div className="p-6 relative">
                {/* 扫描光效 */}
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
                        AI 后台智能分析中
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
                    <h2 className="text-base font-bold text-gray-800">AI 智能分析已完成</h2>
                    <p className="text-gray-500 text-xs mt-0.5">识别出 {intelligenceResult.companyData?.financialAnomalies?.length || 0} 项财务异常与 {intelligenceResult.companyData?.litigation?.count || 0} 条法律风险</p>
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
                    <span>查看分析结果</span>
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
                    <h2 className="text-base font-bold text-gray-800">AI 智能分析</h2>
                    <p className="text-gray-400 text-xs mt-0.5">全网数据深度抓取，精准识别访谈重点</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2"
                >
                  <Zap size={16} />
                  开启分析
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Intelligence Result Modal */}
        {showIntelligenceModal && intelligenceResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-6xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <BrainCircuit size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">AI 智能分析结果</h2>
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

              <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Tabs */}
                <div className="w-64 bg-white border-r border-gray-100 p-6 space-y-2">
                  <button
                    onClick={() => setModalActiveTab("data")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${modalActiveTab === 'data' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Database size={18} />
                    全网抓取数据
                  </button>
                  <button
                    onClick={() => setModalActiveTab("questions")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${modalActiveTab === 'questions' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} />
                      补充访谈问题
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${modalActiveTab === 'questions' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                      {pendingQuestions.length}
                    </span>
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                  {modalActiveTab === "data" && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Company Overview */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Briefcase size={18} className="text-blue-600" />
                            企业概况
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">所属行业</span>
                              <span className="text-gray-800 font-bold">{intelligenceResult.companyData?.overview?.industry}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">成立年限</span>
                              <span className="text-gray-800 font-bold">{intelligenceResult.companyData?.overview?.years}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">人员规模</span>
                              <span className="text-gray-800 font-bold">{intelligenceResult.companyData?.overview?.employees}</span>
                            </div>
                          </div>
                        </div>

                        {/* Financial Anomalies */}
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-4">
                          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <AlertCircle size={18} className="text-orange-500" />
                            财务异常提醒
                          </h3>
                          <div className="space-y-3">
                            {intelligenceResult.companyData?.financialAnomalies?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                                <span className="text-gray-700 font-medium">{item.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Risk Summary */}
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-4">
                          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <ShieldAlert size={18} className="text-red-500" />
                            风险预警
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">法律诉讼</span>
                              <span className="text-red-600 font-bold">{intelligenceResult.companyData?.litigation?.count} 条</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">股权质押</span>
                              <span className="text-orange-600 font-bold">{intelligenceResult.companyData?.pledges?.count} 笔</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">行政处罚</span>
                              <span className="text-gray-800 font-bold">无</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Questions Preview - Integrated into Data Tab */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <MessageSquare size={20} className="text-blue-600" />
                            分析识别访谈重点
                          </h3>
                          <button
                            onClick={() => setModalActiveTab("questions")}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            管理全部问题
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingQuestions.slice(0, 4).map((q, idx) => (
                            <div key={idx} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-start gap-3 shadow-sm">
                              <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                                {idx + 1}
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{q.category}</span>
                                <p className="text-sm font-medium text-gray-700 leading-relaxed line-clamp-2">{q.question}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Guidelines Preview */}
                      <div className="bg-blue-600 p-8 rounded-[2rem] text-white space-y-4 shadow-xl shadow-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-xl">
                            <Lightbulb size={24} />
                          </div>
                          <h4 className="text-lg font-bold">AI 尽调深度建议</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {intelligenceResult.guidelines?.map((g: any, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30">
                              {g.tag}: {g.preference}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-blue-50 leading-relaxed font-medium">
                          该企业属于“高新企业”范畴，符合机构优先支持导向。但需重点关注“环保违规”及“应收账款异常”风险。建议在访谈中详细核实环保整改落实情况及应收账款回款计划，并评估其对持续经营能力的影响。
                        </p>
                      </div>
                    </div>
                  )}

                  {modalActiveTab === "questions" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <MessageSquare size={24} className="text-blue-600" />
                          AI 识别的访谈重点
                        </h3>
                        {pendingQuestions.length > 0 && (
                          <button
                            onClick={() => {
                              const allSelected = pendingQuestions.every(q => q.selected);
                              setPendingQuestions(pendingQuestions.map(q => ({ ...q, selected: !allSelected })));
                            }}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-all border border-blue-100"
                          >
                            {pendingQuestions.every(q => q.selected) ? '取消全选' : '全选所有建议'}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {pendingQuestions.length > 0 ? (
                          pendingQuestions.map((q, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => togglePendingQuestion(idx)}
                              className={`p-5 border rounded-2xl flex items-start gap-4 transition-all cursor-pointer group relative overflow-hidden ${q.selected
                                ? 'bg-blue-50/50 border-blue-300 shadow-sm ring-1 ring-blue-300'
                                : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                                }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${q.selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600'
                                }`}>
                                {q.selected ? <Check size={20} /> : idx + 1}
                              </div>
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${q.selected ? 'bg-blue-200 text-blue-800' : 'bg-blue-50 text-blue-600'
                                    }`}>{q.category}</span>
                                  <span className="text-[10px] text-gray-400 font-medium">来源: {q.source}</span>
                                </div>
                                <p className={`text-base font-semibold leading-relaxed transition-colors ${q.selected ? 'text-blue-900' : 'text-gray-700'
                                  }`}>{q.question}</p>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400 space-y-3">
                            <Sparkles size={40} className="opacity-20" />
                            <p className="text-sm font-medium">暂无 AI 建议问题</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-500 font-bold">
                    已选择 <span className="text-blue-600">{pendingQuestions.filter(q => q.selected).length}</span> 个访谈重点
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowIntelligenceModal(false)}
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                  >
                    稍后处理
                  </button>
                  <button
                    onClick={handleConfirmAIQuestions}
                    disabled={pendingQuestions.filter(q => q.selected).length === 0}
                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={18} />
                    确认并导入访谈清单
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Project Summary */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-8">
          <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
            <ClipboardCheck size={40} />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">{projectName}流贷尽调</h1>
                <PenTool size={16} className="text-gray-400 cursor-pointer hover:text-blue-600" />
                <button className="px-3 py-1 border border-blue-200 text-blue-600 rounded text-xs font-medium hover:bg-blue-50">更换模板</button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">重新生成</button>
                <button
                  onClick={onEdit}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  <span>修改报告</span>
                </button>
                <button
                  onClick={onAudit}
                  className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center gap-2"
                >
                  <ClipboardCheck size={16} />
                  <span>报告核查</span>
                </button>
                <button
                  onClick={onDownload}
                  className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center gap-2"
                >
                  <Download size={16} />
                  <span>下载 DOCX</span>
                </button>
                <button className="p-2 border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-50"><History size={18} /></button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2"><Clock size={14} /> 最后修改时间: 2025-03-03 13:03:06</div>
              <div className="flex items-center gap-2"><FileIcon size={14} /> 生成模板: 银行金融尽调报告模板</div>
              <div className="flex items-center gap-2"><FileText size={14} /> 报告字数: 18026字</div>
              <div className="flex items-center gap-2"><User size={14} /> 报告所有人: 张浩然</div>
            </div>
          </div>
        </section>

        {/* Materials Sections */}
        <div className="space-y-8">
          {/* 1. 企业基本情况 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                1. 企业基本情况
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Settings size={18} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <MaterialCard
                title="企业介绍"
                status="completed"
                date="2025-03-03 10:20"
                icon={Briefcase}
                onClick={onOpenModal}
              />
              <MaterialCard
                title="产品与服务"
                status="completed"
                date="2025-03-03 10:25"
                icon={Package}
                onClick={onOpenModal}
              />
              <MaterialCard
                title="市场地位"
                status="completed"
                date="2025-03-03 10:30"
                icon={TrendingUp}
                onClick={onOpenModal}
              />
            </div>
          </section>

          {/* 2. 财务状况分析 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                2. 财务状况分析
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Settings size={18} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <MaterialCard
                title="资产负债表分析"
                status="completed"
                date="2025-03-03 11:05"
                icon={PieChart}
                onClick={onOpenModal}
              />
              <MaterialCard
                title="利润表分析"
                status="completed"
                date="2025-03-03 11:15"
                icon={BarChart3}
                onClick={onOpenModal}
              />
              <MaterialCard
                title="现金流量表分析"
                status="completed"
                date="2025-03-03 11:20"
                icon={LineChart}
                onClick={onOpenModal}
              />
            </div>
          </section>

          {/* 3. 访谈记录 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                3. 访谈记录
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                  <Mic size={14} />
                  <span>开始新访谈</span>
                </button>
              </div>
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
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                4. 访谈问题清单
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowManualAdd(!showManualAdd)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${showManualAdd ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Plus size={14} />
                  <span>手动添加</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Manual Add Header */}
              <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">清单内容</span>
              </div>

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
                {(Object.entries(questions.reduce((acc, q) => {
                  if (!acc[q.category]) acc[q.category] = [];
                  acc[q.category].push(q);
                  return acc;
                }, {} as Record<string, typeof questions>)) as [string, typeof questions][]).map(([category, catQuestions], catIdx) => (
                  <div key={category} className="border-b border-gray-50 last:border-0">
                    <div className="bg-gray-50/50 px-6 py-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{catQuestions.length} 个问题</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {catQuestions.map((q, i) => {
                        const globalIndex = questions.indexOf(q);
                        return (
                          <motion.div
                            key={globalIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 hover:bg-blue-50/30 transition-colors group relative"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${q.source.includes('AI') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
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
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  共 {questions.length} 个访谈问题
                </button>
              </div>
            </div>
          </section>
        </div>
        {/* Intelligence Confirm Modal */}
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
                  <h2 className="text-2xl font-bold text-slate-900">确认开始智能分析？</h2>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-blue-600"><Zap size={16} /></div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        系统将启动全网数据抓取引擎，深度检索工商、司法、舆情及行业研报。
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-amber-600"><AlertCircle size={16} /></div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        由于涉及大量实时数据处理与 AI 深度推理，<span className="text-amber-600 font-bold">整个过程预计需要 1-2 分钟</span>，请保持页面开启。
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
                <h4 className="text-sm font-bold text-gray-900">AI 自动智能分析已完成！</h4>
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
              <h2 className="text-3xl font-bold text-slate-900">新建 AI 智能分析</h2>
              <p className="text-slate-500">输入企业信息，小狸将自动抓取全网数据，精准识别访谈重点并生成专业清单与建议</p>
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
                  <h2 className="text-2xl font-bold text-slate-900">确认开始智能分析？</h2>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-blue-600"><Zap size={16} /></div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        系统将启动全网数据抓取引擎，深度检索工商、司法、舆情及行业研报。
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-amber-600"><AlertCircle size={16} /></div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        由于涉及大量实时数据处理与 AI 深度推理，<span className="text-amber-600 font-bold">整个过程预计需要 1-2 分钟</span>，请保持页面开启。
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
              <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">AI 智能分析中</span>
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

const AuditView = ({ onBack, onDownloadConflict, onDownloadTraceability, intelligenceResult }: {
  onBack: () => void,
  onDownloadConflict: () => void,
  onDownloadTraceability: () => void,
  intelligenceResult?: any
}) => {
  const projectName = intelligenceResult?.companyName || "A公司";
  const [activeTab, setActiveTab] = useState<"conflict" | "traceability">("conflict");

  const conflicts = [
    { id: 1, type: "数据不一致", field: "2024年营业收入", sourceA: "财务报表 (1.2亿)", sourceB: "访谈记录 (1.5亿)", severity: "high", page: 1 },
    { id: 2, type: "逻辑冲突", field: "还款计划", sourceA: "销售回款覆盖", sourceB: "抵押物变现", severity: "medium", page: 1 },
    { id: 3, type: "信息缺失", field: "股权变动", sourceA: "工商信息 (有变动)", sourceB: "访谈记录 (无变动)", severity: "high", page: 2 },
  ];

  const traces = [
    { id: 1, section: "第一章：企业基本情况", content: `${projectName}成立于2010年，主要从事工业自动化设备的研发与生产...`, source: "工商登记信息 / 官方网站", confidence: 0.98 },
    { id: 2, section: "第二章：财务状况分析", content: "2024年实现营业收入1.2亿元，净利润1500万元，同比增长12%...", source: `${projectName}2024年财务报表.pdf (第12页)`, confidence: 1.0 },
    { id: 3, section: "第三章：访谈核心观点", content: "受访人表示，公司未来三年将重点布局新能源汽车零部件市场...", source: "访谈录音 (02:55 - 03:45)", confidence: 0.92 },
  ];

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
        <div className="flex items-center gap-3">
          <button
            onClick={activeTab === "conflict" ? onDownloadConflict : onDownloadTraceability}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg transition-all active:scale-95 ${activeTab === "conflict" ? "bg-orange-600 shadow-orange-200 hover:bg-orange-700" : "bg-purple-600 shadow-purple-200 hover:bg-purple-700"
              }`}
          >
            <Download size={16} />
            <span>导出{activeTab === "conflict" ? "冲突" : "溯源"}报告核查</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Report Document */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-200/50 flex flex-col items-center border-r border-gray-300">
          <div className="w-[700px] bg-white shadow-xl border border-gray-300 min-h-[1000px] p-[60px] space-y-6 relative mb-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-8 font-serif">{projectName}流贷尽调报告 (草案)</h1>
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-800 pb-1 font-serif">1. 企业基本情况</h2>
              <p className="text-gray-700 leading-relaxed text-sm text-justify indent-8 relative group">
                <span className={activeTab === 'traceability' ? "bg-purple-50 border-b-2 border-purple-300 cursor-help px-1" : ""}>
                  {projectName}成立于2010年，总部位于上海市张江高科技园区。
                </span>
                公司是一家专注于工业自动化设备研发、生产及销售的高新技术企业。
                <span className={activeTab === 'conflict' ? "bg-orange-100 border-b-2 border-orange-400 cursor-help px-1" : ""}>
                  截至2024年底，公司实现营业收入约1.2亿元
                </span>。
              </p>
            </section>
            <section className="space-y-4 mt-8">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-800 pb-1 font-serif">2. 财务状况分析</h2>
              <p className="text-gray-700 leading-relaxed text-sm text-justify indent-8 relative group">
                <span className={activeTab === 'traceability' ? "bg-purple-50 border-b-2 border-purple-300 cursor-help px-1" : ""}>
                  2024年实现营业收入1.2亿元，净利润1500万元
                </span>。
                公司整体财务表现稳健。
              </p>
              <p className="text-gray-700 leading-relaxed text-sm text-justify indent-8 relative group">
                在还款来源方面，公司计划通过
                <span className={activeTab === 'conflict' ? "bg-orange-100 border-b-2 border-orange-400 cursor-help px-1" : ""}>
                  销售回款完全覆盖
                </span>
                本次贷款本息。
              </p>
            </section>
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
                  <div key={c.id} className="border border-gray-100 rounded-xl p-5 hover:border-orange-300 transition-all bg-white shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {c.severity === 'high' ? '高风险' : '中风险'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">#{idx + 1}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-4">{c.type}: {c.field}</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative">
                        <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-gray-400 border border-gray-100 rounded">来源 A (报告)</span>
                        <p className="text-xs text-gray-600 italic">"{c.sourceA}"</p>
                      </div>
                      <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 relative">
                        <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-orange-400 border border-orange-100 rounded">来源 B (比对)</span>
                        <p className="text-xs text-gray-700 italic font-medium">"{c.sourceB}"</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <button className="text-[10px] text-blue-600 font-bold hover:underline">采纳来源 B 并修改</button>
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
                  <div key={t.id} className="space-y-4 group">
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
                    <button className="w-full py-2 text-[10px] font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
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
    </div>
  );
};

const EditReportView = ({ onBack, onDownload, intelligenceResult }: { onBack: () => void, onDownload: () => void, intelligenceResult?: any }) => {
  const projectName = intelligenceResult?.companyName || "A公司";
  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <header className="h-16 border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 bg-white z-30">
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
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="打印"><Printer size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="分享"><Share2 size={18} /></button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
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
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Sidebar */}
        <div className="w-64 border-r border-gray-200 p-6 bg-white overflow-y-auto hidden lg:block">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">报告目录</h3>
          <ul className="space-y-2">
            <li className="text-sm font-bold text-blue-600 p-2 bg-blue-50 rounded-lg cursor-pointer flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              1. 企业基本情况
            </li>
            <li className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              2. 行业背景与地位
            </li>
            <li className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              3. 财务状况分析
            </li>
            <li className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              4. 风险评估与建议
            </li>
          </ul>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">文档属性</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">格式</span>
                <span className="text-gray-800 font-medium">Microsoft Word (.docx)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">页面大小</span>
                <span className="text-gray-800 font-medium">A4 (210 x 297 mm)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">字体</span>
                <span className="text-gray-800 font-medium">宋体 / Times New Roman</span>
              </div>
            </div>
          </div>
        </div>
        {/* Main Editor Area */}
        <div className="flex-1 p-12 overflow-y-auto bg-gray-200/50 flex flex-col items-center">
          {/* Word-like Page Container */}
          <div className="w-[816px] bg-white shadow-2xl border border-gray-300 min-h-[1056px] p-[96px] space-y-8 relative mb-12">
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

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-800 pb-1 font-serif">1. 企业基本情况</h2>
              <p className="text-gray-700 leading-relaxed text-justify indent-8">
                {projectName}（以下简称“公司”）成立于2010年，总部位于上海市张江高科技园区。公司是一家专注于工业自动化设备研发、生产及销售的高新技术企业。经过十余年的发展，公司已在细分领域建立了较强的技术壁垒，拥有多项核心专利技术。
              </p>
              <p className="text-gray-700 leading-relaxed text-justify indent-8">
                截至2024年底，公司注册资本为人民币5000万元，员工总数超过300人，其中研发人员占比超过40%。公司主要产品涵盖了智能组装线、精密检测设备以及工业机器人集成系统，广泛应用于电子制造、汽车零部件及新能源行业。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-800 pb-1 font-serif">2. 行业背景与地位</h2>
              <p className="text-gray-700 leading-relaxed text-justify indent-8">
                随着全球制造业向智能化、数字化转型，工业自动化行业迎来了快速增长期。国内政策持续支持“中国制造2025”，为本土自动化设备厂商提供了广阔的市场空间。
              </p>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-sm text-blue-800 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit size={16} />
                  <p className="font-bold italic">AI 写作优化建议：</p>
                </div>
                <p className="opacity-90">检测到当前章节内容较少，建议从以下维度进行补充：</p>
                <ul className="list-disc list-inside mt-2 space-y-1 opacity-80">
                  <li>增加 2022-2024 年行业复合增长率数据</li>
                  <li>对比分析同行业竞争对手 B 公司的市场占有率</li>
                  <li>引用最新的《工业自动化行业白皮书》核心结论</li>
                </ul>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                  AI 自动补全
                </button>
              </div>
            </section>

            {/* Page Footer Decoration */}
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1">
              <div className="w-1/4 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-300">第 1 页 / 共 12 页</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
