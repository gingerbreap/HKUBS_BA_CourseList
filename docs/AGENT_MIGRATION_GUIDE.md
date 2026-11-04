# Agent 迁移指南：基于本站 fork 新专业选课助手

> **读者**：负责「复制本仓库结构 → 换专业数据与品牌 → 上线」的 Agent / 维护者。  
> **源站**：港大经管 `MSc(BA)` 选课助手（本仓库）。  
> **已存在的同类 fork 参考**：`HKUBS_MGM_CourseList`（Master of Global Management）。  
> **目标**：沿用大部分 UI、冲突/日历/Teaching Plan/PWA/导入导出架构，只替换专业身份与课表数据。

本文件是**迁移总览**。Teaching Plan 日常同步细节仍以 [`src/teachingPlan/README.md`](../src/teachingPlan/README.md) 为准；产品验收以 [`REQUIREMENTS.md`](../REQUIREMENTS.md) 为准。

---

## 0. 30 秒心智模型

这是一个 **纯静态 React + Vite + TypeScript** 站点，部署在 **GitHub Pages**（`HashRouter`）。

| 层 | 内容 |
|----|------|
| **事实数据** | `public/courses.json`（课表）、`public/requirements.json`（培养要求）、`public/courseOutline/**`（PDF） |
| **Teaching Plan 变更叙事** | `src/data/teachingPlanUpdates.ts` + 三语 i18n body + `src/teachingPlan/*.pdf` 归档 |
| **用户状态** | `localStorage`（已选 / 备选 / 语言 / 已读通知 / PWA 等），前缀当前为 `msba-*` |
| **品牌与部署身份** | `vite.config.ts` 的 `base`、manifest、logo、关于页文案、`PLANNER_PROGRAMME` |

迁移时：**代码骨架尽量原样拷贝**；**必须成套替换「身份 + 数据 + storage 前缀」**，避免与 BA 站在同一浏览器互相污染。

---

## 1. 推荐迁移路径

### 1.1 新仓库（推荐）

1. 从本仓库创建新 GitHub repo（或 `git clone` 后改 remote）。
2. 清空本专业 Teaching Plan 历史通知与 PDF（或保留空骨架），替换 `courses.json` / `requirements.json` / outlines。
3. 按第 3 节「身份清单」全局替换品牌与 `base`。
4. 启用 GitHub Pages（与 [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) 相同：`push main` → `npm ci` → `npm run build` → deploy `dist`）。
5. `npm run build`（内部是 `tsc -b && vite build`）必须本地/CI 全绿再宣称完成。

### 1.2 同 monorepo 多专业（可选，更重）

若要把多专业放进同一构建（例如 `public/msba/` + `public/mgm/` + `VITE_PROGRAMME=`），需要额外抽象数据路径与 storage 前缀。  
**默认不要走这条**，除非产品明确要求单仓多专业；fork 独立仓库心智负担更小。

---

## 2. 目录与职责地图

```
.
├── public/
│   ├── courses.json          # 课表事实（LEC/TUT/exam）
│   ├── requirements.json     # Core / Capstone / Stream lists
│   ├── courseOutline/        # 大纲 PDF（路径写入 courses.json）
│   ├── site*.webmanifest     # PWA 多语言 manifest
│   └── logo / favicon …
├── src/
│   ├── App.tsx               # 路由 + 顶栏 + 移动底栏
│   ├── types.ts              # Course / Section / Meeting / Requirements
│   ├── pages/                # Planner, Calendar, Timetable, About, …
│   ├── components/           # 日历、通知、冲突、ICS、PWA banner…
│   ├── hooks/                # selections, wishlist, coursesData, PWA…
│   ├── data/
│   │   ├── teachingPlanUpdates.ts  # 通知表数据（newest first）
│   │   └── holidays.ts
│   ├── teachingPlan/         # PDF 归档 + README 同步清单
│   ├── i18n/locales/         # zh-CN / zh-HK / en
│   └── utils/                # conflicts, calendar, export, dismiss, PWA…
├── docs/
│   └── AGENT_MIGRATION_GUIDE.md  # 本文件
├── REQUIREMENTS.md
├── vite.config.ts            # base、版本注入、PWA workbox
└── .github/workflows/deploy.yml
```

### 2.1 路由（HashRouter）

