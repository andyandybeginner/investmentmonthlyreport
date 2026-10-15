# -*- coding: utf-8 -*-
"""
Calculate Portfolio Look-Through Breakdown:
- Geographical Allocation (Weighted across 7 funds)
- Sector Allocation (Weighted across 7 funds)
- Top 10 Holdings (Consolidated across 7 funds)
- Risk Metrics (Weighted & Empirical)
"""

import json
from collections import defaultdict

# Fund weights in HR Model Portfolio
# Target weights
fund_weights = {
    'Fullerton': 0.35,
    'Eastspring': 0.15,
    'Janus Henderson': 0.15,
    'United Gold': 0.15,
    'United China A': 0.12,
    'FSSA': 0.04,
    'Nikko AM': 0.04
}

# Current weights (2026-09-03)
current_weights = {
    'Fullerton': 0.3460,
    'Eastspring': 0.1574,
    'Janus Henderson': 0.1479,
    'United Gold': 0.1451,
    'United China A': 0.1258,
    'FSSA': 0.0391,
    'Nikko AM': 0.0389
}

# 1. GEOGRAPHICAL BREAKDOWN PER FUND (as reported in factsheets)
fund_geo = {
    'Fullerton': {
        'United States': 53.9,
        'Taiwan': 8.6,
        'Singapore': 7.6,
        'Netherlands': 4.7,
        'Germany': 4.1,
        'South Korea': 3.4,
        'Italy': 3.0,
        'France': 2.7,
        'Switzerland': 1.7,
        'Japan': 1.1,
        'Cash & Equivalents': 9.3
    },
    'Eastspring': {
        'United States': 78.1,
        'Taiwan': 5.7,
        'Netherlands': 4.4,
        'South Korea': 2.9,
        'Germany': 2.3,
        'China': 1.9,
        'Japan': 1.2,
        'Hong Kong': 1.2,
        'Others': 0.6,
        'Cash & Equivalents': 1.7
    },
    'Janus Henderson': {
        'United States': 82.24,
        'Switzerland': 5.41,
        'United Kingdom': 3.50,
        'Belgium': 2.99,
        'France': 2.10,
        'Denmark': 1.61,
        'Israel': 1.14,
        'Japan': 0.30,
        'South Korea': 0.02,
        'Cash & Equivalents': 0.69
    },
    'United Gold': {
        'Canada': 36.29,
        'Australia': 27.72,
        'United States': 13.94,
        'South Africa': 7.92,
        'United Kingdom': 4.79,
        'China': 3.29,
        'Norway': 1.23,
        'Spain': 0.88,
        'Others': 0.79,
        'Cash & Equivalents': 3.15
    },
    'United China A': {
        'China': 93.36,
        'Cash & Equivalents': 6.64
    },
    'FSSA': {
        'China': 24.1,
        'Taiwan': 23.2,
        'South Korea': 12.5,
        'India': 12.1,
        'Hong Kong': 9.2,
        'Singapore': 6.7,
        'Indonesia': 3.5,
        'Vietnam': 1.7,
        'United States': 1.5,
        'Thailand': 1.5,
        'Others': 3.1,
        'Cash & Equivalents': 0.7
    },
    'Nikko AM': {
        'Japan': 94.1,
        'Cash & Equivalents': 5.9
    }
}

