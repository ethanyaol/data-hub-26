import { useState } from "react";
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
}

const PAGE_SIZE = 10;

const PersonnelAssignDialog = ({
  open,
  onOpenChange,
  onConfirm,
  requiredCount,
}: PersonnelAssignDialogProps) => {
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredList = mockPersonnelList.filter((p) => {
    if (!appliedSearch) return true;
    return (
      p.name.includes(appliedSearch) || p.phone.includes(appliedSearch)
    );
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
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = pagedList.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleConfirm = () => {
    if (requiredCount !== undefined && selectedIds.length !== requiredCount) {
      return;
    }
    onConfirm(selectedIds);
    onOpenChange(false);
  };

  const isConfirmDisabled =
    requiredCount !== undefined && selectedIds.length !== requiredCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>分配人员</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索姓名/手机号"
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
                  <th>标题</th>
                  <th>id</th>
                  <th>姓名</th>
                  <th>标题</th>
                  <th>注册手机号</th>
                </tr>
              </thead>
              <tbody>
                {pagedList.map((person) => (
                  <tr key={person.id}>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(person.id)}
                        onChange={() => toggleSelect(person.id)}
                      />
                    </td>
                    <td>{person.title}</td>
                    <td>{person.id}</td>
                    <td>{person.name}</td>
                    <td>{person.title}</td>
                    <td>{person.phone}</td>
                  </tr>
                ))}
                {pagedList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted-foreground">
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