| Path | 页面 |
|------|------|
| `/` | 重定向到默认落地页（planner / calendar） |
| `/planner` | 我的选课（含 TP 通知 + 内嵌日历改动层） |
| `/calendar` | 我的日历（最新事实；底部未读提醒） |
| `/courselist` | 模块时间表 |
| `/course/:courseCode` | 课程详情 |
| `/requirements` | 培养要求 |
| `/about` | 关于 / 版本 / 菜单入口 |
| `/about/import-export` 等 | 导入导出、默认页、PWA 设置 |
| `/archive/teaching-plan` | Teaching Plan 更新存档 |

---

## 3. 身份替换清单（fork 必做）

按表逐项改；漏改会导致错站数据、错备份、或 Pages 404。

| # | 位置 | 当前 BA 值 / 模式 | 新站应改为 |
|---|------|-------------------|------------|
| 1 | `vite.config.ts` → `base` | `'/HKUBS_BA_CourseList/'` | `'/你的Repo名/'`（与 GitHub Pages 项目路径一致） |
| 2 | `vite.config.ts` → `APP_VERSION_BASE` | `1.5.6` | 新站从 `1.0.0` 或合理起点开始 |
| 3 | `vite.config.ts` → 默认 `repoUrl` fallback | BA GitHub URL | 新仓库 URL |
| 4 | `src/utils/userDataTransfer.ts` → `PLANNER_PROGRAMME` | `'MSc(BA)'` | 新专业稳定 id，如 `'MSc(MGM)'`（导入校验用） |
| 5 | `src/utils/appIdentity.ts` | `TPG Planner` / HKUBS TPG… | 新短名 / 长名（三语） |
| 6 | `public/site*.webmanifest` | name / short_name / start_url | 与新品牌、`base` 一致 |
| 7 | `index.html` title / meta | BA 文案 | 新文案 |
| 8 | `README.md` / `REQUIREMENTS.md` | BA 描述 | 重写专业名、链接、培养规则 |
| 9 | **所有** `localStorage` 键前缀 `msba-` | 见下表 | 换成新前缀（如 `mgm-`），且 `pwaStorage` 清理逻辑同步改前缀 |
| 10 | 导出文件名 | `msba-planner-backup-YYYYMMDD.json` | 新前缀 |
| 11 | i18n 品牌/免责声明/关于页 | BA Programme Office 表述 | 新专业表述 |
| 12 | Analytics（若有） | `src/utils/analytics.ts` | 换测量 ID 或关闭 |
| 13 | 页脚 credit | 可保留作者，但勿写错专业 | 核对 |

### 3.1 localStorage 键（当前 BA）

迁移时建议全局搜索 `msba-`：

| Key | 用途 |
|-----|------|
| `msba-planner-selections` | 已选课 |
| `msba-planner-wishlist` | 备选 |
| `msba-locale` | 语言 |
| `msba-default-landing` | 默认落地页 |
| `msba-sync-tz-mode` | 关于页同步时间时区显示 |
| `msba-dismiss-teaching-plan-notice(:id)` | Teaching Plan 已读 |
| `msba-dismiss-tutorial-conflicts` | Tutorial 冲突提示关闭 |
| `msba-ics-export-format` | ICS 模板 |
| `msba-pwa-install-banner-dismissed:v1` | 安装横幅已关闭 |
| `pwaStorage` / reset | 清理所有以 `msba-` 开头的键 |

**同一浏览器若同时打开 BA 与新站**：前缀必须不同，否则选课数据会串。

---

## 4. 数据模型（必须先读懂再填）

权威类型：[`src/types.ts`](../src/types.ts)。

### 4.1 `public/courses.json`

数组，每项一门课：

- `courseCode` / `courseTitle` / `module`（模块号）/ `courseType`：`Core` \| `Elective` \| `Capstone`
- `streamTags`：培养方向标签（无则 `[]`）
- `outlinePdfPath`：相对 `public/` 的 PDF；若各班不同 outline，可把路径放在 `sections[].outlinePdfPath`，课程级留 `null`
- `examOrFinal`：课程级考试/展示；班别特殊考试可写在 `sections[].examOrFinal`
- `sections[]`：
  - `sectionId`：`A`/`B`/…
  - `instructors[]`：`{ name, note? }`
  - `timeBucket`：`AM` \| `PM` \| `NT`
  - `dayPattern`：Teaching Plan「Class Day & Time」原文
  - `meetingDays`：0=周日…（展示用）
  - `meetings[]`：展开后的每一节
    - `sessionType`：`lecture` \| `tutorial`
    - `date`：`YYYY-MM-DD`；`startTime`/`endTime`：`HH:mm`
    - `venue`
    - `instructors?`：仅当该节与班默认教授不同
    - **`tutorialFor?`**：该 TUT 适用的讲座班列表，如 `["A","B"]` 或 `["C"]`  
      - 实现上 TUT **仍复制到每个适用 section** 的 `meetings`（日历/冲突按 section 算）  
      - `tutorialFor` 用于课程页标签与 Teaching Plan 通知班列（`TUT (A+B)` 等）

