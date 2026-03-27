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

            {/* Audio waveform placeholder */}
            <div className="bg-muted rounded-lg p-4 flex items-end justify-center gap-0.5 h-24">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-primary/60 rounded-t"
                  style={{ width: 4, height: Math.random() * 60 + 10 }}
                />
              ))}
            </div>

            {/* Audio controls bar */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full hover:bg-muted"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
              <span className="text-sm text-muted-foreground">00:00 / 00:12</span>
              <Volume2 className="h-4 w-4 text-muted-foreground ml-auto" />
            </div>

            {/* Reject remark input (inline) */}
            {showRejectInput && (
              <div className="space-y-2">
                <textarea
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="请输入打回备注"
                  maxLength={200}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[60px] resize-none"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleRejectConfirm}>
                    确认打回
                  </Button>
                </div>
              </div>
            )}

            {/* Bottom action buttons */}
            <div className="flex items-center justify-center gap-4 pb-5">
              {!showRejectInput && (
                <Button variant="destructive" onClick={handleRejectClick}>
                  确认打回
                </Button>
              )}
              <Button onClick={handlePass}>确认通过</Button>
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
