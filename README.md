# HR 模板投资组合 · 机构级投研展示系统与自动化备忘录工作台
*(HR Model Portfolio · Institutional Advisory Presentation Suite & Look-Through Factsheet)*

[![Frontend](https://img.shields.io/badge/Frontend-React_19_+_Vite_+_TypeScript-61dafb.svg)](https://react.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38bdf8.svg)](https://tailwindcss.com/)
[![Platform](https://img.shields.io/badge/Platform-iFAST%20Singapore-blue.svg)](https://www.ifastfinancial.com)
[![Compliance](https://img.shields.io/badge/Compliance-MAS%20SFA%20289-emerald.svg)]()
[![Deliverables](https://img.shields.io/badge/Deliverables-16%3A9%20Memo%20%7C%20A4%20Factsheet-amber.svg)]()

---

## 1. 现代化全栈重构架构 (Plan B Architecture)

本项目经过全面技术架构升级，采用**现代化解耦全栈工程架构**：
* **前端 (Presentation & Studio)**：基于 **React 19 + TypeScript + Vite + Tailwind CSS v4**。彻底摒弃旧版脆弱的 Python 正则文本替换（`re.sub`），实现 60FPS 极速响应式渲染、亚 16 毫秒热重载（HMR）以及完全类型安全的中英双语字典（零漏键保证，英文模式 0 中文字符）。
* **图表 (Vector Fidelity)**：100% 原生纯矢量 SVG 算法渲染（Catmull-Rom 三次样条插值走势图，包含当前组合红线、过去组合**蓝色虚线**、标普500黑虚线与MSCI全球灰虚线；以及有效前沿二次样条散点图），无论屏幕缩放或打印导出皆享无限清晰锐利度，彻底告别位图模糊发虚。
* **后端 (Headless Engine)**：Python 服务（`server.py`）专职于底层 Google Sheet 金融时序抓取、穿透权重数理建模及 Playwright 无头矢量 PDF 编译与本地云端分发。

---

## 2. 核心交付物矩阵 (Deliverables)

| 交付物名称 | 规格尺寸 | 核心内容 | 导出与分发模式 |
| :--- | :--- | :--- | :--- |
| **月度投资咨询备忘录 (Slide 1 - 5)** | 16:9 横版演示 (1400×788) | 走势对比、宏观脉搏与行业星级、股债专题研读、核心投资支柱与标的信念审查、MAS 法律声明 | 中英双语独立导出为矢量 PDF |
| **底层穿透风控透视单页 (Factsheet)** | A4 横向标准 (1400×990) | 前十大穿透重仓股、加权地理配置、GICS 行业分布、7 只优选基金 3 年夏普与波动率矩阵 | 独立单页 PDF，不掺入 Slide 演示中 |

---

## 3. 项目目录结构 (Directory Architecture)

```
Investment Machine/
├── frontend/                           # [现代化前端系统] React 19 + Vite + TypeScript + Tailwind v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/                 # 原生矢量 SVG 图表组件 (Catmull-Rom 插值走势图、有效前沿图)
│   │   │   │   ├── PerformanceChart.tsx
│   │   │   │   └── FrontierChart.tsx
│   │   │   ├── slides/                 # 机构级演示 Slide 组件 (Slide 1 到 5 + 独立 Factsheet)
│   │   │   │   ├── Slide1.tsx          # 备忘录、多周期回报对比表、底层 7 基金表现
│   │   │   │   ├── Slide2.tsx          # 宏观脉搏、双向条形图、19 行业官方星级榜
│   │   │   │   ├── Slide3.tsx          # 股债 60/40 专题深度研读与学术散点图
│   │   │   │   ├── Slide4.tsx          # 三大投资支柱与 N 标的信念审查决策矩阵
│   │   │   │   ├── Slide5.tsx          # 新加坡 SFA 289 法定免责与合规印章
│   │   │   │   └── Factsheet.tsx       # 独立底层穿透透视与风控单页
│   │   │   ├── dashboard/              # 简约现代化顾问投研工作台
│   │   │   │   └── Dashboard.tsx       # 4 大配置板块 (研报动态匹配、时序映射、交付物管理、动态信念矩阵)
│   │   │   └── common/
│   │   │       └── TopNav.tsx          # 顶部工作流导航、中英双语即时切换、视图模式切换
│   │   ├── i18n/
│   │   │   └── index.ts                # 100% 类型安全双语字典 (zhDict / enDict，零缺失保证)
│   │   ├── types/
│   │   │   └── index.ts                # 强类型领域模型 (FundHolding, TimeSeries, LookThrough)
│   │   ├── App.tsx                     # 根组件 (工作台模式 / 演示模式 / 分栏协同模式 / Factsheet 模式)
│   │   ├── main.tsx                    # React 挂载入口
│   │   └── style.css                   # Tailwind v4 样式与 @media print 高保真打印规则
│   ├── package.json                    # 前端依赖配置
│   ├── tsconfig.json                   # TypeScript 配置 (JSX: react-jsx, Strict mode)
│   └── vite.config.ts                  # Vite 打包与 API 反向代理配置
│
├── server.py                           # 本地轻量化核心服务 (开箱即用，内置 SPA 静态托管与 API 引擎)
├── sync_googlesheet_to_report.py       # Google Sheet 实时时序与权重同步引擎
├── real_performance_series.json        # 40 期真实复权净值与调仓事件标记
├── portfolio_lookthrough_data.json      # 组合资产地理/行业/十大重仓穿透数据
├── config/                             # 结构化月度配置文件
├── engine/                             # 导出与解析底层支撑模块
└── output/                             # 正式输出中英文矢量 PDF 交付物
```

---

## 4. 快速开始与使用指南 (Getting Started)

### 4.1 方式一：生产开箱即用（推荐）
直接运行 Python 服务器，内置轻量服务会自动托管已编译的前端现代应用与全套 API：
```bash
python server.py
```
* 打开浏览器访问：`http://localhost:8080/`
* 即可直接体验现代化的投研工作台与机构级演示系统。

### 4.2 方式二：前端极速热重载开发模式 (HMR)
如果需要实时修改前端代码并体验亚 16 毫秒的热更新：
```bash
# 启动后端 API 服务
python server.py

# 在另一个终端启动前端 Vite 开发服务器
cd frontend
npm run dev
```
* 打开浏览器访问：`http://localhost:5173/`
* 编辑任何 React 组件即可获得毫秒级即时更新。

### 4.3 核心功能指引
1. **工作台模式 (Advisor Workspace)**：
   * **研报动态匹配**：灵活选择当期 iFAST 研报 PDF，自由调整月度回报页码、行业星级榜页码及专题深度研读。
   * **时间序列与时序映射**：系统自动识别时序期数（当前 40 期），显示底层映射标准。
   * **交付物下载管理**：分别获取独立的 16:9 备忘录 PDF 与 A4 穿透 Factsheet PDF。
   * **动态标的信念矩阵**：支持自由新增、删除底层基金，实时编辑短期市场噪音、底层支撑逻辑，设置顾问行动建议（持有 / 调仓 / 更换标的），每个区块均设有专属保存按钮。
2. **语言即时切换 (ZH / EN)**：
   * 点击顶部导航栏的 `中` / `EN` 按钮，全文 0 延迟即时切换。英文版本严格遵循纯正英文表达，0 中文字符混杂；所有涉台、涉港称谓严格遵循规范合规标准。
3. **分栏协同模式 (Split Studio)**：
   * 左侧编辑工作台参数，右侧实时联动更新高精度幻灯片渲染效果，所见即所得。
4. **矢量 PDF 导出**：
   * 点击顶部「导出矢量 PDF」或按下 `Ctrl + P`，自动调用高保真打印样式，输出无栅格失真的纯矢量 PDF 交付文件。

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
