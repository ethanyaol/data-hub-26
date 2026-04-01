import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockPersonnelList } from "@/pages/tasks/mockData";
import type { PersonnelAssignRecord } from "@/pages/tasks/types";

interface PersonnelAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedIds: string[]) => void;
  requiredCount?: number;
  maxCount?: number;
  initialSelectedIds?: string[];
  lockedIds?: string[];
}

const PAGE_SIZE = 10;

const PersonnelAssignDialog = ({
  open,
  onOpenChange,
  onConfirm,
  requiredCount,
  maxCount,
  initialSelectedIds = [],
  lockedIds = [],
}: PersonnelAssignDialogProps) => {
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync selectedIds when dialog opens or initialSelectedIds changes
  useEffect(() => {
    if (open) {
      setSelectedIds(initialSelectedIds);
    }
  }, [open, initialSelectedIds]);

  const filteredList = mockPersonnelList
    .filter((p) => {
      if (!appliedSearch) return true;
      return (
        p.name.includes(appliedSearch) || p.phone.includes(appliedSearch)
      );
    })
    .sort((a, b) => {
      // 只有在没有进行主动搜索时才进行已选置顶排序，或者始终置顶？
      // 根据用户要求：再次点击时，已选择人员排在前列。
      const aSelected = selectedIds.includes(a.id);
      const bSelected = selectedIds.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const pagedList = filteredList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = () => {
    setAppliedSearch(searchText);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchText("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const toggleSelect = (id: string) => {
    if (lockedIds.includes(id)) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = pagedList.map((p) => p.id);
    const nonLockedPageIds = pageIds.filter(id => !lockedIds.includes(id));
    const allNonLockedSelected = nonLockedPageIds.every((id) => selectedIds.includes(id));
    
    if (allNonLockedSelected) {
      // Uncheck only non-locked IDs on the current page
      setSelectedIds((prev) => prev.filter((id) => !nonLockedPageIds.includes(id)));
    } else {
      // Check all non-locked IDs on the current page
      setSelectedIds((prev) => [...new Set([...prev, ...nonLockedPageIds])]);
    }
  };

  const handleConfirm = () => {
    if (requiredCount !== undefined && selectedIds.length !== requiredCount) {
      toast.error(`请选择正好 ${requiredCount} 人 (当前已选 ${selectedIds.length} 人)`);
      return;
    }
    if (maxCount !== undefined) {
      if (selectedIds.length === 0) {
        toast.error("请至少选择 1 位人员");
        return;
      }
      if (selectedIds.length > maxCount) {
        toast.error(`已选人数 (${selectedIds.length}) 不能超过预估份数 (${maxCount})`);
        return;
      }
    }
    onConfirm(selectedIds);
    onOpenChange(false);
  };

  const isConfirmDisabled =
    (requiredCount !== undefined && selectedIds.length !== requiredCount) ||
    (maxCount !== undefined && (selectedIds.length === 0 || selectedIds.length > maxCount));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>分配发音人</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索昵称/联系方式"
              className="max-w-[240px]"
            />
            <Button variant="outline" size="sm" onClick={handleReset}>
              重置
            </Button>
            <Button size="sm" onClick={handleSearch}>
              查询
            </Button>
          </div>

          {/* Selection info */}
          <div className="text-sm text-muted-foreground">
            {requiredCount !== undefined ? (
              <span>
                应选择{requiredCount}人 实际选择：
                <span
                  className={
                    selectedIds.length !== requiredCount
                      ? "text-destructive font-medium"
                      : "text-primary font-medium"
                  }
                >
                  {selectedIds.length}人
                </span>
              </span>
            ) : maxCount !== undefined ? (
              <span>
                最多选择{maxCount}人 实际选择：
                <span
                  className={
                    selectedIds.length > maxCount || selectedIds.length === 0
                      ? "text-destructive font-medium"
                      : "text-primary font-medium"
                  }
                >
                  {selectedIds.length}人
                </span>
              </span>
            ) : (
              <span>已选择：{selectedIds.length}人</span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[400px]">
            <table className="admin-table w-full text-sm">
              <thead>
                <tr>
                  <th className="w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        pagedList.length > 0 &&
                        pagedList.every((p) => selectedIds.includes(p.id))
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>发音人ID</th>
                  <th>昵称</th>
                  <th>联系方式</th>
                </tr>
              </thead>
              <tbody>
                {pagedList.map((person) => (
                   <tr key={person.id} className={lockedIds.includes(person.id) ? "opacity-70 bg-slate-50/50" : ""}>
                     <td className="text-center">
                       <input
                         type="checkbox"
                         disabled={lockedIds.includes(person.id)}
                         checked={selectedIds.includes(person.id)}
                         onChange={() => toggleSelect(person.id)}
                         className={lockedIds.includes(person.id) ? "cursor-not-allowed" : "cursor-pointer"}
                       />
                     </td>
                    <td>{person.id}</td>
                    <td>{person.name}</td>
                    <td>{person.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}</td>
                  </tr>
                ))}
                {pagedList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted-foreground">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              上一页
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirmDisabled}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonnelAssignDialog;
