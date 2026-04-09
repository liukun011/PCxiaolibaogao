import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderTree,
  Search,
  Sparkles,
  Tag,
  Upload,
} from 'lucide-react';
import {
  buildFolderTree,
  DIRECTORY_PLACEHOLDER,
  filterDocuments,
  generateKnowledgeDocuments,
  getKnowledgeStats,
  groupDocumentsByDirectory,
  type FolderNode,
  type KnowledgeDocument,
} from '../utils/documentKnowledge';

const FolderTreeNode = ({
  node,
  selectedFolder,
  collapsedFolders,
  onSelect,
  onToggle,
}: {
  node: FolderNode;
  selectedFolder: string;
  collapsedFolders: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}) => {
  const isCollapsed = collapsedFolders.has(node.path);
  const isSelected = selectedFolder === node.path;
  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
          isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <button
          type="button"
          onClick={() => onToggle(node.path)}
          className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-white"
        >
          {hasChildren ? <ChevronDown size={14} className={isCollapsed ? '-rotate-90' : ''} /> : <span className="block h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => onSelect(node.path)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <FolderTree size={14} className={isSelected ? 'text-blue-600' : 'text-indigo-500'} />
          <span className="truncate font-medium">{node.name}</span>
          <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-400">
            {node.fileCount}
          </span>
        </button>
      </div>

      {hasChildren && !isCollapsed && (
        <div className="ml-5 space-y-1 border-l border-gray-100 pl-2">
          {node.children.map((child) => (
            <div key={child.path}>
              <FolderTreeNode
                node={child}
                selectedFolder={selectedFolder}
                collapsedFolders={collapsedFolders}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentManagerView = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current !== null) {
        window.clearTimeout(uploadTimerRef.current);
      }
    };
  }, []);

  const handleDirectoryUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    if (uploadTimerRef.current !== null) {
      window.clearTimeout(uploadTimerRef.current);
    }

    const selectedFiles = Array.from(event.target.files as FileList) as File[];
    setIsUploading(true);

    uploadTimerRef.current = window.setTimeout(() => {
      const parsedDocuments = generateKnowledgeDocuments(selectedFiles);
      setDocuments(parsedDocuments);
      setSelectedFolder('ALL');
      setCollapsedFolders(new Set());
      setIsUploading(false);
      uploadTimerRef.current = null;
      event.target.value = '';
    }, 900);
  };

  const folderTree = useMemo(() => buildFolderTree(documents), [documents]);
  const stats = useMemo(() => getKnowledgeStats(documents), [documents]);
  const filteredDocuments = useMemo(
    () => filterDocuments(documents, keyword, selectedFolder),
    [documents, keyword, selectedFolder],
  );
  const groupedDocuments = useMemo(
    () => groupDocumentsByDirectory(filteredDocuments),
    [filteredDocuments],
  );

  const toggleFolder = (folderPath: string) => {
    setCollapsedFolders((previous) => {
      const next = new Set(previous);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50">
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900">资料知识库</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              上传本地目录后，系统会按用户电脑中的分级结构还原文档，并自动生成标题、类型、摘要和标签，用于查询、分类与后续数据召回。
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
            multiple
            onChange={handleDirectoryUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all ${
              isUploading ? 'cursor-not-allowed bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                目录解析中...
              </>
            ) : (
              <>
                <Upload size={16} />
                上传本地目录
              </>
            )}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">目录还原</div>
            <div className="mt-2 text-2xl font-bold text-blue-900">{stats.directoryCount}</div>
            <div className="mt-1 text-xs text-blue-700">已识别目录节点，支持按层级查询</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">文档归档</div>
            <div className="mt-2 text-2xl font-bold text-emerald-900">{stats.fileCount}</div>
            <div className="mt-1 text-xs text-emerald-700">已纳入知识库文档数量</div>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">层级深度</div>
            <div className="mt-2 text-2xl font-bold text-amber-900">{stats.maxDepth}</div>
            <div className="mt-1 text-xs text-amber-700">保留原始目录层级，便于定位底稿</div>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-700">结构化信息</div>
            <div className="mt-2 text-2xl font-bold text-violet-900">{stats.metadataCount}</div>
            <div className="mt-1 text-xs text-violet-700">已生成标题、类型、摘要与标签</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-bold text-gray-800">用户价值</div>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              目录分级保留原始工作习惯，上传后仍能按企业资料、财务资料、法务资料等结构快速查询。
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-bold text-gray-800">平台价值</div>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              平台可结合目录语义和文档标签判断材料类型，提升字段抽取、风险识别和召回命中率。
            </p>
          </div>
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="flex min-h-0 flex-1">
          <aside className="w-80 border-r border-gray-200 bg-white p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索标题、类型、标签、目录"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-all focus:border-blue-300 focus:bg-white"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-slate-50 p-3">
              <button
                type="button"
                onClick={() => setSelectedFolder('ALL')}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                  selectedFolder === 'ALL' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-white'
                }`}
              >
                <FolderTree size={15} className="text-blue-600" />
                <span className="font-medium">全部目录</span>
                <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
                  {documents.length}
                </span>
              </button>

              <div className="mt-3 max-h-[calc(100vh-24rem)] space-y-1 overflow-y-auto pr-1">
              {folderTree.map((node) => (
                <div key={node.path}>
                  <FolderTreeNode
                    node={node}
                    selectedFolder={selectedFolder}
                    collapsedFolders={collapsedFolders}
                    onSelect={setSelectedFolder}
                    onToggle={toggleFolder}
                  />
                </div>
              ))}
              </div>
            </div>
          </aside>

          <main className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">文档信息生成结果</h2>
                <p className="mt-1 text-sm text-gray-500">
                  当前展示 {filteredDocuments.length} 份文档，已按目录归类并补全文档描述信息。
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {(Object.entries(groupedDocuments) as [string, KnowledgeDocument[]][]).map(
                ([directoryPath, files]) => (
                <section
                  key={directoryPath}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 bg-slate-50 px-5 py-4">
                    <FolderTree size={16} className="text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-800">{directoryPath}</div>
                      <div className="text-xs text-gray-400">
                        目录内共 {files.length} 份文档，平台可按目录语义参与分类
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 xl:grid-cols-2">
                    {files.map((document) => (
                      <article
                        key={document.id}
                        className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                            <FileText size={20} className="text-indigo-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                {document.type}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                                {document.sizeLabel}
                              </span>
                            </div>
                            <h3 className="mt-2 truncate text-base font-bold text-gray-900">
                              {document.title}
                            </h3>
                            <p className="mt-1 truncate text-xs text-gray-400">{document.name}</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                            <Sparkles size={11} />
                            自动生成摘要
                          </div>
                          <p className="text-sm leading-6 text-gray-600">{document.summary}</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              识别路径
                            </div>
                            <p className="mt-1 break-all text-xs leading-5 text-gray-600">
                              /{document.relativePath}
                            </p>
                          </div>
                          <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              更新时间
                            </div>
                            <p className="mt-1 text-xs leading-5 text-gray-600">
                              {document.updatedAtLabel}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            <Tag size={10} />
                            自动标签
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {document.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`rounded-md border px-2 py-1 text-[10px] font-bold ${
                                  tag.includes('风险')
                                    ? 'border-red-100 bg-red-50 text-red-600'
                                    : 'border-blue-100 bg-blue-50 text-blue-600'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
                ),
              )}
            </div>
          </main>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-8">
          <div className="w-full rounded-[32px] border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
              <Upload size={40} className="text-blue-400" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-gray-800">上传目录并生成文档结构信息</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500">
              支持直接上传本地文件夹，系统会还原原始目录层级，并自动生成标题、类型、摘要和标签，
              让用户更容易识别文档，也让平台更容易进行分类、判断与召回。
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
              >
                选择本地目录
              </button>
            </div>
            <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                <div className="text-sm font-bold text-gray-800">面向用户</div>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  还原电脑本地目录结构，保留分级管理方式，后续查询时能先按目录再按标签快速定位。
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                <div className="text-sm font-bold text-gray-800">面向平台</div>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  平台可依据目录语义、文件类型和自动摘要识别文档用途，为抽取字段和召回内容提供更多上下文。
                </p>
              </div>
            </div>
            <p className="mt-6 text-xs text-gray-400">
              未归类的散件文件会自动落入“{DIRECTORY_PLACEHOLDER}”目录。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
