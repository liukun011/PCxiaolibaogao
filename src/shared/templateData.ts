import { Activity, Building, TrendingUp } from "lucide-react";

export type ViewType =
  | "projectList"
  | "dashboard"
  | "audit"
  | "edit"
  | "intelligence"
  | "questionLists"
  | "templates"
  | "templatePreview";

export const TEMPLATE_OPTIONS = [
  { id: "bank", title: "银行流贷尽调", desc: "关注经营现金流与抵押物状况", icon: Building },
  { id: "equity", title: "股权投资尽调", desc: "侧重核心壁垒与团队稳定性", icon: TrendingUp },
  { id: "general", title: "通用访谈体检", desc: "覆盖企业全貌的标准清单", icon: Activity },
] as const;

export const getTemplateCategoryTitle = (category?: string) =>
  TEMPLATE_OPTIONS.find((option) => option.id === category)?.title ?? "未分类";

export type InterviewQuestion = {
  category: string;
  question: string;
  source: string;
  type: string;
};

export type QuestionCollection = {
  id: string;
  title: string;
  desc: string;
  questions: InterviewQuestion[];
};

export type TemplateItem = {
  id: string;
  name: string;
  description: string;
  uploader: string;
  uploadTime: string;
  status: "enabled" | "disabled";
  category?: string;
};

export type FieldConfig = {
  type: string;
  extractionMethod: string;
  dataSource: string;
  businessRule: string;
};

export const TEMPLATE_QUESTION_SETS: Record<string, InterviewQuestion[]> = {
  bank: [
    { category: "财务状况", question: "贵司近三个月的经营性现金流情况如何？主要的回款难点在何处？", source: "模板预设", type: "preset" },
    { category: "资产情况", question: "目前用于抵质押的资产占比多少？是否存在权利受限未披露的重资产？", source: "模板预设", type: "preset" },
    { category: "经营稳定", question: "上下游结算方式近期是否有重大调整？", source: "模板预设", type: "preset" },
  ],
  equity: [
    { category: "核心壁垒", question: "公司的核心技术相比竞品有哪些不可替代的优势？", source: "模板预设", type: "preset" },
    { category: "团队构成", question: "核心研发团队的留存计划是什么？是否签署竞业协议？", source: "模板预设", type: "preset" },
    { category: "合规风控", question: "是否存在尚未了结的重大知识产权争议？", source: "模板预设", type: "preset" },
  ],
  general: [
    { category: "企业概况", question: "公司未来三年的发展战略和核心增长点是什么？", source: "模板预设", type: "preset" },
    { category: "市场环境", question: "目前的行业竞争格局如何？贵司的市场占有率处于什么水平？", source: "模板预设", type: "preset" },
  ],
};

export const INITIAL_TEMPLATE_ITEMS: TemplateItem[] = [
  {
    id: "tpl-1",
    name: "授信调查报告",
    description: "用于企业客户授信前的标准化尽职调查报告模板，包含财务分析与风险评估。",
    uploader: "张三",
    uploadTime: "2026-04-10 14:30",
    status: "enabled",
    category: "bank",
  },
  {
    id: "tpl-2",
    name: "季度财务分析",
    description: "标准化的季度财务数据汇总与分析报告模板，适用于各部门季度汇报。",
    uploader: "李四",
    uploadTime: "2026-04-10 16:15",
    status: "disabled",
    category: "general",
  },
  {
    id: "tpl-3",
    name: "尽职调查清单",
    description: "项目投资前期的尽职调查资料收集清单，涵盖法务、财务、业务等维度。",
    uploader: "王五",
    uploadTime: "2026-04-11 09:20",
    status: "enabled",
    category: "equity",
  },
];

export const createDefaultField = (rule: string): FieldConfig => ({
  type: "文本",
  extractionMethod: "直接抽取",
  dataSource: "材料提取",
  businessRule: rule,
});
