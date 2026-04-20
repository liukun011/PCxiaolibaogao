#!/bin/bash
IMPORTS="import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, FileText, Database, BookOpen, PenTool, ClipboardCheck, Settings, MessageSquare, HelpCircle, ChevronRight, ChevronDown, Search, Bell, User, Mic, Play, Pause, Download, Building, Activity, Trash2, History, FileJson, FileSpreadsheet, FileAudio, FileText as FileIcon, CheckCircle2, Check, Layout, Sparkles, Clock, X, Maximize2, MoreHorizontal, ArrowRight, Target, BrainCircuit, Volume2, AlertTriangle, GitBranch, Edit3, ArrowLeft, Undo, Redo, AlignLeft, AlignCenter, AlignRight, AlignJustify, Table, Shield, Lock, Eye, EyeOff, Info, AlertCircle, Users, Briefcase, Gavel, Scale, Tag, RefreshCw, Zap, PlusCircle, ShieldAlert, Lightbulb, Image as ImageIcon, Printer, Share2, Plus, Upload, Package, TrendingUp, PieChart, BarChart3, LineChart, Code2, FolderTree } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';"

for file in src/components/DocumentClassificationSection.tsx src/views/DSLEngineView.tsx src/views/DocumentManagerView.tsx; do
  echo "$IMPORTS" > temp.tsx
  echo "" >> temp.tsx
  sed 's/^\/\/ ---.*//' "$file" | sed 's/^const /export const /' >> temp.tsx
  mv temp.tsx "$file"
done
