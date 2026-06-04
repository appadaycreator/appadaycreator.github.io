// P1-P4 新機能モジュール

// ==========================================
// P1: 残り文字数カウンター + タイピング進行バー（通常・TA両対応）
// ==========================================
(function initRemainingChars() {
    function updateProgressBar(typed, textLen) {
        var bar = document.getElementById('typingProgressBar');
        if (bar && textLen > 0) {
            bar.style.width = Math.min(100, (typed / textLen) * 100).toFixed(1) + '%';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        // 通常モード
        var inp = document.getElementById('typingInput');
        if (inp) {
            inp.addEventListener('input', function () {
                // typingEngine.currentText → textDisplay.textContent の順にフォールバック
                var text = (window.app && window.app.typingEngine && window.app.typingEngine.currentText)
                    ? window.app.typingEngine.currentText
                    : (document.getElementById('textDisplay') ? document.getElementById('textDisplay').textContent.trim() : '');
                if (!text) return;
                var typed = inp.value.length;
                var remaining = Math.max(0, text.length - typed);
                var counter = document.getElementById('remainingCount');
                var wrap = document.getElementById('remainingChars');
                if (counter) counter.textContent = remaining;
                if (wrap) {
                    wrap.classList.remove('hidden');
                    var pct = remaining / text.length;
                    wrap.querySelector('span').style.color = pct < 0.1 ? '#10b981' : pct < 0.3 ? '#f97316' : '#9ca3af';
                }
                updateProgressBar(typed, text.length);
            });
        }
        // タイムアタックモード（進行バーのみ）
        var taInp = document.getElementById('timeAttackInput');
        if (taInp) {
            taInp.addEventListener('input', function () {
                var text = (window.app && window.app.typingEngine && window.app.typingEngine.currentText)
                    ? window.app.typingEngine.currentText
                    : (document.getElementById('textDisplay') ? document.getElementById('textDisplay').textContent.trim() : '');
                if (!text) return;
                updateProgressBar(taInp.value.length, text.length);
            });
        }
    });
})();

// ==========================================
// P2: デイリーチャレンジ
// ==========================================
window.DailyChallengeManager = (function () {
    // P2-1: 日ごとに変わる具体的ゴール定義
    var GOALS = [
        { key: 'wpm20',     label: '20 WPM 達成（入門）',       check: function(w,a,c){ return w >= 20; } },
        { key: 'acc80',     label: '正確率 80% 以上',           check: function(w,a,c){ return a >= 80; } },
        { key: 'combo10',   label: '最大コンボ 10x 以上',       check: function(w,a,c){ return c >= 10; } },
        { key: 'wpm40',     label: '40 WPM 達成',               check: function(w,a,c){ return w >= 40; } },
        { key: 'wpm60',     label: '60 WPM 達成',              check: function(w,a,c){ return w >= 60; } },
        { key: 'acc95',     label: '正確率 95% 以上',           check: function(w,a,c){ return a >= 95; } },
        { key: 'wpm50acc90',label: 'WPM 50 かつ 正確率 90%',   check: function(w,a,c){ return w >= 50 && a >= 90; } },
        { key: 'combo30',   label: '最大コンボ 30x 以上',       check: function(w,a,c){ return c >= 30; } }
    ];

    function getToday() { return new Date().toISOString().split('T')[0]; }
    function getDoneKey() { return 'cosmicTyping_daily_' + getToday(); }
    function isDone() { return !!localStorage.getItem(getDoneKey()); }

    function getDailyGoal() {
        var d = new Date();
        var seed = d.getDate() + d.getMonth() * 31;
        return GOALS[seed % GOALS.length];
    }

    function markDone() {
        localStorage.setItem(getDoneKey(), '1');
        updateBadge();
        if (window.StreakManager) window.StreakManager.recordSession();
    }
    function getDailyPlanet() {
        var d = new Date();
        var seed = d.getDate() + d.getMonth() * 31;
        var planets = ['earth', 'mars', 'jupiter', 'saturn', 'code'];
        return planets[seed % planets.length];
    }
    function start() {
        if (isDone()) {
            showToast('✅ 今日のチャレンジはクリア済み！明日また挑戦してね');
            return;
        }
        var planet = getDailyPlanet();
        var goal = getDailyGoal();
        localStorage.setItem('cosmicTyping_dailyActive', '1');
        if (window.app) window.app.selectPlanet(planet);
        showToast('🌟 デイリーチャレンジ開始！目標: ' + goal.label);
        updateBadge();
    }
    function updateBadge() {
        var badge = document.getElementById('dailyChallengeBadge');
        var btn = document.getElementById('dailyChallengeBtn');
        var goalEl = document.getElementById('dailyChallengeGoal');
        var goal = getDailyGoal();
        if (goalEl) goalEl.textContent = '🎯 今日の目標: ' + goal.label;
        if (!badge) return;
        if (isDone()) {
            badge.textContent = '✅ クリア済み';
            badge.style.background = '#065f46';
            if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
        } else {
            badge.textContent = '🌟 未挑戦';
            badge.style.background = '#92400e';
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        }
    }
    function onSessionComplete() {
        if (!localStorage.getItem('cosmicTyping_dailyActive')) return;
        localStorage.removeItem('cosmicTyping_dailyActive');
        // 結果パネルからWPM/精度/コンボを取得してゴール判定
        var wpmEl = document.getElementById('finalWPM') || document.getElementById('ta-finalWPM');
        var accEl = document.getElementById('finalAccuracy') || document.getElementById('ta-finalAccuracy');
        var comboEl = document.getElementById('finalCombo');
        var wpm = wpmEl ? parseFloat(wpmEl.textContent || 0) : 0;
        var acc = accEl ? parseFloat(accEl.textContent || 0) : 0;
        var combo = comboEl ? parseInt(comboEl.textContent || 0) : 0;
        var goal = getDailyGoal();
        if (goal.check(wpm, acc, combo)) {
            markDone();
            showToast('🎉 デイリーチャレンジ完了！ +200 XP ボーナス！');
            var xp = parseInt(localStorage.getItem('cosmicTyping_xp') || 0);
            localStorage.setItem('cosmicTyping_xp', xp + 200);
            var xpEl = document.getElementById('userXP');
            if (xpEl) xpEl.textContent = (xp + 200) + ' XP';
        } else {
            showToast('📋 目標未達成…もう一度挑戦しよう！（目標: ' + goal.label + '）');
        }
    }
    document.addEventListener('DOMContentLoaded', function () {
        updateBadge();
        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        onSessionComplete();
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
    return { start: start, isDone: isDone, updateBadge: updateBadge };
})();

// ==========================================
// P3: 初回チュートリアルモーダル
// ==========================================
window.TutorialManager = (function () {
    var DONE_KEY = 'cosmicTyping_tutorialDone';
    var step = 0;
    var steps = [
        {
            icon: '🚀',
            title: 'Cosmic Typing へようこそ！',
            text: '宇宙をテーマにしたタイピング練習ゲームです。\nミッションを選んで宇宙を探索しましょう！'
        },
        {
            icon: '🎮',
            title: 'ミッションを選ぼう',
            text: '「基礎訓練」〜「サバイバル」まで5種類のモード + タイムアタック4種類があります。\n「💻 コードモード」でプログラミング文も練習できます！'
        },
        {
            icon: '⌨️',
            title: '入力してスタート！',
            text: '「開始」ボタンを押してタイピングを始めましょう。\n結果はWPM（1分間の文字数）と正確率で評価されます。\n毎日練習してストリークを伸ばそう！'
        }
    ];

    function show() {
        step = 0;
        renderStep();
        var modal = document.getElementById('tutorialModal');
        if (modal) modal.classList.remove('hidden');
    }

    function renderStep() {
        var s = steps[step];
        var iconEl = document.getElementById('tutorialIcon');
        var titleEl = document.getElementById('tutorialTitle');
        var textEl = document.getElementById('tutorialText');
        var nextBtn = document.getElementById('tutorialNextBtn');
        if (iconEl) iconEl.textContent = s.icon;
        if (titleEl) titleEl.textContent = s.title;
        if (textEl) textEl.innerHTML = s.text.replace(/\n/g, '<br>');
        if (nextBtn) nextBtn.textContent = step < steps.length - 1 ? '次へ →' : 'はじめる！';
        for (var i = 0; i < steps.length; i++) {
            var dot = document.getElementById('dot' + i);
            if (dot) dot.style.background = i === step ? '#06b6d4' : '#4b5563';
        }
    }

    function next() {
        step++;
        if (step >= steps.length) {
            skip();
        } else {
            renderStep();
        }
    }

    function skip() {
        localStorage.setItem(DONE_KEY, '1');
        var modal = document.getElementById('tutorialModal');
        if (modal) modal.classList.add('hidden');
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!localStorage.getItem(DONE_KEY)) {
            setTimeout(show, 600); // ページ読み込み後に少し待って表示
        }
    });

    return { show: show, next: next, skip: skip };
})();

