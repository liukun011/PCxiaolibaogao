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
  TEMPLATE_QUESTION_SETS,
  createDefaultField,
  getTemplateCategoryTitle,
  type FieldConfig,
  type InterviewQuestion,
  type QuestionCollection,
  type TemplateItem,
} from "@/src/shared/templateData";

type ReportGenerationStatus = "idle" | "generating" | "generated";

type ReportGenerationTone = "info" | "success" | "warning";

type ReportGenerationEvent = {
  id: string;
  stageId: string;
  title: string;
  summary: string;
  source: string;
  progress: number;
  documentCount: number;
  evidenceCount: number;
  eta: string;
  tone: ReportGenerationTone;
};

type ReportGenerationStage = {
  id: string;
  title: string;
  description: string;
  scope: string;
  events: Omit<ReportGenerationEvent, "id" | "stageId">[];
};

type ReportGenerationFinding = {
  id: string;
  stageId: string;
  severity: "高风险" | "中风险" | "低风险" | "待复核";
  title: string;
  summary: string;
  source: string;
  status: string;
};

const REPORT_GENERATION_STAGES: ReportGenerationStage[] = [
  {
    id: "prepare",
    title: "文档准备",
    description: "校验文件完整性，识别页码、目录、表格和影像质量。",
    scope: "126 份资料",
    events: [
      {
        title: "资料清单已锁定",
        summary: "已接收财报、合同、流水、工商、访谈等 126 份资料，开始做格式与完整性检查。",
        source: "文件管理 / 上传清单",
        progress: 6,
        documentCount: 8,
        evidenceCount: 0,
        eta: "约 8 分钟",
        tone: "info",
      },
      {
        title: "完成解析质量检查",
        summary: "识别到 12 份扫描件需要 OCR，3 份 Excel 存在多工作表，已进入结构化解析队列。",
        source: "OCR 引擎 / 表格解析",
        progress: 14,
        documentCount: 22,
        evidenceCount: 6,
        eta: "约 7 分钟",
        tone: "success",
      },
    ],
  },
  {
    id: "classification",
    title: "文档分类",
    description: "按尽调主题拆分材料，建立后续抽取和交叉验证索引。",
    scope: "7 类资料",
    events: [
      {
        title: "完成资料主题归档",
        summary: "已将资料归入财务、合同、法务、股权、经营、人事、访谈 7 个主题，并标记关键页。",
        source: "文档分类模型",
        progress: 24,
        documentCount: 41,
        evidenceCount: 18,
        eta: "约 6 分钟",
        tone: "success",
      },
      {
        title: "识别缺口材料",
        summary: "银行流水缺少 2024 年 9 月明细，部分销售合同缺验收附件，已加入复核清单。",
        source: "文件完整性规则",
        progress: 32,
        documentCount: 56,
        evidenceCount: 27,
        eta: "约 5 分钟",
        tone: "warning",
      },
    ],
  },
  {
    id: "extraction",
    title: "关键信息抽取",
    description: "抽取主体、财务指标、重大合同、诉讼、担保和访谈事实。",
    scope: "42 个字段",
    events: [
      {
        title: "完成主体与股权信息抽取",
        summary: "已提取企业名称、注册资本、实控人、股权变更记录，并与工商材料建立引用关系。",
        source: "工商登记信息 / 股权变更记录",
        progress: 43,
        documentCount: 68,
        evidenceCount: 44,
        eta: "约 4 分钟",
        tone: "success",
      },
      {
        title: "完成财务指标抽取",
        summary: "已提取收入、净利润、经营现金流、应收账款、毛利率等核心指标，发现 2 项波动异常。",
        source: "2024 财务报表 / 明细账",
        progress: 54,
        documentCount: 81,
        evidenceCount: 63,
        eta: "约 3 分钟",
        tone: "warning",
      },
    ],
  },
  {
    id: "risk",
    title: "风险识别",
    description: "识别财务、合同、合规、股权和经营依赖风险。",
    scope: "18 条线索",
    events: [
      {
        title: "识别收入与回款风险",
        summary: "应收账款增长快于收入增长，回款周期较上一期拉长，已标记为中高风险线索。",
        source: "财务报表 / 银行流水 / 销售台账",
        progress: 66,
        documentCount: 94,
        evidenceCount: 82,
        eta: "约 2 分钟",
        tone: "warning",
      },
      {
        title: "识别合同履约风险",
        summary: "部分大额合同签署时间接近报告期末，且缺少验收单或物流凭证，待交叉验证。",
        source: "销售合同 / 验收附件",
        progress: 74,
        documentCount: 105,
        evidenceCount: 97,
        eta: "约 2 分钟",
        tone: "warning",
      },
    ],
  },
  {
    id: "verification",
    title: "交叉验证",
    description: "对金额、时间、主体和结论做多来源校验。",
    scope: "31 组校验",
    events: [
      {
        title: "完成财务口径交叉验证",
        summary: "合同金额、销售台账和收入确认口径存在 2 处差异，已生成冲突标记。",
        source: "合同台账 / 财报 / 销售明细",
        progress: 84,
        documentCount: 116,
        evidenceCount: 121,
        eta: "约 1 分钟",
        tone: "warning",
      },
      {
        title: "完成来源引用校验",
        summary: "报告草稿中 36 处关键结论已匹配到原始材料页码或访谈时间戳。",
        source: "证据链索引",
        progress: 91,
        documentCount: 126,
        evidenceCount: 145,
        eta: "约 40 秒",
        tone: "success",
      },
    ],
  },
  {
    id: "drafting",
    title: "报告撰写",
    description: "套用当前模板，生成章节草稿、风险摘要和引用来源。",
    scope: "8 个章节",
    events: [
      {
        title: "生成报告章节草稿",
        summary: "已生成企业基本情况、经营分析、财务分析、风险提示和尽调结论等章节。",
        source: "授信调查报告模板",
        progress: 96,
        documentCount: 126,
        evidenceCount: 156,
        eta: "约 20 秒",
        tone: "success",
      },
      {
        title: "完成质量检查",
        summary: "已检查引用存在性、数字前后一致性和未处理文档，4 项内容建议人工复核。",
        source: "质量检查规则",
        progress: 100,
        documentCount: 126,
        evidenceCount: 162,
        eta: "已完成",
        tone: "success",
      },
    ],
  },
];

