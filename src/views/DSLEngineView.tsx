import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  ClipboardCheck,
  Code2,
  Database,
  FileJson,
  PenTool,
  Settings,
} from 'lucide-react';

type TextReplaceRule = {
  field: string;
  type: 'text_replace';
  source: string;
};

type QueryRule = {
  field: string;
  type: 'query';
  prompt: string;
};

type FormulaRule = {
  field: string;
  type: 'formula';
  formula: string;
};

type DslRule = TextReplaceRule | QueryRule | FormulaRule;

type DslTemplate = {
  id: string;
  name: string;
  version: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  outputFileName: string;
  config: {
    templateName: string;
    coreElements: string[];
    rules: DslRule[];
  };
};

const DSL_TEMPLATES: DslTemplate[] = [
  {
    id: 'bank',
    name: '银行流贷尽调模板',
    version: '1.0',
    emptyStateTitle: '暂无激活的银行尽调模板',
    emptyStateDescription:
      '请上传包含填槽占位符或特定排版样式的 Docx / PDF 报告结构范本，系统将针对银行授信场景生成字段抽取与验证规则。',
    outputFileName: 'rules_bank_loan.json',
    config: {
      templateName: '银行流贷尽调',
      coreElements: ['主体信用', '注册资本', '主营业务', '毛利率优化能力'],
      rules: [
        { field: '注册资本', type: 'text_replace', source: '工商变更信息' },
        {
          field: '诉讼风险',
          type: 'query',
          prompt: '检索并评估该企业近一年涉及的立案纠纷情况。',
        },
        {
          field: '毛利率',
          type: 'formula',
          formula: '(营业总收入 - 营业总成本) / 营业总收入',
        },
      ],
    },
  },
  {
    id: 'equity',
    name: '股权投资分析模板',
    version: '1.2',
    emptyStateTitle: '暂无激活的股权投资模板',
    emptyStateDescription:
      '上传投资备忘录、财务模型或会议纪要后，系统会生成面向股权投资分析的结构化 DSL 规则骨架。',
    outputFileName: 'rules_equity_investment.json',
    config: {
      templateName: '股权投资分析',
      coreElements: ['商业模式', '营收增长率', '核心团队', '退出路径'],
      rules: [
        { field: '创始团队', type: 'text_replace', source: '管理层访谈纪要' },
        {
          field: '市场空间',
          type: 'query',
          prompt: '结合行业材料总结该细分赛道未来三年的增长空间。',
        },
        {
          field: '收入增长率',
          type: 'formula',
          formula: '(本期收入 - 上期收入) / 上期收入',
        },
      ],
    },
  },
  {
    id: 'legal',
    name: '通用法务审查模板',
    version: '1.4',
    emptyStateTitle: '暂无激活的法务审查模板',
    emptyStateDescription:
      '上传合同、章程和历史纠纷材料后，系统会自动归纳关键义务、风险点与证据引用关系。',
    outputFileName: 'rules_legal_review.json',
    config: {
      templateName: '通用法务审查',
      coreElements: ['合同主体', '履约义务', '违约责任', '争议解决'],
      rules: [
        { field: '签约主体', type: 'text_replace', source: '合同首页与签章页' },
        {
          field: '重大风险',
          type: 'query',
          prompt: '识别合同中对我方明显不利的义务或责任限制条款。',
        },
        {
          field: '违约金比例',
          type: 'formula',
          formula: '违约金金额 / 合同总金额',
        },
      ],
    },
  },
];

const getRuleMeta = (rule: DslRule) => {
  if (rule.type === 'text_replace') {
    return {
      label: '文本定位映射',
      badgeClassName: 'text-blue-600 bg-blue-50',
      content: `直接检索并挂载至「最新文档库 => ${rule.source}」`,
    };
  }

  if (rule.type === 'query') {
    return {
      label: '智能问数 (LLM)',
      badgeClassName: 'text-purple-600 bg-purple-50',
      content: rule.prompt,
    };
  }

  return {
    label: '业务公式计算',
    badgeClassName: 'text-orange-600 bg-orange-50',
    content: `f: ${rule.formula}`,
  };
};

