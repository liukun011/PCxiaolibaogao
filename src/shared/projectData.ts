import React from "react";
import {
  Building,
  ClipboardCheck,
  FileText,
  FileText as FileIcon,
  MessageSquare,
  Mic,
  User,
} from "lucide-react";

export type ReportProjectStatus = "generated" | "generating" | "pending";

export type ReportProject = {
  id: number;
  title: string;
  desc: string;
  companyName: string;
  createdBy: string;
  createdAt: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  reportGenerated: boolean;
  status?: ReportProjectStatus;
  reportStatus?: ReportProjectStatus;
  reportProgress?: number;
  reportStage?: string;
};

export const INITIAL_REPORT_PROJECTS: ReportProject[] = [
  {
    id: 1,
    title: "小狸报告流贷尽调",
    companyName: "小狸报告",
    desc: "公司名称为“小狸报告”，主营AI智能报告生成。面向数字化转...",
    createdBy: "李销售",
    createdAt: "2026-03-19 16:09:08",
    icon: FileText,
    reportGenerated: true,
    reportStatus: "generated",
  },
  {
    id: 2,
    title: "A 公司经营尽调",
    companyName: "A 公司",
    desc: "公司名称为“a”，主营业务未提供，财务状况未提供相关信息...",
    createdBy: "王客户经理",
    createdAt: "2026-03-13 14:15:34",
    icon: Building,
    reportGenerated: false,
    status: "generating",
    reportProgress: 62,
    reportStage: "正在生成财务分析与风险提示",
  },
  {
    id: 3,
    title: "个人经营贷尽调",
    companyName: "个人客户",
    desc: "公司名称为“未提供”，主营业务未提供相关信息，财务状况未...",
    createdBy: "张尽调",
    createdAt: "2026-03-07 14:01:01",
    icon: User,
    reportGenerated: false,
  },
  {
    id: 4,
    title: "B 企业访谈尽调",
    companyName: "B 企业",
    desc: "访谈小总结未生成，请刷新生成。",
    createdBy: "陈分析师",
    createdAt: "2026-03-03 16:54:20",
    icon: MessageSquare,
    reportGenerated: false,
  },
  {
    id: 5,
    title: "11 号项目",
    companyName: "未提供",
    desc: "公司名称为“未提供”，主营业务未提供相关信息，财务状况未...",
    createdBy: "李销售",
    createdAt: "2026-03-02 15:07:28",
    icon: ClipboardCheck,
    reportGenerated: false,
  },
  {
    id: 6,
    title: "AA 访谈项目",
    companyName: "AA",
    desc: "访谈小总结未生成，请刷新生成。",
    createdBy: "周经理",
    createdAt: "2026-03-02 15:07:23",
    icon: Mic,
    reportGenerated: false,
  },
  {
    id: 7,
    title: "AA 企业资料尽调",
    companyName: "AA 企业",
    desc: "访谈小总结未生成，请刷新生成。",
    createdBy: "赵审核",
    createdAt: "2026-03-02 15:06:53",
    icon: FileText,
    reportGenerated: false,
  },
  {
    id: 8,
    title: "A 企业补充尽调",
    companyName: "A 企业",
    desc: "访谈小总结未生成，请刷新生成。",
    createdBy: "钱顾问",
    createdAt: "2026-02-25 15:23:39",
    icon: FileIcon,
    reportGenerated: false,
  },
];

export const getReportProjectStatus = (
  project: ReportProject,
  generatedReportIds: string[] = [],
): ReportProjectStatus => {
  const isGenerated = project.reportGenerated || generatedReportIds.includes(String(project.id));
  return project.status || project.reportStatus || (isGenerated ? "generated" : "pending");
};

export const getReportProjectStatusLabel = (status: ReportProjectStatus) => {
  if (status === "generated") return "已生成";
  if (status === "generating") return "生成中";
  return "未生成";
};
