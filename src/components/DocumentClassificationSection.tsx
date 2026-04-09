import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  FolderPlus,
  FolderTree,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  DIRECTORY_PLACEHOLDER,
  generateKnowledgeDocuments,
  groupDocumentsByDirectory,
  type KnowledgeDocument,
  updateKnowledgeDocument,
} from '../utils/documentKnowledge';

type DocumentClassificationSectionProps = {
  sectionNumber: number;
  title: string;
  initialFiles?: Array<{
    name: string;
    path: string;
    type: string;
    summary: string;
    tags: string[];
    title?: string;
  }>;
};

type FolderDialogState = {
  mode: 'create' | 'rename';
  parentPath: string;
  targetPath: string;
  dialogTitle: string;
  confirmLabel: string;
};

type FolderTreeNodeData = {
  name: string;
  path: string;
  children: FolderTreeNodeData[];
};

const normalizeFolderPath = (path: string) =>
  path
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/');

const getFolderName = (path: string) => path.split('/').filter(Boolean).at(-1) ?? '根目录';

const getParentPath = (path: string) => {
  const segments = path.split('/').filter(Boolean);
  return segments.slice(0, -1).join('/');
};

const collectAncestorPaths = (path: string) => {
  const normalizedPath = normalizeFolderPath(path);
  if (!normalizedPath) {
    return [];
  }

  if (normalizedPath === DIRECTORY_PLACEHOLDER) {
    return [DIRECTORY_PLACEHOLDER];
  }

  const segments = normalizedPath.split('/');
  const paths: string[] = [];

  segments.reduce((current, segment) => {
    const nextPath = current ? `${current}/${segment}` : segment;
    paths.push(nextPath);
    return nextPath;
  }, '');

  return paths;
};

const mergeFolderPaths = (...pathGroups: string[][]) =>
  Array.from(
    new Set(
      pathGroups
        .flat()
        .flatMap((path) => collectAncestorPaths(path))
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right, 'zh-CN'));

const replacePathPrefix = (path: string, oldPrefix: string, newPrefix: string) => {
  if (path === oldPrefix) {
    return newPrefix;
  }

  if (path.startsWith(`${oldPrefix}/`)) {
    return `${newPrefix}${path.slice(oldPrefix.length)}`;
  }

  return path;
};

const buildFolderTreeData = (folderPaths: string[]): FolderTreeNodeData[] => {
  type InternalNode = FolderTreeNodeData & {
    childrenMap: Map<string, InternalNode>;
  };

  const root = new Map<string, InternalNode>();

  for (const folderPath of folderPaths) {
    const segments = folderPath.split('/').filter(Boolean);
    let currentLevel = root;
    let currentPath = '';

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      if (!currentLevel.has(segment)) {
        currentLevel.set(segment, {
          name: segment,
          path: currentPath,
          children: [],
          childrenMap: new Map<string, InternalNode>(),
        });
      }

      currentLevel = currentLevel.get(segment)!.childrenMap;
    }
  }

  const sortNodes = (nodeMap: Map<string, InternalNode>): FolderTreeNodeData[] =>
    Array.from(nodeMap.values())
      .map((node) => ({
        name: node.name,
        path: node.path,
        children: sortNodes(node.childrenMap),
      }))
      .sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'));

  return sortNodes(root);
};

const buildBreadcrumbs = (path: string) => {
  const normalized = normalizeFolderPath(path);
  if (!normalized) {
    return [{ label: '根目录', path: '' }];
  }

  const breadcrumbs = [{ label: '根目录', path: '' }];
  const segments = normalized.split('/');
  let currentPath = '';

  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    breadcrumbs.push({ label: segment, path: currentPath });
  }

  return breadcrumbs;
};

const formatUploadTime = () =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

