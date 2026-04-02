/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InterviewTranscript {
  id: string;
  timestamp: string;
  speaker: string;
  text: string;
  startTime: number; // in seconds
  isModified?: boolean;
  originalText?: string;
  hasConflict?: boolean;
  conflictDetail?: string;
}

export interface DDQuestion {
  id: string;
  question: string;
  isHit: boolean;
  category?: string;
  hitTimestamp?: string;
  hitStartTime?: number;
  answerSummary?: string;
  isSummaryModified?: boolean;
  originalSummary?: string;
  hasConflict?: boolean;
  conflictDetail?: string;
}

export interface InterviewRecord {
  id: string;
  title: string;
  date: string;
  duration: string;
  transcripts: InterviewTranscript[];
  questions: DDQuestion[];
}

export interface ReportContentBlock {
  id: string;
  text: string;
  isModified?: boolean;
  originalText?: string;
  hasConflict?: boolean;
  conflictDetail?: string;
  sourceId?: string; // Reference to transcript ID or question ID
  sourceType?: 'transcript' | 'question' | 'document';
}

export interface ReportSection {
  id: string;
  title: string;
  blocks: ReportContentBlock[];
}

export interface ReportData {
  id: string;
  title: string;
  sections: ReportSection[];
}

export const mockInterview: InterviewRecord = {
  id: "rec-01",
  title: "A公司信贷尽调访谈录音",
  date: "2025-03-03 13:03:06",
  duration: "45:20",
  transcripts: [
    { id: "t1", timestamp: "00:12", speaker: "访谈员", text: "您好，感谢您接受我们的访谈。请问贵公司目前的信贷规模是多少？", startTime: 12 },
    { id: "t2", timestamp: "00:45", speaker: "受访人", text: "我们目前的总信贷规模大约在5000万左右，主要用于日常流动资金周转。", startTime: 45, hasConflict: true, conflictDetail: "检测到与财务报表中的短期借款数据(6200万)不符" },
    { id: "t3", timestamp: "01:15", speaker: "访谈员", text: "那么，贵公司在未来的还款计划上有什么具体的安排吗？", startTime: 75 },
    { id: "t4", timestamp: "01:40", speaker: "受访人", text: "我们计划通过下一季度的销售回款来覆盖大部分本金，同时我们也储备了一定的应急资金。", startTime: 100, isModified: true, originalText: "我们计划通过销售回款来覆盖本金。" },
    { id: "t5", timestamp: "02:30", speaker: "访谈员", text: "关于抵押物的情况，能否详细说明一下？", startTime: 150 },
    { id: "t6", timestamp: "02:55", speaker: "受访人", text: "目前的抵押物主要是位于工业园区的两栋厂房，评估价值在8000万左右。", startTime: 175 },
    { id: "t7", timestamp: "03:20", speaker: "访谈员", text: "好的，那关于公司的股权结构，是否有近期的变动？", startTime: 200 },
    { id: "t8", timestamp: "03:45", speaker: "受访人", text: "股权结构非常稳定，大股东持股比例一直保持在60%以上，近期没有任何变动。", startTime: 225 },
  ],
  questions: [
    { 
      id: "q1", 
      question: "明确公司目前的信贷规模", 
      isHit: true, 
      hitTimestamp: "00:45", 
      hitStartTime: 45, 
      answerSummary: "总信贷规模约5000万，用于流动资金。但与报表数据存在差异。",
      hasConflict: true,
      conflictDetail: "访谈数据(5000万)与报表数据(6200万)存在冲突"
    },
    { 
      id: "q2", 
      question: "核实未来的还款计划安排", 
      isHit: true, 
      hitTimestamp: "01:40", 
      hitStartTime: 100, 
      answerSummary: "通过下一季度销售回款覆盖本金，并储备应急资金。",
      isSummaryModified: true,
      originalSummary: "通过销售回款覆盖本金。"
    },
    { id: "q3", question: "详细了解抵押物评估情况", isHit: true, hitTimestamp: "02:55", hitStartTime: 175, answerSummary: "工业园区厂房，评估值约8000万。" },
    { id: "q4", question: "确认近期股权结构变动情况", isHit: true, hitTimestamp: "03:45", hitStartTime: 225, answerSummary: "股权稳定，大股东持股60%+，无变动。" },
    { id: "q5", question: "核查是否存在未披露的担保", isHit: false, answerSummary: "访谈中未明确提及。" },
  ]
};

export const mockReport: ReportData = {
  id: "rep-01",
  title: "A公司流贷尽调报告",
  sections: [
    {
      id: "s1",
      title: "一、企业基本情况",
      blocks: [
        {
          id: "b1",
          text: "A公司成立于2015年，主要从事工业自动化设备的研发与生产。公司股权结构稳定，大股东持股比例保持在60%以上，近期无重大股权变动。",
          sourceId: "q4",
          sourceType: "question"
        }
      ]
    },
    {
      id: "s2",
      title: "二、财务与信贷分析",
      blocks: [
        {
          id: "b2",
          text: "根据访谈了解，公司目前总信贷规模约为5000万元，主要用于日常流动资金周转。还款计划方面，公司预计通过下一季度的销售回款覆盖本金。",
          sourceId: "q1",
          sourceType: "question",
          hasConflict: true,
          conflictDetail: "访谈提到的5000万信贷规模与财务报表中的6200万短期借款存在显著差异，需核实是否存在表外融资或统计口径问题。"
        },
        {
          id: "b3",
          text: "公司目前主要的抵押物为位于工业园区的两栋厂房，经评估价值约为8000万元，抵押率处于合理区间。",
          sourceId: "q3",
          sourceType: "question",
          isModified: true,
          originalText: "公司目前抵押物价值约8000万元。"
        }
      ]
    },
    {
      id: "s3",
      title: "三、风险评估与建议",
      blocks: [
        {
          id: "b4",
          text: "受访人声称公司目前所有对外担保均已按规定披露，不存在隐性担保风险。建议后续进一步通过征信系统核实其担保明细。",
          sourceId: "q3",
          sourceType: "question"
        }
      ]
    }
  ]
};
