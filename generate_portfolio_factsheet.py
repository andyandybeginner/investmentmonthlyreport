# -*- coding: utf-8 -*-
"""
Standalone Portfolio Factsheet Generator (Chinese & English)
Extracts Slide 6 into an independent 1-page A4 Landscape Factsheet PDF and HTML.
"""

import os
import json
import fitz

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_standalone_factsheet(month="2026-08", date_str="2026-09-03"):
    with open(os.path.join(BASE_DIR, "src", "components", "slide6.html"), "r", encoding="utf-8") as f:
        slide6_zh = f.read()

    # English version translation mapping
    en_translations = [
        ("底层优选基金穿透透视 · 组合全景资产配置", "PORTFOLIO LOOK-THROUGH & RISK ANALYTICS"),
        ("HR 模板投资组合穿透全景分析", "HR Model Portfolio Allocation & Risk Factsheet"),
        ("8月底层透析", "August Look-Through"),
        ("9月底层透析", "September Look-Through"),
        ("分析数据基准", "VALUATION BENCHMARK"),
        ("2026年8月31日 官方Factsheets", "31 August 2026 Official Factsheets"),
        ("组合实盘年化波动率 (3Y)", "Annualised Volatility (3Y)"),
        ("vs 科技基准 23.1%", "vs Tech BM 23.1%"),
        ("组合实盘夏普比率 (Sharpe)", "Portfolio Sharpe Ratio (3Y)"),
        ("无风险率 3.0%", "Rf 3.0%"),
        ("前十大重仓集中度 (Top 10)", "Top 10 Holdings Concentration"),
        ("最大单票 3.35%", "Max Single Position 3.35%"),
        ("底层穿透证券资产总数", "Effective Underlying Securities"),
        ("380+ 只", "380+ Names"),
        ("跨越 11 个全球市场", "Across 11 Global Markets"),
        ("总体加权地理配置", "Geographical Breakdown"),
        ("组合加权穿透", "Weighted Look-Through"),
        ("其他新兴及成熟市场", "Other Emerging & Developed Markets"),
        ("总体行业穿透分布", "Sector Breakdown"),
        ("穿透权重", "Look-Through Weight"),
        ("信息技术 (Technology)", "Information Technology"),
        ("医疗保健 (Health Care)", "Health Care"),
        ("原材料与黄金采掘 (Materials & Gold)", "Materials & Mining"),
        ("通讯服务 (Communication)", "Communication Services"),
        ("金融服务 (Financials)", "Financials"),
        ("非必需消费 (Consumer Disc.)", "Consumer Discretionary"),
        ("工业制造 (Industrials)", "Industrials"),
        ("必需消费 (Consumer Staples)", "Consumer Staples"),
        ("现金及对冲 (Cash & Hedge)", "Cash & Defensive"),
        ("前十大底层重仓证券与来源基金穿透", "Top 10 Underlying Holdings & Fund Attribution"),
        ("基金加权穿透占比", "Weighted Portfolio Exposure"),
        ("证券名称", "Holding Name"),
        ("行业分类", "Sector"),
        ("穿透权重", "Weight"),
        ("主要来源基金", "Source Fund"),
        ("多周期风险与基准对比统计", "Risk & Benchmark Comparison Metrics"),
        ("关键风险指标", "Risk Metric"),
        ("当前投资组合", "Current Portfolio"),
        ("MSCI 全球基准", "MSCI ACWI"),
        ("标普 500 指数", "S&P 500"),
        ("年化波动率 (3Y)", "Annualised Vol (3Y)"),
        ("夏普比率 (3Y)", "Sharpe Ratio (3Y)"),
        ("贝塔系数 (Beta vs MSCI)", "Beta (vs MSCI)"),
        ("最大历史回撤", "Max Drawdown"),
        ("跟踪误差 (Tracking Error)", "Tracking Error"),
        ("第 6 页 · 组合底层优选基金穿透透视", "Page 1 · Portfolio Look-Through Factsheet"),
        ("数据来源：各基金管理人官方月度 Factsheets (2026年8月版) 与 Bloomberg 终端穿透加权核算。", "Sources: Fund Managers' Official Factsheets (Aug 2026) and Bloomberg Weighted Analytics."),
        ("本材料或广告未经新加坡金融管理局 (MAS) 审阅。", "This advertisement or material has not been reviewed by the Monetary Authority of Singapore.")
    ]

    slide6_en = slide6_zh
    for zh, en in en_translations:
        slide6_en = slide6_en.replace(zh, en)

    # HTML Shell
    def make_factsheet_html(content, title, lang="zh-CN"):
        return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        body {{
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            background-color: #0b1120;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }}
        .mono-num {{ font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }}
        .landscape-slide {{
            background: #ffffff;
            width: 1400px;
            height: 990px;
            margin: 1.5rem auto;
            border-radius: 1rem;
            overflow: hidden;
            border: 1px solid #cbd5e1;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }}
        @media print {{
            @page {{
                size: 297mm 210mm;
                margin: 0;
            }}
            .no-print {{ display: none !important; }}
            html, body {{
                width: 297mm !important;
                height: 210mm !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }}
            .landscape-slide {{
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100vh !important;
                border-radius: 0 !important;
            }}
        }}
    </style>
</head>
<body class="p-4">
    <!-- Standalone Action Bar (No-Print) -->
    <div class="max-w-[1400px] mx-auto mb-3 flex justify-between items-center no-print bg-slate-800/80 px-5 py-2.5 rounded-xl border border-slate-700 text-white text-xs">
        <div class="flex items-center gap-2">
            <span class="font-bold text-amber-400">HR Model Portfolio</span>
            <span class="text-slate-400">|</span>
            <span>{title}</span>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs transition">
                🖨️ 打印 / 保存为 PDF
            </button>
            <a href="/" class="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-xs transition">
                返回控制台
            </a>
        </div>
    </div>

    <!-- Standalone Slide Content -->
    {content}
</body>
</html>"""

    # Generate Chinese Standalone HTML
    zh_html = make_factsheet_html(slide6_zh, f"HR 模板投资组合 · 资产穿透全景分析与风险报告 ({month})", "zh-CN")
    zh_file = os.path.join(BASE_DIR, f"HR_Portfolio_Lookthrough_Factsheet_{month}_ZH.html")
    with open(zh_file, "w", encoding="utf-8") as f:
        f.write(zh_html)

    # Generate English Standalone HTML
    en_html = make_factsheet_html(slide6_en, f"HR Model Portfolio · Allocation & Risk Factsheet ({month})", "en")
    en_file = os.path.join(BASE_DIR, f"HR_Portfolio_Lookthrough_Factsheet_{month}_EN.html")
    with open(en_file, "w", encoding="utf-8") as f:
        f.write(en_html)

    print(f"✅ Generated Standalone Factsheet HTMLs:\n - {zh_file}\n - {en_file}")
    return {
        "zh_html": zh_file,
        "en_html": en_file
    }

if __name__ == "__main__":
    generate_standalone_factsheet()