const REPORT_GENERATION_EVENTS: ReportGenerationEvent[] = REPORT_GENERATION_STAGES.flatMap((stage) =>
  stage.events.map((event, index) => ({
    ...event,
    id: `${stage.id}-${index}`,
    stageId: stage.id,
  })),
);

const REPORT_GENERATION_FINDINGS: ReportGenerationFinding[] = [
  {
    id: "receivable-risk",
    stageId: "risk",
    severity: "高风险",
    title: "应收账款回款周期异常",
    summary: "应收账款周转天数由 90 天延长至 125 天，且增速高于收入增速。",
    source: "2024 财务报表，第 12 页；销售台账汇总.xlsx",
    status: "已纳入风险章节",
  },
  {
    id: "contract-proof",
    stageId: "risk",
    severity: "中风险",
    title: "部分合同缺少验收凭证",
    summary: "3 笔期末大额合同暂未匹配到完整验收单或物流签收记录。",
    source: "销售合同_2024_Q4.pdf；验收附件清单",
    status: "待人工复核",
  },
  {
    id: "equity-change",
    stageId: "verification",
    severity: "待复核",
    title: "股权变更口径不一致",
    summary: "工商变更记录显示近一年存在股权调整，访谈口径称无重大变动。",
    source: "工商变更记录.pdf；管理层访谈转写",
    status: "已生成冲突标记",
  },
  {
    id: "citation-check",
    stageId: "drafting",
    severity: "低风险",
    title: "引用来源完整性检查完成",
    summary: "36 处关键结论已绑定证据来源，4 处建议在提交前补充原始材料。",
    source: "报告质量检查规则",
    status: "已写入质检结果",
  },
];
export const DashboardView = ({ onBack, onEdit, onAudit, onDownload, onOpenModal, onStartIntelligence, onStartBackgroundAI, onOpenTemplates, intelligenceResult, setIntelligenceResult, isBackgroundAnalyzing, hasBackgroundResult, onViewBackgroundResult, initialSection, onSectionHandled, questionCollections, setQuestionCollections, templates, onPreviewTemplate }: {
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
  setQuestionCollections: React.Dispatch<React.SetStateAction<QuestionCollection[]>>,
  templates: TemplateItem[],
  onPreviewTemplate: (template: TemplateItem) => void,
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
  const [hasDocumentMaterials, setHasDocumentMaterials] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<{ category: string, question: string, source: string, type: string, selected: boolean }[]>([]);
  const [questionListMode, setQuestionListMode] = useState<"default" | "ai">("default");
  const [currentPresetTemplate, setCurrentPresetTemplate] = useState<string>(intelligenceResult?.template || "bank");
  const [showPresetTemplatePanel, setShowPresetTemplatePanel] = useState(false);
  const [isGeneratingAIInsights, setIsGeneratingAIInsights] = useState(false);
  const [aiInsightLogs, setAIInsightLogs] = useState<string[]>([]);
  const [showAIInsightToast, setShowAIInsightToast] = useState(false);
  const [showHeaderEditModal, setShowHeaderEditModal] = useState(false);
  const [showTemplateSwitchModal, setShowTemplateSwitchModal] = useState(false);
  const [showReportActionMenu, setShowReportActionMenu] = useState(false);
  const [showCompanyDataActionMenu, setShowCompanyDataActionMenu] = useState(false);
  const [reportGenerationStatus, setReportGenerationStatus] = useState<ReportGenerationStatus>(
    intelligenceResult?.reportGenerated ? "generated" : "idle",
  );
  const [showReportGenerationPanel, setShowReportGenerationPanel] = useState(false);
  const [reportGenerationEvents, setReportGenerationEvents] = useState<ReportGenerationEvent[]>(
    intelligenceResult?.reportGenerated ? REPORT_GENERATION_EVENTS : [],
  );
  const [reportGenerationStepIndex, setReportGenerationStepIndex] = useState(
    intelligenceResult?.reportGenerated ? REPORT_GENERATION_EVENTS.length - 1 : -1,
  );
  const [selectedReportTemplateId, setSelectedReportTemplateId] = useState(
    intelligenceResult?.reportTemplateId || templates.find((template) => template.status === "enabled")?.id || templates[0]?.id || "",
  );
  const [headerProjectNameInput, setHeaderProjectNameInput] = useState("");
  const [headerCompanyNameInput, setHeaderCompanyNameInput] = useState("");
  const aiInsightTimersRef = useRef<number[]>([]);
  const reportGenerationTimerRef = useRef<number | null>(null);
  const reportActionMenuRef = useRef<HTMLDivElement>(null);
  const companyDataActionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      aiInsightTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (reportGenerationTimerRef.current) {
        window.clearInterval(reportGenerationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showReportActionMenu) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (reportActionMenuRef.current?.contains(target)) return;

      setShowReportActionMenu(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowReportActionMenu(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showReportActionMenu]);

  useEffect(() => {
    if (!showCompanyDataActionMenu) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (companyDataActionMenuRef.current?.contains(target)) return;

      setShowCompanyDataActionMenu(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCompanyDataActionMenu(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showCompanyDataActionMenu]);

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
    if (intelligenceResult?.reportTemplateId) {
      setSelectedReportTemplateId(intelligenceResult.reportTemplateId);
    }
  }, [intelligenceResult?.reportTemplateId]);

  useEffect(() => {
    if (initialSection !== "questions") return;

    const timer = window.setTimeout(() => {
      questionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      onSectionHandled?.();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [initialSection, onSectionHandled]);

  const hasCompanyName = Boolean((intelligenceResult?.companyName || "").trim());
  const canUseAIInsights = hasCompanyName || hasDocumentMaterials;
  const aiInsightRequirementText = `存在企业名称或文档资料中的任意一项后，即可使用 AI 洞察。`;

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

  const handleSelectReportTemplate = (template: TemplateItem) => {
    if (template.status !== "enabled") {
      return;
    }

    setSelectedReportTemplateId(template.id);
    setIntelligenceResult((prev: any) => ({
      ...(prev || {}),
      reportTemplateId: template.id,
      reportTemplateName: template.name,
    }));
    setShowTemplateSwitchModal(false);
  };

  const startReportGeneration = () => {
    setShowReportActionMenu(false);
    if (reportGenerationTimerRef.current) {
      window.clearInterval(reportGenerationTimerRef.current);
      reportGenerationTimerRef.current = null;
    }

    setReportGenerationStatus("generating");
    setShowReportGenerationPanel(true);
    setReportGenerationEvents([REPORT_GENERATION_EVENTS[0]]);
    setReportGenerationStepIndex(0);

    let nextEventIndex = 1;
    reportGenerationTimerRef.current = window.setInterval(() => {
      if (nextEventIndex >= REPORT_GENERATION_EVENTS.length) {
        if (reportGenerationTimerRef.current) {
          window.clearInterval(reportGenerationTimerRef.current);
          reportGenerationTimerRef.current = null;
        }

        setReportGenerationStatus("generated");
        setReportGenerationStepIndex(REPORT_GENERATION_EVENTS.length - 1);
        setReportGenerationEvents(REPORT_GENERATION_EVENTS);
        setIntelligenceResult((prev: any) => ({
          ...(prev || {}),
          reportGenerated: true,
          reportGeneratedAt: new Date().toLocaleString("zh-CN"),
          reportGenerationAudit: REPORT_GENERATION_EVENTS,
        }));
        return;
      }

      const nextEvent = REPORT_GENERATION_EVENTS[nextEventIndex];
      setReportGenerationEvents((previous) => [...previous, nextEvent]);
      setReportGenerationStepIndex(nextEventIndex);
      nextEventIndex += 1;
    }, 900);
  };

  const cancelReportGeneration = () => {
    if (reportGenerationTimerRef.current) {
      window.clearInterval(reportGenerationTimerRef.current);
      reportGenerationTimerRef.current = null;
    }

    setReportGenerationStatus("idle");
    setShowReportGenerationPanel(false);
    setReportGenerationEvents([]);
    setReportGenerationStepIndex(-1);
  };

  const openGeneratedReport = () => {
    setShowReportActionMenu(false);
    onEdit();
  };

  const downloadGeneratedReport = () => {
    setShowReportActionMenu(false);
    onDownload();
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
  const interviewMaterials = [
    {
      name: `${mockInterview.title}.mp3`,
      title: mockInterview.title,
      path: "访谈录音",
      type: "访谈录音",
      summary: `访谈时间：${mockInterview.date}，时长：${mockInterview.duration}。命中 ${mockInterview.questions.filter((question) => question.isHit).length} 个访谈问题。`,
      tags: ["访谈录音", "APP录音"],
      content: [
        "访谈转写：",
        ...mockInterview.transcripts.map((item) => `${item.timestamp} ${item.speaker}：${item.text}`),
        "",
        "命中问题：",
        ...mockInterview.questions.map((question) => `- ${question.question}${question.answerSummary ? `：${question.answerSummary}` : ""}`),
      ].join("\n"),
      sourceKind: "interview" as const,
      duration: mockInterview.duration,
      updatedAtLabel: "2026-04-18 10:16",
    },
    {
      name: "生产主管现场交流.mp3",
      title: "与生产主管关于产能利用率的现场交流",
      path: "访谈录音",
      type: "访谈录音",
      summary: "访谈时间：2025-03-03 16:15，时长：28:10。围绕产能利用率、订单交付节奏与生产瓶颈进行补充核实。",
      tags: ["访谈录音", "现场交流"],
      content: "访谈重点：\n1. 当前产线整体利用率保持在较高水平。\n2. 个别项目交付周期受下游验收节奏影响。\n3. 后续需持续关注新增订单排产与交付回款联动情况。",
      sourceKind: "interview" as const,
      duration: "28:10",
      updatedAtLabel: "2026-04-18 11:05",
    },
  ];
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
  const isCompanyDataLoading = Boolean(isAnalyzing || isBackgroundAnalyzing || intelligenceResult?.isPending);
  const hasCompanyData = Boolean(intelligenceResult && !intelligenceResult.isSkip && !intelligenceResult.isPending);
  const openCompanyDataResult = () => {
    if (intelligenceResult?.aiQuestions && pendingQuestions.length === 0) {
      setPendingQuestions(intelligenceResult.aiQuestions.map((q: any) => ({ ...q, selected: true })));
    }
    if (onViewBackgroundResult) onViewBackgroundResult();
    setShowCompanyDataActionMenu(false);
    setShowIntelligenceModal(true);
  };
  const currentReportEvent =
    reportGenerationEvents[reportGenerationEvents.length - 1] ||
    (reportGenerationStatus === "generated" ? REPORT_GENERATION_EVENTS[REPORT_GENERATION_EVENTS.length - 1] : null);
  const currentReportStageId = currentReportEvent?.stageId || REPORT_GENERATION_STAGES[0].id;
  const currentReportStageIndex = Math.max(
    0,
    REPORT_GENERATION_STAGES.findIndex((stage) => stage.id === currentReportStageId),
  );
  const visibleReportFindings = REPORT_GENERATION_FINDINGS.filter((finding) => {
    const findingStageIndex = REPORT_GENERATION_STAGES.findIndex((stage) => stage.id === finding.stageId);
    return reportGenerationStatus === "generated" || findingStageIndex <= currentReportStageIndex;
  });

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-8 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
              <span className="cursor-pointer hover:text-blue-600" onClick={onBack}>尽调管理</span>
              <ChevronRight size={14} />
              <span className="truncate font-medium text-gray-800">{dashboardProjectName}</span>
              <button
                onClick={() => setShowHeaderEditModal(true)}
                title="修改项目名称和企业名称"
                aria-label="修改项目名称和企业名称"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <Edit3 size={14} />
              </button>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                  isCompanyDataLoading
                    ? "bg-blue-50 text-blue-700"
                    : hasCompanyData
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {isCompanyDataLoading ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : hasCompanyData ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <Database size={12} />
                )}
                {isCompanyDataLoading ? "企业数据抓取中" : hasCompanyData ? "企业数据已获取" : "企业大数据未获取"}
              </span>
              {!canUseAIInsights && (
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                  <AlertCircle size={12} />
                  <span className="truncate">{aiInsightRequirementText}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <div
              ref={reportActionMenuRef}
              className="relative"
              onMouseEnter={() => {
                if (reportGenerationStatus === "generated") {
                  setShowReportActionMenu(true);
                }
              }}
              onMouseLeave={() => setShowReportActionMenu(false)}
              onFocus={() => {
                if (reportGenerationStatus === "generated") {
                  setShowReportActionMenu(true);
                }
              }}
            >
              {reportGenerationStatus === "generated" ? (
                <button
                  onClick={() => setShowReportActionMenu(true)}
                  className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <FileText size={16} />
                  <span>报告已生成</span>
                  <ChevronDown size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (reportGenerationStatus === "generating") {
                      setShowReportGenerationPanel(true);
                      return;
                    }
                    startReportGeneration();
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    reportGenerationStatus === "generating"
                      ? "border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                  }`}
                >
                  {reportGenerationStatus === "generating" ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span>{reportGenerationStatus === "generating" ? "查看进度" : "生成报告"}</span>
                </button>
              )}

              {reportGenerationStatus === "generated" && showReportActionMenu && (
                <div className="absolute right-0 top-full z-30 w-48 pt-2">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl">
                    <button
                      onClick={() => {
                        setShowReportActionMenu(false);
                        setShowReportGenerationPanel(true);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Activity size={15} />
                      <span>查看生成过程</span>
                    </button>
                    <button
                      onClick={openGeneratedReport}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye size={15} />
                      <span>查看报告</span>
                    </button>
                    <button
                      onClick={startReportGeneration}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <RefreshCw size={15} />
                      <span>重新生成</span>
                    </button>
                    <button
                      onClick={downloadGeneratedReport}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Download size={15} />
                      <span>下载报告</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div
              ref={companyDataActionMenuRef}
              className="relative"
              onMouseEnter={() => {
                if (hasCompanyData) {
                  setShowCompanyDataActionMenu(true);
                }
              }}
              onMouseLeave={() => setShowCompanyDataActionMenu(false)}
              onFocus={() => {
                if (hasCompanyData) {
                  setShowCompanyDataActionMenu(true);
                }
              }}
            >
              {isCompanyDataLoading ? (
                <button
                  disabled
                  className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 opacity-80"
                >
                  <RefreshCw size={16} className="animate-spin" />
                  <span>企业数据</span>
                </button>
              ) : hasCompanyData ? (
                <>
                  <button
                    onClick={() => setShowCompanyDataActionMenu(true)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <Database size={16} />
                    <span>企业数据</span>
                    <ChevronDown size={14} />
                  </button>
                  {showCompanyDataActionMenu && (
                    <div className="absolute right-0 top-full z-30 w-44 pt-2">
                      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl">
                        <button
                          onClick={openCompanyDataResult}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={15} />
                          <span>查看数据</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowCompanyDataActionMenu(false);
                            setShowConfirmModal(true);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <RefreshCw size={15} />
                          <span>重新分析</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <Zap size={16} />
                  <span>获取数据</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowTemplateSwitchModal(true)}
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              <Layout size={16} />
              <span>更换模板</span>
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100">
              <ClipboardCheck size={16} />
              <span>归档</span>
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
            <section className="hidden">
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
                        <h2 className="text-base font-bold text-gray-800">企业大数据获取</h2>
                        <p className="text-gray-400 text-xs mt-0.5">企业工商、风控大数据获取，多维度分析企业状况</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2"
                    >
                      <Zap size={16} />
                      开始获取
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
                    <h2 className="text-2xl font-bold text-gray-800">企业大数据获取结果</h2>
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
            title="文件管理"
            onFilesStateChange={setHasDocumentMaterials}
            initialFiles={interviewMaterials}
          />

          {/* 2. 访谈问题清单 */}
          <section ref={questionsSectionRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                2. 访谈问题清单
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
                          onClick={() => startAIInsightGeneration()}
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
        {reportGenerationStatus === "generating" && !showReportGenerationPanel && currentReportEvent && (
          <motion.button
            type="button"
            onClick={() => setShowReportGenerationPanel(true)}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-8 right-8 z-[120] w-[360px] rounded-3xl border border-blue-100 bg-white p-4 text-left shadow-[0_16px_48px_-12px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_56px_-12px_rgba(37,99,235,0.34)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                <RefreshCw size={18} className="animate-spin" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="truncate text-sm font-bold text-slate-900">报告后台生成中</h4>
                  <span className="shrink-0 text-xs font-black text-blue-600">{currentReportEvent.progress}%</span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{currentReportEvent.title}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    animate={{ width: `${currentReportEvent.progress}%` }}
                    transition={{ duration: 0.35 }}
                    className="h-full rounded-full bg-blue-600"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>{currentReportEvent.documentCount} / 126 份文档</span>
                  <span>点击查看过程</span>
                </div>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <ReportGenerationWorkbench
        open={showReportGenerationPanel}
        status={reportGenerationStatus}
        events={reportGenerationEvents}
        currentStageId={currentReportStageId}
        currentStepIndex={reportGenerationStepIndex}
        findings={visibleReportFindings}
        onClose={() => setShowReportGenerationPanel(false)}
        onCancel={cancelReportGeneration}
        onOpenReport={openGeneratedReport}
        onDownload={downloadGeneratedReport}
      />

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
                  <h3 className="text-lg font-bold text-slate-900">修改</h3>
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
        {showTemplateSwitchModal && (
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
              className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">更换模板</h3>
                  <p className="mt-1 text-sm text-slate-500">重新选择当前尽调报告使用的模板。</p>
                </div>
                <button
                  onClick={() => setShowTemplateSwitchModal(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {templates.map((template) => {
                  const isActive = selectedReportTemplateId === template.id;
                  const isDisabled = template.status === "disabled";

                  return (
                    <div
                      key={template.id}
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      aria-disabled={isDisabled}
                      onClick={() => handleSelectReportTemplate(template)}
                      onKeyDown={(event) => {
                        if (isDisabled) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleSelectReportTemplate(template);
                        }
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${
                        isActive
                          ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                          : isDisabled
                            ? "cursor-not-allowed border-dashed border-slate-200 bg-slate-50 opacity-75"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isDisabled ? "bg-white text-slate-400" : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-bold text-slate-900">{template.name}</p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isDisabled ? "bg-slate-200 text-slate-500" : "bg-green-50 text-green-600"
                              }`}
                            >
                              {isDisabled ? "已禁用" : "已启用"}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {template.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span>{template.uploader}</span>
                            <span>{template.uploadTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onPreviewTemplate(template);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="新页签预览模板"
                        >
                          <Eye size={14} />
                          <span>预览</span>
                        </button>
                        {isActive ? (
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white">
                            当前
                          </span>
                        ) : (
                          <ChevronRight size={16} className="text-slate-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTemplateSwitchModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {false && hasBackgroundResult && (
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

const ReportGenerationWorkbench = ({
  open,
  status,
  events,
  currentStageId,
  currentStepIndex,
  findings,
  onClose,
  onCancel,
  onOpenReport,
  onDownload,
}: {
  open: boolean;
  status: ReportGenerationStatus;
  events: ReportGenerationEvent[];
  currentStageId: string;
  currentStepIndex: number;
  findings: ReportGenerationFinding[];
  onClose: () => void;
  onCancel: () => void;
  onOpenReport: () => void;
  onDownload: () => void;
}) => {
  const latestEvent =
    events[events.length - 1] ||
    (status === "generated" ? REPORT_GENERATION_EVENTS[REPORT_GENERATION_EVENTS.length - 1] : REPORT_GENERATION_EVENTS[0]);
  const activeStageIndex = Math.max(
    0,
    REPORT_GENERATION_STAGES.findIndex((stage) => stage.id === currentStageId),
  );
  const progress = status === "generated" ? 100 : latestEvent.progress;
  const processedDocuments = status === "generated" ? 126 : latestEvent.documentCount;
  const evidenceCount = status === "generated" ? 162 : latestEvent.evidenceCount;
  const eta = status === "generated" ? "已完成" : latestEvent.eta;
  const visibleEvents = events.length > 0 ? events : [REPORT_GENERATION_EVENTS[0]];
  const currentStage = REPORT_GENERATION_STAGES[activeStageIndex] || REPORT_GENERATION_STAGES[0];

  const getStageState = (stageId: string, index: number) => {
    if (status === "generated" || index < activeStageIndex) return "done";
    if (stageId === currentStageId) return "active";
    return "pending";
  };

  const getToneClass = (tone: ReportGenerationTone) => {
    if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
    if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    return "border-blue-200 bg-blue-50 text-blue-700";
  };

  const getSeverityClass = (severity: ReportGenerationFinding["severity"]) => {
    if (severity === "高风险") return "bg-red-50 text-red-600 border-red-100";
    if (severity === "中风险") return "bg-amber-50 text-amber-700 border-amber-100";
    if (severity === "待复核") return "bg-purple-50 text-purple-600 border-purple-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const formatRuntime = (index: number) => {
    const seconds = index * 18;
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] bg-slate-950/45 p-4 backdrop-blur-sm md:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:h-[calc(100vh-3rem)]"
          >
            <div className="flex shrink-0 flex-col gap-4 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                    {status === "generated" ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-slate-900">尽调报告生成过程</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      展示 AI 处理摘要、证据来源和阶段性发现，便于跟踪与复核。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {status === "generating" ? (
                  <>
                    <button
                      onClick={onClose}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <Clock size={14} />
                      <span>后台生成</span>
                    </button>
                    <button
                      onClick={onCancel}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                    >
                      <X size={14} />
                      <span>取消生成</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onOpenReport}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      <Eye size={14} />
                      <span>查看报告</span>
                    </button>
                    <button
                      onClick={onDownload}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <Download size={14} />
                      <span>下载报告</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                      aria-label="关闭报告生成过程"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-5 py-4 md:px-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">整体进度</span>
                    <span className="text-sm font-black text-blue-600">{progress}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.35 }}
                      className="h-full rounded-full bg-blue-600"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-400">当前阶段</p>
                  <div className="mt-2 flex items-center gap-2">
                    {status === "generating" && <RefreshCw size={14} className="shrink-0 animate-spin text-blue-600" />}
                    {status === "generated" && <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />}
                    <span className="truncate text-sm font-bold text-slate-900">{currentStage.title}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-400">资料处理</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{processedDocuments} / 126 份文档</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-400">证据与剩余时间</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{evidenceCount} 条证据 · {eta}</p>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[280px_minmax(0,1fr)_340px] lg:overflow-hidden">
              <aside className="border-b border-slate-100 bg-white p-5 lg:border-b-0 lg:border-r lg:p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <ClipboardCheck size={16} className="text-blue-600" />
                  <span>阶段路线</span>
                </div>
                <div className="mt-5 space-y-3">
                  {REPORT_GENERATION_STAGES.map((stage, index) => {
                    const state = getStageState(stage.id, index);
                    return (
                      <div key={stage.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                              state === "done"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                : state === "active"
                                  ? "border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-100"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                            }`}
                          >
                            {state === "done" ? <Check size={14} /> : index + 1}
                          </div>
                          {index < REPORT_GENERATION_STAGES.length - 1 && (
                            <div className={`mt-2 h-8 w-px ${state === "done" ? "bg-emerald-200" : "bg-slate-200"}`} />
                          )}
                        </div>
                        <div className="min-w-0 pb-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className={`truncate text-sm font-bold ${state === "pending" ? "text-slate-500" : "text-slate-900"}`}>
                              {stage.title}
                            </p>
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              {stage.scope}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{stage.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-2">
                    <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
                    <p className="text-xs leading-5 text-blue-800">
                      这里展示的是可复核的处理摘要和证据链，不展示模型原始思维链。
                    </p>
                  </div>
                </div>
              </aside>

              <section className="min-h-0 overflow-y-auto p-5 lg:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900">实时处理摘要</h4>
                    <p className="mt-1 text-xs text-slate-500">每完成一个处理动作，系统会输出摘要、来源和当前指标。</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                    步骤 {Math.max(currentStepIndex + 1, 1)} / {REPORT_GENERATION_EVENTS.length}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {visibleEvents.map((event, index) => {
                    const isLatest = index === visibleEvents.length - 1 && status === "generating";
                    const stage = REPORT_GENERATION_STAGES.find((item) => item.id === event.stageId);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border p-4 transition-all ${
                          isLatest ? "border-blue-200 bg-blue-50/40 shadow-sm" : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                              T+{formatRuntime(index)}
                            </span>
                            <span className="truncate text-xs font-bold text-blue-600">{stage?.title || "处理中"}</span>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getToneClass(event.tone)}`}>
                            {event.tone === "warning" ? "需关注" : event.tone === "success" ? "已完成" : "处理中"}
                          </span>
                        </div>
                        <h5 className="mt-3 text-sm font-bold text-slate-900">{event.title}</h5>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{event.summary}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Database size={13} className="text-slate-400" />
                            {event.source}
                          </span>
                          <span>{event.documentCount} 份文档</span>
                          <span>{event.evidenceCount} 条证据</span>
                          <span>{event.progress}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              <aside className="border-t border-slate-100 bg-slate-50/70 p-5 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">阶段性发现</h4>
                    <p className="mt-1 text-xs text-slate-500">边生成边沉淀风险、缺口和质检结果。</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
                    {findings.length} 条
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {findings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center">
                      <Target size={20} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-xs leading-5 text-slate-500">风险识别阶段开始后，将在这里展示阶段性发现。</p>
                    </div>
                  ) : (
                    findings.map((finding) => (
                      <div key={finding.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getSeverityClass(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{finding.status}</span>
                        </div>
                        <h5 className="mt-3 text-sm font-bold text-slate-900">{finding.title}</h5>
                        <p className="mt-2 text-xs leading-5 text-slate-600">{finding.summary}</p>
                        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
                          来源：{finding.source}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Intelligence View Component

