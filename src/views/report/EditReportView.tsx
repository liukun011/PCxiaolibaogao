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
import { TemplatePreviewView } from "@/src/views/templates/TemplatePreviewView";
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
export const EditReportView = ({
  onBack,
  onDownload,
  onDownloadConflict,
  onDownloadTraceability,
  intelligenceResult,
  initialSideTab,
  templates,
  setTemplates,
}: {
  onBack: () => void,
  onDownload: () => void,
  onDownloadConflict: () => void,
  onDownloadTraceability: () => void,
  intelligenceResult?: any,
  initialSideTab?: "conflict" | "traceability",
  templates: TemplateItem[],
  setTemplates: React.Dispatch<React.SetStateAction<TemplateItem[]>>
}) => {
  const projectName = intelligenceResult?.companyName || "A公司";
  const [activeAuditTab, setActiveAuditTab] = useState<"conflict" | "traceability">(initialSideTab || "conflict");
  const editTargetRefs = useRef<Record<string, HTMLElement | SVGElement | null>>({});
  const [activeEditTargetId, setActiveEditTargetId] = useState<string | null>(null);
  const [materialPreview, setMaterialPreview] = useState<MaterialPreviewData | null>(null);
  const templateUploadInputRef = useRef<HTMLInputElement>(null);
  const templateUploadTimersRef = useRef<number[]>([]);
  const [templateUploadStatus, setTemplateUploadStatus] = useState<"idle" | "uploading" | "parsing">("idle");
  const [showWorkbenchTemplateSwitcher, setShowWorkbenchTemplateSwitcher] = useState(false);
  const [workbenchActiveTemplateId, setWorkbenchActiveTemplateId] = useState<string | null>(
    templates.find((item) => item.status === "enabled")?.id || templates[0]?.id || null,
  );
  const [templateConfirmModal, setTemplateConfirmModal] = useState<{
    isOpen: boolean;
    action: "enable" | "disable" | "delete" | null;
    template: TemplateItem | null;
  }>({ isOpen: false, action: null, template: null });
  const [templateEditModal, setTemplateEditModal] = useState<{
    isOpen: boolean;
    template: TemplateItem | null;
    category: string;
    name: string;
    description: string;
  }>({ isOpen: false, template: null, category: TEMPLATE_OPTIONS[0].id, name: "", description: "" });
  const [workbenchTemplatePreview, setWorkbenchTemplatePreview] = useState<TemplateItem | null>(null);
  const [workbenchPreviewIsNew, setWorkbenchPreviewIsNew] = useState(false);

  useEffect(() => {
    if (initialSideTab) {
      setActiveAuditTab(initialSideTab);
    }
  }, [initialSideTab]);

  useEffect(() => {
    return () => {
      templateUploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!templates.length) {
      setWorkbenchActiveTemplateId(null);
      return;
    }

    const currentExists = templates.some((item) => item.id === workbenchActiveTemplateId);
    if (currentExists) {
      return;
    }

    setWorkbenchActiveTemplateId(templates.find((item) => item.status === "enabled")?.id || templates[0].id);
  }, [templates, workbenchActiveTemplateId]);
  const [reportSections, setReportSections] = useState([
    {
      id: "company",
      title: "企业基本情况",
      paragraphs: [
        `${projectName}（以下简称“公司”）成立于2010年，总部位于上海市张江高科技园区。公司是一家专注于工业自动化设备研发、生产及销售的高新技术企业。经过十余年的发展，公司已在细分领域建立了较强的技术壁垒，拥有多项核心专利技术。`,
        "截至2024年底，公司注册资本为人民币5000万元，员工总数超过300人，其中研发人员占比超过40%。公司实现营业收入约1.2亿元，公司主要产品涵盖智能组装线、精密检测设备以及工业机器人集成系统，广泛应用于电子制造、汽车零部件及新能源行业。",
        "从股权结构看，控股股东及核心管理层保持稳定，经营团队对公司技术路线与重点客户资源具有较强控制力。近年来公司持续投入研发平台建设，在机器视觉、柔性产线集成及智能检测算法方面形成了较为完整的技术体系。",
      ],
    },
    {
      id: "industry",
      title: "行业背景与地位",
      paragraphs: [
        "随着全球制造业向智能化、数字化转型，工业自动化行业迎来了快速增长期。国内政策持续支持“中国制造2025”，为本土自动化设备厂商提供了广阔的市场空间。",
        "在行业竞争格局方面，头部企业向平台化、系统化方案延伸，中型厂商则更强调交付效率与细分场景能力。公司当前在华东区域装备制造客户中具备一定口碑优势，但在全国性项目获取、渠道覆盖与服务网络方面仍存在继续提升空间。",
      ],
    },
    {
      id: "financial",
      title: "财务状况分析",
      paragraphs: [
        "2024年实现营业收入1.2亿元，净利润1500万元，公司整体财务表现保持稳健，现金流与订单储备处于可控区间。结合已获取财务资料，公司主营业务收入仍为设备销售与产线集成服务，两类收入贡献占比较高。",
        "从资产质量看，应收账款规模随着业务扩张有所上升，部分项目回款周期受下游验收节奏影响而拉长。存货主要由在产品、原材料及部分备货设备构成，整体仍与项目制经营特点相匹配，但后续需持续关注大额项目交付与回款联动情况。",
        "在还款来源安排上，公司预计通过销售回款完全覆盖本次贷款本息，同时辅以核心股东增信与设备抵押作为补充保障。该表述仍需结合访谈纪要、授信方案及财务测算进一步核验。",
      ],
    },
    {
      id: "operations",
      title: "经营与交付情况",
      paragraphs: [
        "公司目前收入主要来源于汽车零部件、3C 电子及新能源装备客户，前五大客户贡献度相对较高，但客户合作年限整体较长，复购率处于合理水平。订单获取模式以销售跟进与行业口碑转介绍为主，大型项目通常伴随较长的商务谈判和验收周期。",
        "从生产交付角度看，公司采用研发、装配、集成联动模式，关键零部件部分外采，核心调试与软件集成由内部团队完成。若未来订单规模进一步扩大，需要继续观察人员、产能与项目管理体系能否同步支撑。",
      ],
    },
    {
      id: "interview",
      title: "访谈核心观点",
      paragraphs: [
        "受访人表示，公司未来三年将重点布局新能源汽车零部件市场，并同步推进区域客户结构优化。",
        "访谈记录显示，公司近一年无重大股权变动，股东结构整体保持稳定。管理层同时强调，当前新增订单中来自新能源客户的占比正在上升，但尚需时间验证其利润率与回款质量能否持续稳定。",
      ],
    },
    {
      id: "risk",
      title: "风险评估与建议",
      paragraphs: [
        "综合现有资料，公司核心风险主要集中在项目制业务带来的回款波动、订单集中度较高以及个别关键客户验收周期偏长等方面。若宏观制造业投资节奏放缓，可能对新增订单签约和交付回款产生一定影响。",
        "建议在后续授信审查中，重点核查近 12 个月主要客户回款明细、在手订单履约进度、核心设备抵押落实情况以及股东增信安排的可执行性，并结合访谈内容进一步验证管理层对未来收入增长与现金流改善的判断依据。",
      ],
    },
  ]);
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [reportDraftSections, setReportDraftSections] = useState<
    Array<{ id: string; title: string; paragraphs: string[] }>
  >([]);
  const [fieldRuleModal, setFieldRuleModal] = useState<{
    isOpen: boolean;
    fieldName: string;
    currentRule: string;
    dataSource: string;
    businessRule: string;
  }>({ isOpen: false, fieldName: "", currentRule: "", dataSource: "", businessRule: "" });
  const [selectedGeneratedFieldId, setSelectedGeneratedFieldId] = useState<string | null>(null);
  const [manualReportFieldContents, setManualReportFieldContents] = useState<Record<string, string>>({});
  const [fieldSearchKeyword, setFieldSearchKeyword] = useState("");
  const [fieldStatusFilter, setFieldStatusFilter] = useState<"all" | "conflict">("all");

  const conflicts = [
    {
      id: 1,
      type: "数据不一致",
      field: "2024年营业收入",
      page: 1,
      targetId: "report-field-revenue2024",
      sources: [
        { id: "report", label: "报告内容", content: "财务报表口径：1.20亿元", tone: "neutral" },
        { id: "interview", label: "访谈记录", content: "管理层访谈口径：1.50亿元", tone: "warning", resolvedText: "2024年营业收入按管理层口径调整为1.50亿元。" },
        { id: "ledger", label: "销售台账", content: "销售台账汇总口径：1.38亿元", tone: "warning", resolvedText: "2024年营业收入按销售台账口径调整为1.38亿元。" },
      ],
    },
    {
      id: 2,
      type: "逻辑冲突",
      field: "还款计划",
      page: 1,
      targetId: "report-field-repaymentPlan",
      sources: [
        { id: "report", label: "报告内容", content: "销售回款覆盖", tone: "neutral" },
        { id: "pledge", label: "抵押方案", content: "抵押物变现为补充来源", tone: "warning", resolvedText: "还款来源改为经营回款与抵押物处置共同覆盖。" },
        { id: "meeting", label: "会议纪要", content: "销售回款 + 股东增信联合覆盖", tone: "warning", resolvedText: "还款来源改为销售回款与股东增信联合覆盖。" },
      ],
    },
    {
      id: 3,
      type: "信息缺失",
      field: "股权变动",
      page: 2,
      targetId: "report-field-equityChange",
      sources: [
        { id: "report", label: "报告内容", content: "访谈记录 (无变动)", tone: "neutral" },
        { id: "registry", label: "工商信息", content: "工商信息显示 2024-09 存在股权比例调整", tone: "warning", resolvedText: "股权结构按工商变更记录补充近一年股权调整说明。" },
      ],
    },
  ];

  const traces = [
    {
      id: 1,
      section: "第一章：企业基本情况",
      content: `${projectName}成立于2010年，主要从事工业自动化设备的研发与生产...`,
      source: "工商登记信息 / 官方网站",
      confidence: 0.98,
      targetId: "report-field-historyAndBusiness",
      materialTitle: `${projectName}工商登记与官网摘要`,
      materialExcerpt: `${projectName}成立于2010年，注册地位于上海市张江高科技园区，经营范围包括工业自动化设备研发、生产、销售与技术服务。官网公开材料显示，公司已形成智能组装线、精密检测设备及工业机器人集成三类核心产品线。`,
    },
    {
      id: 2,
      section: "第三章：财务状况分析",
      content: "2024年实现营业收入1.2亿元，净利润1500万元，同比增长12%...",
      source: `${projectName}2024年财务报表.pdf (第12页)`,
      confidence: 1.0,
      targetId: "report-field-netProfit",
      materialTitle: `${projectName}2024年财务报表摘录`,
      materialExcerpt: "2024年度公司实现营业收入120,000,000元，净利润15,000,000元，经营活动现金流保持净流入。主营业务毛利率较上年基本稳定，应收账款余额同比增长但仍处于可控区间。",
    },
    {
      id: 3,
      section: "第五章：访谈核心观点",
      content: "受访人表示，公司未来三年将重点布局新能源汽车零部件市场...",
      source: "访谈录音 (02:55 - 03:45)",
      confidence: 0.92,
      targetId: "report-field-mainBusiness",
      materialTitle: "管理层访谈录音转写",
      materialExcerpt: "受访管理层表示，未来三年公司将重点布局新能源汽车零部件市场，并围绕核心客户推进区域交付网络建设。同时会逐步优化客户结构，提升高毛利项目的占比。",
    },
  ];

  const aiGeneratedFields = [
    {
      id: "companyName",
      name: "企业名称",
      section: "企业基本情况",
      content: projectName === "A公司" ? "上海小狸智能科技有限公司" : projectName,
      source: "工商登记信息",
      confidence: 0.98,
      status: "normal",
      rule: "优先取工商登记主体名称，缺失时取项目录入企业名称。",
      targetId: "report-field-companyName",
      highlightText: projectName === "A公司" ? "上海小狸智能科技有限公司" : projectName,
      sourceFiles: [
        { name: `${projectName}工商登记信息.pdf`, detail: `${projectName}工商登记信息显示，主体名称、注册资本、注册地址与经营范围均已核验。` },
      ],
    },
    {
      id: "branch",
      name: "管辖支行",
      section: "报审方案及尽调情况",
      content: "浦东科技支行",
      source: "客户经理录入 / 分行客户归属表",
      confidence: 0.96,
      status: "normal",
      rule: "优先使用 CRM 客户归属信息，若为空则取尽调项目创建人所在机构。",
      targetId: "report-field-branch",
      highlightText: "浦东科技支行",
      sourceFiles: [
        { name: "客户归属关系表.xlsx", detail: "客户归属机构为浦东科技支行，客户经理为王敏、刘洋。" },
      ],
    },
    {
      id: "investigators",
      name: "调查人",
      section: "报审方案及尽调情况",
      content: "王敏、刘洋",
      source: "项目成员 / 访谈记录",
      confidence: 0.95,
      status: "normal",
      rule: "取尽调项目成员中角色为客户经理或协办调查人的人员。",
      targetId: "report-field-investigators",
      highlightText: "王敏、刘洋",
      sourceFiles: [
        { name: "尽调项目成员清单.xlsx", detail: "本项目调查人为王敏、刘洋，均已参与现场访谈。" },
      ],
    },
    {
      id: "industry",
      name: "行业分类",
      section: "报审方案及尽调情况",
      content: "工业自动化设备制造",
      source: "工商登记 / 企业大数据",
      confidence: 0.91,
      status: "normal",
      rule: "结合工商行业门类和主营产品描述，归并为银行内部行业分类。",
      targetId: "report-field-industry",
      highlightText: "工业自动化设备制造",
      sourceFiles: [
        { name: `${projectName}企业大数据抓取结果.json`, detail: "系统识别企业所属行业为专用设备制造业，主营自动化生产线和工业机器人集成。" },
      ],
    },
    {
      id: "creditAmount",
      name: "申请额度",
      section: "授信方案",
      content: "1,500万元流动资金贷款",
      source: "授信申请书",
      confidence: 0.99,
      status: "normal",
      rule: "取授信申请书中的本次申请额度与品种字段。",
      targetId: "report-field-creditAmount",
      highlightText: "1,500万元流动资金贷款",
      sourceFiles: [
        { name: "授信申请书.docx", detail: "客户本次申请流动资金贷款1,500万元，期限12个月。" },
      ],
    },
    {
      id: "loanPurpose",
      name: "贷款用途",
      section: "授信方案",
      content: "采购伺服电机、视觉模组等原材料",
      source: "采购合同 / 访谈记录",
      confidence: 0.93,
      status: "normal",
      rule: "贷款用途需与采购合同、订单及访谈口径一致。",
      targetId: "report-field-loanPurpose",
      highlightText: "采购伺服电机、视觉模组等原材料",
      sourceFiles: [
        { name: "采购合同汇总.xlsx", detail: "未来三个月计划采购伺服电机、视觉模组、控制器等核心原材料。" },
        { name: "管理层访谈录音转写.md", detail: "受访人确认本次资金主要用于新增订单备货采购。" },
      ],
    },
    {
      id: "guaranteeMethod",
      name: "担保方式",
      section: "授信方案",
      content: "厂房抵押 + 控股股东保证",
      source: "抵押方案 / 授信申请书",
      confidence: 0.95,
      status: "normal",
      rule: "合并授信申请书与抵押方案中的担保措施，按主担保在前、补充担保在后排序。",
      targetId: "report-field-guaranteeMethod",
      highlightText: "厂房抵押 + 控股股东保证",
      sourceFiles: [
        { name: "抵押方案.pdf", detail: "拟以位于上海市浦东新区的自有厂房提供抵押，并追加控股股东连带责任保证。" },
      ],
    },
    {
      id: "establishDate",
      name: "成立时间",
      section: "申请人基本情况",
      content: "2015年6月12日",
      source: "营业执照 / 工商登记信息",
      confidence: 0.99,
      status: "normal",
      rule: "取营业执照成立日期，日期格式统一为中文年月日。",
      targetId: "report-field-establishDate",
      highlightText: "2015年6月12日",
      sourceFiles: [
        { name: "营业执照.pdf", detail: "营业执照显示成立日期为2015年6月12日。" },
      ],
    },
    {
      id: "registeredCapital",
      name: "注册资本",
      section: "申请人基本情况",
      content: "5,000万元人民币",
      source: "工商登记信息",
      confidence: 0.98,
      status: "normal",
      rule: "取工商登记注册资本字段，并保留币种。",
      targetId: "report-field-registeredCapital",
      highlightText: "5,000万元人民币",
      sourceFiles: [
        { name: `${projectName}工商登记信息.pdf`, detail: "注册资本为5,000万元人民币，实缴资本与章程约定一致。" },
      ],
    },
    {
      id: "legalRepresentative",
      name: "法定代表人",
      section: "申请人基本情况",
      content: "张晨",
      source: "营业执照 / 工商登记信息",
      confidence: 0.97,
      status: "normal",
      rule: "取营业执照法定代表人字段，与工商登记数据交叉校验。",
      targetId: "report-field-legalRepresentative",
      highlightText: "张晨",
      sourceFiles: [
        { name: "营业执照.pdf", detail: "法定代表人为张晨，与工商登记记录一致。" },
      ],
    },
    {
      id: "actualController",
      name: "实际控制人",
      section: "申请人基本情况",
      content: "张晨，持股62%",
      source: "股东名册 / 工商登记信息",
      confidence: 0.88,
      status: "normal",
      rule: "按持股比例、表决权安排和访谈口径综合判断实际控制人。",
      targetId: "report-field-actualController",
      highlightText: "张晨，持股62%",
      sourceFiles: [
        { name: "股东名册.xlsx", detail: "张晨直接持股62%，为第一大股东并负责公司经营决策。" },
      ],
    },
    {
      id: "officeAddress",
      name: "注册地址",
      section: "申请人基本情况",
      content: "上海市浦东新区张江路88号",
      source: "工商登记信息",
      confidence: 0.98,
      status: "normal",
      rule: "注册地址取工商登记地址；若现场经营地址不同，另列实际经营地址。",
      targetId: "report-field-officeAddress",
      highlightText: "上海市浦东新区张江路88号",
      sourceFiles: [
        { name: `${projectName}工商登记信息.pdf`, detail: "注册地址为上海市浦东新区张江路88号。" },
      ],
    },
    {
      id: "operatingAddress",
      name: "实际经营地址",
      section: "申请人基本情况",
      content: "上海市浦东新区金科路666号2号楼",
      source: "现场尽调照片 / 租赁合同",
      confidence: 0.92,
      status: "normal",
      rule: "实际经营地址优先取现场尽调记录和租赁合同，需与照片定位信息校验。",
      targetId: "report-field-operatingAddress",
      highlightText: "上海市浦东新区金科路666号2号楼",
      sourceFiles: [
        { name: "现场走访照片.zip", detail: "现场照片定位显示经营场所位于上海市浦东新区金科路666号2号楼。" },
        { name: "办公场地租赁合同.pdf", detail: "租赁合同地址与现场走访地址一致。" },
      ],
    },
    {
      id: "historyAndBusiness",
      name: "历史沿革及主营业务",
      section: "申请人基本情况",
      content: "公司自2015年成立以来持续从事工业自动化产线集成，2022年起新增新能源装备检测线业务。",
      source: "工商变更记录 / 官网 / 访谈记录",
      confidence: 0.9,
      status: "normal",
      rule: "综合工商变更、官网业务介绍和管理层访谈，归纳主营业务变化。",
      targetId: "report-field-historyAndBusiness",
      highlightText: "2015年成立以来持续从事工业自动化产线集成",
      sourceFiles: [
        { name: "工商变更记录.pdf", detail: "公司近三年未发生主营业务范围重大变更。" },
        { name: "管理层访谈录音转写.md", detail: "管理层称2022年起新增新能源装备检测线业务，收入占比逐步提升。" },
      ],
    },
    {
      id: "mainBusiness",
      name: "主营业务",
      section: "经营能力分析",
      content: "智能装配线、精密检测设备、工业机器人集成服务",
      source: "销售合同 / 官网 / 访谈记录",
      confidence: 0.93,
      status: "normal",
      rule: "按近一年收入贡献和合同类型归并主营业务。",
      targetId: "report-field-mainBusiness",
      highlightText: "智能装配线、精密检测设备、工业机器人集成服务",
      sourceFiles: [
        { name: "销售合同汇总.xlsx", detail: "近一年收入主要来自智能装配线、精密检测设备及工业机器人集成服务。" },
      ],
    },
    {
      id: "equityChange",
      name: "股权变动情况",
      section: "申请人基本情况",
      content: "控股股东张晨持股62%，2024年9月受让核心员工8%股权。",
      source: "工商变更记录 / 访谈记录",
      confidence: 0.64,
      status: "conflict",
      rule: "工商变更信息优先级高于访谈口径，差异需标记并要求人工确认。",
      targetId: "report-field-equityChange",
      highlightText: "2024年9月受让核心员工8%股权",
      conflict: conflicts[2],
      sourceFiles: [
        { name: `管理层访谈录音转写.md`, detail: `访谈口径：公司近一年无重大股权变动。` },
        { name: `${projectName}工商变更记录.pdf`, detail: `工商信息显示：2024年9月存在股权结构调整记录。` },
      ],
    },
    {
      id: "creditSituation",
      name: "征信情况",
      section: "征信及风险情况",
      content: "企业征信无逾期，当前贷款余额2,800万元；实控人个人征信近24个月无逾期。",
      source: "企业征信报告 / 个人征信授权查询",
      confidence: 0.94,
      status: "normal",
      rule: "企业和实际控制人征信分别列示，逾期、关注类贷款和对外担保需重点标注。",
      targetId: "report-field-creditSituation",
      highlightText: "企业征信无逾期，当前贷款余额2,800万元",
      sourceFiles: [
        { name: "企业征信报告.pdf", detail: "企业征信无逾期，当前贷款余额2,800万元，无关注类贷款。" },
        { name: "实际控制人个人征信.pdf", detail: "实控人近24个月无逾期，信用卡使用率处于正常区间。" },
      ],
    },
    {
      id: "revenue2024",
      name: "2024年营业收入",
      section: "企业基本情况",
      content: "1.2亿元",
      source: "财务报表 / 访谈记录 / 销售台账",
      confidence: 0.76,
      status: "conflict",
      rule: "优先取审计财报，若访谈或销售台账差异超过 10%，标记冲突并等待人工确认。",
      targetId: "report-field-revenue2024",
      highlightText: "公司实现营业收入约1.2亿元",
      conflict: conflicts[0],
      sourceFiles: [
        { name: `${projectName}2024年财务报表.docx`, detail: `财务报表显示：2024年度营业收入约 1.2 亿元。` },
        { name: `管理层访谈录音转写.md`, detail: `管理层访谈口径显示：2024年度营业收入约 1.5 亿元。` },
        { name: `销售台账汇总.xlsx`, detail: `销售台账汇总口径显示：2024年度销售收入约 1.38 亿元。` },
      ],
    },
    {
      id: "netProfit",
      name: "2024年净利润",
      section: "财务状况分析",
      content: "1500万元",
      source: `${projectName}2024年财务报表.pdf`,
      confidence: 0.94,
      status: "normal",
      rule: "取财务报表利润表净利润字段。",
      targetId: "report-field-netProfit",
      highlightText: "净利润1500万元",
      sourceFiles: [
        { name: `${projectName}2024年财务报表.docx`, detail: `利润表显示：2024年度净利润 1500 万元。` },
      ],
    },
    {
      id: "repaymentPlan",
      name: "还款来源安排",
      section: "财务状况分析",
      content: "销售回款完全覆盖本次贷款本息，辅以股东增信与设备抵押。",
      source: "授信方案 / 会议纪要 / 抵押方案",
      confidence: 0.68,
      status: "conflict",
      rule: "同时读取授信方案、会议纪要和抵押方案，出现主还款来源差异时标记冲突。",
      targetId: "report-field-repaymentPlan",
      highlightText: "销售回款完全覆盖",
      conflict: conflicts[1],
      sourceFiles: [
        { name: `授信方案.docx`, detail: `授信方案描述：销售回款覆盖本次贷款本息，并辅以设备抵押。` },
        { name: `抵押方案.pdf`, detail: `抵押方案描述：核心还款保障来自抵押物变现。` },
        { name: `贷审会会议纪要.md`, detail: `会议纪要描述：销售回款与股东增信联合覆盖。` },
      ],
    },
    {
      id: "collateral",
      name: "抵押物情况",
      section: "担保分析",
      content: "自有厂房评估价值3,200万元，拟抵押率46.9%，权属清晰。",
      source: "不动产权证 / 评估报告 / 抵押方案",
      confidence: 0.92,
      status: "normal",
      rule: "抵押物价值取最近一期有效评估报告，抵押率按本次授信金额除以评估价值计算。",
      targetId: "report-field-collateral",
      highlightText: "自有厂房评估价值3,200万元",
      sourceFiles: [
        { name: "不动产权证.pdf", detail: "抵押物为公司自有厂房，权属人、坐落和面积与抵押方案一致。" },
        { name: "抵押物评估报告.pdf", detail: "评估价值3,200万元，本次拟抵押率约46.9%。" },
      ],
    },
    {
      id: "litigation",
      name: "涉诉及行政风险",
      section: "风险情况",
      content: "近三年无被执行记录，存在1起买卖合同纠纷已调解结案。",
      source: "法院执行网 / 企查查 / 法务访谈",
      confidence: 0.89,
      status: "normal",
      rule: "法院执行网优先，企查查和法务访谈用于补充案件状态。",
      targetId: "report-field-litigation",
      highlightText: "近三年无被执行记录",
      sourceFiles: [
        { name: "司法风险检索报告.pdf", detail: "近三年未检索到被执行记录，1起买卖合同纠纷已调解结案。" },
      ],
    },
    {
      id: "conclusion",
      name: "综合结论",
      section: "经营能力及风险结论",
      content: "建议给予1,500万元流动资金贷款授信，期限12个月，落实抵押登记和股东保证后放款。",
      source: "授信方案 / 风险核查结果 / 贷审规则",
      confidence: 0.86,
      status: "normal",
      rule: "结论需同时满足授信方案、担保落实和风险核查条件。",
      targetId: "report-field-conclusion",
      highlightText: "建议给予1,500万元流动资金贷款授信",
      sourceFiles: [
        { name: "授信方案.docx", detail: "方案建议给予1,500万元流动资金贷款，期限12个月。" },
        { name: "风控核查清单.xlsx", detail: "放款前需落实抵押登记、股东保证及资金用途受托支付。" },
      ],
    },
  ];

  const filteredAiGeneratedFields = aiGeneratedFields.filter((field) => {
    const keyword = fieldSearchKeyword.trim().toLowerCase();
    const reportContent = manualReportFieldContents[field.id] ?? field.content;
    const matchesKeyword =
      !keyword ||
      [field.name, field.section, reportContent, field.source]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    const matchesStatus = fieldStatusFilter === "all" || field.status === "conflict";

    return matchesKeyword && matchesStatus;
  });

  const selectedGeneratedField =
    aiGeneratedFields.find((field) => field.id === selectedGeneratedFieldId) ?? null;
  const selectedGeneratedFieldContent = selectedGeneratedField
    ? manualReportFieldContents[selectedGeneratedField.id] ?? selectedGeneratedField.content
    : "";
  const missingGeneratedFields = [
    {
      id: "taxRating",
      name: "纳税信用评级",
      section: "合规风险",
      reason: "上传资料未包含近两年纳税评级证明，公开渠道未返回有效结果。",
    },
    {
      id: "environmentalProof",
      name: "环保证明材料",
      section: "合规风险",
      reason: "资料包中未发现环评批复或排污许可文件，需客户补充。",
    },
  ];
  const conflictGeneratedFields = aiGeneratedFields.filter((field) => field.status === "conflict");
  const successGeneratedCount = aiGeneratedFields.length - conflictGeneratedFields.length;

  const getReportFieldLines = (field: typeof aiGeneratedFields[number], fallbackLines?: string[]) => {
    const manualContent = manualReportFieldContents[field.id];
    if (manualContent !== undefined) {
      const manualLines = manualContent.split("\n");
      return manualLines.length ? manualLines : [""];
    }

    return fallbackLines ?? [field.content];
  };

  const updateManualReportFieldContent = (fieldId: string, value: string) => {
    setManualReportFieldContents((previous) => {
      const next = { ...previous };
      const originalContent = aiGeneratedFields.find((field) => field.id === fieldId)?.content ?? "";

      if (value === originalContent) {
        delete next[fieldId];
      } else {
        next[fieldId] = value;
      }

      return next;
    });
  };

  const openFieldRuleModal = (field: typeof aiGeneratedFields[number]) => {
    setFieldRuleModal({
      isOpen: true,
      fieldName: field.name,
      currentRule: field.rule,
      dataSource: field.source,
      businessRule: field.status === "conflict" ? "存在多来源口径差异，需人工确认后再写入报告。" : "字段内容可直接写入报告，保持与来源文件一致。",
    });
  };

  const selectGeneratedField = (field: typeof aiGeneratedFields[number]) => {
    setSelectedGeneratedFieldId(field.id);
    setActiveEditTargetId(field.targetId);
  };

  const openSourceFileDetail = (
    field: typeof aiGeneratedFields[number],
    file: { name: string; detail: string },
  ) => {
    const target = window.open("", "_blank", "noopener,noreferrer");
    if (!target) return;

    target.document.write(`
      <!doctype html>
      <html lang="zh-CN">
        <head>
          <meta charset="utf-8" />
          <title>${file.name}</title>
          <style>
            body { margin: 0; background: #f8fafc; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
            main { max-width: 860px; margin: 48px auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 32px; box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08); }
            h1 { margin: 0; font-size: 22px; }
            .meta { margin-top: 10px; color: #64748b; font-size: 13px; }
            .block { margin-top: 24px; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; background: #f8fafc; }
            .label { color: #2563eb; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
            p { line-height: 1.8; font-size: 14px; }
          </style>
        </head>
        <body>
          <main>
            <h1>${file.name}</h1>
            <div class="meta">字段：${field.name} · 来源：${field.source}</div>
            <div class="block">
              <div class="label">命中内容</div>
              <p>${file.detail}</p>
            </div>
          </main>
        </body>
      </html>
    `);
    target.document.close();
  };

  const getSectionTargetId = (sectionId: string, paragraphIndex: number) => `edit-${sectionId}-${paragraphIndex}`;

  const registerEditTarget = (targetId: string) => (node: HTMLElement | SVGElement | null) => {
    editTargetRefs.current[targetId] = node;
  };

  const jumpToEditTarget = (targetId: string, tab: "conflict" | "traceability") => {
    setActiveAuditTab(tab);
    setActiveEditTargetId(targetId);

    window.requestAnimationFrame(() => {
      editTargetRefs.current[targetId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const applyEditConflictSource = (targetId: string, resolvedText?: string) => {
    if (!resolvedText) {
      jumpToEditTarget(targetId, "conflict");
      return;
    }

    const sectionMap: Record<string, { sectionId: string; index: number }> = {
      "edit-company-1": { sectionId: "company", index: 1 },
      "edit-financial-2": { sectionId: "financial", index: 2 },
      "edit-interview-1": { sectionId: "interview", index: 1 },
    };

    const target = sectionMap[targetId];
    if (!target) {
      jumpToEditTarget(targetId, "conflict");
      return;
    }

    setReportSections((previous) =>
      previous.map((section) =>
        section.id === target.sectionId
          ? {
              ...section,
              paragraphs: section.paragraphs.map((paragraph, index) =>
                index === target.index ? resolvedText : paragraph,
              ),
            }
          : section,
      ),
    );

    if (isEditingDocument) {
      setReportDraftSections((previous) =>
        previous.map((section) =>
          section.id === target.sectionId
            ? {
                ...section,
                paragraphs: section.paragraphs.map((paragraph, index) =>
                  index === target.index ? resolvedText : paragraph,
                ),
              }
            : section,
        ),
      );
    }

    jumpToEditTarget(targetId, "conflict");
  };

  const startDocumentEdit = () => {
    setReportDraftSections(
      reportSections.map((section) => ({
        ...section,
        paragraphs: [...section.paragraphs],
      })),
    );
    setIsEditingDocument(true);
  };

  const cancelDocumentEdit = () => {
    setIsEditingDocument(false);
    setReportDraftSections([]);
  };

  const saveDocumentEdit = () => {
    setReportSections(
      reportDraftSections.map((section, index) => ({
        ...section,
        title: section.title.trim() || reportSections[index]?.title || section.title,
        paragraphs: section.paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean),
      })),
    );
    cancelDocumentEdit();
  };

  const updateDraftSectionTitle = (sectionIndex: number, value: string) => {
    setReportDraftSections((previous) =>
      previous.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              title: value,
            }
          : section,
      ),
    );
  };

  const updateDraftParagraph = (sectionIndex: number, paragraphIndex: number, value: string) => {
    setReportDraftSections((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const nextParagraphs = [...section.paragraphs];
        nextParagraphs[paragraphIndex] = value;

        return {
          ...section,
          paragraphs: nextParagraphs,
        };
      }),
    );
  };

  const renderHighlightedParagraph = (sectionId: string, paragraphIndex: number, text: string) => {
    const highlightRules = {
      company: {
        0: {
          tab: "traceability" as const,
          text: `${projectName}（以下简称“公司”）成立于2010年，总部位于上海市张江高科技园区。`,
          className: "rounded bg-fuchsia-100 px-1 ring-1 ring-fuchsia-300 shadow-[0_0_0_1px_rgba(217,70,239,0.08)]",
        },
        1: {
          tab: "conflict" as const,
          text: "公司实现营业收入约1.2亿元，",
          className: "rounded bg-amber-200 px-1 ring-1 ring-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]",
        },
      },
      financial: {
        0: {
          tab: "traceability" as const,
          text: "2024年实现营业收入1.2亿元，净利润1500万元，",
          className: "rounded bg-fuchsia-100 px-1 ring-1 ring-fuchsia-300 shadow-[0_0_0_1px_rgba(217,70,239,0.08)]",
        },
        2: {
          tab: "conflict" as const,
          text: "销售回款完全覆盖",
          className: "rounded bg-amber-200 px-1 ring-1 ring-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]",
        },
      },
      interview: {
        0: {
          tab: "traceability" as const,
          text: "公司未来三年将重点布局新能源汽车零部件市场",
          className: "rounded bg-fuchsia-100 px-1 ring-1 ring-fuchsia-300 shadow-[0_0_0_1px_rgba(217,70,239,0.08)]",
        },
        1: {
          tab: "conflict" as const,
          text: "无重大股权变动",
          className: "rounded bg-amber-200 px-1 ring-1 ring-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]",
        },
      },
    } as const;

    const rule = highlightRules[sectionId as keyof typeof highlightRules]?.[paragraphIndex as 0 | 1 | 2];

    if (!rule || activeAuditTab !== rule.tab || !text.includes(rule.text)) {
      return text;
    }

    const highlightStart = text.indexOf(rule.text);
    const before = text.slice(0, highlightStart);
    const highlighted = text.slice(highlightStart, highlightStart + rule.text.length);
    const after = text.slice(highlightStart + rule.text.length);

    return (
      <>
        {before}
        <span className={rule.className}>{highlighted}</span>
        {after}
      </>
    );
  };

  const renderGeneratedFieldParagraph = (sectionId: string, paragraphIndex: number, text: string) => {
    const targetId = `edit-${sectionId}-${paragraphIndex}`;
    const field = aiGeneratedFields.find(
      (item) => item.targetId === targetId && text.includes(item.highlightText),
    );

    if (!field) {
      return renderHighlightedParagraph(sectionId, paragraphIndex, text);
    }

    const highlightStart = text.indexOf(field.highlightText);
    const before = text.slice(0, highlightStart);
    const highlighted = text.slice(highlightStart, highlightStart + field.highlightText.length);
    const after = text.slice(highlightStart + field.highlightText.length);
    const isSelected = selectedGeneratedFieldId === field.id;
    const hasConflict = field.status === "conflict";

    return (
      <>
        {before}
        <span
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            selectGeneratedField(field);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectGeneratedField(field);
            }
          }}
          className={`cursor-pointer rounded px-1 py-0.5 text-blue-700 outline-none ring-1 transition-all ${
            isSelected
              ? "bg-blue-100 ring-blue-400"
              : hasConflict
                ? "bg-orange-50 ring-orange-200 hover:bg-orange-100"
                : "bg-blue-50 ring-blue-200 hover:bg-blue-100"
          }`}
        >
          {highlighted}
        </span>
        {after}
      </>
    );
  };

  const currentWorkbenchTemplate =
    templates.find((template) => template.id === workbenchActiveTemplateId) ||
    templates.find((template) => template.status === "enabled") ||
    templates[0] ||
    null;

  const openWorkbenchTemplateInNewTab = (template: TemplateItem) => {
    const params = new URLSearchParams({
      view: "templatePreview",
      templateId: template.id,
    });
    window.open(`${window.location.pathname}?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const openWorkbenchTemplate = (template: TemplateItem, isNew = false) => {
    setWorkbenchTemplatePreview(template);
    setWorkbenchPreviewIsNew(isNew);
  };

  const handleWorkbenchTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    templateUploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    templateUploadTimersRef.current = [];
    setTemplateUploadStatus("uploading");

    const uploadTimer = window.setTimeout(() => {
      setTemplateUploadStatus("parsing");
    }, 900);

    const finishTimer = window.setTimeout(() => {
      const now = new Date();
      const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const nextTemplate: TemplateItem = {
        id: `tpl-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: "新上传的自定义模板，请点击编辑补充模板描述。",
        uploader: "当前用户",
        uploadTime: formatted,
        status: "enabled",
        category: TEMPLATE_OPTIONS[0].id,
      };
      setTemplates((prev) => [nextTemplate, ...prev]);
      setWorkbenchActiveTemplateId(nextTemplate.id);
      setTemplateUploadStatus("idle");
      event.target.value = "";
      openWorkbenchTemplate(nextTemplate, true);
    }, 2600);

    templateUploadTimersRef.current.push(uploadTimer, finishTimer);
  };

  const executeWorkbenchTemplateAction = () => {
    if (!templateConfirmModal.template || !templateConfirmModal.action) return;

    if (templateConfirmModal.action === "delete") {
      setTemplates((prev) => prev.filter((item) => item.id !== templateConfirmModal.template?.id));
    } else {
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === templateConfirmModal.template?.id
            ? { ...item, status: templateConfirmModal.action === "enable" ? "enabled" : "disabled" }
            : item,
        ),
      );
    }

    setTemplateConfirmModal({ isOpen: false, action: null, template: null });
  };

  const handleSelectWorkbenchTemplate = (template: TemplateItem) => {
    if (template.status !== "enabled") {
      setTemplateConfirmModal({
        isOpen: true,
        action: "enable",
        template,
      });
    }
    setWorkbenchActiveTemplateId(template.id);
    setShowWorkbenchTemplateSwitcher(false);
  };

  const saveWorkbenchTemplateEdit = () => {
    if (!templateEditModal.template || !templateEditModal.category.trim() || !templateEditModal.name.trim()) return;
    setTemplates((prev) =>
      prev.map((item) =>
        item.id === templateEditModal.template?.id
          ? {
              ...item,
              category: templateEditModal.category,
              name: templateEditModal.name.trim(),
              description: templateEditModal.description.trim(),
            }
          : item,
      ),
    );
    setTemplateEditModal({ isOpen: false, template: null, category: TEMPLATE_OPTIONS[0].id, name: "", description: "" });
  };

  const getGeneratedField = (fieldId: string) =>
    aiGeneratedFields.find((field) => field.id === fieldId) ?? null;

  const renderWordField = (
    fieldId: string,
    options: {
      fallback?: string;
      block?: boolean;
      className?: string;
    } = {},
  ) => {
    const field = getGeneratedField(fieldId);
    if (!field) return options.fallback ?? null;

    const value = manualReportFieldContents[field.id] ?? options.fallback ?? field.content;
    const isSelected = selectedGeneratedFieldId === field.id;
    const Component = options.block ? "div" : "span";

    return (
      <Component
        key={`${field.id}-${value}`}
        ref={registerEditTarget(field.targetId) as React.Ref<any>}
        role="button"
        tabIndex={0}
        contentEditable
        suppressContentEditableWarning
        onClick={(event) => {
          event.stopPropagation();
          selectGeneratedField(field);
        }}
        onBlur={(event) => {
          updateManualReportFieldContent(field.id, event.currentTarget.innerText.trim());
        }}
        className={`${options.block ? "block" : "inline"} cursor-text whitespace-pre-wrap rounded px-1 py-0.5 font-semibold outline-none ${
          field.status === "conflict" ? "text-orange-600" : "text-blue-600"
        } ${
          isSelected
            ? field.status === "conflict"
              ? "bg-orange-50 ring-2 ring-orange-300"
              : "bg-blue-50 ring-2 ring-blue-300"
            : field.status === "conflict"
              ? "ring-1 ring-orange-100 hover:bg-orange-50"
              : "ring-1 ring-blue-100 hover:bg-blue-50"
        } ${options.className ?? ""}`}
      >
        {value}
      </Component>
    );
  };

  const renderWordReportEditor = () => (
    <div className="mx-auto w-full max-w-[980px] pb-12" onClick={() => setSelectedGeneratedFieldId(null)}>
      <div className="mx-auto min-h-[1280px] w-[900px] bg-white px-[72px] py-[64px] text-[13px] leading-6 text-slate-900 shadow-2xl ring-1 ring-slate-200">
        <div className="mb-6 text-center font-serif">
          <h1 className="text-2xl font-bold tracking-normal">小微企业授信业务尽职调查报告</h1>
          <p className="mt-1 text-sm">（适用于 2000 万元以下公司授信业务）</p>
        </div>

        <section className="mb-6">
          <h2 className="border border-slate-900 bg-slate-200 px-2 py-1 text-base font-bold">一、报审方案及尽调情况</h2>
          <table className="w-full table-fixed border-collapse border border-slate-900 text-center">
            <tbody>
              <tr>
                <td className="w-32 border border-slate-900 bg-slate-100 px-2 py-2">企业名称</td>
                <td colSpan={3} className="border border-slate-900 px-2 py-2 text-left">
                  {renderWordField("companyName")}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">归属支行</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("branch")}</td>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">调查人（双人）</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("investigators")}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">行业分类</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("industry")}</td>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">申请额度</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("creditAmount")}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">贷款用途</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("loanPurpose")}</td>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">担保方式</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("guaranteeMethod")}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">授信期限</td>
                <td className="border border-slate-900 px-2 py-2 text-left">12个月</td>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">还款方式</td>
                <td className="border border-slate-900 px-2 py-2 text-left">按月付息，到期还本</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h2 className="border border-slate-900 bg-slate-200 px-2 py-1 text-base font-bold">二、申请人基本情况</h2>
          <table className="w-full table-fixed border-collapse border border-slate-900 text-center">
            <tbody>
              <tr>
                <td className="w-32 border border-slate-900 bg-slate-100 px-2 py-2">成立时间</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("establishDate")}</td>
                <td className="w-32 border border-slate-900 bg-slate-100 px-2 py-2">注册资本</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("registeredCapital")}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">法定代表人</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("legalRepresentative")}</td>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">实际控制人</td>
                <td className="border border-slate-900 px-2 py-2 text-left">{renderWordField("actualController")}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">注册地址</td>
                <td colSpan={3} className="border border-slate-900 px-2 py-2 text-left">{renderWordField("officeAddress")}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">实际经营地址</td>
                <td colSpan={3} className="border border-slate-900 px-2 py-2 text-left">{renderWordField("operatingAddress")}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">历史沿革和主营业务变动</td>
                <td colSpan={3} className="border border-slate-900 px-2 py-2 text-left">
                  {renderWordField("historyAndBusiness", { block: true })}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">股权结构</td>
                <td colSpan={3} className="border border-slate-900 px-2 py-2 text-left">
                  {renderWordField("equityChange", { block: true })}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2">主营业务</td>
                <td colSpan={3} className="border border-slate-900 px-2 py-2 text-left">
                  {renderWordField("mainBusiness", { block: true })}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h2 className="border border-slate-900 bg-slate-200 px-2 py-1 text-base font-bold">三、申请人及实际控制人征信情况</h2>
          <table className="w-full table-fixed border-collapse border border-slate-900">
            <tbody>
              <tr>
                <td className="w-32 border border-slate-900 bg-slate-100 px-2 py-2 text-center">征信情况</td>
                <td className="border border-slate-900 px-2 py-2">{renderWordField("creditSituation", { block: true })}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 bg-slate-100 px-2 py-2 text-center">涉诉信息</td>
                <td className="border border-slate-900 px-2 py-2">{renderWordField("litigation", { block: true })}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h2 className="border border-slate-900 bg-slate-200 px-2 py-1 text-base font-bold">四、经营能力、财务及担保分析</h2>
          <div className="border border-t-0 border-slate-900 px-4 py-3">
            <p className="mb-3 indent-8">
              申请人主营 {renderWordField("mainBusiness")}，前五大客户收入占比约54%，客户合作年限整体较长，但项目验收周期存在一定波动。
            </p>
            <p className="mb-3 indent-8">
              2024年营业收入为 {renderWordField("revenue2024")}，净利润为 {renderWordField("netProfit")}。整体财务表现稳健，应收账款随项目制业务扩张有所上升，后续需关注回款节奏。
            </p>
            <p className="mb-3 indent-8">
              还款来源安排为：{renderWordField("repaymentPlan")} 抵押物情况为：{renderWordField("collateral")}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="border border-slate-900 bg-slate-200 px-2 py-1 text-base font-bold">五、尽调结论</h2>
          <div className="border border-t-0 border-slate-900 px-4 py-3">
            <div className="indent-8">{renderWordField("conclusion", { block: true })}</div>
            <p className="mt-3 indent-8">放款后按月监测资金用途、主要客户回款及抵押物状态，出现重大异常应及时预警。</p>
          </div>
        </section>

        <div className="mt-12 grid grid-cols-2 gap-12 text-sm">
          <div>
            <p>主办客户经理签字：</p>
            <div className="mt-8 border-b border-slate-900" />
            <p className="mt-6">日期：2026年04月20日</p>
          </div>
          <div>
            <p>协办客户经理签字：</p>
            <div className="mt-8 border-b border-slate-900" />
            <p className="mt-6">日期：2026年04月20日</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMockField = (
    fieldId: string,
    x: number,
    y: number,
    lines?: string[],
    options: {
      width?: number;
      height?: number;
      fontSize?: number;
      anchor?: "start" | "middle";
    } = {},
  ) => {
    const field = getGeneratedField(fieldId);
    if (!field) return null;

    const fontSize = options.fontSize ?? 13;
    const textLines = getReportFieldLines(field, lines);
    const textAnchor = options.anchor ?? "start";
    const lineHeight = fontSize + 5;
    const width = options.width ?? 220;
    const height = options.height ?? Math.max(22, textLines.length * lineHeight + 6);
    const isSelected = selectedGeneratedFieldId === field.id;

    return (
      <g
        ref={registerEditTarget(field.targetId) as React.Ref<SVGGElement>}
        role="button"
        tabIndex={0}
        aria-label={`查看${field.name}来源`}
        onClick={(event) => {
          event.stopPropagation();
          selectGeneratedField(field);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectGeneratedField(field);
          }
        }}
        className="cursor-pointer outline-none"
      >
        <rect
          x={textAnchor === "middle" ? x - width / 2 : x - 4}
          y={y - fontSize - 4}
          width={width}
          height={height}
          rx={3}
          fill={isSelected ? "#eff6ff" : "transparent"}
          stroke={isSelected ? "#2563eb" : "transparent"}
          strokeWidth={isSelected ? 1.5 : 0}
        />
        <text
          x={x}
          y={y}
          fill={field.status === "conflict" ? "#ea580c" : "#dc2626"}
          fontSize={fontSize}
          fontWeight={600}
          textAnchor={textAnchor}
        >
          {textLines.map((line, index) => (
            <tspan key={`${fieldId}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  const renderMockReportImage = () => (
    <svg
      viewBox="0 0 900 2680"
      className="block h-auto w-full select-none rounded-sm bg-slate-100 shadow-2xl"
      role="img"
      aria-label="小微企业授信业务尽职调查报告 MOCK 图片"
      onClick={() => setSelectedGeneratedFieldId(null)}
    >
      <defs>
        <filter id="report-page-shadow" x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>
      </defs>
      <rect width="900" height="2680" fill="#eef2f7" />

      <g fontFamily="'SimSun', 'Microsoft YaHei', sans-serif" fill="#111827">
        <g filter="url(#report-page-shadow)">
          <rect x="70" y="28" width="760" height="800" fill="#ffffff" />
        </g>
        <g transform="translate(90 48)" fontSize="12">
          <text x="380" y="20" textAnchor="middle" fontSize="22" fontWeight="700">
            小微企业授信业务尽职调查报告
          </text>
          <text x="380" y="44" textAnchor="middle" fontSize="13">
            （适用于 2000 万元以下公司授信业务）
          </text>

          <rect x="0" y="70" width="720" height="22" fill="#d9d9d9" stroke="#111827" strokeWidth="1" />
          <text x="8" y="86" fontSize="14" fontWeight="700">一、报审方案及尽调情况</text>
          <rect x="0" y="92" width="720" height="146" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <line x1="145" y1="92" x2="145" y2="238" stroke="#111827" />
          <line x1="360" y1="118" x2="360" y2="238" stroke="#111827" />
          <line x1="505" y1="118" x2="505" y2="238" stroke="#111827" />
          {[118, 144, 170, 196, 222].map((lineY) => (
            <line key={`top-${lineY}`} x1="0" y1={lineY} x2="720" y2={lineY} stroke="#111827" />
          ))}
          <text x="18" y="111">企业名称</text>
          {renderMockField("companyName", 170, 111, undefined, { width: 490 })}
          <text x="18" y="137">归属支行</text>
          {renderMockField("branch", 170, 137, undefined, { width: 170 })}
          <text x="382" y="137">调查人（双人）</text>
          {renderMockField("investigators", 530, 137, undefined, { width: 160 })}
          <text x="18" y="163">行业分类</text>
          {renderMockField("industry", 170, 163, undefined, { width: 170 })}
          <text x="382" y="163">申请额度</text>
          {renderMockField("creditAmount", 530, 163, undefined, { width: 170 })}
          <text x="18" y="189">贷款用途</text>
          {renderMockField("loanPurpose", 170, 189, ["采购伺服电机、视觉模组", "等原材料"], { width: 325, height: 42 })}
          <text x="382" y="189">担保方式</text>
          {renderMockField("guaranteeMethod", 530, 189, ["厂房抵押 +", "控股股东保证"], { width: 170, height: 42 })}
          <text x="18" y="215">授信期限</text>
          <text x="170" y="215">12个月</text>
          <text x="382" y="215">还款方式</text>
          <text x="530" y="215">按月付息，到期还本</text>

          <rect x="0" y="258" width="720" height="22" fill="#d9d9d9" stroke="#111827" strokeWidth="1" />
          <text x="8" y="274" fontSize="14" fontWeight="700">二、申请人基本情况</text>
          <rect x="0" y="280" width="720" height="250" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <line x1="120" y1="280" x2="120" y2="530" stroke="#111827" />
          <line x1="300" y1="280" x2="300" y2="384" stroke="#111827" />
          <line x1="430" y1="280" x2="430" y2="384" stroke="#111827" />
          {[306, 332, 358, 384, 426, 474].map((lineY) => (
            <line key={`basic-${lineY}`} x1="0" y1={lineY} x2="720" y2={lineY} stroke="#111827" />
          ))}
          <text x="18" y="299">成立时间</text>
          {renderMockField("establishDate", 138, 299, undefined, { width: 145 })}
          <text x="318" y="299">注册资本</text>
          {renderMockField("registeredCapital", 448, 299, undefined, { width: 150 })}
          <text x="18" y="325">法定代表人</text>
          {renderMockField("legalRepresentative", 138, 325, undefined, { width: 130 })}
          <text x="318" y="325">实际控制人</text>
          {renderMockField("actualController", 448, 325, undefined, { width: 165 })}
          <text x="18" y="351">注册地址</text>
          {renderMockField("officeAddress", 138, 351, undefined, { width: 520 })}
          <text x="18" y="377">实际经营地址</text>
          {renderMockField("operatingAddress", 138, 377, undefined, { width: 520 })}
          <text x="18" y="408">历史沿革和主营业务变动</text>
          {renderMockField("historyAndBusiness", 138, 408, [
            "2015年成立以来持续从事工业自动化产线集成，",
            "2022年起新增新能源装备检测线业务。"
          ], { width: 560, height: 43 })}
          <text x="18" y="456">股权结构</text>
          {renderMockField("equityChange", 138, 456, [
            "控股股东张晨持股62%，",
            "2024年9月受让核心员工8%股权。"
          ], { width: 560, height: 43 })}
          <text x="18" y="504">主营业务</text>
          {renderMockField("mainBusiness", 138, 504, [
            "智能装配线、精密检测设备、",
            "工业机器人集成服务"
          ], { width: 560, height: 43 })}

          <rect x="0" y="552" width="720" height="22" fill="#d9d9d9" stroke="#111827" strokeWidth="1" />
          <text x="8" y="568" fontSize="14" fontWeight="700">三、申请人及实际控制人征信情况</text>
          <rect x="0" y="574" width="720" height="104" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <line x1="130" y1="574" x2="130" y2="678" stroke="#111827" />
          <line x1="0" y1="626" x2="720" y2="626" stroke="#111827" />
          <text x="18" y="606">征信情况</text>
          {renderMockField("creditSituation", 150, 600, [
            "企业征信无逾期，当前贷款余额2,800万元；",
            "实控人个人征信近24个月无逾期。"
          ], { width: 535, height: 44 })}
          <text x="18" y="656">涉诉信息</text>
          {renderMockField("litigation", 150, 652, [
            "近三年无被执行记录，",
            "存在1起买卖合同纠纷已调解结案。"
          ], { width: 535, height: 44 })}

          <text x="360" y="740" textAnchor="middle" fill="#9ca3af">第 1 页 / 共 3 页</text>
        </g>

        <g filter="url(#report-page-shadow)">
          <rect x="70" y="870" width="760" height="780" fill="#ffffff" />
        </g>
        <g transform="translate(90 890)" fontSize="12">
          <rect x="0" y="18" width="720" height="22" fill="#d9d9d9" stroke="#111827" strokeWidth="1" />
          <text x="8" y="34" fontSize="14" fontWeight="700">四、申请人经营能力分析（结合资料及访谈结论）</text>

          <rect x="0" y="40" width="720" height="112" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <line x1="128" y1="40" x2="128" y2="152" stroke="#111827" />
          <line x1="0" y1="96" x2="720" y2="96" stroke="#111827" />
          <text x="18" y="72">主营业务及生产销售分析</text>
          {renderMockField("mainBusiness", 148, 66, [
            "主营智能装配线、精密检测设备及工业机器人集成，",
            "前五大客户收入占比约54%。"
          ], { width: 535, height: 44 })}
          <text x="18" y="128">上下游情况</text>
          <text x="148" y="122" fill="#111827">上游为核心电子元器件供应商，下游集中于新能源汽车与3C制造客户。</text>

          <rect x="0" y="178" width="720" height="22" fill="#d9d9d9" stroke="#111827" strokeWidth="1" />
          <text x="8" y="194" fontSize="14" fontWeight="700">五、财务状况说明</text>
          <rect x="0" y="200" width="720" height="210" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <line x1="110" y1="200" x2="110" y2="410" stroke="#111827" />
          <line x1="250" y1="232" x2="250" y2="360" stroke="#111827" />
          <line x1="360" y1="232" x2="360" y2="360" stroke="#111827" />
          <line x1="470" y1="232" x2="470" y2="360" stroke="#111827" />
          <line x1="590" y1="232" x2="590" y2="360" stroke="#111827" />
          {[232, 264, 296, 328, 360].map((lineY) => (
            <line key={`finance-${lineY}`} x1="0" y1={lineY} x2="720" y2={lineY} stroke="#111827" />
          ))}
          <text x="18" y="222">项目</text>
          <text x="150" y="222">2022年</text>
          <text x="285" y="222">2023年</text>
          <text x="395" y="222">2024年</text>
          <text x="510" y="222">变化说明</text>
          <text x="18" y="254">营业收入</text>
          <text x="150" y="254">0.82亿元</text>
          <text x="285" y="254">1.05亿元</text>
          {renderMockField("revenue2024", 395, 254, ["1.20亿元"], { width: 90, height: 23 })}
          <text x="510" y="254">订单交付增长</text>
          <text x="18" y="286">净利润</text>
          <text x="150" y="286">820万元</text>
          <text x="285" y="286">1,180万元</text>
          {renderMockField("netProfit", 395, 286, ["1,500万元"], { width: 95, height: 23 })}
          <text x="510" y="286">毛利率基本稳定</text>
          <text x="18" y="318">应收账款</text>
          <text x="150" y="318">1,950万元</text>
          <text x="285" y="318">2,680万元</text>
          <text x="395" y="318">3,120万元</text>
          <text x="510" y="318">回款周期略有拉长</text>
          <text x="18" y="350">现金流</text>
          <text x="150" y="350">净流入</text>
          <text x="285" y="350">净流入</text>
          <text x="395" y="350">净流入</text>
          <text x="510" y="350">经营现金流稳定</text>
          <text x="18" y="390">财务评价</text>
          <text x="130" y="386">整体财务表现稳健，应收账款随项目制业务扩张有所上升，需持续关注回款节奏。</text>

          <rect x="0" y="438" width="720" height="22" fill="#d9d9d9" stroke="#111827" strokeWidth="1" />
          <text x="8" y="454" fontSize="14" fontWeight="700">六、还款来源及担保分析</text>
          <rect x="0" y="460" width="720" height="174" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <line x1="125" y1="460" x2="125" y2="634" stroke="#111827" />
          <line x1="0" y1="522" x2="720" y2="522" stroke="#111827" />
          <line x1="0" y1="582" x2="720" y2="582" stroke="#111827" />
          <text x="18" y="493">还款来源</text>
          {renderMockField("repaymentPlan", 145, 486, [
            "销售回款完全覆盖本次贷款本息，",
            "辅以股东增信与设备抵押。"
          ], { width: 530, height: 44 })}
          <text x="18" y="553">抵押情况</text>
          {renderMockField("collateral", 145, 546, [
            "自有厂房评估价值3,200万元，拟抵押率46.9%，",
            "权属清晰，无重复抵押。"
          ], { width: 530, height: 44 })}
          <text x="18" y="613">风控措施</text>
          <text x="145" y="608">贷款资金采用受托支付，按月监测主要客户回款及订单履约进度。</text>

          <text x="360" y="720" textAnchor="middle" fill="#9ca3af">第 2 页 / 共 3 页</text>
        </g>

        <g filter="url(#report-page-shadow)">
          <rect x="70" y="1692" width="760" height="850" fill="#ffffff" />
        </g>
        <g transform="translate(90 1712)" fontSize="12">
          <rect x="0" y="18" width="720" height="22" fill="#d9d9d9" stroke="#111827" strokeWidth="1" />
          <text x="8" y="34" fontSize="14" fontWeight="700">七、申请人经营风险及核查意见</text>
          <rect x="0" y="40" width="720" height="170" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <line x1="130" y1="40" x2="130" y2="210" stroke="#111827" />
          {[96, 152].map((lineY) => (
            <line key={`risk-${lineY}`} x1="0" y1={lineY} x2="720" y2={lineY} stroke="#111827" />
          ))}
          <text x="18" y="72">经营风险</text>
          <text x="150" y="66">前五大客户收入占比较高，个别项目验收周期拉长，需持续跟踪订单交付质量。</text>
          <text x="18" y="128">财务风险</text>
          <text x="150" y="122">应收账款规模随业务增长上升，需关注账龄结构及回款节点。</text>
          <text x="18" y="184">合规风险</text>
          {renderMockField("litigation", 150, 178, [
            "近三年无被执行记录，",
            "1起买卖合同纠纷已调解结案。"
          ], { width: 520, height: 44 })}

          <rect x="0" y="238" width="720" height="22" fill="#d9d9d9" stroke="#111827" strokeWidth="1" />
          <text x="8" y="254" fontSize="14" fontWeight="700">八、尽调结论</text>
          <rect x="0" y="260" width="720" height="188" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <text x="24" y="292">经资料核验、现场访谈、征信及司法检索，申请人经营持续，主营业务真实，</text>
          <text x="24" y="320">财务表现整体稳定，担保措施具备可操作性。结合本次资金用途及还款安排：</text>
          {renderMockField("conclusion", 24, 356, [
            "建议给予1,500万元流动资金贷款授信，期限12个月，",
            "落实抵押登记和股东保证后放款。"
          ], { width: 660, height: 44 })}
          <text x="24" y="414">放款后按月监测资金用途、主要客户回款及抵押物状态，出现重大异常应及时预警。</text>

          <rect x="0" y="486" width="720" height="154" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <line x1="360" y1="486" x2="360" y2="640" stroke="#111827" />
          <text x="32" y="522">主办客户经理签字：</text>
          <text x="392" y="522">协办客户经理签字：</text>
          <line x1="150" y1="560" x2="320" y2="560" stroke="#111827" />
          <line x1="510" y1="560" x2="680" y2="560" stroke="#111827" />
          <text x="32" y="610">日期：2026年04月20日</text>
          <text x="392" y="610">日期：2026年04月20日</text>

          <text x="360" y="780" textAnchor="middle" fill="#9ca3af">第 3 页 / 共 3 页</text>
        </g>
      </g>
    </svg>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-gray-100">
      <header className="h-16 shrink-0 border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 bg-white z-30">
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
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Download size={16} />
            <span>下载</span>
          </button>
        </div>
      </header>
      <DocxToolbar />
      <div className="min-h-0 flex-1 flex overflow-hidden">
        {/* Main Editor Area */}
        <div className="min-w-0 h-full flex-1 overflow-y-auto bg-slate-100 px-8 py-8">
          {renderWordReportEditor()}
        </div>

        <div className="hidden h-full min-h-0 w-[420px] shrink-0 border-l border-gray-200 bg-white lg:flex lg:flex-col xl:w-[460px]">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">AI 生成审查</h3>
                  <p className="text-[11px] text-gray-500">字段来源、准确性、计算规则审查</p>
                </div>
              </div>
              {selectedGeneratedField?.conflict && (
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                  冲突
                </span>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {!selectedGeneratedField ? (
              <div className="space-y-4">
                <section className="flex min-h-[148px] items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid w-full grid-cols-3 items-center gap-2">
                    <div className="flex min-h-[96px] flex-col items-center justify-center rounded-xl border border-green-100 bg-green-50 px-3 py-3 text-center">
                      <CheckCircle2 size={15} className="text-green-600" />
                      <p className="mt-2 text-xl font-black text-green-700">{successGeneratedCount}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-green-700">成功生成</p>
                    </div>
                    <div className="flex min-h-[96px] flex-col items-center justify-center rounded-xl border border-orange-100 bg-orange-50 px-3 py-3 text-center">
                      <AlertTriangle size={15} className="text-orange-600" />
                      <p className="mt-2 text-xl font-black text-orange-700">{conflictGeneratedFields.length}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-orange-700">数据冲突</p>
                    </div>
                    <div className="flex min-h-[96px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                      <Search size={15} className="text-slate-500" />
                      <p className="mt-2 text-xl font-black text-slate-700">{missingGeneratedFields.length}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-600">未找到</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-orange-600" />
                    <h4 className="text-sm font-bold text-orange-900">待确认冲突</h4>
                  </div>
                  <div className="space-y-2">
                    {conflictGeneratedFields.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => {
                          selectGeneratedField(field);
                          jumpToEditTarget(field.targetId, "conflict");
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-left transition-colors hover:border-orange-200 hover:bg-orange-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-slate-900">{field.name}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500">{field.source}</span>
                        </span>
                        <ChevronRight size={14} className="shrink-0 text-orange-500" />
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Search size={15} className="text-slate-500" />
                    <h4 className="text-sm font-bold text-slate-900">未找到数据</h4>
                  </div>
                  <div className="space-y-2">
                    {missingGeneratedFields.map((field) => (
                      <div key={field.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-xs font-bold text-slate-900">{field.name}</p>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            {field.section}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-slate-500">{field.reason}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-4">
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-base font-bold text-slate-950">{selectedGeneratedField.name}</h4>
                          {selectedGeneratedField.status === "conflict" ? (
                            <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                              冲突
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                              已校验
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{selectedGeneratedField.section}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-700">报告内容</label>
                      {manualReportFieldContents[selectedGeneratedField.id] !== undefined && (
                        <button
                          onClick={() => updateManualReportFieldContent(selectedGeneratedField.id, selectedGeneratedField.content)}
                          className="rounded-lg px-2 py-1 text-[11px] font-bold text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          恢复原文
                        </button>
                      )}
                    </div>
                    <textarea
                      value={selectedGeneratedFieldContent}
                      onChange={(event) => updateManualReportFieldContent(selectedGeneratedField.id, event.target.value)}
                      className="min-h-[132px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      修改会同步到左侧 Word 报告。冲突字段可在下方选择来源采纳。
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Database size={15} className="text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">来源文件</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedGeneratedField.sourceFiles.map((file) => (
                      <button
                        key={file.name}
                        type="button"
                        onClick={() => openSourceFileDetail(selectedGeneratedField, file)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
                        title={file.name}
                      >
                        <span className="min-w-0 truncate text-xs font-bold text-slate-700">{file.name}</span>
                        <ArrowRight size={13} className="shrink-0 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BookOpen size={15} className="text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900">抽取规则</h4>
                    </div>
                    <button
                      onClick={() => openFieldRuleModal(selectedGeneratedField)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      编辑规则
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold text-slate-400">数据口径</p>
                      <p className="mt-1 text-xs leading-5 text-slate-700">{selectedGeneratedField.source}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-bold text-slate-400">业务规则</p>
                      <p className="mt-1 text-xs leading-5 text-slate-700">
                        {selectedGeneratedField.status === "conflict"
                          ? "存在多来源口径差异，需人工确认后再写入报告。"
                          : "字段内容可直接写入报告，保持与来源文件一致。"}
                      </p>
                    </div>
                  </div>
                </section>

                {selectedGeneratedField.conflict && (
                  <section className="rounded-2xl border border-orange-200 bg-orange-50/70 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <AlertTriangle size={15} className="text-orange-600" />
                      <h4 className="text-sm font-bold text-orange-900">冲突数据</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedGeneratedField.conflict.sources.map((source) => (
                        <div
                          key={source.id}
                          className={`rounded-xl border p-3 ${
                            source.tone === "warning"
                              ? "border-orange-100 bg-white"
                              : "border-slate-100 bg-white/70"
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              source.tone === "warning" ? "text-orange-600" : "text-gray-400"
                            }`}>
                              {source.label}
                            </span>
                            <button
                              onClick={() => {
                                updateManualReportFieldContent(
                                  selectedGeneratedField.id,
                                  source.resolvedText ?? source.content,
                                );
                                jumpToEditTarget(selectedGeneratedField.targetId, "conflict");
                              }}
                              className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-blue-700"
                            >
                              采纳
                            </button>
                          </div>
                          <p className="text-xs leading-5 text-slate-700">{source.content}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <MaterialPreviewDialog
        preview={materialPreview}
        onClose={() => setMaterialPreview(null)}
        onLocate={jumpToEditTarget}
      />

      <AnimatePresence>
        {fieldRuleModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/35 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">规则设置</h3>
                  <p className="mt-1 text-sm text-slate-500">{fieldRuleModal.fieldName}</p>
                </div>
                <button
                  onClick={() => setFieldRuleModal({ isOpen: false, fieldName: "", currentRule: "", dataSource: "", businessRule: "" })}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">数据来源</span>
                  <textarea
                    value={fieldRuleModal.dataSource}
                    onChange={(event) =>
                      setFieldRuleModal((previous) => ({ ...previous, dataSource: event.target.value }))
                    }
                    className="min-h-[88px] w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">业务规则</span>
                  <textarea
                    value={fieldRuleModal.businessRule}
                    onChange={(event) =>
                      setFieldRuleModal((previous) => ({ ...previous, businessRule: event.target.value }))
                    }
                    className="min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs leading-6 text-blue-800">
                  保存后会将采用您制定的规则为这个项目生成新的模板，后续报告生成将按新的数据来源和业务规则执行。
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setFieldRuleModal({ isOpen: false, fieldName: "", currentRule: "", dataSource: "", businessRule: "" })}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={() => setFieldRuleModal({ isOpen: false, fieldName: "", currentRule: "", dataSource: "", businessRule: "" })}
                  className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  保存规则
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWorkbenchTemplateSwitcher && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWorkbenchTemplateSwitcher(false)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-xl rounded-[1.75rem] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">选择工作台模板</h3>
                  <p className="mt-1 text-sm text-slate-500">这里只切换当前报告工作台使用的模板，不会把整个“我的模板”页面搬进来。</p>
                </div>
                <button
                  onClick={() => setShowWorkbenchTemplateSwitcher(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {templates.map((template) => {
                  const isActive = template.id === currentWorkbenchTemplate?.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelectWorkbenchTemplate(template)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                          : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">{template.name}</p>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            {getTemplateCategoryTitle(template.category)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              template.status === "enabled" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {template.status === "enabled" ? "已启用" : "已禁用"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{template.description}</p>
                      </div>
                      {isActive ? (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">当前</span>
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
        {templateUploadStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-white/30 backdrop-blur-sm"
          >
            <div className="flex min-w-[260px] flex-col items-center gap-5 rounded-3xl bg-white px-8 py-8 shadow-xl">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                {templateUploadStatus === "parsing" && <FileText size={24} className="text-blue-600" />}
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{templateUploadStatus === "uploading" ? "正在上传..." : "正在解析..."}</p>
                <p className="mt-1 text-sm text-gray-500">{templateUploadStatus === "uploading" ? "请稍候，文件传输中" : "AI 正在提取模板结构与内容"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {templateConfirmModal.isOpen && templateConfirmModal.template && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${templateConfirmModal.action === "delete" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  <AlertCircle size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {templateConfirmModal.action === "delete"
                    ? "确认删除模板？"
                    : templateConfirmModal.action === "enable"
                      ? "确认启用模板？"
                      : "确认禁用模板？"}
                </h3>
              </div>
              <p className="mb-6 text-sm leading-6 text-gray-600">
                {templateConfirmModal.action === "delete"
                  ? `您确定要删除模板“${templateConfirmModal.template.name}”吗？此操作不可恢复。`
                  : `您确定要${templateConfirmModal.action === "enable" ? "启用" : "禁用"}模板“${templateConfirmModal.template.name}”吗？`}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setTemplateConfirmModal({ isOpen: false, action: null, template: null })}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={executeWorkbenchTemplateAction}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${templateConfirmModal.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  确认
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {templateEditModal.isOpen && templateEditModal.template && (
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
                    value={templateEditModal.category}
                    onChange={(event) => setTemplateEditModal((prev) => ({ ...prev, category: event.target.value }))}
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
                    value={templateEditModal.name}
                    onChange={(event) => setTemplateEditModal((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="请输入模板名称"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">模板描述</label>
                  <textarea
                    value={templateEditModal.description}
                    onChange={(event) => setTemplateEditModal((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="请输入模板描述"
                    className="h-24 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setTemplateEditModal({ isOpen: false, template: null, category: TEMPLATE_OPTIONS[0].id, name: "", description: "" })}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={saveWorkbenchTemplateEdit}
                  disabled={!templateEditModal.category.trim() || !templateEditModal.name.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {workbenchTemplatePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white"
          >
            <TemplatePreviewView
              template={workbenchTemplatePreview}
              isNew={workbenchPreviewIsNew}
              onBack={() => {
                setWorkbenchTemplatePreview(null);
                setWorkbenchPreviewIsNew(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- DSL Engine View Component ---

