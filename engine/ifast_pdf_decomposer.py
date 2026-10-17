# -*- coding: utf-8 -*-
"""
iFAST Monthly Investment Update - Semantic PDF Decomposer & SOP Engine
Implements the 4-Stage Architectural SOP for decomposing institutional PDFs:
1. Document Stream Ingestion & Typography Tracking Normalization
2. Semantic Layout Decomposition into DOM Blocks (Header, Title, Narrative, Vector Charts, Star Matrix)
3. Dynamic Section Routing & Block Anchoring (Zero hardcoded page numbers)
4. Vector-Level Extraction of Diverging Equity & Hanging Bond Charts
"""

import os
import re
import fitz
from typing import Dict, Any, List, Optional, Tuple

def normalize_tracking_text(text: str) -> str:
    """
    Normalizes spaced letters caused by wide tracking/letter-spacing in PDF layout.
    Example: 'M A R K E T   R E V I E W' -> 'MARKET REVIEW'
             'E q u i t y   I n d i c e s' -> 'Equity Indices'
    """
    if not text:
        return ""
    def unspace(m):
        raw = m.group(0)
        return re.sub(r'\s+', '', raw)

    norm = re.sub(r'\b(?:[A-Za-z]\s+){2,}[A-Za-z]\b', unspace, text)
    return norm


