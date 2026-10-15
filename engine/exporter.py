# -*- coding: utf-8 -*-
"""
High-Resolution Multi-Format Exporter
Exports:
1. HR Model Portfolio Monthly Advisory Memorandum (Chinese & English)
2. Standalone Portfolio Look-Through & Risk Factsheet (Chinese & English)
Synchronizes directly to Google Drive and workspace.
"""

import os
import shutil
import json
import fitz
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DRIVE_DIR = r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report"

def render_html_to_pdf(html_path, output_pdf, title="HR 模板投资组合", lang="zh"):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1400, "height": 990})
        page.goto(f"file:///{html_path.replace(os.sep, '/')}", wait_until="networkidle")
        page.wait_for_timeout(800)

        if lang == "en":
            page.evaluate("if (typeof switchLanguage === 'function') switchLanguage('en');")
            page.wait_for_timeout(600)

        page.emulate_media(media="print")
        page.evaluate("() => { if (window.Chart) { Object.values(Chart.instances).forEach(c => c.resize()); } }")
        page.wait_for_timeout(500)

        os.makedirs(os.path.dirname(output_pdf), exist_ok=True)
        page.pdf(
            path=output_pdf,
            width="297mm",
            height="210mm",
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
            print_background=True,
            display_header_footer=False
        )
        browser.close()

    # Sanitize PDF Metadata
    doc = fitz.open(output_pdf)
    meta = doc.metadata
    meta["title"] = title
    meta["author"] = "Gu Haoran / Alpha Wealth"
    meta["subject"] = "Institutional Wealth Advisory Deliverable"
    doc.set_metadata(meta)
    temp_pdf = output_pdf + ".clean.pdf"
    doc.save(temp_pdf)
    doc.close()
    os.replace(temp_pdf, output_pdf)
    return output_pdf

