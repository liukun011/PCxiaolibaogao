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
export const IntelligenceView = ({ onBack, onComplete, initialCompanyName = "", initialStep = "input" }: {
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
              <h2 className="text-3xl font-bold text-slate-900">新建企业数据抓取</h2>
              <p className="text-slate-500">输入企业信息，小狸将自动抓取全网数据，用于补充企业外部信息与风险线索</p>
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
              <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">数据抓取中</span>
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


