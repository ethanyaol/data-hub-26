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
- [ ] [实施] 在 `types.ts` 中更新 `AgentRecoveryRecord` 和 `NonAgentRecoveryRecord` 的状态定义
- [ ] [实施] 在 `mockData.ts` 中更新任务回收模拟数据的状态值
- [ ] [实施] 更新 `TaskRecoveryAgent.tsx` 中的状态显示逻辑和筛选器
- [x] [实施] 在 `TaskRecoveryNonAgent.tsx` 中优化筛选区域布局及刷新功能 (保持整套回收页面一致性)
- [x] [验证] 运行类型检查及全量 UI 一致性检查

### 批量操作功能

- [ ] [实施] 在 `TaskPersonnelRecovery.tsx` 中增加多选状态管理及复选框交互
- [ ] [实施] 在 `TaskPersonnelRecovery.tsx` 详情页增加“批量修改任务信息”按钮组件
- [ ] [实施] 实现批量修改保存逻辑，并集成到 `EditTaskInfoDialog` 相关流程
- [ ] [测试] 验证批量修改任务信息功能路径及交互
- [ ] [实施] 在 `src/pages/tasks/TaskPersonnelRecovery.tsx` 中更新筛选区域布局及样式
- [ ] [实施] 更新 `TaskPersonnelRecovery.tsx` 表格样式，固定操作列
- [ ] [实施] 更新 `TaskPersonnelRecovery.tsx` 分页器功能（条数切换、跳转）
- [ ] [测试] 验证任务人员回收页 UI 平齐效果
- [x] [变更] 移除任务管理主列表中的“导出到数据集/云盘”操作逻辑
- [x] [实施] 创建通用 `ResetPasswordDialog.tsx` 组件，包含强度提示
- [x] [整合] 为移动端用户管理 (`MobileUserList.tsx`) 配置新密码重置弹窗
- [x] [整合] 为服务端用户管理 (`UserManagement.tsx`) 替换原有重置弹窗
- [x] [测试] 验证新重置流程及校验规则
- [x] [变更] 修改 `EditRecorderDialog.tsx` 使新建录音人时联系方式默认为空且非必填
- [x] [测试] 验证新建录音人流程中联系方式的可选性
