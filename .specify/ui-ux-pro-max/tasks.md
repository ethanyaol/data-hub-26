# 任务：升级概览筛选器

- [x] [实施] 在 `src/components/MultiSelectFuzzySearch.tsx` 中创建 `MultiSelectFuzzySearch` 组件
- [x] [实施] 更新 `Overview.tsx` 以在列表视图任务筛选中使用新组件
- [x] [实施] 在 `Overview.tsx` 中添加“重置”按钮和相应逻辑
- [x] [实施] 更新 `TaskList.tsx` 筛选区布局和多选搜索（ID/名称模糊匹配）
- [x] [测试] 运行 `TaskListSearch.test.tsx` 和 `OverviewFilter.test.tsx`
- [x] [审查] 运行 `/review` 工作流并修复发现的问题
- [x] [变更] 精简 `TaskList.tsx` 筛选栏，移除“任务名称”和“任务标签”字段
- [x] [实施] 创建可清除单选组件 `ClearableSelect.tsx`
- [x] [变更] 在 `TaskList.tsx` 中应用 `ClearableSelect` 到录制类型和任务用途
- [x] [测试] 运行 `ClearableSelect.test.tsx` 验证清除功能
- [x] [实施] 在 `RecorderManagement.tsx` 中增加年龄筛选输入限制及校验逻辑 (>= 14)
- [x] [测试] 运行 `RecorderAgeFilter.test.tsx` 验证校验逻辑
- [x] [实施] 在 `TaskList.tsx` 中增加“任务类型”列，默认值为“音频”
- [x] [背景] 统一“任务类型”列样式，采用与“录制类型”一致的蓝色徽章样式
- [x] [重构] 将“新建任务”页面重构为四阶段分步表单，增加实时预览及校验功能
