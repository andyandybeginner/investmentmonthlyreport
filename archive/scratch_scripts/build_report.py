# -*- coding: utf-8 -*-
"""
Master Report Builder
Assembles modular presentation components from src/ into the final deliverable:
iFAST_Equity_Growth_Monthly_Report_Landscape.html

Run time: ~0.02s
"""

import time
import os

def build():
    start_time = time.perf_counter()
    print("🚀 Building iFAST Monthly Advisory Report...")

    # Load components
    base_file = "src/templates/base.html"
    top_nav_file = "src/components/top_nav.html"
    toolbar_file = "src/components/annotation_toolbar.html"
    i18n_file = "src/data/i18n.js"
    main_js_file = "src/js/main.js"

    slide_files = [f"src/components/slide{i}.html" for i in range(1, 6)]

    # Read base template
    with open(base_file, "r", encoding="utf-8") as f:
        html = f.read()

    # Read and inject top nav
    with open(top_nav_file, "r", encoding="utf-8") as f:
        html = html.replace("{{TOP_NAV}}", f.read().strip())

    # Read and inject each slide
    for i, sf in enumerate(slide_files, start=1):
        if not os.path.exists(sf):
            raise FileNotFoundError(f"Missing slide component: {sf}")
        with open(sf, "r", encoding="utf-8") as f:
            slide_content = f.read().strip()
            html = html.replace(f"{{{{SLIDE_{i}}}}}", slide_content)
        print(f"   [+] Injected Slide {i} ({len(slide_content):,} chars)")

    # Read and inject toolbar
    with open(toolbar_file, "r", encoding="utf-8") as f:
        html = html.replace("{{ANNOTATION_TOOLBAR}}", f.read().strip())

    # Read and inject i18n
    with open(i18n_file, "r", encoding="utf-8") as f:
        html = html.replace("{{I18N_JS}}", f.read().strip())

    # Read and inject main js
    with open(main_js_file, "r", encoding="utf-8") as f:
        html = html.replace("{{MAIN_JS}}", f.read().strip())

    # Check for any lingering placeholders
    lingering = [tag for tag in ["{{TOP_NAV}}", "{{SLIDE_1}}", "{{SLIDE_2}}", "{{SLIDE_3}}", "{{SLIDE_4}}", "{{SLIDE_5}}", "{{I18N_JS}}", "{{MAIN_JS}}"] if tag in html]
    if lingering:
        raise ValueError(f"Build Error: Unresolved placeholders: {lingering}")

    output_path = "iFAST_Equity_Growth_Monthly_Report_Landscape.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    elapsed_ms = (time.perf_counter() - start_time) * 1000
    print(f"✅ Build Successful! Output generated at '{output_path}' ({len(html):,} bytes) in {elapsed_ms:.1f}ms")
    return True

if __name__ == "__main__":
    build()
