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
        # Default translation
        path = urllib.parse.unquote(path)
        clean_path = path.split('?')[0].split('#')[0]
        if clean_path == '/':
            return os.path.join(BASE_DIR, 'app', 'index.html')
        elif clean_path == '/preview':
            return os.path.join(BASE_DIR, 'iFAST_Equity_Growth_Monthly_Report_August2026.html')
        return os.path.join(BASE_DIR, clean_path.lstrip('/'))

    def do_GET(self):
        clean_path = self.path.split('?')[0]
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
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            info = {
                "base_dir": BASE_DIR,
                "drive_path": r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report",
                "status": "active"
            }
            self.wfile.write(json.dumps(info).encode('utf-8'))
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

        if clean_path == '/api/save_manager_input':
            month = req_data.get('month', '2026-08')
            cfg_path = os.path.join(BASE_DIR, 'config', f'config_{month.replace("-", "_")}.json')
            if os.path.exists(cfg_path):
                with open(cfg_path, 'r', encoding='utf-8') as f:
                    cfg = json.load(f)
                
                mgr = cfg.setdefault('manager_input', {})
                if 'qualitative_view' in req_data:
                    mgr['qualitative_view'] = req_data['qualitative_view']
                if 'rebalance_verdict' in req_data:
                    mgr['rebalance_verdict'] = req_data['rebalance_verdict']
                if 'rebalance_note' in req_data:
                    mgr['rebalance_note'] = req_data['rebalance_note']
                
                with open(cfg_path, 'w', encoding='utf-8') as f:
                    json.dump(cfg, f, ensure_ascii=False, indent=2)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Manager input saved."}).encode('utf-8'))

        elif clean_path == '/api/build_report':
            month = req_data.get('month', '2026-08')
            try:
                # Execute fast build
                from generate_august_report import generate_report
                out_file = generate_report()
                resp = {"status": "success", "output_file": os.path.basename(out_file)}
            except Exception as e:
                resp = {"status": "error", "message": str(e)}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode('utf-8'))

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
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode('utf-8'))
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