# 2. SECTOR BREAKDOWN PER FUND (as reported in factsheets)
fund_sectors = {
    'Fullerton': {
        'Information Technology': 25.3,
        'Financials': 23.9,
        'Industrials': 17.0,
        'Communication Services': 9.9,
        'Health Care': 7.3,
        'Consumer Discretionary': 4.6,
        'Consumer Staples': 1.7,
        'Materials': 1.1,
        'Cash & Equivalents': 9.3
    },
    'Eastspring': {
        'Semiconductors & Equipment': 46.9,
        'Internet & Software': 31.2, # Internet 21.5 + Software 9.7
        'Telecommunication & Media': 5.7,
        'Hardware & Electronics': 8.9, # Electronics 5.5 + Computers 3.4
        'Industrials & Auto': 2.9, # Auto 1.9 + Machinery 1.0
        'Others': 2.7,
        'Cash & Equivalents': 1.7
    },
    'Janus Henderson': {
        'Biotechnology': 34.80,
        'Pharmaceuticals': 33.57,
        'Medical Devices & MedTech': 20.08,
        'Health Care Services': 10.85,
        'Cash & Equivalents': 0.69
    },
    'United Gold': {
        'Gold Mining': 72.08,
        'Diversified Metals & Mining': 6.85,
        'Silver': 6.54,
        'Base Metals & Steel': 8.25, # Aluminum 3.78 + Steel 2.27 + Copper 2.20
        'Precious Metals & Minerals': 2.58,
        'Energy / Coal': 0.54,
        'Cash & Equivalents': 3.15
    },
    'United China A': {
        'Information Technology': 46.43,
        'Financials': 10.79,
        'Consumer Discretionary': 9.60,
        'Materials': 9.60,
        'Industrials': 9.26,
        'Energy': 2.84,
        'Communication Services': 2.68,
        'Health Care': 2.17,
        'Cash & Equivalents': 6.64
    },
    'FSSA': {
        'Information Technology': 37.9,
        'Financials': 20.4,
        'Industrials': 13.3,
        'Consumer Discretionary': 12.5,
        'Communication Services': 9.3,
        'Consumer Staples': 2.4,
        'Health Care': 1.6,
        'Materials': 0.9,
        'Real Estate': 0.8,
        'Cash & Equivalents': 0.7
    },
    'Nikko AM': {
        'Industrials': 29.9,
        'Financials': 21.7,
        'Information Technology': 11.4,
        'Consumer Discretionary': 10.9,
        'Materials': 5.2,
        'Real Estate': 4.8,
        'Others': 10.3,
        'Cash & Equivalents': 5.9
    }
}

# Standardized Sector Mapping for Portfolio Overview:
# We map sub-sectors to GICS broad sectors:
# Information Technology (incl. Semiconductors, Hardware, Software)
# Health Care (incl. Biotech, Pharma, MedTech)
# Materials & Mining (incl. Gold, Silver, Diversified Mining)
# Financials
# Industrials
# Communication Services
# Consumer Discretionary
# Consumer Staples
# Real Estate & Energy
# Cash & Equivalents

sector_standard_mapping = {
    'Information Technology': '信息技术 (Technology)',
    'Semiconductors & Equipment': '信息技术 (Technology)',
    'Internet & Software': '信息技术 (Technology)',
    'Hardware & Electronics': '信息技术 (Technology)',
    'Health Care': '医疗保健 (Health Care)',
    'Biotechnology': '医疗保健 (Health Care)',
    'Pharmaceuticals': '医疗保健 (Health Care)',
    'Medical Devices & MedTech': '医疗保健 (Health Care)',
    'Health Care Services': '医疗保健 (Health Care)',
    'Gold Mining': '原材料与黄金采掘 (Materials & Gold)',
    'Diversified Metals & Mining': '原材料与黄金采掘 (Materials & Gold)',
    'Silver': '原材料与黄金采掘 (Materials & Gold)',
    'Base Metals & Steel': '原材料与黄金采掘 (Materials & Gold)',
    'Precious Metals & Minerals': '原材料与黄金采掘 (Materials & Gold)',
    'Materials': '原材料与黄金采掘 (Materials & Gold)',
    'Financials': '金融服务 (Financials)',
    'Industrials': '工业制造 (Industrials)',
    'Industrials & Auto': '工业制造 (Industrials)',
    'Communication Services': '通信与数字媒体 (Communication)',
    'Telecommunication & Media': '通信与数字媒体 (Communication)',
    'Consumer Discretionary': '非必需消费 (Consumer Discretionary)',
    'Consumer Staples': '必需消费 (Consumer Staples)',
    'Real Estate': '房地产与综合 (Real Estate & Others)',
    'Others': '房地产与综合 (Real Estate & Others)',
    'Energy': '能源 (Energy)',
    'Energy / Coal': '能源 (Energy)',
    'Cash & Equivalents': '现金与对冲工具 (Cash & Equivalents)'
}

