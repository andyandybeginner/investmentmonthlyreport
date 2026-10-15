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

### 2.4 月度归因严谨性与授权确认 (Monthly Attribution Rigor & Authorization)
- **Truthful Financial Representation:** Never exaggerate minor positive returns as "strong buffers" (e.g., `Fullerton Absolute Alpha (+0.45%)` is a low-beta pair-trading ballast for capital preservation, not a high-beta driver).
- **Fundamental Cause vs Price Movement:** Price pullbacks in core strategic positions must be contextualized using actual portfolio weights (e.g., `United China A` falling -5.40% represents healthy profit-taking / profit give-back following massive prior gains, evidenced by its actual weight of 12.36% remaining comfortably above its 12.00% target allocation).
- **Mandatory Confirmation Rule:** Any modification or newly generated attribution text must be presented to the user for explicit confirmation before final deployment.

### 2.5 新加坡法规合规与语言纯洁性 (SFA 289 Regulatory Compliance & Language Purity)
- **Governing Law:** Singapore Securities and Futures Act 2001 (SFA, Cap. 289).
- **Discretionary Managed Account (MA) Status:** The portfolio is an individualized discretionary managed account service, NOT a collective investment scheme (CIS) or standalone unit trust fund.
- **Language Purity:**
  - In Chinese mode, zero English terminology is permitted in headings, labels, or explanatory paragraphs.
  - Strictly use statutory Singapore terminology: `月度建议备忘录` (Advisory Memorandum), `全权委托投资专户` (Discretionary Managed Account), `财务顾问代表` (FA Reps), `专户投资经理代表` (FM Reps).
- **Statutory MAS Disclaimer:** Every release must carry:  
  *“本材料或广告未经新加坡金融管理局 (Monetary Authority of Singapore, MAS) 审阅。”* / *“This advertisement or material has not been reviewed by the Monetary Authority of Singapore.”*

### 2.6 底层基金当月回报率取值规范：专属价格列表穿透 (Individual Fund Price List Look-Up Rule)
- **绝对准则 (Single Source of Truth for Fund Returns):**
  在生成 Slide 1 底层 7 只优选基金穿透表的“当月回报 (1M)”与 Slide 4 “信念审查决策矩阵”的月度回报时，**严禁直接使用专户总表 `HR_Model_Port_Current` 的月中结算行之间作简单相除**。
- **强制取值路径 (Mandatory Individual Tabs):**
  必须直接穿透读取 Google Sheet 云端主表中 7 只标的各自独立的专属价格列表工作表 (Working Sheets / Price Lists)：
  1. `United China A Shares Innovation A Acc SGD` (Tab 12)
  2. `FULLERTON LUX FUNDS - GLOBAL ABSOLUTE ALPHA A ACC SGD` (Tab 13)
  3. `EASTSPRING INVESTMENTS UNIT TRUSTS - GLOBAL TECHNOLOGY SGD` (Tab 14)
  4. `Janus Henderson Global Life Sciences` (Tab 15)
  5. `FSSA Asian Growth Fund (Class A)` (Tab 16)
  6. `United Gold and General A Acc SGD` (Tab 17)
  7. `Nikko AM Japan Dividend` (Tab 18)
- **月度回报计算公式 (Month-End to Month-End Formula):**
  $$\text{当月回报率 (1M)} = \frac{\text{报告月月末最后有效交易日价格 (Month-End Price)}}{\text{上月月末最后有效交易日价格 (Prior Month-End Price)}} - 1$$
- **财务逻辑与避坑原理:**
  专户总表的月初结算日（如每月 5 日）主要用于核算客户专户整体资产规模（AUM）；而底层基金当月真实表现必须以完整的自然历月（如 7月31日 至 8月31日）为基准。若从总表切片计算，月初前几天的突发暴涨或回调会被错误隔断（如 8 月大华黄金自然历月实际大涨 +24%，若从 8月5日总表切片则会被低估为 15.38%）。因此，**必须从每个基金的专属 Price List 提取月末价格计算真实月度收益率**。

---

## 3. Architecture of the 5-Slide Presentation Suite

