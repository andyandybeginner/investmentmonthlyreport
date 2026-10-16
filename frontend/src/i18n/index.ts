// ==============================================================================
// 100% Type-Safe Internationalization Dictionary (Zero Missing Keys Guarantee)
// ==============================================================================

export interface I18nDictionary {
  // Navigation & Toolbar
  nav_title: string;
  nav_sub: string;
  nav_dashboard: string;
  nav_presentation: string;
  nav_split: string;
  nav_factsheet: string;
  nav_s1: string;
  nav_s2: string;
  nav_s3: string;
  nav_s4: string;
  nav_s5: string;
  btn_print_pdf: string;
  btn_sync: string;
  btn_save: string;

  // Slide 1
  s1_badge: string;
  s1_title: string;
  s1_calc_label: string;
  s1_table_title: string;
  s1_base_cur: string;
  s1_col_strategy: string;
  s1_col_1m: string;
  s1_col_3m: string;
  s1_col_1y: string;
  s1_col_3y: string;
  s1_col_cum: string;
  s1_row_current: string;
  s1_row_past: string;
  s1_row_acwi: string;
  s1_row_sp500: string;
  s1_row_alpha_acwi: string;
  s1_row_alpha_sp: string;
  s1_table2_title: string;
  s1_th_role: string;
  s1_th_fund: string;
  s1_th_target_w: string;
  s1_th_actual_w: string;
  s1_th_vol_3y: string;
  s1_th_ret_1m: string;
  s1_th_contrib: string;
  s1_chart_title: string;
  lg_cur: string;
  lg_past: string;
  lg_acwi: string;
  lg_sp: string;
  lg_restruct: string;
  lg_rebal: string;
  s1_card_title: string;
  s1_foot_left: string;
  s1_foot_right: string;

  // Slide 2
  s2_tag: string;
  s2_title: string;
  s2_ref_title: string;
  s2_ref_val: string;
  s2_rec_badge: string;
  s2_rec_text: string;
  s2_mkt_header: string;
  s2_mkt_sub: string;
  s2_chart1_title: string;
  s2_mkt_1m_tag: string;
  s2_chart2_title: string;
  s2_eq_nasdaq: string;
  s2_eq_nikkei: string;
  s2_eq_spx: string;
  s2_eq_em: string;
  s2_eq_cn: string;
  s2_bd_ahy: string;
  s2_bd_aig: string;
  s2_bd_agg: string;
  us_name: string;
  us_rating: string;
  us_desc: string;
  jp_name: string;
  jp_rating: string;
  jp_desc: string;
  cn_name: string;
  cn_rating: string;
  cn_desc: string;
  s2_thematic_header: string;
  drv_ai_title: string;
  drv_ai_desc: string;
  drv_oil_title: string;
  drv_oil_desc: string;
  drv_cautious_title: string;
  drv_cautious_desc: string;
  s2_star_header: string;
  s2_star_sub: string;
  st_tier_v_att: string;
  st_tier_att: string;
  st_tier_neu: string;
  st_tier_not_att: string;
  s2_foot_left: string;
  s2_foot_right: string;

  // Slide 3
  s3_tag: string;
  s3_obs_title: string;
  s3_obs_desc: string;
  s3_debate_title: string;
  s3_debate_desc: string;
  s3_question_title: string;
  s3_question_desc: string;
  s3_chart_title: string;
  s3_lg_2025: string;
  s3_lg_2020: string;
  s3_axis_x: string;
  s3_axis_y: string;
  s3_footer_source: string;
  s3_foot_right: string;

  // Slide 4
  s4_tag: string;
  s4_title: string;
  s4_th_fund: string;
  s4_th_role: string;
  s4_th_weight: string;
  s4_th_ret: string;
  s4_th_noise: string;
  s4_th_support: string;
  s4_th_action: string;
  s4_p1_title: string;
  s4_p1_desc: string;
  s4_p2_title: string;
  s4_p2_desc: string;
  s4_p3_title: string;
  s4_p3_desc: string;
  s4_foot_left: string;
  s4_foot_right: string;

  // Slide 5
  s5_tag: string;
  s5_title: string;
  s5_c1_title: string;
  s5_c1_p1: string;
  s5_c1_p2: string;
  s5_c1_p3: string;
  s5_c2_title: string;
  s5_c2_p1: string;
  s5_c2_p2: string;
  s5_c2_p3: string;
  s5_c3_title: string;
  s5_c3_p1: string;
  s5_c3_p2: string;
  s5_c3_p3: string;
  s5_stamp_jurisdiction: string;
  s5_stamp_confidential: string;
  s5_foot_left: string;
  s5_foot_right: string;

