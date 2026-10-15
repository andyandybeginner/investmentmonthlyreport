# -*- coding: utf-8 -*-
"""
High-Resolution PDF & Multi-Slide Exporter
Renders HTML reports to A4 Landscape PDF and synchronizes directly to Google Drive.
"""

import os
import shutil
import fitz
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRIVE_DIR = r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report"

def export_pdf(html_path=None, pdf_filename="HR_模板投资组合_月度备忘录_2026-09-03.pdf"):
    if not html_path:
        html_path = os.path.join(BASE_DIR, "iFAST_Equity_Growth_Monthly_Report_August2026.html")
    
    output_pdf_local = os.path.join(BASE_DIR, "output", pdf_filename)
    root_pdf_local = os.path.join(BASE_DIR, pdf_filename)
    drive_pdf_path = os.path.join(DRIVE_DIR, pdf_filename)
    
    print(f"🚀 Launching Playwright Chromium for: {html_path}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1400, "height": 990})
        page.goto(f"file:///{html_path.replace(os.sep, '/')}", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Emulate print media and trigger responsive canvas resizing
        page.emulate_media(media="print")
        page.evaluate("() => { if (window.Chart) { Object.values(Chart.instances).forEach(c => c.resize()); } }")
        page.wait_for_timeout(500)

        # Export high-res A4 Landscape PDF (297mm x 210mm)
        page.pdf(
            path=output_pdf_local,
            width="297mm",
            height="210mm",
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
            print_background=True,
            display_header_footer=False
        )
        browser.close()

    # Sanitize PDF Metadata Title & Author
    doc = fitz.open(output_pdf_local)
    meta = doc.metadata
    meta["title"] = "HR 模板投资组合 · 月度投资咨询备忘录"
    meta["subject"] = "投资顾问咨询月度备忘录"
    meta["author"] = "Gu Haoran / Alpha Wealth"
    meta["keywords"] = "HR 模板投资组合, 月度备忘录, 资产配置"
    doc.set_metadata(meta)
    temp_pdf = output_pdf_local + ".clean.pdf"
    doc.save(temp_pdf)
    doc.close()
    os.replace(temp_pdf, output_pdf_local)

    # Sync to root for backward compatibility
    shutil.copy2(output_pdf_local, root_pdf_local)

    # Sync to Google Drive
    drive_status = "Not accessible"
    if os.path.exists(DRIVE_DIR):
        try:
            shutil.copy2(output_pdf_local, drive_pdf_path)
            drive_status = f"Successfully copied to {drive_pdf_path}"
        except PermissionError:
            alt_path = os.path.join(DRIVE_DIR, pdf_filename.replace(".pdf", " (更新).pdf"))
            shutil.copy2(output_pdf_local, alt_path)
            drive_status = f"Saved as {alt_path} (target was locked by viewer)"

    # Generate Page Previews into output/previews/
    previews_dir = os.path.join(BASE_DIR, "output", "previews")
    os.makedirs(previews_dir, exist_ok=True)
    doc = fitz.open(output_pdf_local)
    preview_files = []
    for idx, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        img_name = f"page_{idx+1}.png"
        img_path = os.path.join(previews_dir, img_name)
        pix.save(img_path)
        preview_files.append(img_path)
    doc.close()

    print(f"✅ Export completed: {output_pdf_local} ({len(preview_files)} pages). Drive: {drive_status}")
    return {
        "local_pdf": output_pdf_local,
        "drive_status": drive_status,
        "pages_rendered": len(preview_files),
        "previews": preview_files
    }

if __name__ == "__main__":
    export_pdf()
