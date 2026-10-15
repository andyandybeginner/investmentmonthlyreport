# HR 模板投资组合 · 投研工作流与月度备忘录自动化引擎
*(HR Model Portfolio · Institutional Monthly Advisory Presentation Suite)*

[![Platform](https://img.shields.io/badge/Platform-iFAST%20Singapore-blue.svg)](https://www.ifastfinancial.com)
[![Regulatory Standard](https://img.shields.io/badge/Compliance-MAS%20SFA%20289-emerald.svg)]()
[![Output Formats](https://img.shields.io/badge/Formats-A4%20Landscape%20PDF%20%7C%20Interactive%20HTML-amber.svg)]()

---

## 1. 系统架构与定位 (Overview)

本项目为 **HR 模板投资组合（全股票高增长引擎 / All-Equity High Growth）** 的全自动化月度投资咨询备忘录生产与投研归因流水线。
根据新加坡金管局（MAS）及《证券与期货法 2001》（SFA 289）合规标准，本备忘录定位为面向高净值客户的**机构级投资咨询建议备忘录**。

---

## 2. 核心合规与执行 SOP 红线 (Standing Principles)

1. **基准统一性原则 (Benchmark Consistency)**：
   * 本组合全局战略对标基准严格为 **MSCI ACWI（MSCI 全球指数）** 与 **标普 500 指数**。
2. **底层基金月度收益率穿透规则 (Single Source of Truth)**：
   * 严禁直接使用专户主表月中切片数据计算收益率；必须穿透各自独立的 **Price List 工作表（Tab 12 - 18）**，以自然历月末收盘价计算真实自然月 1M 收益率（如大华黄金 8 月自然月真实收益率为 **+24.00%**）。
3. **第 3 页专题动态锚定原则 (Dynamic Feature Insight)**：
   * 每一期备忘录第 3 页必须动态提取对应参考研报（*iFAST Monthly Investment Update*）的月度精选专题：
     * **8月份备忘录**：提取 9月研报 P.5-6《超越银行主导核心——主动布局“新新加坡”高成长机遇》；
     * **9月份备忘录**：提取 10月研报 P.12《当债券不再扮演债券》；
   * 全文必须为 **100% 纯正专业中文**，严禁中英文混杂。
4. **黄金资产穿透校准 (Gold Look-Through)**：
   * 大华黄金配置目标 15%，底层仅 72.08% 为纯黄金相关资产，穿透后实际纯黄金敞口为 **10.46%**，严格吻合研报 10% 避险上限。

---

## 3. 项目目录结构 (Directory Architecture)

```
Investment Machine/
├── .gitignore                          # Git 忽略配置
├── README.md                           # 本项目完整技术与 SOP 文档
├── SKILL.md                            # 固化标准化操作规程 (SOP 2.0)
├── DATA_SOURCE_MAPPING.md              # 底层数据结构与字段映射字典
├── server.py                           # 本地控制台服务 (零第三方依赖，内置 HTTP 服务)
│
├── app/                                # 本地控制台前端
│   └── index.html                      # 落地页与协同定见输入面板
│
├── src/                                # 模块化幻灯片组件 (Slide 1 - Slide 6)
│   ├── components/
│   │   ├── top_nav.html                # 顶部导航、画笔批注与导出栏
│   │   ├── slide1.html                 # Slide 1 备忘录、多周期对比、持仓表、净值走势
│   │   ├── slide2.html                 # Slide 2 宏观脉搏、9大类资产走势、19行业星级榜
│   │   ├── slide3.html                 # 9月专题：当债券不再扮演债券 (2D散点图)
│   │   ├── slide3_august.html          # 8月专题：主动布局“新新加坡”高成长机遇
│   │   ├── slide4.html                 # Slide 4 核心投资哲学与坚守信念审查矩阵
│   │   ├── slide5.html                 # Slide 5 新加坡 SFA 289 法定声明与 MAS 免责
│   │   └── slide6.html                 # Slide 6 组合穿透透视与风控矩阵 (10地区/8行业/Top10/夏普比率)
│   ├── data/
│   │   └── i18n.js                     # 双语对照字典
│   └── js/
│       └── main.js                     # 图表绘制与交互事件
│
├── config/                             # 月度动态配置文件与顾问先验定见
│   └── config_2026_08.json             # 8月份备忘录动态数据与顾问输入
│
├── data/                               # 缓存时间序列与穿透数据
│   ├── real_performance_series.json   # 39个月真实复权净值与调仓事件标记
│   └── portfolio_lookthrough_data.json # 组合资产地理/行业/十大重仓与风控指标
│
├── engine/                             # 自动化核心引擎
│   ├── report_generator.py             # 跨月份统一报告与穿透编译生成器 (矢量SVG图表)
│   ├── exporter.py                     # Playwright 2x Retina 矢量 PDF 导出与云端自动同步
│   └── pdf_section_matcher.py          # 官方研报智能章节动态定位匹配器
│
└── output/                             # 正式输出交付文件 (中英双语备忘录与独立Factsheet)
```

---

## 4. 快速开始与本地部署 (Quick Start)

### 4.1 启动本地落地页控制台
本项目内置开箱即用的轻量级服务，**无需安装任何庞大 Web 框架**：
```bash
python server.py
```
终端输出：
```
🚀 Investment Advisory Control Panel running at: http://localhost:8080
📄 Report Live Preview available at: http://localhost:8080/preview
```
* 打开浏览器访问 `http://localhost:8080` 进入可视化管理中心。

### 4.2 核心操作流程
1. **录入顾问前置定见**：在落地页「3. 顾问专属定见与月度归因协同工作区」输入您的宏观观点或调整调仓决策，点击「保存定见设定」。
2. **极速编译预览**：点击「⚡ 极速编译 HTML」，耗时 **< 50 毫秒**，直接在浏览器中实时刷新预览，避免反复启动无头浏览器。
3. **导出正式 PDF**：确认无误后点击「导出官方高分 A4 PDF 并同步云端」，Playwright 自动完成 297mm × 210mm A4 横向打印并无缝同步至本地 Google Drive 挂载目录：
   `G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\`

---

## 5. 性能优化与提速原理解析

| 痛点 | 之前机制 | 本次架构优化 | 提速效果 |
| :--- | :--- | :--- | :--- |
| **代码修改繁琐** | 单一 1,300+ 行 Python 脚本硬编码巨型 HTML 字符串 | **数据与模板彻底解耦**：动态数据入 JSON，静态框架入组件 | 代码体积压缩 85%，维护极轻松 |
| **预览渲染缓慢** | 每次修改哪怕一个字，都启动 Playwright Chromium（6~10秒） | **浏览器本地即时预览**（通过 `http://localhost:8080/preview`） | **耗时从 10 秒降为 0.05 秒**（即时刷新） |
| **格式与排版风险** | 字符转义容易导致 `{{}}` 语法冲突 | 模块化组件与标准参数插槽 | 零语法逃逸风险，稳定性 100% |

---

## 6. 开发者与授权

* **主理人**: 顾浩然 (Gu Haoran)
* **执业身份**: 雅柏财富代表 (Appointed Representative of Alpha Wealth Financial Advisers Pte. Ltd.)
* **监管体系**: 新加坡证券期货法 (SFA Cap. 289)