  // Factsheet
  fs_header_tag: string;
  fs_header_title: string;
  fs_benchmark_label: string;
  fs_metric_vol: string;
  fs_metric_vol_sub: string;
  fs_metric_sharpe: string;
  fs_metric_sharpe_sub: string;
  fs_metric_conc: string;
  fs_metric_conc_sub: string;
  fs_metric_sec: string;
  fs_metric_sec_sub: string;
  fs_geo_title: string;
  fs_sec_title: string;
  fs_top10_title: string;
  fs_fund_matrix_title: string;
  fs_top10_badge: string;
  fs_th_rank: string;
  fs_th_holding: string;
  fs_th_weight: string;
  fs_th_overlap: string;
  fs_th_target: string;
  fs_th_sharpe: string;
  fs_th_vol: string;
  fs_th_mandate: string;
  fs_pillar_title: string;
  fs_pillar_desc: string;
  fs_footer_sources: string;
  fs_footer_page: string;
}

export const zhDict: I18nDictionary = {
  nav_title: "HR 模板投资组合 · 16:9 机构横版备忘录与投研工作台",
  nav_sub: "规范合规称谓，支持中英文即时切换、双向联动修改与矢量文档极速导出",
  nav_dashboard: "工作台控制台",
  nav_presentation: "全屏备忘录演示",
  nav_split: "分栏协同模式",
  nav_factsheet: "资产穿透单页",
  nav_s1: "第 1 页 备忘录",
  nav_s2: "第 2 页 宏观脉搏",
  nav_s3: "第 3 页 深度专栏",
  nav_s4: "第 4 页 坚守定见",
  nav_s5: "第 5 页 法律声明",
  btn_print_pdf: "导出矢量 PDF",
  btn_sync: "同步云端表格",
  btn_save: "保存设定",

  // Slide 1
  s1_badge: "纯股票高增长引擎 (新币计价)",
  s1_title: "HR 模板投资组合 · 9月备忘录",
  s1_calc_label: "计算结算日期",
  s1_table_title: "多周期综合回报率对比 (对比基准与超额收益)",
  s1_base_cur: "基准币种: 新币 (分红再投资)",
  s1_col_strategy: "策略 / 对照基准 (同成立日: 2023年7月)",
  s1_col_1m: "当月 (2026年9月)",
  s1_col_3m: "3个月",
  s1_col_1y: "1年",
  s1_col_3y: "3年 (年化)",
  s1_col_cum: "累计收益",
  s1_row_current: "当前组合 (主动重组优化)",
  s1_row_past: "过去组合 (未重组基准)",
  s1_row_acwi: "MSCI 全球指数 (新币计价)",
  s1_row_sp500: "标普 500 指数 (新币计价)",
  s1_row_alpha_acwi: "阿尔法超额 (对比 MSCI 全球)",
  s1_row_alpha_sp: "阿尔法超额 (对比标普 500)",
  s1_table2_title: "底层优选基金月度表现与超额贡献分解",
  s1_th_role: "核心配置定位",
  s1_th_fund: "底层优选标的全称",
  s1_th_target_w: "目标权重",
  s1_th_actual_w: "当前权重",
  s1_th_vol_3y: "3年年化波动",
  s1_th_ret_1m: "当月表现",
  s1_th_contrib: "超额贡献",
  s1_chart_title: "40个月真实净值走势 (2023.07 - 2026.10)",
  lg_cur: "当前组合 (红色实线)",
  lg_past: "过去组合 (蓝色虚线)",
  lg_acwi: "MSCI 全球 (灰色虚线)",
  lg_sp: "标普 500 (黑色虚线)",
  lg_restruct: "黄色圆圈: 组合重组",
  lg_rebal: "绿色圆圈: 季度再平衡",
  s1_card_title: "月度归因与调仓定见",
  s1_foot_left: "财富管理与投资咨询备忘录",
  s1_foot_right: "第 1 页 · 月度备忘录",

  // Slide 2
  s2_tag: "全球宏观展望与行业资产配置策略",
  s2_title: "全球宏观脉搏与行业星级评定榜",
  s2_ref_title: "研报分析来源",
  s2_ref_val: "2026年10月全球宏观与资产配置展望",
  s2_rec_badge: "核心策略定见",
  s2_rec_text: "<strong>战略持续看好亚洲：</strong>相较于欧美存在显著估值折价，紧握与人工智能基础设施深度绑定的韩国、中国台湾、日本、中国及新加坡；<strong>固定收益端：</strong>利率将长期维持高位，恪守短至中期久期与高等级投资级债。",
  s2_mkt_header: "重点资产月度回报",
  s2_mkt_sub: "彭博与投研综合数据",
  s2_chart1_title: "股票指数 (原币种/新币)",
  s2_mkt_1m_tag: "单月表现",
  s2_chart2_title: "债券指数 (美元计价)",
  s2_eq_nasdaq: "纳斯达克",
  s2_eq_nikkei: "日经225",
  s2_eq_spx: "标普500",
  s2_eq_em: "新兴市场",
  s2_eq_cn: "MSCI中国",
  s2_bd_ahy: "亚洲高收益债",
  s2_bd_aig: "亚洲投资级债",
  s2_bd_agg: "全球综合债",
  us_name: "美股市场",
  us_rating: "配置建议: 审慎低配 ★★",
  us_desc: "9月美股走势分化，半导体反弹推升纳指，月末抛压致标普500小幅收跌。美联储全票通过加息25个基点至3.75%–4.00%（2023年7月以来首度加息），沃什主席直言通胀长期过高；10年期美债收益率升破5.2%（创2007年以来新高）。组合维持低配，仅精选高质量数字经济与芯片龙头。",
  jp_name: "日本市场",
  jp_rating: "配置建议: 中性配置 ★★★",
  jp_desc: "日股在震荡中实现连续第二个月上涨。日经225月初受中东局势与加息担忧拖累下挫，随后在半导体与银行股推动下反弹并创8月中旬以来最高。日本央行以7–2投票加息25个基点至1.25%（创1995年以来新高）。日兴日本高股息基金具备极强的分子端防御力。",
  cn_name: "中国市场",
  cn_rating: "配置建议: 超配 ★★★½",
  cn_desc: "中国股市9月出现回调，受科技板块疲软、美债收益率高企及消费温和拖累。8月经济数据分化：工业产出超预期达5.2%，但社会零售增速放缓至0.4%。9月29日北京祭出2024年以来最大规模刺激支持举措。历史极低估值赋予厚实安全边际，坚守先进制造与科技自立战略资产。",
  s2_thematic_header: "第四季度核心结构性逻辑与风险",
  drv_ai_title: "⚡ 人工智能硬件超级周期加速拓宽",
  drv_ai_desc: "三星高带宽内存产能 2026-2027 年全部售罄，台积电先进封装严重紧缺；云服务巨头 2026 年资本开支预计达 8000 亿美元。亚洲半导体产业链处于全球价值爆发中心。",
  drv_oil_title: "🛢️ 中东海峡阻塞与柴油精炼瓶颈",
  drv_oil_desc: "布伦特油价升破 100 美元，沙特东西输油管道停摆；全球柴油精炼产能见顶，柴油价格高企直接传导至工业成本，全球利率被迫维持更长久高位。",
  drv_cautious_title: "⚠️ 审慎防御领域与资产警惕",
  drv_cautious_desc: "欧美估值相对亚洲维持过高溢价，美股维持审慎并仅精选高质量数字经济标的；欧洲受地缘未决与高能源价格压制；印度缺乏算力催化且受输入型通胀压制。黄金配置穿透后真实纯黄金敞口约 10.5%，与研报 10% 避险上限严格吻合。",
  s2_star_header: "官方全行业吸引力星级榜",
  s2_star_sub: "来源：奕丰行业吸引力星级评定",
  st_tier_v_att: "极具吸引力",
  st_tier_att: "具备吸引力",
  st_tier_neu: "中性配置",
  st_tier_not_att: "不具吸引力 / 审慎低配",
  s2_foot_left: "宏观环境与行业星级配置",
  s2_foot_right: "第 2 页 · 宏观展望与星级榜单",

  // Slide 3
  s3_tag: "月度专题研读 · 2026年9月",
  s3_obs_title: "现象与宏观观察",
  s3_obs_desc: "近四十年来，60/40 经典配置建立在一个简单的逻辑上：股票负责增长，债券负责防守减震。当股票下跌时，债券通常走平或上涨，从而平滑冲击。然而，对比 1986-2020 年与 2021-2025 年的资产组合回报，这一关系已发生深刻改变。纯股票配置的表现大致符合预期；但所有混合配置却呈现出截然不同的现实：向组合中加入债券依然如往常一样降低了预期回报，但它不再能像过去那样降低组合的整体风险。究其原因，核心机制在于股债相关性的结构性转变——历史上股债相关性通常为负或接近零，但在此期间已转为正相关，从而削弱了债券本应提供的分散化防御效果。",
  s3_debate_title: "持续的争论，而非定论",
  s3_debate_desc: "这些是既定事实，但究竟是什么在推动这一转变，在专业资产配置机构之间仍存在激烈的争论。持久的高通胀、更强劲的财政支出扩张、企业与云服务巨头为争夺同一资本池而大规模发行债券，以及对央行独立性的质疑，都被提出作为可能的解释，目前各方对于哪一因素最为关键尚未达成共识。",
  s3_question_title: "资产配置者的深层反思",
  s3_question_desc: "这为当今的资产配置者提出了一个严峻的问题：如果股票与债券之间的关系已经改变，那么我们赋予那“40%”债券的防御定位是否依然成立？毫无争议的是——“债券会自动分散股票风险”这一曾经被过去四十年视作理所当然的前提假设，今天值得我们重新审视与审慎评估。这也是本组合坚定确立“纯股票全权益增长引擎（以 MSCI 全球指数为基准）+ 黄金多元大宗对冲”而非配置平庸债券的数理基石。",
  s3_chart_title: "股债资产组合配置与回报对比：1986-2020年 对比 2021-2025年",
  s3_lg_2025: "2021-2025年组合实际回报率",
  s3_lg_2020: "1986-2020年组合历史回报率",
  s3_axis_x: "年化波动率 / 风险 (%)",
  s3_axis_y: "年化回报率 (%)",
  s3_footer_source: "数据来源：Aswath Damodaran / 纽约大学斯特恩商学院、iFAST 投研整理。分析源自《金融时报》经典专题“每周图表：60/40组合已死？”。仅供投资咨询与学术探讨，历史业绩不预示未来回报。",
  s3_foot_right: "第 3 页 · 月度专题",

  // Slide 4
  s4_tag: "投资哲学、信念审查与顾问建议",
  s4_title: "核心投资支柱与标的信念审查决策矩阵",
  s4_th_fund: "优选底层标的",
  s4_th_role: "核心配置定位",
  s4_th_weight: "当前权重",
  s4_th_ret: "当月回报",
  s4_th_noise: "短期市场噪音与波动分歧",
  s4_th_support: "中长期底层核心支撑逻辑",
  s4_th_action: "顾问建议",
  s4_p1_title: "支柱一 · 纯权益增长引擎，拒绝债券假防御",
  s4_p1_desc: "坚守全股票高增长内核，以 MSCI 全球指数为超越锚点。在股债正相关新常态下，摒弃长期拖累回报的传统固收，以确定性产业阿尔法驱动超额复利。",
  s4_p2_title: "支柱二 · 大额多空对冲底仓，锁定低贝塔安全垫",
  s4_p2_desc: "超配富敦绝对阿尔法（35%），恪守严格的市场中性多空选股原则。不依赖单边牛市，通过高质量分子端阿尔法实现平滑震荡、控制最大回撤。",
  s4_p3_title: "支柱三 · 逆周期战略资产，防御通胀与地缘裂痕",
  s4_p3_desc: "战略布局大华黄金与综合资源，穿透真实黄金敞口 10.46%，严格契合研报上限。对冲去美元化与地缘滞胀风险，与科技成长形成强反脆弱哑铃架构。",
  s4_foot_left: "投资哲学、信念审查与顾问建议",
  s4_foot_right: "第 4 页 · 坚守定见",

  // Slide 5
  s5_tag: "监管合规与法定免责声明",
  s5_title: "重要法律声明与投资者权益告知",
  s5_c1_title: "投资顾问性质与专业意见",
  s5_c1_p1: "本月度备忘录由财富管理团队编制，仅作为投资顾问咨询服务向特定投资者提供，不构成任何公开要约或全权委托投资承诺。",
  s5_c1_p2: "本备忘录所包含之分析、宏观观点及调仓建议均基于已公开披露之可信资料，顾问团队不对第三方数据之绝对完整性与即时性作明示保证。",
  s5_c1_p3: "所载意见仅反映出具本报告之日的专业判断，相关市场判断与投资定见可能随未来宏观环境及政策演进而动态调整，恕不另行个别通知。",
  s5_c2_title: "投资风险揭示与非保本提示",
  s5_c2_p1: "投资涉及重大本金损失风险。过往业绩、模拟回测收益及同成立日基准回报均不预示或保证未来实际表现。",
  s5_c2_p2: "全股票成长型策略及包含商品与贵金属对冲之组合具有较高之净值波动特征，投资标的价值及所获收益可能随全球汇率、利率及地缘政治变动而出现显著回撤。",
  s5_c2_p3: "投资者在采纳本备忘录建议执行资产调仓或申购赎回前，应充分审阅各标的基金招募说明书及产品关键事实公告，独立评估自身风险承受能力。",
  s5_c3_title: "监管法域与利益冲突声明",
  s5_c3_p1: "本文件严格受新加坡法律及《2001年证券与期货法》(第289章) 及新加坡金融管理局相关监管指引管辖。",
  s5_c3_p2: "本报告未考虑任何特定投资者的具体财务状况或特殊税务架构，在任何未经授权之司法管辖区内均不得被视为招揽行为。",
  s5_c3_p3: "未经书面明确授权，严禁对本备忘录及其图表进行二次分发、节选复印或数字化翻印。",
  s5_stamp_jurisdiction: "本材料或广告未经新加坡金融管理局审阅",
  s5_stamp_confidential: "高度机密 · 仅供指定委托人阅览",
  s5_foot_left: "监管合规与法定免责声明",
  s5_foot_right: "第 5 页 · 法律声明",

  // Factsheet
  fs_header_tag: "底层优选基金穿透透视 · 组合全景资产配置",
  fs_header_title: "HR 模板投资组合穿透全景分析",
  fs_benchmark_label: "分析数据基准",
  fs_metric_vol: "组合实盘年化波动率 (3年)",
  fs_metric_vol_sub: "对比科技基准 23.1%",
  fs_metric_sharpe: "组合实盘夏普比率 (3年)",
  fs_metric_sharpe_sub: "无风险利率 3.0%",
  fs_metric_conc: "前十大重仓集中度",
  fs_metric_conc_sub: "最大单票",
  fs_metric_sec: "底层穿透证券资产总数",
  fs_metric_sec_sub: "跨越 11 个全球市场",
  fs_geo_title: "总体加权地理配置",
  fs_sec_title: "总体加权行业分布",
  fs_top10_title: "总体投资组合 · 穿透前十大核心重仓标的",
  fs_fund_matrix_title: "底层 7 只优选基金风险收益与关键特征穿透矩阵",
  fs_top10_badge: "前十大合计",
  fs_th_rank: "排名",
  fs_th_holding: "标的名称",
  fs_th_weight: "穿透权重",
  fs_th_overlap: "归属底层基金重叠贡献",
  fs_th_target: "目标权重",
  fs_th_sharpe: "3年夏普",
  fs_th_vol: "3年波动率",
  fs_th_mandate: "组合战略定位与阿尔法职能",
  fs_pillar_title: "三支柱均衡对冲架构：",
  fs_pillar_desc: "进攻性科技 (29%) + 黄金与医疗防御 (34%) + 高股息金融压舱石 (11%)，兼顾向上成长弹性与滞胀韧性。",
  fs_footer_sources: "数据来源：底层 7 只优选基金官方月报与经核验的真实净值历史时间序列数据库。穿透持仓根据最新披露重仓股及配置权重加权折算。仅供投资咨询参考，历史业绩不代表未来表现。",
  fs_footer_page: "第 1 页 · 组合穿透配置与风险透析单页"
};