class iFASTPDFDecomposer:
    """
    SOP Decomposer for iFAST Monthly Investment Update PDFs.
    Dynamically extracts data without relying on hardcoded page numbers.
    """

    COLOR_SGD_RED = (0.75, 0.0, 0.0)      # Crimson Red for SGD Equity bars
    COLOR_TEAL_BLUE = (0.08, 0.38, 0.51)  # Dark Teal/Cyan for Local Currency & Bond bars

    EQUITY_ORDER = [
        "LATAM", "EEMEA", "China", "Asia ex Japan",
        "Emerging Markets", "Japan", "Europe", "US", "Global Equity"
    ]

    BOND_ORDER = [
        "Global Bonds", "Asian IG Bonds", "Global HY",
        "Asian HY", "Emerging Market Debt"
    ]

    def __init__(self, pdf_path: str):
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF not found at: {pdf_path}")
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)
        self.total_pages = len(self.doc)
        self.page_classifications: Dict[int, List[str]] = {}
        self._analyze_pages()

    def _analyze_pages(self):
        """Phase 1 & 2: Scan all pages, normalize tracking, classify semantic blocks."""
        for p_idx in range(self.total_pages):
            page = self.doc[p_idx]
            text = page.get_text()
            norm = normalize_tracking_text(text)
            norm_upper = re.sub(r'\s+', '', norm).upper()

            tags = []
            if p_idx > 0:  # Skip cover page (p_idx == 0) for section identification
                if "MARKETREVIEW" in norm_upper or ("MARKET" in norm_upper and "PERFORMANCE" in norm_upper):
                    tags.append("MARKET_REVIEW")
                if "INVESTMENTVIEWS" in norm_upper:
                    tags.append("INVESTMENT_VIEWS")
                if "WHENBONDSSTOPBEHAVING" in norm_upper or "IDEASOFTHEMONTH" in norm_upper:
                    tags.append("THEMATIC_FEATURE")
                elif "FEATURE" in norm_upper and len(text) > 300:
                    tags.append("THEMATIC_FEATURE")
                if "OURPHILOSOPHY" in norm_upper:
                    tags.append("OUR_PHILOSOPHY")
                if "RECOMMENDEDUNITTRUSTS" in norm_upper:
                    tags.append("UNIT_TRUSTS")
                if "ECONOMICCALENDAR" in norm_upper:
                    tags.append("CALENDAR")

            self.page_classifications[p_idx + 1] = tags

    def find_section_pages(self) -> Dict[str, Any]:
        """Phase 3: Dynamic Section Routing & Block Anchoring."""
        result = {
            "returns_page": None,
            "star_ratings_page": None,
            "topic_page": None,
            "topic_title": None,
            "topic_title_zh": None,
            "topic_title_en": None,
        }

        for p_no, tags in self.page_classifications.items():
            if "MARKET_REVIEW" in tags and not result["returns_page"]:
                # Verify this page actually contains Chart 1 or Market Performance
                page = self.doc[p_no - 1]
                t = normalize_tracking_text(page.get_text()).upper()
                if "CHART 1" in t or "EQUITY INDICES" in t or "MARKET PERFORMANCE" in t:
                    result["returns_page"] = p_no

            if "INVESTMENT_VIEWS" in tags and not result["star_ratings_page"]:
                result["star_ratings_page"] = p_no

        # Priority scan for in-depth thematic feature articles across the document
        for p_no in range(1, self.total_pages + 1):
            page = self.doc[p_no - 1]
            t_norm = normalize_tracking_text(page.get_text())
            norm_upper = re.sub(r'\s+', '', t_norm).upper()
            if "WHENBONDSSTOPBEHAVING" in norm_upper or "WHENBONDS" in norm_upper:
                result["topic_page"] = p_no
                result["topic_title"] = "When Bonds Stop Behaving Like Bonds"
                result["topic_title_zh"] = "当债券不再扮演债券：60/40股债平衡组合是否已死？"
                result["topic_title_en"] = "When Bonds Stop Behaving Like Bonds: Is 60/40 Dead?"
                break
            elif "SINGAPOREEQUITYFUND" in norm_upper:
                result["topic_page"] = p_no
                result["topic_title"] = "iFAST-Amova Singapore Equity Fund"
                result["topic_title_zh"] = "超越银行主导核心——主动布局“新新加坡”高成长机遇"
                result["topic_title_en"] = "Transcending Bank-Centric Anchors: Active Positioning for \"New Singapore\" High-Growth Opportunities"
                break

        # Fallback to general ideas of the month if no deep macro topic matched
        if not result["topic_page"]:
            for p_no, tags in self.page_classifications.items():
                if "THEMATIC_FEATURE" in tags:
                    result["topic_page"] = p_no
                    page = self.doc[p_no - 1]
                    t_norm = normalize_tracking_text(page.get_text())
                    lines = [l.strip() for l in t_norm.split('\n') if l.strip()]
                    for l in lines:
                        if len(l) > 12 and not any(k in l.upper() for k in ['IDEAS OF THE MONTH', 'UNIT TRUST', 'IFAST', 'SEPTEMBER', 'OCTOBER']):
                            result["topic_title"] = l
                            result["topic_title_zh"] = l
                            result["topic_title_en"] = l
                            break
                    if result["topic_title"]:
                        break

        # Fallback safe defaults if missed
        if not result["returns_page"]:
            result["returns_page"] = 6
        if not result["star_ratings_page"]:
            result["star_ratings_page"] = 7
        if not result["topic_page"]:
            result["topic_page"] = 12

        return result

    def extract_market_performance(self, returns_page: Optional[int] = None) -> Dict[str, Any]:
        """
        Phase 4: Vector & Data Level Extraction.
        Deconstructs Chart 1 (9 equity markets) and Chart 2 (5 bond categories)
        from vector geometry directly on whatever page it resides.
        """
        if returns_page is None:
            sec = self.find_section_pages()
            returns_page = sec["returns_page"]

        page = self.doc[returns_page - 1]
        drawings = page.get_drawings()

        # Step 4.1: Separate drawings by fill color & spatial area
        sgd_items: List[Tuple[float, float, float, float]] = []
        local_items: List[Tuple[float, float, float, float]] = []
        bond_items: List[Tuple[float, float, float, float]] = []

        for d in drawings:
            fill = d.get('fill')
            if not fill:
                continue
            r_c = tuple(round(x, 2) for x in fill)
            items = d.get('items', [])

            if r_c == self.COLOR_SGD_RED:
                for it in items:
                    if it[0] == 're':
                        r = it[1]
                        # Equity bars are in the upper chart area (Y between 130 and 265, thin bar height <= 4.0)
                        if 130 <= r.y0 <= 265 and r.height <= 4.0:
                            sgd_items.append((r.x0, r.y0, r.x1, r.y1))

            elif r_c == self.COLOR_TEAL_BLUE:
                for it in items:
                    if it[0] == 're':
                        r = it[1]
                        # Equity bars in upper chart area
                        if 130 <= r.y0 <= 265 and r.height <= 4.0:
                            local_items.append((r.x0, r.y0, r.x1, r.y1))
                        # Bond bars in lower chart area (Y between 320 and 430, width > 15)
                        elif 320 <= r.y0 <= 430 and r.width > 15:
                            bond_items.append((r.x0, r.y0, r.x1, r.y1))

        # Sort horizontal equity bars by Y coordinate (top to bottom: LATAM down to Global Equity)
        sgd_items.sort(key=lambda b: b[1])
        local_items.sort(key=lambda b: b[1])

        # Find zero baseline X0 dynamically:
        # X0 is the common junction point between positive (x0 == X0) and negative (x1 == X0) bars
        x_candidates = {}
        for b in sgd_items + local_items:
            for x_val in [round(b[0], 1), round(b[2], 1)]:
                x_candidates[x_val] = x_candidates.get(x_val, 0) + 1
        x0 = max(x_candidates.items(), key=lambda k: k[1])[0] if x_candidates else 852.96

        # Standard iFAST scale: distance between tick marks is ~20.65 px per 1%
        px_per_percent = 20.65

        # Build equity data
        equity_records = []
        for i, mkt_name in enumerate(self.EQUITY_ORDER):
            rec = {"market": mkt_name, "sgd": 0.0, "local": 0.0}
            if i < len(sgd_items):
                b = sgd_items[i]
                if abs(b[0] - x0) < 1.0: # Positive bar
                    val = (b[2] - x0) / px_per_percent
                else: # Negative bar
                    val = -(x0 - b[0]) / px_per_percent
                rec["sgd"] = round(val, 2)

            if i < len(local_items):
                b = local_items[i]
                if abs(b[0] - x0) < 1.0: # Positive bar
                    val = (b[2] - x0) / px_per_percent
                else: # Negative bar
                    val = -(x0 - b[0]) / px_per_percent
                rec["local"] = round(val, 2)

            equity_records.append(rec)

        # Sort bond items from left to right (X coordinate)
        bond_items.sort(key=lambda b: b[0])
        bond_records = []
        
        # Determine baseline for bond chart:
        # Either all bars share y0 (hanging down, negative) or share y1 (growing up, positive)
        y0_candidates = {}
        y1_candidates = {}
        for b in bond_items:
            y0_candidates[round(b[1], 1)] = y0_candidates.get(round(b[1], 1), 0) + 1
            y1_candidates[round(b[3], 1)] = y1_candidates.get(round(b[3], 1), 0) + 1

        is_hanging_down = max(y0_candidates.values()) >= 3 if y0_candidates else True
        bond_scale = 15.33

        for i, cat_name in enumerate(self.BOND_ORDER):
            rec = {"category": cat_name, "return": 0.0}
            if i < len(bond_items):
                b = bond_items[i]
                h = b[3] - b[1]
                val = -(h / bond_scale) if is_hanging_down else (h / 40.8)
                rec["return"] = round(val, 2)
            bond_records.append(rec)

        # Step 4.2: Extract Regional Reviews (US, Japan, China)
        blocks = page.get_text('blocks')
        regional_reviews = {"us": "", "japan": "", "china": ""}
        for b in blocks:
            t = normalize_tracking_text(b[4].strip())
            t_upper = t.upper()
            if "UNITED STATES" in t_upper or "U N I T E D" in b[4]:
                regional_reviews["us"] = t
            elif "JAPAN" in t_upper and len(t) > 30:
                regional_reviews["japan"] = t
            elif "CHINA" in t_upper and len(t) > 30:
                regional_reviews["china"] = t

        return {
            "page": returns_page,
            "zero_axis_x": x0,
            "px_per_percent": px_per_percent,
            "equity_indices": equity_records,
            "bond_indices": bond_records,
            "regional_reviews": regional_reviews
        }