const normalizeInitialFiles = (files: DocumentClassificationSectionProps['initialFiles']) =>
  (files ?? []).map((file, index) => {
    const directoryPath = normalizeFolderPath(file.path) || DIRECTORY_PLACEHOLDER;

    return {
      id: `${directoryPath}/${file.name}-${index}`,
      name: file.name,
      title: file.title ?? file.name.replace(/\.[^/.]+$/, ''),
      type: file.type,
      summary: file.summary,
      tags: file.tags,
      extension: file.name.split('.').at(-1)?.toLowerCase() ?? '',
      directoryPath,
      relativePath: `${directoryPath}/${file.name}`,
      segments: directoryPath.split('/'),
      folderDepth: directoryPath === DIRECTORY_PLACEHOLDER ? 0 : directoryPath.split('/').length,
      sizeLabel: '已归档',
      updatedAtLabel: '历史资料',
    };
  }) satisfies KnowledgeDocument[];

const UploadActionMenu = ({
  isUploading,
  buttonClassName,
  buttonLabel,
  onSingleUpload,
  onDirectoryUpload,
}: {
  isUploading: boolean;
  buttonClassName: string;
  buttonLabel: string;
  onSingleUpload: () => void;
  onDirectoryUpload: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isUploading) {
      setIsOpen(false);
    }
  }, [isUploading]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={isUploading}
        onClick={() => {
          if (!isUploading) {
            setIsOpen((previous) => !previous);
          }
        }}
        className={buttonClassName}
      >
        {isUploading ? (
          <>
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/50 border-t-white" />
            处理中...
          </>
        ) : (
          <>
            <Upload size={14} />
            {buttonLabel}
            <ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} />
          </>
        )}
      </button>

      {isOpen && !isUploading && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSingleUpload();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <FileText size={14} />
            上传文件
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDirectoryUpload();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <FolderTree size={14} />
            上传文件夹
          </button>
        </div>
      )}
    </div>
  );
};

