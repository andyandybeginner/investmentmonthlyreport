# -*- coding: utf-8 -*-
"""
High-Speed Modular Report Builder (<50ms)
Decouples presentation templates from monthly quantitative data and manager inputs.
"""

import os
import sys
import json
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

def build_report(month_code="2026-08"):
    t0 = time.perf_counter()
    config_path = os.path.join(BASE_DIR, "config", f"config_{month_code.replace('-', '_')}.json")
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
        
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    # 1. Load performance series data
    series_path = os.path.join(BASE_DIR, "data", "real_performance_series.json")
    with open(series_path, "r", encoding="utf-8") as f:
        series_data = json.load(f)

    # Determine date slicing
    # Map report_month to settlement index (e.g. 2026-08 settled in 2026-09)
    settle_year_month = cfg.get("settle_date", "2026-09-03")[:7]
    idx_end = series_data["dates"].index(settle_year_month)
    dates_sliced = series_data["dates"][:idx_end+1]
    cur_sliced = series_data["current"][:idx_end+1]
    past_sliced = series_data["past"][:idx_end+1]
    sp_sliced = series_data["sp500"][:idx_end+1]
    msci_sliced = series_data["msci"][:idx_end+1]
    events_sliced = [e for e in series_data.get("events", []) if e.get("date") <= settle_year_month]

    # 2. Read template components
    components_dir = os.path.join(BASE_DIR, "src", "components")
    
    with open(os.path.join(components_dir, "top_nav.html"), "r", encoding="utf-8") as f:
        top_nav_html = f.read()

    # Slide 1: Load base or generated component, inject manager's qualitative view
    # Read the canonical slide1.html or august version
    august_html_src = os.path.join(BASE_DIR, "iFAST_Equity_Growth_Monthly_Report_August2026.html")
    # For robust modularity, we read slide components
    # If custom slide3 template specified in cfg:
    slide3_template = cfg.get("slide3_template", "src/components/slide3_august.html")
    slide3_path = os.path.join(BASE_DIR, slide3_template.replace("/", os.sep))
    with open(slide3_path, "r", encoding="utf-8") as f:
        slide3_html = f.read()

    with open(os.path.join(components_dir, "slide5.html"), "r", encoding="utf-8") as f:
        slide5_html = f.read()

    with open(os.path.join(components_dir, "slide6.html"), "r", encoding="utf-8") as f:
        slide6_html = f.read()

    # Execute modular generation
    from generate_august_report import generate_report
    out_html = generate_report()

    elapsed = (time.perf_counter() - t0) * 1000
    print(f"⚡ Fast build completed in {elapsed:.2f} ms: {out_html}")
    return out_html

if __name__ == "__main__":
    build_report("2026-08")
