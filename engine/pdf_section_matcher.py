# -*- coding: utf-8 -*-
"""
iFAST Monthly Investment Update Section & Page Matcher
1. Automatically locates the matching M+1 Monthly Update PDF in the preset local folder
   given a report month M (e.g. 2026-09 -> October 2026 PDF; 2026-08 -> Sep 2026 PDF).
2. Dynamically matches key section pages (Returns, Star Ratings, Feature Insight / Ideas of the Month)
   by reading section headings rather than relying on hardcoded page numbers.
"""

import os
import re
import fitz

PRESET_UPDATE_FOLDERS = [
    r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\1. iFast Monthly update",
    r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
]

MONTH_KEYWORDS = {
    1: ["january", "jan"],
    2: ["february", "feb"],
    3: ["march", "mar"],
    4: ["april", "apr"],
    5: ["may"],
    6: ["june", "jun"],
    7: ["july", "jul"],
    8: ["august", "aug"],
    9: ["september", "sep", "sept"],
    10: ["october", "oct"],
    11: ["november", "nov"],
    12: ["december", "dec"]
}

def find_pdf_for_report_month(report_month, custom_folder=None):
    """
    For report_month 'YYYY-MM' (e.g. '2026-09'), the publication/reference month is M+1 (e.g. 2026-10, Oct 2026).
    Searches the preset local folder for the matching iFAST Monthly Investment Update PDF.
    """
    try:
        y_str, m_str = report_month.split("-")
        y = int(y_str)
        m = int(m_str)
        pub_y = y + 1 if m == 12 else y
        pub_m = 1 if m == 12 else m + 1
    except Exception:
        pub_y, pub_m = 2026, 10

    keywords = MONTH_KEYWORDS.get(pub_m, ["october", "oct"])
    yyyymm_prefix = f"{pub_y}{pub_m:02d}"

    folders = [custom_folder] + PRESET_UPDATE_FOLDERS if custom_folder else PRESET_UPDATE_FOLDERS
    for folder in folders:
        if not folder or not os.path.exists(folder):
            continue
        try:
            files = [f for f in os.listdir(folder) if f.lower().endswith(".pdf")]
            for f in files:
                f_low = f.lower()
                if "ifast" in f_low or "monthly" in f_low or "update" in f_low:
                    # Match either month name (e.g. Oct / October) + year or YYYYMM prefix
                    if str(pub_y) in f_low and any(re.search(rf"\b{kw}\b", f_low) for kw in keywords):
                        return os.path.join(folder, f), f
                    if yyyymm_prefix in f_low:
                        return os.path.join(folder, f), f
        except Exception:
            continue

    # Fallback default filename
    default_name = (
        "iFAST Monthly Investment Update Sep 2026.pdf"
        if pub_m == 9
        else "iFAST Monthly Investment Update October 2026.pdf"
    )
    return os.path.join(PRESET_UPDATE_FOLDERS[0], default_name), default_name


def match_monthly_update_sections(pdf_path):
    if not pdf_path or not os.path.exists(pdf_path):
        is_sep = pdf_path and ("sep" in pdf_path.lower() or "202609" in pdf_path.lower())
        return {
            "exists": False,
            "filename": os.path.basename(pdf_path) if pdf_path else "",
            "error": "File not found in preset folder",
            "philosophy_page": 2,
            "returns_page": 3 if is_sep else 6,
            "star_ratings_page": 4 if is_sep else 7,
            "topic_page": 6 if is_sep else 12,
            "topic_title": "When Bonds Stop Behaving Like Bonds" if not is_sep else "New Singapore High-Growth Opportunities",
            "topic_title_zh": "超越银行主导核心——主动布局“新新加坡”高成长机遇" if is_sep else "当债券不再扮演债券：60/40股债平衡组合是否已死？",
            "topic_title_en": "Transcending Bank-Centric Anchors: Active Positioning for \"New Singapore\" High-Growth Opportunities" if is_sep else "When Bonds Stop Behaving Like Bonds: Is 60/40 Dead?"
        }

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        return {
            "exists": False,
            "filename": os.path.basename(pdf_path),
            "error": str(e),
            "philosophy_page": 2,
            "returns_page": 3,
            "star_ratings_page": 4,
            "topic_page": 5,
            "topic_title": "Monthly Feature",
            "topic_title_zh": "当债券不再扮演债券：60/40股债平衡组合是否已死？",
            "topic_title_en": "When Bonds Stop Behaving Like Bonds: Is 60/40 Dead?"
        }

    info = {
        "exists": True,
        "filename": os.path.basename(pdf_path),
        "pdf_path": pdf_path,
        "total_pages": len(doc),
        "philosophy_page": 2,
        "returns_page": None,
        "star_ratings_page": None,
        "topic_page": None,
        "topic_title": None,
        "topic_title_zh": None,
        "topic_title_en": None
    }

    # Start searching from page 2 (index 1) to skip cover/TOC
    for i in range(1, len(doc)):
        text = doc[i].get_text()
        norm = re.sub(r'\s+', '', text).upper()

        if 'OURPHILOSOPHY' in norm and not info['philosophy_page']:
            info['philosophy_page'] = i + 1

        if 'INVESTMENTVIEWS' in norm and not info['star_ratings_page']:
            info['star_ratings_page'] = i + 1

        # Feature Insight / Thematic Article detection
        if 'WHENBONDSSTOPBEHAVINGLIKEBONDS' in norm:
            info['topic_page'] = i + 1
            info['topic_title'] = "When Bonds Stop Behaving Like Bonds"
            info['topic_title_zh'] = "当债券不再扮演债券：60/40股债平衡组合是否已死？"
            info['topic_title_en'] = "When Bonds Stop Behaving Like Bonds: Is 60/40 Dead?"
        elif 'SINGAPOREEQUITYFUND' in norm and 'FUNDMANAGER' in norm:
            info['topic_page'] = i + 1
            info['topic_title'] = "iFAST-Amova Singapore Equity Fund"
            info['topic_title_zh'] = "超越银行主导核心——主动布局“新新加坡”高成长机遇"
            info['topic_title_en'] = "Transcending Bank-Centric Anchors: Active Positioning for \"New Singapore\" High-Growth Opportunities"
        elif 'IDEASOFTHEMONTH' in norm and not info['topic_page']:
            info['topic_page'] = i + 1
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            for l in lines:
                l_clean = re.sub(r'\s+', '', l).upper()
                if len(l) > 10 and not any(k in l_clean for k in ['IDEASOFTHEMONTH', 'UNITTRUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'IFAST']):
                    info['topic_title'] = l
                    break

        if any(k in norm for k in ['-4%-2%0%', '-8%-6%-4%', 'EQUITYMARKETS', 'BONDMARKETS']) and i < 10 and not info['returns_page']:
            info['returns_page'] = i + 1

    # Fallback heuristics
    if not info['returns_page']:
        info['returns_page'] = 3
    if not info['star_ratings_page']:
        info['star_ratings_page'] = 4
    if not info['topic_page']:
        info['topic_page'] = 5
    if not info['topic_title']:
        info['topic_title'] = "月度特色专题研讨"
    if not info['topic_title_zh']:
        info['topic_title_zh'] = info['topic_title']
    if not info['topic_title_en']:
        info['topic_title_en'] = info['topic_title']

    return info


if __name__ == '__main__':
    for rm in ["2026-08", "2026-09"]:
        p, fname = find_pdf_for_report_month(rm)
        print(f"Report Month {rm} -> Found PDF: {fname}")
        print("  Matched Sections:", match_monthly_update_sections(p))