| Slide # | Slide Title | Core Purpose & Contents |
| :--- | :--- | :--- |
| **Slide 1** | **月度投资建议备忘录 (Monthly Advisory Memorandum)** | Valuation date, multi-period performance vs MSCI ACWI & S&P 500, Alpha excess return, 7 underlying holdings table, 40-month verified NAV chart with Restructure (🟡) & Rebalance (🟢) timeline markers, monthly attribution & rebalancing notes. |
| **Slide 2** | **全球宏观脉搏与行业星级评定榜 (Macro Outlook & Sector Star Ratings)** | Top strategy callout, 9 equity & bond performance diverging bar charts (with pixel-perfect 0% ruler alignment), un-truncated US/Japan/China regional reviews from Page 6, Q4 structural themes & risks (with Gold look-through calibration), and verbatim 19-sector single-column Star Ratings table from Page 7. |
| **Slide 3** | **月度专题深度 (Feature Insight / Ideas of the Month)** | 每期备忘录的第 3 页专题必须严格提取对应参考研报（iFAST Monthly Investment Update）中的“月度精选专题 / 优选标的深度解析 (Ideas of the Month / Feature Insight)”。例如：8月备忘录（参考9月月报）对应《超越银行主导核心——主动布局“新新加坡”高成长机遇》；9月备忘录（参考10月月报）对应《当债券不再扮演债券》。全文必须为 100% 纯正专业中文，严禁夹杂任何英文标题、英文副标题或半英半中生造词（严禁出现 "Tech 新加坡"、"The observation"、"WHY WE LIKE IT" 等）。所有图表、横纵轴、图例及重仓股必须彻底汉化。若研报案例以特定区域指数对比，须在页脚清晰注明本组合全局战略基准仍严格锚定 MSCI 全球指数。 |
| **Slide 4** | **核心投资哲学与“坚守信念”复盘 (Our Philosophy & Conviction Review)** | Upper half: embedded iFAST Horizon Page 2 verbatim **OUR PHILOSOPHY** (dark teal brand banner + 6 investment principles: Diversification, Valuation-Driven, Fundamentals, Long-Term, Independent, Investors First); Lower half (compact downward ordered): 3 core investment pillars (Absolute Return 35%, High Growth 30%, Counter-Cyclical & Yield 35%), conviction review matrix (reviewed assets, monthly returns, short-term noise, fundamental support, advisory directive), and monthly rebalancing decision box. |
| **Slide 5** | **重要法律声明与风险提示 (DISCLAIMER & RISK DISCLOSURE)** | Institutional legal disclaimers under the Singapore Financial Advisers Act (FAA): general info & advisory nature only, non-discretionary advisory scope (explicit client instructions required), capital & market risks, accuracy of info & limitation of liability, Gu Haoran registration as appointed representative of Alpha Wealth Financial Advisers Pte. Ltd., and prominent MAS statutory notice. |

---

## 4. Data Extraction & Synchronization Engine

### 4.1 Master Google Sheet Structure
- **Sheet ID:** `1VXy6RGThyuQIBwYg9VF3NbWc7wXyfLFQcMGPgEf2Q4I`
- **Tab: `Calculation_Engine`**:
  - `Column B`: Date (`YYYY-MM-DD`).
  - `Column F`: Verified Cumulative NAV (`Current Model`).
  - `Column H`: S&P 500 (Same Inception, e.g. Row 69 is 171.46% = +71.46%).
  - `Column I`: MSCI ACWI (Same Inception, e.g. Row 69 is 168.67% = +68.67%).
- **Tab: `HR_Model_Port_Current`**:
  - `Column A`: Action status (`Reconstitute` / `Restructure` / `Rebalance`).
  - `Column B`: Event date (`YYYY-MM-DD`).
  - `Columns E - N`: Target vs Current weights, latest NAV, monthly return, and attribution contribution across the 7 holdings.

### 4.2 Settle Date & Reporting Cycle Anchor Logic
- In Singapore wealth advisory practice, valuations settled during the first 10 days of Month $M$ (e.g. `2026-10-05`) represent the monthly reporting cycle for Month $M-1$ (e.g. `September 2026`).
- **Benchmark Calculation Anchor:**
  - September Monthly Return compares the price on the first trading day of October (Row 69, `2026-10-05`) against the price on the first trading day of September (Row 67, `2026-09-03`).

### 4.3 Chart Reconstitution & Rebalance Markers
- Chart.js plugin dynamically extracts events from Google Sheet:
  - **Restructure / Reconstitute:** 🟡 Yellow circle (`rgba(234, 179, 8, 0.5)`), vertical timeline line, and label.
  - **Rebalance:** 🟢 Green circle (`rgba(16, 185, 129, 0.5)`).

### 4.4 Monthly Factsheet Path & Anchor Mapping
- **Local Directory:** `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\<Month_Name> <YYYY>\`
- **Anchor Rule:** Reporting Month $M$ uses Factsheets stored in Month $M+1$ folder (e.g., September 2026 Memo -> `Oct 2026` folder; October 2026 Memo -> `Nov 2026` folder).

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
