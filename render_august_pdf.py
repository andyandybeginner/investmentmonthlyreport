# -*- coding: utf-8 -*-
"""
Render August 2026 HTML to high-resolution A4 Landscape PDF
and output directly to Google Drive and workspace.
"""

import os
import shutil
import fitz
from playwright.sync_api import sync_playwright

html_file = os.path.abspath("iFAST_Equity_Growth_Monthly_Report_August2026.html")
pdf_local = os.path.abspath("HR_模板投资组合_月度备忘录_2026-09-03.pdf")
drive_dir = r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report"
pdf_drive = os.path.join(drive_dir, "HR_模板投资组合_月度备忘录_2026-09-03.pdf")

print("🚀 Launching Playwright Chromium...")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Set high-res 16:9 / A4 landscape viewport
    page = browser.new_page(viewport={"width": 1400, "height": 990})
    page.goto(f"file:///{html_file.replace(os.sep, '/')}", wait_until="networkidle")
    page.wait_for_timeout(1000)

    # Emulate print media and trigger Chart.js responsive resize to exact A4 print dimensions
    page.emulate_media(media="print")
    page.evaluate("() => { if (window.Chart) { Object.values(Chart.instances).forEach(c => c.resize()); } }")
    page.wait_for_timeout(500)

    # Print high quality A4 PDF
    page.pdf(
        path=pdf_local,
        width="297mm",
        height="210mm",
        margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
        print_background=True,
        display_header_footer=False
    )
    browser.close()

print(f"✅ PDF generated at local workspace: {pdf_local} ({os.path.getsize(pdf_local):,} bytes)")

# Explicitly ensure PDF metadata Title has zero 全权委托 references
doc = fitz.open(pdf_local)
meta = doc.metadata
meta["title"] = "HR 模板投资组合 · 月度投资咨询备忘录"
meta["subject"] = "投资顾问咨询月度备忘录"
meta["author"] = "Gu Haoran / Alpha Wealth"
meta["keywords"] = "HR 模板投资组合, 月度备忘录, 资产配置"
doc.set_metadata(meta)
temp_pdf = pdf_local + ".clean.pdf"
doc.save(temp_pdf)
doc.close()
os.replace(temp_pdf, pdf_local)
print(f"✅ PDF metadata sanitized: Title = '{meta['title']}'")

# Copy to Google Drive
if os.path.exists(drive_dir):
    try:
        shutil.copy2(pdf_local, pdf_drive)
        print(f"✅ PDF successfully copied to Google Drive: {pdf_drive} ({os.path.getsize(pdf_drive):,} bytes)")
    except PermissionError:
        alt_drive = os.path.join(drive_dir, "HR_模板投资组合_月度备忘录_2026-09-03 (更新).pdf")
        shutil.copy2(pdf_local, alt_drive)
        print(f"⚠️ Target file is currently open/locked in PDF reader: {pdf_drive}")
        print(f"✅ Saved updated version to Google Drive as: {alt_drive} ({os.path.getsize(alt_drive):,} bytes)")
else:
    print(f"⚠️ Google Drive directory not accessible: {drive_dir}")

# Verify PDF geometry and render images for visual inspection
doc = fitz.open(pdf_local)
print(f"📄 Verification: Total Pages = {len(doc)}")
for idx, page in enumerate(doc):
    rect = page.rect
    w_mm = rect.width * 25.4 / 72
    h_mm = rect.height * 25.4 / 72
    print(f"   Page {idx+1}: {rect.width:.2f} x {rect.height:.2f} pt ({w_mm:.1f} x {h_mm:.1f} mm, ratio {rect.width/rect.height:.3f})")
    
    # Render PNG image
    pix = page.get_pixmap(dpi=150)
    img_name = f"aug_p{idx+1}.png"
    pix.save(img_name)
    print(f"   -> Rendered {img_name} ({os.path.getsize(img_name):,} bytes)")
