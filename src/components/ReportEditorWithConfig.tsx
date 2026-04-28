import React, { useState } from 'react';
import {
  Table,
  Database,
  Settings,
  ChevronDown,
  CheckCircle2,
  FileSpreadsheet,
  LayoutTemplate,
  Play,
  Info,
  BrainCircuit,
  Sparkles,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

export type ReportTableData = {
  id: string;
  name: string;
  sourceFile: string;
  extractionRule: string;
};

const INITIAL_TABLES: ReportTableData[] = [
  {
    id: 'table-1',
    name: '2023年度主营业务收入明细表',
    sourceFile: '财务报表_2023.xlsx',
    extractionRule: '提取 Sheet1!A2:E15，并按季度汇总',
  },
  {
    id: 'table-2',
    name: '第四季度研发支出汇总表',
    sourceFile: '',
    extractionRule: '',
  },
];

export const ReportEditorWithConfig = () => {
  const [tables, setTables] = useState<ReportTableData[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;

  // 处理配置项的更新
  const handleUpdateConfig = (updates: Partial<ReportTableData>) => {
    if (!selectedTableId) return;
    setTables((prev) =>
      prev.map((t) => (t.id === selectedTableId ? { ...t, ...updates } : t))
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-gray-50 font-sans">
      {/* 左侧：报告编辑器/画布区域 */}
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto min-h-[800px] max-w-4xl rounded-sm border border-gray-200 bg-white p-16 shadow-sm">
          <h1 className="mb-8 text-center text-3xl font-bold tracking-wider text-gray-900">
            年度经营分析报告
          </h1>
          
          <div className="space-y-6 text-sm leading-8 text-gray-700">
            <p className="indent-8">
              根据本年度的审计及经营分析工作安排，我们对公司的各项核心财务指标及业务数据进行了全面的梳理与核查。
              以下是各主要业务板块的收入明细及支出汇总，相关数据均已与底层数据库及附件资料完成自动映射。
            </p>

            {/* 渲染文档中的表格列表 */}
            {tables.map((table) => {
              const isSelected = selectedTableId === table.id;
              
              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`group relative my-6 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-4 ring-blue-50'
                      : 'border-transparent bg-gray-50 hover:border-blue-200'
                  }`}
                >
                  {/* 悬浮提示 */}
                  {!isSelected && (
                    <div className="absolute inset-0 z-10 hidden items-center justify-center bg-blue-500/5 backdrop-blur-[1px] group-hover:flex">
                      <span className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                        点击配置表格规则
                      </span>
                    </div>
                  )}

                  {/* 表格标题栏 */}
                  <div
                    className={`flex items-center justify-between border-b px-5 py-3 ${
                      isSelected ? 'border-blue-100 bg-blue-50/50' : 'border-gray-200 bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Table
                        size={16}
                        className={isSelected ? 'text-blue-600' : 'text-gray-500'}
                      />
                      {table.name}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-[11px] ${
                        table.sourceFile ? 'text-green-600' : 'text-orange-500'
                      }`}
                    >
                      <Database size={12} />
                      {table.sourceFile || '未配置数据源'}
                    </div>
                  </div>

                  {/* 占位/模拟表格内容 */}
                  <div className="bg-white p-5">
                    <div className="w-full rounded border border-gray-200 text-center text-xs">
                      <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50 font-bold">
                        <div className="border-r border-gray-200 p-2.5">核算项目</div>
                        <div className="border-r border-gray-200 p-2.5">Q1</div>
                        <div className="border-r border-gray-200 p-2.5">Q2</div>
                        <div className="p-2.5">同比变化</div>
                      </div>
                      <div className="grid grid-cols-4 border-b border-gray-200">
                        <div className="border-r border-gray-200 p-2.5">主营业务收入</div>
                        <div className="border-r border-gray-200 p-2.5">1,245.00</div>
                        <div className="border-r border-gray-200 p-2.5">1,680.00</div>
                        <div className="p-2.5 text-green-600">+34.9%</div>
                      </div>
                      <div className="grid grid-cols-4">
                        <div className="border-r border-gray-200 p-2.5">净利润</div>
                        <div className="border-r border-gray-200 p-2.5">320.50</div>
                        <div className="border-r border-gray-200 p-2.5">450.80</div>
                        <div className="p-2.5 text-green-600">+40.6%</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="indent-8">
              综上所述，公司在第一、第二季度的收入结构保持稳定，核心利润点来源于新产品线的拓展以及海外市场的布局。我们建议在下半年的经营计划中，继续关注汇率波动对实际结汇的影响。
            </p>
          </div>
        </div>
      </div>

      {/* 右侧：规则配置侧边栏 */}
      <div className="flex w-[340px] flex-col border-l border-gray-200 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-5 py-4">
          {selectedTable ? (
            <Settings size={18} className="text-gray-600" />
          ) : (
            <BrainCircuit size={18} className="text-purple-600" />
          )}
          <h2 className="text-sm font-bold text-gray-800">
            {selectedTable ? '数据及规则配置' : 'AI 生成与审查'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {selectedTable ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* 数据来源文件配置 */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <FileSpreadsheet size={14} />
                  来源文件
                </label>
                <div className="relative">
                  <select
                    value={selectedTable.sourceFile}
                    onChange={(e) => handleUpdateConfig({ sourceFile: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">请选择上传的资料文件...</option>
                    <option value="财务报表_2023.xlsx">财务报表_2023.xlsx</option>
                    <option value="销售数据_Q1.csv">销售数据_Q1.csv</option>
                    <option value="行业对比分析.pdf">行业对比分析.pdf</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-3.5 text-gray-400"
                  />
                </div>
              </div>

              {/* 抽取规则配置 */}
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Database size={14} />
                    抽取与处理规则
                  </div>
                  <span title="支持 Excel 范围提取、SQL 查询或大模型 Prompt">
                    <Info size={13} className="cursor-help text-gray-400 hover:text-blue-500" />
                  </span>
                </label>
                <textarea
                  value={selectedTable.extractionRule}
                  onChange={(e) => handleUpdateConfig({ extractionRule: e.target.value })}
                  placeholder="对数据的业务规则进行描述"
                  className="min-h-[140px] w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm leading-6 text-gray-800 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* 底部操作与状态 */}
              <div className="pt-2">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                  <Play size={14} className="fill-white" />
                  运行规则并预览
                </button>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-green-600">
                  <CheckCircle2 size={13} />
                  所有配置已自动保存
                </div>
              </div>
            </div>
          ) : (
            /* 未选中表格时的 AI 审查面板 */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
                  <Sparkles size={16} className="text-purple-600" />
                  智能辅助编写
                </div>
                <p className="mt-2 text-xs leading-5 text-purple-700">
                  当前报告正文已开启 AI 实时审查。点击左侧画布中的<strong>表格</strong>，可为表格配置底层数据抽取规则。
                </p>
              </div>

              <div>
                <label className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <CheckCircle2 size={14} />
                  全文合规与逻辑检查
                </label>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" />
                    <div>
                      <div className="text-xs font-bold text-gray-800">财务数据一致性</div>
                      <div className="text-[10px] text-gray-500">各章节数据核对无误</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3 shadow-sm">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-orange-500" />
                    <div>
                      <div className="text-xs font-bold text-orange-800">披露风险提示</div>
                      <div className="text-[10px] text-orange-600">缺少下半年汇率波动应对策略说明</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <MessageSquare size={14} />
                  审查建议
                </label>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                  建议在“主营业务收入明细表”后增加一段关于海外市场收入占比变化的趋势分析，以提升报告综合说服力。
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
