let currentLang = 'zh';

        function switchLanguage(lang) {
            currentLang = lang;
            const dict = i18nDict[lang];

            const zhBtn = document.getElementById('lang_zh');
            const enBtn = document.getElementById('lang_en');
            if (lang === 'zh') {
                zhBtn.className = "px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500 text-slate-950 transition shadow";
                enBtn.className = "px-2.5 py-1 text-xs font-bold rounded-md text-slate-300 hover:text-white transition";
                document.documentElement.lang = "zh-CN";
            } else {
                enBtn.className = "px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500 text-slate-950 transition shadow";
                zhBtn.className = "px-2.5 py-1 text-xs font-bold rounded-md text-slate-300 hover:text-white transition";
                document.documentElement.lang = "en";
            }

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (dict[key]) {
                    el.innerHTML = dict[key];
                }
            });

            const dynamicMonthTh = document.getElementById('th_dynamic_month');
            if (dynamicMonthTh && dict['th_dynamic_month']) {
                dynamicMonthTh.innerHTML = dict['th_dynamic_month'];
            }

            if (window.s3ChartInstance) {
                window.s3ChartInstance.options.scales.x.title.text = lang === 'zh' ? '风险 (年化标准差) Risk (Standard Deviation)' : 'Risk (Standard Deviation)';
                window.s3ChartInstance.options.scales.y.title.text = lang === 'zh' ? '年化回报率 Return' : 'Return';
                window.s3ChartInstance.update();
            }
        }

        // Dynamic Settle Date Month Derivation
        // In wealth advisory, settlement dates within the first 10 days of a month (e.g. 2026-10-05)
        // represent the previous month's reporting cycle (e.g. September 2026).
        function autoDeriveMonthFromDate() {
            const dateEl = document.getElementById('calc_date_display');
            const dateStr = dateEl ? dateEl.innerText.trim() : "2026-10-05";
            const parts = dateStr.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            
            // Calculate actual performance reporting month
            let perfMonth = month;
            let perfYear = year;
            if (day <= 10) {
                if (month === 1) {
                    perfMonth = 12;
                    perfYear = year - 1;
                } else {
                    perfMonth = month - 1;
                }
            }
            
            const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
            // Set dynamic values in dictionary
            i18nDict.zh.th_dynamic_month = `当月（${perfYear}年${perfMonth}月）`;
            i18nDict.zh.s1_badge = `${perfMonth}月备忘录`;
            
            i18nDict.en.th_dynamic_month = `Month (${monthNamesEn[perfMonth - 1]} ${perfYear})`;
            i18nDict.en.s1_badge = `${monthNamesEn[perfMonth - 1]} Memorandum`;
            
            const badgeEl = document.querySelector('[data-i18n="s1_badge"]');
            if (badgeEl) badgeEl.innerText = i18nDict[currentLang].s1_badge;
            
            const thMonthEl = document.getElementById('th_dynamic_month');
            if (thMonthEl) thMonthEl.innerText = i18nDict[currentLang].th_dynamic_month;
        }

        // Export / Print Report to PDF (Vector Print with Clean Margins & Color Fidelity)
        function exportPDF() {
            printCurrentLanguageReport();
        }

        function printCurrentLanguageReport() {
            const originalTitle = document.title;
            const dateEl = document.getElementById('calc_date_display');
            const dateStr = dateEl ? dateEl.innerText.trim() : "2026-10-05";
            
            // Set semantic, clean file name for browser Save as PDF
            if (currentLang === 'zh') {
                document.title = `HR_模板投资组合_月度备忘录_${dateStr}`;
            } else {
                document.title = `HR_Model_Portfolio_Monthly_Advisory_Memorandum_${dateStr}`;
            }

            // Temporarily hide floating annotation toolbar
            const tb = document.getElementById('annotationToolbar');
            if (tb) tb.style.display = 'none';

            // Trigger browser native high-fidelity print / PDF export dialog
            window.print();

            // Restore title and toolbar after dialog closes
            setTimeout(() => {
                if (tb) tb.style.display = 'flex';
                document.title = originalTitle;
            }, 1000);
        }

        // Export All 5 Slides Stitched into 1 Ultra-High-Res Long PNG
        function exportLongImage() {
            return exportLongImagePNG();
        }

        async function exportLongImagePNG() {
            const btn = document.getElementById('btnLongPng') || document.getElementById('btn_long_png');
            const originalText = btn ? btn.innerHTML : '';
            if (btn) {
                btn.innerHTML = `<span class="flex items-center gap-1.5"><svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>正在生成5页长图...</span></span>`;
                btn.disabled = true;
            }

            const tb = document.getElementById('annotationToolbar');
            if (tb) tb.style.display = 'none';

            try {
                const container = document.getElementById('reportCanvasContainer');
                
                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#0b1120',
                    logging: false
                });

                const link = document.createElement('a');
                link.download = `HR_Model_Portfolio_5Slides_Report_${currentLang.toUpperCase()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

                if (btn) {
                    btn.innerHTML = `<span>✅ 导出成功!</span>`;
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 2500);
                }
            } catch (err) {
                alert('长图生成失败: ' + err);
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } finally {
                if (tb) tb.style.display = 'flex';
            }
        }

        function scrollToSlide(slideNo) {
            const el = document.getElementById('slide' + slideNo);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // Reconstitution & Rebalance Marker Plugin on Chart Line
        const reconstituteMarkerPlugin = {
            id: 'reconstituteMarkerPlugin',
            afterDatasetsDraw(chart, args, pluginOptions) {
                const { ctx, scales: { x, y } } = chart;
                const meta = chart.getDatasetMeta(0); // Current Model dataset (red solid line)
                if (!meta || !meta.data || meta.data.length === 0) return;

                const events = (pluginOptions && pluginOptions.events) ? pluginOptions.events : [
                    { date: "2023-07", fullDate: "2023-07-05", status: "Reconstitute" },
                    { date: "2025-07", fullDate: "2025-07-03", status: "Reconstitute" },
                    { date: "2026-01", fullDate: "2026-01-05", status: "Reconstitute" }
                ];

                events.forEach(evt => {
                    const idx = chart.data.labels.indexOf(evt.date);
                    if (idx === -1 || !meta.data[idx]) return;

                    const pt = meta.data[idx];
                    const px = pt.x;
                    const py = pt.y;

                    const isRebal = (evt.status || '').toLowerCase().includes('rebalance');
                    // Yellow for Restructure / Reconstitute; Green for Rebalance
                    const colorRgb = isRebal ? '16, 185, 129' : '245, 158, 11';
                    const colorSolid = isRebal ? '#059669' : '#d97706';
                    const colorFill = `rgba(${colorRgb}, 0.50)`; // 50% opacity circle
                    const badgeBg = isRebal ? '#10b981' : '#f59e0b';
                    const textStr = isRebal ? 'Rebalance' : 'Restructure';

                    ctx.save();

                    // 1. Vertical timeline axis line from bottom x-axis up to the intersection point
                    ctx.beginPath();
                    ctx.setLineDash([3, 3]);
                    ctx.strokeStyle = `rgba(${colorRgb}, 0.65)`;
                    ctx.lineWidth = 1.2;
                    ctx.moveTo(px, y.bottom);
                    ctx.lineTo(px, py);
                    ctx.stroke();

                    // 2. 50% opacity circle at the intersection with the solid line
                    ctx.beginPath();
                    ctx.arc(px, py, 11, 0, 2 * Math.PI);
                    ctx.fillStyle = colorFill;
                    ctx.fill();
                    ctx.strokeStyle = colorSolid;
                    ctx.lineWidth = 1.8;
                    ctx.setLineDash([]);
                    ctx.stroke();

                    // Inner white anchor core
                    ctx.beginPath();
                    ctx.arc(px, py, 2.8, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.strokeStyle = colorSolid;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();

                    // 3. Label badge tag: "Restructure" / "Rebalance"
                    ctx.font = 'bold 8.5px "Inter", "system-ui", -apple-system, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const tw = ctx.measureText(textStr).width;
                    const bw = tw + 8;
                    const bh = 14;
                    
                    // Positioning: adjust X if near left edge (index 0)
                    let bx = px;
                    if (idx === 0) {
                        bx = px + bw / 2 - 2;
                    }
                    // Tag sits neatly above the circle
                    const by = (py - 20 < y.top) ? (py + 20) : (py - 18);

                    // Draw pill badge
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 3);
                    } else {
                        ctx.rect(bx - bw / 2, by - bh / 2, bw, bh);
                    }
                    ctx.fillStyle = badgeBg;
                    ctx.fill();
                    ctx.strokeStyle = colorSolid;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();

                    // Draw badge text
                    ctx.fillStyle = '#0f172a';
                    ctx.fillText(textStr, bx, by + 0.5);

                    ctx.restore();
                });
            }
        };

        // Slide 1 Real 4-Line Cumulative Performance Chart
        const ctxS1Line = document.getElementById('lsSlide1RealLineChart').getContext('2d');
        new Chart(ctxS1Line, {
            type: 'line',
            plugins: [reconstituteMarkerPlugin],
            data: {
                labels: ["2023-07", "2023-08", "2023-09", "2023-10", "2023-11", "2023-12", "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"],
                datasets: [
                    {
                        label: '当前组合 (HR Current)',
                        data: [1.0, 1.0056, 1.0001, 0.9343, 0.9634, 1.0137, 1.04, 1.0654, 1.0978, 1.1422, 1.1379, 1.1715, 1.1846, 1.1181, 1.2018, 1.2186, 1.2319, 1.2701, 1.2227, 1.3052, 1.2742, 1.2227, 1.2661, 1.3315, 1.4004, 1.4367, 1.4668, 1.5493, 1.5852, 1.5879, 1.6171, 1.6651, 1.6653, 1.572, 1.7403, 1.8709, 1.9094, 1.8274, 1.8338, 1.8116],
                        borderColor: '#dc2626', // Red Solid
                        backgroundColor: '#dc2626',
                        borderWidth: 2.5,
                        pointRadius: 0,
                        tension: 0.15
                    },
                    {
                        label: '过去组合 (HR Past 对照)',
                        data: [1.0, 1.0056, 1.0001, 0.9343, 0.9634, 1.0137, 1.04, 1.0654, 1.0978, 1.1422, 1.1379, 1.1715, 1.1846, 1.1181, 1.2018, 1.2186, 1.2319, 1.2701, 1.2227, 1.3052, 1.2742, 1.2227, 1.2661, 1.3315, 1.4004, 1.4082, 1.4788, 1.5949, 1.6312, 1.635, 1.6643, 1.6789, 1.6582, 1.5948, 1.7618, 1.8755, 1.9043, 1.8965, 1.8653, 1.8908],
                        borderColor: '#2563eb', // Blue Dashed
                        backgroundColor: '#2563eb',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        tension: 0.15
                    },
                    {
                        label: 'MSCI 全球 (MSCI ACWI)',
                        data: [1.0, 1.0224, 1.012, 0.9665, 0.9923, 1.0343, 1.0579, 1.0997, 1.1371, 1.1409, 1.1414, 1.1847, 1.2002, 1.1366, 1.2027, 1.2578, 1.2661, 1.2945, 1.2473, 1.2875, 1.2495, 1.1103, 1.241, 1.3072, 1.3595, 1.3698, 1.403, 1.4612, 1.4595, 1.487, 1.512, 1.5, 1.5012, 1.4532, 1.6196, 1.6584, 1.6274, 1.6685, 1.6872, 1.6867],
                        borderColor: '#94a3b8', // Gray Dashed
                        backgroundColor: '#94a3b8',
                        borderWidth: 1.8,
                        borderDash: [3, 3],
                        pointRadius: 0,
                        tension: 0.15
                    },
                    {
                        label: '标普 500 (S&P 500)',
                        data: [1.0, 1.0129, 1.0138, 0.9583, 0.981, 1.0304, 1.0579, 1.1115, 1.1445, 1.1721, 1.1538, 1.2066, 1.2445, 1.1676, 1.2433, 1.2814, 1.3014, 1.3713, 1.3358, 1.3635, 1.3158, 1.2112, 1.2717, 1.3448, 1.4112, 1.4171, 1.4527, 1.5102, 1.5291, 1.5433, 1.552, 1.5485, 1.5461, 1.4434, 1.615, 1.6662, 1.6391, 1.6915, 1.695, 1.7146],
                        borderColor: '#000000', // Black Dashed
                        backgroundColor: '#000000',
                        borderWidth: 1.8,
                        borderDash: [3, 3],
                        pointRadius: 0,
                        tension: 0.15
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    reconstituteMarkerPlugin: {
                        events: [
                            { date: "2023-07", fullDate: "2023-07-05", status: "Reconstitute" },
                            { date: "2025-07", fullDate: "2025-07-03", status: "Reconstitute" },
                            { date: "2026-01", fullDate: "2026-01-05", status: "Reconstitute" }
                        ]
                    }
                },
                scales: {
                    x: { ticks: { font: { size: 8 }, maxTicksLimit: 8 }, grid: { display: false } },
                    y: { 
                        min: 0.9,
                        max: 2.0,
                        ticks: { 
                            font: { size: 8 }, 
                            callback: function(v){ 
                                return Math.round(v * 100) + '%';
                            } 
                        },
                        grid: { color: '#f1f5f9' }
                    }
                }
            }
        });

        // Slide 3 Frontier Chart (Verbatim Replication from iFAST Horizon Page 12)
        const ctxS3 = document.getElementById('lsFrontierChart').getContext('2d');
        
        const frontierDataLabelsPlugin = {
            id: 'frontierDataLabels',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                ctx.save();
                ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                
                chart.data.datasets.forEach((dataset, dIdx) => {
                    const meta = chart.getDatasetMeta(dIdx);
                    meta.data.forEach((element, index) => {
                        const pt = dataset.data[index];
                        const label = currentLang === 'zh' ? pt.zh : pt.label;
                        const posX = element.x;
                        const posY = element.y;
                        
                        ctx.fillStyle = '#0f172a';
                        
                        // Positioning labels matching original Page 12 chart
                        if (dIdx === 1) { // 1986-2020 (Dark Blue Line)
                            if (index === 0) { // 100% Bonds
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY + 16);
                            } else if (index === 1) { // 25/75
                                ctx.textAlign = 'right';
                                ctx.fillText(label, posX - 6, posY - 2);
                            } else if (index === meta.data.length - 1) { // 100% Stocks
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY - 10);
                            } else {
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY - 10);
                            }
                        } else { // 2021-2025 (Red Line)
                            if (index === 0) { // 100% Bonds
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY + 16);
                            } else if (index === meta.data.length - 1) { // 100% Stocks
                                ctx.textAlign = 'center';
                                ctx.fillText(label, posX, posY - 10);
                            } else {
                                ctx.textAlign = 'left';
                                ctx.fillText(label, posX + 8, posY + 4);
                            }
                        }
                    });
                });
                ctx.restore();
            }
        };

        window.s3ChartInstance = new Chart(ctxS3, {
            type: 'scatter',
            plugins: [frontierDataLabelsPlugin],
            data: {
                datasets: [
                    {
                        label: '2021-2025年实际回报',
                        data: [
                            { x: 10.5, y: -2.5, label: '100% Bonds', zh: '100% 债券' },
                            { x: 12.1, y: 2.5, label: '25/75', zh: '25/75' },
                            { x: 13.9, y: 6.8, label: '50/50', zh: '50/50' },
                            { x: 15.2, y: 8.9, label: '60/40', zh: '60/40' },
                            { x: 16.0, y: 10.4, label: '70/30', zh: '70/30' },
                            { x: 17.3, y: 12.1, label: '80/20', zh: '80/20' },
                            { x: 19.3, y: 15.8, label: '100% Stocks', zh: '100% 股票' }
                        ],
                        borderColor: '#dc2626',
                        backgroundColor: '#dc2626',
                        borderWidth: 2.5,
                        showLine: true,
                        tension: 0.1,
                        pointRadius: 4.5,
                        pointHoverRadius: 6.5
                    },
                    {
                        label: '1986-2020年历史回报',
                        data: [
                            { x: 8.5, y: 6.8, label: '100% Bonds', zh: '100% 债券' },
                            { x: 7.8, y: 8.4, label: '25/75', zh: '25/75' },
                            { x: 8.8, y: 9.8, label: '50/50', zh: '50/50' },
                            { x: 10.0, y: 10.2, label: '60/40', zh: '60/40' },
                            { x: 11.8, y: 10.7, label: '70/30', zh: '70/30' },
                            { x: 13.2, y: 11.2, label: '80/20', zh: '80/20' },
                            { x: 15.6, y: 12.3, label: '100% Stocks', zh: '100% 股票' }
                        ],
                        borderColor: '#1e3a8a',
                        backgroundColor: '#1e3a8a',
                        borderWidth: 2.5,
                        showLine: true,
                        tension: 0.1,
                        pointRadius: 4.5,
                        pointHoverRadius: 6.5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const pt = ctx.raw;
                                const lbl = currentLang === 'zh' ? pt.zh : pt.label;
                                return `${ctx.dataset.label} (${lbl}) - 风险: ${pt.x}%, 回报: ${pt.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        min: 6.0,
                        max: 21.0,
                        title: {
                            display: true,
                            text: '年化波动率 / 风险 (标准差)',
                            font: { size: 9, weight: 'bold' },
                            color: '#0f172a'
                        },
                        ticks: {
                            stepSize: 2.0,
                            callback: function(v){ return v.toFixed(1) + '%'; },
                            font: { size: 8.5, weight: 'bold' },
                            color: '#334155'
                        },
                        grid: { color: '#cbd5e1' }
                    },
                    y: {
                        min: -5.0,
                        max: 20.0,
                        title: {
                            display: true,
                            text: '年化实际回报率 (%)',
                            font: { size: 9, weight: 'bold' },
                            color: '#0f172a'
                        },
                        ticks: {
                            stepSize: 5.0,
                            callback: function(v){ return v.toFixed(1) + '%'; },
                            font: { size: 8.5, weight: 'bold' },
                            color: '#334155'
                        },
                        grid: {
                            color: function(ctx) {
                                if (ctx.tick && ctx.tick.value === 0) return '#000000';
                                return '#cbd5e1';
                            },
                            lineWidth: function(ctx) {
                                if (ctx.tick && ctx.tick.value === 0) return 2;
                                return 1;
                            }
                        }
                    }
                }
            }
        });

        // Annotation Engine Logic for all 5 Slides
        let isDrawingMode = false;
        let currentColor = '#ef4444';
        let currentLineWidth = 3;
        let activeCanvas = null;
        let activeCtx = null;
        let isPainting = false;

        function initCanvases() {
            for (let i = 1; i <= 5; i++) {
                const canvas = document.getElementById('canvas_slide' + i);
                if (canvas) {
                    const parent = canvas.parentElement;
                    canvas.width = parent.offsetWidth;
                    canvas.height = parent.offsetHeight;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    canvas.addEventListener('mousedown', (e) => startDraw(e, canvas, ctx));
                    canvas.addEventListener('mousemove', (e) => draw(e, canvas, ctx));
                    window.addEventListener('mouseup', () => stopDraw());
                    
                    canvas.addEventListener('touchstart', (e) => handleTouch(e, startDraw, canvas, ctx));
                    canvas.addEventListener('touchmove', (e) => handleTouch(e, draw, canvas, ctx));
                    window.addEventListener('touchend', () => stopDraw());
                }
            }
        }

        function handleTouch(e, handler, canvas, ctx) {
            if (!isDrawingMode) return;
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            handler(mouseEvent, canvas, ctx);
        }

        function toggleDrawingMode() {
            isDrawingMode = !isDrawingMode;
            const btn = document.getElementById('togglePenBtn');
            const icon = document.getElementById('penIcon');
            const text = document.getElementById('penText');
            const canvases = document.querySelectorAll('.annotation-canvas');

            if (isDrawingMode) {
                btn.className = "px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 ring-2 ring-emerald-400";
                icon.innerText = "🛑";
                text.innerText = currentLang === 'zh' ? "退出画笔模式" : "Exit Pen";
                canvases.forEach(c => c.style.pointerEvents = 'auto');
                document.body.style.cursor = 'crosshair';
            } else {
                btn.className = "px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5";
                icon.innerText = "✏️";
                text.innerText = currentLang === 'zh' ? "开启画笔批注" : "Annotate";
                canvases.forEach(c => c.style.pointerEvents = 'none');
                document.body.style.cursor = 'default';
            }
        }

        function setPenColor(color, width) {
            currentColor = color;
            currentLineWidth = width;
            if (!isDrawingMode) toggleDrawingMode();
        }

        function startDraw(e, canvas, ctx) {
            if (!isDrawingMode) return;
            isPainting = true;
            activeCanvas = canvas;
            activeCtx = ctx;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.beginPath();
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentLineWidth;
            ctx.moveTo(x, y);
        }

        function draw(e, canvas, ctx) {
            if (!isPainting || !isDrawingMode || activeCanvas !== canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.lineTo(x, y);
            ctx.stroke();
        }

        function stopDraw() {
            isPainting = false;
        }

        function clearCurrentCanvas() {
            for (let i = 1; i <= 5; i++) {
                const canvas = document.getElementById('canvas_slide' + i);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        }

        function takeSnapshot() {
            let currentSlide = document.getElementById('slide1');
            const slides = [
                document.getElementById('slide1'),
                document.getElementById('slide2'),
                document.getElementById('slide3'),
                document.getElementById('slide4'),
                document.getElementById('slide5')
            ];
            for (let s of slides) {
                if (s) {
                    const r = s.getBoundingClientRect();
                    if (r.top >= -200 && r.top <= window.innerHeight / 2) {
                        currentSlide = s;
                        break;
                    }
                }
            }

            const tb = document.getElementById('annotationToolbar');
            tb.style.display = 'none';

            html2canvas(currentSlide, {
                scale: 2,
                useCORS: true
            }).then(canvas => {
                tb.style.display = 'flex';
                const link = document.createElement('a');
                link.download = currentSlide.id + `_Annotation_${currentLang.toUpperCase()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                tb.style.display = 'flex';
                alert('截图失败: ' + err);
            });
        }

        window.addEventListener('load', () => {
            initCanvases();
            autoDeriveMonthFromDate();
        });
        window.addEventListener('resize', () => {
            initCanvases();
        });
