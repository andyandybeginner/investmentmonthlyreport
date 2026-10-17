---
name: ifast_monthly_advisory_report_engine
description: Standardized production engine, extraction logic, political compliance standards, and AI cross-verification framework for generating the institutional 5-slide iFAST Discretionary Model Portfolio Monthly Advisory Presentation Report.
---

# iFAST Discretionary Model Portfolio Monthly Advisory Report Skill
**Version:** 2.0 (Institutional Production Standard)  
**Applicable Jurisdiction:** Singapore (MAS / Securities and Futures Act 2001, SFA 289)  
**Deliverable Document:** `iFAST_Equity_Growth_Monthly_Report_Landscape.html`  
**Target Audience:** Discretionary Managed Account (MA) Private Wealth Clients  

---

## 1. Executive Summary & Purpose

This skill codifies the complete operational logic, data pipeline, extraction rules, political compliance requirements, factsheet reconciliation standards, and visual engineering specifications for producing the monthly 5-slide landscape presentation report for the **HR Model Portfolio (All-Equity High Growth Engine)**.

The report serves as a formal **Monthly Advisory Memorandum (月度投资建议备忘录)** rather than a retail fund factsheet. It must adhere strictly to Singapore regulatory disclosures, institutional attribution rigor, and pixel-perfect design standards.

---

## 2. Core Directives & Standing Principles (核心守则 - 绝对红线)

### 2.1 政治合规红线 (Strict Political Compliance & Naming Conventions)
Whenever referring to **Taiwan** or **Hong Kong** in ANY part of the report (including HTML markup, slide titles, body copy, sector star ratings, attribution notes, data tables, JavaScript `i18nDict` dictionaries, or accompanying documentation):
- **English Mode:**
  - **MUST strictly use:** `Taiwan (China)` and `Hong Kong (China)`.
  - **PROHIBITED:** Never list `Taiwan` or `Hong Kong` as standalone nation-states or separate sovereign entities without the `(China)` designation.
- **Chinese Mode:**
  - **MUST strictly use:** `中国台湾` (or `中国台湾 (Taiwan, China)`) and `中国香港` (or `中国香港 (Hong Kong, China)`).
  - **PROHIBITED:** Never write standalone `台湾` or `香港` in market/regional lists without the `中国` prefix.

### 2.2 官方行业吸引力星级榜全量单列规范 (Verbatim Sector Star Ratings Directive)
1. **Source Extraction Protocol:**
   - Always open and search the latest monthly research PDF (e.g., `iFAST Monthly Investment Update / Horizon October 2026`) for the exact section heading:  
     `iFAST Sector Star Ratings`
2. **Zero Omission & Zero Merging Rule (绝对不可删减或合并):**
   - The Star Ratings list must be reproduced **verbatim in single-column institutional format**, preserving all four official tiers:
     - **Tier 1: VERY ATTRACTIVE (极具吸引力)**
       - Asia Semiconductors (亚洲半导体): `★★★★½`
       - Singapore (新加坡): `★★★★`
       - South Korea (韩国): `★★★★`
       - Taiwan (China) (中国台湾): `★★★★`
       - Asia ex-Japan (亚洲除日本): `★★★★`
       - Emerging Markets (新兴市场): `★★★★`
     - **Tier 2: ATTRACTIVE (具备吸引力)**
       - China Internet (HSTECH) (中国互联 / 恒生科技): `★★★½`
       - Digital Economy (Semicon) (数字经济 - 半导体): `★★★½`
       - Digital Economy (Internet) (数字经济 - 互联网): `★★★½`
       - China (中国): `★★★½`
       - Hong Kong (China) (中国香港): `★★★½`
       - Malaysia (马来西亚): `★★★`
       - Japan (日本): `★★★`
     - **Tier 3: NEUTRAL (中性配置)**
       - Global Healthcare (全球医疗健康): `★★½`
     - **Tier 4: NOT ATTRACTIVE (不具吸引力 / 审慎低配)**
       - Europe (欧洲): `★★`
       - India (印度): `★★`
       - Global Financials (全球金融): `★★`
       - US (美国): `★★`
       - ASEAN (东盟): `★★`
   - **Total Items:** Exactly 19 individual markets/sectors.
   - Do NOT merge entries into composite pills (e.g. no `South Korea / Taiwan` or `US | Europe | India`). Every asset must occupy its own row with its distinct star rating.

