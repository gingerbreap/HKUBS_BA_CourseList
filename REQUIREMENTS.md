# HKUBS MSc(BA) 选课规划网站 — 需求文档

## 一、产品概述
为 HKU Business School MSc(BA) 学生打造一个轻量级选课规划网站，部署于 GitHub Pages。支持中/英界面，数据源自 Programme Office Teaching Plan 与培养要求文件。

## 二、核心约束
- **模块制（Module）**：课程按 Module 1~5 组织，非传统 Semester 制。
- **特殊排课**：课程/教程可能出现非标准日期、晚间补课、周日课等。
- **GitHub Pages 部署**：纯静态前端，无后端/数据库。
- **数据维护**：手工维护结构化 JSON；Teaching Plan 变更时对照新旧 PDF 更新（见第七节与 `src/teachingPlan/README.md`）。
- **学年范围**：当前覆盖 2026-27 学年。

## 三、页面与功能

### 3.1 首页 — 模块时间表（Module Timetable）
- 按 Module 1~5 展示全部课程与可选班别（A/B/C…）。
- 每个班别显示时段标签：`AM`（上午）/ `PM`（下午）/ `NT`（晚间）。
- 特殊上课日期/教程独立时段需明确展示。
- Final Presentation 在时间表缩写为 **FINAL PRE**。
- 分阶段授课教授显示为 `Prof. A & Prof. B`（可在 `&` 处窄屏换行）。
- 点击课程卡片进入 `/course/:courseCode` 详情页。

### 3.2 规划页 — 我的选课（Planner）
- 可勾选课程班别，勾选单位粒度为：**课程 + 班别 + 教授**。
- **同一课号只能选一个班别**（含跨 Module 重复开课）：已选某课号后，其他班别不可选，需先移除再改选。
- 规划列表中**必须清楚显示教授姓名**。
- 实时冲突检查：
  - **硬冲突（Error）**：两个被选课堂在「具体日期 + 具体时间段」上重叠 → 报错/标红；可按严重程度区分（如 ≥3 次 Lecture 冲突）。
  - **Tutorial 重叠（Warning）**：tutorial 与 lecture / tutorial 重叠 → 仅警告，可折叠；支持「我知道了」持久关闭。
  - 不做「高强度负载」等软规则提示。
- 统计已选课程数量（Core / Elective / Capstone）与 Stream/List 完成度。
- **备选列表（购物车）**：可拖拽排序；「选择」尝试加入已选；「浏览 & 添加」可加入/移出备选；独立 `localStorage`，不参与冲突与日历/ICS。
- **课程详情弹窗**：已选列表与浏览区点击打开 popup（遮罩、≤90% 视口、Escape/点击遮罩关闭）。
- **Study Status 导入**：粘贴 CES Study Status，仅解析 `Registered` 记录并覆盖已选。
- **Teaching Plan 更新通知**（见 3.6）：选课页顶部展示带时间戳的变更对照表。

### 3.3 课程详情（Course Detail）
- 模块列表进独立页；规划页以弹窗呈现同一套内容。
- 同一门课详情可合并；**多教授用 Instructor tab** 切换并加载对应 outline PDF。
- 会议类型标签：`LEC` / `TUT`（中文界面亦不翻译为「讲座/教程」）。
- Tutorial 默认折叠；考试 / Final Presentation 作为独立行展示在 LEC 之后。
- 教授姓名大小写与 Teaching Plan 一致，**姓为全大写**。

### 3.4 培养要求页（Programme Requirements）
- 基于 Appendix C：5 Core + 5 Elective、AI/MC 与 List A/B/C/D。
- 基于 Appendix E：学习规划关键规则。

### 3.5 选课日历、假日与 ICS 导出
- 月历覆盖已选 **LEC、TUT、Final Exam、Final Presentation**。
- 日历标题：`MSBAXXXX LEC` / `TUT` / `Final Exam` / `Final Presentation`。
- **假日只出现在屏幕日历**（合并区间、农历标签、完整名称提示），**不写入 ICS**。
- ICS：无课时禁用导出并提示；支持按 Module / LEC·TUT 筛选；授课与期末考核可分模板；参数含 `@code`、`@class`、`@classchn`、`@module`、`@name`、`@type`、`@location`、`@prof` 等；教室写入 **LOCATION**。