def export_all_deliverables(options=None):
    if options is None:
        options = {
            "export_memo_zh": True,
            "export_memo_en": True,
            "export_factsheet_zh": True,
            "export_factsheet_en": True,
            "target_dir": DEFAULT_DRIVE_DIR,
            "month": "2026-09",
            "settle_date": "2026-10-05"
        }

    target_dir = options.get("target_dir") or DEFAULT_DRIVE_DIR
    month = options.get("month", "2026-09")
    settle_date = options.get("settle_date", "2026-10-05")

    results = []

    # Load config to get exact settle_date if default
    cfg_file = os.path.join(BASE_DIR, "config", f"config_{month.replace('-', '_')}.json")
    if os.path.exists(cfg_file):
        with open(cfg_file, 'r', encoding='utf-8') as f:
            c = json.load(f)
            settle_date = c.get('settle_date', settle_date)

    memo_html = os.path.join(BASE_DIR, "output", f"iFAST_Equity_Growth_Monthly_Report_{month}.html")
    if not os.path.exists(memo_html):
        from engine.report_generator import generate_report
        generate_report(month=month)

    if not os.path.exists(memo_html):
        memo_html = os.path.join(BASE_DIR, "iFAST_Equity_Growth_Monthly_Report_Latest.html")

    # 1. Chinese Memorandum (5 Slides)
    if options.get("export_memo_zh", True):
        memo_pdf_name = f"HR_模板投资组合_月度备忘录_{settle_date}.pdf"
        memo_pdf_local = os.path.join(BASE_DIR, "output", memo_pdf_name)
        if os.path.exists(memo_html):
            render_html_to_pdf(memo_html, memo_pdf_local, "HR 模板投资组合 · 月度投资建议备忘录", lang="zh")
            shutil.copy2(memo_pdf_local, os.path.join(BASE_DIR, memo_pdf_name))
            drive_dest = None
            if os.path.exists(target_dir):
                drive_dest = os.path.join(target_dir, memo_pdf_name)
                try:
                    shutil.copy2(memo_pdf_local, drive_dest)
                except Exception as e:
                    drive_dest = f"Copy error: {e}"
            results.append({
                "type": "memo_zh",
                "name": memo_pdf_name,
                "local": memo_pdf_local,
                "drive": drive_dest,
                "download_url": f"/download?file={memo_pdf_name}"
            })

    # 2. English Memorandum (5 Slides)
    if options.get("export_memo_en", True):
        memo_en_pdf_name = f"HR_Model_Portfolio_Advisory_Memorandum_{settle_date}.pdf"
        memo_en_pdf_local = os.path.join(BASE_DIR, "output", memo_en_pdf_name)
        if os.path.exists(memo_html):
            render_html_to_pdf(memo_html, memo_en_pdf_local, "HR Model Portfolio · Monthly Advisory Memorandum", lang="en")
            shutil.copy2(memo_en_pdf_local, os.path.join(BASE_DIR, memo_en_pdf_name))
            drive_dest = None
            if os.path.exists(target_dir):
                drive_dest = os.path.join(target_dir, memo_en_pdf_name)
                try:
                    shutil.copy2(memo_en_pdf_local, drive_dest)
                except Exception as e:
                    drive_dest = f"Copy error: {e}"
            results.append({
                "type": "memo_en",
                "name": memo_en_pdf_name,
                "local": memo_en_pdf_local,
                "drive": drive_dest,
                "download_url": f"/download?file={memo_en_pdf_name}"
            })

    # 2. Standalone Factsheets (Chinese and English)
    from generate_portfolio_factsheet import generate_standalone_factsheet
    factsheet_files = generate_standalone_factsheet(month=month, date_str=settle_date)

    if options.get("export_factsheet_zh", True):
        fs_zh_pdf_name = f"HR_模板投资组合_资产穿透与风险报告_{settle_date}.pdf"
        fs_zh_pdf_local = os.path.join(BASE_DIR, "output", fs_zh_pdf_name)
        render_html_to_pdf(factsheet_files["zh_html"], fs_zh_pdf_local, "HR 模板投资组合 · 资产穿透与风险报告")
        drive_dest = None
        if os.path.exists(target_dir):
            drive_dest = os.path.join(target_dir, fs_zh_pdf_name)
            try:
                shutil.copy2(fs_zh_pdf_local, drive_dest)
            except Exception as e:
                drive_dest = f"Copy error: {e}"
        results.append({
            "type": "factsheet_zh",
            "name": fs_zh_pdf_name,
            "local": fs_zh_pdf_local,
            "drive": drive_dest,
            "download_url": f"/download?file={fs_zh_pdf_name}"
        })

    if options.get("export_factsheet_en", True):
        fs_en_pdf_name = f"HR_Model_Portfolio_Risk_Factsheet_{settle_date}.pdf"
        fs_en_pdf_local = os.path.join(BASE_DIR, "output", fs_en_pdf_name)
        render_html_to_pdf(factsheet_files["en_html"], fs_en_pdf_local, "HR Model Portfolio Risk Factsheet")
        drive_dest = None
        if os.path.exists(target_dir):
            drive_dest = os.path.join(target_dir, fs_en_pdf_name)
            try:
                shutil.copy2(fs_en_pdf_local, drive_dest)
            except Exception as e:
                drive_dest = f"Copy error: {e}"
        results.append({
            "type": "factsheet_en",
            "name": fs_en_pdf_name,
            "local": fs_en_pdf_local,
            "drive": drive_dest,
            "download_url": f"/download?file={fs_en_pdf_name}"
        })

    # Generate page previews for the Chinese memo if exported
    previews = []
    memo_pdf_local = os.path.join(BASE_DIR, "output", f"HR_模板投资组合_月度备忘录_{settle_date}.pdf")
    if os.path.exists(memo_pdf_local):
        previews_dir = os.path.join(BASE_DIR, "output", "previews")
        os.makedirs(previews_dir, exist_ok=True)
        doc = fitz.open(memo_pdf_local)
        for idx, page in enumerate(doc):
            pix = page.get_pixmap(dpi=150)
            img_path = os.path.join(previews_dir, f"page_{idx+1}.png")
            pix.save(img_path)
            previews.append(img_path)
        doc.close()

    return {
        "status": "success",
        "deliverables": results,
        "previews": previews,
        "count": len(results)
    }

def export_pdf():
    # Backward compatibility
    res = export_all_deliverables()
    memo = next((d for d in res["deliverables"] if d["type"] == "memo_zh"), None)
    return {
        "local_pdf": memo["local"] if memo else "",
        "drive_status": memo["drive"] if memo else "",
        "pages_rendered": len(res["previews"])
    }

if __name__ == "__main__":
    print("Testing multi-deliverable export...")
    res = export_all_deliverables()
    for d in res["deliverables"]:
        print(f" - {d['name']}: Local={d['local']}, Drive={d['drive']}")
