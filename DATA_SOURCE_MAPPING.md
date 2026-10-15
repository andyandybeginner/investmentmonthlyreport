# HR 模板投资组合 · 数据源全景映射与引用原理规范说明书
**Data Source Architecture & Dynamic Field Mapping Specification**

> **版本 (Version)**: 2026.10 生产规范版  
> **数据源定位 (Single Source of Truth)**: Google 云端主数据库 `Model Portfolio Analyst CAA20260331.gsheet`  
> **在线访问链接**: [点击打开 Google Sheet 表格](https://docs.google.com/spreadsheets/d/1VXy6RGThyuQIBwYg9VF3NbWc7wXyfLFQcMGPgEf2Q4I/edit?usp=sharing)  
> **表格唯一标识 (Spreadsheet ID)**: `1VXy6RGThyuQIBwYg9VF3NbWc7wXyfLFQcMGPgEf2Q4I`  
> **自动同步程序**: `python sync_googlesheet_to_report.py`

---

## 一、 系统架构与数据流转机制 (Architecture Overview)

```
[云端 Google Sheet 数据库]
   │  ├── Sheet: Calculation_Engine (业绩序列与基准)
   │  ├── Sheet: HR_Model_Port_Current (当前组合最新持仓、净值与权重)
   │  ├── Sheet: HR_Model_Port_Past (未重组旧组合对照组)
   │  └── Sheet: HR Model Portfolio Constitution (资产章程与ISIN)
   │
   ▼ (HTTPS API 跨域读取: gviz/tq export)
[本地同步引擎 sync_googlesheet_to_report.py]
   │
   ├──▶ 1. 结构化缓存持久化: real_performance_series.json
   │
   ▼ 2. DOM 与图表动态注入 (Direct Attribute & Chart.js Injection)
[可视化报告交付物 iFAST_Equity_Growth_Monthly_Report_Landscape.html]
   ├── Slide 1: 机构月度备忘录 (多周期业绩对比、底层7只基金穿透表、40个月真实曲线)
   ├── Slide 2: 全球宏观脉搏与行业星级评定榜 (iFAST Horizon P.6 & P.7 深度拼合)
   ├── Slide 3: 月度专题深度：当债券不再扮演债券 (学术前沿与CFP理财指引)
   ├── Slide 4: 配置逻辑剖析与“坚守信念”复盘 (资产支柱与决策审查矩阵)
   └── Slide 5: 全权委托专户服务法律声明与风险揭示 (MAS 合规免责声明)
```

---

## 二、 核心工作表字段级映射清单 (Field-Level Data Mapping)

### 1. 工作表：`Calculation_Engine`（多周期业绩走势与基准对照引擎）

本工作表是多周期综合回报率对比表、40个月真实净值走势折线图的核心底表。

* **成立日真实基准原点 (Inception Point)**：**第 29 行（Row 29，日期：2023-07-05）**。自该行起，各策略与外部基准统一归一化为 `100.00%`（即基准值 `1.0000`）。
* **当前引用有效区间**：**第 29 行 至 最末有效行（当前为第 68 行，2026-10-05）**，覆盖完整的 40 个月时间序列。

| 目标展示字段 / 图表元素 | 数据源列 (Col) | 单元格范围 / 行号规则 | 动态属性 | 计算原理与财务逻辑说明 |
| :--- | :---: | :---: | :---: | :--- |
| **时间轴标签 (X 轴)** | **A 列** | Row 29 ~ Last Row | **动态** | 提取年月字符串（如 `2023-07`, `2023-08` ... `2026-10`），用于 Chart.js 横坐标。 |
| **当前组合净值曲线 (红色实线)** | **F 列** | Row 29 ~ Last Row | **动态** | 主动重组优化后的组合净值累计走势。成立日归一为 `100%`，当前最新值（Row 68）为 `181.16%`（净增长 `+81.16%`）。 |
| **过去组合净值曲线 (蓝色虚线)** | **G 列** | Row 29 ~ Last Row | **动态** | **旧组合未重组对照组（Counterfactual Control）**。当前最新值为 `189.08%`（净增长 `+89.08%`）。<br>*使用原理*：向客户呈现“若不实施主动调仓”的收益偏离度，直观展现主动管理与防御波动的资产配置价值。 |
| **标普 500 指数 (黑色虚线)** | **H 列** | Row 29 ~ Last Row | **动态** | **S&P 500（同成立日，新币计价）**。成立日归一为 `100%`，当前最新值（Row 68）为 `171.46%`（累计收益 `+71.46%`）。 |
| **MSCI 全球指数 (灰色虚线)** | **I 列** | Row 29 ~ Last Row | **动态** | **MSCI ACWI 全球指数（同成立日，新币计价）**。成立日归一为 `100%`，当前最新值（Row 68）为 `168.67%`（累计收益 `+68.67%`）。 |
| **超额净阿尔法 (Alpha)** | 计算值 | 公式计算 | **动态** | 严谨定义为：$\text{Alpha} = \text{当前组合累计收益} - \text{MSCI全球指数累计收益}$。<br>当前最新值为：$81.16\% - 68.67\% = \mathbf{+12.49\%}$。 |

#### 多周期回报率在 `Calculation_Engine` 中的精确行级推算公式 (Multi-Period Formulas)

> 💡 **核心业务逻辑：月初第 1 个交易日结算与月度回溯原理 (Monthly Back-Tracing Principle)**  
> * 工作表中的每个结算日期均为**每月第 1 个交易日**（如 Row 67 为 `2026-09-03`，Row 68 为 `2026-10-05`）。
> * **为什么回溯的是 9 月？** 10 月第 1 个交易日（`2026-10-05`）的估值价格，实际上核算并锁定了 **9 月整月** 的资产收益终值；而 9 月第 1 个交易日（`2026-09-03`）的价格则是 9 月的起始基准。
> * 因此，**当月（9月）回报率** 严格使用：  
>   $$\text{9月当月回报率} = \frac{\text{Row 68（10月第1个交易日价格）}}{\text{Row 67（9月第1个交易日价格）}} - 1$$
> * 这也是为什么报告右上角结算日显示为 `2026-10-05`，而报告主徽章与表头必须定名为 **`9月备忘录`** 及 **`当月（2026年9月）`** 的合规财务依据。

以最新结算行 **Row 68 (2026-10-05)** 为基准点，各周期的比较基期及精确计算结果如下：

| 周期 (Tenor) | 比较基期 (Base Row & Date) | 当前组合 (Col F) | 未重组对照组 (Col G) | 标普 500 (Col H) | MSCI 全球 (Col I) | 超额 Alpha (vs MSCI) | 算法公式 | 业务含义 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **当月 (9月)** | **Row 67** (2026-09-03) | **-1.21%** | **+1.37%** | **+1.16%** | **-0.03%** | **-1.18%** | $\frac{\text{Row 68}}{\text{Row 67}} - 1$ | 10月首个交易日 vs 9月首个交易日，锁定9月整月表现 |
| **3个月** | **Row 65** (2026-07-03) | **-5.12%** | **-0.71%** | **+4.61%** | **+3.64%** | **-8.77%** | $\frac{\text{Row 68}}{\text{Row 65}} - 1$ | 覆盖 7月、8月、9月三个完整月份 |
| **1年** | **Row 56** (2025-10-03) | **+16.93%** | **+18.55%** | **+13.53%** | **+15.43%** | **+1.50%** | $\frac{\text{Row 68}}{\text{Row 56}} - 1$ | 过去 12 个完整历月表现 (2025年10月至2026年9月) |
| **3年 (年化)** | **Row 29** (2023-07-05) | **+20.06%** | **+21.65%** | **+18.05%** | **+17.45%** | **+2.61%** | $(\frac{\text{Row 68}}{\text{Row 29}})^{1 / 3.25} - 1$ | 成立以来 39 个月 (3.25年) 几何年化复合收益率 |
| **累计收益** | **Row 29** (2023-07-05) | **+81.16%** | **+89.08%** | **+71.46%** | **+68.67%** | **+12.49%** | $\text{Row 68} - 100.00\%$ | 自 2023-07-05 成立日以来真实净资产增长倍数 |

---

### 2. 工作表：`HR_Model_Port_Current`（当前组合持仓与动态权重）

本工作表记录组合专户的每期持仓明细、基金市值与动态比重。

* **当前有效数据行 (Latest Snapshot Row)**：**B 列非空的最后一行（当前为第 41 行，结算日 2026-10-05）**。

| 目标展示字段 / HTML 位置 | 数据源列 (Col) | 取值规则 / 对应行 | 动态属性 | 计算原理与业务逻辑说明 |
| :--- | :---: | :---: | :---: | :--- |
| **重组/再平衡状态标签 (Status)** | **A 列** | Row 2 ~ 最末行 | **动态** | 记录组合在生命周期内的重大资产调仓事件：<br>• **`Reconstitute` / `Restructure`**：在净值图时间轴与红色实线交叉点标注 **50% 透明度黄色圆圈 (Yellow Circle)** 并展示 `Restructure` 标签。<br>• **`Rebalance`**：在时间轴交叉点标注 **50% 透明度绿色圆圈 (Green Circle)** 并展示 `Rebalance` 标签。<br>*当前历史发生行*：Row 2 (`2023-07-05` 成立建仓)、Row 26 (`2025-07-03` 结构重组)、Row 32 (`2026-01-05` 优选重组为当前7只标的)。 |
| **计算结算日期 (Settle Date)** | **B 列** | 最末行 (Row 41) | **动态** | 最新结算日期（当前为 `2026-10-05`）。 |
| **报告期月份联动 (Month Derivation)** | **B 列** | 基于结算日推算 | **动态** | *推算业务逻辑*：月度结算通常在次月前 10 个工作日内完成（如 10月5日结算对应 9月整月行情），前端程序自动将其解析为 **`9月备忘录`** 及表头 **`当月（2026年9月）`**。 |
| **底层 7 只基金官方全称** | **C 至 J 列** | Row 1 (或 Row 2) | **动态** | 穿透底层优选标的，依次对应：中国创新、富敦阿尔法、瀚亚科技、骏利医疗、大华黄金、首域亚洲、日兴日本。严格使用官方英文注册原名。 |
| **基金当期最新市值 (Value)** | **K 至 R 列** | 最末行 (Row 41) | **动态** | 各基金在专户中的实际持有市值（如富敦: `$63,576.95`，瀚亚: `$31,513.58`，大华黄金: `$23,960.69` 等）。 |
| **专户总资产规模 (Total S)** | **S 列** | 最末行 (Row 41) | **动态** | 组合总市值加总合计（当前为 **`$181,160.09 SGD`**）。 |
| **当前实际权重 (%)** | 计算值 | **$K/S$ 至 $Q/S$** | **动态计算** | **严格按照市值占比计算**：<br>$\text{当前权重}_i = \frac{\text{Col } (K+i-1)}{\text{Col S}} \times 100\%$。<br>当前计算值：富敦 `35.09%`、瀚亚 `17.40%`、骏利 `14.17%`、黄金 `13.23%`、中国 `12.24%`、亚洲 `4.00%`、日本 `3.87%`。 |
| **目标配置权重 (%)** | **AC 至 AJ 列** | 最末行 (Row 41) | **动态** | 组合战略基准配置比重：<br>富敦 `35.00%`、瀚亚 `15.00%`、骏利 `15.00%`、黄金 `15.00%`、中国 `12.00%`、亚洲 `4.00%`、日本 `4.00%`（加总 `100.0%`）。 |
| **当月回报率 (1M Return)** | **独立工作表** | 各基金专属 Tab | **动态** | **严格从底层基金专属价格列表 (Price List Tabs) 取值**：详见下方 2.1 节。 |

---

### 2.1 底层 7 只基金专属价格列表工作表 (Individual Fund Price List / Working Sheets)

为真实反映底层标的当月的投资收益率，**严禁使用专户总表 `HR_Model_Port_Current` 月中结算日直接相除**（月中切片常因月初数天的提前拉升或回调导致收益率失真，如 8 月大华黄金总表切片仅显示 +15.38%，而自然整月实际大涨 +23.70% ~ +24.00%）。

**底层 7 只基金专属 Tab 映射清单：**

| 序号 | 基金名称 | 专属工作表名称 (Sheet Tab Name) | 对应 Tab 索引 | 关键数据列 |
| :---: | :--- | :--- | :---: | :--- |
| **1** | 中国创新 | `United China A Shares Innovation A Acc SGD` | Tab 12 | A 列 (Date), B 列 (Price), C 列 (Change), D 列 (Change %) |
| **2** | 全天候底仓 | `FULLERTON LUX FUNDS - GLOBAL ABSOLUTE ALPHA A ACC SGD` | Tab 13 | A 列 (Date), B 列 (Price), C 列 (Change), D 列 (Change %) |
| **3** | 科技成长 | `EASTSPRING INVESTMENTS UNIT TRUSTS - GLOBAL TECHNOLOGY SGD` | Tab 14 | A 列 (Date), B 列 (Price), C 列 (Change), D 列 (Change %) |
| **4** | 生命科学 | `Janus Henderson Global Life Sciences` | Tab 15 | A 列 (Date), B 列 (Price), C 列 (Change), D 列 (Change %) |
| **5** | 亚洲主题 | `FSSA Asian Growth Fund (Class A)` | Tab 16 | A 列 (Date), B 列 (Price), C 列 (Change), D 列 (Change %) |
| **6** | 黄金对冲 | `United Gold and General A Acc SGD` | Tab 17 | A 列 (Date), B 列 (Price), C 列 (Change), D 列 (Change %) |
| **7** | 日本高息 | `Nikko AM Japan Dividend` | Tab 18 | A 列 (Date), B 列 (Price), C 列 (Change), D 列 (Change %) |

#### 当月回报率 (1M Return) 严格算法与核算原则：
* **月末对月末基准 (Month-End to Month-End)**：
  $$\text{当月回报率 (1M)} = \frac{\text{报告月月末最后有效交易日价格 (Month-End Price)}}{\text{上月月末最后有效交易日价格 (Prior Month-End Price)}} - 1$$
* **实操示例（以 8 月份备忘录大华黄金为例）**：
  * 在 Tab 17 `United Gold and General A Acc SGD` 中：
    * 2026年7月末（2026-07-30，Row 51）：价格为 **`$3.7522`**
    * 2026年8月末（2026-08-31，Row 30）：价格为 **`$4.6416`**（2026-08-30 为 **`$4.7367`**）
    * 真实月度涨幅：$\frac{\$4.6416}{\$3.7522} - 1 = \mathbf{+23.70\% \approx +24.00\%}$。

---

### 3. 工作表：`HR_Model_Port_Past`（未重组旧组合对照组）

* **数据结构**：与 `HR_Model_Port_Current` 100% 结构一致，但底层持仓保留了重组前历史资产（包含旧版美股标的与金融配置）。
* **使用原理**：用于在 `Calculation_Engine` G 列中生成不重组的假想对照净值，用以测算主动管理带来的风险收益偏离。

---

### 4. 工作表：`HR Model Portfolio Constitution`（组合宪章与基础信息）

* **第 3 至 10 行**：
  * **C 列 (Sector)**：所属功能板块（China, Discretionary Global Equity, Growth Sector Tech, Defensive Healthcare, Gold, Thematic 等）。
  * **D 列 (ISIN)**：基金国际证券识别码（如 `SGXZ49509284`, `LU2264538146`, `SG9999002291` 等）。
  * **E 列 (Fund Name)**：基金全称。
  * **I 列 (Weight%)**：宪章规定的战略目标权重（35%, 15%, 15%, 15%, 12%, 4%, 4%）。

---

### 5. 外部权威研报数据源：`iFAST Horizon 2026年10月刊`

* **第 6 页 (Page 6)**：
  * **Chart 1 全球重点资产回报**：美股 S&P 500 (-0.78% / 纳指 +1.74%)、日本日经 (+0.52%)、中国 MSCI (-4.81%)、全球债 (-2.48%)、亚洲投资级债 (-2.05%)。
  * **三大核心市场速评**：美联储首度重启加息25bps、日央行加息至 1.25%（31年新高）、中国9月29日大礼包。
* **第 7 页 (Page 7)**：
  * **Q4 核心定见 (Our Recommendation)**：战略持续超配亚洲、固收防守短久期与高等级债。
  * **三大核心结构性驱动**：AI 硬件超级周期拓宽、中东海峡阻塞与柴油精炼瓶颈、审慎防守边界。
  * **iFAST 官方全行业吸引力星级榜 (Sector Star Ratings)**：
    * 极具吸引力 (★★★★½ ~ ★★★★)：亚洲半导体、新加坡、韩台、亚太除日本；
    * 具备吸引力 (★★★½ ~ ★★★)：恒生科技、中国A股、数字经济、日本；
    * 中性配置 (★★½)：全球医疗健康；
    * 审慎低配 (★★)：美股宽基、欧洲、印度。

---

## 四、 底层基金官方 Factsheet 存储与月份映射规范 (Monthly Factsheet Directory Mapping)

在对组合进行月度穿透归因、资产特征校验及撰写投资建议时，必须严格比对当月最新的底层基金官方 Factsheet。

### 1. 本地挂载路径规则 (Mounted Google Drive Path Convention)
所有官方基金 Factsheet 统一存放在 Google Drive 本地挂载磁盘路径中：
```
G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\<Month_Name> <YYYY>\
```

### 2. 报告期与 Factsheet 文件夹对应逻辑 (Monthly Anchor Logic)
| 撰写报告期 (Memo Reporting Period) | 结算与下载执行月份 (Execution / Settle Month) | Factsheet 存放文件夹绝对路径 |
| :--- | :--- | :--- |
| **9 月份备忘录 (September Memo)** | 10 月初下载与结算 | `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\Oct 2026\` |
| **10 月份备忘录 (October Memo)** | 11 月初下载与结算 | `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\Nov 2026\` |
| **11 月份备忘录 (November Memo)** | 12 月初下载与结算 | `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\Dec 2026\` |
| **月份 $M$ 备忘录** | 次月 $M+1$ 结算下载 | `...\3. Monthly Report\<Month M+1> <YYYY>\` |

### 3. 当前 7 只底层基金最新 Factsheet 清单与穿透校验 (Oct 2026 示例)
1. `United China A Shares Innovation A Acc SGD_Factsheet_UOB124.pdf` (大华中国A股创新)
2. `FULLERTON LUX FUNDS - GLOBAL ABSOLUTE ALPHA A ACC SGD_Factsheet_FUL048.pdf` (富敦全球绝对阿尔法)
3. `EASTSPRING INVESTMENTS UNIT TRUSTS - GLOBAL TECHNOLOGY SGD_Factsheet_PPGTFS.pdf` (瀚亚全球科技)
4. `Janus Henderson Global Life Sciences_Factsheet_HEN038.pdf` (骏利亨德森全球生命科学)
5. `United Gold and General A Acc SGD_Factsheet_370051.pdf` (大华黄金及综合)  
   * **穿透真实配置验证**：Factsheet 显示其行业分布中 `Gold 72.08%`、`Diversified Metals 6.85%`、`Silver 6.54%`、`Cash 3.15%` 等。组合设定目标配置 15%，穿透后纯黄金敞口为 $15\% \times 72.08\% = \mathbf{10.81\%}$，既提供了商品抗通胀属性，又与研报 10% 避险上限严格对齐。
6. `FSSA Asian Growth Fund (Class A)_Factsheet_370046.pdf` (首域亚洲成长)
7. `Nikko AM Japan Dividend_Factsheet_DBS013.pdf` (日兴日本高股息)

---

## 五、 数据自动化同步操作指引 (Operator Manual)

未来若在 Google Sheet 云端更新了基金净值或结算了新的一月：

1. **一键同步命令**：
   在终端或控制台中运行：
   ```bash
   python sync_googlesheet_to_report.py
   ```
2. **自动化执行链路**：
   - 脚本通过 Google Visualization API 实时拉取最新 `Calculation_Engine` 与 `HR_Model_Port_Current`；
   - 自动重新计算各基金真实比重（$K/S$）及累计收益；
   - 自动更新本地 `real_performance_series.json`；
   - 自动更新 `iFAST_Equity_Growth_Monthly_Report_Landscape.html` 中的 Chart.js 数据集、图例与报告月份；
3. **刷新查验**：
   在浏览器中按 `Ctrl + F5` 强制刷新网页，即可瞬间完成全套 5 页横版演示交付物的月度轮转。

