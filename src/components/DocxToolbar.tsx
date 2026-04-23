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
export const DocxToolbar = () => (
  <div className="h-10 border-b border-gray-200 bg-gray-50 flex items-center px-4 gap-1 sticky top-16 z-20 shadow-sm">
    <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-2">
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="撤销"><Undo size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="重做"><Redo size={14} /></button>
    </div>
    <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-2">
      <select className="text-xs bg-transparent border-none focus:ring-0 text-gray-700 font-medium">
        <option>宋体 (SimSun)</option>
        <option>微软雅黑</option>
        <option>Times New Roman</option>
      </select>
      <select className="text-xs bg-transparent border-none focus:ring-0 text-gray-700 font-medium w-12">
        <option>12</option>
        <option>14</option>
        <option>16</option>
      </select>
    </div>
    <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 font-bold" title="加粗">B</button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 italic" title="倾斜">I</button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 underline" title="下划线">U</button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-700 line-through" title="删除线">S</button>
    </div>
    <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignLeft size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignCenter size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignRight size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignJustify size={14} /></button>
    </div>
    <div className="flex items-center gap-1">
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="插入表格"><Table size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="插入图片"><ImageIcon size={14} /></button>
      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="查找替换"><Search size={14} /></button>
    </div>
  </div>
);


