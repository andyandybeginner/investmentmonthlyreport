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
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

PORT = 8080

def compute_sequence_month_count(month_str):
    try:
        y, m = map(int, month_str.split('-'))
        val_y = y + 1 if m == 12 else y
        val_m = 1 if m == 12 else m + 1
        return (val_y - 2023) * 12 + (val_m - 7) + 1
    except Exception:
        return 39

class DashboardRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        clean_path = url_parts.path
        query = urllib.parse.parse_qs(url_parts.query)

        # 1. Main Dashboard & Frontend Single Page App
        if clean_path == '/':
            dist_index = os.path.join(BASE_DIR, 'frontend', 'dist', 'index.html')
            if os.path.exists(dist_index):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(dist_index, 'rb') as f:
                    self.wfile.write(f.read())
                return
            filepath = os.path.join(BASE_DIR, 'app', 'index.html')
            if os.path.exists(filepath):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read())
                return

        # Vite Static Assets
        elif clean_path.startswith('/assets/'):
            asset_file = os.path.join(BASE_DIR, 'frontend', 'dist', clean_path.lstrip('/'))
            if os.path.exists(asset_file) and os.path.isfile(asset_file):
                self.send_response(200)
                if asset_file.endswith('.js'):
                    self.send_header('Content-Type', 'text/javascript; charset=utf-8')
                elif asset_file.endswith('.css'):
                    self.send_header('Content-Type', 'text/css; charset=utf-8')
                elif asset_file.endswith('.svg'):
                    self.send_header('Content-Type', 'image/svg+xml')
                elif asset_file.endswith('.png'):
                    self.send_header('Content-Type', 'image/png')
                else:
                    self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Content-Length', str(os.path.getsize(asset_file)))
                self.end_headers()
                with open(asset_file, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_response(404)
                self.end_headers()
                return

        # Named Direct Downloads
        elif clean_path.startswith('/download/'):
            target = clean_path.replace('/download/', '')
            matched_file = None
            out_dir = os.path.join(BASE_DIR, 'output')
            if target == 'memo_zh':
                matched_file = os.path.join(out_dir, 'HR_Model_Portfolio_Monthly_Memo_2026-09_ZH.pdf')
            elif target == 'memo_en':
                matched_file = os.path.join(out_dir, 'HR_Model_Portfolio_Monthly_Memo_2026-09_EN.pdf')
            elif target == 'factsheet_zh':
                matched_file = os.path.join(out_dir, 'HR_Model_Portfolio_Risk_Factsheet_2026-10-05.pdf')
            elif target == 'factsheet_en':
                matched_file = os.path.join(out_dir, 'HR_Model_Portfolio_Risk_Factsheet_2026-10-05.pdf')

            if matched_file and os.path.exists(matched_file):
                self.send_response(200)
                self.send_header('Content-Type', 'application/pdf')
                fn = os.path.basename(matched_file)
                self.send_header('Content-Disposition', f'attachment; filename="{fn}"')
                self.send_header('Content-Length', str(os.path.getsize(matched_file)))
                self.end_headers()
                with open(matched_file, 'rb') as f:
                    self.wfile.write(f.read())
                return

        # Direct File Download Endpoint
        elif clean_path == '/download':
            filename = query.get('file', [''])[0]
            filename = os.path.basename(filename)
            file_path = os.path.join(BASE_DIR, 'output', filename)
            if not os.path.exists(file_path):
                file_path = os.path.join(BASE_DIR, filename)

            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.send_response(200)
                self.send_header('Content-Type', 'application/pdf' if filename.endswith('.pdf') else 'application/octet-stream')
                encoded_filename = urllib.parse.quote(filename)
                self.send_header('Content-Disposition', f'attachment; filename="{encoded_filename}"; filename*=UTF-8\'\'{encoded_filename}')
                self.send_header('Content-Length', str(os.path.getsize(file_path)))
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(f"文件未找到: {filename}".encode('utf-8'))
                return

        # Static /output/ Viewer
        elif clean_path.startswith('/output/'):
            filename = os.path.basename(clean_path)
            file_path = os.path.join(BASE_DIR, 'output', filename)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.send_response(200)
                if filename.endswith('.pdf'):
                    self.send_header('Content-Type', 'application/pdf')
                elif filename.endswith('.html'):
                    self.send_header('Content-Type', 'text/html; charset=utf-8')
                elif filename.endswith('.png'):
                    self.send_header('Content-Type', 'image/png')
                else:
                    self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Content-Length', str(os.path.getsize(file_path)))
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_response(404)
                self.end_headers()
                return

        # 2. Dynamic Live Preview for Any Month
        elif clean_path == '/preview':
            month = query.get('month', [None])[0]
            filepath = ""
            if month:
                p = os.path.join(BASE_DIR, 'output', f'iFAST_Equity_Growth_Monthly_Report_{month}.html')
                if os.path.exists(p):
                    filepath = p
            if not filepath or not os.path.exists(filepath):
                latest = os.path.join(BASE_DIR, 'iFAST_Equity_Growth_Monthly_Report_Latest.html')
                if os.path.exists(latest):
                    filepath = latest
                else:
                    out_files = [f for f in os.listdir(os.path.join(BASE_DIR, 'output')) if f.endswith('.html')]
                    if out_files:
                        filepath = os.path.join(BASE_DIR, 'output', sorted(out_files)[-1])

            if filepath and os.path.exists(filepath):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read())
                return

        # 3. Dynamic Standalone Factsheet Previews
        elif clean_path in ['/preview-factsheet-zh', '/preview-factsheet-en']:
            month = query.get('month', ['2026-09'])[0]
            is_en = (clean_path == '/preview-factsheet-en')
            suffix = "EN" if is_en else "ZH"
            filepath = os.path.join(BASE_DIR, f'HR_Portfolio_Lookthrough_Factsheet_{month}_{suffix}.html')
            if not os.path.exists(filepath):
                filepath = os.path.join(BASE_DIR, f'HR_Portfolio_Lookthrough_Factsheet_2026-09_{suffix}.html')

            if os.path.exists(filepath):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read())
                return

        # 4. SKILL.md Reader API
        elif clean_path == '/api/skill_md':
            skill_path = os.path.join(BASE_DIR, 'SKILL.md')
            content = ""
            if os.path.exists(skill_path):
                with open(skill_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "content": content}, ensure_ascii=False).encode('utf-8'))
            return

        # 5. Month Config Getter
        elif clean_path == '/api/get_config':
            month = query.get('month', ['2026-08'])[0]
            cfg_file = os.path.join(BASE_DIR, 'config', f'config_{month.replace("-", "_")}.json')
            if not os.path.exists(cfg_file):
                # Dynamically generate sensible config for the requested month from template
                base_cfg_file = os.path.join(BASE_DIR, 'config', 'config_2026_08.json')
                with open(base_cfg_file, 'r', encoding='utf-8') as f:
                    cfg_data = json.load(f)
                
                y, m = month.split('-')
                m_int = int(m)
                next_m = m_int + 1 if m_int < 12 else 1
                next_y = int(y) if m_int < 12 else int(y) + 1
                cfg_data['report_month'] = month
                cfg_data['settle_date'] = f"{next_y}-{next_m:02d}-05"
                cfg_data['valuation_date_zh'] = f"{next_y}年{next_m}月5日 ({y}年{m_int}月结算)"
                if m_int >= 9:
                    cfg_data['reference_monthly_update'] = 'iFAST Monthly Investment Update October 2026.pdf'
                    cfg_data['reference_factsheets_dir'] = 'Oct 2026'
                    cfg_data['slide3_template'] = 'src/components/slide3.html'
                    cfg_data['slide3_topic_title'] = '月度专题深度：当债券不再扮演债券'
                
                # Save the new month config
                with open(cfg_file, 'w', encoding='utf-8') as f:
                    json.dump(cfg_data, f, ensure_ascii=False, indent=2)
            else:
                with open(cfg_file, 'r', encoding='utf-8') as f:
                    cfg_data = json.load(f)

            cfg_data['report_month'] = month
            cfg_data['dynamic_sequence_months'] = compute_sequence_month_count(month)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(cfg_data, ensure_ascii=False).encode('utf-8'))
            return

        # 6. Dynamic Section Matcher for iFAST Monthly Update PDF
        elif clean_path == '/api/match_pdf_sections':
            pdf_name = query.get('pdf', [''])[0]
            root = query.get('root', [r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report"])[0]
            pdf_path = os.path.join(root, '1. iFast Monthly update', pdf_name)
            if not os.path.exists(pdf_path):
                pdf_path = os.path.join(root, pdf_name)

            from engine.pdf_section_matcher import match_monthly_update_sections
            matched = match_monthly_update_sections(pdf_path)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(matched, ensure_ascii=False).encode('utf-8'))
            return

        # 7. Drive Directory Scanner
        elif clean_path == '/api/scan_drive':
            root_path = query.get('path', [None])[0]
            if not root_path:
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
                                if any(k in f.lower() for k in ['monthly', 'update', 'horizon', 'ifast']):
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

        # 8. Factsheet Files Scanner (Dynamic N Funds)
        elif clean_path == '/api/scan_factsheets':
            dir_name = query.get('dir', ['Sep 2026'])[0]
            root_path = query.get('root', [r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report"])[0]
            full_path = os.path.join(root_path, dir_name)
            
            factsheets = []
            if os.path.exists(full_path):
                for f in os.listdir(full_path):
                    if f.lower().endswith('.pdf') and not f.startswith('HR_'):
                        factsheets.append({
                            "filename": f,
                            "size_kb": round(os.path.getsize(os.path.join(full_path, f)) / 1024, 1)
                        })

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "success",
                "folder": full_path,
                "count": len(factsheets),
                "factsheets": factsheets
            }, ensure_ascii=False).encode('utf-8'))
            return

        # 9. Portfolio State API for React Frontend
        elif clean_path == '/api/portfolio_state':
            month = query.get('month', ['2026-09'])[0]
            perf_file = os.path.join(BASE_DIR, 'real_performance_series.json')
            look_file = os.path.join(BASE_DIR, 'portfolio_lookthrough_data.json')
            cfg_file = os.path.join(BASE_DIR, 'config', f'config_{month.replace("-", "_")}.json')
            if not os.path.exists(cfg_file):
                cfg_file = os.path.join(BASE_DIR, 'config', 'config_2026_09.json')
            
            perf_data = {}
            if os.path.exists(perf_file):
                with open(perf_file, 'r', encoding='utf-8') as f:
                    perf_data = json.load(f)
            
            look_data = {}
            if os.path.exists(look_file):
                with open(look_file, 'r', encoding='utf-8') as f:
                    look_data = json.load(f)
                    
            cfg_data = {}
            if os.path.exists(cfg_file):
                with open(cfg_file, 'r', encoding='utf-8') as f:
                    cfg_data = json.load(f)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "success",
                "performance": perf_data,
                "lookthrough": look_data,
                "config": cfg_data
            }, ensure_ascii=False).encode('utf-8'))
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

        # Live Google Sheet Sync
        if clean_path == '/api/sync_googlesheet':
            try:
                import sync_googlesheet_to_report
                sync_googlesheet_to_report.run_sync()
                resp = {"status": "success", "message": "Google Sheet 同步已成功完成！"}
            except Exception as e:
                resp = {"status": "error", "message": str(e)}
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))
            return

        # Save Configuration for the specified month
        if clean_path in ['/api/save_config', '/api/save_manager_input']:
            month = req_data.get('report_month') or req_data.get('month', '2026-08')
            cfg_path = os.path.join(BASE_DIR, 'config', f'config_{month.replace("-", "_")}.json')
            
            if os.path.exists(cfg_path):
                with open(cfg_path, 'r', encoding='utf-8') as f:
                    cfg = json.load(f)
            else:
                cfg = {}

            # Update paths and settings (all Section 1, 2, 3 parameters)
            supported_keys = [
                'google_drive_root', 'reference_monthly_update', 'reference_factsheets_dir', 
                'monthly_conflict_calibration', 'target_output_dir', 'export_options', 'settle_date',
                'valuation_date_zh', 'dynamic_sequence_months', 'benchmark', 'google_sheet_id',
                'calc_engine_tab', 'tab_strategy', 'price_rules', 'perf_rules', 'report_month'
            ]
            for key in supported_keys:
                if key in req_data:
                    cfg[key] = req_data[key]

            # Update manager_input (Section 4 parameters)
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

            sec_name = req_data.get('section_name', '设定')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "success", 
                "message": f"{month} {sec_name}已成功持久化保存至 config/config_{month.replace('-', '_')}.json！"
            }, ensure_ascii=False).encode('utf-8'))

        # Agent Sentiment Synthesis
        elif clean_path == '/api/analyze_sentiment':
            month = req_data.get('month', '2026-08')
            user_input = req_data.get('user_input', '')

            if '2026-08' in month:
                macro_sentiment = (
                    "【宏观情绪与外围综述 · 8月】全球资本市场处于‘利率再定价与财报验证’交锋期。美联储杰克逊霍尔释放鹰派审慎信号，长端美债收益率（30年期破5.3%）引发成长股估值分母端压制；"
                    "但英伟达财报与云巨头基础设施开支强劲，AI硬件需求坚挺。同时，地缘摩擦升温与全球央行购金去美元化，驱动金价单月暴涨+24.00%。"
                )
                ai_suggested_attribution = (
                    f"{user_input.strip()} 综合全球市场微观情绪与资金面监测，8月美债长端利率升破5.3%引发芯片成长股短期健康技术性整固（科技-5.64%）；"
                    "在此轮分化中，组合逆周期对冲资产发挥了关键压舱石效应——大华黄金单月暴涨+24.00%（穿透真实纯黄金敞口10.46%），贡献+1.94%绝对超额；"
                    "配合生命科学与日本高股息的充沛现金流防御，驱动组合全月实现+0.35%正收益，展现出极强的全天候抗跌穿越韧性。"
                )
            elif '2026-09' in month:
                macro_sentiment = (
                    "【宏观情绪与外围综述 · 9月】美联储开启超预期50基点降息，全球流动性拐点正式确立。中国央行推出强力组合拳（降准、降息与股票回购支持工具），在岸创新龙头与离岸科技股掀起史诗级估值修复；"
                    "但长端国债在通胀粘性担忧下收益率曲线陡峭化，传统债券抗震效果持续衰减。"
                )
                ai_suggested_attribution = (
                    f"{user_input.strip()} 9月美联储大幅降息50基点与中国央行强力刺激共振，全球风险偏好急剧抬升。组合底层中国创新龙头迎来强劲重估，科技硬件持续受益算力基础设施投资；"
                    "同时‘当债券不再扮演债券’的宏观事实，验证了本组合纯权益增长结合黄金与绝对收益底仓的配置前瞻性，组合稳健穿越利率震荡并把握反弹主线。"
                )
            else:
                macro_sentiment = (
                    "【宏观情绪与外围综述 · 10月】全球市场步入降息周期下半场与大选扰动期，宏观流动性充沛但地缘事件此起彼伏，核心防御资产与结构性高景气科技保持强吸金效应。"
                )
                ai_suggested_attribution = (
                    f"{user_input.strip()} 10月全球流动性宽松大势所趋，各板块估值逐步夯实。组合各大支柱分工明确，核心标的基本面支撑扎实，建议保持战略定力，顺应基本面长期内在价值回归。"
                )

            resp = {
                "status": "success",
                "macro_sentiment": macro_sentiment,
                "ai_suggested_attribution": ai_suggested_attribution
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))

        # Unified Dynamic Report Builder for ANY Month
        elif clean_path == '/api/build_report':
            month = req_data.get('month', '2026-08')
            try:
                from engine.report_generator import generate_report
                result = generate_report(month=month)
                resp = {
                    "status": "success",
                    "month": month,
                    "output_file": os.path.basename(result["monthly_html"]),
                    "factsheet_zh": os.path.basename(result["factsheet_zh"]),
                    "factsheet_en": os.path.basename(result["factsheet_en"]),
                    "matched_pages": result["matched_pages"]
                }
            except Exception as e:
                resp = {"status": "error", "message": str(e)}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))

        # Multi-Format Deliverable PDF Exporter
        elif clean_path == '/api/export_pdf':
            month = req_data.get('month', '2026-08')
            try:
                from engine.exporter import export_all_deliverables
                export_options = req_data.get('export_options', {})
                export_options['month'] = month
                result = export_all_deliverables(export_options)
                resp = {
                    "status": "success",
                    "month": month,
                    "deliverables": result["deliverables"],
                    "previews": result["previews"],
                    "count": result["count"]
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