**排课习惯（BA）**：非常规日期、晚间补课、周日课都直接写进 `meetings`，不要假设「每周固定」。

### 4.2 `public/requirements.json`

- `totalCourses` / `creditsPerCourse` / `electiveCount`
- `coreCourses[]`、`capstoneCourses[]`
- `streams`：各 concentration + list（`minRequired` + `courses[]`）
- `notes[]` / `planningRules[]`：培养页文案（可中英混排；UI 语言层另有 i18n）

新专业若无 Stream，可简化 `streams` 为空对象，并改 `Requirements.tsx` 展示逻辑（检查空态）。

### 4.3 用户备份 JSON（导入/导出）

见 [`src/utils/userDataTransfer.ts`](../src/utils/userDataTransfer.ts)：

- `schemaVersion: 1.5`
- `programme`：必须与 `PLANNER_PROGRAMME` 一致才会无警告导入
- `teachingPlanRead`：`{ "<通知发布时间戳>": true }`（**不要**用 noticeId 做 key）
- `selections` / `wishlist`：精简为 `{ courseCode, sectionId, status }`；导入时从当前 `courses.json` 回填标题/教授等

跨专业备份**不应**静默混用；依赖 `programme` 字段拦截。

---

## 5. 功能子系统（改什么 / 别动什么）

### 5.1 选课与冲突（通常保留）

- [`useSelections`](../src/hooks/useSelections.ts)：同一 `courseCode` 只能选一个班
- [`conflicts.ts`](../src/utils/conflicts.ts)：按 meeting 时间重叠检测
- Wishlist / Study Status 导入：保留 UI，按需改解析规则（港大 SIS 粘贴格式可能因专业而异）

### 5.2 日历与 ICS（通常保留）

- [`calendarEvents.ts`](../src/utils/calendarEvents.ts)：LEC/TUT/Exam → 月历事件
- **假日只在屏幕日历**（`holidays.ts`），**不进 ICS**
- Teaching Plan **改期幽灵场次**仅在 Planner 内嵌日历（`teachingPlanImpact.ts`），独立 Calendar 页不叠加

### 5.3 Teaching Plan 通知（保留机制，换内容）

| 文件 | 角色 |
|------|------|
| `teachingPlanUpdates.ts` | `teachingPlanNotices[]`，**newest first** |
| `TeachingPlanUpdateNotice.tsx` | 选课页置顶未读区 |
| `TeachingPlanArchive.tsx` | 全部历史 |
| `teachingPlanDismiss.ts` | 已读 = noticeId + **course codes join** 版本 |
| `teachingPlan/README.md` | PDF 对照操作手册 |

新站冷启动：

1. 放第一份 Teaching Plan PDF 到 `src/teachingPlan/`，命名 `…_YYYYMMDD.pdf`
2. 据此建完整 `courses.json`
3. `teachingPlanNotices` 可先空数组，或第一条「初始同步」通知
4. 设置 `DATA_SYNC_HKT`（关于页）

之后每次 PO 更新：**严格按 `src/teachingPlan/README.md`**（邮件正文不可全信；红=本版新改动，绿=旧改动残留；TUT 写 `tutorialFor`）。

### 5.4 PWA（保留，改身份）

- `vite-plugin-pwa` + `@khmyznikov/pwa-install`
- **关键**：`navigateFallbackDenylist: [/\.pdf$/i]` —— 否则大纲 PDF iframe 会被 SW 喂成 SPA 壳
- Manifest 分语言文件在 `public/`，不要让插件再生成冲突 manifest（`manifest: false`）

### 5.5 i18n（保留三语骨架）

- `zh-CN` / `zh-HK` / `en`
- 课程名、`LEC`/`TUT` **不译**
- Teaching Plan 每条通知要有独立 `bodyKey`（如 `body7001_7003_1012`），**不要覆盖**旧通知的 body 文案

### 5.6 版本号约定

- 显示：`主.次.修订.yyMMdd` + 短 commit（关于页可点进 GitHub）
- `APP_VERSION_BASE` 手工 bump；日期后缀由**构建时 git commit 日期**注入
- 纯文案小改可只推 commit **不** bump patch（产品曾这样要求）；数据同步 Teaching Plan 一般 bump patch