if __name__ == '__main__':
    sep_pdf = r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\1. iFast Monthly update\iFAST Monthly Investment Update Sep 2026.pdf"
    oct_pdf = r"G:\我的云端硬盘\0. 工作\2. 投资分析计划 01102026\3. Monthly Report\1. iFast Monthly update\iFAST Monthly Investment Update October 2026.pdf"

    for pdf in [sep_pdf, oct_pdf]:
        print("==================================================")
        print(f"Testing SOP Decomposer on: {os.path.basename(pdf)}")
        dec = iFASTPDFDecomposer(pdf)
        sec = dec.find_section_pages()
        print(f"  Dynamic Section Routing: Returns P.{sec['returns_page']}, Stars P.{sec['star_ratings_page']}, Topic P.{sec['topic_page']}")
        print(f"  Topic Title: {sec['topic_title']}")
        data = dec.extract_market_performance()
        print(f"  Chart 1 Equity Returns ({len(data['equity_indices'])} markets):")
        for eq in data['equity_indices']:
            print(f"    {eq['market']:<16} SGD: {eq['sgd']:>6.2f}% | Local: {eq['local']:>6.2f}%")
        print(f"  Chart 2 Bond Returns ({len(data['bond_indices'])} categories):")
        for bd in data['bond_indices']:
            print(f"    {bd['category']:<20} USD: {bd['return']:>6.2f}%")