// ==========================================
// P4: リアルタイムWPMグラフ（通常 + タイムアタック対応）
// ==========================================
(function initWPMChart() {
    var chartInstance = null;
    var taChartInstance = null;
    var wpmHistory = [];
    var timeLabels = [];
    var pollInterval = null;
    var startTime = null;
    var isTimeAttackMode = false;

    function makeChartConfig(canvas) {
        return new Chart(canvas, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'WPM',
                    data: wpmHistory,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6,182,212,0.15)',
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#06b6d4',
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                animation: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#9ca3af', font: { size: 9 }, maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, suggestedMax: 80 }
                }
            }
        });
    }

    function startTracking(timeAttack) {
        isTimeAttackMode = !!timeAttack;
        wpmHistory = [];
        timeLabels = [];
        startTime = Date.now();
        if (pollInterval) clearInterval(pollInterval);
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        if (taChartInstance) { taChartInstance.destroy(); taChartInstance = null; }
        var c1 = document.getElementById('wpmChartContainer');
        var c2 = document.getElementById('taWpmChartContainer');
        // P3: WPMグラフ設定に従い表示制御（デフォルト表示）
        var showGraph = localStorage.getItem('cosmicTyping_showWpmGraph') !== 'false';
        if (c1) { if (showGraph) c1.classList.remove('hidden'); else c1.classList.add('hidden'); }
        if (c2) c2.classList.add('hidden');

        // liveWPMはtypingInterface内にあり通常/TAモード両方で更新される
        var wpmDisplayId = 'liveWPM';

        pollInterval = setInterval(function () {
            var wpmEl = document.getElementById(wpmDisplayId);
            if (!wpmEl) return;
            var wpm = parseFloat(wpmEl.textContent) || 0;
            if (wpm > 0 || wpmHistory.length > 0) {
                wpmHistory.push(wpm);
                var elapsed = Math.round((Date.now() - startTime) / 1000);
                timeLabels.push(elapsed + '秒');
                renderChart();
            }
        }, 3000);
    }

    function stopTracking() {
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    }

    function renderChart() {
        if (wpmHistory.length < 2) return;
        if (!window.Chart) return;
        // 通常/TAモード両方でliveWPMChart（typingInterface内）を使用
        var canvas = document.getElementById('liveWPMChart');
        var container = document.getElementById('wpmChartContainer');
        if (!canvas || !container) return;
        container.classList.remove('hidden');
        if (chartInstance) {
            chartInstance.data.labels = timeLabels;
            chartInstance.data.datasets[0].data = wpmHistory;
            chartInstance.update('none');
            return;
        }
        chartInstance = makeChartConfig(canvas);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', function () {
                setTimeout(function () { startTracking(false); }, 200);
            });
        }

        document.querySelectorAll('.time-attack-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var sec = parseInt(btn.dataset.timeAttack || '60');
                localStorage.setItem('cosmicTyping_lastTimeAttack', String(sec));
                setTimeout(function () { startTracking(true); }, 200);
            });
        });

        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        stopTracking();
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();

