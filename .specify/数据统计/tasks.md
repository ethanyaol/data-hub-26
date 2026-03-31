# 开发任务：升级数据统计页任务筛选

## 初始化
- [x] [背景] 调研 `Overview.tsx` 现有下拉框实现与 `MultiSelectFuzzySearch` 兼容性
- [x] [背景] 明确“空选即全选”的技术处理方案

## 功能开发 — 可视化视图
- [x] [重构] 在 `Overview.tsx` 中将 `selectedTask` 状态重构为 `selectedTasks` (string[])
- [x] [部件] 在“任务采集概览”模块中引入 `MultiSelectFuzzySearch` 替换原有的 `<select>`
- [x] [逻辑] 修改 `barData` 的生成逻辑，使其支持基于 `selectedTasks` 数组及其长度进行过滤/汇总
- [x] [验证] 确认当 `selectedTasks` 为空时，图表展示聚合后的汇总数值

## 功能验证
- [x] [测试] 手动验证多选后的图表更新正确性
- [x] [测试] 验证模糊搜索名称和 ID 的功能
- [x] [验证] 确保与已有的列表视图筛选逻辑不产生冲突
