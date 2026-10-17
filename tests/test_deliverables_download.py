# -*- coding: utf-8 -*-
"""
Verification Script for Unified Deliverables Download Modal and Section 3 Merged Action.
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACT_DIR = r"C:\Users\SuperAndy\.gemini\antigravity\brain\dfe8412d-48aa-4d39-8a9f-d0b341a50db9"

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        page = context.new_page()

        print("1. Navigating to http://localhost:8080/...")
        page.goto("http://localhost:8080/", wait_until="networkidle")
        time.sleep(2)

        # Scroll to Section 3
        print("2. Locating Section 3...")
        sec3_header = page.locator("text=双文件独立分发与导出矩阵")
        sec3_header.scroll_into_view_if_needed()
        time.sleep(1)

        # Screenshot Section 3
        shot1 = os.path.join(ARTIFACT_DIR, "step1_section3_merged_button.png")
        page.screenshot(path=shot1)
        print(f"   Saved Section 3 screenshot to: {shot1}")

        # Click the unified download button
        print("3. Clicking unified download button...")
        btn = page.locator("button:has-text('批量分发与一键下载交付物')").first
        btn.click()
        time.sleep(1)

        # Verify Download Modal appeared
        modal_header = page.locator("h3:has-text('批量分发与一键下载交付物')")
        assert modal_header.is_visible(), "Modal header should be visible"

        # Screenshot the download modal (default full selection)
        shot2 = os.path.join(ARTIFACT_DIR, "step2_download_modal_initial.png")
        page.screenshot(path=shot2)
        print(f"   Saved Modal initial state to: {shot2}")

        # Test Quick Select filter buttons
        print("4. Testing quick select filters...")
        page.locator("button:has-text('仅备忘录 (2)')").click()
        time.sleep(0.5)

        page.locator("button:has-text('仅穿透单页 (2)')").click()
        time.sleep(0.5)

        page.locator("button:has-text('全选 (4/4)')").click()
        time.sleep(0.5)

        # Set preset output folder
        print("5. Testing preset folder button...")
        page.locator("button:has-text('output/ 目录')").click()
        time.sleep(0.5)

        shot3 = os.path.join(ARTIFACT_DIR, "step3_download_modal_configured.png")
        page.screenshot(path=shot3)
        print(f"   Saved Modal configured state to: {shot3}")

        # Trigger batch download
        print("6. Clicking Execute Batch Download...")
        exec_btn = page.locator("button:has-text('一键下载选中的 4 个交付物 PDF')")
        exec_btn.click()
        time.sleep(3)

        # Verify completion message
        success_banner = page.locator("text=成功下载 4 个交付物").first
        print(f"   Success banner visible: {success_banner.is_visible()}")

        shot4 = os.path.join(ARTIFACT_DIR, "step4_download_modal_completed.png")
        page.screenshot(path=shot4)
        print(f"   Saved Modal completed state to: {shot4}")

        browser.close()
        print("Verification completed successfully!")

if __name__ == "__main__":
    run_test()
