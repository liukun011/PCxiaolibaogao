import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Mic,
  Play,
  Pause,
  FileText,
  Volume2,
  Clock,
  X,
} from "lucide-react";
import { mockInterview, type InterviewTranscript, type DDQuestion } from "@/src/types";

type RecordingsViewProps = {
  onBack: () => void;
};

export const RecordingsView: React.FC<RecordingsViewProps> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isPlaying) {
        setCurrentTime((prev) => Math.min(prev + 1, 300));
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPlaying]);

  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  const formattedTime = `${Math.floor(currentTime / 60)
    .toString()
    .padStart(2, "0")}:${(currentTime % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          返回
        </button>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Mic size={18} />
          录音管理
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayToggle}
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <div>
                <div className="text-xs text-gray-400">当前播放时间</div>
                <div className="text-lg font-semibold text-gray-900">{formattedTime}</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-[0.18em]">
              <Volume2 size={14} />
              播放控制
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                使用播放按钮查看录音进度和转录内容。当前演示使用占位数据。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              转录摘要
            </div>
            <span className="text-xs text-gray-400">{mockInterview.transcripts.length} 条</span>
          </div>
          <div
            ref={transcriptContainerRef}
            className="space-y-3 max-h-[24rem] overflow-y-auto pr-2"
          >
            {mockInterview.transcripts.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2 text-[11px] text-gray-400">
                  <span>{item.speaker}</span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