---

## 6. 建议的 Agent 执行清单（可复制）

把下面当作新站任务的 checklist：

```text
[ ] 新 GitHub 仓库 + Pages 权限 + 确认 base 路径
[ ] 复制代码；删除或归档 BA 的 teachingPlan PDF / 旧 notices
[ ] 替换 PLANNER_PROGRAMME、appIdentity、manifest、README、关于/页脚 i18n
[ ] 全局替换 localStorage 前缀 msba- → <new>-
[ ] 编写 courses.json（含 tutorialFor）+ requirements.json + courseOutline
[ ] DATA_SYNC_HKT + 空或初始 teachingPlanNotices
[ ] holidays.ts 按学年核对（港大假期）
[ ] npm ci && npm run build（tsc -b 无 TS6133 unused 等）
[ ] 手动点检：选课冲突、日历、课程页 TUT 范围、导入导出 programme 校验、PWA PDF 大纲
[ ] push main 部署；核对关于页版本与 commit 链接
```

### 6.1 建议的「给下一个 Agent」启动提示词模板

```text
请阅读 docs/AGENT_MIGRATION_GUIDE.md 与 REQUIREMENTS.md、src/teachingPlan/README.md。
目标：以本仓库为模板，fork 为 <专业名> 选课站。
仓库：<url>；Pages base：/<repo>/；programme id：<MSc(...)>；storage 前缀：<xxx>-。
数据源：附件 Teaching Plan PDF + 培养要求。
要求：保留冲突/日历/TP 通知/PWA/导入导出架构；替换身份与全部课表数据；
完成后 npm run build 通过并 push main。不要混用 msba- localStorage 前缀。
```

---

## 7. 历史踩坑（来自本站演进，迁移时避免重犯）

1. **PDF iframe + Service Worker**：`navigateFallback` 必须 denylist `\.pdf$`。  
2. **Teaching Plan 红/绿**：绿色常是旧改动残留；删除线红字可能是「取消」不是「改时间」。邮件漏写的课也要以 PDF 为准（例：7004 TUT 取消）。  
3. **Tutorial 归属**：共用格 ≠ 全课所有班；通知与课程页必须用 `tutorialFor`。  
4. **CI 严格 TypeScript**：`noUnusedParameters` / `noUnusedLocals`；未使用参数会让 `npm run build` 挂掉（Pages 部署失败）。  
5. **导出结构**：已阅通知用**时间戳做 key**；选课只存 code+class+status；导入依赖在线 `courses.json` 水合。  
6. **dismiss version**：按通知涉及的 `courseCode` join；增删课号会让用户再次看到该则（有意为之）。  
7. **考试改时间**：改 `examOrFinal`，通知可用 `itemKey: 'examFinal'` + `itemDate`，便于日历关联。

---

## 8. 与现有 MGM fork 的关系

工作区旁若存在 `HKUBS_MGM_CourseList`，可对照：

- 同一套页面与 hooks 命名
- 不同的 `base`、品牌文案、`courses.json`、Teaching Plan PDF
- 应用它验证「身份清单」是否遗漏，而不是从零发明架构

若 MGM 已演进出多专业 `public/<prog>/` 布局，**以该仓最新实现为准**，并回写本指南差异点。

---

## 9. 明确不要做的事（除非新产品需求）

- 不要默认做后端、登录、容量限制、先修求解器、自动生成 study plan（见 `REQUIREMENTS.md` 排除项）。
- 不要在未确认的情况下合并 BA/MGM 的 `localStorage` 或备份 `programme`。
- 不要把 Teaching Plan PDF 散落在仓库根目录；统一 `src/teachingPlan/`。
- 不要在迁移任务里「顺手大重构」UI；先数据正确与构建通过。

---

## 10. 关键文档索引

| 文档 | 用途 |
|------|------|
| [`REQUIREMENTS.md`](../REQUIREMENTS.md) | 产品行为与验收 |
| [`src/teachingPlan/README.md`](../src/teachingPlan/README.md) | Teaching Plan PDF 同步步骤与通知表规则 |
| [`README.md`](../README.md) | 人类向简介与本地开发 |
| 本文件 | **Agent 向** fork / 新专业迁移 |

维护约定：若迁移步骤或身份清单变更（例如 storage 前缀策略、多专业目录），**更新本文件**，避免下一个 Agent 读到过时假设。
