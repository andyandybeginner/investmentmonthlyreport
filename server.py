# -*- coding: utf-8 -*-
"""
Local Landing Page & Workflow Control Server (Zero Third-Party Dependencies)
Run with: python server.py
Serves the control dashboard at http://localhost:8080
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = 8080

class DashboardRequestHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = urllib.parse.unquote(path)
        clean_path = path.split('?')[0].split('#')[0]
        if clean_path == '/':
            return os.path.join(BASE_DIR, 'app', 'index.html')
        elif clean_path == '/preview':
            return os.path.join(BASE_DIR, 'iFAST_Equity_Growth_Monthly_Report_August2026.html')
        return os.path.join(BASE_DIR, clean_path.lstrip('/'))

    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        clean_path = url_parts.path
        query = urllib.parse.parse_qs(url_parts.query)

        if clean_path in ['/', '/preview']:
            filepath = self.translate_path(clean_path)
            if os.path.exists(filepath):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read())
                return

        elif clean_path == '/api/info':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            info = {
                "base_dir": BASE_DIR,
                "drive_path": r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report",
                "status": "active"
            }
            self.wfile.write(json.dumps(info, ensure_ascii=False).encode('utf-8'))
            return

        elif clean_path == '/api/get_config':
            month = query.get('month', ['2026-08'])[0]
            cfg_file = os.path.join(BASE_DIR, 'config', f'config_{month.replace("-", "_")}.json')
            if not os.path.exists(cfg_file):
                cfg_file = os.path.join(BASE_DIR, 'config', 'config_2026_08.json')

            cfg_data = {}
            if os.path.exists(cfg_file):
                with open(cfg_file, 'r', encoding='utf-8') as f:
                    cfg_data = json.load(f)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(cfg_data, ensure_ascii=False).encode('utf-8'))
            return

        elif clean_path == '/api/scan_drive':
            root_path = query.get('path', [None])[0]
            if not root_path:
                cfg_file = os.path.join(BASE_DIR, 'config', 'config_2026_08.json')
                if os.path.exists(cfg_file):
                    with open(cfg_file, 'r', encoding='utf-8') as f:
                        c = json.load(f)
                        root_path = c.get('google_drive_root', r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report")
                else:
                    root_path = r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report"

            exists = os.path.exists(root_path)
            monthly_updates = []
            factsheet_dirs = []

            if exists:
                try:
                    for root, dirs, files in os.walk(root_path):
                        for f in files:
                            if f.lower().endswith('.pdf'):
                                rel_path = os.path.relpath(os.path.join(root, f), root_path)
                                if 'monthly' in f.lower() or 'update' in f.lower() or 'horizon' in f.lower() or 'ifast' in f.lower():
                                    monthly_updates.append({
                                        "name": f,
                                        "rel_path": rel_path
                                    })
                        if root == root_path:
                            for d in dirs:
                                factsheet_dirs.append(d)
                except Exception as e:
                    print(f"Error scanning drive: {e}")

            if not monthly_updates:
                monthly_updates = [
                    {"name": "iFAST Monthly Investment Update Sep 2026.pdf", "rel_path": r"1. iFast Monthly update\iFAST Monthly Investment Update Sep 2026.pdf"},
                    {"name": "iFAST Monthly Investment Update October 2026.pdf", "rel_path": r"1. iFast Monthly update\iFAST Monthly Investment Update October 2026.pdf"}
                ]
            if not factsheet_dirs:
                factsheet_dirs = ["Sep 2026", "Oct 2026"]

            resp = {
                "status": "success",
                "root_path": root_path,
                "exists": exists,
                "monthly_updates": monthly_updates,
                "factsheet_dirs": sorted(factsheet_dirs)
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        clean_path = self.path.split('?')[0]
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            req_data = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            req_data = {}

        if clean_path in ['/api/save_config', '/api/save_manager_input']:
            month = req_data.get('report_month') or req_data.get('month', '2026-08')
            cfg_path = os.path.join(BASE_DIR, 'config', f'config_{month.replace("-", "_")}.json')
            
            if os.path.exists(cfg_path):
                with open(cfg_path, 'r', encoding='utf-8') as f:
                    cfg = json.load(f)
            else:
                cfg = {}

            # Update top-level fields
            for key in ['google_drive_root', 'reference_monthly_update', 'reference_factsheets_dir', 'monthly_conflict_calibration']:
                if key in req_data:
                    cfg[key] = req_data[key]

            # Update manager_input
            mgr = cfg.setdefault('manager_input', {})
            if 'qualitative_view' in req_data:
                mgr['qualitative_view'] = req_data['qualitative_view']
            if 'rebalance_verdict' in req_data:
                mgr['rebalance_verdict'] = req_data['rebalance_verdict']
            if 'rebalance_note' in req_data:
                mgr['rebalance_note'] = req_data['rebalance_note']
            if 'holdings_conviction' in req_data:
                mgr['holdings_conviction'] = req_data['holdings_conviction']

            with open(cfg_path, 'w', encoding='utf-8') as f:
                json.dump(cfg, f, ensure_ascii=False, indent=2)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "配置与定见已完整持久化保存！"}).encode('utf-8'))

        elif clean_path == '/api/build_report':
            month = req_data.get('month', '2026-08')
            try:
                from generate_august_report import generate_report
                out_file = generate_report()
                resp = {"status": "success", "output_file": os.path.basename(out_file)}
            except Exception as e:
                resp = {"status": "error", "message": str(e)}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))

        elif clean_path == '/api/export_pdf':
            try:
                from engine.exporter import export_pdf
                result = export_pdf()
                resp = {
                    "status": "success",
                    "local_pdf": result["local_pdf"],
                    "drive_status": result["drive_status"],
                    "pages_rendered": result["pages_rendered"]
                }
            except Exception as e:
                resp = {"status": "error", "message": str(e)}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, DashboardRequestHandler)
    print(f"🚀 Investment Advisory Control Panel running at: http://localhost:{PORT}")
    print(f"📄 Report Live Preview available at: http://localhost:{PORT}/preview")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