export const DSLEngineView = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(DSL_TEMPLATES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dslGenerated, setDslGenerated] = useState(false);
  const generateTimerRef = useRef<number | null>(null);

  const activeTemplate = useMemo(
    () =>
      DSL_TEMPLATES.find((template) => template.id === selectedTemplateId) ??
      DSL_TEMPLATES[0],
    [selectedTemplateId],
  );

  useEffect(() => {
    return () => {
      if (generateTimerRef.current !== null) {
        window.clearTimeout(generateTimerRef.current);
      }
    };
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    if (generateTimerRef.current !== null) {
      window.clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }

    setSelectedTemplateId(templateId);
    setIsGenerating(false);
    setDslGenerated(false);
  };

  const handleGenerate = () => {
    if (generateTimerRef.current !== null) {
      window.clearTimeout(generateTimerRef.current);
    }

    setIsGenerating(true);
    generateTimerRef.current = window.setTimeout(() => {
      setIsGenerating(false);
      setDslGenerated(true);
      generateTimerRef.current = null;
    }, 2000);
  };

  const jsonPreview = JSON.stringify(activeTemplate.config, null, 2);

  return (
    <div className="flex h-full w-full bg-gray-50/50">
      <div className="w-64 overflow-y-auto border-r border-gray-200 bg-white p-6">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
          <Code2 size={22} className="text-blue-600" />
          DSL 模板库
        </h2>

        <div className="space-y-3">
          {DSL_TEMPLATES.map((template) => {
            const isSelected = selectedTemplateId === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <h3
                  className={`text-sm font-bold ${
                    isSelected ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {template.name}
                </h3>
                <p className="mt-1 text-xs text-gray-400">版本: {template.version}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DSL 引擎架构中心</h1>
            <p className="mt-2 text-sm text-gray-500">
              基于 AI 实现范本文档的结构化解构，建立低耦合的抽取验证规则。
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || dslGenerated}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition-all ${
              isGenerating
                ? 'cursor-not-allowed bg-blue-400 text-white'
                : dslGenerated
                  ? 'bg-green-600 text-white shadow-green-200'
                  : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                AI 解构中...
              </>
            ) : dslGenerated ? (
              <>
                <ClipboardCheck size={16} />
                已生成规则框架
              </>
            ) : (
              <>
                <PenTool size={16} />
                模拟上传范本提取 DSL
              </>
            )}
          </button>
        </div>

        {dslGenerated ? (
          <div className="flex min-h-0 flex-1 gap-6">
            <div className="flex-1 space-y-8 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <section>
                <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Database size={18} className="text-indigo-600" />
                  <h3 className="font-bold text-gray-800">核心数据池 (Core Elements)</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeTemplate.config.coreElements.map((element) => (
                    <div
                      key={element}
                      className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 shadow-sm"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      {element}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    + 扩展字段
                  </button>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Settings size={18} className="text-emerald-600" />
                  <h3 className="font-bold text-gray-800">绑定执行规则 (Execution Rules)</h3>
                </div>

                <div className="space-y-4">
                  {activeTemplate.config.rules.map((rule, index) => {
                    const ruleMeta = getRuleMeta(rule);

                    return (
                      <div
                        key={`${rule.field}-${index}`}
                        className="group relative flex rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="absolute -left-3 top-1/2 flex h-4 w-6 -mt-2 items-center justify-center rounded bg-gray-200 text-[9px] font-bold text-gray-600 shadow-sm">
                          R{index + 1}
                        </div>

                        <div className="flex w-full items-center gap-4 pl-3">
                          <div className="flex w-1/3 flex-col">
                            <span className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                              目标字段绑定
                            </span>
                            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 shadow-sm">
                              {rule.field}
                            </div>
                          </div>

                          <div className="px-1 text-gray-300">
                            <ChevronRight size={16} />
                          </div>

                          <div className="flex flex-1 flex-col">
                            <span className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                              触发器及动作配置
                            </span>
                            <div className="flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
                              <span
                                className={`w-fit rounded px-2 py-0.5 text-xs font-bold ${ruleMeta.badgeClassName}`}
                              >
                                {ruleMeta.label}
                              </span>
                              <span>{ruleMeta.content}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="relative flex w-96 flex-col overflow-hidden rounded-2xl border border-gray-800 bg-slate-900 shadow-lg">
              <div className="flex h-12 items-center justify-between border-b border-gray-800 bg-slate-800 px-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-gray-400">
                  {activeTemplate.outputFileName}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-blue-300">
                  {jsonPreview}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-12 flex w-full max-w-4xl flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center shadow-sm">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
              <FileJson size={40} className="text-gray-300" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-700">
              {activeTemplate.emptyStateTitle}
            </h3>
            <p className="mx-auto max-w-md leading-relaxed text-gray-500">
              {activeTemplate.emptyStateDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
