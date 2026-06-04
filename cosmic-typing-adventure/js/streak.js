// 連続練習ストリーク管理
window.StreakManager = (function () {
    const STORAGE_KEY = 'cosmicTyping_streak';

    function getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
                lastDate: null,
                count: 0,
                maxCount: 0
            };
        } catch (e) {
            return { lastDate: null, count: 0, maxCount: 0 };
        }
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function recordSession() {
        const data = load();
        const today = getTodayDate();

        if (data.lastDate === today) return; // 本日分は記録済み

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (data.lastDate === yesterdayStr) {
            data.count += 1;
        } else {
            data.count = 1; // 連続途切れまたは初回
        }

        data.lastDate = today;
        data.maxCount = Math.max(data.count, data.maxCount || 0);
        save(data);
        updateDisplay();
    }

    function updateDisplay() {
        const data = load();
        const countEl = document.getElementById('streakCount');
        const displayEl = document.getElementById('streakDisplay');
        if (countEl) countEl.textContent = data.count;
        if (displayEl && data.count > 0) {
            displayEl.classList.remove('hidden');
        }
    }

    // 結果パネルの表示を監視してセッションを自動記録
    function observeResults() {
        ['resultsPanel', 'timeAttackResults'].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new MutationObserver(function (mutations) {
                mutations.forEach(function (m) {
                    if (m.type === 'attributes') {
                        const t = m.target;
                        if (t.style.display !== 'none' && !t.classList.contains('hidden')) {
                            recordSession();
                        }
                    }
                });
            });
            obs.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateDisplay();
        observeResults();
    });

    return { recordSession: recordSession, getStreak: function () { return load().count; }, getMaxStreak: function () { return load().maxCount; } };
})();