const FolderTreeNode = ({
  node,
  selectedFolder,
  onSelect,
}: {
  node: FolderTreeNodeData;
  selectedFolder: string;
  onSelect: (path: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedFolder === node.path;

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
          isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-white"
        >
          {node.children.length > 0 ? (
            <ChevronDown size={14} className={isOpen ? '' : '-rotate-90'} />
          ) : (
            <span className="block h-3 w-3" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onSelect(node.path)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <FolderTree size={14} className={isSelected ? 'text-blue-600' : 'text-indigo-500'} />
          <span className="truncate font-medium">{node.name}</span>
        </button>
      </div>

      {isOpen && node.children.length > 0 && (
        <div className="ml-5 space-y-1 border-l border-gray-100 pl-2">
          {node.children.map((child) => (
            <div key={child.path}>
              <FolderTreeNode node={child} selectedFolder={selectedFolder} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentClassificationSection = ({
  sectionNumber,
  title,
  initialFiles = [],
}: DocumentClassificationSectionProps) => {
  const initialDocuments = useMemo(() => normalizeInitialFiles(initialFiles), [initialFiles]);
  const [files, setFiles] = useState<KnowledgeDocument[]>(initialDocuments);
  const [folderPaths, setFolderPaths] = useState<string[]>(
    mergeFolderPaths(initialDocuments.map((file) => file.directoryPath)),
  );
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [addingTagId, setAddingTagId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [folderDialog, setFolderDialog] = useState<FolderDialogState | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderDialogError, setFolderDialogError] = useState('');
  const dirInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFolderRef = useRef(selectedFolder);
  const currentUploadTargetRef = useRef<string>(DIRECTORY_PLACEHOLDER);

  useEffect(() => {
    selectedFolderRef.current = selectedFolder;
  }, [selectedFolder]);

  const folderTree = useMemo(() => buildFolderTreeData(folderPaths), [folderPaths]);
  const groupedFiles = useMemo(() => groupDocumentsByDirectory(files), [files]);
  const currentFolders = useMemo(
    () =>
      folderPaths
        .filter((folderPath) => getParentPath(folderPath) === selectedFolder)
        .sort((left, right) => left.localeCompare(right, 'zh-CN')),
    [folderPaths, selectedFolder],
  );
  const currentFiles = useMemo(
    () =>
      (groupedFiles[selectedFolder] ?? []).sort((left, right) =>
        left.title.localeCompare(right.title, 'zh-CN'),
      ),
    [groupedFiles, selectedFolder],
  );
  const selectedFile =
    files.find((file) => file.id === selectedFileId) ??
    (currentFiles.length > 0 ? currentFiles[0] : null);
  const breadcrumbs = useMemo(() => buildBreadcrumbs(selectedFolder), [selectedFolder]);

  useEffect(() => {
    if (!selectedFileId && currentFiles.length > 0) {
      setSelectedFileId(currentFiles[0].id);
      return;
    }

    if (selectedFileId && !files.some((file) => file.id === selectedFileId)) {
      setSelectedFileId(currentFiles[0]?.id ?? null);
    }
  }, [currentFiles, files, selectedFileId]);

  const openCreateFolderDialog = (parentPath: string) => {
    setFolderDialog({
      mode: 'create',
      parentPath,
      targetPath: '',
      dialogTitle: parentPath ? `在「${getFolderName(parentPath)}」下新建目录` : '新建根目录',
      confirmLabel: '创建目录',
    });
    setFolderNameInput('');
    setFolderDialogError('');
  };

  const openRenameFolderDialog = (folderPath: string) => {
    setFolderDialog({
      mode: 'rename',
      parentPath: getParentPath(folderPath),
      targetPath: folderPath,
      dialogTitle: '重命名目录',
      confirmLabel: '保存修改',
    });
    setFolderNameInput(getFolderName(folderPath));
    setFolderDialogError('');
  };

  const closeFolderDialog = () => {
    setFolderDialog(null);
    setFolderNameInput('');
    setFolderDialogError('');
  };

  const appendUploadedFiles = (
    selectedFiles: File[],
    options: { sectionRoot?: string; fallbackPath?: string },
    inputElement: HTMLInputElement,
  ) => {
    if (selectedFiles.length === 0) {
      return;
    }

    try {
      setIsUploading(true);
      const uploadTimeLabel = formatUploadTime();
      const uploadedFiles = generateKnowledgeDocuments(selectedFiles, options).map((file) => ({
        ...file,
        updatedAtLabel: uploadTimeLabel,
      }));
      setFiles((previous) => [...previous, ...uploadedFiles]);
      setFolderPaths((previous) =>
        mergeFolderPaths(previous, uploadedFiles.map((file) => file.directoryPath)),
      );
      setSelectedFileId(uploadedFiles[0]?.id ?? null);
    } catch (error) {
      console.error('Failed to process uploaded files in detail section:', error);
    } finally {
      setIsUploading(false);
      inputElement.value = '';
    }
  };

  const handleDirectoryUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const inputElement = event.currentTarget;
    const selectedFiles = Array.from(event.target.files as FileList) as File[];
    const currentFolder = selectedFolderRef.current;

    appendUploadedFiles(
      selectedFiles,
      currentFolder ? { sectionRoot: currentFolder } : {},
      inputElement,
    );
  };

  const handleSingleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const inputElement = event.currentTarget;
    const selectedFiles = Array.from(event.target.files as FileList) as File[];

    appendUploadedFiles(
      selectedFiles,
      { fallbackPath: currentUploadTargetRef.current || DIRECTORY_PLACEHOLDER },
      inputElement,
    );
  };

  const triggerSingleUpload = (path: string) => {
    currentUploadTargetRef.current = path || DIRECTORY_PLACEHOLDER;
    fileInputRef.current?.click();
  };

  const triggerDirectoryUpload = () => {
    dirInputRef.current?.click();
  };

  const submitFolderDialog = () => {
    if (!folderDialog) {
      return;
    }

    const trimmedName = folderNameInput.trim();
    if (!trimmedName) {
      setFolderDialogError('目录名称不能为空');
      return;
    }

    if (trimmedName.includes('/')) {
      setFolderDialogError('目录名称不能包含 /');
      return;
    }

    const nextFolderPath = normalizeFolderPath(
      folderDialog.parentPath ? `${folderDialog.parentPath}/${trimmedName}` : trimmedName,
    );

    if (folderDialog.mode === 'create') {
      if (folderPaths.includes(nextFolderPath)) {
        setFolderDialogError('该目录已存在');
        return;
      }

      setFolderPaths((previous) => mergeFolderPaths(previous, [nextFolderPath]));
      setSelectedFolder(nextFolderPath);
      setSelectedFileId(null);
      closeFolderDialog();
      return;
    }

    const oldFolderPath = folderDialog.targetPath;
    if (nextFolderPath !== oldFolderPath && folderPaths.includes(nextFolderPath)) {
      setFolderDialogError('该目录已存在');
      return;
    }

    setFolderPaths((previous) =>
      mergeFolderPaths(
        previous
          .filter(
            (folderPath) =>
              !(folderPath === oldFolderPath || folderPath.startsWith(`${oldFolderPath}/`)),
          )
          .concat(
            previous
              .filter(
                (folderPath) =>
                  folderPath === oldFolderPath || folderPath.startsWith(`${oldFolderPath}/`),
              )
              .map((folderPath) => replacePathPrefix(folderPath, oldFolderPath, nextFolderPath)),
          ),
      ),
    );
    setFiles((previous) =>
      previous.map((file) =>
        file.directoryPath === oldFolderPath || file.directoryPath.startsWith(`${oldFolderPath}/`)
          ? updateKnowledgeDocument(file, {
              directoryPath: replacePathPrefix(file.directoryPath, oldFolderPath, nextFolderPath),
            })
          : file,
      ),
    );
    setSelectedFolder((previous) =>
      previous === oldFolderPath || previous.startsWith(`${oldFolderPath}/`)
        ? replacePathPrefix(previous, oldFolderPath, nextFolderPath)
        : previous,
    );
    closeFolderDialog();
  };

  const deleteFolder = (folderPath: string) => {
    const shouldDelete = window.confirm(
      `确定删除目录「${getFolderName(folderPath)}」吗？该目录下的子目录和资料会一起删除。`,
    );

    if (!shouldDelete) {
      return;
    }

    setFolderPaths((previous) =>
      previous.filter(
        (currentPath) => !(currentPath === folderPath || currentPath.startsWith(`${folderPath}/`)),
      ),
    );
    setFiles((previous) =>
      previous.filter(
        (file) =>
          !(file.directoryPath === folderPath || file.directoryPath.startsWith(`${folderPath}/`)),
      ),
    );
    setSelectedFolder((previous) =>
      previous === folderPath || previous.startsWith(`${folderPath}/`)
        ? getParentPath(folderPath)
        : previous,
    );
    setSelectedFileId(null);
  };

  const renameFileTitle = (file: KnowledgeDocument) => {
    const nextTitle = window.prompt('修改资料标题', file.title);
    if (!nextTitle || !nextTitle.trim()) {
      return;
    }

    setFiles((previous) =>
      previous.map((currentFile) =>
        currentFile.id === file.id
          ? updateKnowledgeDocument(currentFile, { title: nextTitle.trim() })
          : currentFile,
      ),
    );
  };

  const deleteFile = (fileId: string) => {
    const targetFile = files.find((file) => file.id === fileId);
    const shouldDelete = window.confirm(
      `确定删除文件「${targetFile?.title ?? '当前文件'}」吗？删除后将无法恢复。`,
    );

    if (!shouldDelete) {
      return;
    }

    setFiles((previous) => previous.filter((file) => file.id !== fileId));
    setAddingTagId((previous) => (previous === fileId ? null : previous));
    setSelectedFileId((previous) => (previous === fileId ? null : previous));
  };

  const submitTag = (fileId: string) => {
    if (tagInput.trim()) {
      setFiles((previous) =>
        previous.map((file) =>
          file.id === fileId
            ? { ...file, tags: Array.from(new Set([...file.tags, tagInput.trim()])) }
            : file,
        ),
      );
    }

    setAddingTagId(null);
    setTagInput('');
  };

  const removeTag = (fileId: string, tagToRemove: string) => {
    setFiles((previous) =>
      previous.map((file) =>
        file.id === fileId
          ? { ...file, tags: file.tags.filter((tag) => tag !== tagToRemove) }
          : file,
      ),
    );
  };

  const hasMaterials = folderPaths.length > 0 || files.length > 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <div className="h-6 w-1.5 rounded-full bg-blue-600" />
          {sectionNumber}. {title}
        </h2>
      </div>

      <input
        type="file"
        ref={dirInputRef}
        className="hidden"
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        multiple
        onChange={handleDirectoryUpload}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleSingleFileUpload}
      />

      {hasMaterials ? (
        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
          <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setSelectedFolder('');
                setSelectedFileId(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedFolder === '' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FolderTree size={15} className="text-blue-600" />
              <span className="font-medium">根目录</span>
            </button>

            <div className="mt-3 max-h-[30rem] space-y-1 overflow-y-auto pr-1">
              {folderTree.map((node) => (
                <div key={node.path}>
                  <FolderTreeNode
                    node={node}
                    selectedFolder={selectedFolder}
                    onSelect={(path) => {
                      setSelectedFolder(path);
                      setSelectedFileId(null);
                    }}
                  />
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-400">
                    {breadcrumbs.map((breadcrumb, index) => (
                      <div key={breadcrumb.path || 'root'} className="flex items-center gap-1">
                        {index > 0 && <ChevronRight size={12} />}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFolder(breadcrumb.path);
                            setSelectedFileId(null);
                          }}
                          className={`truncate ${
                            breadcrumb.path === selectedFolder || (!breadcrumb.path && selectedFolder === '')
                              ? 'font-bold text-blue-600'
                              : 'hover:text-blue-600'
                          }`}
                        >
                          {breadcrumb.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openCreateFolderDialog(selectedFolder)}
                    className="flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:bg-blue-50"
                  >
                    <Plus size={13} />
                    新建
                  </button>
                  <UploadActionMenu
                    isUploading={isUploading}
                    buttonLabel="上传"
                    onSingleUpload={() => triggerSingleUpload(selectedFolder || DIRECTORY_PLACEHOLDER)}
                    onDirectoryUpload={triggerDirectoryUpload}
                    buttonClassName="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[34rem] overflow-y-auto">
              {currentFolders.length > 0 && (
                <div className="border-b border-gray-100 px-3 py-2">
                  {currentFolders.map((folderPath) => (
                    <div
                      key={folderPath}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFolder(folderPath);
                          setSelectedFileId(null);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <FolderTree size={16} className="shrink-0 text-amber-500" />
                        <span className="truncate text-sm font-medium text-gray-700">
                          {getFolderName(folderPath)}
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openCreateFolderDialog(folderPath)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-blue-600"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openRenameFolderDialog(folderPath)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-blue-600"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFolder(folderPath)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentFiles.length > 0 ? (
                <div className="px-3 py-2">
                  <div className="grid grid-cols-[minmax(0,1.8fr)_150px_104px] gap-3 px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <span>名称</span>
                    <span>上传时间</span>
                    <span className="text-right">操作</span>
                  </div>

                  {currentFiles.map((file) => {
                    const isSelected = selectedFile?.id === file.id;

                    return (
                      <div
                        key={file.id}
                        className={`grid grid-cols-[minmax(0,1.8fr)_150px_104px] items-center gap-3 rounded-xl px-2 py-2 text-sm transition-all ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedFileId(file.id)}
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <FileText size={16} className="shrink-0 text-indigo-500" />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-gray-800">{file.title}</div>
                            <div className="truncate text-[11px] text-gray-400">{file.name}</div>
                          </div>
                        </button>
                        <span className="text-xs text-gray-500">{file.updatedAtLabel}</span>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedFileId(file.id)}
                            className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-blue-600"
                            title="预览"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => renameFileTitle(file)}
                            className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-blue-600"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFile(file.id)}
                            className="rounded p-1 text-gray-400 transition-colors hover:bg-white hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center text-sm text-gray-400">
                  当前目录下还没有文件，可继续上传资料或新建子目录。
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">文件详情</div>

            {selectedFile ? (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">{selectedFile.title}</div>
                  <div className="mt-1 break-all text-xs text-gray-400">{selectedFile.name}</div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    上传时间
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-700">{selectedFile.updatedAtLabel}</div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                  <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    <BrainCircuit size={11} />
                    自动摘要
                  </div>
                  <p className="text-sm leading-6 text-gray-600">{selectedFile.summary}</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <Tag size={10} />
                    标签
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFile.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`group/tag flex items-center gap-1 rounded border py-1 pl-2 pr-1 text-[10px] font-bold ${
                          tag.includes('风险')
                            ? 'border-red-100 bg-red-50 text-red-600'
                            : 'border-blue-100 bg-blue-50 text-blue-600'
                        }`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(selectedFile.id, tag)}
                          className="rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover/tag:opacity-100"
                        >
                          <X size={8} />
                        </button>
                      </span>
                    ))}

                    {addingTagId === selectedFile.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={tagInput}
                        onChange={(event) => setTagInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            submitTag(selectedFile.id);
                          } else if (event.key === 'Escape') {
                            setAddingTagId(null);
                            setTagInput('');
                          }
                        }}
                        onBlur={() => submitTag(selectedFile.id)}
                        placeholder="回车确认"
                        className="w-24 rounded border border-blue-200 bg-white px-2 py-1 text-[10px] text-gray-700 outline-none ring-blue-400 focus:ring-1"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingTagId(selectedFile.id)}
                        className="flex items-center gap-0.5 rounded border border-dashed border-blue-200 px-2 py-1 text-[10px] font-bold text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <Plus size={10} />
                        加标签
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-400">
                选择一个文件后，在这里查看摘要、标签和详情。
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <FolderTree size={28} className="text-blue-500" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-800">按文件夹方式管理资料</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            目录区更轻，文件区更紧凑，摘要放到详情面板里。先建目录再上传，或者直接上传整个文件夹都可以。
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => openCreateFolderDialog('')}
              className="flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm hover:bg-blue-50"
            >
              <FolderPlus size={16} />
              新建目录
            </button>
            <UploadActionMenu
              isUploading={isUploading}
              buttonLabel="上传资料"
              onSingleUpload={() => triggerSingleUpload(DIRECTORY_PLACEHOLDER)}
              onDirectoryUpload={triggerDirectoryUpload}
              buttonClassName="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            />
          </div>
        </div>
      )}

      {folderDialog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{folderDialog.dialogTitle}</h3>
              <button
                type="button"
                onClick={closeFolderDialog}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <label className="text-sm font-bold text-gray-700">目录名称</label>
              <input
                autoFocus
                type="text"
                value={folderNameInput}
                onChange={(event) => {
                  setFolderNameInput(event.target.value);
                  if (folderDialogError) {
                    setFolderDialogError('');
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    submitFolderDialog();
                  }
                }}
                placeholder="请输入目录名称"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-blue-300 focus:bg-white"
              />
              {folderDialogError && (
                <p className="text-xs font-medium text-red-500">{folderDialogError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeFolderDialog}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submitFolderDialog}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                {folderDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
