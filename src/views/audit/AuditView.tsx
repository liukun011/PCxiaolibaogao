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
export const AuditView = ({ onBack, onDownloadConflict, onDownloadTraceability, intelligenceResult }: {
  onBack: () => void,
  onDownloadConflict: () => void,
  onDownloadTraceability: () => void,
  intelligenceResult?: any
}) => {
  const projectName = intelligenceResult?.companyName || "A公司";
  const [activeTab, setActiveTab] = useState<"conflict" | "traceability">("conflict");
  const auditTargetRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [materialPreview, setMaterialPreview] = useState<MaterialPreviewData | null>(null);
  const [auditSections, setAuditSections] = useState([
    {
      id: "company",
      title: "企业基本情况",
      paragraphs: [
        `${projectName}成立于2010年，总部位于上海市张江高科技园区。公司是一家专注于工业自动化设备研发、生产及销售的高新技术企业。`,
        "截至2024年底，公司注册资本为人民币5000万元。截至2024年底，公司实现营业收入约1.2亿元。公司主要产品涵盖智能组装线、精密检测设备以及工业机器人集成系统。",
      ],
    },
    {
      id: "financial",
      title: "财务状况分析",
      paragraphs: [
        "2024年实现营业收入1.2亿元，净利润1500万元。公司整体财务表现稳健。",
        "在还款来源方面，公司计划通过销售回款完全覆盖本次贷款本息。",
      ],
    },
    {
      id: "interview",
      title: "访谈核心观点",
      paragraphs: [
        "受访人表示，公司未来三年将重点布局新能源汽车零部件市场，并同步推进区域客户结构优化。",
        "访谈记录显示，公司近一年无重大股权变动，股东结构整体保持稳定。",
      ],
    },
  ]);

  const conflicts = [
    {
      id: 1,
      type: "数据不一致",
      field: "2024年营业收入",
      page: 1,
      targetId: "audit-company-revenue",
      sources: [
        { id: "report", label: "报告内容", content: "财务报表 (1.2亿)", tone: "neutral" },
        { id: "interview", label: "访谈记录", content: "管理层访谈 (1.5亿)", tone: "warning", resolvedText: "截至2024年底，公司实现营业收入约1.5亿元。" },
        { id: "ledger", label: "销售台账", content: "销售台账汇总 (1.38亿)", tone: "warning", resolvedText: "截至2024年底，公司实现营业收入约1.38亿元。" },
      ],
    },
    {
      id: 2,
      type: "逻辑冲突",
      field: "还款计划",
      page: 1,
      targetId: "audit-industry-repayment",
      sources: [
        { id: "report", label: "报告内容", content: "销售回款覆盖", tone: "neutral" },
        { id: "pledge", label: "抵押方案", content: "抵押物变现", tone: "warning", resolvedText: "在还款来源方面，公司计划通过抵押物变现覆盖本次贷款本息。" },
        { id: "meeting", label: "会议纪要", content: "销售回款 + 股东增信联合覆盖", tone: "warning", resolvedText: "在还款来源方面，公司计划通过销售回款与股东增信联合覆盖本次贷款本息。" },
      ],
    },
    {
      id: 3,
      type: "信息缺失",
      field: "股权变动",
      page: 2,
      targetId: "audit-interview-equity",
      sources: [
        { id: "report", label: "报告内容", content: "访谈记录 (无变动)", tone: "neutral" },
        { id: "registry", label: "工商信息", content: "工商信息 (有变动)", tone: "warning", resolvedText: "访谈记录显示，公司近一年存在股权变动，股东结构发生调整。" },
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
      targetId: "audit-company-overview",
      materialTitle: `${projectName}工商登记与官网摘要`,
      materialExcerpt: `${projectName}成立于2010年，注册地位于上海市张江高科技园区，经营范围包括工业自动化设备研发、生产、销售与技术服务。官网公开材料显示，公司已形成智能组装线、精密检测设备及工业机器人集成三类核心产品线。`,
    },
    {
      id: 2,
      section: "第二章：财务状况分析",
      content: "2024年实现营业收入1.2亿元，净利润1500万元，同比增长12%...",
      source: `${projectName}2024年财务报表.pdf (第12页)`,
      confidence: 1.0,
      targetId: "audit-industry-financials",
      materialTitle: `${projectName}2024年财务报表摘录`,
      materialExcerpt: "2024年度公司实现营业收入120,000,000元，净利润15,000,000元，经营活动现金流保持净流入。主营业务毛利率较上年基本稳定，应收账款余额同比增长但仍处于可控区间。",
    },
    {
      id: 3,
      section: "第三章：访谈核心观点",
      content: "受访人表示，公司未来三年将重点布局新能源汽车零部件市场...",
      source: "访谈录音 (02:55 - 03:45)",
      confidence: 0.92,
      targetId: "audit-interview-outlook",
      materialTitle: "管理层访谈录音转写",
      materialExcerpt: "受访管理层表示，未来三年公司将重点布局新能源汽车零部件市场，并围绕核心客户推进区域交付网络建设。同时会逐步优化客户结构，提升高毛利项目的占比。",
    },
  ];

  const aiGeneratedFields = [
    {
      id: "companyName",
      name: "企业名称",
      section: "企业基本情况",
      content: projectName,
      source: "工商登记信息",
      confidence: 0.98,
      status: "normal",
      rule: "优先取工商登记主体名称，缺失时取项目录入企业名称。",
      targetId: "edit-company-0",
      highlightText: projectName,
      sourceFiles: [
        { name: `${projectName}工商登记信息.pdf`, detail: `${projectName}工商登记信息显示，主体名称、注册资本、注册地址与经营范围均已核验。` },
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
      targetId: "edit-company-1",
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
      targetId: "edit-financial-0",
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
      targetId: "edit-financial-2",
      highlightText: "销售回款完全覆盖",
      conflict: conflicts[1],
      sourceFiles: [
        { name: `授信方案.docx`, detail: `授信方案描述：销售回款覆盖本次贷款本息，并辅以设备抵押。` },
        { name: `抵押方案.pdf`, detail: `抵押方案描述：核心还款保障来自抵押物变现。` },
        { name: `贷审会会议纪要.md`, detail: `会议纪要描述：销售回款与股东增信联合覆盖。` },
      ],
    },
    {
      id: "equityChange",
      name: "股权变动情况",
      section: "访谈核心观点",
      content: "访谈称无重大股权变动，工商信息显示近一年存在股权调整。",
      source: "访谈记录 / 工商信息",
      confidence: 0.64,
      status: "conflict",
      rule: "工商变更信息优先级高于访谈口径，差异需标记并要求人工确认。",
      targetId: "edit-interview-1",
      highlightText: "无重大股权变动",
      conflict: conflicts[2],
      sourceFiles: [
        { name: `管理层访谈录音转写.md`, detail: `访谈口径：公司近一年无重大股权变动。` },
        { name: `${projectName}工商变更记录.pdf`, detail: `工商信息显示：公司近一年存在股权结构调整记录。` },
      ],
    },
  ];

  const registerAuditTarget = (targetId: string) => (node: HTMLParagraphElement | null) => {
    auditTargetRefs.current[targetId] = node;
  };

  const jumpToAuditTarget = (targetId: string, tab: "conflict" | "traceability") => {
    setActiveTab(tab);
    setActiveTargetId(targetId);

    window.requestAnimationFrame(() => {
      auditTargetRefs.current[targetId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const applyAuditConflictSource = (targetId: string, resolvedText?: string) => {
    if (!resolvedText) {
      jumpToAuditTarget(targetId, "conflict");
      return;
    }

    const paragraphMap: Record<string, { sectionId: string; index: number }> = {
      "audit-company-revenue": { sectionId: "company", index: 1 },
      "audit-industry-repayment": { sectionId: "financial", index: 1 },
      "audit-interview-equity": { sectionId: "interview", index: 1 },
    };

    const target = paragraphMap[targetId];
    if (!target) {
      return;
    }

    setAuditSections((previous) =>
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

    jumpToAuditTarget(targetId, "conflict");
  };

  const renderAuditParagraph = (targetId: string, tab: "conflict" | "traceability", highlightText: string, text: string) => {
    if (activeTab !== tab || !text.includes(highlightText)) {
      return text;
    }

    const start = text.indexOf(highlightText);
    const before = text.slice(0, start);
    const middle = text.slice(start, start + highlightText.length);
    const after = text.slice(start + highlightText.length);
    const highlightClass =
      tab === "conflict"
        ? "bg-orange-100 border-b-2 border-orange-400 cursor-help px-1"
        : "bg-purple-50 border-b-2 border-purple-300 cursor-help px-1";

    return (
      <>
        {before}
        <span className={highlightClass}>{middle}</span>
        {after}
      </>
    );
  };

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
        <div />
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Report Document */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-200/50 flex flex-col items-center border-r border-gray-300">
          <div className="w-[700px] bg-white shadow-xl border border-gray-300 min-h-[1000px] p-[60px] space-y-6 relative mb-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-8 font-serif">{projectName}流贷尽调报告 (草案)</h1>
            {auditSections.map((section, sectionIndex) => (
              <section key={section.id} className={`space-y-4 ${sectionIndex > 0 ? "mt-8" : ""}`}>
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-800 pb-1 font-serif">
                  {sectionIndex + 1}. {section.title}
                </h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => {
                  const targetId = `audit-${section.id}-${paragraphIndex === 0 ? section.id === "company" ? "overview" : section.id === "financial" ? "financials" : "outlook" : section.id === "company" ? "revenue" : section.id === "financial" ? "repayment" : "equity"}`;

                  const paragraphContent =
                    targetId === "audit-company-overview"
                      ? renderAuditParagraph(targetId, "traceability", `${projectName}成立于2010年，总部位于上海市张江高科技园区。`, paragraph)
                      : targetId === "audit-company-revenue"
                        ? renderAuditParagraph(targetId, "conflict", "截至2024年底，公司实现营业收入约1.2亿元", paragraph)
                        : targetId === "audit-industry-financials"
                          ? renderAuditParagraph(targetId, "traceability", "2024年实现营业收入1.2亿元，净利润1500万元", paragraph)
                          : targetId === "audit-industry-repayment"
                            ? renderAuditParagraph(targetId, "conflict", "销售回款完全覆盖", paragraph)
                            : targetId === "audit-interview-outlook"
                              ? renderAuditParagraph(targetId, "traceability", "公司未来三年将重点布局新能源汽车零部件市场", paragraph)
                              : renderAuditParagraph(targetId, "conflict", "无重大股权变动", paragraph);

                  return (
                    <p
                      key={targetId}
                      ref={registerAuditTarget(targetId)}
                      className={`text-gray-700 leading-relaxed text-sm text-justify indent-8 relative group scroll-mt-24 ${
                        activeTargetId === targetId
                          ? activeTab === "conflict"
                            ? "rounded-xl ring-2 ring-amber-300 ring-offset-4 ring-offset-white"
                            : "rounded-xl ring-2 ring-fuchsia-300 ring-offset-4 ring-offset-white"
                          : ""
                      }`}
                    >
                      {paragraphContent}
                    </p>
                  );
                })}
              </section>
            ))}
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
                  <div
                    key={c.id}
                    onClick={() => jumpToAuditTarget(c.targetId, "conflict")}
                    className="cursor-pointer border border-gray-100 rounded-xl p-5 hover:border-orange-300 transition-all bg-white shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-gray-400 font-mono">#{idx + 1}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-4">{c.type}: {c.field}</h4>
                    <div className="space-y-3">
                      {c.sources.map((source) => (
                        <div
                          key={source.id}
                          className={`rounded-lg border p-3 ${
                            source.tone === 'warning'
                              ? 'border-orange-100 bg-orange-50/60'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className={`text-[10px] font-bold ${
                              source.tone === 'warning' ? 'text-orange-500' : 'text-gray-400'
                            }`}>
                              {source.label}
                            </span>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                applyAuditConflictSource(c.targetId, source.resolvedText);
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              采纳
                            </button>
                          </div>
                          <p className={`mt-2 text-xs italic ${
                            source.tone === 'warning' ? 'text-gray-700 font-medium' : 'text-gray-600'
                          }`}>
                            "{source.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-end">
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
                  <div
                    key={t.id}
                    onClick={() => jumpToAuditTarget(t.targetId, "traceability")}
                    className="space-y-4 group cursor-pointer"
                  >
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
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setMaterialPreview({
                          title: t.materialTitle,
                          section: t.section,
                          source: t.source,
                          excerpt: t.materialExcerpt,
                          targetId: t.targetId,
                          tab: "traceability",
                        });
                      }}
                      className="w-full py-2 text-[10px] font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
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
      <MaterialPreviewDialog
        preview={materialPreview}
        onClose={() => setMaterialPreview(null)}
        onLocate={jumpToAuditTarget}
      />
    </div>
  );
};


