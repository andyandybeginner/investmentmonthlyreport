# -*- coding: utf-8 -*-
"""
Unified Dynamic Monthly Advisory Report Generator
Generates full 5-slide Institutional Advisory Report for ANY selected month:
- Dynamically loads config/config_<YYYY>_<MM>.json
- Dynamically slices multi-period performance matrix and 4-line chart series
- Dynamically updates Slide 1, 2, 3, 4, 5
- Excludes Slide 6 (portfolio look-through is extracted as a standalone factsheet)
- Supports full English & Chinese i18n switching for Playwright multi-lingual PDF export
"""

import os
import sys
import json
import fitz
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from engine.pdf_section_matcher import match_monthly_update_sections, find_pdf_for_report_month
from sync_googlesheet_to_report import resolve_settle_date_from_calc_engine

def compute_sequence_month_count(month_str):
    try:
        y, m = map(int, month_str.split('-'))
        val_y = y + 1 if m == 12 else y
        val_m = 1 if m == 12 else m + 1
        return (val_y - 2023) * 12 + (val_m - 7) + 1
    except Exception:
        return 40

def generate_performance_svg(dates, cur, past, sp500, msci, events=None, width=520, height=185):
    margin_l = 36
    margin_r = 14
    margin_t = 20
    margin_b = 20

    plot_w = width - margin_l - margin_r
    plot_h = height - margin_t - margin_b

    y_min = 0.90
    y_max = 2.05
    n = len(dates)

    def get_x(i):
        return margin_l + (plot_w * i) / (n - 1) if n > 1 else margin_l

    def get_y(val):
        v = max(y_min, min(y_max, val))
        return margin_t + plot_h * (y_max - v) / (y_max - y_min)

    def points_to_spline(pts, tension=0.15):
        if not pts:
            return ""
        if len(pts) == 1:
            return f"M {pts[0][0]:.2f} {pts[0][1]:.2f}"
        path = [f"M {pts[0][0]:.2f} {pts[0][1]:.2f}"]
        for i in range(len(pts) - 1):
            p0 = pts[i - 1] if i > 0 else pts[i]
            p1 = pts[i]
            p2 = pts[i + 1]
            p3 = pts[i + 2] if i + 2 < len(pts) else p2
            cp1_x = p1[0] + (p2[0] - p0[0]) * tension
            cp1_y = p1[1] + (p2[1] - p0[1]) * tension
            cp2_x = p2[0] - (p3[0] - p1[0]) * tension
            cp2_y = p2[1] - (p3[1] - p1[1]) * tension
            path.append(f"C {cp1_x:.2f} {cp1_y:.2f}, {cp2_x:.2f} {cp2_y:.2f}, {p2[0]:.2f} {p2[1]:.2f}")
        return " ".join(path)

    cur_pts = [(get_x(i), get_y(v)) for i, v in enumerate(cur)]
    past_pts = [(get_x(i), get_y(v)) for i, v in enumerate(past)]
    sp_pts = [(get_x(i), get_y(v)) for i, v in enumerate(sp500)]
    msci_pts = [(get_x(i), get_y(v)) for i, v in enumerate(msci)]

    cur_d = points_to_spline(cur_pts)
    past_d = points_to_spline(past_pts)
    sp_d = points_to_spline(sp_pts)
    msci_d = points_to_spline(msci_pts)

    y_ticks = [
        (2.0, "200%"),
        (1.8, "180%"),
        (1.6, "160%"),
        (1.4, "140%"),
        (1.2, "120%"),
        (1.0, "100%"),
        (0.9, "90%")
    ]

    svg_parts = [
        f'<svg id="lsSlide1RealLineChart" viewBox="0 0 {width} {height}" class="w-full h-full block" xmlns="http://www.w3.org/2000/svg">'
    ]

    for val, label in y_ticks:
        y = get_y(val)
        is_baseline = (val == 1.0)
        stroke_color = "#cbd5e1" if is_baseline else "#e2e8f0"
        stroke_width = "1.2" if is_baseline else "0.8"
        dash = "" if is_baseline else ' stroke-dasharray="3,3"'
        svg_parts.append(f'<line x1="{margin_l}" y1="{y:.2f}" x2="{width - margin_r}" y2="{y:.2f}" stroke="{stroke_color}" stroke-width="{stroke_width}"{dash}/>')
        svg_parts.append(f'<text x="{margin_l - 6}" y="{y + 3:.2f}" font-family="system-ui, -apple-system, sans-serif" font-size="8.5px" fill="#64748b" text-anchor="end" font-weight="500">{label}</text>')

    x_indices = [i for i in range(0, n, 5)]

    for idx in x_indices:
        x = get_x(idx)
        d_str = dates[idx]
        svg_parts.append(f'<line x1="{x:.2f}" y1="{margin_t + plot_h}" x2="{x:.2f}" y2="{margin_t + plot_h + 3}" stroke="#94a3b8" stroke-width="0.8"/>')
        anchor = "start" if idx == 0 else "middle"
        svg_parts.append(f'<text x="{x:.2f}" y="{margin_t + plot_h + 13}" font-family="system-ui, -apple-system, sans-serif" font-size="8.5px" fill="#64748b" text-anchor="{anchor}" font-weight="500">{d_str}</text>')

    # 4 Performance Curves
    # 1. MSCI World (Gray dashed)
    svg_parts.append(f'<path d="{msci_d}" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="3,3" stroke-linecap="round" stroke-linejoin="round"/>')

    # 2. S&P 500 (Black dashed)
    svg_parts.append(f'<path d="{sp_d}" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-dasharray="3,3" stroke-linecap="round" stroke-linejoin="round"/>')

    # 3. Past Portfolio (Blue dashed) - HIGHLY VISIBLE
    svg_parts.append(f'<path d="{past_d}" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-dasharray="5,4" stroke-linecap="round" stroke-linejoin="round"/>')

    # 4. Current Portfolio (Red solid)
    svg_parts.append(f'<path d="{cur_d}" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>')

    if events is None:
        events = [
            {"date": "2023-07", "status": "Restructure"},
            {"date": "2025-07", "status": "Restructure"},
            {"date": "2026-01", "status": "Restructure"}
        ]

    for evt in events:
        e_date = evt.get("date", "")
        if e_date not in dates:
            continue
        e_idx = dates.index(e_date)
        e_pt = cur_pts[e_idx]
        px, py = e_pt

        is_rebal = "rebalance" in evt.get("status", "").lower()
        color_rgb = "16, 185, 129" if is_rebal else "245, 158, 11"
        color_solid = "#059669" if is_rebal else "#d97706"
        badge_bg = "#10b981" if is_rebal else "#f59e0b"
        text_zh = "季度调仓" if is_rebal else "组合重组"
        text_en = "Rebalance" if is_rebal else "Restructure"

        # 1. Vertical timeline line
        svg_parts.append(f'<line x1="{px:.2f}" y1="{margin_t + plot_h}" x2="{px:.2f}" y2="{py:.2f}" stroke="rgba({color_rgb}, 0.7)" stroke-width="1.2" stroke-dasharray="3,3"/>')

        # 2. Outer 50% circle
        svg_parts.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="10.5" fill="rgba({color_rgb}, 0.45)" stroke="{color_solid}" stroke-width="1.8"/>')

        # Inner white anchor core
        svg_parts.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="2.8" fill="#ffffff" stroke="{color_solid}" stroke-width="1.2"/>')

        # 3. Label badge tag: "组合重组" / "季度调仓" with bilingual data attributes
        tw = 42
        bw = tw + 8
        bh = 13
        bx = px
        if e_idx == 0:
            bx = px + bw / 2 - 2
        
        by = py + 18 if (py - 18 < margin_t) else py - 16

        svg_parts.append(f'<rect x="{bx - bw / 2:.2f}" y="{by - bh / 2:.2f}" width="{bw}" height="{bh}" rx="3" fill="{badge_bg}" stroke="{color_solid}" stroke-width="0.8"/>')
        svg_parts.append(f'<text x="{bx:.2f}" y="{by + 3.2:.2f}" font-family="system-ui, -apple-system, sans-serif" font-size="8px" font-weight="bold" fill="#0f172a" text-anchor="middle" data-zh="{text_zh}" data-en="{text_en}">{text_zh}</text>')

    svg_parts.append('</svg>')
    return "\n".join(svg_parts)

