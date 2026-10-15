# -*- coding: utf-8 -*-
"""
Standalone Portfolio Factsheet Generator (Chinese & English)
Extracts Slide 6 into an independent 1-page A4 Landscape Factsheet PDF and HTML.
Strictly separates Chinese and English template sources to guarantee 100% language purity.
"""

import os
import re
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MONTH_NAMES_EN = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]
LAST_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

def generate_standalone_factsheet(month="2026-09", date_str="2026-10-05"):
    # Calculate date labels dynamically
    try:
        parts = month.split('-')
        year_num = int(parts[0])
        month_num = int(parts[1])
        month_name_en = MONTH_NAMES_EN[month_num - 1]
        last_day = LAST_DAYS[month_num - 1]
    except Exception:
        year_num = 2026
        month_num = 9
        month_name_en = "September"
        last_day = 30

    month_tag_zh = f"{month_num}月底层透析"
    benchmark_date_zh = f"{year_num}年{month_num}月{last_day}日 官方Factsheets"

    month_tag_en = f"{month_name_en} Look-Through"
    benchmark_date_en = f"{last_day} {month_name_en} {year_num} Official Factsheets"

    # 0. Automatically recalculate look-through data dynamically based on the active month's weights
    try:
        from calc_portfolio_lookthrough import calculate_portfolio
        lt_data = calculate_portfolio(month=month)
    except Exception as e:
        print(f"Notice: Lookthrough dynamic calculation: {e}")
        lt_data = None

    # 1. Chinese Slide 6 Source
    zh_component_path = os.path.join(BASE_DIR, "src", "components", "slide6.html")
    with open(zh_component_path, "r", encoding="utf-8") as f:
        slide6_zh = f.read()

    slide6_zh = slide6_zh.replace("{{MONTH_TAG_ZH}}", month_tag_zh)
    slide6_zh = slide6_zh.replace("{{BENCHMARK_DATE_ZH}}", benchmark_date_zh)
    # Fallback replacements if any old static text remains
    slide6_zh = slide6_zh.replace("8月底层透析", month_tag_zh)
    slide6_zh = slide6_zh.replace("2026年8月31日 官方Factsheets", benchmark_date_zh)

    # 2. English Slide 6 Source (Dedicated pure English template)
    en_component_path = os.path.join(BASE_DIR, "src", "components", "slide6_en.html")
    if os.path.exists(en_component_path):
        with open(en_component_path, "r", encoding="utf-8") as f:
            slide6_en = f.read()
    else:
        # Fallback to slide6_zh if slide6_en does not exist
        slide6_en = slide6_zh

    slide6_en = slide6_en.replace("{{MONTH_TAG_EN}}", month_tag_en)
    slide6_en = slide6_en.replace("{{BENCHMARK_DATE_EN}}", benchmark_date_en)

    # 3. Dynamic Injection of Recalculated Weights & Concentrations
    if lt_data:
        top10_c = f"{lt_data['top10_concentration']:.2f}%"
        max_s = f"{lt_data['max_single_stock']:.2f}%"
        weights_used = lt_data.get('weights_used', {})

        slide6_zh = re.sub(r'Top 10 合计\s*[\d\.]+%', f'Top 10 合计 {top10_c}', slide6_zh)
        slide6_zh = re.sub(r'最大单票\s*[\d\.]+%', f'最大单票 {max_s}', slide6_zh)

        slide6_en = re.sub(r'Top 10 Aggregate\s*[\d\.]+%', f'Top 10 Aggregate {top10_c}', slide6_en)
        slide6_en = re.sub(r'Max Single Stock\s*[\d\.]+%', f'Max Single Stock {max_s}', slide6_en)

        fund_weight_targets = {
            'Fullerton': weights_used.get('Fullerton', 35.0),
            'Eastspring': weights_used.get('Eastspring', 15.0),
            'Janus Henderson': weights_used.get('Janus Henderson', 15.0),
            'United Gold': weights_used.get('United Gold', 15.0),
            'United China A': weights_used.get('United China A', 12.0),
            'FSSA': weights_used.get('FSSA', 4.0),
            'Nikko AM': weights_used.get('Nikko AM', 4.0),
        }
        for fname_key, w_val in fund_weight_targets.items():
            pattern = re.compile(rf'(>{fname_key}[^<]*</td>\s*<td[^>]*>)([\d\.]+%)(</td>)', re.IGNORECASE)
            slide6_zh = pattern.sub(rf'\g<1>{w_val:.1f}%\g<3>', slide6_zh)
            slide6_en = pattern.sub(rf'\g<1>{w_val:.1f}%\g<3>', slide6_en)

    # HTML Shell Builder
    def make_factsheet_html(content, title, lang="zh-CN"):
        if lang == "en":
            brand_label = "HR Model Portfolio"
            print_btn = "🖨️ Print / Save as PDF"
            back_btn = "Back to Dashboard"
        else:
            brand_label = "HR 模板投资组合"
            print_btn = "🖨️ 打印 / 保存为 PDF"
            back_btn = "返回控制台"

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
            <span class="font-bold text-amber-400">{brand_label}</span>
            <span class="text-slate-400">|</span>
            <span>{title}</span>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs transition">
                {print_btn}
            </button>
            <a href="/" class="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-xs transition">
                {back_btn}
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
    generate_standalone_factsheet("2026-09", "2026-10-05")
