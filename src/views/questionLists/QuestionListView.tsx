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
export const QuestionListView = ({
  collections,
  setCollections,
}: {
  collections: QuestionCollection[];
  setCollections: React.Dispatch<React.SetStateAction<QuestionCollection[]>>;
}) => {
  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id || "bank");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const addQuestionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!collections.find((item) => item.id === activeCollectionId)) {
      setActiveCollectionId(collections[0]?.id || "bank");
    }
  }, [activeCollectionId, collections]);

  const activeCollection = collections.find((item) => item.id === activeCollectionId);

  const handleCreateCollection = () => {
    if (!newCollectionTitle.trim()) return;
    const nextCollection: QuestionCollection = {
      id: `custom-${Date.now()}`,
      title: newCollectionTitle.trim(),
      desc: newCollectionDesc.trim() || "自定义问题集合",
      questions: [],
    };
    setCollections((prev) => [...prev, nextCollection]);
    setActiveCollectionId(nextCollection.id);
    setShowCreateForm(false);
    setNewCollectionTitle("");
    setNewCollectionDesc("");
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !activeCollection) return;
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === activeCollection.id
          ? {
              ...collection,
              questions: [
                ...collection.questions,
                {
                  category: "未分类",
                  question: newQuestionText.trim(),
                  source: "问题清单预设",
                  type: "preset",
                },
              ],
            }
          : collection,
      ),
    );
    setNewQuestionText("");
    window.setTimeout(() => {
      addQuestionTextareaRef.current?.focus();
    }, 0);
  };

  const handleAddQuestionAndClose = () => {
    if (!newQuestionText.trim() || !activeCollection) return;
    handleAddQuestion();
    setShowAddQuestionForm(false);
  };

  const handleStartEditQuestion = (index: number, item: InterviewQuestion) => {
    setEditingQuestionIndex(index);
    setEditingQuestionText(item.question);
  };

  const handleSaveQuestion = () => {
    if (editingQuestionIndex === null || !activeCollection || !editingQuestionText.trim()) return;
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === activeCollection.id
          ? {
              ...collection,
              questions: collection.questions.map((item, index) =>
                index === editingQuestionIndex
                  ? { ...item, question: editingQuestionText.trim() }
                  : item,
              ),
            }
          : collection,
      ),
    );
    setEditingQuestionIndex(null);
    setEditingQuestionText("");
  };

  const handleDeleteQuestion = (index: number) => {
    if (!activeCollection) return;
    const target = activeCollection.questions[index];
    if (!target) return;
    const confirmed = window.confirm(`确认删除问题“${target.question}”吗？`);
    if (!confirmed) return;
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === activeCollection.id
          ? { ...collection, questions: collection.questions.filter((_, itemIndex) => itemIndex !== index) }
          : collection,
      ),
    );
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-8 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">问题清单</h1>
            <p className="mt-1 text-sm text-gray-500">集中管理问题集合，并维护集合内的问题。</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-8">
        <div className="grid h-full gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-gray-400">问题集合</p>
                  <p className="mt-2 text-sm text-gray-500">选择一套问题清单进行管理</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm((prev) => !prev);
                    setShowAddQuestionForm(false);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${showCreateForm ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  <PlusCircle size={14} />
                  <span>新建</span>
                </button>
              </div>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-3">
              <AnimatePresence>
                {showCreateForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-3 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60"
                  >
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                        <BookOpen size={14} />
                        <span>新建问题集合</span>
                      </div>
                      <input
                        type="text"
                        value={newCollectionTitle}
                        onChange={(e) => setNewCollectionTitle(e.target.value)}
                        placeholder="输入问题集合名称..."
                        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <input
                        type="text"
                        value={newCollectionDesc}
                        onChange={(e) => setNewCollectionDesc(e.target.value)}
                        placeholder="输入问题集合说明（选填）..."
                        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewCollectionTitle("");
                            setNewCollectionDesc("");
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleCreateCollection}
                          disabled={!newCollectionTitle.trim()}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          创建问题集合
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {collections.map((collection) => {
                  const isActive = activeCollectionId === collection.id;
                  return (
                    <button
                      key={collection.id}
                      onClick={() => setActiveCollectionId(collection.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${isActive ? "border-blue-200 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-100 hover:bg-blue-50/40"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-800">{collection.title}</p>
                          <p className="mt-1 truncate text-xs text-gray-500">{collection.desc}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                          {collection.questions.length}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-gray-400">当前集合</p>
                  <h2 className="mt-2 text-xl font-bold text-gray-800">{activeCollection?.title || "未选择问题集合"}</h2>
                  <p className="mt-1 text-sm text-gray-500">{activeCollection?.desc || "请选择左侧问题集合"}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddQuestionForm((prev) => !prev);
                    setShowCreateForm(false);
                  }}
                  disabled={!activeCollection}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${showAddQuestionForm ? "border-amber-500 bg-amber-500 text-white" : "border-amber-200 bg-white text-amber-600 hover:bg-amber-50"} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Plus size={16} />
                  <span>新增问题</span>
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
              <AnimatePresence>
                {showAddQuestionForm && activeCollection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b border-gray-100"
                  >
                    <div className="space-y-3 bg-amber-50/40 p-5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                        <Plus size={14} />
                        <span>新增问题</span>
                      </div>
                      <textarea
                        ref={addQuestionTextareaRef}
                        autoFocus
                        rows={3}
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                            e.preventDefault();
                            handleAddQuestion();
                          }
                        }}
                        placeholder="输入问题内容..."
                        className="w-full resize-none rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowAddQuestionForm(false);
                            setNewQuestionText("");
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleAddQuestionAndClose}
                          disabled={!newQuestionText.trim()}
                          className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          保存
                        </button>
                        <button
                          onClick={handleAddQuestion}
                          disabled={!newQuestionText.trim()}
                          className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          保存并继续新增
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="divide-y divide-gray-100">
                {activeCollection?.questions.length ? (
                  activeCollection.questions.map((item, index) => (
                    <div key={`${activeCollection.id}-${index}`} className="p-5 transition-colors hover:bg-gray-50/70">
                      {editingQuestionIndex === index ? (
                        <div className="space-y-3">
                          <textarea
                            autoFocus
                            rows={3}
                            value={editingQuestionText}
                            onChange={(e) => setEditingQuestionText(e.target.value)}
                            className="w-full resize-none rounded-xl border border-blue-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingQuestionIndex(null)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleSaveQuestion}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-blue-700"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{item.category}</span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">预设问题</span>
                            </div>
                            <p className="mt-3 text-sm font-medium leading-7 text-gray-800">{item.question}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEditQuestion(index, item)}
                              className="rounded-lg border border-gray-200 p-2 text-gray-400 transition-all hover:bg-white hover:text-blue-600"
                              title="编辑问题"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(index)}
                              className="rounded-lg border border-gray-200 p-2 text-gray-400 transition-all hover:bg-white hover:text-red-600"
                              title="删除问题"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    <BookOpen size={32} className="mx-auto opacity-20" />
                    <p className="mt-3 text-sm font-medium">当前问题集合还没有问题</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Project List View Component