def generate_frontier_svg(lang="zh", width=740, height=480):
    is_en = (lang == "en")
    margin_l = 52
    margin_r = 35
    margin_t = 32
    margin_b = 42

    plot_w = width - margin_l - margin_r
    plot_h = height - margin_t - margin_b

    x_min = 5.0
    x_max = 21.0
    y_min = -5.0
    y_max = 18.0

    def get_x(v):
        return margin_l + plot_w * (v - x_min) / (x_max - x_min)

    def get_y(v):
        return margin_t + plot_h * (y_max - v) / (y_max - y_min)

    d_2025 = [
        {"x": 10.5, "y": -2.5, "label": "100% Bonds", "zh": "100% 债券"},
        {"x": 12.1, "y": 2.5, "label": "25/75", "zh": "25/75"},
        {"x": 13.9, "y": 6.8, "label": "50/50", "zh": "50/50"},
        {"x": 15.2, "y": 8.9, "label": "60/40", "zh": "60/40"},
        {"x": 16.0, "y": 10.4, "label": "70/30", "zh": "70/30"},
        {"x": 17.3, "y": 12.1, "label": "80/20", "zh": "80/20"},
        {"x": 19.3, "y": 15.8, "label": "100% Stocks", "zh": "100% 股票"}
    ]

    d_2020 = [
        {"x": 8.5, "y": 6.8, "label": "100% Bonds", "zh": "100% 债券"},
        {"x": 7.8, "y": 8.4, "label": "25/75", "zh": "25/75"},
        {"x": 8.8, "y": 9.8, "label": "50/50", "zh": "50/50"},
        {"x": 10.0, "y": 10.2, "label": "60/40", "zh": "60/40"},
        {"x": 11.8, "y": 10.7, "label": "70/30", "zh": "70/30"},
        {"x": 13.2, "y": 11.2, "label": "80/20", "zh": "80/20"},
        {"x": 15.6, "y": 12.3, "label": "100% Stocks", "zh": "100% 股票"}
    ]

    def make_path(pts):
        coords = [(get_x(p["x"]), get_y(p["y"])) for p in pts]
        d_str = f"M {coords[0][0]:.2f} {coords[0][1]:.2f}"
        for i in range(len(coords) - 1):
            p0 = coords[i - 1] if i > 0 else coords[i]
            p1 = coords[i]
            p2 = coords[i + 1]
            p3 = coords[i + 2] if i + 2 < len(coords) else p2
            tension = 0.12
            cp1_x = p1[0] + (p2[0] - p0[0]) * tension
            cp1_y = p1[1] + (p2[1] - p0[1]) * tension
            cp2_x = p2[0] - (p3[0] - p1[0]) * tension
            cp2_y = p2[1] - (p3[1] - p1[1]) * tension
            d_str += f" C {cp1_x:.2f} {cp1_y:.2f}, {cp2_x:.2f} {cp2_y:.2f}, {p2[0]:.2f} {p2[1]:.2f}"
        return d_str

    path_2025 = make_path(d_2025)
    path_2020 = make_path(d_2020)

    svg = [
        f'<svg id="lsFrontierChart" viewBox="0 0 {width} {height}" class="w-full h-full block" xmlns="http://www.w3.org/2000/svg">'
    ]

    # Grid Y
    for y_val in [-4, 0, 4, 8, 12, 16]:
        y = get_y(y_val)
        is_zero = (y_val == 0)
        stroke = "#94a3b8" if is_zero else "#e2e8f0"
        sw = "1.4" if is_zero else "0.9"
        dash = "" if is_zero else ' stroke-dasharray="3,3"'
        svg.append(f'<line x1="{margin_l}" y1="{y:.2f}" x2="{width - margin_r}" y2="{y:.2f}" stroke="{stroke}" stroke-width="{sw}"{dash}/>')
        fill_col = "#334155" if is_zero else "#64748b"
        f_wt = "700" if is_zero else "500"
        svg.append(f'<text x="{margin_l - 8}" y="{y + 4:.2f}" font-family="system-ui, -apple-system, sans-serif" font-size="10.5px" fill="{fill_col}" text-anchor="end" font-weight="{f_wt}">{y_val}%</text>')

    # Grid X
    for x_val in [6, 8, 10, 12, 14, 16, 18, 20]:
        x = get_x(x_val)
        svg.append(f'<line x1="{x:.2f}" y1="{margin_t}" x2="{x:.2f}" y2="{margin_t + plot_h}" stroke="#e2e8f0" stroke-width="0.9" stroke-dasharray="3,3"/>')
        svg.append(f'<text x="{x:.2f}" y="{margin_t + plot_h + 16}" font-family="system-ui, -apple-system, sans-serif" font-size="10.5px" fill="#64748b" text-anchor="middle" font-weight="500">{x_val}%</text>')

    # Axis Labels with bilingual attributes
    x_axis_label_zh = "年化波动率 / 风险 (%)"
    x_axis_label_en = "Annualized Volatility / Risk (%)"
    y_axis_label_zh = "年化回报率 (%)"
    y_axis_label_en = "Annualized Return (%)"
    x_lbl = x_axis_label_en if is_en else x_axis_label_zh
    y_lbl = y_axis_label_en if is_en else y_axis_label_zh

    svg.append(f'<text x="{margin_l + plot_w / 2}" y="{height - 6}" font-family="system-ui, -apple-system, sans-serif" font-size="11.5px" fill="#334155" text-anchor="middle" font-weight="bold" data-zh="{x_axis_label_zh}" data-en="{x_axis_label_en}">{x_lbl}</text>')
    svg.append(f'<text x="{margin_l + 8}" y="{margin_t - 12}" font-family="system-ui, -apple-system, sans-serif" font-size="11.5px" fill="#334155" text-anchor="start" font-weight="bold" data-zh="{y_axis_label_zh}" data-en="{y_axis_label_en}">{y_lbl}</text>')

    # Explanatory Contrast Badges on Top Left of Chart
    box_w = 320 if is_en else 275
    t1 = "● 1986-2020: Convex curve (bonds reduced risk, min at 25/75)" if is_en else "● 1986-2020 凸前沿：加入债券有效减震（最低波动在25/75）"
    t2 = "● 2021-2025: Linear drag (bonds cut returns, not risk; pure bond negative)" if is_en else "● 2021-2025 平直前沿：配置债券降收益未降风险（纯债回报为负）"
    svg.append(f'<rect x="{margin_l + 10}" y="{margin_t + 6}" width="{box_w}" height="24" rx="6" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>')
    svg.append(f'<text x="{margin_l + 20}" y="{margin_t + 22}" font-family="system-ui, sans-serif" font-size="9.5px" font-weight="bold" fill="#1e3a8a">{t1}</text>')
    svg.append(f'<rect x="{margin_l + 10}" y="{margin_t + 34}" width="{box_w}" height="24" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>')
    svg.append(f'<text x="{margin_l + 20}" y="{margin_t + 50}" font-family="system-ui, sans-serif" font-size="9.5px" font-weight="bold" fill="#991b1b">{t2}</text>')

    # 1986-2020 Curve (Blue)
    svg.append(f'<path d="{path_2020}" fill="none" stroke="#1e3a8a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>')
    for idx, p in enumerate(d_2020):
        px, py = get_x(p["x"]), get_y(p["y"])
        svg.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="5" fill="#1e3a8a" stroke="#ffffff" stroke-width="1.8"/>')
        lbl = p["label"] if is_en else p["zh"]
        if idx == 0:
            tx, ty, anchor = px - 9, py - 3, "end"
        elif idx == 1: # 25/75
            tx, ty, anchor = px - 8, py - 6, "end"
        elif idx == 2: # 50/50
            tx, ty, anchor = px - 4, py - 9, "end"
        elif idx == 3: # 60/40
            tx, ty, anchor = px, py - 9, "middle"
        elif idx == len(d_2020) - 1:
            tx, ty, anchor = px + 8, py - 8, "start"
        else:
            tx, ty, anchor = px + 8, py - 7, "start"
        svg.append(f'<text x="{tx:.2f}" y="{ty:.2f}" font-family="system-ui, -apple-system, sans-serif" font-size="10px" font-weight="bold" fill="#1e3a8a" text-anchor="{anchor}" data-zh="{p["zh"]}" data-en="{p["label"]}">{lbl}</text>')

    # 2021-2025 Curve (Red)
    svg.append(f'<path d="{path_2025}" fill="none" stroke="#dc2626" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>')
    for idx, p in enumerate(d_2025):
        px, py = get_x(p["x"]), get_y(p["y"])
        svg.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="5" fill="#dc2626" stroke="#ffffff" stroke-width="1.8"/>')
        lbl = p["label"] if is_en else p["zh"]
        if idx == 0:
            tx, ty, anchor = px - 9, py + 4, "end"
        elif idx == len(d_2025) - 1:
            tx, ty, anchor = px + 9, py + 4, "start"
        elif idx == 3: # 60/40
            tx, ty, anchor = px + 9, py + 4, "start"
        else:
            tx, ty, anchor = px + 9, py + 4, "start"
        svg.append(f'<text x="{tx:.2f}" y="{ty:.2f}" font-family="system-ui, -apple-system, sans-serif" font-size="10px" font-weight="bold" fill="#dc2626" text-anchor="{anchor}" data-zh="{p["zh"]}" data-en="{p["label"]}">{lbl}</text>')

    svg.append('</svg>')
    return "\n".join(svg)

