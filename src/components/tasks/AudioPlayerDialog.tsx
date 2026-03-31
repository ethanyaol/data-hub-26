import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, X } from "lucide-react";
import { toast } from "sonner";
import type { AudioDetailRecord } from "@/pages/tasks/types";

interface AudioPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioList: AudioDetailRecord[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const AudioPlayerDialog = ({
  open,
  onOpenChange,
  audioList,
  currentIndex,
  onIndexChange,
}: AudioPlayerDialogProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  const current = audioList[currentIndex];

  if (!current) return null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      setShowRejectInput(false);
      setRejectRemark("");
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < audioList.length - 1) {
      onIndexChange(currentIndex + 1);
      setShowRejectInput(false);
      setRejectRemark("");
      setIsPlaying(false);
    }
  };

  const handlePass = () => {
    toast.success("已确认通过");
    setShowRejectInput(false);
    setRejectRemark("");
  };

  const handleRejectClick = () => {
    setShowRejectInput(true);
  };

  const handleRejectConfirm = () => {
    toast.success("已确认打回");
    setShowRejectInput(false);
    setRejectRemark("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setShowRejectInput(false);
    setRejectRemark("");
    setIsPlaying(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">试听</span>
            <span className="text-sm text-muted-foreground">
              词条序号 {current.termIndex}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content with navigation arrows */}
        <div className="relative flex items-center">
          {/* Left arrow */}
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="absolute left-1 z-10 p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Main content */}
          <div className="flex-1 px-12 space-y-4">
            {/* Info section */}
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">录制文本：</span>
                <span className="text-foreground">{current.recordingText}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                代理人：王工&nbsp;&nbsp;&nbsp;&nbsp;录音人：小张&nbsp;&nbsp;性别：男&nbsp;&nbsp;年龄：27
              </div>
            </div>

            {/* Audio waveform container */}
            <div className="relative bg-accent/20 rounded-xl p-6 h-32 flex items-center justify-center overflow-hidden group">
              {/* Horizontal Baseline */}
              <div className="absolute left-0 right-0 h-[1px] bg-emerald-200/50 z-0" />
              
              {/* Waveform Bars */}
              <div className="flex items-center gap-[2px] h-full z-10">
                {Array.from({ length: 50 }).map((_, i) => {
                  const height = Math.sin(i * 0.4) * 30 + 40 + Math.random() * 20;
                  return (
                    <div
                      key={i}
                      className="bg-emerald-400 rounded-full w-1 transition-all duration-300"
                      style={{ 
                        height: `${height}%`,
                        opacity: i < 20 ? 1 : 0.4 // Simulate played part contrast
                      }}
                    />
                  );
                })}
              </div>

              {/* Red Playhead */}
              <div 
                className="absolute left-[40%] top-4 bottom-4 w-[2px] bg-red-500 z-20 flex flex-col items-center"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 -mt-1 shadow-sm shadow-red-500/50" />
              </div>
            </div>

            {/* Audio controls bar (Pill Style) */}
            <div className="flex justify-center">
              <div className="bg-gray-100/90 backdrop-blur-md rounded-full px-6 py-2.5 flex items-center gap-6 shadow-sm border border-white/20">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-md"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium tabular-nums min-w-[36px]">00:04</span>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[40%] rounded-full" />
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums min-w-[36px]">00:12</span>
                </div>

                <div className="h-4 w-[1px] bg-gray-300" />

                <div className="flex items-center gap-2 group cursor-pointer">
                  <Volume2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* QC Actions Section */}
            <div className="pt-4 pb-6 mt-2 border-t border-slate-100 bg-slate-50/30 -mx-12 px-12 group/qc">
              {!showRejectInput ? (
                <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    onClick={handleRejectClick}
                  >
                    确认打回
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-8"
                    onClick={handlePass}
                  >
                    确认通过
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-1 h-3 bg-red-500 rounded-full" />
                      打回备注
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      {rejectRemark.length}/200
                    </span>
                  </div>
                  <textarea
                    value={rejectRemark}
                    onChange={(e) => setRejectRemark(e.target.value)}
                    placeholder="请输入打回的具体原因，以便录音人修改..."
                    maxLength={200}
                    autoFocus
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-red-500 min-h-[80px] resize-none transition-all shadow-inner"
                  />
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setShowRejectInput(false);
                        setRejectRemark("");
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      取消
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleRejectConfirm}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-sm px-6"
                    >
                      确认打回
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={handleNext}
            disabled={currentIndex >= audioList.length - 1}
            className="absolute right-1 z-10 p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioPlayerDialog;