# 3. TOP HOLDINGS PER FUND
holdings = {
    'Fullerton': [
        ('Alphabet Inc (GOOGL)', 7.9, '美国', '通信媒体', 'US02079K3059'),
        ('Hon Hai Precision Industry (鸿海/富士康)', 4.3, '中国台湾', '科技制造', 'TW0002317005'),
        ('3M Co', 4.2, '美国', '工业多元', 'US88579Y1010'),
        ('Thermo Fisher Scientific Inc (赛默飞世尔)', 3.9, '美国', '生命科学', 'US8835561023'),
        ('CSX Corp', 3.6, '美国', '工业物流', 'US1264081035'),
        ('Morgan Stanley (摩根士丹利)', 3.5, '美国', '金融服务', 'US6174464486'),
        ('Oversea-Chinese Banking Corp (华侨银行 OCBC)', 3.3, '新加坡', '金融服务', 'SG1S04926220'),
        ('Microsoft Corp (微软)', 3.0, '美国', '信息技术', 'US5949181045'),
        ('UniCredit SpA (裕信银行)', 3.0, '意大利', '金融服务', 'IT0005239360'),
        ('Taiwan Semiconductor (台积电 TSMC)', 2.8, '中国台湾', '半导体', 'TW0002330008')
    ],
    'Eastspring': [
        ('NVIDIA Corp (英伟达)', 8.9, '美国', '半导体/算力', 'US67066G1040'),
        ('Microsoft Corp (微软)', 5.6, '美国', '云软件/AI', 'US5949181045'),
        ('Amazon.com Inc (亚马逊)', 5.4, '美国', '云与消费', 'US0231351067'),
        ('Broadcom Inc (博通)', 5.0, '美国', '半导体/网络', 'US11135F1012'),
        ('Taiwan Semiconductor (台积电 TSMC)', 7.8, '中国台湾', '芯片制造', 'TW0002330008'), # 4.7% ord + 3.1% ADR
        ('Alphabet Inc (GOOGL)', 3.9, '美国', '通信/AI', 'US02079K3059'),
        ('Micron Technology Inc (美光科技)', 3.5, '美国', '存储芯片', 'US5951121038'),
        ('SK Hynix Inc (SK海力士)', 2.9, '韩国', 'HBM存储', 'KR7000660001'),
        ('Meta Platforms Inc (META)', 2.9, '美国', '数字媒体/AI', 'US30303M1027')
    ],
    'Janus Henderson': [
        ('Eli Lilly and Co (礼来制药)', 9.16, '美国', '创新药/GLP-1', 'US5324571083'),
        ('Johnson & Johnson (强生)', 7.47, '美国', '制药与医疗器械', 'US4781601046'),
        ('AbbVie Inc (艾伯维)', 4.63, '美国', '生物制药', 'US00287Y1091'),
        ('UnitedHealth Group Inc (联合健康)', 4.34, '美国', '医疗保健服务', 'US91324P1021'),
        ('AstraZeneca PLC (阿斯利康)', 3.50, '英国', '肿瘤创新药', 'GB0009895292'),
        ('Thermo Fisher Scientific Inc (赛默飞世尔)', 2.92, '美国', '生命科学仪器', 'US8835561023'),
        ('Novartis AG (诺华制药)', 2.79, '瑞士', '制药与细胞疗法', 'CH0012005267'),
        ('Roche Holding AG (罗氏)', 2.63, '瑞士', '生物药与诊断', 'CH0012032048'),
        ('Argenx SE', 2.52, '比利时', '自身免疫创新药', 'NL0010832185'),
        ('Abbott Laboratories (雅培)', 2.38, '美国', '医疗器械与诊断', 'US0028241000')
    ],
    'United Gold': [
        ('Newmont Corp (纽蒙特黄金)', 8.86, '美国', '黄金矿业', 'US6516391066'),
        ('Northern Star Resources Ltd (北极星资源)', 6.03, '澳大利亚', '黄金矿业', 'AU000000NST8'),
        ('Evolution Mining Ltd (演进矿业)', 5.23, '澳大利亚', '黄金矿业', 'AU000000EVN4'),
        ('Eldorado Gold Corp (埃尔多拉多黄金)', 3.85, '加拿大', '黄金矿业', 'CA2849025093'),
        ('Harmony Gold Mining Co (哈莫尼黄金)', 3.66, '南非', '黄金矿业', 'ZAE000015228'),
        ('IAMGOLD Corp (埃姆黄金)', 3.36, '加拿大', '黄金矿业', 'CA4509131088'),
        ('Barrick Gold Corp (巴里克黄金)', 3.32, '加拿大', '黄金矿业', 'CA0679011084'),
        ('Glencore PLC (嘉能可)', 3.32, '英国', '大宗商品与金属', 'JE00B4T3BW64'),
        ('DPM Metals Inc (邓迪贵金属)', 3.10, '加拿大', '贵金属采掘', 'CA2652692096'),
        ('Alamos Gold Inc (阿拉莫斯黄金)', 3.01, '加拿大', '黄金矿业', 'CA0115321089')
    ],
    'United China A': [
        ('中际旭创 (Zhongji Innolight)', 7.80, '中国', '光模块/AI算力底座', 'CNE1000018G1'),
        ('寒武纪 (Cambricon Technologies)', 6.92, '中国', 'AI芯片/国产GPU', 'CNE1000041H4'),
        ('安克创新 (Anker Innovations)', 5.72, '中国', '出海消费电子', 'CNE100004381'),
        ('生益科技 (Shengyi Technology)', 4.26, '中国', '高速覆铜板/PCB', 'CNE000000WR0'),
        ('山东黄金 (Shandong Gold Mining)', 4.02, '中国', '黄金采选', 'CNE000001FV3'),
        ('天岳先进 (Skyverse Technology)', 3.93, '中国', '半导体检测设备', 'CNE100005F99'),
        ('成都银行 (Bank of Chengdu)', 3.84, '中国', '区域优质金融', 'CNE1000030W2'),
        ('紫金矿业 (Zijin Mining Group)', 3.71, '中国', '铜金资源开采', 'CNE100000502'),
        ('宇通客车 (Zhengzhou Yutong Bus)', 3.56, '中国', '新能源商用车出海', 'CNE000000S70'),
        ('松发股份 (Guangdong Songfa)', 3.03, '中国', '消费与先进制造', 'CNE1000021P9')
    ],
    'FSSA': [
        ('Taiwan Semiconductor (台积电 TSMC)', 9.7, '中国台湾', '晶圆代工龙头', 'TW0002330008'),
        ('Samsung Electronics (三星电子)', 9.1, '韩国', '存储芯片/半导体', 'KR7005930003'),
        ('Tencent Holdings Ltd (腾讯控股)', 7.0, '中国', '社交/游戏/云', 'KYG875721634'),
        ('MediaTek Inc (联发科)', 5.6, '中国台湾', '移动SoC芯片', 'TW0002454006'),
        ('Kotak Mahindra Bank (科塔克银行)', 4.9, '印度', '私营银行', 'INE237A01028'),
        ('Midea Group (美的集团)', 3.5, '中国', '智能家电/出海', 'CNE100001QQ5'),
        ('AIA Group Limited (友邦保险)', 3.5, '中国香港', '人寿保费增长', 'HK0000069688'),
        ('Oversea-Chinese Banking Corp (华侨银行 OCBC)', 3.0, '新加坡', '财富管理/信贷', 'SG1S04926220'),
        ('H World Group (华住集团)', 2.8, '中国', '连锁酒店出行', 'US44332N1063'),
        ('Jardine Cycle & Carriage (怡和合发)', 2.7, '新加坡', '汽车与东南亚商贸', 'SG1B51001017')
    ],
    'Nikko AM': [
        ('Mitsubishi UFJ Financial Group (三菱日联金融)', 4.4, '日本', '巨型银行/息差反转', 'JP3902900004'),
        ('Sumitomo Mitsui Financial Group (三井住友金融)', 4.4, '日本', '银行业务与投行', 'JP3890350006'),
        ('Mizuho Financial Group (瑞穗金融)', 4.0, '日本', '大型商业金融', 'JP3968400008'),
        ('Tokio Marine Holdings (东京海上日动)', 3.4, '日本', '财产险与海外扩张', 'JP3910660004'),
        ('Toyota Motor Corp (丰田汽车)', 3.2, '日本', '混动与全球车企', 'JP3633400001'),
        ('DMG Mori Co Ltd (德马吉森精机)', 2.6, '日本', '高端五轴数控机床', 'JP3852800006'),
        ('Sumitomo Corp (住友商事)', 2.6, '日本', '综合商社/能源资源', 'JP3404600003'),
        ('Macnica Holdings Inc (麦克尼卡)', 2.5, '日本', '半导体与网络安全分销', 'JP3863450007'),
        ('Mitsui & Co Ltd (三井物产)', 2.5, '日本', '巴菲特持仓/商社', 'JP3893600001'),
        ('Toyoda Gosei Co Ltd (丰田合成)', 2.5, '日本', '汽车零部件与高分子', 'JP3634200004')
    ]
}