OBJECTIVE_HOLDINGS_BY_MONTH = {
    "2026-08": [
        {
            "id": "fund-fullerton",
            "fund_name": "FULLERTON LUX - GLOBAL ABSOLUTE ALPHA",
            "role": "全天候底仓",
            "role_en": "Core Ballast",
            "target_weight": "35.00%",
            "current_weight": "34.62%",
            "nav": "$17.9714",
            "return_1m": "+0.36%",
            "contrib_1m": "+0.12%",
            "active": True,
            "market_noise": "多空对冲策略在科技单边轮动行情下超额弹性相对温和。",
            "market_noise_en": "Long/short hedge strategy shows moderate relative elasticity during rotational tech markets.",
            "fundamental_support": "自下而上低贝塔多空配对交易，全月平稳穿越外围动荡，忠实履行组合下行减震底仓使命。",
            "fundamental_support_en": "Bottom-up low-beta pair trading navigated external turbulence smoothly, fulfilling core downside protection.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-eastspring",
            "fund_name": "EASTSPRING - GLOBAL TECHNOLOGY SGD",
            "role": "科技成长",
            "role_en": "Tech Growth",
            "target_weight": "15.00%",
            "current_weight": "15.73%",
            "nav": "$3.9680",
            "return_1m": "-5.64%",
            "contrib_1m": "-0.89%",
            "active": True,
            "market_noise": "长端美债收益率攀升引发半导体估值分母端压制，芯片股短期震荡。",
            "market_noise_en": "Rising long-end US Treasury yields pressured semiconductor valuation multiples in the near term.",
            "fundamental_support": "英伟达财报亮眼，云巨头资本开支扩张，人工智能硬件供需瓶颈突出，回调创造极佳逢低吸纳窗口。",
            "fundamental_support_en": "Strong NVIDIA earnings and expanding hyperscaler CapEx confirm tight AI hardware supply-demand fundamentals.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-janus",
            "fund_name": "Janus Henderson Global Life Sciences",
            "role": "生命科学",
            "role_en": "Healthcare",
            "target_weight": "15.00%",
            "current_weight": "14.78%",
            "nav": "$18.7600",
            "return_1m": "-0.21%",
            "contrib_1m": "-0.03%",
            "active": True,
            "market_noise": "高利率环境下生物医药并购融资成本抬升，板块交易情绪偏弱。",
            "market_noise_en": "Higher financing costs under elevated rates softened short-term biotech M&A trading sentiment.",
            "fundamental_support": "大型跨国药企重磅减重创新药与肿瘤研发管线现金流强劲，防御属性与长期估值修复潜力突出。",
            "fundamental_support_en": "Blockbuster GLP-1 weight-loss and oncology pipelines deliver resilient cash flows and defensive buffer.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-gold",
            "fund_name": "United Gold and General A Acc SGD",
            "role": "黄金对冲",
            "role_en": "Gold & Commodity",
            "target_weight": "15.00%",
            "current_weight": "14.51%",
            "nav": "$5.6975",
            "return_1m": "+24.00%",
            "contrib_1m": "+3.48%",
            "active": True,
            "market_noise": "金价短期急涨后可能面临获利盘了结与美元指数技术性反弹。",
            "market_noise_en": "Potential short-term profit-taking and technical DXY rebound following August's rapid +24% rally.",
            "fundamental_support": "美债30年期收益率升破5.3%，去美元化与全球央行购金逻辑坚实，非对称对冲大放异彩。",
            "fundamental_support_en": "30Y US Treasury yields exceeding 5.3% reinforce central bank gold accumulation and asymmetric hedging.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-china",
            "fund_name": "United China A Shares Innovation A Acc",
            "role": "中国创新",
            "role_en": "China Innovation",
            "target_weight": "12.00%",
            "current_weight": "12.58%",
            "nav": "$0.8924",
            "return_1m": "-3.09%",
            "contrib_1m": "-0.39%",
            "active": True,
            "market_noise": "7月宏观数据复苏不均，零售消费温和，房地产投资持续收缩。",
            "market_noise_en": "Uneven macro recovery data with soft retail consumption and contracting property investment.",
            "fundamental_support": "在岸科技制造与国产智能算力技术稳步突破，估值处于历史绝对低位，政策托底与流动性注入预期强烈。",
            "fundamental_support_en": "Breakthroughs in domestic AI compute and manufacturing at trough valuations with strong policy support expectations.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-fssa",
            "fund_name": "FSSA Asian Growth Fund (Class A)",
            "role": "亚洲主题",
            "role_en": "Asia Focus",
            "target_weight": "4.00%",
            "current_weight": "3.91%",
            "nav": "$3.8991",
            "return_1m": "+1.12%",
            "contrib_1m": "+0.04%",
            "active": True,
            "market_noise": "新兴市场汇率受强美元反弹扰动，部分出口型经济体面临通胀压力。",
            "market_noise_en": "EM currencies experienced intermittent volatility amid US dollar fluctuations.",
            "fundamental_support": "重仓印度与东南亚内需消费蓝筹，企业资本回报率与治理结构卓越，有效抵御外部波动。",
            "fundamental_support_en": "Overweight India and ASEAN domestic consumer leaders with superior ROE and governance resilience.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-nikko",
            "fund_name": "Nikko AM Japan Dividend",
            "role": "日本高息",
            "role_en": "Japan Dividend",
            "target_weight": "4.00%",
            "current_weight": "3.87%",
            "nav": "$2.2653",
            "return_1m": "+1.30%",
            "contrib_1m": "+0.05%",
            "active": True,
            "market_noise": "日本央行加息25个基点，日元套息交易平仓引发东证指数间歇性震荡。",
            "market_noise_en": "BOJ 25 bps rate hike and Yen carry trade unwinds triggered intermittent TOPIX volatility.",
            "fundamental_support": "东京证交所市净率改善改革持续深化，企业回购与股息分红创新高，日经反弹中现金流防御优异。",
            "fundamental_support_en": "Deepening TSE P/B reforms, record share buybacks, and rising dividends provide strong cash flow defense.",
            "advisory_recommendation": "持有"
        }
    ],
    "2026-09": [
        {
            "id": "fund-fullerton",
            "fund_name": "FULLERTON LUX - GLOBAL ABSOLUTE ALPHA",
            "role": "全天候底仓",
            "role_en": "Core Ballast",
            "target_weight": "35.00%",
            "current_weight": "35.09%",
            "nav": "$18.0091",
            "return_1m": "+0.21%",
            "contrib_1m": "+0.07%",
            "active": True,
            "market_noise": "多空对冲在强趋势成长单边行情中弹性较为温和。",
            "market_noise_en": "Long/short market neutral strategy exhibits moderate upside beta during aggressive one-way rallies.",
            "fundamental_support": "恪守低贝塔多空选股原则，全月实现+0.21%绝对正收益，稳定发挥大额底仓减震压舱价值。",
            "fundamental_support_en": "Strict adherence to bottom-up pair-trading generated +0.21% positive absolute return, reliably stabilizing overall portfolio.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-eastspring",
            "fund_name": "EASTSPRING - GLOBAL TECHNOLOGY SGD",
            "role": "科技成长",
            "role_en": "Tech Growth",
            "target_weight": "15.00%",
            "current_weight": "17.40%",
            "nav": "$4.3330",
            "return_1m": "+9.20%",
            "contrib_1m": "+1.60%",
            "active": True,
            "market_noise": "全球半导体短线震荡，美债收益率曲线陡峭化引发成长估值分歧。",
            "market_noise_en": "Short-term volatility across global semiconductors; steeper yield curve led to valuation dispersion.",
            "fundamental_support": "北美头部云服务商基础设施资本开支坚挺，人工智能硬件真实业绩强劲，单月大涨+9.20%，贡献核心超额。",
            "fundamental_support_en": "Cloud hyperscaler CapEx remains resilient; real AI hardware revenue growth drove a robust +9.20% gain, delivering dominant alpha.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-janus",
            "fund_name": "Janus Henderson Global Life Sciences",
            "role": "生命科学",
            "role_en": "Healthcare",
            "target_weight": "15.00%",
            "current_weight": "14.17%",
            "nav": "$17.7700",
            "return_1m": "-5.30%",
            "contrib_1m": "-0.75%",
            "active": True,
            "market_noise": "高利率尾声阶段生物医药并购节奏略有放缓，板块出现获利了结回吐。",
            "market_noise_en": "M&A pace moderated during elevated rate regime, leading to short-term sector profit-taking.",
            "fundamental_support": "大型跨国制药与重磅肿瘤药现金流充沛，防御价值突出，回调创造健康加仓布局窗口。",
            "fundamental_support_en": "Robust free cash flows among mega-cap pharmaceuticals; pullback presents an attractive valuation entry window.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-gold",
            "fund_name": "United Gold and General A Acc SGD",
            "role": "黄金对冲",
            "role_en": "Gold & Commodity",
            "target_weight": "15.00%",
            "current_weight": "13.23%",
            "nav": "$5.1323",
            "return_1m": "-9.92%",
            "contrib_1m": "-1.31%",
            "active": True,
            "market_noise": "8月暴涨+24%后短线投机盘获利了结回吐-9.92%，美元汇率短线技术性反抽。",
            "market_noise_en": "Speculative profit-taking after August's +24% surge combined with short-term DXY technical bounce.",
            "fundamental_support": "全球央行去美元化购金逻辑与长期地缘避险属性未变，前期大涨累积丰厚利润后正常整固，无需惊慌。",
            "fundamental_support_en": "Central bank de-dollarization reserve purchases and structural geopolitical hedging remain intact; healthy profit consolidation.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-china",
            "fund_name": "United China A Shares Innovation A Acc",
            "role": "中国创新",
            "role_en": "China Innovation",
            "target_weight": "12.00%",
            "current_weight": "12.24%",
            "nav": "$0.8579",
            "return_1m": "-3.87%",
            "contrib_1m": "-0.47%",
            "active": True,
            "market_noise": "短期宏观经济修复斜率较缓，房地产市场仍处于筑底期。",
            "market_noise_en": "Gradual economic recovery slope with property sector in prolonged base-building phase.",
            "fundamental_support": "中国央行重磅金融支持与流动性释放，在岸创新龙头估值处于历史估值低分位，当前权重12.24%高于目标配比，无须减仓，坚守均值回归。",
            "fundamental_support_en": "Decisive monetary stimulus and liquidity injection from PBOC; onshore innovation valuation sits at historical troughs; actual weight at 12.24% exceeds target, conviction firmly intact.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-fssa",
            "fund_name": "FSSA Asian Growth Fund (Class A)",
            "role": "亚洲主题",
            "role_en": "Asia Focus",
            "target_weight": "4.00%",
            "current_weight": "4.00%",
            "nav": "$3.9428",
            "return_1m": "+1.12%",
            "contrib_1m": "+0.04%",
            "active": True,
            "market_noise": "外围汇率预期交织，区域部分出口面临扰动。",
            "market_noise_en": "Currency volatility and selective regional export softness.",
            "fundamental_support": "聚焦印度消费蓝筹与泛亚高资本回报率龙头，在区域波动中稳健实现+1.12%正收益。",
            "fundamental_support_en": "Concentrated in high-quality Indian consumer leaders and pan-Asia high-ROE compounders, generating steady +1.12% return.",
            "advisory_recommendation": "持有"
        },
        {
            "id": "fund-nikko",
            "fund_name": "Nikko AM Japan Dividend",
            "role": "日本高息",
            "role_en": "Japan Dividend",
            "target_weight": "4.00%",
            "current_weight": "3.87%",
            "nav": "$2.2261",
            "return_1m": "-1.73%",
            "contrib_1m": "-0.07%",
            "active": True,
            "market_noise": "日元汇率与央行利率政策预期交锋，东证指数短期高位整固。",
            "market_noise_en": "Yen fluctuations and BOJ monetary policy debates led to short-term consolidation in TOPIX.",
            "fundamental_support": "东京交易所市净率改革与企业股息回购持续推进，充沛现金流提供长期坚实托底。",
            "fundamental_support_en": "TSE governance reforms, rising share buybacks and robust corporate cash flows provide reliable long-term support.",
            "advisory_recommendation": "持有"
        }
    ]
}

