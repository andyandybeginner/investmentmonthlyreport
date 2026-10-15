"""
Google Sheet Live Feeder for HR Model Portfolio
Directly pulls metadata, current portfolio weights, past portfolio counterfactuals,
and 40-month time series from the user's master Google Sheet.
Sheet ID: 1VXy6RGThyuQIBwYg9VF3NbWc7wXyfLFQcMGPgEf2Q4I
"""

import urllib.request
import json
import csv
import io
import re

SHEET_ID = "1VXy6RGThyuQIBwYg9VF3NbWc7wXyfLFQcMGPgEf2Q4I"

def fetch_sheet_csv(sheet_name):
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={urllib.parse.quote(sheet_name)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            reader = csv.reader(io.StringIO(content))
            return list(reader)
    except urllib.error.HTTPError as e:
        if e.code == 401:
            raise PermissionError("HTTP 401: Google Sheet 权限受限，请开启「知道链接的任何人可查看 (Anyone with the link can view)」或配置 Apps Script Web App。")
        raise e

def test_connection():
    print(f"Connecting to Google Sheet: {SHEET_ID}...")
    try:
        rows = fetch_sheet_csv("HR_Model_Port_Current")
        print(f"✅ 成功连接！读取到 HR_Model_Port_Current 共 {len(rows)} 行数据。")
        return True
    except PermissionError as pe:
        print(f"❌ 权限不足: {pe}")
        return False
    except Exception as e:
        print(f"❌ 连接异常: {e}")
        return False

if __name__ == '__main__':
    test_connection()
