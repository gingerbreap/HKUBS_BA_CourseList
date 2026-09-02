# HKUBS MSc(BA) 选课规划网站 — 需求文档

## 一、产品概述
为 HKU Business School MSc(BA) 学生打造一个轻量级中文选课规划网站，部署于 GitHub Pages。

## 二、核心约束
- **模块制（Module）**：课程按 Module 1~5 组织，非传统 Semester 制。
- **特殊排课**：课程/教程可能出现非标准日期、晚间补课、周日课等。
- **GitHub Pages 部署**：纯静态前端，无后端/数据库。
- **数据维护**：手工维护结构化 JSON（一次性从教学计划 PDF 转换，后续手动更新）。
- **学年范围**：MVP 只覆盖 2026-27 学年。

## 三、页面与功能

### 3.1 首页 — 模块时间表（Module Timetable）
- 按 Module 1~5 展示全部课程与可选班别（A/B/C…）。
- 每个班别显示时段标签：`AM`（上午）/ `PM`（下午）/ `NT`（晚间）。
- 特殊上课日期/教程独立时段需明确展示。
- 点击课程卡片进入 `/course/:courseCode` 详情页。

### 3.2 规划页 — 我的选课（Planner）
- 可勾选课程班别，勾选单位粒度为：**课程 + 班别 + 教授**。
- **同一课号只能选一个班别**（含跨 Module 重复开课，如 MSBA7013 / MSBA7025）：已选某课号后，其他班别显示为不可选，需先移除再改选。
- 规划列表中**必须清楚显示教授姓名**（用户决策关键信息）。
- 实时冲突检查：
  - **硬冲突（Error）**：两个被选课堂在"具体日期 + 具体时间段"上重叠 → 报错/标红。
  - **Tutorial 重叠（Warning）**：tutorial 与其他 lecture 时间重叠 → 仅警告，不阻止选择。
  - 不做"高强度负载"等软规则提示。
- 统计已选课程数量（Core / Elective / Capstone）与 Stream/List 完成度。
- **备选列表（购物车）**：
  - 在「已选课程」下方展示「备选列表」，可拖动手柄排序。
  - 备选项旁提供「选择」按钮：尝试加入正式已选；成功后从备选移除；若课号已在规划中则提示并保留在备选。
  - 「浏览 & 添加」中每个班别在「选择」旁提供「加入备选」；已在备选中显示「已备选 ✓」，可再次点击移除。
  - 备选列表独立持久化于 `localStorage`，不参与冲突检查与日历/ICS。
- **课程详情弹窗**：在「已选课程」列表项，以及「浏览 & 添加」的课程标题 / 班别行上，点击打开课程详情 **popup overlay**（不是整页跳转）。
  - 深色遮罩覆盖原页面
  - 弹窗内容复用课程详情页（班别、LEC/TUT、大纲 PDF 等）
  - 弹窗宽、高均不超过视口的 90%
  - 右上角关闭 X；点击 X 或遮罩任意位置关闭；支持 Escape；打开时锁定背景滚动
- 模块时间表点击课程仍走 `/course/:courseCode` 路由。

### 3.3 课程详情（Course Detail）
- 从模块列表中点击课程进入独立页面；规划页则以弹窗呈现同一套内容。
- 同一门课的详情**允许合并为一个页面**（不强制按"课程-班别-教授"拆分）。
- **多教授课程用 Instructor tab 切换**（例如 MSBA7003：Prof. Wei ZHANG 教 A/B，Prof. Xing HU 教 C/D；切换 tab 时加载该教授对应的 outline PDF）。
- 页面内容：
  - 课程代码 + 课程名（保留英文原文）
  - Module
  - 各班别/教授列表及对应时段（AM/PM/NT）与具体日期
  - 会议类型使用英文标签：`LEC` / `TUT`
  - Tutorial 默认折叠，点击 `TUT (N sessions) (Show/Hide)` 展开
  - 考试 / Final Presentation 的日期、时间、地点（如有）
  - 内嵌课程大纲 PDF viewer（iframe/object 静态嵌入）
- PDF 来源：`src/courseOutline/` 目录下对应文件。
- **教授姓名大小写**与 Appendix A 教学计划一致，**姓为全大写**（如 `Prof. Chao DING`）。

### 3.4 培养要求页（Programme Requirements）
- 基于 Appendix C 展示：5 Core + 5 Elective、AI/MC 两大方向与 List A/B/C/D 最低要求。
- 基于 Appendix E 展示学习规划关键规则（如每模块建议约 2 门、M1-3 至少 4 门等）。