def calculate_portfolio():
    # 1. Calculate Geographic Allocation
    geo_weighted = defaultdict(float)
    for fund_name, weight in fund_weights.items():
        for country, pct in fund_geo[fund_name].items():
            geo_weighted[country] += weight * pct

    # Group small regions (< 2%) into "其他与新兴市场"
    geo_grouped = defaultdict(float)
    for c, val in geo_weighted.items():
        if val < 2.0 and c not in ['Cash & Equivalents', '现金与对冲工具']:
            geo_grouped['其他新兴及成熟市场'] += val
        else:
            geo_grouped[c] += val

    sorted_geo = sorted(geo_grouped.items(), key=lambda x: x[1], reverse=True)

    # 2. Calculate Sector Allocation
    sector_weighted = defaultdict(float)
    for fund_name, weight in fund_weights.items():
        for sec, pct in fund_sectors[fund_name].items():
            std_sec = sector_standard_mapping.get(sec, '其他')
            sector_weighted[std_sec] += weight * pct

    sorted_sectors = sorted(sector_weighted.items(), key=lambda x: x[1], reverse=True)

    # 3. Calculate Consolidated Top Holdings
    stock_weights = defaultdict(lambda: {
        'weight': 0.0,
        'country': '',
        'sector': '',
        'isin': '',
        'sources': []
    })

    for fund_name, h_list in holdings.items():
        fw = fund_weights[fund_name]
        for name, pct, country, sector, isin in h_list:
            # Map canonical name
            canon_name = name
            if 'Taiwan Semiconductor' in name:
                canon_name = '台积电 TSMC (Taiwan Semiconductor)'
            elif 'Alphabet' in name:
                canon_name = '谷歌母公司 Alphabet Inc (GOOGL)'
            elif 'Microsoft' in name:
                canon_name = '微软 Microsoft Corp (MSFT)'
            elif 'Thermo Fisher' in name:
                canon_name = '赛默飞世尔 Thermo Fisher Scientific'
            elif 'Oversea-Chinese' in name:
                canon_name = '新加坡华侨银行 OCBC'
            
            stock_weights[canon_name]['weight'] += fw * (pct / 100.0)
            stock_weights[canon_name]['country'] = country
            stock_weights[canon_name]['sector'] = sector
            stock_weights[canon_name]['isin'] = isin
            stock_weights[canon_name]['sources'].append(f"{fund_name} ({pct:.2f}%)")

    sorted_stocks = sorted(stock_weights.items(), key=lambda x: x[1]['weight'], reverse=True)

    print("\n" + "="*80)
    print("🌍 总体投资组合·加权地理分布 (Geographical Allocation)")
    print("="*80)
    for c, pct in sorted_geo:
        print(f"  {c:<30} {pct:6.2f}%")

    print("\n" + "="*80)
    print("🏭 总体投资组合·加权行业分布 (Sector Allocation)")
    print("="*80)
    for s, pct in sorted_sectors:
        print(f"  {s:<35} {pct:6.2f}%")

    print("\n" + "="*80)
    print("🏆 总体投资组合·穿透前十五大重仓 (Top 15 Look-Through Holdings)")
    print("="*80)
    for idx, (name, data) in enumerate(sorted_stocks[:15]):
        print(f"  {idx+1:2d}. {name:<42} 穿透权重: {data['weight']*100:5.2f}% | 国家: {data['country']:<8} | 行业: {data['sector']:<18} | 来源: {', '.join(data['sources'])}")

    # Save to json for HTML generation
    res = {
        'geography': [{'name': c, 'weight': round(pct, 2)} for c, pct in sorted_geo],
        'sectors': [{'name': s, 'weight': round(pct, 2)} for s, pct in sorted_sectors],
        'top_holdings': [
            {
                'rank': idx + 1,
                'name': name,
                'weight': round(data['weight'] * 100, 2),
                'country': data['country'],
                'sector': data['sector'],
                'sources': data['sources']
            } for idx, (name, data) in enumerate(sorted_stocks[:15])
        ]
    }

    with open('portfolio_lookthrough_data.json', 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=2)
    print("\n✅ Saved results to portfolio_lookthrough_data.json")

if __name__ == '__main__':
    calculate_portfolio()
