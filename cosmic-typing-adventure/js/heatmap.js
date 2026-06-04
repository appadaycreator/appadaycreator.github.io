// 苦手キーヒートマップ
window.HeatmapManager = (function () {
    const STORAGE_KEY = 'cosmicTyping_keyMisses';
    // キーごとのミス回数と打鍵回数
    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function recordKeyPress(key, isCorrect) {
        if (!key || key.length !== 1) return;
        const k = key.toLowerCase();
        const data = load();
        if (!data[k]) data[k] = { hits: 0, misses: 0 };
        if (isCorrect) {
            data[k].hits++;
        } else {
            data[k].misses++;
        }
        save(data);
    }

    // textDisplayのMutationObserverでキーミスを検出
    function observeTyping() {
        const inputs = ['typingInput', 'timeAttackInput'];
        inputs.forEach(function (inputId) {
            const inp = document.getElementById(inputId);
            if (!inp) return;

            let prevLength = 0;
            inp.addEventListener('input', function () {
                const textDisplay = document.getElementById(inputId === 'typingInput' ? 'textDisplay' : 'timeAttackTextDisplay');
                if (!textDisplay) return;

                // 現在の入力値とテキストの対応位置を確認
                const currentVal = inp.value;
                if (currentVal.length > prevLength) {
                    // 文字が追加された
                    const addedChar = currentVal[currentVal.length - 1];
                    const incorrectChars = textDisplay.querySelectorAll('.incorrect-char');
                    const isIncorrect = incorrectChars.length > 0 &&
                        incorrectChars[incorrectChars.length - 1].textContent === addedChar;
                    recordKeyPress(addedChar, !isIncorrect);
                }
                prevLength = currentVal.length;
            });
        });
    }

    // QWERTYキーボードSVGを生成
    function buildKeyboardSVG() {
        const data = load();
        const rows = [
            ['q','w','e','r','t','y','u','i','o','p'],
            ['a','s','d','f','g','h','j','k','l'],
            ['z','x','c','v','b','n','m']
        ];

        const KEY_W = 36, KEY_H = 32, GAP = 4;
        const offsets = [0, 18, 36]; // 各行の左オフセット

        function getMissRate(k) {
            const d = data[k];
            if (!d) return null;
            const total = d.hits + d.misses;
            if (total < 3) return null;
            return d.misses / total;
        }

        function getColor(rate) {
            if (rate === null) return '#1e3a8a'; // データなし（デフォルト青）
            if (rate < 0.05) return '#065f46'; // 緑（ほぼ正確）
            if (rate < 0.15) return '#ca8a04'; // 黄（やや苦手）
            return '#991b1b'; // 赤（苦手）
        }

        function getTextColor(rate) {
            return '#e5e7eb';
        }

        const svgWidth = rows[0].length * (KEY_W + GAP) + 20;
        const svgHeight = rows.length * (KEY_H + GAP) + 20;

        let svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" style="max-width:420px;">`];

        rows.forEach(function (row, rowIdx) {
            const y = 10 + rowIdx * (KEY_H + GAP);
            const offsetX = offsets[rowIdx];
            row.forEach(function (key, colIdx) {
                const x = 10 + offsetX + colIdx * (KEY_W + GAP);
                const rate = getMissRate(key);
                const fill = getColor(rate);
                const label = key.toUpperCase();
                const missCount = data[key] ? data[key].misses : 0;
                const title = data[key]
                    ? `${label}: ミス${missCount}回 / ${data[key].hits + data[key].misses}回`
                    : `${label}: データなし`;
                svgParts.push(
                    `<rect x="${x}" y="${y}" width="${KEY_W}" height="${KEY_H}" rx="4" fill="${fill}" stroke="#334155" stroke-width="1"/>`,
                    `<text x="${x + KEY_W / 2}" y="${y + KEY_H / 2 + 5}" text-anchor="middle" font-size="12" font-family="monospace" fill="${getTextColor(rate)}">${label}</text>`,
                    `<title>${title}</title>`
                );
            });
        });

        svgParts.push('</svg>');
        return svgParts.join('');
    }

    function renderLegend() {
        return `<div style="display:flex;gap:12px;font-size:11px;color:#9ca3af;margin-top:8px;flex-wrap:wrap;">
            <span><span style="display:inline-block;width:12px;height:12px;background:#065f46;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>得意</span>
            <span><span style="display:inline-block;width:12px;height:12px;background:#ca8a04;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>やや苦手</span>
            <span><span style="display:inline-block;width:12px;height:12px;background:#991b1b;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>苦手</span>
            <span><span style="display:inline-block;width:12px;height:12px;background:#1e3a8a;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>データなし</span>
        </div>`;
    }

    function renderHeatmap() {
        const container = document.getElementById('keyHeatmapContainer');
        if (!container) return;
        container.innerHTML = buildKeyboardSVG() + renderLegend();
    }

    // 統計タブに苦手キーランキングも更新
    function renderWeakKeysList() {
        const data = load();
        const weakKeysEl = document.getElementById('weakKeys');
        if (!weakKeysEl) return;

        const keyStats = Object.entries(data).map(function ([k, v]) {
            const total = v.hits + v.misses;
            return { key: k, total: total, misses: v.misses, rate: total >= 3 ? v.misses / total : 0 };
        }).filter(function (k) { return k.total >= 3; }).sort(function (a, b) { return b.rate - a.rate; }).slice(0, 5);

        if (keyStats.length === 0) {
            weakKeysEl.innerHTML = '<div class="text-sm text-gray-400 text-center py-4">データが不足しています<br>もっと練習しましょう！</div>';
            return;
        }

        weakKeysEl.innerHTML = keyStats.map(function (k) {
            const pct = Math.round(k.rate * 100);
            const barColor = pct >= 15 ? '#991b1b' : pct >= 5 ? '#ca8a04' : '#065f46';
            return `<div class="flex items-center justify-between py-1">
                <span class="font-mono font-bold text-sm" style="width:24px;">${k.key.toUpperCase()}</span>
                <div class="flex-1 mx-2 bg-gray-700 rounded-full h-2">
                    <div class="h-2 rounded-full" style="width:${Math.min(pct * 3, 100)}%;background:${barColor};"></div>
                </div>
                <span class="text-xs text-gray-400" style="width:48px;text-align:right;">ミス${pct}%</span>
            </div>`;
        }).join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
        observeTyping();
        // 統計セクション表示時にヒートマップを描画
        const origShowSection = window.showSection;
        if (typeof origShowSection === 'function') {
            window.showSection = function (name) {
                origShowSection(name);
                if (name === 'stats') {
                    setTimeout(function () { renderHeatmap(); renderWeakKeysList(); }, 100);
                }
            };
        }
        // 初回描画
        renderWeakKeysList();
    });

    // P1: 弱点キー取得（ミス率上位5件）
    function getWeakKeys() {
        const data = load();
        return Object.entries(data).map(function ([k, v]) {
            const total = v.hits + v.misses;
            return { key: k, total: total, rate: total >= 3 ? v.misses / total : 0 };
        }).filter(function (k) { return k.total >= 3 && k.rate > 0; })
          .sort(function (a, b) { return b.rate - a.rate; })
          .slice(0, 5)
          .map(function (k) { return k.key; });
    }

    return { renderHeatmap: renderHeatmap, renderWeakKeysList: renderWeakKeysList, getWeakKeys: getWeakKeys };
})();