def normalize_and_enrich_holdings(raw_holdings, report_month):
    """
    Ensures objective holdings data (fund_name, role, target_weight, current_weight, nav, return_1m, contrib_1m)
    are ALWAYS populated immediately after selecting a report month in Section 1, supporting dynamic N funds
    (e.g., 5 funds in 2024-2025, 7 funds in 2026, or any N funds configured by manager/rebalance).
    """
    baseline_list = OBJECTIVE_HOLDINGS_BY_MONTH.get(report_month)
    if not baseline_list:
        hist_path = os.path.join(BASE_DIR, "engine", "portfolio_history.json")
        if os.path.exists(hist_path):
            try:
                with open(hist_path, "r", encoding="utf-8") as f:
                    hist_data = json.load(f)
                    if report_month in hist_data:
                        baseline_list = hist_data[report_month].get("funds", [])
            except Exception:
                pass
    if not baseline_list:
        baseline_list = OBJECTIVE_HOLDINGS_BY_MONTH.get("2026-09", [])

    if not raw_holdings:
        return [dict(item) for item in baseline_list]

    def match_baseline(fname_str):
        u = str(fname_str).upper()
        for b in baseline_list:
            b_u = b.get("fund_name", "").upper()
            if ("FULLERTON" in u and "FULLERTON" in b_u) or \
               ("EASTSPRING" in u and "EASTSPRING" in b_u) or \
               ("JANUS" in u and "JANUS" in b_u) or \
               ("GOLD" in u and "GOLD" in b_u) or \
               ("CHINA" in u and "CHINA" in b_u) or \
               ("FSSA" in u and "FSSA" in b_u) or \
               ("NIKKO" in u and "NIKKO" in b_u) or \
               ("BLACKROCK" in u and "BLACKROCK" in b_u) or \
               ("INFINITY" in u and "INFINITY" in b_u) or \
               ("FIDELITY" in u and "FIDELITY" in b_u):
                return b
        return None

    def fmt_pct(val, signed=False):
        if val is None or val == "":
            return ""
        s = str(val).strip()
        if s.endswith("%"):
            if signed and not s.startswith("+") and not s.startswith("-"):
                try:
                    num = float(s[:-1])
                    return f"{'+' if num >= 0 else ''}{num:.2f}%"
                except Exception:
                    return s
            return s
        try:
            num = float(s)
            return f"{'+' if (signed and num >= 0) else ''}{num:.2f}%"
        except Exception:
            return s

    enriched = []
    for idx, h in enumerate(raw_holdings):
        fname_raw = h.get("fund_name") or h.get("name") or ""
        b = match_baseline(fname_raw) or (baseline_list[idx] if idx < len(baseline_list) else {})
        fname = h.get("fund_name") or (b.get("fund_name") if b else fname_raw) or f"Fund {idx+1}"

        tgt_wt = fmt_pct(h.get("target_weight") if h.get("target_weight") is not None else h.get("weight"), signed=False) or b.get("target_weight", "—")
        cur_wt = fmt_pct(h.get("current_weight"), signed=False) or b.get("current_weight", tgt_wt)
        ret_1m = fmt_pct(h.get("return_1m"), signed=True) or b.get("return_1m", "0.00%")
        contrib_1m = fmt_pct(h.get("contrib_1m"), signed=True) or b.get("contrib_1m", "")
        nav = h.get("nav") or b.get("nav", "—")

        noise = h.get("market_noise") or h.get("noise") or b.get("market_noise", "围绕宏观利率与行业周期短期预期博弈。")
        noise_en = h.get("market_noise_en") or b.get("market_noise_en", "Near-term macroeconomic rates and cyclical debates.")
        fundam = h.get("fundamental_support") or h.get("support") or b.get("fundamental_support", "底层企业基本面与长期复利逻辑坚实，提供配置韧性。")
        fundam_en = h.get("fundamental_support_en") or b.get("fundamental_support_en", "Resilient fundamentals and long-term compounding thesis intact.")
        act = h.get("advisory_recommendation") or h.get("advisory_directive") or h.get("action") or b.get("advisory_recommendation", "持有")

        enriched.append({
            "id": h.get("id") or b.get("id", f"fund-{idx+1}"),
            "fund_name": fname,
            "role": h.get("role") or b.get("role", "核心优选"),
            "role_en": h.get("role_en") or b.get("role_en", "Core Holding"),
            "target_weight": tgt_wt,
            "current_weight": cur_wt,
            "nav": nav,
            "return_1m": ret_1m,
            "contrib_1m": contrib_1m,
            "active": h.get("active", True),
            "market_noise": noise,
            "market_noise_en": noise_en,
            "fundamental_support": fundam,
            "fundamental_support_en": fundam_en,
            "advisory_recommendation": act
        })
    return enriched