// ==========================================
// P1追加: ベストスコア記録・表示
// ==========================================
(function BestScoreManager() {
    var KEY_WPM = 'cosmicTyping_bestWPM';
    var KEY_ACC = 'cosmicTyping_bestAccuracy';
    var KEY_SESSIONS = 'cosmicTyping_totalSessions';
    var KEY_AVG_WPM = 'cosmicTyping_avgWPM';
    var KEY_TOTAL_SEC = 'cosmicTyping_totalSeconds';

    function getBest(key) { return parseFloat(localStorage.getItem(key) || 0); }

    function checkAndUpdate(wpm, accuracy, durationSec) {
        var isNewBest = false;
        if (wpm > getBest(KEY_WPM)) {
            localStorage.setItem(KEY_WPM, wpm);
            isNewBest = true;
        }
        if (accuracy > getBest(KEY_ACC)) {
            localStorage.setItem(KEY_ACC, accuracy);
        }
        var sessions = parseInt(localStorage.getItem(KEY_SESSIONS) || 0) + 1;
        var prevAvg = parseFloat(localStorage.getItem(KEY_AVG_WPM) || 0);
        var newAvg = ((prevAvg * (sessions - 1)) + wpm) / sessions;
        localStorage.setItem(KEY_SESSIONS, sessions);
        localStorage.setItem(KEY_AVG_WPM, newAvg.toFixed(1));
        // P1-1: 総練習時間累積
        if (durationSec > 0) {
            var prevSec = parseInt(localStorage.getItem(KEY_TOTAL_SEC) || 0);
            localStorage.setItem(KEY_TOTAL_SEC, prevSec + Math.round(durationSec));
        }
        return isNewBest;
    }

    function updateStatsDisplay() {
        var el = document.getElementById('bestWPM');
        if (el) el.textContent = getBest(KEY_WPM).toFixed(1);
        var accEl = document.getElementById('bestAccuracy');
        if (accEl) accEl.textContent = getBest(KEY_ACC).toFixed(1) + '%';
        var avgEl = document.getElementById('avgWPM');
        if (avgEl) avgEl.textContent = parseFloat(localStorage.getItem(KEY_AVG_WPM) || 0).toFixed(1);
        var sessEl = document.getElementById('totalSessions');
        if (sessEl) sessEl.textContent = localStorage.getItem(KEY_SESSIONS) || 0;
        // P1-1: 総練習時間
        var timeEl = document.getElementById('totalTime');
        if (timeEl) {
            var totalSec = parseInt(localStorage.getItem(KEY_TOTAL_SEC) || 0);
            timeEl.textContent = totalSec < 60 ? totalSec + '秒' : Math.floor(totalSec / 60) + '分';
        }
    }

    function onResultsVisible(panel, bannerId) {
        var wpmEl = panel.querySelector('[id="finalWPM"],[id="ta-finalWPM"]') || panel.querySelector('.text-energy-green');
        var accEl = panel.querySelector('[id="finalAccuracy"],[id="ta-finalAccuracy"]');
        if (!wpmEl) return;
        var wpm = parseFloat(wpmEl.textContent || 0);
        var acc = parseFloat((accEl || {}).textContent || 0);
        if (wpm <= 0) return;
        // セッション経過時間をapp.jsのtypingEngineから取得（可能なら）
        var dur = 0;
        try { dur = window.app && window.app.typingEngine ? (window.app.typingEngine.getResults() || {}).duration || 0 : 0; } catch(e) {}
        var isNew = checkAndUpdate(wpm, acc, dur);
        var banner = document.getElementById(bannerId);
        if (banner) banner.classList.toggle('hidden', !isNew);
        if (isNew) showToast('🏆 自己ベスト更新！ WPM: ' + wpm.toFixed(1));
        updateStatsDisplay();

        // ローカルランキングに保存（通常モード）
        var isTA = panel.id === 'timeAttackResults';
        if (!isTA && typeof saveToLocalLeaderboard === 'function') {
            var mode = (window.app && window.app.currentPlanet) || 'basic';
            var rank = wpm >= 80 && acc >= 95 ? 'S' : wpm >= 60 && acc >= 90 ? 'A' : wpm >= 40 ? 'B' : wpm >= 20 ? 'C' : 'D';
            saveToLocalLeaderboard(mode, wpm, acc, rank, null);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateStatsDisplay();
        var pairs = [
            { id: 'resultsPanel', bannerId: 'bestScoreBanner' },
            { id: 'timeAttackResults', bannerId: 'ta-bestScoreBanner' }
        ];
        pairs.forEach(function (pair) {
            var el = document.getElementById(pair.id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        setTimeout(function () { onResultsVisible(t, pair.bannerId); }, 50);
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();

// ==========================================
// P3: XP・レベルアップ管理
// ==========================================
(function XPManager() {
    var KEY_XP = 'cosmicTyping_xp';
    var KEY_LV = 'cosmicTyping_level';
    var XP_PER_LEVEL = [0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000];

    function getXP() { return parseInt(localStorage.getItem(KEY_XP) || 0); }
    function getLevel() { return parseInt(localStorage.getItem(KEY_LV) || 1); }

    function calcLevel(xp) {
        for (var i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
            if (xp >= XP_PER_LEVEL[i]) return i + 1;
        }
        return 1;
    }

    function calcXPGain(wpm, accuracy) {
        var base = Math.round(wpm * 2);
        var accBonus = accuracy >= 95 ? 1.5 : accuracy >= 85 ? 1.2 : 1.0;
        // P0-1: 宇宙船エンジンLvによるXP倍率（Lv1=x1.0〜Lv5=x2.0）
        var upgrades = {}; try { upgrades = JSON.parse(localStorage.getItem('cosmicTyping_shipUpgrades') || '{}'); } catch(e) {}
        var engLv = Math.min(5, parseInt(upgrades.engine || 1));
        var engMult = [1.0, 1.0, 1.2, 1.5, 1.8, 2.0][engLv];
        window._lastXPMultiplier = engMult;
        return Math.round(base * accBonus * engMult);
    }

    function addXP(gain) {
        var prevXP = getXP();
        var prevLevel = calcLevel(prevXP);
        var newXP = prevXP + gain;
        var newLevel = calcLevel(newXP);
        localStorage.setItem(KEY_XP, newXP);
        localStorage.setItem(KEY_LV, newLevel);
        updateDisplay();
        showToast('✨ +' + gain + ' XP 獲得！');
        if (newLevel > prevLevel) {
            setTimeout(function () {
                if (typeof window.showLevelUpModal === 'function') {
                    window.showLevelUpModal(prevLevel, newLevel);
                } else {
                    showToast('🎉 レベルアップ！ Lv.' + prevLevel + ' → Lv.' + newLevel);
                }
            }, 800);
        }
    }

    function updateDisplay() {
        var xp = getXP();
        var lv = calcLevel(xp);
        var lvEl = document.getElementById('userLevel');
        var xpEl = document.getElementById('userXP');
        if (lvEl) lvEl.textContent = 'Lv.' + lv;
        if (xpEl) {
            var nextLvXP = XP_PER_LEVEL[Math.min(lv, XP_PER_LEVEL.length - 1)] || xp + 1000;
            xpEl.textContent = xp + ' XP';
        }
        // 統計タブ
        var totalXP = document.getElementById('totalXP');
        if (totalXP) totalXP.textContent = xp;
        var currentLevel = document.getElementById('currentLevel');
        if (currentLevel) currentLevel.textContent = lv;
    }

    function onResultsVisible(panel) {
        var wpmEl = panel.querySelector('[id="finalWPM"],[id="ta-finalWPM"]') || panel.querySelector('.text-energy-green');
        var accEl = panel.querySelector('[id="finalAccuracy"],[id="ta-finalAccuracy"]');
        if (!wpmEl) return;
        var wpm = parseFloat(wpmEl.textContent || 0);
        var acc = parseFloat((accEl || {}).textContent || 0);
        if (wpm <= 0) return;
        var gain = calcXPGain(wpm, acc);
        addXP(gain);
        var earnedEl = document.getElementById('earnedXP');
        if (earnedEl) earnedEl.textContent = gain;
        var taEarnedEl = document.getElementById('ta-earnedXP');
        if (taEarnedEl) taEarnedEl.textContent = gain;
        // P0-1: エンジン倍率バッジ表示
        var mult = window._lastXPMultiplier || 1.0;
        var multEl = document.getElementById('xpMultiplierBadge');
        if (multEl) {
            if (mult > 1.0) { multEl.textContent = '⚡ エンジンLv' + Math.min(5, parseInt((JSON.parse(localStorage.getItem('cosmicTyping_shipUpgrades') || '{}')).engine || 1)) + ' × ' + mult.toFixed(1); multEl.classList.remove('hidden'); }
            else { multEl.classList.add('hidden'); }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateDisplay();
        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        setTimeout(function () { onResultsVisible(t); }, 100);
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();

// ==========================================
// P2-1: 実績（Achievement）自動解放システム
// ==========================================
(function AchievementUnlocker() {
    var KEY = 'cosmicTyping_achievements';
    var DEFS = [
        { id: 'first_flight',    icon: '🥇', iconColor: 'text-yellow-400',  title: '初回航行',         desc: '最初のタイピングを完了',       check: function(s) { return s.sessions >= 1; } },
        { id: 'speed_pilot',     icon: '🚀', iconColor: 'text-cosmic-cyan', title: 'スピードパイロット', desc: '50 WPMを達成',                check: function(s) { return s.bestWPM >= 50; } },
        { id: 'planet_finder',   icon: '🌍', iconColor: 'text-energy-green', title: '惑星発見者',       desc: '3回のセッションを完了',        check: function(s) { return s.sessions >= 3; } },
        { id: 'accuracy_master', icon: '🎯', iconColor: 'text-red-400',     title: '精密操縦士',       desc: '正確率100%を達成',             check: function(s) { return s.bestAccuracy >= 100; } },
        { id: 'speed_demon',     icon: '⚡', iconColor: 'text-planet-orange', title: 'ハイパードライブ', desc: '80 WPMを達成',                check: function(s) { return s.bestWPM >= 80; } },
        { id: 'marathon_pilot',  icon: '🚩', iconColor: 'text-purple-400',  title: 'マラソンパイロット', desc: '10セッション完了',             check: function(s) { return s.sessions >= 10; } },
        { id: 'streak_3',        icon: '🔥', iconColor: 'text-orange-400',  title: '3日連続',          desc: '3日連続で練習',                check: function(s) { return s.streak >= 3; } },
        { id: 'daily_hero',      icon: '⭐', iconColor: 'text-yellow-300',  title: 'デイリーヒーロー', desc: 'デイリーチャレンジを完了',      check: function(s) { return s.dailyDone; } },
        { id: 'code_master',     icon: '💻', iconColor: 'text-cosmic-cyan', title: 'コードパイロット',  desc: 'コードモードで1回完了',         check: function(s) { return s.codeDone; } }
    ];

    function getUnlocked() {
        try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
    }

    function getCurrentStats() {
        var streakData = {};
        try { streakData = JSON.parse(localStorage.getItem('cosmicTyping_streak') || '{}'); } catch(e) {}
        var today = new Date().toISOString().split('T')[0];
        return {
            sessions:     parseInt(localStorage.getItem('cosmicTyping_totalSessions') || 0),
            bestWPM:      parseFloat(localStorage.getItem('cosmicTyping_bestWPM') || 0),
            bestAccuracy: parseFloat(localStorage.getItem('cosmicTyping_bestAccuracy') || 0),
            streak:       parseInt(streakData.count || 0),
            dailyDone:    !!localStorage.getItem('cosmicTyping_daily_' + today),
            codeDone:     !!localStorage.getItem('cosmicTyping_codeDone')
        };
    }

    function renderAchievements(unlocked) {
        // ゲーム画面サイドバーの実績リスト
        var list = document.getElementById('achievementList');
        if (list) {
            list.innerHTML = '';
            DEFS.forEach(function (def) {
                var isUnlocked = unlocked.indexOf(def.id) !== -1;
                var item = document.createElement('div');
                item.className = 'achievement-item p-2 bg-gray-800 rounded flex items-center space-x-3' + (isUnlocked ? '' : ' opacity-50');
                item.innerHTML = '<span class="text-xl ' + (isUnlocked ? '' : 'opacity-40') + '">' + def.icon + '</span>' +
                    '<div class="text-sm"><div class="font-bold ' + (isUnlocked ? 'text-white' : 'text-gray-500') + '">' + def.title + '</div>' +
                    '<div class="text-xs ' + (isUnlocked ? 'text-gray-300' : 'text-gray-600') + '">' + def.desc + '</div></div>' +
                    (isUnlocked ? '<span class="ml-auto text-xs text-yellow-400">✓</span>' : '');
                list.appendChild(item);
            });
        }
        // 統計タブの実績リスト
        var statsList = document.getElementById('achievementListStats');
        if (statsList) {
            statsList.innerHTML = list ? list.innerHTML : '';
            var progress = document.getElementById('achievementProgress');
            if (progress) progress.textContent = unlocked.length + '/' + DEFS.length;
        }
    }

    // P2-2: 実績解放モーダル演出
    function showAchievementModal(def) {
        var modal = document.getElementById('achievementModal');
        if (!modal) { showToast('🏅 実績解放: ' + def.title); return; }
        var iconEl = document.getElementById('achievementModalIcon');
        var titleEl = document.getElementById('achievementModalTitle');
        var descEl = document.getElementById('achievementModalDesc');
        if (iconEl) { iconEl.textContent = def.icon; /* classNameは維持してemoji色を保つ */ }
        if (titleEl) titleEl.textContent = def.title;
        if (descEl) descEl.textContent = def.desc;
        modal.classList.remove('hidden');
        modal.style.animation = 'none';
        setTimeout(function() { modal.style.animation = ''; }, 10);
        setTimeout(function() { modal.classList.add('hidden'); }, 2800);
    }

    function checkAndUnlock() {
        // コードモード完了フラグを自動セット
        if (window.app && window.app.currentPlanet === 'code') {
            localStorage.setItem('cosmicTyping_codeDone', '1');
        }
        var stats = getCurrentStats();
        var unlocked = getUnlocked();
        var newDefs = [];
        DEFS.forEach(function (def) {
            if (unlocked.indexOf(def.id) === -1 && def.check(stats)) {
                unlocked.push(def.id);
                newDefs.push(def);
            }
        });
        if (newDefs.length > 0) {
            localStorage.setItem(KEY, JSON.stringify(unlocked));
            newDefs.forEach(function (def, i) {
                setTimeout(function () { showAchievementModal(def); }, 300 + i * 3200);
            });
        }
        renderAchievements(unlocked);
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderAchievements(getUnlocked());
        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function (muts) {
                muts.forEach(function (m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        setTimeout(checkAndUnlock, 200);
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });

    window.AchievementUnlocker = { check: checkAndUnlock };
})();

// ==========================================
// P1-2: 最近の発見リスト（DiscoveryManager）
// ==========================================
(function DiscoveryManager() {
    var KEY = 'cosmicTyping_discoveries';
    var MAX = 5;
    var PLANET_NAMES = {
        earth: '🌍 地球', mars: '🔴 火星', jupiter: '🪐 木星',
        saturn: '🪐 土星', code: '💻 コード', basic: '📚 基礎',
        exploration: '🚀 探索', speed: '⚡ 高速', accuracy: '🎯 精密', survival: '💀 サバイバル'
    };

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
    }

    function addDiscovery(planet, wpm) {
        var list = load();
        var now = new Date();
        var time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        var date = now.toISOString().split('T')[0]; // 日付をISO形式で保存
        list.unshift({ planet: planet, wpm: wpm, time: time, date: date });
        if (list.length > MAX) list = list.slice(0, MAX);
        localStorage.setItem(KEY, JSON.stringify(list));
        render(list);
        // P1-1: 発見した惑星カウント更新
        var cnt = Math.min(12, parseInt(localStorage.getItem('cosmicTyping_planetCount') || 0) + 1);
        localStorage.setItem('cosmicTyping_planetCount', cnt);
        var pdEl = document.getElementById('planetsDiscovered');
        if (pdEl) pdEl.textContent = cnt + '/12';
        var expBar = document.getElementById('explorationBar');
        if (expBar) expBar.style.width = Math.round(cnt / 12 * 100) + '%';
        var tpEl = document.getElementById('totalPlanets');
        if (tpEl) tpEl.textContent = cnt;
    }

    function render(list) {
        var el = document.getElementById('discoveryList');
        if (!el) return;
        if (list.length === 0) {
            el.innerHTML = '<div class="text-sm text-gray-400 text-center py-4">まだ発見はありません<br>タイピングで宇宙を探索しよう！</div>';
            return;
        }
        el.innerHTML = list.map(function(d) {
            var name = PLANET_NAMES[d.planet] || ('🪐 ' + d.planet);
            return '<div class="flex justify-between items-center text-sm py-1 border-b border-gray-700">' +
                '<span>' + name + '</span>' +
                '<span class="text-energy-green font-bold">' + (d.wpm || 0) + ' WPM</span>' +
                '<span class="text-gray-500 text-xs">' + d.time + '</span>' +
                '</div>';
        }).join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
        render(load());
        ['resultsPanel', 'timeAttackResults'].forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function(muts) {
                muts.forEach(function(m) {
                    var t = m.target;
                    if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                        setTimeout(function() {
                            var planet = (window.app && window.app.currentPlanet) || 'unknown';
                            var wpmEl = t.querySelector('[id="finalWPM"],[id="ta-finalWPM"]');
                            var wpm = wpmEl ? parseFloat(wpmEl.textContent || 0) : 0;
                            if (wpm > 0) addDiscovery(planet, wpm.toFixed(1));
                            // コードモード完了フラグ
                            if (planet === 'code') localStorage.setItem('cosmicTyping_codeDone', '1');
                        }, 150);
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();

// ==========================================
// P0-1: 宇宙船ステータスバー リアルタイム更新
// ==========================================
(function SidebarUpdater() {
    var interval = null;

    function update() {
        var wpmEl = document.getElementById('liveWPM');
        var accEl = document.getElementById('liveAccuracy');
        var wpm = wpmEl ? parseFloat(wpmEl.textContent) || 0 : 0;
        var acc = accEl ? parseFloat(accEl.textContent) || 100 : 100;
        var speedBar = document.getElementById('speedBar');
        var fuelBar = document.getElementById('fuelBar');
        var shieldBar = document.getElementById('shieldBar');
        var wpmDisp = document.getElementById('currentWPM');
        var accDisp = document.getElementById('currentAccuracy');
        var comboDisp = document.getElementById('currentCombo');
        if (speedBar) speedBar.style.width = Math.min(100, wpm / 1.5).toFixed(1) + '%';
        if (fuelBar) fuelBar.style.width = Math.min(100, acc).toFixed(1) + '%';
        // ライブコンボの取得元がないためシールドバーは精度で代替
        if (shieldBar) shieldBar.style.width = Math.min(100, acc).toFixed(1) + '%';
        if (wpmDisp) wpmDisp.textContent = wpm.toFixed(1) + ' WPM';
        if (accDisp) accDisp.textContent = acc.toFixed(1) + '%';
        // comboはセッション完了時にのみ確定するため「−」表示
        if (comboDisp && comboDisp.textContent === '0x') comboDisp.textContent = '−';
    }

    function start() { if (!interval) interval = setInterval(update, 250); }
    function stop() {
        if (interval) { clearInterval(interval); interval = null; }
        var speedBar = document.getElementById('speedBar');
        if (speedBar) speedBar.style.width = '0%';
    }

    document.addEventListener('DOMContentLoaded', function() {
        var startBtn = document.getElementById('startBtn');
        if (startBtn) startBtn.addEventListener('click', function() { setTimeout(start, 400); });
        document.querySelectorAll('.time-attack-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { setTimeout(start, 400); });
        });
        ['resultsPanel','timeAttackResults'].forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function(muts) {
                muts.forEach(function(m) {
                    if (m.target.style.display !== 'none' && !m.target.classList.contains('hidden')) stop();
                });
            }).observe(el, { attributes: true, attributeFilter: ['style','class'] });
        });
    });
})();

// ==========================================
// P0-2: コンボトラッカー（通常モード対応）
// ==========================================
(function ComboTracker() {
    var combo = 0;
    var maxCombo = 0;

    document.addEventListener('DOMContentLoaded', function() {
        var inp = document.getElementById('typingInput');
        if (!inp) return;

        inp.addEventListener('input', function() {
            var text = (window.app && window.app.typingEngine && window.app.typingEngine.currentText)
                ? window.app.typingEngine.currentText
                : (document.getElementById('textDisplay') ? document.getElementById('textDisplay').textContent.trim() : '');
            if (!text) return;
            var typed = inp.value;
            var expected = text.substring(0, typed.length);
            if (typed === expected && typed.length > 0) {
                combo++;
                if (combo > maxCombo) maxCombo = combo;
            } else if (typed !== expected) {
                combo = 0;
            }
            var comboDisp = document.getElementById('currentCombo');
            if (comboDisp) comboDisp.textContent = combo > 0 ? combo + 'x' : '−';
        });

        // スタートボタンでリセット
        var startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                combo = 0; maxCombo = 0;
                var comboDisp = document.getElementById('currentCombo');
                if (comboDisp) comboDisp.textContent = '−';
            });
        }

        // 結果表示時に最大コンボをfinalComboに反映
        var panel = document.getElementById('resultsPanel');
        if (panel) {
            new MutationObserver(function(muts) {
                muts.forEach(function(m) {
                    if (m.target.style.display !== 'none' && !m.target.classList.contains('hidden')) {
                        var finalComboEl = document.getElementById('finalCombo');
                        if (finalComboEl) finalComboEl.textContent = maxCombo + 'x';
                        // 次セッション用にリセット（表示後）
                        setTimeout(function() { combo = 0; maxCombo = 0; }, 500);
                    }
                });
            }).observe(panel, { attributes: true, attributeFilter: ['style', 'class'] });
        }
    });
})();

// ==========================================
// P1-3: 前回セッション比較（WPM差分表示）
// ==========================================
(function LastSessionCompare() {
    var KEY_LAST = 'cosmicTyping_lastSessionWPM';

    function showDiff(currentWPM) {
        var last = parseFloat(localStorage.getItem(KEY_LAST) || 0);
        var diffEl = document.getElementById('wpmDiff');
        if (diffEl) {
            if (last > 0) {
                var diff = (currentWPM - last).toFixed(1);
                diffEl.textContent = (diff >= 0 ? '▲+' : '▼') + Math.abs(diff) + ' WPM（前回比）';
                diffEl.style.color = diff >= 0 ? '#10b981' : '#ef4444';
                diffEl.classList.remove('hidden');
            } else {
                diffEl.classList.add('hidden');
            }
        }
        if (currentWPM > 0) localStorage.setItem(KEY_LAST, currentWPM.toFixed(1));
    }

    document.addEventListener('DOMContentLoaded', function() {
        var panel = document.getElementById('resultsPanel');
        if (!panel) return;
        new MutationObserver(function(muts) {
            muts.forEach(function(m) {
                if (m.target.style.display !== 'none' && !m.target.classList.contains('hidden')) {
                    setTimeout(function() {
                        var wpmEl = document.getElementById('finalWPM');
                        var wpm = wpmEl ? parseFloat(wpmEl.textContent || 0) : 0;
                        if (wpm > 0) showDiff(wpm);
                    }, 250);
                }
            });
        }).observe(panel, { attributes: true, attributeFilter: ['style', 'class'] });
    });
})();

// ==========================================
// P3-1: カウントダウン（3・2・1・GO!）
// ==========================================
(function CountdownManager() {
    var overlay = null;
    var active = false;

    function ensureOverlay() {
        if (overlay && document.getElementById('countdownOverlay')) return;
        overlay = document.createElement('div');
        overlay.id = 'countdownOverlay';
        overlay.style.cssText = 'position:absolute;inset:0;background:rgba(10,10,26,0.88);display:none;align-items:center;justify-content:center;z-index:20;border-radius:8px;font-family:Orbitron,monospace;pointer-events:none;';
        overlay.innerHTML = '<span id="countdownNum" style="font-size:3.5rem;font-weight:900;color:#06b6d4;text-shadow:0 0 24px #06b6d4;transition:color 0.2s;"></span>';
        var td = document.getElementById('typingInterface');
        if (td) { td.style.position = 'relative'; td.appendChild(overlay); }
    }

    function show(onDone) {
        ensureOverlay();
        active = true;
        overlay.style.display = 'flex';
        var nums = ['3','2','1','GO!'];
        var idx = 0;
        (function tick() {
            if (idx >= nums.length) { overlay.style.display = 'none'; active = false; onDone(); return; }
            var numEl = document.getElementById('countdownNum');
            if (numEl) {
                numEl.textContent = nums[idx];
                numEl.style.color = nums[idx] === 'GO!' ? '#10b981' : '#06b6d4';
                numEl.style.textShadow = nums[idx] === 'GO!' ? '0 0 24px #10b981' : '0 0 24px #06b6d4';
            }
            idx++; setTimeout(tick, 700);
        })();
    }

    document.addEventListener('DOMContentLoaded', function() {
        var startBtn = document.getElementById('startBtn');
        if (!startBtn) return;
        // キャプチャフェーズで先行実行し、app.jsのstartPractice()をブロック
        startBtn.addEventListener('click', function(e) {
            var ti = document.getElementById('typingInterface');
            if (!ti || ti.classList.contains('hidden')) return;
            // カウントダウン中の重複クリック防止
            if (active) { e.stopImmediatePropagation(); return; }
            e.stopImmediatePropagation(); // app.jsのlistenerをブロック
            var inp = document.getElementById('typingInput');
            if (inp) inp.disabled = true;
            show(function() {
                // GO!後にタイマー開始（WPM計測の正確性を保証）
                if (window.app) window.app.startPractice();
                if (inp) {
                    inp.disabled = false;
                    inp.focus();
                }
            });
        }, true); // capture=trueでonclick属性より先に実行
    });
})();

// ==========================================
// P2-2: WPM目標設定マネージャー
// ==========================================
(function WpmTargetManager() {
    var KEY = 'cosmicTyping_wpmTarget';
    var notified = false;

    function getTarget() { return parseInt(localStorage.getItem(KEY) || 0); }

    function checkTarget(currentWPM) {
        var target = getTarget();
        if (!target || currentWPM <= 0) return;
        var wpmDisp = document.getElementById('liveWPM');
        if (!wpmDisp) return;
        if (currentWPM >= target) {
            wpmDisp.style.color = '#f59e0b';
            wpmDisp.style.textShadow = '0 0 8px #f59e0b';
            if (!notified) {
                notified = true;
                if (typeof showToast === 'function') showToast('🎯 目標WPM ' + target + ' 達成！');
            }
        } else {
            wpmDisp.style.color = '';
            wpmDisp.style.textShadow = '';
        }
    }

    // SidebarUpdaterのupdateに相乗りして定期チェック
    document.addEventListener('DOMContentLoaded', function() {
        setInterval(function() {
            var el = document.getElementById('liveWPM');
            if (!el) return;
            var wpm = parseFloat(el.textContent) || 0;
            checkTarget(wpm);
        }, 500);

        // セッション開始時にリセット
        var startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', function() { notified = false; });
        }
    });

    window.WpmTargetManager = { getTarget: getTarget, setTarget: function(v) { localStorage.setItem(KEY, String(parseInt(v)||0)); } };
})();

// ==========================================
// P2: タイムアタック残り時間の視覚警告
// ==========================================
(function TimeAttackUrgencyManager() {
    var urgencyInterval = null;
    var BLINK_CSS = 'ta-urgent-blink';

    function addBlinkStyle() {
        if (document.getElementById('taUrgencyStyle')) return;
        var s = document.createElement('style');
        s.id = 'taUrgencyStyle';
        s.textContent = '@keyframes taUrgentBlink { 0%,100%{opacity:1} 50%{opacity:0.35} } .ta-urgent-blink { animation: taUrgentBlink 0.6s ease-in-out infinite !important; }';
        document.head.appendChild(s);
    }

    function startUrgencyWatch() {
        addBlinkStyle();
        if (urgencyInterval) clearInterval(urgencyInterval);
        urgencyInterval = setInterval(function() {
            var timerEl = document.getElementById('timeAttackTimer');
            if (!timerEl) return;
            var text = timerEl.textContent || '';
            var parts = text.split(':');
            var secs = 0;
            if (parts.length === 2) {
                secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            } else {
                secs = parseInt(text);
            }
            if (isNaN(secs)) return;
            if (secs <= 0) {
                timerEl.style.color = '';
                timerEl.classList.remove(BLINK_CSS);
                clearInterval(urgencyInterval);
                urgencyInterval = null;
            } else if (secs <= 5) {
                timerEl.style.color = '#ef4444';
                timerEl.classList.add(BLINK_CSS);
            } else if (secs <= 10) {
                timerEl.style.color = '#f97316';
                timerEl.classList.remove(BLINK_CSS);
            } else {
                timerEl.style.color = '';
                timerEl.classList.remove(BLINK_CSS);
            }
        }, 250);
    }

    function stopUrgencyWatch() {
        if (urgencyInterval) { clearInterval(urgencyInterval); urgencyInterval = null; }
        var timerEl = document.getElementById('timeAttackTimer');
        if (timerEl) { timerEl.style.color = ''; timerEl.classList.remove(BLINK_CSS); }
    }

    document.addEventListener('DOMContentLoaded', function() {
        // タイムアタックボタンクリックで監視開始
        document.querySelectorAll('.time-attack-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                setTimeout(startUrgencyWatch, 500);
            });
        });
        // 結果表示時に停止
        ['timeAttackResults', 'missionSelection'].forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;
            new MutationObserver(function(muts) {
                muts.forEach(function(m) {
                    if (!m.target.classList.contains('hidden') && m.target.style.display !== 'none') {
                        stopUrgencyWatch();
                    }
                });
            }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });
})();

// ==========================================
// P4: 結果画面ランクバッジカラー
// ==========================================
(function RankBadgeManager() {
    var RANK_STYLES = {
        'S': { bg: 'linear-gradient(135deg,#b45309,#f59e0b)', color: '#fff', shadow: '0 0 12px #f59e0b' },
        'A': { bg: 'linear-gradient(135deg,#065f46,#10b981)', color: '#fff', shadow: '0 0 12px #10b981' },
        'B': { bg: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', color: '#fff', shadow: '0 0 12px #3b82f6' },
        'C': { bg: 'linear-gradient(135deg,#78350f,#fbbf24)', color: '#1a1a2e', shadow: '0 0 8px #fbbf24' },
        'D': { bg: 'linear-gradient(135deg,#1f2937,#4b5563)', color: '#9ca3af', shadow: 'none' }
    };

    function applyRankStyle(el, rankText) {
        var rank = (rankText || '').replace(/[^SABCD]/g, '');
        var style = RANK_STYLES[rank];
        if (!style || !el) return;
        el.style.background = style.bg;
        el.style.webkitBackgroundClip = 'text';
        el.style.webkitTextFillColor = style.color;
        el.style.textShadow = style.shadow;
        el.style.display = 'inline-block';
        el.style.padding = '4px 16px';
        el.style.borderRadius = '8px';
        el.style.background = style.bg;
        el.style.webkitBackgroundClip = '';
        el.style.webkitTextFillColor = '';
        el.style.color = style.color;
    }

    document.addEventListener('DOMContentLoaded', function() {
        var el = document.getElementById('performanceRating');
        if (!el) return;
        new MutationObserver(function() {
            applyRankStyle(el, el.textContent);
        }).observe(el, { childList: true, characterData: true, subtree: true });
    });
})();
