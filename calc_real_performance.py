import json
import re

with open('real_performance_series.json', 'r') as f:
    data = json.load(f)

dates = data['dates']
cur = data['current']
past = data['past']
sp = data['sp500']
acwi = data['acwi']

# Multi-period returns calculation
# Latest is index -1 (2026-10)
# 1M: index -2
# 3M: index -4
# 1Y (12M): index -13
# 3Y (36M): index -37
# Since Inception (39M): index 0 (2023-07)

def calc_ret(series, lookback):
    if len(series) > lookback:
        p_now = series[-1]
        p_prev = series[-1 - lookback]
        return (p_now - p_prev) / p_prev
    return 0.0

def calc_cum(series):
    return series[-1] - 1.0

# 3Y Annualized: (p_now / p_prev)^(1/3) - 1
p3y_cur = (cur[-1] / cur[-37])**(1/3) - 1.0
p3y_acwi = (acwi[-1] / acwi[-37])**(1/3) - 1.0
p3y_sp = (sp[-1] / sp[-37])**(1/3) - 1.0
p3y_past = (past[-1] / past[-37])**(1/3) - 1.0

perf_table = {
    'current': {
        '1m': calc_ret(cur, 1),
        '3m': calc_ret(cur, 3),
        '1y': calc_ret(cur, 12),
        '3y_ann': p3y_cur,
        'cum': calc_cum(cur)
    },
    'past': {
        '1m': calc_ret(past, 1),
        '3m': calc_ret(past, 3),
        '1y': calc_ret(past, 12),
        '3y_ann': p3y_past,
        'cum': calc_cum(past)
    },
    'acwi': {
        '1m': calc_ret(acwi, 1),
        '3m': calc_ret(acwi, 3),
        '1y': calc_ret(acwi, 12),
        '3y_ann': p3y_acwi,
        'cum': calc_cum(acwi)
    },
    'sp500': {
        '1m': calc_ret(sp, 1),
        '3m': calc_ret(sp, 3),
        '1y': calc_ret(sp, 12),
        '3y_ann': p3y_sp,
        'cum': calc_cum(sp)
    }
}

print('Calculated Real Performance Table:')
for k, v in perf_table.items():
    print(k, {sub_k: f'{sub_v:.2%}' for sub_k, sub_v in v.items()})

alpha_1m = perf_table['current']['1m'] - perf_table['acwi']['1m']
alpha_1y = perf_table['current']['1y'] - perf_table['acwi']['1y']
alpha_3y = perf_table['current']['3y_ann'] - perf_table['acwi']['3y_ann']
alpha_cum = perf_table['current']['cum'] - perf_table['acwi']['cum']

print(f'Alpha vs ACWI: 1M={alpha_1m:.2%}, 1Y={alpha_1y:.2%}, Cum={alpha_cum:.2%}')
