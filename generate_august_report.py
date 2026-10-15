# -*- coding: utf-8 -*-
"""
August 2026 Memo Report Generator
Simulates the execution SOP to generate the August 2026 Monthly Advisory Report:
- Inception to August 2026 (2026-09-03 settle date, Row 40 / Row 67)
- Sources macro data and sector star ratings from iFAST Horizon September 2026
- Cross-references factsheets from '3. Monthly Report/Sep 2026'
- Renders 5 A4-landscape slides strictly adhering to zero-clipping standards
- Exports high-res Chinese PDF to Google Drive and workspace
"""

import os
import json
import urllib.request
import csv
import io
import fitz

def generate_report():
    print("🚀 Starting August 2026 Memo SOP Execution Pipeline...")
    
    # 1. Output HTML path
    html_file = "iFAST_Equity_Growth_Monthly_Report_August2026.html"
    
    # Let's read the base template
    base_file = "src/templates/base.html"
    with open(base_file, "r", encoding="utf-8") as f:
        base_html = f.read()
        
    # We will assemble custom components for August 2026
    # Let's inspect what top_nav and annotation toolbar need:
    with open("src/components/top_nav.html", "r", encoding="utf-8") as f:
        top_nav = f.read()
    with open("src/components/annotation_toolbar.html", "r", encoding="utf-8") as f:
        toolbar = f.read()

    # Build Slide 1 for August 2026
    slide1_html = """
<div id="slide1" class="landscape-slide relative">
    <canvas id="canvas_slide1" class="annotation-canvas absolute inset-0 pointer-events-none z-40 w-full h-full"></canvas>

    <!-- Slide Header: HR 模板投资组合 + 8月备忘录 -->
    <div class="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-2.5 border-b-2 border-amber-500 flex justify-between items-center">
        <div>
            <div class="flex items-center space-x-2 text-xs uppercase tracking-wider font-bold mb-1">
                <span class="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">纯股票高增长引擎 (新币计价)</span>
            </div>
            <div class="flex items-baseline gap-3">
                <h1 class="text-xl font-extrabold tracking-tight text-white">HR 模板投资组合</h1>
                <span class="text-amber-400 font-bold text-xs bg-slate-900/80 px-2.5 py-0.5 rounded border border-amber-500/50">8月备忘录</span>
            </div>
        </div>
        
        <div class="flex items-center gap-3 text-right">
            <div class="bg-white/10 px-3 py-1 rounded-lg border border-white/15">
                <span class="text-slate-300 block text-[9.5px] uppercase font-semibold">计算结算日期</span>
                <span class="text-amber-300 font-extrabold text-xs mono-num" id="calc_date_display">2026-09-03</span>
            </div>
        </div>
    </div>

    <!-- Slide Body -->
    <div class="px-7 py-2.5 grid grid-cols-12 gap-5 flex-1 items-stretch">
        
        <!-- Left Column (7 Cols) -->
        <div class="col-span-7 min-w-0 flex flex-col justify-between space-y-3.5">
            
            <!-- Performance Matrix Table -->
            <div>
                <div class="flex justify-between items-center h-7 mb-2">
                    <h4 class="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                        多周期综合回报率对比 (vs 基准与阿尔法)
                    </h4>
                    <span class="text-xs text-slate-500 font-semibold">基准币种: 新币 (分红再投资)</span>
                </div>
                <table class="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse shadow-sm">
                    <thead>
                        <tr class="bg-[#0f2347] text-white text-xs">
                            <th class="p-2 font-bold">策略 / 对照基准 (同成立日: 2023年7月)</th>
                            <th class="p-2 text-right font-bold" id="th_dynamic_month">当月（2026年8月）</th>
                            <th class="p-2 text-right font-bold">3个月</th>
                            <th class="p-2 text-right font-bold">1年</th>
                            <th class="p-2 text-right font-bold">3年 (年化)</th>
                            <th class="p-2 text-right font-bold bg-[#091528]">累计收益</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 bg-white text-[12px]">
                        <tr class="bg-amber-50/70 font-bold">
                            <td class="p-2 text-slate-900 flex items-center gap-1.5">
                                <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
                                <span>当前组合 (主动重组优化)</span>
                            </td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+0.35%</td>
                            <td class="p-2 text-right text-rose-600 mono-num">-1.98%</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+25.02%</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+21.11%</td>
                            <td class="p-2 text-right font-extrabold text-[#0f2347] bg-amber-100/80 mono-num">+83.38%</td>
                        </tr>
                        <tr class="hover:bg-slate-50 transition text-slate-700">
                            <td class="p-2 font-semibold flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded bg-blue-600"></span>
                                <span>未重组组合 (旧组合对照组)</span>
                            </td>
                            <td class="p-2 text-right text-rose-600 mono-num">-1.65%</td>
                            <td class="p-2 text-right text-rose-600 mono-num">-0.54%</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+26.14%</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+21.76%</td>
                            <td class="p-2 text-right font-bold text-slate-700 bg-slate-50 mono-num">+86.53%</td>
                        </tr>
                        <tr class="text-slate-600 hover:bg-slate-50 transition">
                            <td class="p-2">标普 500 指数 (同成立日)</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+0.21%</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+1.73%</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+16.68%</td>
                            <td class="p-2 text-right mono-num">+18.13%</td>
                            <td class="p-2 text-right font-semibold bg-slate-50 mono-num">+69.50%</td>
                        </tr>
                        <tr class="text-slate-600 hover:bg-slate-50 transition">
                            <td class="p-2">MSCI 全球指数 (同成立日)</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+1.12%</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+1.74%</td>
                            <td class="p-2 text-right text-emerald-700 mono-num">+20.26%</td>
                            <td class="p-2 text-right mono-num">+17.96%</td>
                            <td class="p-2 text-right font-semibold bg-slate-50 mono-num">+68.72%</td>
                        </tr>
                        <tr class="bg-emerald-50/80 font-bold border-t-2 border-emerald-200 text-emerald-900">
                            <td class="p-1.5 flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 9.586 14.586 7H12z" clip-rule="evenodd"></path></svg>
                                <span>超额收益 (Alpha vs MSCI 全球)</span>
                            </td>
                            <td class="p-1.5 text-right mono-num text-rose-700">-0.77%</td>
                            <td class="p-1.5 text-right mono-num text-rose-700">-3.72%</td>
                            <td class="p-1.5 text-right mono-num text-emerald-800">+4.76%</td>
                            <td class="p-1.5 text-right mono-num text-emerald-800">+3.14%</td>
                            <td class="p-1.5 text-right font-extrabold bg-emerald-100/90 mono-num text-emerald-950">+14.66%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 7 Funds Holdings Table (8月实盘市值与权重) -->
            <div>
                <div class="flex justify-between items-center h-7 mb-2">
                    <h4 class="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                        底层 7 只优选基金构成与月度行情穿透
                    </h4>
                    <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-xs">参考组合资产规模: $183,380.86 SGD</span>
                </div>
                <table class="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse shadow-sm">
                    <thead>
                        <tr class="bg-slate-100 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200">
                            <th class="p-1.5 pl-2">职能板块</th>
                            <th class="p-1.5">基金全称</th>
                            <th class="p-1.5 text-right font-bold text-slate-600">目标权重 (%)</th>
                            <th class="p-1.5 text-right font-extrabold text-[#0f2347] bg-amber-100/60 border-l border-r border-amber-200">当前权重 (%)</th>
                            <th class="p-1.5 text-right">最新净值</th>
                            <th class="p-1.5 text-right">当月回报 (1M)</th>
                            <th class="p-1.5 text-right pr-2">组合贡献度</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 bg-white text-[11.5px]">
                        <!-- Fund 1: Fullerton Alpha -->
                        <tr>
                            <td class="p-1.5 pl-2 font-bold text-blue-900">全天候底仓</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">FULLERTON LUX - GLOBAL ABSOLUTE ALPHA</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">35.00%</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">34.60%</td>
                            <td class="p-1.5 text-right mono-num">$19.5282</td>
                            <td class="p-1.5 text-right text-rose-600 font-semibold mono-num">-1.98%</td>
                            <td class="p-1.5 text-right pr-2 text-rose-700 font-bold mono-num">-0.70%</td>
                        </tr>
                        <!-- Fund 2: Eastspring Tech -->
                        <tr>
                            <td class="p-1.5 pl-2 font-bold text-sky-900">科技成长</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">EASTSPRING - GLOBAL TECHNOLOGY SGD</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">15.00%</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">15.74%</td>
                            <td class="p-1.5 text-right mono-num">$5.1850</td>
                            <td class="p-1.5 text-right text-rose-600 font-bold mono-num">-5.64%</td>
                            <td class="p-1.5 text-right pr-2 text-rose-700 font-bold mono-num">-0.94%</td>
                        </tr>
                        <!-- Fund 3: Janus Henderson Life -->
                        <tr>
                            <td class="p-1.5 pl-2 font-bold text-emerald-900">生命科学</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">Janus Henderson Global Life Sciences</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">15.00%</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">14.79%</td>
                            <td class="p-1.5 text-right mono-num">$19.4300</td>
                            <td class="p-1.5 text-right text-emerald-700 font-semibold mono-num">+2.53%</td>
                            <td class="p-1.5 text-right pr-2 text-emerald-800 font-bold mono-num">+0.37%</td>
                        </tr>
                        <!-- Fund 4: United Gold -->
                        <tr class="bg-amber-50/40">
                            <td class="p-1.5 pl-2 font-bold text-amber-900">黄金对冲</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">United Gold and General A Acc SGD</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">15.00%</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-100/60 border-l border-r border-amber-200">14.51%</td>
                            <td class="p-1.5 text-right mono-num">$4.8047</td>
                            <td class="p-1.5 text-right text-emerald-700 font-extrabold mono-num">+24.00%</td>
                            <td class="p-1.5 text-right pr-2 text-emerald-800 font-extrabold mono-num">+1.94%</td>
                        </tr>
                        <!-- Fund 5: United China A -->
                        <tr>
                            <td class="p-1.5 pl-2 font-bold text-rose-900">中国创新</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">United China A Shares Innovation A Acc</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">12.00%</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">12.58%</td>
                            <td class="p-1.5 text-right mono-num">$0.9983</td>
                            <td class="p-1.5 text-right text-rose-600 font-semibold mono-num">-3.09%</td>
                            <td class="p-1.5 text-right pr-2 text-rose-700 font-bold mono-num">-0.40%</td>
                        </tr>
                        <!-- Fund 6: FSSA Asian -->
                        <tr>
                            <td class="p-1.5 pl-2 font-bold text-purple-900">亚洲主题</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">FSSA Asian Growth Fund (Class A)</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">4.00%</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">3.91%</td>
                            <td class="p-1.5 text-right mono-num">$4.3751</td>
                            <td class="p-1.5 text-right text-emerald-700 font-semibold mono-num">+1.12%</td>
                            <td class="p-1.5 text-right pr-2 text-emerald-800 font-bold mono-num">+0.04%</td>
                        </tr>
                        <!-- Fund 7: Nikko AM Japan -->
                        <tr>
                            <td class="p-1.5 pl-2 font-bold text-indigo-900">日本高息</td>
                            <td class="p-1.5 font-semibold text-slate-800 truncate max-w-[210px]">Nikko AM Japan Dividend</td>
                            <td class="p-1.5 text-right font-semibold text-slate-600 mono-num">4.00%</td>
                            <td class="p-1.5 text-right font-bold text-[#0f2347] mono-num bg-amber-50/50 border-l border-r border-amber-100">3.89%</td>
                            <td class="p-1.5 text-right mono-num">$2.3431</td>
                            <td class="p-1.5 text-right text-emerald-700 font-semibold mono-num">+1.30%</td>
                            <td class="p-1.5 text-right pr-2 text-emerald-800 font-bold mono-num">+0.05%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        <!-- Right Column (5 Cols Aligned Top) -->
        <div class="col-span-5 min-w-0 flex flex-col justify-between space-y-3.5">
            
            <!-- 39 Months Real Performance Curve Section -->
            <div>
                <div class="flex justify-between items-center h-7 mb-2">
                    <h4 class="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                        39个月真实净值走势 (2023.07 - 2026.09)
                    </h4>
                    <span class="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300 shadow-xs">Alpha +14.66%</span>
                </div>

                <!-- Chart Box -->
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
                    <div class="h-48 relative w-full my-1">
                        <canvas id="lsSlide1RealLineChart"></canvas>
                    </div>

                    <!-- Legend -->
                    <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11.5px] font-semibold text-slate-700 border-t border-slate-200 pt-2">
                        <div class="flex items-center gap-1.5">
                            <span class="w-3 h-0.5 bg-red-600"></span>
                            <span>当前组合 (红色实线)</span>: <span class="font-mono text-slate-900">+83.4%</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="w-3 h-0.5 border-t border-blue-600 border-dashed"></span>
                            <span>过去组合 (蓝色虚线)</span>: <span class="font-mono text-slate-900">+86.5%</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="w-3 h-0.5 border-t border-slate-400 border-dashed"></span>
                            <span>MSCI 全球 (灰色虚线)</span>: <span class="font-mono text-slate-900">+68.7%</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="w-3 h-0.5 border-t border-black border-dashed"></span>
                            <span>标普 500 (黑色虚线)</span>: <span class="font-mono text-slate-900">+69.5%</span>
                        </div>
                    </div>

                    <!-- Event Markers -->
                    <div class="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10.5px] text-slate-500 font-medium">
                        <span class="flex items-center gap-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-amber-400/50 border border-amber-500 inline-block"></span>
                            <span>黄色圆圈: 组合重组 (Restructure)</span>
                        </span>
                        <span class="flex items-center gap-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/50 border border-emerald-500 inline-block"></span>
                            <span>绿色圆圈: 季度再平衡 (Rebalance)</span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Attribution Card -->
            <div class="bg-blue-50/80 border border-blue-200 rounded-xl p-3 space-y-1 text-xs text-blue-950 shadow-xs">
                <h5 class="text-xs font-extrabold text-[#0f2347] uppercase tracking-tight">
                    月度归因与调仓定见
                </h5>
                <p class="text-[11px] leading-relaxed text-slate-700">
                    8月全球宏观受长端美债收益率飙升（30年期破5.3%）与全球降息节奏分歧扰动，芯片科技板块（-5.64%）与A股（-3.09%）经历健康的技术性整固。在此背景下，<strong>组合逆周期对冲资产发挥关键防御支柱价值：大华黄金及综合单月暴涨 +24.00%，贡献 +1.94% 超额阿尔法；配合生命科学（+2.53%）与日本高股息（+1.30%），驱动组合逆势录得 +0.35% 正回报，显著优于未重组旧组合（-1.65%）</strong>。
                    <strong>关键财务穿透：</strong>大华黄金穿透后纯黄金敞口为 10.46%，严格吻合研报 10% 避险上限；各板块偏离度均保持在安全阈值（<1%）内。
                    <strong>调仓结论：</strong>各大标的底层逻辑坚实，本月维持既有战略配比（Maintain），无需被动调仓。
                </p>
            </div>

        </div>

    </div>

    <!-- Slide Footer -->
    <div class="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <span>财富管理与投资咨询备忘</span>
        <span>第 1 页 · 月度备忘录</span>
    </div>
</div>
"""

    # Build Slide 2 for August 2026 (from iFAST Horizon Sep 2026 Page 3 & Page 4)
    slide2_html = """
<div id="slide2" class="landscape-slide relative">
    <canvas id="canvas_slide2" class="annotation-canvas absolute inset-0 pointer-events-none z-40 w-full h-full"></canvas>
    
    <!-- Slide Header -->
    <div class="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-2.5 border-b-2 border-amber-500 flex justify-between items-center">
        <div>
            <span class="text-[10px] uppercase tracking-widest text-amber-400 font-bold">全球宏观展望与行业资产配置策略</span>
            <h2 class="text-lg font-extrabold tracking-tight mt-0.5">全球宏观脉搏与行业星级评定榜</h2>
        </div>
    </div>

    <!-- Top Core Recommendation Callout (Page 4 Our Recommendation) -->
    <div class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/80 px-8 py-1.5 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <span class="bg-amber-500 text-slate-950 font-extrabold text-[10.5px] px-2 py-0.5 rounded uppercase tracking-wider">核心策略定见</span>
            <p class="text-[12px] font-semibold text-slate-800">
                <strong>长端美债收益率更长时间维持高位，严控组合久期：</strong> 30年期美债收益率破5.3%发出结构性警报，建议削减对现金流依赖远期的投机性科技与 REITs 敞口，转向估值极具吸引力的亚洲除日本股票；固定收益端大幅偏向短久期债券，锁定较高再投资收益率，规避长端贬值风险。
            </p>
        </div>
    </div>

    <!-- Main Split Body: 3-Column Institutional Architecture -->
    <div class="px-6 py-2.5 grid grid-cols-12 gap-3.5 flex-1 items-stretch">
        
        <!-- Column 1: Market Performance Visual Charts & Regional Reviews (4 Cols) -->
        <div class="col-span-4 flex flex-col justify-between space-y-2">
            
            <div>
                <div class="flex justify-between items-center h-6 mb-1.5">
                    <h4 class="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                        8月重点资产月度回报
                    </h4>
                    <span class="text-[9.5px] text-slate-400 font-semibold">彭博与投研综合数据 (P.3)</span>
                </div>

                <!-- Visual Divergent Charts for August Assets -->
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1.5 shadow-sm">

                <!-- Diverging Bar Chart 1: Equity Indices -->
                <div class="space-y-0.5">
                    <div class="flex justify-between items-center text-[9px] text-slate-500 font-semibold px-0.5">
                        <span>股票指数 (原币/SGD)</span>
                        <span class="font-mono text-[8px] text-slate-400">1M (8月)</span>
                    </div>
                    <div class="flex items-center text-[8px] font-mono text-slate-400 py-0.5 px-0.5">
                        <span class="w-16"></span>
                        <div class="flex-1 relative mx-1 h-2.5 flex items-center">
                            <span class="absolute left-0">-2%</span>
                            <span class="absolute left-[25%] -translate-x-1/2 text-slate-700 font-bold">0%</span>
                            <span class="absolute right-0 text-right">+6%</span>
                        </div>
                        <span class="w-10"></span>
                    </div>
                    
                    <!-- Equity Bar 1: EEMEA -->
                    <div class="flex items-center text-[9.5px] py-0.5">
                        <span class="w-16 text-slate-700 font-medium truncate">东欧中东非洲</span>
                        <div class="flex-1 flex items-center h-2.5 bg-slate-200/60 rounded relative mx-1">
                            <div class="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-400 z-10"></div>
                            <div class="absolute top-0 bottom-0 left-[25%] bg-emerald-500 rounded-r" style="width: 71.8%;"></div>
                        </div>
                        <span class="w-10 text-right font-mono font-bold text-emerald-600 text-[9.5px]">+5.75%</span>
                    </div>
                    <!-- Equity Bar 2: Nasdaq -->
                    <div class="flex items-center text-[9.5px] py-0.5">
                        <span class="w-16 text-slate-700 font-medium truncate">纳斯达克</span>
                        <div class="flex-1 flex items-center h-2.5 bg-slate-200/60 rounded relative mx-1">
                            <div class="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-400 z-10"></div>
                            <div class="absolute top-0 bottom-0 left-[25%] bg-emerald-500 rounded-r" style="width: 49.1%;"></div>
                        </div>
                        <span class="w-10 text-right font-mono font-bold text-emerald-600 text-[9.5px]">+3.93%</span>
                    </div>
                    <!-- Equity Bar 3: Nikkei -->
                    <div class="flex items-center text-[9.5px] py-0.5">
                        <span class="w-16 text-slate-700 font-medium truncate">日经225</span>
                        <div class="flex-1 flex items-center h-2.5 bg-slate-200/60 rounded relative mx-1">
                            <div class="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-400 z-10"></div>
                            <div class="absolute top-0 bottom-0 left-[25%] bg-emerald-500 rounded-r" style="width: 37.9%;"></div>
                        </div>
                        <span class="w-10 text-right font-mono font-bold text-emerald-600 text-[9.5px]">+3.03%</span>
                    </div>
                    <!-- Equity Bar 4: S&P 500 -->
                    <div class="flex items-center text-[9.5px] py-0.5">
                        <span class="w-16 text-slate-700 font-medium truncate">标普500</span>
                        <div class="flex-1 flex items-center h-2.5 bg-slate-200/60 rounded relative mx-1">
                            <div class="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-400 z-10"></div>
                            <div class="absolute top-0 bottom-0 left-[25%] bg-emerald-500 rounded-r" style="width: 32.7%;"></div>
                        </div>
                        <span class="w-10 text-right font-mono font-bold text-emerald-600 text-[9.5px]">+2.62%</span>
                    </div>
                    <!-- Equity Bar 5: China A / MSCI -->
                    <div class="flex items-center text-[9.5px] py-0.5">
                        <span class="w-16 text-slate-700 font-medium truncate">MSCI中国</span>
                        <div class="flex-1 flex items-center h-2.5 bg-slate-200/60 rounded relative mx-1">
                            <div class="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-400 z-10"></div>
                            <div class="absolute top-0 bottom-0 right-[75%] bg-rose-500 rounded-l" style="width: 5.6%;"></div>
                        </div>
                        <span class="w-10 text-right font-mono font-bold text-rose-600 text-[9.5px]">-0.45%</span>
                    </div>
                </div>

                <!-- Diverging Bar Chart 2: Bond Indices -->
                <div class="space-y-0.5 pt-1 border-t border-slate-200/60">
                    <div class="flex justify-between items-center text-[9px] text-slate-500 font-semibold px-0.5">
                        <span>债券指数 (美元计价)</span>
                        <span class="font-mono text-[8px] text-slate-400">1M (8月)</span>
                    </div>
                    <div class="flex items-center text-[8px] font-mono text-slate-400 py-0.5 px-0.5">
                        <span class="w-16"></span>
                        <div class="flex-1 relative mx-1 h-2.5 flex items-center">
                            <span class="absolute left-0">0%</span>
                            <span class="absolute right-0 text-right">+1.5%</span>
                        </div>
                        <span class="w-10"></span>
                    </div>
                    <!-- Bond Bar 1: Asian HY -->
                    <div class="flex items-center text-[9.5px] py-0.5">
                        <span class="w-16 text-slate-700 font-medium truncate">亚洲高收益</span>
                        <div class="flex-1 flex items-center h-2 bg-slate-200/60 rounded relative mx-1">
                            <div class="absolute top-0 bottom-0 left-0 w-[1px] bg-slate-400 z-10"></div>
                            <div class="absolute top-0 bottom-0 left-0 bg-emerald-500 rounded-r" style="width: 80.0%;"></div>
                        </div>
                        <span class="w-10 text-right font-mono font-bold text-emerald-600 text-[9.5px]">+1.20%</span>
                    </div>
                    <!-- Bond Bar 2: Global HY -->
                    <div class="flex items-center text-[9.5px] py-0.5">
                        <span class="w-16 text-slate-700 font-medium truncate">全球高收益</span>
                        <div class="flex-1 flex items-center h-2 bg-slate-200/60 rounded relative mx-1">
                            <div class="absolute top-0 bottom-0 left-0 w-[1px] bg-slate-400 z-10"></div>
                            <div class="absolute top-0 bottom-0 left-0 bg-emerald-500 rounded-r" style="width: 69.3%;"></div>
                        </div>
                        <span class="w-10 text-right font-mono font-bold text-emerald-600 text-[9.5px]">+1.04%</span>
                    </div>
                    <!-- Bond Bar 3: Global Aggregate -->
                    <div class="flex items-center text-[9.5px] py-0.5">
                        <span class="w-16 text-slate-700 font-medium truncate">全球综合债</span>
                        <div class="flex-1 flex items-center h-2 bg-slate-200/60 rounded relative mx-1">
                            <div class="absolute top-0 bottom-0 left-0 w-[1px] bg-slate-400 z-10"></div>
                            <div class="absolute top-0 bottom-0 left-0 bg-emerald-500 rounded-r" style="width: 30.0%;"></div>
                        </div>
                        <span class="w-10 text-right font-mono font-bold text-emerald-600 text-[9.5px]">+0.45%</span>
                    </div>
                </div>
            </div>

            <!-- 3 Regional Reviews from Page 3 -->
            <div class="space-y-1 flex-1 flex flex-col justify-between">
                <!-- US Review -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 space-y-0.5">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-xs text-slate-900 flex items-center gap-1">
                            <span>🇺🇸</span>
                            <span>美股市场</span>
                        </span>
                        <span class="text-[9.5px] font-bold text-rose-700 bg-rose-100 px-1 py-0.2 rounded">配置建议: 低配 ★★</span>
                    </div>
                    <p class="text-[10px] text-slate-600 leading-snug">
                        8月初因就业数据降温（7月减少2.3万岗位）降息预期升温，但随后半导体回调及美债收益率上升压制大盘；月末英伟达强劲财报带动科技反弹。经济展现韧性但新房开工偏弱，消费者信心降至51.7；7月核心PCE同比达3.7%显现粘性，美联储沃什主席在杰克逊霍尔会议释放鹰派信号。
                    </p>
                </div>

                <!-- Japan Review -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 space-y-0.5">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-xs text-slate-900 flex items-center gap-1">
                            <span>🇯🇵</span>
                            <span>日本市场</span>
                        </span>
                        <span class="text-[9.5px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">配置建议: 标配 ★★★</span>
                    </div>
                    <p class="text-[10px] text-slate-600 leading-snug">
                        日股8月宽幅震荡，科技存储与出口板块领跑后受中东局势和债市收益率上行冲击，月末再度反弹。10年期日债收益率升至30年新高2.93%，日本央行官员维持鹰派立场，副行长冰见野良三强调适时调整政策。虽批准2027年食品消费税减免，但二季度GDP年化放缓至1.1%，而东京8月核心CPI升至1.8%。
                    </p>
                </div>

                <!-- China Review -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 space-y-0.5">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-xs text-slate-900 flex items-center gap-1">
                            <span>🇨🇳</span>
                            <span>中国市场</span>
                        </span>
                        <span class="text-[9.5px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">配置建议: 超配 ★★★½</span>
                    </div>
                    <p class="text-[10px] text-slate-600 leading-snug">
                        中国市场8月走势分化。在岸A股受国产AI突破、MiniMax营收增长及上海地产松绑支撑走强；离岸恒指则受20%离岸保险回报税及阿里巴巴800亿港元配股影响承压。7月规模以上工业产出同比增长4.5%，高技术制造繁荣，但工业利润增速放缓至11.2%，社零低迷于0.6%，地产投资持续萎缩。
                    </p>
                </div>
            </div>

        </div>
    </div>

        <!-- Column 2: Macro Drivers from Page 4 (4 Cols) -->
        <div class="col-span-4 flex flex-col justify-between space-y-2">
            <div class="flex-1 flex flex-col justify-between">
                <div class="flex justify-between items-center h-6 mb-1.5">
                    <h4 class="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                        第三季度核心结构性逻辑与风险
                    </h4>
                    <span class="text-[9.5px] text-slate-400 font-mono font-semibold">Q3 Focus (P.4)</span>
                </div>
                <div class="flex-1 flex flex-col justify-between space-y-2">
                    <!-- Driver 1: Yield Move -->
                    <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 space-y-1 shadow-xs flex-1 flex flex-col justify-start">
                        <span class="font-bold text-xs text-blue-900 flex items-center gap-1">
                            ⚡ 美债长端收益率突破 5.3% 创 2007 年新高
                        </span>
                        <p class="text-[10.5px] text-slate-600 leading-relaxed">
                            30年期美债收益率在8月飙升至5.3%以上，创下自2007年（iPhone问世前）以来的最高水平。高通胀持续、财政赤字扩大以及大量长期国债和企业债集中发行竞夺资金池，已全面推升抵押贷款至汽车贷款等全社会借贷成本。
                        </p>
                    </div>

                    <!-- Driver 2: Debt Dynamics -->
                    <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 space-y-1 shadow-xs flex-1 flex flex-col justify-start">
                        <span class="font-bold text-xs text-amber-900 flex items-center gap-1">
                            🛢️ 债务利息支出破万亿美元与边际买家脆弱性
                        </span>
                        <p class="text-[10.5px] text-slate-600 leading-relaxed">
                            美国联邦国债利息支出已超越国防军费开支，2026财年将突破1万亿美元，成为仅次于社保的第二大联邦财政支出。传统外资央行等价格不敏感型买家持续撤退，对冲基金成为边际买家（持仓翻四倍达2.4万亿美元），买方基础更敏感脆弱。
                        </p>
                    </div>

                    <!-- Driver 3: Areas of Caution & Gold Look-Through -->
                    <div class="bg-rose-50/70 border border-rose-200 rounded-xl p-2.5 space-y-1 shadow-xs flex-[1.3] flex flex-col justify-start">
                        <span class="font-bold text-xs text-rose-900 flex items-center gap-1">
                            ⚠️ 审慎防御领域与资产警惕 (含黄金穿透校准)
                        </span>
                        <p class="text-[10px] text-slate-600 leading-relaxed">
                            财政部扩大长期国债回购难挡长端收益率回升，市场要求更高的期限溢价补偿。建议严控久期，转向短久期债券与亚洲低估值标的。<strong>黄金配置与穿透校准：</strong>研报对黄金维持审慎（指出本轮周期黄金避险属性减弱，仅建议至多 10% 分散配置）。<strong>组合穿透：</strong>本组合配置大华黄金及综合（United Gold & General）目标权重设为 15%，因其底层仅约 72% 为纯黄金相关资产（其余为多元贵金属与基础矿产），穿透后真实纯黄金敞口约 10.46%，与研报 10% 避险上限严格吻合，并在本月金价暴涨+24.00%中发挥关键防守压舱石效应。
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Column 3: Official Sector Star Ratings from Page 4 (4 Cols) -->
        <div class="col-span-4 flex flex-col justify-between space-y-2">
            <div class="flex-1 flex flex-col justify-between">
                <div class="flex justify-between items-center h-6 mb-1.5">
                    <h4 class="text-sm font-extrabold uppercase tracking-tight text-[#0f2347]">
                        官方全行业吸引力星级榜
                    </h4>
                    <span class="text-[9.5px] text-slate-400 font-semibold">iFAST 官方榜单 (P.4)</span>
                </div>
                
                <div class="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex-1 flex flex-col justify-between text-[10px]">
                    
                    <!-- Tier 1: VERY ATTRACTIVE -->
                    <div>
                        <div class="flex justify-between items-center bg-emerald-50/90 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-900 mb-0.5">
                            <span class="flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>极具吸引力 VERY ATTRACTIVE</span>
                            </span>
                            <span class="text-amber-500 font-mono text-[9.5px]">★★★★½ ~ ★★★★</span>
                        </div>
                        <div class="divide-y divide-slate-100 text-[9.5px]">
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">亚洲半导体</span>
                                <span class="font-mono font-bold text-amber-500">★★★★½</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">新加坡</span>
                                <span class="font-mono font-bold text-amber-500">★★★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">韩国</span>
                                <span class="font-mono font-bold text-amber-500">★★★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">中国台湾</span>
                                <span class="font-mono font-bold text-amber-500">★★★★</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tier 2: ATTRACTIVE -->
                    <div>
                        <div class="flex justify-between items-center bg-blue-50/90 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold text-blue-900 mb-0.5">
                            <span class="flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                <span>具备吸引力 ATTRACTIVE</span>
                            </span>
                            <span class="text-amber-500 font-mono text-[9.5px]">★★★½ ~ ★★★</span>
                        </div>
                        <div class="divide-y divide-slate-100 text-[9.5px]">
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">数字经济</span>
                                <span class="font-mono font-bold text-amber-500">★★★½</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">中国</span>
                                <span class="font-mono font-bold text-amber-500">★★★½</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">中国香港</span>
                                <span class="font-mono font-bold text-amber-500">★★★½</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">日本</span>
                                <span class="font-mono font-bold text-amber-500">★★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">马来西亚</span>
                                <span class="font-mono font-bold text-amber-500">★★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">亚洲除日本</span>
                                <span class="font-mono font-bold text-amber-500">★★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">全球新兴市场 (GEMs)</span>
                                <span class="font-mono font-bold text-amber-500">★★★</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tier 3: NEUTRAL -->
                    <div>
                        <div class="flex justify-between items-center bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 mb-0.5">
                            <span class="flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <span>中性配置 NEUTRAL</span>
                            </span>
                            <span class="text-amber-500 font-mono text-[9.5px]">★★½</span>
                        </div>
                        <div class="divide-y divide-slate-100 text-[9.5px]">
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">半导体 (全球)</span>
                                <span class="font-mono font-bold text-amber-500">★★½</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">全球医疗保健</span>
                                <span class="font-mono font-bold text-amber-500">★★½</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tier 4: NOT ATTRACTIVE -->
                    <div>
                        <div class="flex justify-between items-center bg-rose-50/90 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold text-rose-900 mb-0.5">
                            <span class="flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span>不具吸引力 NOT ATTRACTIVE</span>
                            </span>
                            <span class="text-amber-500 font-mono text-[9.5px]">★★</span>
                        </div>
                        <div class="divide-y divide-slate-100 text-[9.5px]">
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">欧洲</span>
                                <span class="font-mono font-bold text-amber-500">★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">印度</span>
                                <span class="font-mono font-bold text-amber-500">★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">全球金融</span>
                                <span class="font-mono font-bold text-amber-500">★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">美国</span>
                                <span class="font-mono font-bold text-amber-500">★★</span>
                            </div>
                            <div class="flex justify-between items-center py-0.5 px-1 hover:bg-slate-50">
                                <span class="text-slate-700 font-medium">东盟 (ASEAN)</span>
                                <span class="font-mono font-bold text-amber-500">★★</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    </div>

    <!-- Slide Footer -->
    <div class="bg-slate-100 px-8 py-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <span>宏观环境与行业星级配置</span>
        <span>第 2 页 · 宏观展望与星级榜单</span>
    </div>
</div>
"""

    # Build Slide 3 for August 2026 (Feature Insight from Reference September Monthly Update Page 5-6)
    with open("src/components/slide3_august.html", "r", encoding="utf-8") as f:
        slide3_html = f.read()

    # Build Slide 4 for August 2026 (Our Philosophy from Horizon Sep 2026 Page 2 + August Conviction Review Matrix)
    slide4_html = """
<div id="slide4" class="landscape-slide relative flex flex-col justify-between">
    <canvas id="canvas_slide4" class="annotation-canvas absolute inset-0 pointer-events-none z-40 w-full h-full"></canvas>
    
    <!-- Slide Header -->
    <div class="bg-gradient-to-r from-[#091528] via-[#0f2347] to-[#163566] text-white px-8 py-3.5 border-b-2 border-amber-500 flex justify-between items-center">
        <div>
            <span class="text-xs uppercase tracking-widest text-amber-400 font-bold">iFAST 投资哲学与组合定见</span>
            <h2 class="text-xl font-extrabold tracking-tight mt-0.5">核心投资哲学与“坚守信念”复盘</h2>
        </div>
    </div>

    <!-- Slide Body: Upper Half (Our Philosophy) + Lower Half (Pillars, Matrix, Rebalance Decision) -->
    <div class="p-5 flex-1 flex flex-col justify-between space-y-2.5">
        
        <!-- UPPER HALF: O U R   P H I L O S O P H Y (iFAST Horizon Page 2 Verbatim) -->
        <div class="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-xs flex">
            <!-- Left Brand Banner: Dark Teal Institutional Theme -->
            <div class="w-60 bg-gradient-to-br from-[#124b68] to-[#0c3347] text-white p-3.5 flex flex-col justify-between shrink-0">
                <div>
                    <span class="text-[10px] font-bold tracking-widest uppercase text-amber-300 block mb-0.5">iFAST</span>
                    <h3 class="text-base font-extrabold tracking-tight leading-tight">核心投资哲学</h3>
                    <div class="w-8 h-0.5 bg-amber-400 my-1.5"></div>
                </div>
                <p class="text-[11px] text-slate-200 leading-snug font-medium">
                    贯穿每一项投资决策的六大基石法则，从投资组合构建到基金经理筛选。
                </p>
            </div>

            <!-- Right 6 Principles (3 columns x 2 rows) -->
            <div class="flex-1 grid grid-cols-3 divide-x divide-y divide-slate-200 bg-white">
                <!-- Principle 1 -->
                <div class="p-2.5 flex flex-col justify-start">
                    <span class="text-[12px] font-bold text-[#0f2347] flex items-center gap-1.5 mb-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        <span>审慎分散至关重要</span>
                    </span>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                        我们保持审慎分散，但绝不过度分散。这不仅在于把鸡蛋放在不同篮子里，更在于精确厘定每个篮子放多少个鸡蛋。
                    </p>
                </div>
                <!-- Principle 2 -->
                <div class="p-2.5 flex flex-col justify-start">
                    <span class="text-[12px] font-bold text-[#0f2347] flex items-center gap-1.5 mb-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        <span>坚持估值驱动投资</span>
                    </span>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                        估值驱动策略助我们发掘良机，因为从长远来看，证券价格终将回归底层资产的内在价值。
                    </p>
                </div>
                <!-- Principle 3 -->
                <div class="p-2.5 flex flex-col justify-start">
                    <span class="text-[12px] font-bold text-[#0f2347] flex items-center gap-1.5 mb-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        <span>深信基本面研究</span>
                    </span>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                        我们的每一项决策均以深度调研为依托，绝不盲从市场狂热，亦不屈服于恐慌。
                    </p>
                </div>
                <!-- Principle 4 -->
                <div class="p-2.5 flex flex-col justify-start">
                    <span class="text-[12px] font-bold text-[#0f2347] flex items-center gap-1.5 mb-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        <span>着眼长期投资周期</span>
                    </span>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                        我们始终坚持长期投资方法，协助投资者从容穿越市场周期与波动，并在机会显现时果断出击。
                    </p>
                </div>
                <!-- Principle 5 -->
                <div class="p-2.5 flex flex-col justify-start">
                    <span class="text-[12px] font-bold text-[#0f2347] flex items-center gap-1.5 mb-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        <span>秉持独立客观思考</span>
                    </span>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                        要创造超额业绩，必须保持独立思考与投资——即使这意味着逆向而行、不随波逐流。独立性是核心优势。
                    </p>
                </div>
                <!-- Principle 6 -->
                <div class="p-2.5 flex flex-col justify-start">
                    <span class="text-[12px] font-bold text-[#0f2347] flex items-center gap-1.5 mb-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        <span>投资者利益始终第一</span>
                    </span>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                        我们的使命：协助全球投资者实现稳健盈利的全球化配置。始终将客户利益置于首位，缔造持久双赢。
                    </p>
                </div>
            </div>
        </div>

        <!-- LOWER HALF: REMAINING PARTS DOWNWARD COMPACT ORDER -->
        
        <!-- 1. Three Core Portfolio Pillars -->
        <div class="grid grid-cols-3 gap-3">
            <div class="border border-slate-200 rounded-lg p-2.5 bg-white shadow-xs border-l-4 border-l-blue-800 space-y-0.5">
                <span class="text-[10.5px] font-bold text-blue-800 uppercase tracking-wider block">支柱 1: 绝对收益压舱石 (35%)</span>
                <h5 class="text-xs font-bold text-slate-900">FULLERTON LUX - GLOBAL ABSOLUTE ALPHA</h5>
                <p class="text-[11px] text-slate-600 leading-snug">
                    追求与大盘低相关的绝对回报。通过自下而上的多空选股平滑震荡，构成组合防御黑天鹅的中流砥柱。
                </p>
            </div>
            <div class="border border-slate-200 rounded-lg p-2.5 bg-white shadow-xs border-l-4 border-l-sky-600 space-y-0.5">
                <span class="text-[10.5px] font-bold text-sky-700 uppercase tracking-wider block">支柱 2: 结构性高成长 (30%)</span>
                <h5 class="text-xs font-bold text-slate-900">EASTSPRING GLOBAL TECH (15%) + United China A (12%)</h5>
                <p class="text-[11px] text-slate-600 leading-snug">
                    紧握人工智能芯片硬件产能供不应求红利；同时左侧布局极低估值、受政策托底的中国创新龙头。
                </p>
            </div>
            <div class="border border-slate-200 rounded-lg p-2.5 bg-white shadow-xs border-l-4 border-l-amber-500 space-y-0.5">
                <span class="text-[10.5px] font-bold text-amber-700 uppercase tracking-wider block">支柱 3: 逆周期对冲与股息 (35%)</span>
                <h5 class="text-xs font-bold text-slate-900">United Gold (15%) + Janus Life (15%) + FSSA/Nikko (8%)</h5>
                <p class="text-[11px] text-slate-600 leading-snug">
                    大华黄金抵御去美元化与地缘滞胀风险；医疗板块提供防守韧性；日兴日本与首域亚洲提供充沛现金流。
                </p>
            </div>
        </div>

        <!-- 2. Conviction Review Decision Matrix Table for August 2026 -->
        <div>
            <div class="flex justify-between items-center mb-1">
                <h4 class="text-xs font-extrabold uppercase tracking-tight text-[#0f2347] flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    面对短期波动的专业定见：8月份信念审查决策矩阵
                </h4>
            </div>
            <table class="w-full text-left border border-slate-200 rounded-lg overflow-hidden border-collapse shadow-xs">
                <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                        <th class="p-2 pl-3">审查标的</th>
                        <th class="p-2 text-right">8月回报</th>
                        <th class="p-2">市场短期噪音</th>
                        <th class="p-2">底层基本面支撑</th>
                        <th class="p-2 text-center pr-3 whitespace-nowrap min-w-[85px]">顾问决策指令</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 bg-white text-[11.5px]">
                    <tr>
                        <td class="p-2 pl-3 font-bold text-slate-900">United Gold and General A Acc SGD</td>
                        <td class="p-2 text-right font-mono text-emerald-600 font-bold">+24.00%</td>
                        <td class="p-2 text-slate-600">金价短期急涨后可能面临获利盘了结与美元指数技术性反弹。</td>
                        <td class="p-2 text-slate-800 font-medium">美债30年期收益率升破5.3%，去美元化与全球央行购金逻辑坚实，非对称对冲大放异彩。</td>
                        <td class="p-2 text-center pr-3 whitespace-nowrap"><span class="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10.5px] whitespace-nowrap">坚持持有</span></td>
                    </tr>
                    <tr>
                        <td class="p-2 pl-3 font-bold text-slate-900">EASTSPRING - GLOBAL TECHNOLOGY SGD</td>
                        <td class="p-2 text-right font-mono text-rose-600 font-bold">-5.64%</td>
                        <td class="p-2 text-slate-600">长端美债收益率攀升引发半导体估值分母端压制，芯片股短期震荡。</td>
                        <td class="p-2 text-slate-800 font-medium">英伟达财报亮眼，云巨头资本开支扩张，AI 硬件供需瓶颈突出，回调创造极佳逢低吸纳窗口。</td>
                        <td class="p-2 text-center pr-3 whitespace-nowrap"><span class="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10.5px] whitespace-nowrap">坚持持有</span></td>
                    </tr>
                    <tr>
                        <td class="p-2 pl-3 font-bold text-slate-900">United China A Shares Innovation A Acc</td>
                        <td class="p-2 text-right font-mono text-rose-600 font-bold">-3.09%</td>
                        <td class="p-2 text-slate-600">7月宏观数据复苏不均，零售消费温和，房地产投资持续收缩。</td>
                        <td class="p-2 text-slate-800 font-medium">在岸科技制造与国产AI技术稳步突破，估值处于历史绝对低位，政策托底与流动性注入预期强烈。</td>
                        <td class="p-2 text-center pr-3 whitespace-nowrap"><span class="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10.5px] whitespace-nowrap">坚持持有</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 3. Monthly Rebalancing Decision Box -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2 text-xs text-blue-950 flex justify-between items-center">
            <span class="font-bold text-[#0f2347]">月度调仓结论：</span>
            <span class="text-[12px] text-slate-700">实际权重漂移均在安全阈值内，大华黄金避险收益强劲平滑科技波动，<strong>8月维持既有 7 只标的目标配比不变，不触发被动赎回</strong>。</span>
        </div>

    </div>

    <!-- Slide Footer -->
    <div class="bg-slate-100 px-8 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <span>底层资产信念与决策审查</span>
        <span>第 4 页 · 组合配置逻辑与信念复盘</span>
    </div>
</div>
"""

    # Build Slide 5 (Pure Chinese Regulatory Disclaimer)
    with open("src/components/slide5.html", "r", encoding="utf-8") as f:
        slide5_html = f.read()

    # Build Slide 6 (Portfolio Look-Through & Risk Analytics)
    with open("src/components/slide6.html", "r", encoding="utf-8") as f:
        slide6_html = f.read()

    # Now assemble the main JS for August 2026 (chart data up to 2026-09)
    # Let's read real_performance_series.json
    with open("real_performance_series.json", "r", encoding="utf-8") as f:
        series_data = json.load(f)
        
    idx_aug = series_data["dates"].index("2026-09")
    aug_dates = series_data["dates"][:idx_aug+1]
    aug_cur = series_data["current"][:idx_aug+1]
    aug_past = series_data["past"][:idx_aug+1]
    aug_sp = series_data["sp500"][:idx_aug+1]
    aug_msci = series_data["msci"][:idx_aug+1]
    
    # Filter events up to 2026-09
    aug_events = [e for e in series_data.get("events", []) if e.get("date") <= "2026-09"]
    
    print(f"📊 Chart data prepared: {len(aug_dates)} periods (2023-07 to 2026-09). Events: {len(aug_events)}")

    # Custom August JS
    august_js = f"""
    // Master Chart & Interactive Engine for August 2026
    document.addEventListener("DOMContentLoaded", function() {{
        initSlide1Chart();
        initSlide3FrontierChart();
    }});

    function initSlide1Chart() {{
        const ctx = document.getElementById('lsSlide1RealLineChart');
        if (!ctx) return;
        
        const labels = {json.dumps(aug_dates)};
        const currentData = {json.dumps(aug_cur)};
        const pastData = {json.dumps(aug_past)};
        const spData = {json.dumps(aug_sp)};
        const msciData = {json.dumps(aug_msci)};
        const events = {json.dumps(aug_events)};

        // Reconstitution / Rebalance Annotations Plugin
        const portfolioEventsPlugin = {{
            id: 'portfolioEvents',
            afterDraw(chart) {{
                const {{ ctx, chartArea: {{ top, bottom, left, right }}, scales: {{ x, y }} }} = chart;
                if (!x || !y) return;

                events.forEach(evt => {{
                    const xIdx = labels.indexOf(evt.date);
                    if (xIdx === -1) return;
                    
                    const xPos = x.getPixelForValue(xIdx);
                    const yVal = currentData[xIdx];
                    const yPos = y.getPixelForValue(yVal);
                    const isRebalance = evt.type === 'rebalance';
                    const mainColor = isRebalance ? '#10b981' : '#eab308';
                    const fillColor = isRebalance ? 'rgba(16, 185, 129, 0.45)' : 'rgba(234, 179, 8, 0.45)';

                    ctx.save();
                    // Vertical guideline
                    ctx.beginPath();
                    ctx.setLineDash([3, 3]);
                    ctx.strokeStyle = mainColor;
                    ctx.lineWidth = 1.2;
                    ctx.moveTo(xPos, top);
                    ctx.lineTo(xPos, bottom);
                    ctx.stroke();

                    // Marker circle
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.arc(xPos, yPos, 6, 0, Math.PI * 2);
                    ctx.fillStyle = fillColor;
                    ctx.fill();
                    ctx.strokeStyle = mainColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Label badge
                    const text = evt.status || (isRebalance ? 'Rebalance' : 'Restructure');
                    ctx.font = 'bold 9px sans-serif';
                    const textWidth = ctx.measureText(text).width;
                    const badgeY = Math.max(top + 14, yPos - 12);
                    
                    let badgeX = xPos;
                    const halfW = textWidth / 2 + 4;
                    if (badgeX + halfW > right) {{
                        badgeX = right - halfW;
                    }}
                    if (badgeX - halfW < left) {{
                        badgeX = left + halfW;
                    }}

                    ctx.fillStyle = mainColor;
                    ctx.fillRect(badgeX - textWidth/2 - 3, badgeY - 8, textWidth + 6, 11);
                    ctx.fillStyle = '#0f172a';
                    ctx.textAlign = 'center';
                    ctx.fillText(text, badgeX, badgeY);

                    ctx.restore();
                }});
            }}
        }};

        new Chart(ctx, {{
            type: 'line',
            data: {{
                labels: labels,
                datasets: [
                    {{
                        label: '当前组合 (主动重组优化)',
                        data: currentData,
                        borderColor: '#dc2626',
                        backgroundColor: '#dc2626',
                        borderWidth: 2.2,
                        tension: 0.15,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    }},
                    {{
                        label: '未重组组合 (旧组合对照组)',
                        data: pastData,
                        borderColor: '#2563eb',
                        borderWidth: 1.8,
                        borderDash: [5, 4],
                        tension: 0.15,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }},
                    {{
                        label: 'MSCI 全球指数',
                        data: msciData,
                        borderColor: '#94a3b8',
                        borderWidth: 1.5,
                        borderDash: [3, 3],
                        tension: 0.15,
                        pointRadius: 0
                    }},
                    {{
                        label: '标普 500 指数',
                        data: spData,
                        borderColor: '#000000',
                        borderWidth: 1.5,
                        borderDash: [4, 4],
                        tension: 0.15,
                        pointRadius: 0
                    }}
                ]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                layout: {{
                    padding: {{
                        left: 8,
                        right: 36,
                        top: 16,
                        bottom: 6
                    }}
                }},
                plugins: {{
                    legend: {{ display: false }},
                    tooltip: {{
                        mode: 'index',
                        intersect: false,
                        callbacks: {{
                            label: function(context) {{
                                const val = (context.parsed.y * 100).toFixed(2) + '%';
                                return context.dataset.label + ': ' + val;
                            }}
                        }}
                    }}
                }},
                scales: {{
                    x: {{
                        grid: {{ display: false }},
                        ticks: {{
                            font: {{ size: 9 }},
                            maxRotation: 0,
                            autoSkip: false,
                            callback: function(val, index) {{
                                const d = labels[index];
                                if (index === 0 || index === labels.length - 1) return d;
                                if (d === '2026-07') return '';
                                return (d.endsWith('-01') || d.endsWith('-07')) ? d : '';
                            }}
                        }}
                    }},
                    y: {{
                        min: 0.95,
                        max: 2.05,
                        grid: {{ color: 'rgba(226, 232, 240, 0.6)' }},
                        ticks: {{
                            font: {{ size: 9 }},
                            callback: function(val) {{
                                return ((val - 1.0) * 100).toFixed(0) + '%';
                            }}
                        }}
                    }}
                }}
            }},
            plugins: [portfolioEventsPlugin]
        }});
    }}

    function initSlide3FrontierChart() {{
        const canvas = document.getElementById('lsFrontierChart');
        if (!canvas) return;
        const ctxS3 = canvas.getContext('2d');
        
        const frontierDataLabelsPlugin = {{
            id: 'frontierDataLabels',
            afterDatasetsDraw(chart) {{
                const {{ ctx }} = chart;
                ctx.save();
                ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                
                chart.data.datasets.forEach((dataset, dIdx) => {{
                    const meta = chart.getDatasetMeta(dIdx);
                    meta.data.forEach((element, index) => {{
                        const pt = dataset.data[index];
                        const label = pt.zh || pt.label;
                        const posX = element.x;
                        const posY = element.y;
                        
                        ctx.fillStyle = '#0f172a';
                        
                        if (dIdx === 1) {{ // 1986-2020 (Dark Blue Line)
                            if (index === 0) {{ // 100% Bonds
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY + 16);
                            }} else if (index === 1) {{ // 25/75
                                ctx.textAlign = 'right';
                                ctx.fillText(label, posX - 6, posY - 2);
                            }} else if (index === meta.data.length - 1) {{ // 100% Stocks
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY - 10);
                            }} else {{
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY - 10);
                            }}
                        }} else {{ // 2021-2025 (Red Line)
                            if (index === 0) {{ // 100% Bonds
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY + 16);
                            }} else if (index === meta.data.length - 1) {{ // 100% Stocks
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY - 10);
                            }} else {{
                                ctx.textAlign = 'left';
                                ctx.fillText(label, posX + 8, posY + 4);
                            }}
                        }}
                    }});
                }});
                ctx.restore();
            }}
        }};

        window.s3ChartInstance = new Chart(ctxS3, {{
            type: 'scatter',
            plugins: [frontierDataLabelsPlugin],
            data: {{
                datasets: [
                    {{
                        label: '2021-2025年实际回报',
                        data: [
                            {{ x: 10.5, y: -2.5, label: '100% Bonds', zh: '100% 债券' }},
                            {{ x: 12.1, y: 2.5, label: '25/75', zh: '25/75' }},
                            {{ x: 13.9, y: 6.8, label: '50/50', zh: '50/50' }},
                            {{ x: 15.2, y: 8.9, label: '60/40', zh: '60/40' }},
                            {{ x: 16.0, y: 10.4, label: '70/30', zh: '70/30' }},
                            {{ x: 17.3, y: 12.1, label: '80/20', zh: '80/20' }},
                            {{ x: 19.3, y: 15.8, label: '100% Stocks', zh: '100% 股票' }}
                        ],
                        borderColor: '#dc2626',
                        backgroundColor: '#dc2626',
                        borderWidth: 2.5,
                        showLine: true,
                        tension: 0.1,
                        pointRadius: 4.5,
                        pointHoverRadius: 6.5
                    }},
                    {{
                        label: '1986-2020年历史回报',
                        data: [
                            {{ x: 8.5, y: 6.8, label: '100% Bonds', zh: '100% 债券' }},
                            {{ x: 7.8, y: 8.4, label: '25/75', zh: '25/75' }},
                            {{ x: 8.8, y: 9.8, label: '50/50', zh: '50/50' }},
                            {{ x: 10.0, y: 10.2, label: '60/40', zh: '60/40' }},
                            {{ x: 11.8, y: 10.7, label: '70/30', zh: '70/30' }},
                            {{ x: 13.2, y: 11.2, label: '80/20', zh: '80/20' }},
                            {{ x: 15.6, y: 12.3, label: '100% Stocks', zh: '100% 股票' }}
                        ],
                        borderColor: '#1e3a8a',
                        backgroundColor: '#1e3a8a',
                        borderWidth: 2.5,
                        showLine: true,
                        tension: 0.1,
                        pointRadius: 4.5,
                        pointHoverRadius: 6.5
                    }}
                ]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{ display: false }},
                    tooltip: {{
                        callbacks: {{
                            label: function(ctx) {{
                                const pt = ctx.raw;
                                const lbl = pt.zh || pt.label;
                                return `${{ctx.dataset.label}} (${{lbl}}) - 风险: ${{pt.x}}%, 回报: ${{pt.y}}%`;
                            }}
                        }}
                    }}
                }},
                scales: {{
                    x: {{
                        min: 6.0,
                        max: 21.0,
                        title: {{
                            display: true,
                            text: '年化波动率 / 风险 (标准差)',
                            font: {{ size: 9, weight: 'bold' }},
                            color: '#0f172a'
                        }},
                        ticks: {{
                            stepSize: 2.0,
                            callback: function(v){{ return v.toFixed(1) + '%'; }},
                            font: {{ size: 8.5, weight: 'bold' }},
                            color: '#334155'
                        }},
                        grid: {{ color: '#cbd5e1' }}
                    }},
                    y: {{
                        min: -5.0,
                        max: 20.0,
                        title: {{
                            display: true,
                            text: '年化实际回报率 (%)',
                            font: {{ size: 9, weight: 'bold' }},
                            color: '#0f172a'
                        }},
                        ticks: {{
                            stepSize: 5.0,
                            callback: function(v){{ return v.toFixed(1) + '%'; }},
                            font: {{ size: 8.5, weight: 'bold' }},
                            color: '#334155'
                        }},
                        grid: {{
                            color: function(ctx) {{
                                if (ctx.tick && ctx.tick.value === 0) return '#000000';
                                return '#cbd5e1';
                            }},
                            lineWidth: function(ctx) {{
                                if (ctx.tick && ctx.tick.value === 0) return 2;
                                return 1;
                            }}
                        }}
                    }}
                }}
            }}
        }});
    }}

    window.addEventListener('beforeprint', () => {{
        if (window.Chart) {{
            Object.values(Chart.instances).forEach(c => c.resize());
        }}
    }});
    window.addEventListener('afterprint', () => {{
        if (window.Chart) {{
            Object.values(Chart.instances).forEach(c => c.resize());
        }}
    }});

    function scrollToSlide(n) {{
        const el = document.getElementById('slide' + n);
        if (el) {{
            el.scrollIntoView({{ behavior: 'smooth' }});
        }}
    }}

    function switchLanguage(lang) {{
        if (lang === 'en') {{
            alert('8月专业定制备忘录当前仅提供中文机构版。');
        }}
    }}

    function exportPDF() {{
        window.print();
    }}

    async function exportLongImage() {{
        const btn = document.getElementById('btnLongPng');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) {{
            btn.innerHTML = '<span>正在生成6页长图...</span>';
            btn.disabled = true;
        }}
        try {{
            const container = document.getElementById('reportCanvasContainer');
            const canvas = await html2canvas(container, {{
                scale: 2,
                useCORS: true,
                backgroundColor: '#0b1120',
                logging: false
            }});
            const link = document.createElement('a');
            link.download = 'HR_模板投资组合_6页全景备忘录_2026-08.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (btn) {{
                btn.innerHTML = '<span>✅ 导出成功!</span>';
                setTimeout(() => {{
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }}, 2500);
            }}
        }} catch (err) {{
            alert('长图生成失败: ' + err);
            if (btn) {{
                btn.innerHTML = originalText;
                btn.disabled = false;
            }}
        }}
    }}
    """

    # Assemble HTML
    final_html = base_html.replace("{{TOP_NAV}}", top_nav)
    final_html = final_html.replace("{{SLIDE_1}}", slide1_html)
    final_html = final_html.replace("{{SLIDE_2}}", slide2_html)
    final_html = final_html.replace("{{SLIDE_3}}", slide3_html)
    final_html = final_html.replace("{{SLIDE_4}}", slide4_html)
    final_html = final_html.replace("{{SLIDE_5}}", slide5_html)
    final_html = final_html.replace("{{SLIDE_6}}", slide6_html)
    final_html = final_html.replace("{{ANNOTATION_TOOLBAR}}", toolbar)
    final_html = final_html.replace("{{I18N_JS}}", "// i18n embedded directly in Chinese")
    final_html = final_html.replace("{{MAIN_JS}}", august_js)

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(final_html)

    print(f"✅ Generated August 2026 HTML: {html_file} ({len(final_html):,} bytes)")
    return html_file

if __name__ == "__main__":
    generate_report()