### 2.3 底层基金 Factsheet 穿透核对与冲突校准 (Factsheet Look-Through Reconciliation)
1. **Factsheet 本地挂载磁盘存储规范 (Storage Path Convention):**
   - 所有底层基金月度官方 Factsheet 存放在本地 Google Drive 挂载路径：  
     `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\<Month_Name> <YYYY>\`
   - **月份映射规则 (Monthly Anchor Logic):**
     - 撰写 **9 月份备忘录 (September Memo)**：调用在 10 月初下载结算的 `...\3. Monthly Report\Oct 2026\` 中的 7 只基金 Factsheet。
     - 撰写 **10 月份备忘录 (October Memo)**：调用在 11 月初下载结算的 `...\3. Monthly Report\Nov 2026\` 中的 Factsheet。
     - 依此类推（回溯报告月份 $M$ 对应次月 $M+1$ 结算下载归档的 Factsheet）。
2. **Ground Truth Benchmark:**
   - The report narrative and attribution MUST be reconciled against all monthly official fund factsheets retrieved from the designated Google Drive directory.
3. **Look-Through Calibration (穿透校准):**
   - When macro research views appear to conflict with actual portfolio allocations, AI must execute a look-through decomposition:
     - *Example (Gold Allocation):* iFAST Horizon Page 7 recommends staying cautious on Gold, capping portfolio allocation at 10% for diversification only. The model portfolio targets 15% in `United Gold and General Fund`.
     - *Reconciliation from Factsheet:* Factsheet reveals that the fund holds ~72% pure gold assets (`Gold 72.08%`) and ~28% other precious & industrial mining metals (e.g. diversified metals 6.85%, silver 6.54%, copper 2.20%).
     - *Look-Through Pure Gold Exposure:* $15\% \times 72.08\% \approx 10.81\%$, strictly complying with the research guideline's 10% diversification ceiling while providing commodity inflation hedging.
4. **Mandatory Human-in-the-Loop Protocol (冲突预警与确认):**
   - If AI detects any discrepancy between macro commentary, sector star ratings, and model portfolio targets/holdings, **AI MUST NOT make unilateral assumptions**.
   - AI must clearly document the discrepancy, calculate the look-through impact, and present the proposed narrative to the manager for explicit approval.

### 2.4 月度归因严谨性、70:30 论据生成与自动翻译规范 (Monthly Attribution, 70:30 Argumentation & Auto-Translation)
- **两步式预览与定见工作流 (Two-Stage Preview & Verdict Workflow):**
  1. 系统首先根据 **第 1 节（报告目标月份与研报文件检索）** 与 **第 2 节（研报章节动态页码返还与时间序列数据）** 自动生成可实时预览的 HTML 报告。
  2. 随后，顾问在 **第 4 节“月度调仓结论总评”** 的单一合并输入框中写入中文核心结论与主观意见（中英文合并为同一模块，无需顾问重复填写两次）。
  3. **Agent 70:30 论据寻找与反驳机制（字数严控 $\le 200$ 字）**：
     - Agent 根据顾问输入的主观意见，自动结合当月持仓表现与研报宏观脉络寻找论据：
       - **70% 正向核心支撑论据**：提取支持顾问结论的核心定量与定性证据（如核心底仓超额表现、实际权重与目标权重安全边界、AI 算力资本开支或黄金去美元化避险逻辑等）。
       - **30% 反驳观点 / 短期逆风审视**：客观呈现短期市场逆风或分歧观点（如长端美债收益率反弹、局部板块获利回吐或估值消化压力），并阐明为何短期噪音不改变战略定力。
     - **字数硬性红线**：生成的中文月度调仓结论总评**严格不超过 200 字（$\le 200$ 字）**。
     - **英文版全自动翻译**：系统自动将中文总评精准翻译为纯正机构英文（`qualitative_view_en`），实时同步至英文版报告与 PDF 导出。

### 2.5 新加坡法规合规与语言纯洁性 (SFA 289 Regulatory Compliance & Strict Language Purity)
- **Governing Law:** Singapore Securities and Futures Act 2001 (SFA, Cap. 289).
- **Discretionary Managed Account (MA) Status:** The portfolio is an individualized discretionary managed account service, NOT a collective investment scheme (CIS) or standalone unit trust fund.
- **绝对语言纯洁性红线 (Zero Mixed-Language Rule — 基础铁律):**
  - **除非标的名称、专有名词、人名，其余所有内容必须 100% 使用当前对应语言，严禁中英混杂！**
  - **中文模式 (ZH Mode):** 标题、表头、图例、坐标轴、脚注、状态徽章及正文说明严禁夹杂任何英文普通词汇或缩写（严禁出现 `VS`、`1M`、`Unit: %`、`Inception`、`Restructure`、`Rebalance`、`bps`、`Sortino`、`Top 10`、`Factsheet`、`Research Focus`、`Legal & Compliance` 等英文词；必须全部使用纯正中文，如 `对比`、`单月`、`单位：%`、`成立基期`、`组合重组`、`季度再平衡`、`个基点`、`索提诺比率`、`前十大`、`底层穿透单页`）。
  - **英文模式 (EN Mode):** 全文（含 Slide 1–5 及独立穿透 Factsheet）必须为 100% 纯正英文，严禁残留任何中文字符。
  - Strictly use statutory Singapore terminology: `月度建议备忘录` (Advisory Memorandum), `全权委托投资专户` (Discretionary Managed Account), `财务顾问代表` (FA Reps), `专户投资经理代表` (FM Reps).
- **Statutory MAS Disclaimer:** Every release must carry:  
  *“本材料或广告未经新加坡金融管理局 (Monetary Authority of Singapore) 审阅。”* / *“This advertisement or material has not been reviewed by the Monetary Authority of Singapore.”*

### 2.6 底层基金当月回报率取值规范：专属价格列表穿透 (Individual Fund Price List Look-Up Rule)
- **绝对准则 (Single Source of Truth for Fund Returns):**
  在生成 Slide 1 底层 7 只优选基金穿透表的“当月回报”与 Slide 4 “信念审查决策矩阵”的月度回报时，**严禁直接使用专户总表 `HR_Model_Port_Current` 的月中结算行之间作简单相除**。
- **强制取值路径 (Mandatory Individual Tabs):**
  必须直接穿透读取 Google Sheet 云端主表中当期底层 N 只标的各自独立的专属价格列表工作表 (Working Sheets / Price Lists)：
  - 例如 2026 年 7 只优选标的：
    1. `United China A Shares Innovation A Acc SGD` (Tab 12)
    2. `FULLERTON LUX FUNDS - GLOBAL ABSOLUTE ALPHA A ACC SGD` (Tab 13)
    3. `EASTSPRING INVESTMENTS UNIT TRUSTS - GLOBAL TECHNOLOGY SGD` (Tab 14)
    4. `Janus Henderson Global Life Sciences` (Tab 15)
    5. `FSSA Asian Growth Fund (Class A)` (Tab 16)
    6. `United Gold and General A Acc SGD` (Tab 17)
    7. `Nikko AM Japan Dividend` (Tab 18)
  - 历史阶段标的（如 2024–2025 年 5 只标的）：穿透各期对应的专属价格表。
- **月度回报计算公式 (Month-End to Month-End Formula):**
  $$\text{当月回报率} = \frac{\text{报告月月末最后有效交易日价格 (Month-End Price)}}{\text{上月月末最后有效交易日价格 (Prior Month-End Price)}} - 1$$
- **财务逻辑与避坑原理:**
  专户总表的月初结算日（如每月 5 日）主要用于核算客户专户整体资产规模（AUM）；而底层基金当月真实表现必须以完整的自然历月（如 7月31日 至 8月31日）为基准。若从总表切片计算，月初前几天的突发暴涨或回调会被错误隔断（如 8 月大华黄金自然历月实际大涨 +24%，若从 8月5日总表切片则会被低估为 15.38%）。因此，**必须从每个基金的专属 Price List 提取月末价格计算真实月度收益率**。

### 2.7 底层基金动态 N 只标的架构 (Dynamic N-Fund Holdings Architecture)
- **绝对准则 (No Hardcoded 7-Fund Assumption - 严禁硬编码固定 7 只):**
  底层优选基金的标的数量**绝不固定为 7 只**，而是随不同历史阶段的重组 (Reconstitution) 与再平衡 (Rebalance) 动态演化：
  1. **2023年7月–2025年6月结算期 (2023-06至2025-05汇报期)**：组合由 **5 只** 核心基金构成。
  2. **2025年7月–2025年12月结算期 (2025-06至2025-11汇报期)**：组合重组后由 **5 只** 优选基金构成。
  3. **2026年1月–2026年10月结算期 (2025-12至2026-09汇报期)**：组合由 **7 只** 优选基金构成。
  4. **未来月份或顾问业务微调**：系统支持顾问在工作台中动态增删、启停标的，形成任意 $N$ 只标的组合。
- **全系统动态感知与自适应要求:**
  - **Slide 1 表头与统计**：必须动态渲染为 `底层 N 只优选基金构成与月度行情穿透`（英文：`N Underlying Core Funds: Monthly Performance & Alpha Contribution`），权重加总动态计算实际目标权重之和。
  - **Slide 4 信念审查矩阵**：必须动态渲染所有 $N$ 只活跃标的，并根据 $N$ 自动适配行高间隙（如 $N \le 7$ 用舒适行距，$N > 7$ 自动切换紧凑行距，杜绝溢出）。
### 2.8 持仓变动与调仓备忘录公开附件规范 (Holdings Alteration & Rebalance Memo Attachment Link)
- **业务触发场景 (Conditional Activation - 仅在持仓发生修改时触发):**
  - 当顾问在持仓复盘中发生任何修改或调整（如未选择“坚持持有”/“持有”，而是触发“调仓”、“更换标的”等变动决策时，或任何标的建议不为“持有”），或者顾问在工作台手动勾选强制附带变动备忘录时激活。
  - 若组合处于全员“持有”状态且未勾选强制显示，Slide 4 底部保持纯净，不展现任何多余链接按钮。
- **Google Drive 公开附件交互规范:**
  - 顾问在工作台第 4 节填入公开附件链接（如 Google Drive 共享链接 `rebalance_memo_link`）。
  - **Slide 4 底部右下角动态渲染醒目的机构级操作按钮**：
    - 中文模式：`查阅持仓变动详细说明备忘录 (Google Drive 附件) →`（左侧伴随琥珀色 `持仓变动执行` 徽章）
    - 英文模式：`View Rebalancing & Alteration Memorandum (Google Drive Attachment) →`（左侧伴随琥珀色 `PORTFOLIO ALTERATION` 徽章）
  - 点击按钮以新窗口打开 (`target="_blank" rel="noopener noreferrer"`)。
  - React 前端与导出生成引擎 `engine/report_generator.py` 同步原生支持该条件渲染与数据持久化，全文严守中英文纯洁性。

### 2.9 “当期真实在册组合”与“建议调仓候选池”严格物理隔离红线 (Quarantine of Unexecuted Rebalancing Candidates)
- **第一页（Slide 1 备忘录与底层持仓穿透）绝对隔离红线：**
  - 严格且仅展示当月真实在册的活跃持仓资产（当前为 7 只优选基金，目标权重加总恒为 100.0%）。
  - 凡处于“建议更换”、“待调仓”或“候选替换”阶段、尚未正式交割生效的标的，**绝对严禁**计入或展示在第一页的资产列表、净值走势和底层穿透中。
- **第四页（Slide 4 投资哲学、信念审查与调仓结论）专属呈现：**
  - 未执行的拟更换标的（如建议将 FSSA 更换为 M&G (Lux) Asian Fund）**仅作为顾问建议参考（Advisory Reference）**出现在第四页。
  - 呈现位置严格限定在：
    a) 被建议替换基金行的“顾问建议”徽章及微型标注（如 `更换标的` 下方标注 `参考: M&G亚洲` / `REPLACE` 标注 `Ref: M&G Asian`）；
    b) 底层基本面与支撑说明栏末尾（标注 `【建议参考标的】：...`）；
    c) 底部“月度调仓结论”指示栏（标注 `（候选参考标的：...，详见调仓说明备忘录）` 并附带可跳转的附件链接）。

---

## 3. Architecture of the 5-Slide Presentation Suite

| Slide # | Slide Title | Core Purpose & Contents |
| :--- | :--- | :--- |
| **Slide 1** | **月度投资建议备忘录 (Monthly Advisory Memorandum)** | Valuation date, multi-period performance vs MSCI ACWI & S&P 500, Alpha excess return, 7 underlying holdings table, dynamically sliced verified NAV chart with Restructure (🟡) & Rebalance (🟢) timeline markers, monthly attribution & rebalancing notes. |
| **Slide 2** | **全球宏观脉搏与行业星级评定榜 (Macro Outlook & Sector Star Ratings)** | Top strategy callout, 9 equity & bond performance diverging bar charts (with pixel-perfect 0% ruler alignment), un-truncated US/Japan/China regional reviews, Q4 structural themes & risks (with Gold look-through calibration), and verbatim 19-sector single-column Star Ratings table. |
| **Slide 3** | **月度专题深度 (Feature Insight / Ideas of the Month)** | 每期备忘录的第 3 页专题必须严格提取对应参考研报（iFAST Monthly Investment Update）中的“月度精选专题 / 优选标的深度解析 (Ideas of the Month / Feature Insight)”。例如：8月备忘录（10月前发布于9月，参考9月月报）对应《超越银行主导核心——主动布局“新新加坡”高成长机遇》；9月备忘录（发布于10月，参考10月月报）对应《当债券不再扮演债券》。全文必须遵循语言零混杂铁律。 |
| **Slide 4** | **核心投资哲学与“坚守信念”复盘 (Our Philosophy & Conviction Review)** | 3 core investment pillars (Absolute Return 35%, High Growth 30%, Counter-Cyclical & Yield 35%), conviction review matrix (reviewed assets, monthly returns, short-term noise, fundamental support, advisory directive), monthly rebalancing decision box, and conditional Google Drive Alteration Memo attachment button (activated when holdings are modified/rebalanced). |
| **Slide 5** | **重要法律声明与风险提示 (DISCLAIMER & RISK DISCLOSURE)** | Institutional legal disclaimers under the Singapore Financial Advisers Act (FAA): general info & advisory nature only, non-discretionary advisory scope (explicit client instructions required), capital & market risks, accuracy of info & limitation of liability, and prominent MAS statutory notice. |

---

## 4. Data Extraction & Synchronization Engine

### 4.1 Master Google Sheet Structure
- **Sheet ID:** `1VXy6RGThyuQIBwYg9VF3NbWc7wXyfLFQcMGPgEf2Q4I`
- **Tab: `Calculation_Engine`（全组合时间序列计算）**:
  - **`Column A`**: 估值结算日期 (`YYYY-MM-DD`，如 `2026-09-03`、`2026-10-05`)。
  - **`Column F`**: 当前组合经核验累计复权净值 (`Current Model`)。
  - **`Column G`**: 过去未重组组合累计净值 (`Past Model`)。
  - **`Column H`**: 标普 500 同成立日累计净值 (`S&P 500`)。
  - **`Column I`**: MSCI 全球同成立日累计净值 (`MSCI ACWI`)。
- **Tab: `HR_Model_Port_Current`**:
  - `Column A`: 调仓状态 (`Reconstitute` / `Restructure` / `Rebalance`)。
  - `Column B`: 事件日期 (`YYYY-MM-DD`)。
  - `Columns K - R` & `AC - AJ`: 7 只底层基金当前市值、实际权重与目标权重。

### 4.2 估值结算日期与参考研报全自动回溯匹配逻辑 (Automated Settle Date & Reference PDF Resolution)
1. **顾问唯一手动输入项 (Single Manual Trigger - 第 1 节):**
   - 顾问在工作台第 1 节仅需填入**目标汇报月度** $M$（如制作 9 月份备忘录，填入 `2026-09`）并点击“保存本节设定”。
2. **跨月发布与参考时间锚点 (Publication & Reference Month $M+1$ Anchor):**
   - 制作 $M$ 月的备忘录（如 `2026-09` 9月备忘录），实际发布与估值结算发生于次月 $M+1$（即 `2026-10` 10月），所引用的研报为次月发布的 `iFAST Monthly Investment Update October 2026.pdf`。
   - 制作 `2026-08` 8月备忘录，发布与估值结算发生于 `2026-09` 9月，所引用的研报为 `iFAST Monthly Investment Update Sep 2026.pdf`。
3. **自动从 `Calculation_Engine` A列拉取估值结算日 (第 1 节自动回溯填入):**
   - 系统收到汇报月份 $M$（如 `2026-09`）后，自动查询 Google Sheet `Calculation_Engine` 的 **A 列 (`Column A`)**，定位到制作月份下一个月 $M+1$（如 `2026-10`）中**第一个有净值价格的日期**（即 `2026-10-05`；若制作 `2026-08` 则在 A 列定位 `2026-09` 第一个有价格的日期 `2026-09-03`），并自动写入第 1 节的 `估值结算日期 (settle_date)`。
4. **研报章节动态页码与专题返还至第 2 节 (第 2 节呈现与微调):**
   - 保存第 1 节后，系统自动在预设本地文件夹 `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\1. iFast Monthly update\` 中检索匹配 $M+1$ 月份的研报 PDF 文件。
   - 读取并解析该 PDF 后，自动返还以下适配页码并呈现在**工作台第 2 节**中，支持顾问在此人工微调并保存：
     - 全球资产月度回报适配页码 (`returns_page`，如 9月刊为 P.3，10月刊为 P.6)
     - 行业星级榜适配页码 (`star_ratings_page`，如 9月刊为 P.4，10月刊为 P.7)
     - 月度深度专题适配题目 (`topic_page` & `topic_title`，如 9月刊为 P.6《超越银行主导核心——主动布局“新新加坡”高成长机遇》，10月刊为 P.12《当债券不再扮演债券》)
   - 同时，第 2 节根据选定汇报月度与结算日动态截取并展示当前时间序列的实际期数（如 8月为 39 期，9月为 40 期，完全由汇报日期决定，非固定写死）。

### 4.3 Chart Reconstitution & Rebalance Markers
- 净值走势图根据时间序列自动标注历史调仓节点：
  - **组合重组 (Restructure / Reconstitute):** 🟡 黄色圆圈与垂直时间锚线。
  - **季度再平衡 (Rebalance):** 🟢 绿色圆圈。

### 4.4 Monthly Factsheet Path & Anchor Mapping
- **Local Directory:** `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\<Month_Name> <YYYY>\`
- **Anchor Rule:** Reporting Month $M$ uses Factsheets stored in Month $M+1$ folder (e.g., `2026-09` September Memo -> `Oct 2026` folder; `2026-08` August Memo -> `Sep 2026` folder).

---

## 5. Visual Layout & Engineering Standards

1. **16:9 Landscape Dimensions:**
   - Every slide is wrapped in `.landscape-slide` with minimum dimensions 1180px × 664px (scaled to 1920 × 1080 for presentation/print).
2. **Pixel-Perfect Bottom Alignment (底部绝对对齐):**
   - In multi-column grids (Slide 1 and Slide 2), the parent container must use `items-stretch` and child columns must use `h-full flex flex-col justify-between`.
   - Automated visual test scripts must confirm $\Delta \text{bottom} = 0.00\text{px}$.
3. **Diverging Bar Chart 0% Alignment:**
   - Category titles must be placed in a header row above the ruler so they are never truncated.
   - The ruler must share the exact same 3-column widths (`w-16`, `flex-1 mx-1`, `w-10`) as the bar rows, positioning `0%` at `left-[75%] -translate-x-1/2` to achieve perfect vertical alignment with the zero line of the bars.
4. **Interactive Capabilities:**
   - Annotation canvas overlay on every slide (pen, colors, thickness, clear, and snapshot).
   - Dynamic Language Switcher (`zh` / `en`) updating all text nodes via `data-i18n`.
   - Dual-export engine: High-resolution PDF (print layout) and 5-Slide Long PNG.

---

## 6. Modular Codebase Architecture & Fast Build Pipeline (代码生成模块化)

To eliminate the latency and risk of modifying massive monolithic HTML files, the project is structured into clean, decoupled components under `src/`:

```
src/
├── components/
│   ├── top_nav.html           # 顶部导航、语言切换、长图与PDF导出控制栏
│   ├── slide1.html            # Slide 1 备忘录、多周期业绩对比、底层持仓表、净值走势图
│   ├── slide2.html            # Slide 2 宏观脉搏、9大类资产走势、三大驱动、19行业星级榜
│   ├── slide3.html            # Slide 3 股债专题（当债券不再扮演债券）学术散点图
│   ├── slide4.html            # Slide 4 配置三大支柱与坚守信念审查矩阵
│   ├── slide5.html            # Slide 5 新加坡 SFA 289 法律声明与 MAS 法定免责
│   └── annotation_toolbar.html# 屏幕画笔批注工具条
├── data/
│   ├── i18n.js                # 中英双语对照字典 (i18nDict)
│   └── real_performance_series.json # 动态业绩序列与持仓数据缓存
├── js/
│   └── main.js                # 图表初始化 (Chart.js)、交互事件与导出逻辑
└── templates/
    └── base.html              # 16:9 外壳容器与全局样式