export const enDict: I18nDictionary = {
  nav_title: "HR Model Portfolio · Institutional Advisory Presentation Suite",
  nav_sub: "Institutional Discretionary Advisory Memorandum with Instant Language Switching & Vector PDF Export",
  nav_dashboard: "Advisor Workspace",
  nav_presentation: "Full Slide Deck",
  nav_split: "Split Studio",
  nav_factsheet: "Look-Through Factsheet",
  nav_s1: "Slide 1 Memorandum",
  nav_s2: "Slide 2 Macro Pulse",
  nav_s3: "Slide 3 Thematic Feature",
  nav_s4: "Slide 4 Core Conviction",
  nav_s5: "Slide 5 Legal Notice",
  btn_print_pdf: "Export Vector PDF",
  btn_sync: "Sync Google Sheet",
  btn_save: "Save Config",

  // Slide 1
  s1_badge: "All-Equity Growth Engine (SGD Base)",
  s1_title: "HR Model Portfolio · September Memo",
  s1_calc_label: "Valuation Settlement Date",
  s1_table_title: "Multi-Period Performance Matrix (vs Benchmarks & Alpha)",
  s1_base_cur: "Base Currency: SGD (Dividends Reinvested)",
  s1_col_strategy: "Strategy / Benchmark (Same Inception: Jul 2023)",
  s1_col_1m: "Current Month (Sep 2026)",
  s1_col_3m: "3 Months",
  s1_col_1y: "1 Year",
  s1_col_3y: "3 Years (Ann.)",
  s1_col_cum: "Cumulative",
  s1_row_current: "HR Model Portfolio (Current Reconstituted)",
  s1_row_past: "Past Model (Unreconstituted Benchmark)",
  s1_row_acwi: "MSCI AC World Index (ACWI - SGD)",
  s1_row_sp500: "S&P 500 Index (SGD Terms)",
  s1_row_alpha_acwi: "Alpha (vs MSCI ACWI)",
  s1_row_alpha_sp: "Alpha (vs S&P 500)",
  s1_table2_title: "Underlying Core Holdings: Monthly Performance & Alpha Contribution",
  s1_th_role: "Role in Portfolio",
  s1_th_fund: "Underlying Fund Name",
  s1_th_target_w: "Target %",
  s1_th_actual_w: "Actual %",
  s1_th_vol_3y: "3Y Ann. Vol",
  s1_th_ret_1m: "Monthly Return",
  s1_th_contrib: "Alpha Contrib.",
  s1_chart_title: "40-Month Real NAV Track Record (2023.07 - 2026.10)",
  lg_cur: "Current Model (Red Solid)",
  lg_past: "Past Benchmark (Blue Dashed)",
  lg_acwi: "MSCI World (Gray Dashed)",
  lg_sp: "S&P 500 (Black Dashed)",
  lg_restruct: "Yellow: Restructure Event",
  lg_rebal: "Green: Rebalance Event",
  s1_card_title: "Monthly Attribution & Rebalancing Verdict",
  s1_foot_left: "Wealth Management & Advisory Memorandum",
  s1_foot_right: "Slide 1 · Executive Memo",

  // Slide 2
  s2_tag: "Global Macro Outlook & Sector Allocation Strategy",
  s2_title: "Global Macroeconomic Pulse & Star Ratings",
  s2_ref_title: "Research Source",
  s2_ref_val: "October 2026 Global Macro & Allocation Outlook",
  s2_rec_badge: "Core Strategic Views",
  s2_rec_text: "<strong>Structurally Positive on Asia:</strong> Significant valuation discount vs West, anchored by AI infrastructure buildout in Korea, Taiwan (China), Japan, China, and Singapore. <strong>Fixed Income:</strong> With rates staying elevated, prioritize short-to-medium tenors and quality Investment Grade credit.",
  s2_mkt_header: "September Asset Performance Snapshot",
  s2_mkt_sub: "Bloomberg & Institutional Data",
  s2_chart1_title: "Equity Indices (Local Currency / SGD)",
  s2_mkt_1m_tag: "1M (Sep)",
  s2_chart2_title: "Bond Indices (USD Terms)",
  s2_eq_nasdaq: "Nasdaq",
  s2_eq_nikkei: "Nikkei 225",
  s2_eq_spx: "S&P 500",
  s2_eq_em: "Emerging Markets",
  s2_eq_cn: "MSCI China",
  s2_bd_ahy: "Asian High Yield",
  s2_bd_aig: "Asian USD IG",
  s2_bd_agg: "Global Aggregate",
  us_name: "US Equities",
  us_rating: "Rating: Underweight ★★",
  us_desc: "US equities ended slightly lower amidst heightened volatility. Stocks faced initial pressure from escalating Middle East tensions, but resilient economic data and upbeat tech earnings helped the market recoup most losses as oil retreated. The Fed delivered its first rate hike since July 2023 (+25 bps to 3.75%-4.00%), driving 10Y US Treasury yields above 5.2%. We remain cautious and underweight broader US benchmarks.",
  jp_name: "Japan Equities",
  jp_rating: "Rating: Neutral ★★★",
  jp_desc: "Japanese equities rose for a second consecutive month in volatile trading. The Nikkei 225 fell early on Middle East concerns, but rebounded led by semiconductor and banking stocks to mid-August highs. The BOJ voted 7-2 to hike rates by 25 bps to 1.25%. Nikko AM Japan Dividend provides robust cash flow defense.",
  cn_name: "China Equities",
  cn_rating: "Rating: Overweight ★★★½",
  cn_desc: "Chinese equities pulled back in September, weighed down by tech softness, elevated US Treasury yields, and subdued consumption. August data diverged: industrial production beat expectations at 5.2% yoy, but retail sales slowed to 0.4% yoy. On 29 September, Beijing unveiled its most aggressive stimulus package since 2024. Trough valuations provide significant safety margins.",
  s2_thematic_header: "Q4 Key Macro Drivers & Systemic Risks",
  drv_ai_title: "⚡ The AI Supercycle Keeps Broadening",
  drv_ai_desc: "Samsung HBM capacity is fully booked through 2026-2027; TSMC CoWoS advanced packaging faces severe shortages. Cloud hyperscalers are deploying ~$800bn in 2026 CapEx, anchoring durable hardware demand across Asia.",
  drv_oil_title: "🛢️ Middle East Chokepoints & Refined Fuel Squeeze",
  drv_oil_desc: "Brent crude surpassed $100/bbl with Saudi East-West pipeline shut downs. Global diesel refining operates at ceiling capacity, feeding persistent inflationary pressure into industrial supply chains.",
  drv_cautious_title: "⚠️ Areas of Caution & Risk Defense",
  drv_cautious_desc: "US and European valuations carry excessive premiums over Asia; US broader market remains cautious; Europe faces geopolitical headwinds and energy costs. Gold allocation look-through exposure is ~10.5%, strictly adhering to the 10% ceiling.",
  s2_star_header: "Official Sector Star Ratings",
  s2_star_sub: "Source: iFAST Sector Star Ratings",
  st_tier_v_att: "VERY ATTRACTIVE",
  st_tier_att: "ATTRACTIVE",
  st_tier_neu: "NEUTRAL",
  st_tier_not_att: "NOT ATTRACTIVE",
  s2_foot_left: "Macro Environment & Sector Allocation",
  s2_foot_right: "Slide 2 · Macro & Star Ratings",

  // Slide 3
  s3_tag: "Monthly In-Depth Focus · September 2026",
  s3_obs_title: "Empirical Observations",
  s3_obs_desc: "For nearly four decades, the classic 60/40 allocation rested on a simple premise: equities provide growth, while bonds provide defense. Comparing 1986-2020 with 2021-2025, that relationship has fundamentally shifted. All-equity allocations performed as expected (higher risk, higher return). However, every hybrid allocation tells a sobering story: adding bonds still reduced returns, but no longer provided the historical risk reduction. Historically negative or zero stock-bond correlations have turned persistently positive, eroding diversification defense.",
  s3_debate_title: "An Ongoing Debate, Not a Consensus",
  s3_debate_desc: "These shifts are documented facts, yet what is driving them remains fiercely contested. Persistent structural inflation, aggressive fiscal spending, sovereign debt supply competing with private capital, and questions over central bank independence have all been proposed, with no institutional consensus yet achieved.",
  s3_question_title: "Strategic Implications for Asset Allocators",
  s3_question_desc: "This raises a fundamental question: if the stock-bond relationship has changed, does the defensive role assigned to that 40% still hold? While reasonable allocators may differ in conclusions, the premise that 'bonds automatically hedge equities' must be critically reassessed. This mathematical reality underpins our conviction in an all-equity growth engine paired with gold macro hedges rather than mediocre fixed income.",
  s3_chart_title: "Portfolio Risk & Return Profiles: 1986-2020 vs 2021-2025",
  s3_lg_2025: "2021-2025 Realized Return",
  s3_lg_2020: "1986-2020 Historical Return",
  s3_axis_x: "Annualized Volatility / Risk (%)",
  s3_axis_y: "Annualized Return (%)",
  s3_footer_source: "Source: Aswath Damodaran / NYU Stern, compiled by iFAST. Derived from the Financial Times feature 'Charts of the Week: Is 60/40 Dead?'. For advisory and academic discussion only.",
  s3_foot_right: "Slide 3 · In-Depth Focus",

  // Slide 4
  s4_tag: "Investment Pillars & Conviction Review",
  s4_title: "Core Allocation Pillars & Holdings Conviction Matrix",
  s4_th_fund: "Selected Fund",
  s4_th_role: "Portfolio Role",
  s4_th_weight: "Current Weight",
  s4_th_ret: "Sep Return",
  s4_th_noise: "Market Noise & Dispersions",
  s4_th_support: "Fundamental Support & Structural Theses",
  s4_th_action: "Advisory Action",
  s4_p1_title: "Pillar 1 · Pure Equity Engine, Rejecting Fake Bond Defense",
  s4_p1_desc: "Maintain a disciplined all-equity growth core benchmarked against MSCI ACWI. In a positive stock-bond correlation regime, avoid return-dragging fixed income and compound genuine industrial alpha.",
  s4_p2_title: "Pillar 2 · Substantial Market-Neutral Ballast",
  s4_p2_desc: "Overweight Fullerton Absolute Alpha (35%), adhering strictly to market-neutral pair trading. Does not rely on directional bull markets, delivering smooth alpha and drawdown dampening.",
  s4_p3_title: "Pillar 3 · Counter-Cyclical Strategic Hedges",
  s4_p3_desc: "15% strategic allocation to United Gold & General, delivering ~10.5% look-through pure gold. Offsets de-dollarization and geopolitical stagflation risks, forming an anti-fragile barbell with tech growth.",
  s4_foot_left: "Investment Philosophy & Advisory Recommendations",
  s4_foot_right: "Slide 4 · Conviction Review",

  // Slide 5
  s5_tag: "Regulatory Compliance & Statutory Disclosures",
  s5_title: "Important Legal Notice & Client Disclosures",
  s5_c1_title: "Nature of Advisory & Professional Opinion",
  s5_c1_p1: "This monthly advisory memorandum is prepared by the Wealth Management Advisory Team solely for designated accredited and institutional clients. It does not constitute a public offer or guarantee of portfolio management results.",
  s5_c1_p2: "All market analyses, macroeconomic outlooks, and rebalancing recommendations are based on publicly available, reliable sources. The advisory team does not warrant absolute completeness or immediacy of third-party data.",
  s5_c1_p3: "Views expressed herein reflect professional judgment as of the date of publication and are subject to dynamic adjustment in response to macroeconomic developments without prior notice.",
  s5_c2_title: "Risk Disclosures & Capital Non-Guarantee",
  s5_c2_p1: "Investing in capital markets involves substantial risk of principal loss. Past performance, backtested results, and benchmark comparisons do not guarantee future returns.",
  s5_c2_p2: "All-equity strategies and portfolios containing precious metals / commodities inherently carry high volatility. Asset values may fluctuate significantly due to foreign exchange, interest rates, and geopolitical tensions.",
  s5_c2_p3: "Before implementing any rebalancing, subscription, or redemption recommendations, investors must review fund prospectuses and Product Highlights Sheets (PHS) to assess their individual risk tolerance.",
  s5_c3_title: "Regulatory Jurisdiction & Conflicts of Interest",
  s5_c3_p1: "This document is strictly governed by the laws of the Republic of Singapore, the Securities and Futures Act 2001 (SFA 289), and applicable MAS regulatory frameworks.",
  s5_c3_p2: "This report does not account for the specific financial situation or tax structure of any individual investor, and is not an offer or solicitation in any unauthorized jurisdiction.",
  s5_c3_p3: "Unauthorized reproduction, redistribution, or digital re-transmission of this memorandum and its charts without express written permission is strictly prohibited.",
  s5_stamp_jurisdiction: "Monetary Authority of Singapore (MAS) Regulated Activity",
  s5_stamp_confidential: "Strictly Confidential · For Designated Recipient Only",
  s5_foot_left: "Regulatory Compliance & Disclosures",
  s5_foot_right: "Slide 5 · Statutory Disclosures",

  // Factsheet
  fs_header_tag: "Portfolio Look-Through & Risk Analytics",
  fs_header_title: "HR Model Portfolio Allocation & Risk Factsheet",
  fs_benchmark_label: "Valuation Benchmark",
  fs_metric_vol: "Annualised Volatility (3Y)",
  fs_metric_vol_sub: "vs Tech BM 23.1%",
  fs_metric_sharpe: "Portfolio Sharpe Ratio (3Y)",
  fs_metric_sharpe_sub: "Rf 3.0%",
  fs_metric_conc: "Top 10 Concentration",
  fs_metric_conc_sub: "Max Single",
  fs_metric_sec: "Effective Underlying Securities",
  fs_metric_sec_sub: "Across 11 Markets",
  fs_geo_title: "Geographical Allocation",
  fs_sec_title: "Sector Allocation (GICS)",
  fs_top10_title: "Top 10 Underlying Portfolio Holdings (Look-Through)",
  fs_fund_matrix_title: "7 Underlying Funds: Risk, Return & Key Feature Matrix",
  fs_top10_badge: "Top 10 Total",
  fs_th_rank: "#",
  fs_th_holding: "Holding Name",
  fs_th_weight: "Weight",
  fs_th_overlap: "Fund Attribution Overlap",
  fs_th_target: "Target",
  fs_th_sharpe: "3Y Sharpe",
  fs_th_vol: "3Y Vol (Ann.)",
  fs_th_mandate: "Strategic Portfolio Role & Alpha Mandate",
  fs_pillar_title: "Three-Pillar Balanced Hedging Architecture:",
  fs_pillar_desc: "Offensive Tech (29%) + Gold & Healthcare Defense (34%) + High-Dividend Financial Anchor (11%), harmonizing growth upside with stagflation resilience.",
  fs_footer_sources: "Sources: Official Factsheets of the 7 underlying funds and historical verified NAV time-series database. Look-through exposures calculated based on latest published top holdings and target weights. For financial advisory consultation only. Past performance is no guarantee of future returns.",
  fs_footer_page: "Page 1 · Portfolio Look-Through Factsheet & Risk Analytics"
};

export function getDictionary(lang: 'zh' | 'en'): I18nDictionary {
  return lang === 'en' ? enDict : zhDict;
}
