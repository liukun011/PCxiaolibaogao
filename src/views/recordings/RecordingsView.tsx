import React, { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileAudio,
  Folder,
  List,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";

type RecordingFolder = {
  id: string;
  name: string;
  children?: RecordingFolder[];
};

type RecordingFile = {
  id: string;
  folderId: string;
  title: string;
  kind: "meeting";
  duration: string;
  size: string;
  owner: string;
  updatedAt: string;
  status: "已转写" | "转写中" | "未转写";
};

type RecordingsViewProps = {
  onBack?: () => void;
};

const initialFolderTree: RecordingFolder[] = [
  {
    id: "all",
    name: "全部录音",
    children: [
      {
        id: "product",
        name: "产品会议录音",
      },
      { id: "customer", name: "客户深度访谈" },
      { id: "training", name: "内部培训录音" },
    ],
  },
  { id: "uncategorized", name: "未分类录音" },
  { id: "recycle-bin", name: "回收站" },
];

const lockedFolderIds = ["uncategorized", "recycle-bin"];
const undeletableFolderIds = ["all", ...lockedFolderIds];
const uneditableFolderIds = ["all", ...lockedFolderIds];

const recordings: RecordingFile[] = [
  {
    id: "r1",
    folderId: "product",
    title: "移动端产品需求评审会",
    kind: "meeting",
    duration: "46:18",
    size: "38.4 MB",
    owner: "周明",
    updatedAt: "2026-06-10 14:30",
    status: "已转写",
  },
  {
    id: "r2",
    folderId: "product",
    title: "数据看板交互设计讨论",
    kind: "meeting",
    duration: "32:05",
    size: "24.7 MB",
    owner: "林悦",
    updatedAt: "2026-06-09 16:20",
    status: "已转写",
  },
  {
    id: "r3",
    folderId: "product",
    title: "六月发布会彩排记录",
    kind: "meeting",
    duration: "58:42",
    size: "52.1 MB",
    owner: "王然",
    updatedAt: "2026-06-07 10:12",
    status: "转写中",
  },
  {
    id: "r4",
    folderId: "customer",
    title: "A 公司客户深度访谈",
    kind: "meeting",
    duration: "27:50",
    size: "18.9 MB",
    owner: "陈可",
    updatedAt: "2026-06-05 09:45",
    status: "已转写",
  },
  {
    id: "r5",
    folderId: "training",
    title: "新员工尽调流程培训",
    kind: "meeting",
    duration: "01:12:36",
    size: "66.3 MB",
    owner: "赵宁",
    updatedAt: "2026-06-02 15:00",
    status: "未转写",
  },
];

const childFolderIds = (folderId: string, folders: RecordingFolder[]): string[] => {
  const result: string[] = [];

  const visit = (items: RecordingFolder[]) => {
    items.forEach((item) => {
      if (item.id === folderId || result.includes(item.id)) {
        result.push(item.id);
        if (item.children) {
          item.children.forEach((child) => result.push(child.id));
          visit(item.children);
        }
      } else if (item.children) {
        visit(item.children);
      }
    });
  };

  if (folderId === "all") {
    return folders.flatMap((folder) => collectFolderIds(folder));
  }

  visit(folders);
  return result.length ? result : [folderId];
};

const collectFolderIds = (folder: RecordingFolder): string[] => [
  folder.id,
  ...(folder.children || []).flatMap((child) => collectFolderIds(child)),
];

const getFolderName = (folderId: string, folders: RecordingFolder[]): string => {
  const find = (items: RecordingFolder[]): string | null => {
    for (const item of items) {
      if (item.id === folderId) return item.name;
      if (item.children) {
        const childName = find(item.children);
        if (childName) return childName;
      }
    }
    return null;
  };

  return find(folders) || "全部录音";
};

const updateFolderName = (
  folders: RecordingFolder[],
  folderId: string,
  nextName: string,
): RecordingFolder[] =>
  folders.map((folder) => {
    if (folder.id === folderId) {
      return { ...folder, name: nextName };
    }

    if (folder.children) {
      return { ...folder, children: updateFolderName(folder.children, folderId, nextName) };
    }

    return folder;
  });

const addChildFolder = (
  folders: RecordingFolder[],
  parentId: string,
  child: RecordingFolder,
): RecordingFolder[] =>
  folders.map((folder) => {
    if (folder.id === parentId) {
      return { ...folder, children: [...(folder.children || []), child] };
    }

    if (folder.children) {
      return { ...folder, children: addChildFolder(folder.children, parentId, child) };
    }

    return folder;
  });

const deleteFolder = (folders: RecordingFolder[], folderId: string): RecordingFolder[] =>
  folders
    .filter((folder) => folder.id !== folderId)
    .map((folder) =>
      folder.children ? { ...folder, children: deleteFolder(folder.children, folderId) } : folder,
    );

const findFolderById = (
  folders: RecordingFolder[],
  folderId: string,
): RecordingFolder | null => {
  for (const folder of folders) {
    if (folder.id === folderId) return folder;
    if (folder.children) {
      const child = findFolderById(folder.children, folderId);
      if (child) return child;
    }
  }

  return null;
};

const kindMeta = {
  meeting: { icon: FileAudio, label: "会议录音", tone: "bg-blue-50 text-blue-600" },
};

const statusClassName = {
  已转写: "bg-emerald-50 text-emerald-600",
  转写中: "bg-amber-50 text-amber-600",
  未转写: "bg-gray-100 text-gray-500",
};

const DirectoryNode: React.FC<{
  folder: RecordingFolder;
  depth?: number;
  selectedId: string;
  expandedIds: string[];
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (folder: RecordingFolder) => void;
  onAddChild: (folder: RecordingFolder) => void;
  onDelete: (folder: RecordingFolder) => void;
}> = ({
  folder,
  depth = 0,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onEdit,
  onAddChild,
  onDelete,
}) => {
  const hasChildren = Boolean(folder.children?.length);
  const expanded = expandedIds.includes(folder.id);
  const active = selectedId === folder.id;
  const locked = lockedFolderIds.includes(folder.id);

  return (
    <div>
      <div
        className={`group flex h-9 w-full items-center rounded-lg pr-1 text-sm transition-colors ${
          active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onSelect(folder.id);
            if (hasChildren) onToggle(folder.id);
          }}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-2 pl-3 text-left"
          style={{ paddingLeft: `${12 + depth * 18}px` }}
        >
          {hasChildren ? (
            expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-3.5" />
          )}
          <Folder size={17} className={active ? "text-blue-500" : "text-slate-400"} />
          <span className="truncate font-medium">{folder.name}</span>
        </button>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {!locked && (
            <button
              type="button"
              aria-label={`给${folder.name}添加子目录`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-blue-600"
              onClick={(event) => {
                event.stopPropagation();
                onAddChild(folder);
              }}
            >
              <Plus size={14} />
            </button>
          )}
          {!uneditableFolderIds.includes(folder.id) && (
              <button
                type="button"
                aria-label={`编辑${folder.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-blue-600"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(folder);
                }}
              >
                <Pencil size={14} />
              </button>
          )}
          {!undeletableFolderIds.includes(folder.id) && (
            <button
              type="button"
              aria-label={`删除${folder.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-red-500"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(folder);
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {folder.children?.map((child) => (
            <DirectoryNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const RecordingsView: React.FC<RecordingsViewProps> = () => {
  const [folderTree, setFolderTree] = useState(initialFolderTree);
  const [selectedFolderId, setSelectedFolderId] = useState("all");
  const [expandedIds, setExpandedIds] = useState(["all", "product"]);
  const [keyword, setKeyword] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(224);
  const [editingFolder, setEditingFolder] = useState<RecordingFolder | null>(null);
  const [editingName, setEditingName] = useState("");
  const [addingParent, setAddingParent] = useState<RecordingFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<RecordingFolder | null>(null);

  const selectedFolderIds = useMemo(
    () => childFolderIds(selectedFolderId, folderTree),
    [folderTree, selectedFolderId],
  );
  const visibleRecordings = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return recordings.filter((recording) => {
      const inFolder = selectedFolderIds.includes(recording.folderId);
      const matched =
        !normalizedKeyword ||
        recording.title.toLowerCase().includes(normalizedKeyword) ||
        recording.owner.toLowerCase().includes(normalizedKeyword);
      return inFolder && matched;
    });
  }, [keyword, selectedFolderIds]);

  const folderCards = useMemo(
    () => {
      const allFolder = findFolderById(folderTree, "all");
      return (allFolder?.children || []).map((folder) => ({
        id: folder.id,
        name: folder.name,
        count: recordings.filter((recording) =>
          childFolderIds(folder.id, folderTree).includes(recording.folderId),
        ).length,
      }));
    },
    [folderTree],
  );

  const showFolderCards = selectedFolderId === "all" && keyword.trim() === "";

  const toggleExpanded = (folderId: string) => {
    setExpandedIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId],
    );
  };

  const openEditPanel = (folder: RecordingFolder) => {
    if (uneditableFolderIds.includes(folder.id)) return;

    setEditingFolder(folder);
    setEditingName(folder.name);
  };

  const closeEditPanel = () => {
    setEditingFolder(null);
    setEditingName("");
  };

  const saveFolderName = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = editingName.trim();

    if (!editingFolder || uneditableFolderIds.includes(editingFolder.id) || !nextName) return;

    setFolderTree((prev) => updateFolderName(prev, editingFolder.id, nextName));
    closeEditPanel();
  };

  const openAddPanel = (folder: RecordingFolder) => {
    if (lockedFolderIds.includes(folder.id)) return;

    setAddingParent(folder);
    setNewFolderName("");
  };

  const closeAddPanel = () => {
    setAddingParent(null);
    setNewFolderName("");
  };

  const saveChildFolder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = newFolderName.trim();

    if (!addingParent || lockedFolderIds.includes(addingParent.id) || !nextName) return;

    const nextFolder = { id: `folder-${Date.now()}`, name: nextName };
    setFolderTree((prev) => addChildFolder(prev, addingParent.id, nextFolder));
    setExpandedIds((prev) => (prev.includes(addingParent.id) ? prev : [...prev, addingParent.id]));
    setSelectedFolderId(nextFolder.id);
    closeAddPanel();
  };

  const confirmDeleteFolder = () => {
    if (!deletingFolder || undeletableFolderIds.includes(deletingFolder.id)) return;

    const deletedFolderIds = childFolderIds(deletingFolder.id, folderTree);
    setFolderTree((prev) => deleteFolder(prev, deletingFolder.id));
    if (deletedFolderIds.includes(selectedFolderId)) {
      setSelectedFolderId("all");
    }
    setExpandedIds((prev) => prev.filter((id) => id !== deletingFolder.id));
    setDeletingFolder(null);
  };

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = Math.min(Math.max(startWidth + moveEvent.clientX - startX, 224), 360);
      setSidebarWidth(nextWidth);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 pb-4 pt-8">
        <div className="text-sm text-slate-500">
          我的资源 <span className="mx-2 text-slate-300">/</span>
          <span className="font-medium text-slate-800">我的录音</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex h-10 w-72 items-center rounded-xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="输入搜索关键字"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
            <Search size={16} />
          </label>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700">
            <Plus size={16} />
            上传录音
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className="relative shrink-0 border-r border-slate-200 bg-white"
          style={{ width: sidebarWidth }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-5">
              <h2 className="text-base font-bold text-slate-900">录音目录</h2>
              <button
                type="button"
                aria-label="添加子目录"
                disabled={lockedFolderIds.includes(selectedFolderId)}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                onClick={() => {
                  const selectedFolder = findFolderById(folderTree, selectedFolderId);
                  if (selectedFolder) openAddPanel(selectedFolder);
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-5">
              {folderTree.map((folder) => (
                <DirectoryNode
                  key={folder.id}
                  folder={folder}
                  selectedId={selectedFolderId}
                  expandedIds={expandedIds}
                  onSelect={setSelectedFolderId}
                  onToggle={toggleExpanded}
                  onEdit={openEditPanel}
                  onAddChild={openAddPanel}
                  onDelete={setDeletingFolder}
                />
              ))}

            </div>
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="调整录音目录宽度"
            className="absolute right-0 top-0 h-full w-2 translate-x-1 cursor-col-resize transition-colors hover:bg-blue-100"
            onPointerDown={handleResizeStart}
          />
        </aside>

        <section className="min-w-0 flex-1 overflow-y-auto px-8 py-9">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h1 className="text-xl font-bold text-slate-950">{getFolderName(selectedFolderId, folderTree)}</h1>
              <span className="text-sm text-slate-400">
                共 {showFolderCards ? folderCards.length : visibleRecordings.length} 项
              </span>
            </div>
            <div className="flex items-center gap-5 text-sm text-slate-500">
              <button className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600">
                <List size={16} />
                列表
              </button>
              <button className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600">
                <SlidersHorizontal size={16} />
                排序
              </button>
            </div>
          </div>

          {showFolderCards ? (
            <div className="grid gap-5 xl:grid-cols-3 lg:grid-cols-2">
              {folderCards.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className="group flex h-24 items-center gap-3 rounded-xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-100"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Folder size={26} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-slate-950 group-hover:text-blue-600">{folder.name}</div>
                    <div className="mt-1 text-sm text-slate-500">文件夹 · {folder.count} 个录音</div>
                  </div>
                </button>
              ))}
            </div>
          ) : visibleRecordings.length ? (
            <div className="grid gap-5 xl:grid-cols-3 lg:grid-cols-2">
              {visibleRecordings.map((recording) => {
                const meta = kindMeta[recording.kind];
                const KindIcon = meta.icon;

                return (
                  <article
                    key={recording.id}
                    className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-100"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                        <KindIcon size={25} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-950">{recording.title}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="truncate text-sm text-slate-500">{meta.label}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusClassName[recording.status]}`}>
                            {recording.status}
                          </span>
                        </div>
                      </div>
                      <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{recording.duration}</span>
                        <span className="text-slate-300">·</span>
                        <span>{recording.size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserRound size={14} />
                        <span>{recording.owner}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{recording.updatedAt}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                        <Play size={15} />
                        播放
                      </button>
                      <button className="inline-flex h-8 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-200 hover:text-blue-600">
                        <Download size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <FileAudio size={26} />
              </div>
              <div className="font-semibold text-slate-800">暂无录音文件</div>
              <div className="mt-1 text-sm text-slate-400">可以上传录音，或切换到其他目录查看。</div>
            </div>
          )}
        </section>
      </div>

      {editingFolder && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/20 px-4">
          <form
            onSubmit={saveFolderName}
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl ring-1 ring-slate-200"
          >
            <div className="text-base font-bold text-slate-950">修改目录名称</div>
            <label className="mt-4 block text-sm font-medium text-slate-600">
              目录名称
              <input
                autoFocus
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditPanel}
                className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!editingName.trim()}
                className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {addingParent && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/20 px-4">
          <form
            onSubmit={saveChildFolder}
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl ring-1 ring-slate-200"
          >
            <div className="text-base font-bold text-slate-950">新增子目录</div>
            <div className="mt-1 text-sm text-slate-500">添加到：{addingParent.name}</div>
            <label className="mt-4 block text-sm font-medium text-slate-600">
              目录名称
              <input
                autoFocus
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAddPanel}
                className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!newFolderName.trim()}
                className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingFolder && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/20 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="text-base font-bold text-slate-950">删除目录</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              确认删除“{deletingFolder.name}”吗？该目录下的子目录也会一起移除。
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingFolder(null)}
                className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDeleteFolder}
                className="h-9 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