### 3.6 Teaching Plan 更新通知
- 选课页顶部可叠多则通知；**新则默认展开，旧则默认折叠**，标题含同步时间戳与涉及课号。
- 对照表列：**课程 | 班 | 调整项 | 历史值 | 更新后**。
- **班**：讲座改动写 A/B/C/D；仅 Tutorial 改动写 **`TUT`**（TUT 不绑定讲座班，不按 A+B 重复行）；同课内 TUT 行沉底。
- **调整项**：不写 LEC/TUT 前缀；跨日用「日期 / 日期与教室」，同日钟点用「时间」；同日 LEC+TUT 不必在调整项写钟点。
- **历史值 / 更新后**：只显示变更字段；日期+教室同改时历史值不写原教室；历史值不显示 ⏰，更新后日期时间 ⏰、教室 📌。
- 用户已选某讲座班时，该班改动行浅黄高亮、班列加粗（`TUT` 行不高亮）。
- 「我知道了」按通知 id + 涉及课程版本持久关闭。
- 详细检查清单与 PDF 放置约定：`src/teachingPlan/README.md`。

## 四、明确排除项
- **不包含**官方 sample study plan。
- **不做** term capacity / credit cap 限制。
- **不做**先修/依赖关系求解器。
- **不做**学习计划自动生成。
- **不做**难度/作业量评价功能。

## 五、UI 与语言
- **UI 风格**：尽量复刻参考站布局与信息密度，并适配移动端（含 PDF 回退等）。
- **语言**：中/英切换（i18n）；课程名保留英文原文；LEC/TUT 等类型标签保持英文三字母（中文界面亦不译）。
- 页脚注明数据来源与**最后与 Programme Office 信息同步核查时间**。

## 六、技术方案
- 前端：React + Vite + TypeScript
- 路由：HashRouter（GitHub Pages）
- 状态：localStorage（已选、备选、通知关闭等）
- 分析：Google Analytics
- 部署：GitHub Actions → GitHub Pages（push `main`）

## 七、数据来源（单一事实来源）
| 内容 | 文件 |
|------|------|
| Teaching Plan PDF（按日期后缀归档） | `src/teachingPlan/MSc(BA) Teaching plan 2026-27_YYYYMMDD.pdf` |
| Teaching Plan 改动检查清单 | `src/teachingPlan/README.md` |
| 结构化课表 | `public/courses.json` |
| 培养要求/方向 | `public/requirements.json`（源自 Appendix C 等） |
| 学习规划 FAQ 原文 | `src/Appendix E_Course Enrolment and Study Planning FAQs.pdf`（如有） |
| 课程大纲 PDF | `public/courseOutline/`（及 `src/courseOutline/` 源） |
| 更新通知数据 | `src/data/teachingPlanUpdates.ts` |

同步流程摘要：将新 PDF 放入 `src/teachingPlan/` → 对照旧版与新版**标红**（含 Tutorial 列，勿只信邮件正文）→ 更新 `courses.json` 与通知表 → 更新 i18n 时间戳 → commit / push。

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
- 按 `meetings[]` 的「具体日期 + 时间段重叠」判断。
- lecture vs lecture 重叠 → Error（硬冲突）。
- tutorial vs lecture / tutorial vs tutorial → Warning。
- 星期条与假日不参与冲突计算。

## 十、验收标准
1. 用户可按 Module 浏览课程并区分 AM/PM/NT。
2. 课程可进入详情页 / 规划弹窗并查看对应 outline PDF。
3. 规划页可选择课程并清楚看到教授；同一课号不能重复入计划。
4. 硬冲突能被检测并报错；tutorial 重叠只给 warning。
5. 培养要求与学习规划关键规则有独立页面。
6. 已选 LEC/TUT/考试/Presentation 出现在屏幕日历；ICS 不含假日且格式符合 3.5。
7. Teaching Plan 变更后通知表符合 3.6；PDF 归档于 `src/teachingPlan/`。
8. 教授姓名姓为全大写；中/英界面可用。
9. 全站可在 GitHub Pages 正常访问，移动端可基本使用。