def generate_report(month="2026-09"):
    print(f"🚀 Starting Unified Report Generator for month: {month}...")

    # 1. Load or initialize Config
    cfg_file = os.path.join(BASE_DIR, "config", f"config_{month.replace('-', '_')}.json")
    if not os.path.exists(cfg_file):
        cfg_file = os.path.join(BASE_DIR, "config", "config_2026_09.json")
    if not os.path.exists(cfg_file):
        cfg_file = os.path.join(BASE_DIR, "config", "config_2026_08.json")

    with open(cfg_file, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    # Override month specifics & resolve settle_date from Calculation_Engine Column A
    report_month = month
    year_str, month_str = report_month.split('-')
    month_num_zh = int(month_str)
    resolved_date = resolve_settle_date_from_calc_engine(report_month, live_fetch=False)
    settle_date = resolved_date if isinstance(resolved_date, str) and resolved_date else cfg.get("settle_date", f"{year_str}-{int(month_str)+1:02d}-05")
    seq_count = cfg.get("dynamic_sequence_months") or compute_sequence_month_count(report_month)

    # 2. Dynamic PDF Section Matching for Reference Monthly Update from preset local folder
    ref_pdf_path, ref_pdf_name = find_pdf_for_report_month(report_month)
    matched_sections = match_monthly_update_sections(ref_pdf_path)
    p_philosophy = matched_sections.get("philosophy_page", 2)
    p_returns = matched_sections.get("returns_page", 6 if report_month == "2026-09" else 3)
    p_stars = matched_sections.get("star_ratings_page", 7 if report_month == "2026-09" else 4)
    p_topic = matched_sections.get("topic_page", 12 if report_month == "2026-09" else 6)

    # 3. Manager Input & Holdings Conviction (Always enriched with objective month data)
    mgr_input = cfg.get("manager_input", {})
    qualitative_view = mgr_input.get("qualitative_view", "")
    rebalance_verdict = mgr_input.get("rebalance_verdict", "持有")
    if rebalance_verdict == "坚持持有": rebalance_verdict = "持有"
    rebalance_note = mgr_input.get("rebalance_note", "")
    conflict_note = cfg.get("monthly_conflict_calibration", "")

    all_holdings = normalize_and_enrich_holdings(mgr_input.get("holdings_conviction", []), report_month)
    active_funds = [h for h in all_holdings if h.get("active") is not False]
    if not active_funds:
        active_funds = all_holdings

    # Dynamic Density Classes for Slide 4 Table
    n_funds = len(active_funds)
    if n_funds > 10:
        py_class = "py-1"
        txt_class = "text-[10px] leading-tight"
    elif n_funds > 7:
        py_class = "py-1.5"
        txt_class = "text-[10.5px] leading-snug"
    else:
        py_class = "py-2"
        txt_class = "text-[11px] leading-normal"

    conviction_rows = ""
    rebalance_memo_link = (cfg.get("rebalance_memo_link") or mgr_input.get("rebalance_memo_link") or "").strip()
    show_rebalance_memo = bool(cfg.get("show_rebalance_memo") or mgr_input.get("show_rebalance_memo", False))

    has_modification = (
        rebalance_verdict not in ["持有", "坚持持有", "Hold", ""] or
        any(h.get("advisory_recommendation") not in ["持有", "坚持持有", "Hold", ""] for h in active_funds) or
        show_rebalance_memo
    )

    memo_btn_html = ""
    if (has_modification or show_rebalance_memo) and rebalance_memo_link:
        memo_btn_html = f"""
            <a href="{rebalance_memo_link}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold rounded-md shadow-xs transition hover:scale-[1.02] shrink-0" data-i18n="s4_memo_link_btn">
                <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                <span>查阅持仓变动详细说明备忘录 (Google Drive 附件) →</span>
            </a>
        """

    alt_badge_html = '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white shadow-xs shrink-0" data-i18n="s4_memo_badge">持仓变动执行</span>' if has_modification else ''

    rebalance_box_html = f"""
        <div class="bg-blue-50/90 border border-blue-200 rounded-lg px-3.5 py-1.5 text-xs text-blue-950 flex flex-wrap justify-between items-center gap-2 mt-2 shrink-0" id="s4_rebalance_box">
            <div class="flex items-center gap-2 flex-1 min-w-0">
                {alt_badge_html}
                <span class="font-bold text-[#0f2347] shrink-0" data-i18n="s4_verdict_label">月度调仓结论：</span>
                <span class="text-[11.5px] text-slate-700 truncate" data-i18n="s4_verdict_note">{rebalance_note}</span>
            </div>
            {memo_btn_html}
        </div>
    """

    dyn_i18n_zh = {}
    dyn_i18n_en = {}

    for idx, h in enumerate(active_funds):
        fname = h.get("fund_name", "")
        ret = h.get("return_1m", "")
        ret_color = "text-emerald-600" if str(ret).startswith("+") else "text-rose-600"
        noise = h.get("market_noise", "")
        fundam = h.get("fundamental_support", "")
        noise_en = h.get("market_noise_en", noise)
        fundam_en = h.get("fundamental_support_en", fundam)
        dir_text = h.get("advisory_recommendation") or h.get("advisory_directive", "持有")
        if dir_text in ["坚持持有", "持有"]:
            dir_text = "持有"
            dir_text_en = "Hold"
            badge_bg = "bg-emerald-100 text-emerald-800 border border-emerald-300"
        elif dir_text in ["调仓", "主动调仓", "审慎削减"]:
            dir_text = "调仓"
            dir_text_en = "Rebalance"
            badge_bg = "bg-amber-100 text-amber-800 border border-amber-300"
        elif dir_text in ["更换标的", "更换"]:
            dir_text = "更换标的"
            dir_text_en = "Switch / Replace"
            badge_bg = "bg-rose-100 text-rose-800 border border-rose-300"
        else:
            dir_text = "持有"
            dir_text_en = "Hold"
            badge_bg = "bg-slate-100 text-slate-800"

        c_key = f"c{idx+1}"
        dyn_i18n_zh[f"{c_key}_name"] = fname
        dyn_i18n_zh[f"{c_key}_noise"] = noise
        dyn_i18n_zh[f"{c_key}_fundam"] = fundam
        dyn_i18n_zh[f"{c_key}_act"] = dir_text

        dyn_i18n_en[f"{c_key}_name"] = fname
        dyn_i18n_en[f"{c_key}_noise"] = noise_en
        dyn_i18n_en[f"{c_key}_fundam"] = fundam_en
        dyn_i18n_en[f"{c_key}_act"] = dir_text_en

        conviction_rows += f"""
                    <tr>
                        <td class="{py_class} pl-3 font-bold text-slate-900 truncate max-w-[210px]" data-i18n="{c_key}_name">{fname}</td>
                        <td class="{py_class} text-right font-mono {ret_color} font-bold">{ret}</td>
                        <td class="{py_class} text-slate-600 {txt_class}" data-i18n="{c_key}_noise">{noise}</td>
                        <td class="{py_class} text-slate-800 font-medium {txt_class}" data-i18n="{c_key}_fundam">{fundam}</td>
                        <td class="{py_class} text-center pr-3 whitespace-nowrap"><span class="inline-block px-2.5 py-0.5 rounded {badge_bg} font-bold text-[10px] whitespace-nowrap" data-i18n="{c_key}_act">{dir_text}</span></td>
                    </tr>"""

    # 4. Read Base Template and Clean Slide Components
    with open(os.path.join(BASE_DIR, "src", "templates", "base.html"), "r", encoding="utf-8") as f:
        base_html = f.read()
    with open(os.path.join(BASE_DIR, "src", "components", "top_nav.html"), "r", encoding="utf-8") as f:
        top_nav = f.read()
    with open(os.path.join(BASE_DIR, "src", "components", "annotation_toolbar.html"), "r", encoding="utf-8") as f:
        toolbar = f.read()

    with open(os.path.join(BASE_DIR, "src", "components", "slide1.html"), "r", encoding="utf-8") as f:
        slide1_html = f.read()
    with open(os.path.join(BASE_DIR, "src", "components", "slide2.html"), "r", encoding="utf-8") as f:
        slide2_html = f.read()
    with open(os.path.join(BASE_DIR, "src", "components", "slide4.html"), "r", encoding="utf-8") as f:
        slide4_html = f.read()
    with open(os.path.join(BASE_DIR, "src", "components", "slide5.html"), "r", encoding="utf-8") as f:
        slide5_html = f.read()

    # Slide 3 (Topic template)
    slide3_template = cfg.get("slide3_template")
    if not slide3_template or not os.path.exists(os.path.join(BASE_DIR, slide3_template)):
        if "2026-08" in report_month:
            slide3_template = "src/components/slide3_august.html"
        else:
            slide3_template = "src/components/slide3.html"

    with open(os.path.join(BASE_DIR, slide3_template), "r", encoding="utf-8") as f:
        slide3_html = f.read()

    # 5. Dynamic Performance Data Slicing (Chart & Multi-Period Table)
    with open(os.path.join(BASE_DIR, "real_performance_series.json"), "r", encoding="utf-8") as f:
        series_data = json.load(f)

    # Inception is 2023-07. Settle date month mapping:
    # 2026-08 report -> settled 2026-09-03 -> target date 2026-09 (idx 38)
    # 2026-09 report -> settled 2026-10-05 -> target date 2026-10 (idx 39)
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

    # Compute exact multi-period matrix at idx_target
    i = idx_target
    i_prev = max(0, i - 1)
    i_3m = max(0, i - 3)
    i_1y = max(0, i - 12)
    years = max(1.0, i / 12.0)

    def calc_metrics(arr):
        v = arr[i]
        r1m = (v / arr[i_prev] - 1) * 100 if arr[i_prev] else 0.0
        r3m = (v / arr[i_3m] - 1) * 100 if arr[i_3m] else 0.0
        r1y = (v / arr[i_1y] - 1) * 100 if arr[i_1y] else 0.0
        r_ann = ((v / arr[0]) ** (1.0 / years) - 1) * 100 if arr[0] else 0.0
        r_cum = (v - 1.0) * 100
        return {"1m": r1m, "3m": r3m, "1y": r1y, "3y": r_ann, "cum": r_cum}

    m_cur = calc_metrics(chart_cur)
    m_past = calc_metrics(chart_past)
    m_sp = calc_metrics(chart_sp)
    m_msci = calc_metrics(chart_msci)
    m_alpha = {k: m_cur[k] - m_msci[k] for k in ["1m", "3m", "1y", "3y", "cum"]}

    def fmt_cell(val, is_alpha=False):
        sign = "+" if val >= 0 else ""
        if is_alpha:
            col = "text-emerald-800 font-bold" if val >= 0 else "text-rose-700 font-bold"
        else:
            col = "text-emerald-700 font-bold" if val >= 0 else "text-rose-600 font-semibold"
        return f'<td class="p-2 text-right {col} mono-num">{sign}{val:.2f}%</td>'

    matrix_tbody = f"""<tbody class="divide-y divide-slate-200 bg-white text-[12px]">
                                <tr class="bg-amber-50/70 font-bold">
                                    <td class="p-2 text-slate-900 flex items-center gap-1.5">
                                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
                                        <span data-i18n="row_cur">当前组合 (主动重组优化)</span>
                                    </td>
                                    {fmt_cell(m_cur["1m"])}
                                    {fmt_cell(m_cur["3m"])}
                                    {fmt_cell(m_cur["1y"])}
                                    {fmt_cell(m_cur["3y"])}
                                    <td class="p-2 text-right font-extrabold text-[#0f2347] bg-amber-100/80 mono-num">+{m_cur["cum"]:.2f}%</td>
                                </tr>
                                <tr class="hover:bg-slate-50 transition text-slate-700">
                                    <td class="p-2 font-semibold flex items-center gap-1.5">
                                        <span class="w-2.5 h-2.5 rounded bg-blue-600"></span>
                                        <span data-i18n="row_past">未重组组合 (旧组合对照组)</span>
                                    </td>
                                    {fmt_cell(m_past["1m"])}
                                    {fmt_cell(m_past["3m"])}
                                    {fmt_cell(m_past["1y"])}
                                    {fmt_cell(m_past["3y"])}
                                    <td class="p-2 text-right font-bold text-slate-700 bg-slate-50 mono-num">+{m_past["cum"]:.2f}%</td>
                                </tr>
                                <tr class="text-slate-600 hover:bg-slate-50 transition">
                                    <td class="p-2" data-i18n="row_sp">标普 500 指数 (同成立日)</td>
                                    {fmt_cell(m_sp["1m"])}
                                    {fmt_cell(m_sp["3m"])}
                                    {fmt_cell(m_sp["1y"])}
                                    {fmt_cell(m_sp["3y"])}
                                    <td class="p-2 text-right font-semibold bg-slate-50 mono-num">+{m_sp["cum"]:.2f}%</td>
                                </tr>
                                <tr class="text-slate-600 hover:bg-slate-50 transition">
                                    <td class="p-2" data-i18n="row_acwi">明晟全球指数 (同成立日)</td>
                                    {fmt_cell(m_msci["1m"])}
                                    {fmt_cell(m_msci["3m"])}
                                    {fmt_cell(m_msci["1y"])}
                                    {fmt_cell(m_msci["3y"])}
                                    <td class="p-2 text-right font-semibold bg-slate-50 mono-num">+{m_msci["cum"]:.2f}%</td>
                                </tr>
                                <tr class="bg-emerald-50/80 font-bold border-t-2 border-emerald-200 text-emerald-900">
                                    <td class="p-1.5 flex items-center gap-1.5">
                                        <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 9.586 14.586 7H12z" clip-rule="evenodd"></path></svg>
                                        <span data-i18n="row_alpha">超额收益 (相对明晟全球指数)</span>
                                    </td>
                                    {fmt_cell(m_alpha["1m"], is_alpha=True)}
                                    {fmt_cell(m_alpha["3m"], is_alpha=True)}
                                    {fmt_cell(m_alpha["1y"], is_alpha=True)}
                                    {fmt_cell(m_alpha["3y"], is_alpha=True)}
                                    <td class="p-1.5 text-right font-extrabold bg-emerald-100/90 mono-num text-emerald-950">+{m_alpha["cum"]:.2f}%</td>
                                </tr>
                            </tbody>"""

    # Inject dynamic matrix into Slide 1
    t1_start = slide1_html.find('<tbody class="divide-y divide-slate-200 bg-white text-[12px]">')
    if t1_start != -1:
        t1_end = slide1_html.find('</tbody>', t1_start) + len('</tbody>')
        slide1_html = slide1_html[:t1_start] + matrix_tbody + slide1_html[t1_end:]

    # Dynamic Month Badge and Settlement in Slide 1
    slide1_html = re.sub(r'<span class="text-amber-400 font-bold text-xs bg-slate-900/80 px-2.5 py-0.5 rounded border border-amber-500/50"[^>]*>[^<]+</span>',
                         f'<span class="text-amber-400 font-bold text-xs bg-slate-900/80 px-2.5 py-0.5 rounded border border-amber-500/50" data-i18n="s1_badge">{month_num_zh}月备忘录</span>',
                         slide1_html)
    slide1_html = re.sub(r'<span class="text-amber-300 font-extrabold text-xs mono-num" id="calc_date_display">[^<]+</span>',
                         f'<span class="text-amber-300 font-extrabold text-xs mono-num" id="calc_date_display">{settle_date}</span>',
                         slide1_html)
    slide1_html = re.sub(r'当月（\d+年\d+月）', f'当月（{year_str}年{month_num_zh}月）', slide1_html)
    slide1_html = re.sub(r'\d+个月真实净值走势', f'{seq_count}个月真实净值走势', slide1_html)
    slide1_html = re.sub(r'\(\d{4}\.\d{2}\s*-\s*\d{4}\.\d{2}\)', f'({chart_dates[0].replace("-", ".")} - {chart_dates[-1].replace("-", ".")})', slide1_html)
    slide1_html = re.sub(r'Alpha\s*[+\-]?\d+\.?\d*%', f'超额收益 +{m_alpha["cum"]:.2f}%', slide1_html)
    slide1_html = re.sub(r'<span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-xs">参考组合资产规模:[^<]+</span>', '', slide1_html)
    slide1_html = re.sub(r'底层\s*\d+\s*只优选基金构成与月度行情穿透', f'底层 {len(active_funds)} 只优选基金构成与月度行情穿透', slide1_html)

    # Dynamic Legend Return Numbers in Slide 1
    slide1_html = re.sub(r'<span id="lg_val_cur"[^>]*>[^<]+</span>', f'<span id="lg_val_cur" class="font-mono text-slate-900">+{m_cur["cum"]:.1f}%</span>', slide1_html)
    slide1_html = re.sub(r'<span id="lg_val_past"[^>]*>[^<]+</span>', f'<span id="lg_val_past" class="font-mono text-slate-900">+{m_past["cum"]:.1f}%</span>', slide1_html)
    slide1_html = re.sub(r'<span id="lg_val_acwi"[^>]*>[^<]+</span>', f'<span id="lg_val_acwi" class="font-mono text-slate-900">+{m_msci["cum"]:.1f}%</span>', slide1_html)
    slide1_html = re.sub(r'<span id="lg_val_sp"[^>]*>[^<]+</span>', f'<span id="lg_val_sp" class="font-mono text-slate-900">+{m_sp["cum"]:.1f}%</span>', slide1_html)

    # Pure Native Vector SVG for Slide 1 Performance Chart (Guarantees 100% Vector Sharpness in PDF & Web)
    s1_chart_svg = generate_performance_svg(chart_dates, chart_cur, chart_past, chart_sp, chart_msci, chart_events)
    if '<canvas id="lsSlide1RealLineChart"></canvas>' in slide1_html:
        slide1_html = slide1_html.replace('<canvas id="lsSlide1RealLineChart"></canvas>', s1_chart_svg)
    elif '<svg id="lsSlide1RealLineChart"' in slide1_html:
        slide1_html = re.sub(r'<svg id="lsSlide1RealLineChart".*?</svg>', s1_chart_svg, slide1_html, flags=re.DOTALL)

    # Dynamic Fund Table rows in Slide 1 (Supports any N active funds)
    tot_target_w = 0.0
    for h in active_funds:
        tw_str = str(h.get("target_weight", "0")).replace("%", "").strip()
        try:
            tot_target_w += float(tw_str)
        except Exception:
            pass
    if tot_target_w == 0.0:
        tot_target_w = 100.0

    slide1_html = re.sub(r'data-i18n="s1_holdings_title">[^<]+<', f'data-i18n="s1_holdings_title">底层 {len(active_funds)} 只优选基金构成与月度行情穿透<', slide1_html)
    slide1_html = re.sub(r'data-i18n="s1_total_weight">[^<]+<', f'data-i18n="s1_total_weight">权重加总: {tot_target_w:.1f}%<', slide1_html)

    dyn_i18n_zh["s1_holdings_title"] = f"底层 {len(active_funds)} 只优选基金构成与月度行情穿透"
    dyn_i18n_en["s1_holdings_title"] = f"{len(active_funds)} Underlying Core Funds & Monthly Attribution"
    dyn_i18n_zh["s1_total_weight"] = f"权重加总: {tot_target_w:.1f}%"
    dyn_i18n_en["s1_total_weight"] = f"Total Target Weight: {tot_target_w:.1f}%"

    role_map = {
        "FULLERTON": ("全天候底仓", "35.00%", "f_role_1"),
        "EASTSPRING": ("科技成长", "15.00%", "f_role_2"),
        "JANUS": ("生命科学", "15.00%", "f_role_3"),
        "GOLD": ("黄金对冲", "15.00%", "f_role_4"),
        "CHINA": ("中国创新", "12.00%", "f_role_5"),
        "FSSA": ("亚洲主题", "4.00%", "f_role_6"),
        "NIKKO": ("日本高息", "4.00%", "f_role_7"),
    }
    s1_fund_rows = ""
    for h in active_funds:
        fname = h.get("fund_name", "")
        ret = h.get("return_1m", "0.00%")
        role = h.get("role") or "核心优选"
        tgt_wt = h.get("target_weight") or "—"
        role_i18n = ""
        for k, (r, w, i_key) in role_map.items():
            if k in fname.upper():
                role = r
                if tgt_wt == "—":
                    tgt_wt = w
                role_i18n = i_key
                break

        cur_wt = h.get("current_weight", tgt_wt)
        nav_str = h.get("nav", "—")
        contrib_str = h.get("contrib_1m", "")

        if not contrib_str:
            try:
                r_num = float(re.sub(r'[^\d\.\-]', '', str(ret))) if re.search(r'\d', str(ret)) else 0.0
                if '-' in str(ret): r_num = -abs(r_num)
                w_num = float(re.sub(r'[^\d\.\-]', '', str(cur_wt))) if re.search(r'\d', str(cur_wt)) else 0.0
                contrib_val = (r_num * w_num) / 100.0
                contrib_str = f"{'+' if contrib_val>=0 else ''}{contrib_val:.2f}%"
            except Exception:
                contrib_str = "—"

        ret_color = "text-emerald-700 font-bold" if str(ret).startswith("+") else "text-rose-600 font-semibold"
        contrib_color = "text-emerald-800 font-bold" if contrib_str.startswith("+") else ("text-rose-700 font-bold" if contrib_str.startswith("-") else "text-slate-600")

        i18n_attr = f'data-i18n="{role_i18n}"' if role_i18n else ''
        s1_fund_rows += f"""
                        <tr>
                            <td class="p-1.5 pl-2 font-bold text-slate-800" {i18n_attr}>{role}</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">{fname}</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">{tgt_wt}</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">{cur_wt}</td>
                            <td class="p-1.5 text-right text-slate-700 mono-num">{nav_str}</td>
                            <td class="p-1.5 text-right {ret_color} mono-num">{ret}</td>
                            <td class="p-1.5 text-right pr-2 {contrib_color} mono-num">{contrib_str}</td>
                        </tr>"""

    # Replace the tbody in Slide 1 fund table
    t2_start = slide1_html.find('<tbody class="divide-y divide-slate-200 bg-white text-[11.5px]">')
    if t2_start != -1:
        t2_end = slide1_html.find('</tbody>', t2_start) + len('</tbody>')
        slide1_html = slide1_html[:t2_start] + '<tbody class="divide-y divide-slate-200 bg-white text-[11.5px]">\n' + s1_fund_rows + '\n                    </tbody>' + slide1_html[t2_end:]

    slide1_html = slide1_html.replace("{{QUALITATIVE_VIEW}}", qualitative_view)
    slide1_html = slide1_html.replace("{{REBALANCE_VERDICT}}", rebalance_verdict)
    slide1_html = slide1_html.replace("{{REBALANCE_NOTE}}", rebalance_note)

    # 6. Dynamic Slide 2 (Macro & Star Ratings)
    slide2_html = re.sub(r'\d+月重点资产月度回报', f'{month_num_zh}月重点资产月度回报', slide2_html)
    slide2_html = re.sub(r'彭博与投研综合数据 \(P\.\d+\)', f'彭博与投研综合数据 (第{p_returns}页)', slide2_html)
    slide2_html = re.sub(r'iFAST 官方榜单 \(P\.\d+\)', f'官方榜单 (第{p_stars}页)', slide2_html)
    slide2_html = slide2_html.replace("{{CONFLICT_NOTE}}", conflict_note)

    # 7. Dynamic Slide 3 (Topic)
    slide3_topic_title = cfg.get("slide3_topic_title", "月度专题深度：当债券不再扮演债券")
    slide3_html = re.sub(r'月度专题研读 · [^\s<]+', f'月度专题研读 · {year_str}年{month_num_zh}月', slide3_html)
    slide3_html = re.sub(r'data-i18n="s3_tag">[^<]+<', f'data-i18n="s3_tag">月度专题研读 · {year_str}年{month_num_zh}月<', slide3_html)
    slide3_html = re.sub(r'data-i18n="s3_title">[^<]+<', f'data-i18n="s3_title">{slide3_topic_title}<', slide3_html)

    # Pure Native Vector SVG for Slide 3 Frontier Chart (if slide3.html template is used)
    if "slide3.html" in slide3_template:
        s3_frontier_svg = generate_frontier_svg(lang="zh")
        if '<canvas id="lsFrontierChart"></canvas>' in slide3_html:
            slide3_html = slide3_html.replace('<canvas id="lsFrontierChart"></canvas>', s3_frontier_svg)
        elif '<svg id="lsFrontierChart"' in slide3_html:
            slide3_html = re.sub(r'<svg id="lsFrontierChart".*?</svg>', s3_frontier_svg, slide3_html, flags=re.DOTALL)

    # 8. Dynamic Slide 4 (Conviction Matrix)
    slide4_html = re.sub(r'\d+月份信念审查决策矩阵', f'{month_num_zh}月份信念审查决策矩阵', slide4_html)
    slide4_html = re.sub(r'\d+月回报', f'{month_num_zh}月回报', slide4_html)
    slide4_html = slide4_html.replace("{{CONVICTION_ROWS}}", conviction_rows)
    slide4_html = slide4_html.replace("{{REBALANCE_BOX}}", rebalance_box_html)
    slide4_html = slide4_html.replace("{{REBALANCE_VERDICT}}", rebalance_verdict)
    slide4_html = slide4_html.replace("{{REBALANCE_NOTE}}", rebalance_note)

    # 9. Clean Main JS & i18n Embedding
    with open(os.path.join(BASE_DIR, "src", "data", "i18n.js"), "r", encoding="utf-8") as f:
        i18n_code = f.read()

    # Dynamic i18n updates for manager inputs & conviction table
    qualitative_view_en = mgr_input.get("qualitative_view_en", qualitative_view)
    rebalance_note_en = mgr_input.get("rebalance_note_en", rebalance_note)

    dyn_i18n_zh["s1_card_desc"] = qualitative_view.replace("\n", "<br>")
    dyn_i18n_en["s1_card_desc"] = qualitative_view_en.replace("\n", "<br>")

    verdict_zh = rebalance_verdict
    verdict_en = "HOLD" if rebalance_verdict in ["持有", "坚持持有"] else ("REBALANCE" if rebalance_verdict in ["调仓", "主动调仓"] else "REPLACE")
    dyn_i18n_zh["s1_verdict_badge"] = verdict_zh
    dyn_i18n_en["s1_verdict_badge"] = verdict_en
    dyn_i18n_zh["s1_exec_directive_label"] = "月度执行指令："
    dyn_i18n_en["s1_exec_directive_label"] = "Monthly Execution Directive: "
    dyn_i18n_zh["s1_exec_directive"] = rebalance_note
    dyn_i18n_en["s1_exec_directive"] = rebalance_note_en

    dyn_i18n_zh["s4_foot_box"] = f"<strong>月度调仓结论：</strong>{rebalance_note}"
    dyn_i18n_en["s4_foot_box"] = f"<strong>Rebalancing Verdict:</strong> {rebalance_note_en}"
    dyn_i18n_zh["s4_verdict_label"] = "月度调仓结论："
    dyn_i18n_en["s4_verdict_label"] = "Monthly Rebalancing Verdict: "
    dyn_i18n_zh["s4_verdict_note"] = rebalance_note
    dyn_i18n_en["s4_verdict_note"] = rebalance_note_en
    dyn_i18n_zh["s4_memo_badge"] = "持仓变动执行"
    dyn_i18n_en["s4_memo_badge"] = "PORTFOLIO ALTERATION"
    dyn_i18n_zh["s4_memo_link_btn"] = "查阅持仓变动详细说明备忘录 (Google Drive 附件) →"
    dyn_i18n_en["s4_memo_link_btn"] = "View Rebalancing & Alteration Memorandum (Google Drive Attachment) →"

    # Inject dynamic keys into i18n_code
    zh_injection = "".join([f"\n                {k}: {json.dumps(v, ensure_ascii=False)}," for k, v in dyn_i18n_zh.items()])
    en_injection = "".join([f"\n                {k}: {json.dumps(v, ensure_ascii=False)}," for k, v in dyn_i18n_en.items()])

    i18n_code = i18n_code.replace("zh: {", f"zh: {{{zh_injection}", 1)
    i18n_code = i18n_code.replace("en: {", f"en: {{{en_injection}", 1)

    with open(os.path.join(BASE_DIR, "src", "js", "main.js"), "r", encoding="utf-8") as f:
        main_js = f.read()

    # Ensure all double curly braces are single curly braces for valid JS
    main_js = main_js.replace('{{', '{').replace('}}', '}')


    # 10. Assemble 5-Slide HTML (Strictly exclude Slide 6 from the Monthly Memo)
    final_html = base_html.replace("{{TOP_NAV}}", top_nav)
    final_html = final_html.replace("{{SLIDE_1}}", slide1_html)
    final_html = final_html.replace("{{SLIDE_2}}", slide2_html)
    final_html = final_html.replace("{{SLIDE_3}}", slide3_html)
    final_html = final_html.replace("{{SLIDE_4}}", slide4_html)
    final_html = final_html.replace("{{SLIDE_5}}", slide5_html)
    final_html = final_html.replace("{{SLIDE_6}}", "") # Slide 6 is strictly a standalone factsheet
    final_html = final_html.replace("{{ANNOTATION_TOOLBAR}}", toolbar)
    final_html = final_html.replace("{{I18N_JS}}", i18n_code)
    final_html = final_html.replace("{{MAIN_JS}}", main_js)

    # 11. Write outputs
    out_dir = os.path.join(BASE_DIR, "output")
    os.makedirs(out_dir, exist_ok=True)
    monthly_html_file = os.path.join(out_dir, f"iFAST_Equity_Growth_Monthly_Report_{report_month}.html")
    latest_html_file = os.path.join(BASE_DIR, "iFAST_Equity_Growth_Monthly_Report_Latest.html")

    with open(monthly_html_file, "w", encoding="utf-8") as f:
        f.write(final_html)
    with open(latest_html_file, "w", encoding="utf-8") as f:
        f.write(final_html)

    # Also trigger standalone factsheets (Chinese and English)
    from generate_portfolio_factsheet import generate_standalone_factsheet
    fs = generate_standalone_factsheet(month=report_month, date_str=settle_date)

    print(f"✅ Successfully compiled 5-Slide Report for {report_month}: {monthly_html_file}")
    return {
        "monthly_html": monthly_html_file,
        "latest_html": latest_html_file,
        "matched_pages": matched_sections,
        "factsheet_zh": fs["zh_html"],
        "factsheet_en": fs["en_html"]
    }

if __name__ == "__main__":
    generate_report("2026-09")
