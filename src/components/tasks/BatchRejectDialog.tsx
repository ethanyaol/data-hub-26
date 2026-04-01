import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BatchRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remark: string) => void;
  count: number;
}

const BatchRejectDialog = ({
  open,
  onOpenChange,
  onConfirm,
  count,
}: BatchRejectDialogProps) => {
  const [remark, setRemark] = useState("");

  const handleConfirm = () => {
    onConfirm(remark);
    setRemark("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setRemark("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>批量确认打回</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="reject-remark">备注</Label>
            <textarea
              id="reject-remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              maxLength={200}
              placeholder="请输入打回备注"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {remark.length}/200
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchRejectDialog;
