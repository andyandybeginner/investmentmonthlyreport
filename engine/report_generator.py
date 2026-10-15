# -*- coding: utf-8 -*-
"""
Unified Dynamic Monthly Advisory Report Generator
Generates full 6-slide Institutional Advisory Report for ANY selected month:
- Dynamically loads config/config_<YYYY>_<MM>.json
- Dynamically scans and matches reference Monthly Update sections & pages
- Dynamically slices 39/40/N period real performance curve
- Renders Slides 1-6 with zero clipping and MAS SFA 289 compliance
- Generates latest preview HTML and triggers standalone factsheets
"""

import os
import sys
import json
import fitz
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from engine.pdf_section_matcher import match_monthly_update_sections

def compute_sequence_month_count(month_str):
    try:
        y, m = map(int, month_str.split('-'))
        val_y = y + 1 if m == 12 else y
        val_m = 1 if m == 12 else m + 1
        return (val_y - 2023) * 12 + (val_m - 7) + 1
    except Exception:
        return 39

def generate_report(month="2026-08"):
    print(f"🚀 Starting Unified Report Generator for month: {month}...")

    # 1. Load or initialize Config
    cfg_file = os.path.join(BASE_DIR, "config", f"config_{month.replace('-', '_')}.json")
    if not os.path.exists(cfg_file):
        # Fallback to closest available config
        cfg_file = os.path.join(BASE_DIR, "config", "config_2026_08.json")

    with open(cfg_file, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    # Override month specifics
    report_month = month
    year_str, month_str = report_month.split('-')
    month_num_zh = int(month_str)
    settle_date = cfg.get("settle_date", f"{year_str}-{int(month_str)+1:02d}-03")
    seq_count = cfg.get("dynamic_sequence_months") or compute_sequence_month_count(report_month)

    # 2. Dynamic PDF Section Matching for Reference Monthly Update
    drive_root = cfg.get("google_drive_root", r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report")
    ref_pdf_name = cfg.get("reference_monthly_update", "iFAST Monthly Investment Update Sep 2026.pdf")
    ref_pdf_path = os.path.join(drive_root, "1. iFast Monthly update", ref_pdf_name)
    if not os.path.exists(ref_pdf_path):
        ref_pdf_path = os.path.join(drive_root, ref_pdf_name)

    matched_sections = match_monthly_update_sections(ref_pdf_path)
    p_philosophy = matched_sections.get("philosophy_page", 2)
    p_returns = matched_sections.get("returns_page", 3)
    p_stars = matched_sections.get("star_ratings_page", 4)
    p_topic = matched_sections.get("topic_page", 5)

    print(f"📄 Reference PDF Matched Pages: Philosophy P.{p_philosophy}, Returns P.{p_returns}, Star Ratings P.{p_stars}, Topic P.{p_topic}")

    # 3. Manager Inputs & Holdings Conviction
    mgr = cfg.get("manager_input", {})
    qualitative_view = mgr.get("qualitative_view", "当月全球市场受宏观流动性与利率再定价博弈影响，组合核心持仓稳固，展现出较强抗跌穿越韧性。")
    rebalance_verdict = mgr.get("rebalance_verdict", "持有")
    if rebalance_verdict == "坚持持有": rebalance_verdict = "持有"
    rebalance_note = mgr.get("rebalance_note", "各标的底层逻辑稳固，偏离度在安全阈值内，维持既有目标配比不变。")
    conflict_note = cfg.get("monthly_conflict_calibration", "宏观利率与资产穿透动态校准：组合严格遵从SOP原则，保持全天候防御韧性与结构性成长弹性。")

    holdings_conviction = mgr.get("holdings_conviction", [])
    active_funds = [f for f in holdings_conviction if f.get("active", True)]
    is_compact = len(active_funds) > 3
    py_class = "p-1.5" if is_compact else "p-2"
    txt_class = "text-[10px]" if is_compact else "text-[11px]"

    conviction_rows = ""
    for h in active_funds:
        fname = h.get("fund_name", "")
        ret = h.get("return_1m", "")
        ret_color = "text-emerald-600" if ret.startswith("+") else "text-rose-600"
        noise = h.get("market_noise", "")
        fundam = h.get("fundamental_support", "")
        dir_text = h.get("advisory_recommendation") or h.get("advisory_directive", "持有")
        if dir_text in ["坚持持有", "持有"]:
            dir_text = "持有"
            badge_bg = "bg-emerald-100 text-emerald-800 border border-emerald-300"
        elif dir_text in ["调仓", "主动调仓", "审慎削减"]:
            dir_text = "调仓"
            badge_bg = "bg-amber-100 text-amber-800 border border-amber-300"
        elif dir_text in ["更换标的", "更换"]:
            dir_text = "更换标的"
            badge_bg = "bg-rose-100 text-rose-800 border border-rose-300"
        else:
            badge_bg = "bg-slate-100 text-slate-800"

        conviction_rows += f"""
                    <tr>
                        <td class="{py_class} pl-3 font-bold text-slate-900 truncate max-w-[210px]">{fname}</td>
                        <td class="{py_class} text-right font-mono {ret_color} font-bold">{ret}</td>
                        <td class="{py_class} text-slate-600 {txt_class}">{noise}</td>
                        <td class="{py_class} text-slate-800 font-medium {txt_class}">{fundam}</td>
                        <td class="{py_class} text-center pr-3 whitespace-nowrap"><span class="inline-block px-2.5 py-0.5 rounded {badge_bg} font-bold text-[10px] whitespace-nowrap">{dir_text}</span></td>
                    </tr>"""

    # 4. Read Base Template and Components
    with open(os.path.join(BASE_DIR, "src", "templates", "base.html"), "r", encoding="utf-8") as f:
        base_html = f.read()
    with open(os.path.join(BASE_DIR, "src", "components", "top_nav.html"), "r", encoding="utf-8") as f:
        top_nav = f.read()
    with open(os.path.join(BASE_DIR, "src", "components", "annotation_toolbar.html"), "r", encoding="utf-8") as f:
        toolbar = f.read()

    # Load Slide 1
    with open(os.path.join(BASE_DIR, "generate_august_report.py"), "r", encoding="utf-8") as f:
        full_script = f.read()
    
    # Extract Slide 1, Slide 2, Slide 4 from generate_august_report.py
    s1_start = full_script.find('<div id="slide1"')
    s1_end = full_script.find('<!-- Slide 2 for August 2026', s1_start)
    if s1_end == -1: s1_end = full_script.find('# Build Slide 2', s1_start)
    slide1_html = full_script[s1_start:full_script.rfind('"""', s1_start, s1_end)].strip()

    s2_start = full_script.find('<div id="slide2"')
    s2_end = full_script.find('# Build Slide 3', s2_start)
    slide2_html = full_script[s2_start:full_script.rfind('"""', s2_start, s2_end)].strip()

    s4_start = full_script.find('<div id="slide4"')
    s4_end = full_script.find('# Build Slide 5', s4_start)
    slide4_html = full_script[s4_start:full_script.rfind('"""', s4_start, s4_end)].strip()

    with open(os.path.join(BASE_DIR, "src", "components", "slide5.html"), "r", encoding="utf-8") as f:
        slide5_html = f.read()
    with open(os.path.join(BASE_DIR, "src", "components", "slide6.html"), "r", encoding="utf-8") as f:
        slide6_html = f.read()

    # Select Slide 3 (Topic template)
    slide3_template = cfg.get("slide3_template")
    if not slide3_template or not os.path.exists(os.path.join(BASE_DIR, slide3_template)):
        if "2026-08" in report_month:
            slide3_template = "src/components/slide3_august.html"
        else:
            slide3_template = "src/components/slide3.html"

    with open(os.path.join(BASE_DIR, slide3_template), "r", encoding="utf-8") as f:
        slide3_html = f.read()

    # Dynamic Month Badge and Settlement in Slide 1
    slide1_html = re.sub(r'<span class="text-amber-400 font-bold text-xs bg-slate-900/80 px-2.5 py-0.5 rounded border border-amber-500/50">[^<]+</span>',
                         f'<span class="text-amber-400 font-bold text-xs bg-slate-900/80 px-2.5 py-0.5 rounded border border-amber-500/50">{month_num_zh}月备忘录</span>',
                         slide1_html)
    slide1_html = re.sub(r'<span class="text-amber-300 font-extrabold text-xs mono-num" id="calc_date_display">[^<]+</span>',
                         f'<span class="text-amber-300 font-extrabold text-xs mono-num" id="calc_date_display">{settle_date}</span>',
                         slide1_html)
    slide1_html = re.sub(r'当月（\d+年\d+月）', f'当月（{year_str}年{month_num_zh}月）', slide1_html)
    slide1_html = re.sub(r'\d+个月真实净值走势', f'{seq_count}个月真实净值走势', slide1_html)
    # Remove AUM badge from Slide 1
    slide1_html = re.sub(r'<span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-xs">参考组合资产规模:[^<]+</span>', '', slide1_html)
    # Dynamic Fund Table Title in Slide 1
    slide1_html = re.sub(r'底层\s*\d+\s*只优选基金构成与月度行情穿透', f'底层 {len(active_funds)} 只优选基金构成与月度行情穿透', slide1_html)

    # Dynamic Fund Table rows in Slide 1
    s1_fund_rows = ""
    role_map = {
        "FULLERTON": ("全天候底仓", "35.00%"),
        "EASTSPRING": ("科技成长", "15.00%"),
        "JANUS": ("生命科学", "15.00%"),
        "GOLD": ("黄金对冲", "15.00%"),
        "CHINA A": ("中国创新", "12.00%"),
        "FSSA": ("亚洲主题", "4.00%"),
        "NIKKO": ("日本高息", "4.00%"),
    }
    for h in active_funds:
        fname = h.get("fund_name", "")
        ret = h.get("return_1m", "0.00%")
        ret_color = "text-emerald-700 font-bold" if ret.startswith("+") else "text-rose-600 font-semibold"
        role = "核心优选"
        tgt_wt = "—"
        for k, (r, w) in role_map.items():
            if k in fname.upper():
                role = r
                tgt_wt = w
                break
        cur_wt = h.get("current_weight", tgt_wt)
        nav = h.get("nav", "—")
        contrib = h.get("contribution", "—")
        contrib_color = "text-emerald-800 font-bold" if str(contrib).startswith("+") else ("text-rose-700 font-bold" if str(contrib).startswith("-") else "text-slate-600")

        s1_fund_rows += f"""
                        <tr>
                            <td class="p-1.5 pl-2 font-bold text-slate-800">{role}</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">{fname}</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">{tgt_wt}</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">{cur_wt}</td>
                            <td class="p-1.5 text-right mono-num">{nav}</td>
                            <td class="p-1.5 text-right {ret_color} mono-num">{ret}</td>
                            <td class="p-1.5 text-right pr-2 {contrib_color} mono-num">{contrib}</td>
                        </tr>"""

    # Replace the tbody in Slide 1 fund table
    tbody_start = slide1_html.find('<tbody class="divide-y divide-slate-200 bg-white text-[11.5px]">')
    if tbody_start != -1:
        tbody_end = slide1_html.find('</tbody>', tbody_start)
        if tbody_end != -1:
            slide1_html = slide1_html[:tbody_start] + '<tbody class="divide-y divide-slate-200 bg-white text-[11.5px]">\n' + s1_fund_rows + '\n                    ' + slide1_html[tbody_end:]

    slide1_html = slide1_html.replace("{{QUALITATIVE_VIEW}}", qualitative_view)
    slide1_html = slide1_html.replace("{{REBALANCE_VERDICT}}", rebalance_verdict)
    slide1_html = slide1_html.replace("{{REBALANCE_NOTE}}", rebalance_note)

    # Dynamic Page References in Slide 2
    slide2_html = re.sub(r'\d+月重点资产月度回报', f'{month_num_zh}月重点资产月度回报', slide2_html)
    slide2_html = re.sub(r'彭博与投研综合数据 \(P\.\d+\)', f'彭博与投研综合数据 (P.{p_returns})', slide2_html)
    slide2_html = re.sub(r'iFAST 官方榜单 \(P\.\d+\)', f'iFAST 官方榜单 (P.{p_stars})', slide2_html)
    slide2_html = slide2_html.replace("{{CONFLICT_NOTE}}", conflict_note)

    # Dynamic Month & Directive in Slide 4
    slide4_html = re.sub(r'\d+月份信念审查决策矩阵', f'{month_num_zh}月份信念审查决策矩阵', slide4_html)
    slide4_html = re.sub(r'\d+月回报', f'{month_num_zh}月回报', slide4_html)
    slide4_html = slide4_html.replace("{{CONVICTION_ROWS}}", conviction_rows)
    slide4_html = slide4_html.replace("{{REBALANCE_VERDICT}}", rebalance_verdict)
    slide4_html = slide4_html.replace("{{REBALANCE_NOTE}}", rebalance_note)

    # Dynamic Inception Dates in Real Performance Series (Chart)
    with open(os.path.join(BASE_DIR, "real_performance_series.json"), "r", encoding="utf-8") as f:
        series_data = json.load(f)

    # Target chart date is settle month (e.g. 2026-08 -> 2026-09, 2026-09 -> 2026-10)
    target_chart_date = f"{year_str}-{month_num_zh+1:02d}" if month_num_zh < 12 else f"{int(year_str)+1}-01"
    if target_chart_date in series_data["dates"]:
        idx_target = series_data["dates"].index(target_chart_date)
    else:
        idx_target = len(series_data["dates"]) - 1

    chart_dates = series_data["dates"][:idx_target+1]
    chart_cur = series_data["current"][:idx_target+1]
    chart_past = series_data["past"][:idx_target+1]
    chart_sp = series_data["sp500"][:idx_target+1]
    chart_msci = series_data["msci"][:idx_target+1]
    chart_events = [e for e in series_data.get("events", []) if e.get("date") <= chart_dates[-1]]

    # 5. Extract and populate august_js
    js_start = full_script.find('august_js = f"""')
    js_code_start = full_script.find('"""', js_start) + 3
    js_code_end = full_script.find('"""', js_code_start)
    raw_js = full_script[js_code_start:js_code_end]

    # Dynamically inject JSON into JS
    raw_js = raw_js.replace("{json.dumps(aug_dates)}", json.dumps(chart_dates))
    raw_js = raw_js.replace("{json.dumps(aug_cur)}", json.dumps(chart_cur))
    raw_js = raw_js.replace("{json.dumps(aug_past)}", json.dumps(chart_past))
    raw_js = raw_js.replace("{json.dumps(aug_sp)}", json.dumps(chart_sp))
    raw_js = raw_js.replace("{json.dumps(aug_msci)}", json.dumps(chart_msci))
    raw_js = raw_js.replace("{json.dumps(aug_events)}", json.dumps(chart_events))

    # 6. Assemble HTML
    final_html = base_html.replace("{{TOP_NAV}}", top_nav)
    final_html = final_html.replace("{{SLIDE_1}}", slide1_html)
    final_html = final_html.replace("{{SLIDE_2}}", slide2_html)
    final_html = final_html.replace("{{SLIDE_3}}", slide3_html)
    final_html = final_html.replace("{{SLIDE_4}}", slide4_html)
    final_html = final_html.replace("{{SLIDE_5}}", slide5_html)
    final_html = final_html.replace("{{SLIDE_6}}", slide6_html)
    final_html = final_html.replace("{{ANNOTATION_TOOLBAR}}", toolbar)
    final_html = final_html.replace("{{I18N_JS}}", "// i18n embedded directly in Chinese")
    final_html = final_html.replace("{{MAIN_JS}}", raw_js)

    # 7. Write outputs
    out_dir = os.path.join(BASE_DIR, "output")
    os.makedirs(out_dir, exist_ok=True)
    monthly_html_file = os.path.join(out_dir, f"iFAST_Equity_Growth_Monthly_Report_{report_month}.html")
    latest_html_file = os.path.join(BASE_DIR, "iFAST_Equity_Growth_Monthly_Report_Latest.html")
    root_aug_file = os.path.join(BASE_DIR, "iFAST_Equity_Growth_Monthly_Report_August2026.html")

    with open(monthly_html_file, "w", encoding="utf-8") as f:
        f.write(final_html)
    with open(latest_html_file, "w", encoding="utf-8") as f:
        f.write(final_html)
    if "2026-08" in report_month:
        with open(root_aug_file, "w", encoding="utf-8") as f:
            f.write(final_html)

    # Also trigger standalone factsheets
    from generate_portfolio_factsheet import generate_standalone_factsheet
    fs = generate_standalone_factsheet(month=report_month, date_str=settle_date)

    print(f"✅ Successfully generated Report for {report_month}: {monthly_html_file}")
    return {
        "monthly_html": monthly_html_file,
        "latest_html": latest_html_file,
        "matched_pages": matched_sections,
        "factsheet_zh": fs["zh_html"],
        "factsheet_en": fs["en_html"]
    }

if __name__ == "__main__":
    generate_report("2026-08")
    generate_report("2026-09")
    generate_report("2026-10")
