import { Database, CloudUpload, BookOpen, ChevronRight } from "lucide-react";

const features = [
  {
    title: "多模态数据采集",
    description:
      "提供文本、语音、图像、视频等多模态数据规模化采集需求支持。",
    icon: Database,
    gradient: "from-blue-50 via-blue-50/50 to-transparent",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  }
];

const updates = [
  {
    tag: "新增功能",
    text: "新增音频类数据采集功能",
    date: "07-30",
  },
  { tag: "新增功能", text: "新增移动端和服务端用户管理功能", date: "06-30" },
  { tag: "体验升级", text: "新增采集任务数据统计服务", date: "06-30" },
  { tag: "体验升级", text: "数据集分享支持精确搜索", date: "06-30" },
  {
    tag: "体验升级",
    text: "新增多模态数据预览功能（支持图片、文本、音频、视频等类型预览）",
    date: "05-28",
  },
];

const DashboardHome = () => {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-white to-blue-50/30 px-8 pt-8 pb-6">
        {/* Decorative blob top-right */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-100/60 via-purple-100/40 to-pink-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-8 right-16 w-32 h-32 bg-gradient-to-br from-cyan-200/40 to-blue-200/40 rounded-full blur-2xl pointer-events-none" />

        <h1 className="text-2xl font-bold text-foreground relative z-10">
          Hi! 欢迎来到数据汇聚中心
        </h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-3xl leading-relaxed relative z-10">
          数据汇聚中心围绕端侧采集、服务端任务管理、质检运营、异构数据接入四大能力持续建设，构建任务规划 — 采集执行 — 质检验收 — 数据汇聚的全链路闭环管理体系，为后续数据生产持续提供高纯度、可溯源、高质量的原始数据支撑。
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`relative overflow-hidden rounded-xl border border-border bg-gradient-to-r ${feature.gradient} p-6 hover:shadow-md transition-shadow cursor-pointer group`}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <div
                className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center shrink-0`}
              >
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Product updates section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">产品动态</h2>
        <div className="grid grid-cols-5 gap-6">
          {/* Left: Operation manual card */}
          <div className="col-span-3 relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-100/80 via-blue-50/60 to-purple-50/40 p-8 flex flex-col justify-center min-h-[180px]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2393c5fd%22%20stop-opacity%3D%22.15%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23c4b5fd%22%20stop-opacity%3D%22.1%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23a)%22%20width%3D%22200%22%20height%3D%22200%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
            <h3 className="text-xl font-bold text-foreground relative z-10">
              操作手册
            </h3>
            <p className="text-sm text-muted-foreground mt-2 relative z-10">
              可帮助用户快速掌握平台功能、解决操作问题的实用指南。
            </p>
            <button className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium border border-primary/30 rounded-full px-4 py-1.5 hover:bg-primary/5 transition-colors w-fit relative z-10">
              立即查看
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right: Product update list */}
          <div className="col-span-2 bg-card rounded-xl border border-border p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">
              产品更新
            </h3>
            <div className="space-y-3">
              {updates.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border border-orange-200 text-orange-500 bg-orange-50">
                    {item.tag}
                  </span>
                  <span className="flex-1 text-muted-foreground truncate">
                    {item.text}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground/60">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
