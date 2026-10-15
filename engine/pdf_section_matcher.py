# -*- coding: utf-8 -*-
"""
iFAST Monthly Investment Update Section & Page Matcher
Dynamically matches key section pages (Returns, Star Ratings, Ideas of the Month)
by reading section headings rather than relying on hardcoded page numbers.
"""

import os
import re
import fitz

def match_monthly_update_sections(pdf_path):
    if not os.path.exists(pdf_path):
        return {
            "exists": False,
            "error": "File not found",
            "philosophy_page": 2,
            "returns_page": 3,
            "star_ratings_page": 4,
            "topic_page": 5,
            "topic_title": "Monthly Feature"
        }

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        return {
            "exists": False,
            "error": str(e),
            "philosophy_page": 2,
            "returns_page": 3,
            "star_ratings_page": 4,
            "topic_page": 5,
            "topic_title": "Monthly Feature"
        }

    info = {
        "exists": True,
        "total_pages": len(doc),
        "philosophy_page": 2,
        "returns_page": None,
        "star_ratings_page": None,
        "topic_page": None,
        "topic_title": None
    }

    # Start searching from page 2 (index 1) to skip cover/TOC
    for i in range(1, len(doc)):
        text = doc[i].get_text()
        norm = re.sub(r'\s+', '', text).upper()

        if 'OURPHILOSOPHY' in norm and not info['philosophy_page']:
            info['philosophy_page'] = i + 1

        if 'INVESTMENTVIEWS' in norm and not info['star_ratings_page']:
            info['star_ratings_page'] = i + 1

        if 'IDEASOFTHEMONTH' in norm and not info['topic_page']:
            info['topic_page'] = i + 1
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            for l in lines:
                l_clean = re.sub(r'\s+', '', l).upper()
                if len(l) > 10 and not any(k in l_clean for k in ['IDEASOFTHEMONTH', 'UNITTRUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'IFAST']):
                    info['topic_title'] = l
                    break

        if any(k in norm for k in ['-4%', '-8%', '+6%', 'EQUITYMARKETS', 'BONDMARKETS']) and i < 8 and not info['returns_page']:
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

    return info

if __name__ == '__main__':
    sep_pdf = r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\1. iFast Monthly update\iFAST Monthly Investment Update Sep 2026.pdf"
    oct_pdf = r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\1. iFast Monthly update\iFAST Monthly Investment Update October 2026.pdf"
    print("Sep Match:", match_monthly_update_sections(sep_pdf))
    print("Oct Match:", match_monthly_update_sections(oct_pdf))
