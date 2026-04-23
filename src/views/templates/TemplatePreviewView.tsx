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
export const TemplatePreviewView = ({
  template,
  isNew,
  onBack,
}: {
  template: TemplateItem;
  isNew?: boolean;
  onBack: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeConfig, setActiveConfig] = useState<string | "global" | null>(null);
  const [formData, setFormData] = useState<Record<string, FieldConfig>>({
    companyNameRule: createDefaultField("优先从企业基本信息目录下的营业执照中提取，如果没有则从其他资料中补充。"),
    jurisdictionRule: createDefaultField("由手动录入或访谈资料识别。"),
    investigatorRule: createDefaultField("由项目成员手动维护。"),
    industryRule: createDefaultField("优先来自工商信息，其次来自访谈和文档资料。"),
    applyAmountRule: createDefaultField("来自授信申请材料或访谈确认结果。"),
    guaranteeMethodRule: createDefaultField("来自授信方案材料及访谈记录。"),
    establishTimeRule: createDefaultField("来自营业执照或工商登记信息。"),
    registeredCapitalRule: createDefaultField("来自营业执照或工商登记信息。"),
    registeredAddressRule: createDefaultField("来自营业执照。"),
    actualAddressRule: createDefaultField("优先来自访谈，如未提及则沿用注册地址。"),
    historyChangeRule: createDefaultField("来自历史沿革材料、工商变更记录及访谈补充。"),
    equityStructureRule: createDefaultField("来自股权结构图、工商穿透数据或客户提供材料。"),
    financeDescRule: createDefaultField("来自近三年财务报表与最近一期管理报表，并结合访谈进行解释。"),
  });

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const updateField = (key: string, value: FieldConfig) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderEditableField = (configKey: string) => {
    const value = formData[configKey];
    if (!value) return null;

    if (!isEditing) {
      return <span className="text-red-500">{value.businessRule}</span>;
    }

    return (
      <button
        onClick={() => setActiveConfig(configKey)}
        className={`group flex w-full items-center justify-between rounded border border-dashed px-3 py-2 text-left text-sm transition-all ${
          activeConfig === configKey
            ? "border-blue-500 bg-blue-100 text-blue-800 shadow-sm"
            : "border-blue-200 bg-blue-50/60 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <span className="truncate pr-3">{value.businessRule}</span>
        <Settings size={14} className={`shrink-0 ${activeConfig === configKey ? "text-blue-600" : "text-blue-400 opacity-0 group-hover:opacity-100"}`} />
      </button>
    );
  };

  const activeFieldConfig = activeConfig && activeConfig !== "global" ? formData[activeConfig] : null;

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-gray-800">{template.name}.docx</h1>
              {isNew && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                  刚刚上传
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setActiveConfig("global")}
                className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-100"
              >
                <Settings size={16} />
                全局配置
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setActiveConfig(null);
                }}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                <X size={16} />
                取消
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setActiveConfig(null);
                  setShowToast(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-100"
              >
                <Save size={16} />
                保存修改
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setActiveConfig("global");
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              <Edit3 size={16} />
              编辑模板
            </button>
          )}

          <div className="mx-1 h-6 w-px bg-gray-200" />

          <button className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
            <Download size={16} />
            下载源文件
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 justify-center overflow-auto p-8">
          <div className="min-h-[1056px] w-full max-w-[900px] rounded-sm border border-gray-200 bg-white p-12 shadow-sm md:p-16">
            <div className="mx-auto space-y-6 font-serif text-[14px] text-gray-800">
              <div className="mb-8 space-y-2 text-center">
                <h1 className="text-2xl font-bold text-gray-900">小微企业授信业务尽职调查报告</h1>
                <p className="text-sm text-gray-600">（适用于 2000 万元以下公司授信业务）</p>
              </div>

              <section>
                <h2 className="mb-0 border border-black bg-gray-100 p-1 text-lg font-bold">一、报审方案及尽调情况</h2>
                <table className="w-full border-collapse border border-black text-center text-sm">
                  <tbody>
                    <tr>
                      <td className="w-32 border border-black bg-gray-50 p-2">企业名称</td>
                      <td colSpan={3} className="border border-black p-2 text-left">{renderEditableField("companyNameRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">归属管辖</td>
                      <td className="border border-black p-2">{renderEditableField("jurisdictionRule")}</td>
                      <td className="w-32 border border-black bg-gray-50 p-2">调查人（双人）</td>
                      <td className="border border-black p-2">{renderEditableField("investigatorRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">行业分类</td>
                      <td className="border border-black p-2">{renderEditableField("industryRule")}</td>
                      <td className="border border-black bg-gray-50 p-2">申请额度</td>
                      <td className="border border-black p-2">{renderEditableField("applyAmountRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">担保方式</td>
                      <td colSpan={3} className="border border-black p-2 text-left">{renderEditableField("guaranteeMethodRule")}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="mt-6">
                <h2 className="mb-0 border border-black bg-gray-100 p-1 text-lg font-bold">二、申请人基本情况</h2>
                <table className="w-full border-collapse border border-black text-center text-sm">
                  <tbody>
                    <tr>
                      <td className="w-32 border border-black bg-gray-50 p-2">成立时间</td>
                      <td className="border border-black p-2">{renderEditableField("establishTimeRule")}</td>
                      <td className="w-24 border border-black bg-gray-50 p-2">注册资本</td>
                      <td className="border border-black p-2">{renderEditableField("registeredCapitalRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">注册地址</td>
                      <td colSpan={3} className="border border-black p-2 text-left">{renderEditableField("registeredAddressRule")}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-50 p-2">实际经营地址</td>
                      <td colSpan={3} className="border border-black p-2 text-left">{renderEditableField("actualAddressRule")}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="space-y-4 border border-t-0 border-black p-4">
                  <div>
                    <p className="font-bold">介绍历史沿革和主营业务变动情况：</p>
                    <div className="mt-2">{renderEditableField("historyChangeRule")}</div>
                  </div>
                  <div>
                    <p className="font-bold">股权结构如下（可图示或列表）：</p>
                    <div className="mt-2">{renderEditableField("equityStructureRule")}</div>
                  </div>
                </div>
              </section>

              <section className="mt-6">
                <h2 className="mb-0 border border-black bg-gray-100 p-1 text-lg font-bold">三、财务情况说明</h2>
                <div className="border border-t-0 border-black p-4">
                  {renderEditableField("financeDescRule")}
                </div>
              </section>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex w-[380px] shrink-0 flex-col border-l border-gray-200 bg-white">
            {!activeConfig ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-400">
                <Settings size={48} className="mb-4 text-gray-200" />
                <p>请在左侧选择需要配置的字段，或点击右上角进行全局配置</p>
              </div>
            ) : activeConfig === "global" ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
                    <Settings size={16} className="text-purple-600" />
                    模板全局处理逻辑配置
                  </h3>
                  <button
                    onClick={() => setActiveConfig(null)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 space-y-6 overflow-auto p-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800">全局处理策略</label>
                    <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                      <input type="radio" name="globalStrategy" className="mt-1" defaultChecked />
                      <div>
                        <div className="text-sm font-medium text-gray-800">精准匹配优先</div>
                        <div className="mt-0.5 text-xs text-gray-500">严格按字段配置提取，缺失则留空，不做主观推断。</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                      <input type="radio" name="globalStrategy" className="mt-1" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">智能补全优先</div>
                        <div className="mt-0.5 text-xs text-gray-500">规则提取失败时，允许模型结合上下文进行补全。</div>
                      </div>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-800">全局前置处理</label>
                    <textarea
                      rows={5}
                      defaultValue={"1. 对图片与 PDF 统一做 OCR 识别。\n2. 提取访谈录音中的关键实体信息。\n3. 对姓名、证件号等敏感信息进行脱敏。"}
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-purple-500"
                    />
                  </div>
                </div>
              </>
            ) : activeFieldConfig ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
                    <Settings size={16} className="text-blue-600" />
                    配置字段属性
                  </h3>
                  <button
                    onClick={() => setActiveConfig(null)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 space-y-5 overflow-auto p-6">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Database size={14} className="text-gray-400" />
                      数据来源
                    </label>
                    <input
                      value={activeFieldConfig.dataSource}
                      onChange={(event) => updateField(activeConfig, { ...activeFieldConfig, dataSource: event.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <BookOpen size={14} className="text-gray-400" />
                      业务规则
                    </label>
                    <textarea
                      rows={5}
                      value={activeFieldConfig.businessRule}
                      onChange={(event) => updateField(activeConfig, { ...activeFieldConfig, businessRule: event.target.value })}
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">字段类型</label>
                    <select
                      value={activeFieldConfig.type}
                      onChange={(event) => updateField(activeConfig, { ...activeFieldConfig, type: event.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    >
                      <option>文本</option>
                      <option>数字</option>
                      <option>布尔</option>
                      <option>时间</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">抽取方式</label>
                    <select
                      value={activeFieldConfig.extractionMethod}
                      onChange={(event) => updateField(activeConfig, { ...activeFieldConfig, extractionMethod: event.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    >
                      <option>直接抽取</option>
                      <option>归纳总结</option>
                      <option>计算</option>
                    </select>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-green-100 bg-white px-5 py-4 shadow-xl"
          >
            <CheckCircle2 size={20} className="text-green-600" />
            <div>
              <p className="text-sm font-bold text-gray-900">模板修改已保存</p>
              <p className="text-xs text-gray-500">新的字段规则已同步到模板配置中。</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


