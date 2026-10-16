# -*- coding: utf-8 -*-
"""
Live Google Sheet Synchronizer
Directly fetches from user's master Google Sheet:
https://docs.google.com/spreadsheets/d/1VXy6RGThyuQIBwYg9VF3NbWc7wXyfLFQcMGPgEf2Q4I
Pulls:
- HR_Model_Port_Current: latest date, total assets, 7 fund values, current weights (K/S), target weights (AC..AJ)
- HR_Model_Port_Past: counterfactual past model performance
- Calculation_Engine: Inception (Row 29: 2023-07-05) to latest date time series for Current, Past, S&P 500, MSCI ACWI
- Injects live data directly into iFAST_Equity_Growth_Monthly_Report_Landscape.html
"""

import urllib.request
import csv
import io
import json
import re

SHEET_ID = "1VXy6RGThyuQIBwYg9VF3NbWc7wXyfLFQcMGPgEf2Q4I"

def get_sheet_data(sheet_name):
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={urllib.parse.quote(sheet_name)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        return list(csv.reader(io.StringIO(content)))

def parse_num(val_str):
    if not val_str:
        return 0.0
    cleaned = re.sub(r'[\$,%]', '', str(val_str)).strip()
    try:
        return float(cleaned)
    except:
        return 0.0

def run_sync():
    print(f"📡 Connecting to master Google Sheet: {SHEET_ID}...")
    
    # 1. Fetch HR_Model_Port_Current
    cur_rows = get_sheet_data("HR_Model_Port_Current")
    # find latest row with valid date
    last_r_idx = len(cur_rows) - 1
    while last_r_idx > 0 and (len(cur_rows[last_r_idx]) < 2 or not cur_rows[last_r_idx][1].strip()):
        last_r_idx -= 1
        
    latest_cur = cur_rows[last_r_idx]
    settle_date = latest_cur[1].strip()
    total_val_s = parse_num(latest_cur[18])
    accum_perf_cur = parse_num(latest_cur[19])
    
    print(f"✅ HR_Model_Port_Current: Latest Date = {settle_date}, Total Value = ${total_val_s:,.2f}, Accum = {accum_perf_cur:.2f}%")
    
    # Fund details from Col C to J (names), Col K to R (values), Col AC to AJ (target weights)
    # Funds 1 to 7
    fund_names = [
        "FULLERTON LUX - GLOBAL ABSOLUTE ALPHA",
        "EASTSPRING - GLOBAL TECHNOLOGY SGD",
        "Janus Henderson Global Life Sciences",
        "United Gold and General A Acc SGD",
        "United China A Shares Innovation A Acc",
        "FSSA Asian Growth Fund (Class A)",
        "Nikko AM Japan Dividend"
    ]
    
    # In Sheet:
    # Fund 1 is China A (Col 3 / Col 11)
    # Fund 2 is Fullerton Alpha (Col 4 / Col 12)
    # Fund 3 is Eastspring Tech (Col 5 / Col 13)
    # Fund 4 is Janus Henderson Life (Col 6 / Col 14)
    # Fund 5 is United Gold (Col 7 / Col 15)
    # Fund 6 is FSSA Asian (Col 8 / Col 16)
    # Fund 7 is Nikko AM Japan (Col 9 / Col 17)
    
    funds_data = []
    col_mapping = [
        {"role_zh": "全天候底仓", "role_en": "Core Ballast", "name": "FULLERTON LUX - GLOBAL ABSOLUTE ALPHA", "val_col": 11, "tar_col": 29},
        {"role_zh": "科技成长", "role_en": "Tech Growth", "name": "EASTSPRING - GLOBAL TECHNOLOGY SGD", "val_col": 12, "tar_col": 30},
        {"role_zh": "生命科学", "role_en": "Healthcare", "name": "Janus Henderson Global Life Sciences", "val_col": 13, "tar_col": 31},
        {"role_zh": "黄金对冲", "role_en": "Gold & Commodity", "name": "United Gold and General A Acc SGD", "val_col": 14, "tar_col": 32},
        {"role_zh": "中国创新", "role_en": "China Innovation", "name": "United China A Shares Innovation A Acc", "val_col": 10, "tar_col": 28},
        {"role_zh": "亚洲主题", "role_en": "Asia Focus", "name": "FSSA Asian Growth Fund (Class A)", "val_col": 15, "tar_col": 33},
        {"role_zh": "日本高息", "role_en": "Japan Dividend", "name": "Nikko AM Japan Dividend", "val_col": 16, "tar_col": 34}
    ]
    
    for item in col_mapping:
        val = parse_num(latest_cur[item["val_col"]])
        tar_raw = parse_num(latest_cur[item["tar_col"]])
        tar_w = tar_raw if tar_raw <= 1.0 else (tar_raw / 100.0)
        cur_w = (val / total_val_s * 100.0) if total_val_s > 0 else 0.0
        funds_data.append({
            "name": item["name"],
            "role_zh": item["role_zh"],
            "role_en": item["role_en"],
            "value": val,
            "target_w": tar_w * 100.0,
            "actual_w": cur_w
        })
        print(f"   -> {item['role_zh']}: Val=${val:,.2f} | Actual={cur_w:.2f}% | Target={tar_w*100.0:.2f}%")
        
    # 2. Fetch Calculation_Engine (Column A = Full Date YYYY-MM-DD, Column F = Current NAV)
    calc_rows = get_sheet_data("Calculation_Engine")
    # Row 29 is list index 28
    dates = []
    full_dates = []
    cur_series = []
    past_series = []
    sp_series = []
    msci_series = []
    
    for r in range(28, len(calc_rows)):
        row = calc_rows[r]
        if len(row) >= 9 and row[0].strip() and row[5].strip():
            full_d = row[0].strip() # YYYY-MM-DD from Column A
            d_str = full_d[:7]      # YYYY-MM
            full_dates.append(full_d)
            dates.append(d_str)
            cur_series.append(round(parse_num(row[5]) / 100.0, 4))
            past_series.append(round(parse_num(row[6]) / 100.0, 4))
            sp_series.append(round(parse_num(row[7]) / 100.0, 4))
            msci_series.append(round(parse_num(row[8]) / 100.0, 4))
            
    print(f"✅ Calculation_Engine: Extracted {len(dates)} periods from {full_dates[0]} to {full_dates[-1]}")
    print(f"   Latest Values ({dates[-1]}): Current={cur_series[-1]*100:.2f}%, Past={past_series[-1]*100:.2f}%, S&P={sp_series[-1]*100:.2f}%, MSCI={msci_series[-1]*100:.2f}%")
    
    # Extract Reconstitution / Rebalance events from Col A & Col B
    portfolio_events = []
    for r in cur_rows:
        if len(r) > 1:
            st = r[0].strip()
            dt = r[1].strip()
            if st in ('Reconstitute', 'Restructure', 'Rebalance'):
                portfolio_events.append({
                    "date": dt[:7],
                    "fullDate": dt,
                    "status": st,
                    "type": "rebalance" if 'rebalance' in st.lower() else "restructure"
                })
    print(f"✅ Extracted {len(portfolio_events)} Portfolio Events: {portfolio_events}")

    # Save real series JSON
    with open('real_performance_series.json', 'w', encoding='utf-8') as f:
        json.dump({
            "dates": dates,
            "full_dates": full_dates,
            "current": cur_series,
            "past": past_series,
            "sp500": sp_series,
            "msci": msci_series,
            "latest_settle_date": settle_date,
            "total_value": total_val_s,
            "events": portfolio_events
        }, f, indent=2)
        
    print("✅ real_performance_series.json updated successfully!")

    # 3. Trigger Production Report Generator
    try:
        from engine.report_generator import generate_report
        generate_report()
        print("✅ Report re-compiled with latest Google Sheet data successfully!")
    except Exception as e:
        print(f"⚠️ Report build warning: {e}")

    return True


def resolve_settle_date_from_calc_engine(report_month, live_fetch=True):
    """
    Given report_month 'YYYY-MM' (e.g. '2026-09'), queries Calculation_Engine Column A
    for the first date in the next month M+1 (e.g. '2026-10') that has a valid price in Column F.
    """
    try:
        y_str, m_str = report_month.split('-')
        y = int(y_str)
        m = int(m_str)
        next_y = y + 1 if m == 12 else y
        next_m = 1 if m == 12 else m + 1
        target_ym = f"{next_y}-{next_m:02d}"
    except Exception:
        return "2026-10-05"

    # 1. Try live Google Sheet Calculation_Engine Column A
    if live_fetch:
        try:
            calc_rows = get_sheet_data("Calculation_Engine")
            for r in range(28, len(calc_rows)):
                row = calc_rows[r]
                if len(row) >= 6 and row[0].strip() and row[5].strip():
                    col_a_date = row[0].strip()
                    price_val = parse_num(row[5])
                    if col_a_date.startswith(target_ym) and price_val > 0:
                        return col_a_date
        except Exception as e:
            print(f"⚠️ Live Calculation_Engine lookup fallback to cache: {e}")

    # 2. Fallback to cached full_dates in real_performance_series.json
    try:
        import os
        base_dir = os.path.dirname(os.path.abspath(__file__))
        perf_path = os.path.join(base_dir, "real_performance_series.json")
        if os.path.exists(perf_path):
            with open(perf_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            for fd in data.get("full_dates", []):
                if fd.startswith(target_ym):
                    return fd
    except Exception:
        pass

    return f"{target_ym}-05"


if __name__ == '__main__':
    run_sync()


