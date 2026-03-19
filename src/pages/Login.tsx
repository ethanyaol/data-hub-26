import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import loginBg from "@/assets/login-bg.jpg";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showChange, setShowChange] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("请输入用户名");
      return;
    }
    if (!password.trim()) {
      toast.error("请输入密码");
      return;
    }
    setLoading(true);
    // Mock login
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("auth_token", "mock_token");
      localStorage.setItem("auth_user", username);
      toast.success("登录成功");
      navigate("/dashboard/user-management");
    }, 800);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/40 to-transparent" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-8 py-5 flex items-center gap-3 z-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">D</span>
        </div>
        <span className="text-foreground font-semibold text-lg">端侧数据采集平台</span>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 flex items-center justify-between gap-16">
        {/* Left Info */}
        <div className="hidden lg:block flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-foreground">数据供给中心</h1>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-primary">⚙️</span>
              <span>面向大模型研发需求</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">📊</span>
              <span>汇聚多语言、多类型、多模态、多领域的高质量数据集</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">🔄</span>
              <span>构建"采-用-优"闭环大模型数据体系</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">🖥️</span>
              <span>建设面对大模型训练的数据汇聚、处理、管理、运营、供给的平台能力</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card w-full max-w-md animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-card-foreground tracking-wider">
              账 号 登 录
            </h2>
            <button
              onClick={() => toast.info("注册功能开发中")}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              注册
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="pl-10 h-12 bg-background border-border"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="pl-10 pr-10 h-12 bg-background border-border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-medium"
            >
              {loading ? "登录中..." : "登 录"}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                忘记密码？
              </button>
              <button
                type="button"
                onClick={() => setShowChange(true)}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                修改密码
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-sm text-muted-foreground">
        技术支持 - 端侧数据采集平台
      </div>

      <ResetPasswordDialog open={showReset} onOpenChange={setShowReset} />
      <ChangePasswordDialog open={showChange} onOpenChange={setShowChange} />
    </div>
  );
};

export default Login;
