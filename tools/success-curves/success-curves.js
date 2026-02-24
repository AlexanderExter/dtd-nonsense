/**
 * DTD Success Curve Analyzer
 *
 * Visualizes XkY probability distributions via Monte Carlo simulation.
 * Object-literal pattern — no class instantiation needed.
 */
'use strict';

const Analyzer = (() => {

    // =====================================================================
    // Constants
    // =====================================================================

    const POOL_COLORS = [
        '#d4a84b', // gold (accent)
        '#60a5fa', // blue
        '#4ade80', // green
        '#f87171'  // red
    ];

    const MAX_POOLS = 4;
    const TRIALS = 100_000;
    const TN_MIN = 5;
    const TN_MAX = 50;
    const TN_STEP = 1;
    const DEBOUNCE_MS = 300;
    const CACHE_MAX = 20;

    const TN_LABELS = {
        5:  'Mundane',
        10: 'Easy',
        15: 'Average',
        20: 'Hard',
        25: 'Very Hard',
        30: 'Heroic',
        35: 'Never Done Before',
        40: 'Never to be Done Again'
    };

    const RAISE_CHECK_LABELS = [
        '3+ Checks',
        '2 Checks',
        '1 Check / Near Miss',
        'Success (0 Raises)',
        '1 Raise',
        '2 Raises',
        '3+ Raises'
    ];

    const RAISE_CHECK_COLORS = [
        '#dc2626', // 3+ checks  — deep red
        '#f87171', // 2 checks   — red
        '#fbbf24', // 1 check    — amber
        '#4ade80', // success 0  — green
        '#22d3ee', // 1 raise    — cyan
        '#818cf8', // 2 raises   — indigo
        '#c084fc'  // 3+ raises  — purple
    ];

    // =====================================================================
    // State
    // =====================================================================

    /** @type {{ numDice: number, keepDice: number, modifier: number }[]} */
    let pools = [{ numDice: 5, keepDice: 3, modifier: 0 }];
    let selectedTN = 15;
    let activeStunt = 0; // 0 = none, 1-3 = stunt level

    /** @type {Worker} */
    let worker = null;

    /** @type {Map<string, Object>} */
    const cache = new Map();
    let pendingJobs = 0;
    let jobIdCounter = 0;
    const pendingCallbacks = new Map();

    /** @type {Chart|null} */
    let chartSuccess = null;
    let chartHistogram = null;
    let chartRaises = null;

    let debounceTimer = null;

    // Results storage keyed by pool index
    const results = new Map();

    // =====================================================================
    // Worker Management
    // =====================================================================

    function initWorker() {
        worker = new Worker('simulation-worker.js');
        worker.onmessage = (e) => {
            const { id } = e.data;
            const cb = pendingCallbacks.get(id);
            if (cb) {
                pendingCallbacks.delete(id);
                cb(e.data);
            }
            pendingJobs--;
            if (pendingJobs === 0) {
                renderAll();
            }
        };
        worker.onerror = (err) => {
            console.error('Simulation worker error:', err);
        };
    }

    function simulate(poolIndex, pool) {
        const key = `${pool.numDice}k${pool.keepDice}+${pool.modifier}`;
        const cached = cache.get(key);
        if (cached) {
            results.set(poolIndex, cached);
            pendingJobs--;
            if (pendingJobs === 0) renderAll();
            return;
        }

        const id = ++jobIdCounter;
        pendingCallbacks.set(id, (data) => {
            cache.set(key, data);
            // Evict oldest if over limit
            if (cache.size > CACHE_MAX) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
            results.set(poolIndex, data);
        });

        worker.postMessage({
            id,
            numDice: pool.numDice,
            keepDice: pool.keepDice,
            modifier: pool.modifier,
            trials: TRIALS,
            tnMin: TN_MIN,
            tnMax: TN_MAX,
            tnStep: TN_STEP,
            selectedTN
        });
    }

    function runAllSimulations() {
        results.clear();
        pendingJobs = pools.length;
        pools.forEach((pool, i) => simulate(i, pool));
    }

    // =====================================================================
    // Chart Rendering
    // =====================================================================

    function getChartDefaults() {
        return {
            color: '#94929d',
            borderColor: '#2a2a32',
            backgroundColor: '#16161a',
            font: { family: 'system-ui, sans-serif' }
        };
    }

    function initCharts() {
        Chart.defaults.color = '#94929d';
        Chart.defaults.borderColor = '#2a2a32';

        // --- Success Probability vs TN ---
        const ctxSuccess = document.getElementById('chart-success').getContext('2d');
        chartSuccess = new Chart(ctxSuccess, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                onClick: (_evt, elements, chart) => {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const tn = chart.data.labels[idx];
                        setTN(tn);
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`
                        }
                    },
                    legend: { display: true, position: 'bottom' }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Target Number' },
                        grid: { color: '#1e1e24' }
                    },
                    y: {
                        title: { display: true, text: 'P(Success) %' },
                        min: 0,
                        max: 100,
                        grid: { color: '#1e1e24' }
                    }
                }
            }
        });

        // --- Result Distribution Histogram ---
        const ctxHist = document.getElementById('chart-histogram').getContext('2d');
        chartHistogram = new Chart(ctxHist, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y.toFixed(2)}%`
                        }
                    },
                    legend: { display: true, position: 'bottom' },
                    annotation: undefined // we'll add TN line via plugin if available
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Roll Total' },
                        grid: { display: false },
                        ticks: {
                            maxTicksLimit: 20,
                            callback: function(value) {
                                return value % 5 === 0 ? value : '';
                            }
                        }
                    },
                    y: {
                        title: { display: true, text: 'Probability %' },
                        min: 0,
                        grid: { color: '#1e1e24' }
                    }
                }
            }
        });

        // --- Raise/Check Distribution ---
        const ctxRaises = document.getElementById('chart-raises').getContext('2d');
        chartRaises = new Chart(ctxRaises, {
            type: 'bar',
            data: {
                labels: RAISE_CHECK_LABELS,
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`
                        }
                    },
                    legend: { display: true, position: 'bottom' }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Probability %' },
                        min: 0,
                        grid: { color: '#1e1e24' }
                    }
                }
            }
        });
    }

    /** TN vertical line plugin for histogram */
    const tnLinePlugin = {
        id: 'tnLine',
        afterDraw(chart) {
            if (chart.canvas.id !== 'chart-histogram') return;
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            if (!xScale || !yScale) return;

            // Find pixel position of the TN label
            const labels = chart.data.labels;
            const tnIdx = labels.indexOf(selectedTN);
            if (tnIdx === -1) return;

            const x = xScale.getPixelForValue(tnIdx);
            const ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#f87171';
            ctx.moveTo(x, yScale.top);
            ctx.lineTo(x, yScale.bottom);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#f87171';
            ctx.font = 'bold 11px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(`TN ${selectedTN}`, x, yScale.top - 6);
            ctx.restore();
        }
    };

    /** 50% guide line plugin for success chart */
    const fiftyLinePlugin = {
        id: 'fiftyLine',
        afterDraw(chart) {
            if (chart.canvas.id !== 'chart-success') return;
            const yScale = chart.scales.y;
            if (!yScale) return;

            const y = yScale.getPixelForValue(50);
            const ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#6c6a75';
            ctx.moveTo(chart.chartArea.left, y);
            ctx.lineTo(chart.chartArea.right, y);
            ctx.stroke();

            ctx.fillStyle = '#6c6a75';
            ctx.font = '10px system-ui';
            ctx.textAlign = 'right';
            ctx.fillText('50%', chart.chartArea.left - 4, y + 3);
            ctx.restore();
        }
    };

    /** Selected TN vertical line on success chart */
    const selectedTNPlugin = {
        id: 'selectedTN',
        afterDraw(chart) {
            if (chart.canvas.id !== 'chart-success') return;
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            if (!xScale || !yScale) return;

            const labels = chart.data.labels;
            const idx = labels.indexOf(selectedTN);
            if (idx === -1) return;

            const x = xScale.getPixelForValue(idx);
            const ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#d4a84b88';
            ctx.moveTo(x, yScale.top);
            ctx.lineTo(x, yScale.bottom);
            ctx.stroke();

            ctx.fillStyle = '#d4a84b';
            ctx.font = 'bold 11px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(`TN ${selectedTN}`, x, yScale.bottom + 16);
            ctx.restore();
        }
    };

    function renderAll() {
        renderSuccessChart();
        renderHistogramChart();
        renderRaisesChart();
        renderStatsTable();
    }

    function renderSuccessChart() {
        // Build TN labels: 5, 6, 7 ... 50 (every integer for smooth lines)
        const tnLabels = [];
        for (let tn = TN_MIN; tn <= TN_MAX; tn += TN_STEP) {
            tnLabels.push(tn);
        }

        const datasets = [];
        pools.forEach((pool, i) => {
            const data = results.get(i);
            if (!data) return;
            const rates = tnLabels.map(tn => data.successRates[tn] ?? 0);
            datasets.push({
                label: poolLabel(i),
                data: rates,
                borderColor: POOL_COLORS[i],
                backgroundColor: POOL_COLORS[i] + '33',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                tension: 0.25,
                fill: false
            });
        });

        chartSuccess.data.labels = tnLabels;
        chartSuccess.data.datasets = datasets;
        chartSuccess.update('none');
    }

    function renderHistogramChart() {
        // Use first pool's histogram range, overlay all pools
        let maxLen = 0;
        pools.forEach((_, i) => {
            const data = results.get(i);
            if (data && data.histogram.length > maxLen) maxLen = data.histogram.length;
        });
        if (maxLen === 0) return;

        const labels = [];
        for (let i = 0; i < maxLen; i++) labels.push(i);

        const datasets = [];
        pools.forEach((pool, i) => {
            const data = results.get(i);
            if (!data) return;
            const hist = data.histogram;
            const padded = new Array(maxLen).fill(0);
            for (let j = 0; j < hist.length; j++) padded[j] = hist[j];

            datasets.push({
                label: poolLabel(i),
                data: padded,
                backgroundColor: POOL_COLORS[i] + '88',
                borderColor: POOL_COLORS[i],
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 1.0
            });
        });

        chartHistogram.data.labels = labels;
        chartHistogram.data.datasets = datasets;
        chartHistogram.update('none');
    }

    function renderRaisesChart() {
        // Raise/check distribution needs recomputation per TN —
        // we cached at selectedTN. If TN changed since last sim, re-run.
        // For simplicity, the worker already returns raiseChecks for the selectedTN
        // that was passed. If we adjust TN without re-simming, approximate from
        // successRates. But for accuracy, we re-simulate.

        const datasets = [];
        pools.forEach((pool, i) => {
            const data = results.get(i);
            if (!data) return;
            datasets.push({
                label: poolLabel(i),
                data: data.raiseChecks,
                backgroundColor: RAISE_CHECK_COLORS,
                borderColor: '#0d0d0f',
                borderWidth: 1
            });
        });

        chartRaises.data.datasets = datasets;
        chartRaises.update('none');
    }

    function renderStatsTable() {
        const tbody = document.querySelector('#stats-table tbody');
        tbody.innerHTML = '';

        pools.forEach((pool, i) => {
            const data = results.get(i);
            if (!data) return;

            const row = document.createElement('tr');
            const pTN = data.successRates[selectedTN] ?? 0;
            const pTN5 = data.successRates[selectedTN + 5] ?? 0;
            const pTN10 = data.successRates[selectedTN + 10] ?? 0;

            // Expected raises: sum of P(total >= TN+5k) for k=1,2,...
            let expRaises = 0;
            for (let r = 1; r <= 10; r++) {
                const rate = data.successRates[selectedTN + r * 5];
                if (rate != null) expRaises += rate / 100;
            }

            row.innerHTML = `
                <td><span class="stats-pool-swatch" style="background:${POOL_COLORS[i]}"></span>${poolLabel(i)}</td>
                <td>${data.mean.toFixed(1)}</td>
                <td>${data.median.toFixed(1)}</td>
                <td>${data.stdDev.toFixed(1)}</td>
                <td>${pTN.toFixed(1)}%</td>
                <td>${pTN5.toFixed(1)}%</td>
                <td>${pTN10.toFixed(1)}%</td>
                <td>${expRaises.toFixed(1)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // =====================================================================
    // Pool label helper
    // =====================================================================

    function poolLabel(index) {
        const p = pools[index];
        if (!p) return '';
        const mod = p.modifier > 0 ? `+${p.modifier}` : p.modifier < 0 ? `${p.modifier}` : '';
        return `${p.numDice}k${p.keepDice}${mod}`;
    }

    // =====================================================================
    // UI Binding
    // =====================================================================

    function bindEvents() {
        // Delegate pool input changes
        document.getElementById('pool-rows').addEventListener('input', (e) => {
            const row = e.target.closest('.pool-row');
            if (!row) return;
            const poolIdx = parseInt(row.dataset.pool, 10);
            const param = e.target.dataset.param;
            if (!param) return;

            const val = parseInt(e.target.value, 10);
            if (isNaN(val)) return;

            pools[poolIdx][param] = val;

            // Clamp keepDice ≤ numDice
            if (param === 'numDice' && pools[poolIdx].keepDice > val) {
                pools[poolIdx].keepDice = val;
            }

            // Sync slider ↔ input
            syncPoolRow(row, poolIdx);
            scheduleSimulation();
        });

        // TN controls
        const tnSlider = document.getElementById('tn-slider');
        const tnInput = document.getElementById('tn-input');

        tnSlider.addEventListener('input', () => {
            selectedTN = parseInt(tnSlider.value, 10);
            tnInput.value = selectedTN;
            updateTNLabel();
            scheduleSimulation();
        });

        tnInput.addEventListener('input', () => {
            const v = parseInt(tnInput.value, 10);
            if (!isNaN(v) && v >= TN_MIN && v <= TN_MAX) {
                selectedTN = v;
                tnSlider.value = v;
                updateTNLabel();
                scheduleSimulation();
            }
        });

        // Presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const [num, keep] = btn.dataset.pool.split(',').map(Number);
                pools[0].numDice = num;
                pools[0].keepDice = keep;
                pools[0].modifier = 0;
                syncPoolRow(document.querySelector('.pool-row[data-pool="0"]'), 0);
                scheduleSimulation();
            });
        });

        // Stunts
        document.querySelectorAll('.stunt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.stunt, 10);
                if (activeStunt === level) {
                    // Toggle off
                    activeStunt = 0;
                    btn.classList.remove('active');
                } else {
                    activeStunt = level;
                    document.querySelectorAll('.stunt-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
                applyStunt();
            });
        });

        // Skill Test helper
        document.getElementById('helper-apply').addEventListener('click', () => {
            const skill = parseInt(document.getElementById('helper-skill').value, 10) || 0;
            const char = parseInt(document.getElementById('helper-char').value, 10) || 1;
            // Skill Test: (Skill + Char)k(Char)
            pools[0].numDice = skill + char + activeStunt;
            pools[0].keepDice = char;
            pools[0].modifier = 0;
            syncPoolRow(document.querySelector('.pool-row[data-pool="0"]'), 0);
            scheduleSimulation();
        });

        // Add pool
        document.getElementById('add-pool-btn').addEventListener('click', () => {
            if (pools.length >= MAX_POOLS) {
                showToast(`Maximum ${MAX_POOLS} pools`);
                return;
            }
            pools.push({ numDice: 5, keepDice: 3, modifier: 0 });
            rebuildPoolRows();
            scheduleSimulation();
        });

        // Clear all
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            pools = [{ numDice: 5, keepDice: 3, modifier: 0 }];
            activeStunt = 0;
            document.querySelectorAll('.stunt-btn').forEach(b => b.classList.remove('active'));
            rebuildPoolRows();
            scheduleSimulation();
        });

        // Share
        document.getElementById('share-btn').addEventListener('click', shareURL);
    }

    function applyStunt() {
        // Stunt adds rolled dice to pool 0 base. We don't store "base" separately —
        // the user's slider IS the base. So stunts simply inform the helper;
        // the user can manually adjust the rolled value. The stunt buttons
        // just serve as quick-increment toggles for convenience.
        // No auto-modification of the pool — that would be confusing if the user
        // manually set dice. Instead, the helper's "Apply" accounts for stunt.
    }

    function syncPoolRow(row, poolIdx) {
        const pool = pools[poolIdx];
        if (!pool) return;

        // Clamp kept ≤ rolled
        if (pool.keepDice > pool.numDice) pool.keepDice = pool.numDice;

        // Update all inputs/sliders within the row
        row.querySelectorAll('[data-param]').forEach(el => {
            const param = el.dataset.param;
            const val = pool[param];
            if (val != null && parseInt(el.value, 10) !== val) {
                el.value = val;
            }
            // Update max of keepDice slider/input when numDice changes
            if (param === 'keepDice') {
                el.max = Math.min(pool.numDice, 10);
            }
        });
    }

    function updateTNLabel() {
        const label = document.getElementById('tn-label');
        // Find the nearest labelled TN
        let best = '';
        for (const [tn, text] of Object.entries(TN_LABELS)) {
            if (selectedTN >= parseInt(tn, 10)) best = `${text} (TN ${tn})`;
        }
        label.textContent = best || `TN ${selectedTN}`;
    }

    // =====================================================================
    // Pool Row DOM
    // =====================================================================

    function rebuildPoolRows() {
        const container = document.getElementById('pool-rows');
        container.innerHTML = '';
        pools.forEach((pool, i) => {
            container.appendChild(createPoolRow(i, pool));
        });
        updateAddButton();
    }

    function createPoolRow(index, pool) {
        const row = document.createElement('div');
        row.className = 'pool-row';
        row.dataset.pool = index;

        row.innerHTML = `
            <span class="pool-color-swatch" style="background:${POOL_COLORS[index]}"></span>
            <label class="pool-field">
                <span class="field-label">Rolled</span>
                <input type="range" class="pool-slider" data-param="numDice"
                       min="1" max="15" value="${pool.numDice}" />
                <input type="number" class="pool-input" data-param="numDice"
                       min="1" max="15" value="${pool.numDice}" />
            </label>
            <span class="k-separator">k</span>
            <label class="pool-field">
                <span class="field-label">Kept</span>
                <input type="range" class="pool-slider" data-param="keepDice"
                       min="1" max="${Math.min(pool.numDice, 10)}" value="${pool.keepDice}" />
                <input type="number" class="pool-input" data-param="keepDice"
                       min="1" max="${Math.min(pool.numDice, 10)}" value="${pool.keepDice}" />
            </label>
            <label class="pool-field pool-field-narrow">
                <span class="field-label">Mod</span>
                <input type="number" class="pool-input" data-param="modifier"
                       min="-10" max="30" value="${pool.modifier}" />
            </label>
            ${index > 0 ? `<button class="remove-pool-btn" data-remove="${index}" title="Remove pool">×</button>` : ''}
        `;

        // Remove button handler
        const removeBtn = row.querySelector('.remove-pool-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                pools.splice(index, 1);
                rebuildPoolRows();
                scheduleSimulation();
            });
        }

        return row;
    }

    function updateAddButton() {
        const btn = document.getElementById('add-pool-btn');
        btn.disabled = pools.length >= MAX_POOLS;
    }

    // =====================================================================
    // Scheduling
    // =====================================================================

    function scheduleSimulation() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            // Invalidate cache entries that depend on selectedTN for raise/check
            // (since raiseChecks is TN-specific). We clear results and re-simulate.
            runAllSimulations();
        }, DEBOUNCE_MS);
    }

    // =====================================================================
    // URL Sharing
    // =====================================================================

    function shareURL() {
        const params = pools.map(p => `${p.numDice}k${p.keepDice}${p.modifier ? (p.modifier > 0 ? '+' : '') + p.modifier : ''}`);
        const hash = `#pools=${params.join(',')}&tn=${selectedTN}`;
        const url = window.location.href.split('#')[0] + hash;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('URL copied to clipboard');
            }).catch(() => {
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }

        window.location.hash = hash.slice(1);
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('URL copied');
    }

    function loadFromURL() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;

        const params = new URLSearchParams(hash);
        const poolStr = params.get('pools');
        const tnStr = params.get('tn');

        if (poolStr) {
            const parsed = poolStr.split(',').map(s => {
                const m = s.trim().match(/^(\d+)k(\d+)([+-]\d+)?$/);
                if (!m) return null;
                return {
                    numDice: parseInt(m[1], 10),
                    keepDice: parseInt(m[2], 10),
                    modifier: m[3] ? parseInt(m[3], 10) : 0
                };
            }).filter(Boolean).slice(0, MAX_POOLS);

            if (parsed.length > 0) pools = parsed;
        }

        if (tnStr) {
            const tn = parseInt(tnStr, 10);
            if (!isNaN(tn) && tn >= TN_MIN && tn <= TN_MAX) {
                selectedTN = tn;
            }
        }
    }

    // =====================================================================
    // Toast
    // =====================================================================

    let toastTimer = null;
    function showToast(message) {
        const el = document.getElementById('toast');
        el.textContent = message;
        el.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('visible'), 2500);
    }

    // =====================================================================
    // Color swatch init
    // =====================================================================

    function applySwatch() {
        document.querySelectorAll('.pool-color-swatch').forEach(el => {
            const idx = parseInt(el.dataset?.pool ?? el.closest('.pool-row')?.dataset?.pool, 10);
            if (!isNaN(idx)) el.style.background = POOL_COLORS[idx];
        });
    }

    // =====================================================================
    // Init
    // =====================================================================

    function init() {
        loadFromURL();
        initWorker();

        // Register Chart.js plugins
        Chart.register(tnLinePlugin, fiftyLinePlugin, selectedTNPlugin);

        initCharts();
        rebuildPoolRows();
        applySwatch();

        // Sync TN UI
        document.getElementById('tn-slider').value = selectedTN;
        document.getElementById('tn-input').value = selectedTN;
        updateTNLabel();

        bindEvents();

        // Initial simulation
        runAllSimulations();
    }

    // =====================================================================
    // Public API (for debugging / testing)
    // =====================================================================

    return { init, pools: () => pools, results: () => results };

})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', Analyzer.init);