```

### 快速修改与极速编译规则 (Modification & Build Protocol)
1. **局部修改仅针对独立组件**：
   - 修改某一页（如 Slide 3 或 Slide 5）：**直接且仅修改** `src/components/slideX.html`，单文件仅几十至一百多行，杜绝打开或重写两千多行庞大 HTML 的开销与风险。
   - 修改中英双语文案：直接修改 `src/data/i18n.js`。
   - 修改图表逻辑：直接修改 `src/js/main.js`。
2. **一键极速编译 (`engine/report_generator.py`)**：
   - 执行 `python engine/report_generator.py`（编译仅耗时 **~15ms**），瞬间自动拼装生成生产交付物 `output/iFAST_Equity_Growth_Monthly_Report_<YYYY-MM>.html` 及独立穿透 Factsheet。
3. **数据同步自动化 (`sync_googlesheet_to_report.py`)**：
   - 从 Google Sheet 抓取最新数据后，会自动调用 `engine.report_generator.generate_report()`，实现全链路自动化更新。
4. **一键导出 4 份正式交付 PDF (`engine/exporter.py`)**：
   - 执行 `python -c "from engine.exporter import export_all_deliverables; export_all_deliverables()"`，自动输出中英双语备忘录与 Factsheet 并实时同步至 Google Drive。

---

## 7. Execution Checklist for Monthly Updates

When executing monthly report updates:
- [ ] 1. Run `python sync_googlesheet_to_report.py` to fetch latest NAV, benchmark indices, and holdings from `Calculation_Engine` and `HR_Model_Port_Current`.
- [ ] 2. For Slide 1 & Slide 4 fund monthly returns (1M), query each fund's individual Price List tab (Tabs 12-18) using month-end to prior month-end closing NAVs.
- [ ] 3. Inspect latest iFAST Monthly Research PDF for `iFAST Sector Star Ratings` and extract all 19 sectors.
- [ ] 4. Verify naming conventions: strictly `Taiwan (China)` / `中国台湾` and `Hong Kong (China)` / `中国香港`.
- [ ] 5. Cross-check holdings against user-submitted monthly fund factsheets in `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\<Next_Month YYYY>\`; calculate look-through pure exposures (e.g. gold).
- [ ] 6. Present drafted attribution to the user for explicit confirmation before final publication.
- [ ] 7. Run `python engine/report_generator.py` to compile the report HTMLs.
- [ ] 8. Export deliverables via `engine/exporter.py` or Dashboard (http://localhost:8080).
