import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface RoleItem {
  id: string;
  name: string;
  description: string;
}

const availableRoles: RoleItem[] = [
  { id: "r1", name: "UAP管理员", description: "具备平台完整的菜单权限" },
  { id: "r2", name: "运营管理员", description: "具备平台完整的菜单权限" },
  { id: "r3", name: "运维管理员", description: "具备平台完整的菜单权限" },
  { id: "r4", name: "端侧任务管理员", description: "按权限表配置（拥有任务及录音相关权限，无服务端/移动端用户管理权限）" },
  { id: "r5", name: "端侧质检员", description: "按权限表配置（主要具备任务回收查看、音频详情确认打包等权限）" },
];

const assignedRolesInit: RoleItem[] = [];

const CreateUser = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [loginName, setLoginName] = useState("");
  const [realName, setRealName] = useState("");
  const [userType, setUserType] = useState<"internal" | "external">("internal");
  const [status, setStatus] = useState<"enabled" | "disabled">("enabled");
  const [tenant, setTenant] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");

  // Step 2 fields
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<RoleItem[]>(assignedRolesInit);
  const [availableSearch, setAvailableSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");

  const handleNext = () => {
    if (!loginName.trim()) { toast.error("请输入登录名称"); return; }
    if (!realName.trim()) { toast.error("请输入用户姓名"); return; }
    if (!tenant) { toast.error("请选择所属租户"); return; }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("请输入正确的邮箱格式");
      return;
    }

    setStep(2);
  };

  const handleAddRoles = () => {
    const toAdd = availableRoles.filter((r) => selectedAvailable.includes(r.id) && !assignedRoles.find((a) => a.id === r.id));
    setAssignedRoles([...assignedRoles, ...toAdd]);
    setSelectedAvailable([]);
  };

  const handleRemoveRoles = () => {
    setAssignedRoles(assignedRoles.filter((r) => !selectedAssigned.includes(r.id)));
    setSelectedAssigned([]);
  };

  const handleFinish = () => {
    toast.success("用户创建成功");
    navigate("/dashboard/user-management");
  };

  const filteredAvailable = availableRoles.filter(
    (r) => !assignedRoles.find((a) => a.id === r.id) &&
      (!availableSearch || r.name.includes(availableSearch) || r.description.includes(availableSearch))
  );

  const filteredAssigned = assignedRoles.filter(
    (r) => !assignedSearch || r.name.includes(assignedSearch) || r.description.includes(assignedSearch)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate("/dashboard/user-management")} className="text-primary hover:text-primary/80">
          用户管理
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">新建用户</span>
      </div>
      <p className="text-sm text-muted-foreground">
        用户管理模块可进行用户管理，在这里可进行用户状态的查看。
      </p>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 py-6">
        <div className="flex items-center gap-2">
          <div className={`step-indicator ${step > 1 ? "completed" : "active"}`}>
            {step > 1 ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <span className={`text-sm font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
            用户信息
          </span>
        </div>
        <div className="w-32 h-px bg-border" />
        <div className="flex items-center gap-2">
          <div className={`step-indicator ${step === 2 ? "active" : "inactive"}`}>2</div>
          <span className={`text-sm font-medium ${step === 2 ? "text-foreground" : "text-muted-foreground"}`}>
            角色分配
          </span>
        </div>
      </div>

      {/* Step 1: User Info */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div className="grid grid-cols-2 gap-x-12 gap-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <span className="text-destructive">*</span> 登录名称:
              </Label>
              <Input
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="请输入登录名称，由数字/字母/下划线/中划线/英文句/@符号组成"
              />
            </div>
            <div className="space-y-2">
              <Label>用户类型:</Label>
              <div className="flex items-center gap-4 h-10">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={userType === "internal"} onChange={() => setUserType("internal")} className="accent-primary" />
                  <span className="text-sm">移动内部</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={userType === "external"} onChange={() => setUserType("external")} className="accent-primary" />
                  <span className="text-sm">移动外部</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <span className="text-destructive">*</span> 用户姓名:
              </Label>
              <Input value={realName} onChange={(e) => setRealName(e.target.value)} placeholder="请输入用户名称" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <span className="text-destructive">*</span> 用户状态:
              </Label>
              <div className="flex items-center gap-4 h-10">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={status === "enabled"} onChange={() => setStatus("enabled")} className="accent-primary" />
                  <span className="text-sm">启用</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={status === "disabled"} onChange={() => setStatus("disabled")} className="accent-primary" />
                  <span className="text-sm">停用</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <span className="text-destructive">*</span> 所属租户:
              </Label>
              <Select value={tenant} onValueChange={setTenant}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">AI机构</SelectItem>
                  <SelectItem value="test">test租户</SelectItem>
                  <SelectItem value="optimize">测试角色优化机构1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>所属公司:</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>邮箱:</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入邮箱" />
          </div>
          <div className="space-y-2">
            <Label>地址:</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="请输入地址" />
          </div>
          <div className="space-y-2">
            <Label>备注:</Label>
            <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="请输入备注信息" rows={4} />
          </div>
        </div>
      )}

      {/* Step 2: Role Assignment */}
      {step === 2 && (
        <div className="flex gap-4 items-start">
          {/* Available roles */}
          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
            <div className="px-4 py-3 border-b border-border font-medium text-sm">
              可分配的角色
            </div>
            <div className="px-4 py-2 border-b border-border">
              <Input
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                placeholder="请输入角色名称、角色描述"
                className="h-8 text-sm"
              />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="w-10 px-3 py-2"><Checkbox /></th>
                  <th className="text-left px-3 py-2 font-medium">角色名称</th>
                  <th className="text-left px-3 py-2 font-medium">角色描述</th>
                </tr>
              </thead>
              <tbody>
                {filteredAvailable.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selectedAvailable.includes(r.id)}
                        onCheckedChange={(checked) => {
                          setSelectedAvailable(
                            checked
                              ? [...selectedAvailable, r.id]
                              : selectedAvailable.filter((id) => id !== r.id)
                          );
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transfer buttons */}
          <div className="flex flex-col gap-2 pt-32">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRoles}
              disabled={selectedAvailable.length === 0}
            >
              添加 &gt;
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveRoles}
              disabled={selectedAssigned.length === 0}
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              &lt; 移除
            </Button>
          </div>

          {/* Assigned roles */}
          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
            <div className="px-4 py-3 border-b border-border font-medium text-sm">
              已分配 {assignedRoles.length} 个角色
            </div>
            <div className="px-4 py-2 border-b border-border">
              <Input
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                placeholder="请输入角色名称、角色描述"
                className="h-8 text-sm"
              />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="w-10 px-3 py-2"><Checkbox /></th>
                  <th className="text-left px-3 py-2 font-medium">角色名称</th>
                  <th className="text-left px-3 py-2 font-medium">角色描述</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssigned.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selectedAssigned.includes(r.id)}
                        onCheckedChange={(checked) => {
                          setSelectedAssigned(
                            checked
                              ? [...selectedAssigned, r.id]
                              : selectedAssigned.filter((id) => id !== r.id)
                          );
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[200px]">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {step === 2 && (
          <Button variant="outline" onClick={() => setStep(1)}>上一步</Button>
        )}
        {step === 1 && (
          <>
            <Button variant="outline" onClick={() => {
              setLoginName(""); setRealName(""); setTenant(""); setEmail("");
              setAddress(""); setRemark(""); setCompany("");
            }}>
              重置
            </Button>
            <Button onClick={handleNext}>下一步</Button>
          </>
        )}
        {step === 2 && (
          <Button onClick={handleFinish}>完成</Button>
        )}
      </div>
    </div>
  );
};

export default CreateUser;
