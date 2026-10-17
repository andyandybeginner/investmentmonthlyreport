import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json',
    'origin': 'https://fsm.global',
    'user-agent': 'Mozilla/5.0',
    'x-app-id': 'sgfsm'
}

target_keywords = [
    "United China A Shares",
    "GLOBAL ABSOLUTE ALPHA",
    "GLOBAL TECHNOLOGY",
    "Life Sciences",
    "United Gold",
    "Asian Growth",
    "Japan Dividend"
]

all_funds = []
page = 1
while True:
    payload = json.dumps({"pageNumber": page, "pageSize": 200}).encode('utf-8')
    req = urllib.request.Request('https://fsm.global/sg/rest/fund/get-fund-selector-table-info-with-pagination', 
                                data=payload, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            data = json.loads(resp.read().decode('utf-8')).get('data', {})
            items = data.get('fundSelectorList', [])
            if not items:
                break
            all_funds.extend(items)
            page += 1
            if page > 15: # safety
                break
    except Exception as e:
        print('Error:', e)
        break

print(f'Total funds fetched: {len(all_funds)}')

for f in all_funds:
    name = f.get('productName', '')
    for kw in target_keywords:
        if kw.lower() in name.lower():
            print(f"MATCH [{kw}]: productId={f.get('productId')}, currency={f.get('currency')}, name={name}")