### 3.5 选课日历与 ICS 导出
- 规划页展示月历，覆盖已选课程的 **LEC、TUT、Final Exam、Final Presentation**（有日期才入历；有时间则显示时间）。
- 日历标题：
  - 讲座 → `MSBAXXXX LEC`
  - 教程 → `MSBAXXXX TUT`
  - 期末考 → `MSBAXXXX Final Exam`
  - Final Presentation → `MSBAXXXX Final Presentation`
- **假日只出现在屏幕日历上**，不写入 ICS。
- **ICS 不含假日**。课程相关事件 SUMMARY / DESCRIPTION 支持用户自定义模板（弹窗「自定义导出课程事件格式」），可用参数：`@code`、`@class`、`@name`、`@type`、`@location`、`@prof`、`@Prof`；默认 Summary 为 `@code (@type): @name @ @location`，Description 为多行模板；底部实时 Preview；教室始终写入 ICS **LOCATION** 字段。
- 星期条（weekday strip）仅为**信息展示**，不参与冲突计算。

## 四、明确排除项
- **不包含**官方 sample study plan。
- **不做** term capacity / credit cap 限制。
- **不做**先修/依赖关系求解器。
- **不做**学习计划自动生成。
- **不做**难度/作业量评价功能。

## 五、UI 与语言
- **UI 风格**：尽量复刻参考站（https://hku-ecic-course-guide.lux-peng-lab.chatgpt.site/）的布局、信息密度、配色、卡片样式与移动端适配。
- **语言**：全中文为主，课程名保留英文原文；LEC/TUT 等课表类型标签使用英文。

## 六、技术方案
- 前端：React + Vite
- 路由：react-router（课程详情页基于 courseCode；规划页详情为弹窗）
- 状态持久化：localStorage 保存"我的选课"
- PDF viewer：原生 iframe/object
- 部署：GitHub Actions → GitHub Pages

## 七、数据来源（单一事实来源）
| 内容 | 文件 |
|------|------|
| 教学计划/模块日期/课程排课 | `src/Appendix A_MSc(BA) Teaching plan 2026-27 (20260811).pdf` |
| 培养要求/方向/课程分类 | `src/Appendix C_MSc(BA) Curriculum Requirements for Concentrations.pdf` |
| 学习规划 FAQ | `src/Appendix E_Course Enrolment and Study Planning FAQs.pdf` |
| 课程大纲 PDF | `src/courseOutline/` 目录 |

## 八、数据模型（courses.json 核心字段）
```
courseCode, courseTitle
module (1~5)
courseType (Core / Elective / Capstone)
streamTags (AI-M, AI-A, MC-AM, MC-DE)
sections[]:
  sectionId (A/B/C…)
  instructors[]: { name, note? }   // name 姓全大写，如 Prof. Chao DING
  timeBucket (AM/PM/NT)
  dayPattern, meetingDays[]        // 星期条展示用，不参与冲突
  meetings[]:
    date, startTime, endTime, venue
    sessionType (lecture / tutorial)
    instructors[]?                 // 仅当该次课由特定教授讲授
  examOrFinal?                     // 班别级考试（如 MSBA7025 B/C 时段不同）
outlinePdfPath
examOrFinal:                       // 课程级考试/期末；无则 null
  kind (exam / presentation / midterm / other)
  date, startTime, endTime, venue  // 可空（如仅 "Mid-term Examination"）
  raw                              // 展示用原文
```

## 九、冲突检查逻辑
- 按 `meetings[]` 的"具体日期 + 时间段重叠"判断。
- lecture vs lecture 重叠 → Error（硬冲突）。
- tutorial vs lecture 重叠 → Warning（仅提示）。
- tutorial vs tutorial 重叠 → Warning（仅提示）。
- 星期条与假日不参与冲突计算。

## 十、验收标准
1. 用户可按 Module 浏览课程并区分 AM/PM/NT。
2. 课程可点击进入详情页并查看对应 outline PDF；规划页以弹窗打开同一套详情。
3. 规划页可选择课程并清楚看到教授信息；同一课号不能重复入计划。
4. 硬冲突能被检测并报错；tutorial 重叠只给 warning。
5. 培养要求与学习规划关键规则有独立页面展示。
6. 已选课程的 LEC/TUT/考试/Presentation 出现在屏幕日历；ICS 导出含上述课程事件、不含假日，SUMMARY/DESCRIPTION 格式符合 3.5。
7. 教授姓名姓为全大写，与教学计划一致。
8. 全站可在 GitHub Pages 正常访问，移动端可基本使用。
