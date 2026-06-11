// Main App Logic for Cosmic Typing Adventure

import { TypingEngine } from './typing-engine.js';
import { LanguageManager } from './language-manager.js';
import { SoundManager } from './sound-manager.js';
import { initUtils } from './common.js';
import { initializeSupabase, TypingStats, PracticeTexts } from './supabase-config.js';
import { AchievementSystem } from './achievement-system.js';
import { ShipUpgradeSystem } from './ship-upgrade-system.js';
import { SecurityUtils } from './security-utils.js';
import { logger } from './logger.js';
import { DOMUtils } from './dom-utils.js';
import { errorHandler } from './error-handler.js';
import { GameModeManager, LeaderboardManager, formatModeResults } from './game-mode-manager.js';
import { AdvancedAnalytics } from './advanced-analytics.js';
import { syncManager } from './sync-manager.js';
import { syncUI } from './sync-ui.js';

export class CosmicTypingApp {
  constructor() {
    this.soundManager = new SoundManager();
    this.languageManager = new LanguageManager();
    this.currentPlanet = null;
    this.typingEngine = null;
    this.currentText = "";
    this.isPracticeActive = false;
    this.userInput = '';
    this.supabaseClient = null;

    // User stats initialization
    this.userStats = {
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      totalWPM: 0
    };

    // Initialize systems
    this.achievementSystem = new AchievementSystem(this.userStats);
    this.shipUpgradeSystem = new ShipUpgradeSystem(this.soundManager, this.userStats);
    this.gameModeManager = new GameModeManager();
    this.leaderboardManager = null; // Initialized after Supabase
    this.advancedAnalytics = new AdvancedAnalytics();

    // リアルタイムWPMグラフ用
    this._wpmHistory = [];
    this._liveChart = null;
    this._taLiveChart = null;

    // Make app available globally
    window.app = this;

    // DOM elements
    this.elements = {
      planetSelection: null,
      typingPractice: null,
      results: null,
      planetCards: null,
      currentPlanetImage: null,
      currentPlanetName: null,
      textDisplay: null,
      typingInput: null,
      wpmDisplay: null,
      accuracyDisplay: null,
      elapsedTimeDisplay: null,
      progressFill: null,
      startBtn: null,
      pauseBtn: null,
      resetBtn: null,
      backToPlanetsBtn: null,
      finalWpmDisplay: null,
      finalAccuracyDisplay: null,
      totalTypedDisplay: null,
      totalErrorsDisplay: null,
      saveResultBtn: null,
      retryPracticeBtn: null,
      backToPlanetsFromResultsBtn: null,
    };

    // Practice texts for each planet
    // ローカルpracticeTextsの定義は削除

    // Initialize app
    this.init();

    // Run common utils initialization
    initUtils();
  }

  async init() {
    try {
      // Initialize Supabase first
      await this.initSupabase();

      // Initialize sync system
      this.initSyncSystem();

      // Initialize DOM and other components
      this.getDOMElements();
      this.setupEventListeners();
      this.initializeTypingEngine();
      this.showPlanetSelection();

      logger.info("CosmicTypingApp initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize CosmicTypingApp:", error);
      errorHandler.handleError(error, {
        userMessage: 'アプリケーションの初期化に失敗しました。オフラインモードで起動します。',
        showNotification: false
      });
      // Continue with offline functionality
      this.getDOMElements();
      this.setupEventListeners();
      this.initializeTypingEngine();
      this.showPlanetSelection();
    }
  }

  async initSupabase() {
    try {
      // Wait for DOM to be ready
      await DOMUtils.ready();

      // Initialize Supabase
      const success = await initializeSupabase();
      if (success) {
        logger.info("Supabase initialized successfully");

        // No Supabase: use local leaderboard only
        this.leaderboardManager = new LeaderboardManager(null);

        // Test connection with fallback
        await this.testSupabaseConnection();
      } else {
        logger.warn("Supabase initialization failed, continuing with offline mode");
        this.leaderboardManager = new LeaderboardManager(null);
      }
    } catch (error) {
      logger.error("Supabase initialization error:", error);
      // Continue with offline functionality
      this.leaderboardManager = new LeaderboardManager(null);
    }
  }

  /**
   * Initialize sync system
   */
  initSyncSystem() {
    try {
      logger.info("Initializing sync system...");
      
      // Initialize sync UI
      syncUI.initialize();
      
      logger.info("Sync system initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize sync system:", error);
      // Continue without sync UI (core functionality still works)
    }
  }

  async testSupabaseConnection() {
    try {
      if (TypingStats) {
        const history = await TypingStats.getHistory(1);
        logger.debug("[Supabaseテスト] 接続成功, 履歴サンプル:", history);
      }
    } catch (error) {
      logger.warn("[Supabaseテスト] 接続テスト失敗:", error);
      // Continue with offline functionality
    }
  }

  getDOMElements() {
    // Fallback対応: 新旧どちらのIDでも取得できるようにする
    this.elements.planetSelection =
      document.getElementById("planet-selection") ||
      document.getElementById("missionSelection");
    this.elements.typingPractice =
      document.getElementById("typing-practice") ||
      document.getElementById("typingInterface");
    this.elements.results =
      document.getElementById("results") ||
      document.getElementById("resultsPanel");
    this.elements.planetCards = document.querySelectorAll(".planet-card");
    this.elements.currentPlanetImage = document.getElementById(
      "current-planet-image",
    );
    this.elements.currentPlanetName = document.getElementById(
      "current-planet-name",
    );
    this.elements.textDisplay =
      document.getElementById("text-display") ||
      document.getElementById("textDisplay");
    this.elements.typingInput =
      document.getElementById("typing-input") ||
      document.getElementById("typingInput");
    this.elements.wpmDisplay =
      document.getElementById("wpm") ||
      document.getElementById("liveWPM") ||
      document.getElementById("currentWPM");
    this.elements.accuracyDisplay =
      document.getElementById("accuracy") ||
      document.getElementById("liveAccuracy") ||
      document.getElementById("currentAccuracy");
    this.elements.elapsedTimeDisplay =
      document.getElementById("elapsed-time") ||
      document.getElementById("gameTimer");
    this.elements.progressFill =
      document.getElementById("progress-fill") ||
      document.getElementById("speedBar");
    this.elements.startBtn =
      document.getElementById("start-btn") ||
      document.getElementById("startBtn");
    this.elements.pauseBtn =
      document.getElementById("pause-btn") ||
      document.getElementById("pauseBtn");
    this.elements.resetBtn =
      document.getElementById("reset-btn") ||
      document.getElementById("resetBtn");
    this.elements.backToPlanetsBtn =
      document.getElementById("back-to-planets") ||
      document.getElementById("backToMissionSelection");
    this.elements.finalWpmDisplay =
      document.getElementById("final-wpm") ||
      document.getElementById("finalWPM");
    this.elements.finalAccuracyDisplay =
      document.getElementById("final-accuracy") ||
      document.getElementById("finalAccuracy");
    this.elements.totalTypedDisplay =
      document.getElementById("total-typed") ||
      document.getElementById("totalTyped");
    this.elements.totalErrorsDisplay = document.getElementById("total-errors");
    this.elements.saveResultBtn = document.getElementById("save-result");
    this.elements.retryPracticeBtn = document.getElementById("retry-practice");
    this.elements.backToPlanetsFromResultsBtn = document.getElementById(
      "back-to-planets-from-results",
    );
    // New HUD elements
    this.elements.survivalLivesDisplay = document.getElementById("survivalLives");
    this.elements.survivalLivesContainer = document.getElementById("survivalLivesContainer");
  }

  setupEventListeners() {
    // Planet selection
    if (this.elements.planetCards) {
      this.elements.planetCards.forEach((card) => {
        card.addEventListener("click", () => {
          const planet = card.dataset.planet;
          this.selectPlanet(planet);
        });
      });
    }

    // Practice controls
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener("click", () =>
        this.startPractice(),
      );
    }
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener("click", () =>
        this.pausePractice(),
      );
    }
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener("click", () =>
        this.resetPractice(),
      );
    }
    if (this.elements.backToPlanetsBtn) {
      this.elements.backToPlanetsBtn.addEventListener("click", () =>
        this.showPlanetSelection(),
      );
    }

    // Results controls
    if (this.elements.saveResultBtn) {
      this.elements.saveResultBtn.addEventListener("click", () =>
        this.saveResult(),
      );
    }
    if (this.elements.retryPracticeBtn) {
      this.elements.retryPracticeBtn.addEventListener("click", () =>
        this.retryPractice(),
      );
    }
    if (this.elements.backToPlanetsFromResultsBtn) {
      this.elements.backToPlanetsFromResultsBtn.addEventListener("click", () =>
        this.showPlanetSelection(),
      );
    }

    // Time Attack Buttons
    const timeAttackBtns = document.querySelectorAll('.time-attack-btn');
    timeAttackBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const time = parseInt(btn.dataset.timeAttack);
        this.startTimeAttack(time);
      });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            if (this.isPracticeActive) {
              this.startPractice();
            }
            break;
          case "r":
            e.preventDefault();
            this.resetPractice();
            break;
          case "Escape":
            e.preventDefault();
            this.showPlanetSelection();
            break;
        }
      }
    });
  }

  initializeTypingEngine() {
    this.typingEngine = new TypingEngine(this.soundManager);
    this.typingEngine.init({
      textDisplay: this.elements.textDisplay,
      typingInput: this.elements.typingInput,
      wpmDisplay: this.elements.wpmDisplay,
      accuracyDisplay: this.elements.accuracyDisplay,
      timerDisplay: this.elements.elapsedTimeDisplay,
      progressBar: this.elements.progressFill,
      survivalLivesDisplay: this.elements.survivalLivesDisplay,
      inputHintDisplay: document.getElementById('inputHintDisplay'),
      currentInputDisplay: document.getElementById('currentInputDisplay'),
    });

    this.typingEngine.setCallbacks({
      onProgress: (stats) => this.onTypingProgress(stats),
      onComplete: (results) => this.onTypingComplete(results),
      onError: (error) => this.onTypingError(error),
    });
  }

  startTimeAttack(seconds) {
    this.currentPlanet = 'timeAttack'; // Pseudo planet name
    // P2: もう一度用に記録
    localStorage.setItem('cosmicTyping_lastTimeAttack', String(seconds));

    this.typingEngine.mode = 'timeAttack';
    this.typingEngine.timeLimit = seconds;

    // Hide Survival UI
    if (this.elements.survivalLivesContainer) this.elements.survivalLivesContainer.classList.add('hidden');

    this.loadPracticeText('jupiter'); // Use Jupiter text for speed/time attack for now
    this.updatePlanetInfo('jupiter');

    // Update Timer Display immediately if needed
    if (this.elements.elapsedTimeDisplay) {
      const minutes = Math.floor(seconds / 60);
      const secondsRem = seconds % 60;
      this.elements.elapsedTimeDisplay.textContent =
        `${minutes.toString().padStart(2, '0')}:${secondsRem.toString().padStart(2, '0')}`;
    }

    this.showTypingPractice();
  }

  selectPlanet(planet) {
    this.currentPlanet = planet;

    // Set Mode
    if (planet === 'survival') {
      this.typingEngine.mode = 'survival';
      this.typingEngine.lives = 3;
      this.typingEngine.maxLives = 3;

      // Show Survival UI, Hide others if specific
      if (this.elements.survivalLivesContainer) this.elements.survivalLivesContainer.classList.remove('hidden');
    } else if (planet === 'timeAttack') {
      this.typingEngine.mode = 'timeAttack';
      // Hide Survival UI
      if (this.elements.survivalLivesContainer) this.elements.survivalLivesContainer.classList.add('hidden');
    } else {
      this.typingEngine.mode = 'normal';
      // Hide Survival UI
      if (this.elements.survivalLivesContainer) this.elements.survivalLivesContainer.classList.add('hidden');
    }

    this.loadPracticeText(planet === 'survival' ? 'earth' : planet); // Reuse Earth text for now or add specific
    this.updatePlanetInfo(planet === 'survival' ? 'earth' : planet); // Reuse Earth info
    this.showTypingPractice();
  }

  loadPracticeText(planet) {
    // LanguageManagerからテキスト取得
    const textObj = this.languageManager.getPracticeText(planet);
    if (textObj) {
      this.currentText = textObj.content || textObj.text || textObj;
      this.elements.textDisplay.textContent = this.currentText;
      // ローマ字表記を下に追加
      let romanized = this.currentText;
      let romanElem = document.getElementById('romanized-text');
      if (!romanElem) {
        romanElem = document.createElement('div');
        romanElem.id = 'romanized-text';
        romanElem.style.fontSize = '0.9em';
        romanElem.style.color = '#888';
        romanElem.style.marginTop = '0.3em';
        this.elements.textDisplay.parentNode.insertBefore(romanElem, this.elements.textDisplay.nextSibling);
      }
      romanElem.textContent = romanized;
    } else {
      this.currentText = "この惑星のテキストが見つかりませんでした。";
      this.elements.textDisplay.textContent = this.currentText;
      let romanElem = document.getElementById('romanized-text');
      if (romanElem) romanElem.textContent = '';
    }
  }

  updatePlanetInfo(planet) {
    const planetInfo = {
      earth: { name: "地球", image: "images/planets/earth.jpg" },
      mars: { name: "火星", image: "images/planets/mars.jpg" },
      jupiter: { name: "木星", image: "images/planets/jupiter.jpg" },
      saturn: { name: "土星", image: "images/planets/saturn.jpg" },
    };

    const info = planetInfo[planet];
    if (info) {
      this.elements.currentPlanetName.textContent = info.name;
      if (this.elements.currentPlanetImage) {
        this.elements.currentPlanetImage.src = info.image;
        this.elements.currentPlanetImage.alt = info.name;
      }
    }
  }

  showPlanetSelection() {
    this.hideAllSections();
    if (this.elements.planetSelection) {
      this.elements.planetSelection.style.display = "block";
    }
    this.isPracticeActive = false;
    this.updateButtonStates();
  }

  showTypingPractice() {
    this.hideAllSections();
    if (this.elements.typingPractice) {
      this.elements.typingPractice.style.display = "block";
    }
    this.typingEngine.reset();
    // ローマ字表記もリセット・再表示
    this.updateRomanizedText();
    this.updateButtonStates();
  }

  showResults(results) {
    this.hideAllSections();
    // P4: 前回のアドバイスをリセット
    const advEl = document.getElementById('sessionAdvice');
    if (advEl) advEl.classList.add('hidden');

    // P2: タイムアタックは専用結果パネルを使用
    if (results.mode === 'timeAttack') {
      this._showTimeAttackResults(results);
      return;
    }

    // P2-b: セレブレーション演出（完了時のみ）
    if (results.cause !== 'death' && results.cause !== 'timeout') {
      this.triggerCelebration();
    }

    if (this.elements.results) {
      this.elements.results.style.display = "block";

      const titleElem = this.elements.results.querySelector('h3');
      if (titleElem) {
        if (results.cause === 'death') {
          titleElem.textContent = "MISSION FAILED";
          titleElem.style.color = "#ef4444";
        } else if (results.cause === 'timeout') {
          titleElem.textContent = "TIME UP!";
          titleElem.style.color = "#fbbf24";
        } else {
          titleElem.textContent = "ミッション完了!";
          titleElem.style.color = "var(--cosmic-cyan)";
        }
      }
    }

    if (this.elements.finalWpmDisplay) {
      this.elements.finalWpmDisplay.textContent = results.wpm.toFixed(1);
    }
    if (this.elements.finalAccuracyDisplay) {
      this.elements.finalAccuracyDisplay.textContent = results.accuracy.toFixed(1);
    }
    if (this.elements.totalTypedDisplay) {
      this.elements.totalTypedDisplay.textContent = results.totalTyped;
    }
    if (this.elements.totalErrorsDisplay) {
      this.elements.totalErrorsDisplay.textContent = results.totalErrors;
    }

    // M4-P1: 自己ベスト記録の確認と前回比較
    const prevBestWPM = parseFloat(localStorage.getItem('cosmicTyping_bestWPM') || '0');
    const wpmDiffEl = document.getElementById('wpmDiff');
    const bestBannerEl = document.getElementById('bestScoreBanner');

    if (wpmDiffEl) {
      if (prevBestWPM > 0) {
        const diff = Math.round((results.wpm - prevBestWPM) * 10) / 10;
        wpmDiffEl.textContent = diff >= 0 ? '▲ +' + diff + ' WPM' : '▼ ' + diff + ' WPM';
        wpmDiffEl.style.color = diff >= 0 ? '#4ade80' : '#f87171';
        wpmDiffEl.classList.remove('hidden');
      } else {
        wpmDiffEl.classList.add('hidden');
      }
    }

    // 自己ベスト更新時にバナーを表示
    if (results.wpm > prevBestWPM && bestBannerEl) {
      bestBannerEl.classList.remove('hidden');
    } else if (bestBannerEl) {
      bestBannerEl.classList.add('hidden');
    }

    // M4-P1: グラフを初期化・描画
    this._initResultCharts(results);

    this.updateButtonStates();
  }

  // P2: タイムアタック専用結果表示
  _showTimeAttackResults(results) {
    const panel = document.getElementById('timeAttackResults');
    if (!panel) return;
    panel.style.display = 'block';

    // パフォーマンス評価（rank）
    const ratingEl = document.getElementById('performanceRating');
    if (ratingEl) {
      ratingEl.textContent = (results.rank || 'C') + '級';
      ratingEl.style.color = results.rankColor || '#9ca3af';
    }

    // 各統計値（重複ID回避のためta-プレフィックス付きIDを使用）
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('ta-finalWPM', results.wpm.toFixed(1));
    set('ta-finalAccuracy', results.accuracy.toFixed(1) + '%');
    set('ta-finalCombo', (results.combo || 0) + 'x');
    set('timeUsed', Math.round(results.timeUsed || results.duration || 0) + '秒');
    set('totalTyped', results.totalTyped || 0);

    // P4: 前回WPM比較バッジ
    const timeKey = window._lastTimeLimit || parseInt(localStorage.getItem('cosmicTyping_lastTimeAttack') || '60');
    const prevKey = 'cosmicTyping_bestTA_' + timeKey;
    const prevWpm = parseFloat(localStorage.getItem(prevKey) || '0');
    const diffEl = document.getElementById('ta-wpmDiff');
    if (diffEl) {
      if (prevWpm > 0) {
        const diff = Math.round((results.wpm - prevWpm) * 10) / 10;
        diffEl.textContent = diff >= 0 ? '▲ +' + diff + ' WPM' : '▼ ' + diff + ' WPM';
        diffEl.style.color = diff >= 0 ? '#4ade80' : '#f87171';
        diffEl.classList.remove('hidden');
      } else {
        diffEl.classList.add('hidden');
      }
    }
    // 自己ベスト更新 + バナー表示
    const bestBanner = document.getElementById('ta-bestScoreBanner');
    if (results.wpm > prevWpm) {
      localStorage.setItem(prevKey, results.wpm.toFixed(1));
      if (bestBanner) bestBanner.classList.remove('hidden');
    } else {
      if (bestBanner) bestBanner.classList.add('hidden');
    }

    // M4-P1: タイムアタック結果用グラフを初期化
    this._initTimeAttackResultCharts(results);

    // 自己ベスト表示を更新
    const bestWpmEl = document.getElementById('ta-bestWPM');
    const currentBest = parseFloat(localStorage.getItem(prevKey) || '0');
    if (bestWpmEl) bestWpmEl.textContent = currentBest > 0 ? currentBest.toFixed(1) : '−';

    // ローカルランキングに保存（タイムアタック）
    if (typeof saveToLocalLeaderboard === 'function') {
      const rank = results.rank || 'D';
      saveToLocalLeaderboard('time_attack', results.wpm, results.accuracy, rank, timeKey);
    }

    this.updateButtonStates();
  }

  hideAllSections() {
    if (this.elements.planetSelection) {
      this.elements.planetSelection.style.display = "none";
    }
    if (this.elements.typingPractice) {
      this.elements.typingPractice.style.display = "none";
    }
    if (this.elements.results) {
      this.elements.results.style.display = "none";
    }
    // P2: タイムアタック専用UIも非表示
    const taInterface = document.getElementById('timeAttackInterface');
    if (taInterface) taInterface.style.display = "none";
    const taResults = document.getElementById('timeAttackResults');
    if (taResults) taResults.style.display = "none";
  }

  // P2-b: セレブレーション演出
  triggerCelebration() {
    const container = document.getElementById('celebrationEffectsContainer');
    if (!container) return;

    // 背景フラッシュ
    const flash = document.createElement('div');
    flash.className = 'celebration-flash';
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '999';
    container.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // パーティクル生成（6個）
    const colors = ['#06b6d4', '#a78bfa', '#fbbf24'];
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = ['⭐', '✨', '💫'][Math.floor(Math.random() * 3)];
      particle.style.left = Math.random() * 100 + '%';
      particle.style.color = colors[i % colors.length];
      particle.style.top = '-30px';
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }

    // 「完了」テキスト表示
    const text = document.createElement('div');
    text.className = 'celebration-text';
    text.textContent = '🎉 完了！';
    text.style.fontSize = window.innerWidth < 768 ? '2rem' : '3rem';
    container.appendChild(text);
    setTimeout(() => text.remove(), 1200);
  }

  startPractice() {
    if (!this.isPracticeActive) {
      this.isPracticeActive = true;
      this.typingEngine.start();
      // ローマ字表記も再表示
      this.updateRomanizedText();
      this.updateButtonStates();

      // UX改善: タイピング開始時に入力欄へ自動フォーカス
      if (this.elements.typingInput) {
        this.elements.typingInput.disabled = false;
        this.elements.typingInput.focus();
        this.elements.typingInput.classList.add('typing-active');
        this.elements.typingInput.placeholder = '📝 タイピング中... 正確に入力しましょう！';
      }

      // 視覚的フィードバック: 開始アニメーション
      if (this.elements.textDisplay) {
        this.elements.textDisplay.style.animation = 'pulse 0.3s ease-out';
        setTimeout(() => {
          if (this.elements.textDisplay) {
            this.elements.textDisplay.style.animation = '';
          }
        }, 300);
      }

      // リアルタイムWPMグラフ初期化
      this._wpmHistory = [];
      this._initLiveChart();

      this.showMessage('タイピング開始！頑張りましょう！', 'success');
    }
  }

  _initLiveChart() {
    const container = document.getElementById('wpmChartContainer');
    const canvas = document.getElementById('liveWPMChart');
    if (!container || !canvas || !window.Chart) return;
    // 「WPMグラフを表示する」設定を確認（デフォルトON）
    if (localStorage.getItem('cosmicTyping_showWpmGraph') === 'false') return;
    container.classList.remove('hidden');
    if (this._liveChart) { this._liveChart.destroy(); this._liveChart = null; }
    const ctx = canvas.getContext('2d');
    this._liveChart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'WPM',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.15)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { color: 'rgba(75,85,99,0.3)' } }
        }
      }
    });
  }

  _updateLiveChart(wpm) {
    if (!this._liveChart) return;
    const label = this._wpmHistory.length + 1 + '回';
    this._liveChart.data.labels.push(label);
    this._liveChart.data.datasets[0].data.push(Math.round(wpm));
    // 最大20点まで保持
    if (this._liveChart.data.labels.length > 20) {
      this._liveChart.data.labels.shift();
      this._liveChart.data.datasets[0].data.shift();
    }
    this._liveChart.update('none');
  }

  // M4-P1: 結果画面用グラフ初期化
  _initResultCharts(results) {
    if (!window.Chart) return;

    // 自己ベスト記録を確認
    const bestWPM = parseFloat(localStorage.getItem('cosmicTyping_bestWPM') || '0');
    if (results.wpm > bestWPM) {
      localStorage.setItem('cosmicTyping_bestWPM', results.wpm.toFixed(1));
    }

    // スコアバーグラフ
    this._drawScoreBar(results.wpm, bestWPM);
    // 正確率ゲージ
    this._drawAccuracyGauge(results.accuracy);
  }

  // WPMスコアバーを描画
  _drawScoreBar(wpm, bestWPM) {
    const canvas = document.getElementById('scoreBarChart');
    if (!canvas || !window.Chart) return;

    if (this._resultScoreChart) this._resultScoreChart.destroy();

    const ctx = canvas.getContext('2d');
    const targetWPM = 100; // 目標値
    const percentage = Math.min((wpm / targetWPM) * 100, 100);

    let color = '#9ca3af'; // グレー
    if (percentage >= 80) color = '#10b981'; // グリーン
    else if (percentage >= 50) color = '#f59e0b'; // オレンジ

    this._resultScoreChart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['WPM'],
        datasets: [{
          label: 'スコア',
          data: [wpm],
          backgroundColor: [color],
          borderRadius: 4,
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        animation: { duration: 1000, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: { max: 100, ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: 'rgba(75,85,99,0.3)' } },
          y: { ticks: { color: '#9ca3af' }, grid: { display: false } }
        }
      }
    });
  }

  // 正確率ゲージを描画
  _drawAccuracyGauge(accuracy) {
    const canvas = document.getElementById('accuracyGaugeChart');
    if (!canvas || !window.Chart) return;

    if (this._resultAccuracyChart) this._resultAccuracyChart.destroy();

    const ctx = canvas.getContext('2d');
    let color = '#ef4444'; // レッド
    if (accuracy >= 95) color = '#06b6d4'; // シアン
    else if (accuracy >= 90) color = '#10b981'; // グリーン
    else if (accuracy >= 80) color = '#f59e0b'; // オレンジ

    const remaining = 100 - accuracy;

    this._resultAccuracyChart = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['正確率', ''],
        datasets: [{
          data: [accuracy, remaining],
          backgroundColor: [color, 'rgba(75,85,99,0.3)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        cutout: '70%'
      }
    });

    // 正確率テキストを表示（グラフの中央上部に追加）
    const canvasParent = canvas.parentElement;
    if (canvasParent) {
      const label = canvasParent.querySelector('.accuracy-gauge-label');
      if (label) {
        label.textContent = `正確率 ${Math.round(accuracy)}%`;
      } else {
        const newLabel = document.createElement('div');
        newLabel.className = 'accuracy-gauge-label';
        newLabel.textContent = `正確率 ${Math.round(accuracy)}%`;
        canvas.parentElement.appendChild(newLabel);
      }
    }
  }

  // M4-P1: タイムアタック結果用グラフ初期化
  _initTimeAttackResultCharts(results) {
    if (!window.Chart) return;
    this._drawTimeAttackScoreBar(results.wpm);
    this._drawTimeAttackAccuracyGauge(results.accuracy);
  }

  // タイムアタック用スコアバー
  _drawTimeAttackScoreBar(wpm) {
    const canvas = document.getElementById('taScoreBarChart');
    if (!canvas || !window.Chart) return;

    if (this._taResultScoreChart) this._taResultScoreChart.destroy();

    const ctx = canvas.getContext('2d');
    const targetWPM = 80;
    const percentage = Math.min((wpm / targetWPM) * 100, 100);

    let color = '#9ca3af';
    if (percentage >= 80) color = '#10b981';
    else if (percentage >= 50) color = '#f59e0b';

    this._taResultScoreChart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['WPM'],
        datasets: [{
          label: 'スコア',
          data: [wpm],
          backgroundColor: [color],
          borderRadius: 4,
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        animation: { duration: 800 },
        plugins: { legend: { display: false } },
        scales: {
          x: { max: 80, ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: 'rgba(75,85,99,0.3)' } },
          y: { ticks: { color: '#9ca3af' }, grid: { display: false } }
        }
      }
    });
  }

  // タイムアタック用正確率ゲージ
  _drawTimeAttackAccuracyGauge(accuracy) {
    const canvas = document.getElementById('taAccuracyGaugeChart');
    if (!canvas || !window.Chart) return;

    if (this._taResultAccuracyChart) this._taResultAccuracyChart.destroy();

    const ctx = canvas.getContext('2d');
    let color = '#ef4444';
    if (accuracy >= 95) color = '#06b6d4';
    else if (accuracy >= 90) color = '#10b981';
    else if (accuracy >= 80) color = '#f59e0b';

    const remaining = 100 - accuracy;

    this._taResultAccuracyChart = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['正確率', ''],
        datasets: [{
          data: [accuracy, remaining],
          backgroundColor: [color, 'rgba(75,85,99,0.3)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 800 },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }

  pausePractice() {
    if (this.isPracticeActive) {
      this.isPracticeActive = false;
      this.typingEngine.pause();
      this.updateButtonStates();
      
      // UX改善: 一時停止時のビジュアルフィードバック
      if (this.elements.typingInput) {
        this.elements.typingInput.classList.remove('typing-active');
        this.elements.typingInput.disabled = true;
        this.elements.typingInput.placeholder = '⏸️ 一時停止中です';
      }
      
      this.showMessage('一時停止しました', 'info');
    }
  }

  resetPractice() {
    this.isPracticeActive = false;
    this.typingEngine.reset();
    // ローマ字表記もリセット・再表示
    this.updateRomanizedText();
    this.updateButtonStates();
    
    // UX改善: リセット時のビジュアルフィードバック
    if (this.elements.typingInput) {
      this.elements.typingInput.classList.remove('typing-active');
      this.elements.typingInput.value = '';
      this.elements.typingInput.disabled = true;
      this.elements.typingInput.placeholder = '📝 ここに入力してください。開始ボタンを押すと入力可能になります。';
    }
    
    // テキスト表示もリセット
    if (this.elements.textDisplay) {
      this.elements.textDisplay.style.animation = 'shake 0.3s ease-out';
      setTimeout(() => {
        if (this.elements.textDisplay) {
          this.elements.textDisplay.style.animation = '';
        }
      }, 300);
    }
    
    this.showMessage('リセットしました', 'info');
  }

  retryPractice() {
    this.loadPracticeText(this.currentPlanet);
    this.showTypingPractice();
  }

  updateButtonStates() {
    const startBtn = this.elements.startBtn;
    const pauseBtn = this.elements.pauseBtn;
    const resetBtn = this.elements.resetBtn;

    if (this.isPracticeActive) {
      startBtn.style.display = "none";
      pauseBtn.style.display = "inline-block";
      resetBtn.style.display = "inline-block";
    } else {
      startBtn.style.display = "inline-block";
      pauseBtn.style.display = "none";
      resetBtn.style.display = "inline-block";
    }
  }

  onTypingProgress(stats) {
    // リアルタイム統計更新
    if (this.elements.wpmDisplay) {
      this.elements.wpmDisplay.textContent = stats.wpm.toFixed(1);
    }
    if (this.elements.accuracyDisplay) {
      this.elements.accuracyDisplay.textContent = stats.accuracy.toFixed(1);
    }
    if (this.elements.elapsedTimeDisplay) {
      this.elements.elapsedTimeDisplay.textContent = stats.elapsedTime;
    }
    // リアルタイムWPMグラフ: 5文字入力ごとに更新
    if (stats.wpm > 0) {
      this._wpmHistory.push(stats.wpm);
      if (this._wpmHistory.length % 5 === 0) {
        this._updateLiveChart(stats.wpm);
      }
    }
  }

  async onTypingComplete(results) {
    this.isPracticeActive = false;
    this.updateButtonStates();

    // リアルタイムWPMグラフを非表示
    const wpmContainer = document.getElementById('wpmChartContainer');
    if (wpmContainer) wpmContainer.classList.add('hidden');
    if (this._liveChart) { this._liveChart.destroy(); this._liveChart = null; }
    this._wpmHistory = [];

    // 入力欄を無効化
    if (this.elements.typingInput) {
      this.elements.typingInput.disabled = true;
      this.elements.typingInput.classList.remove('typing-active');
      this.elements.typingInput.placeholder = '✅ 完了しました！';
    }
    
    // 完了アニメーション
    if (this.elements.textDisplay) {
      this.elements.textDisplay.style.animation = 'completionCelebration 0.5s ease-out';
      setTimeout(() => {
        if (this.elements.textDisplay) {
          this.elements.textDisplay.style.animation = '';
        }
      }, 500);
    }
    
    // モード別の結果評価
    const mode = this.typingEngine.mode || 'normal';
    results.mode = mode;
    results.timeLimit = this.typingEngine.timeLimit;
    
    // ランク評価を計算
    const rankInfo = this.gameModeManager.calculateRank(results);
    const formattedResults = formatModeResults(mode, results, rankInfo);
    
    // 結果によって異なるメッセージ
    if (results.cause === 'death') {
      this.showMessage('ミッション失敗...もう一度挑戦しましょう！', 'error');
    } else if (results.cause === 'timeout') {
      this.showMessage('タイムアップ！結果を確認しましょう', 'warning');
    } else {
      this.showMessage(`🎉 ミッション完了！ランク: ${rankInfo.rank}`, 'success');
    }
    
    // リーダーボードに保存（サバイバルとタイムアタックのみ）
    if (mode === 'survival' || mode === 'timeAttack') {
      await this.saveToLeaderboard(formattedResults);
    }
    
    this.showResults(formattedResults);

    // Record session in advanced analytics
    if (this.advancedAnalytics) {
      const analyticsData = {
        wpm: results.wpm,
        accuracy: results.accuracy,
        duration: results.duration,
        totalTyped: results.totalTyped,
        totalErrors: results.totalErrors,
        maxCombo: results.maxCombo || 0,
        weakKeys: results.weakKeys || {}
      };
      this.advancedAnalytics.recordSession(analyticsData);
    }

    // Auto-save results
    await this.saveResult();

    // P2: 実績チェック（セッション保存後に全統計で判定）
    try {
      const sessions = JSON.parse(localStorage.getItem('typing_sessions') || '[]');
      const statsForAchievement = {
        totalSessions: sessions.length,
        bestWPM: sessions.reduce((m, s) => Math.max(m, s.wpm || 0), 0),
        bestAccuracy: sessions.reduce((m, s) => Math.max(m, s.accuracy || 0), 0),
        totalTime: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
        bestCombo: sessions.reduce((m, s) => Math.max(m, s.maxCombo || 0), 0),
        level: parseInt(localStorage.getItem('cosmicTyping_xp_lv') || '1'),
      };
      if (this.achievementSystem) {
        this.achievementSystem.checkAchievements(statsForAchievement);
      }
    } catch (e) { /* 実績チェック失敗は無視 */ }

    // P4: セッション後ワンポイントアドバイス
    if (typeof window.showSessionAdvice === 'function') {
      window.showSessionAdvice(results.wpm, results.accuracy);
    }
  }

  onTypingError(error) {
    console.error("Typing engine error:", error);
    this.showMessage("⚠️ エラーが発生しました。ページを再読み込みしてください。", "error");
    
    // エラー時は入力欄を無効化
    if (this.elements.typingInput) {
      this.elements.typingInput.disabled = true;
      this.elements.typingInput.classList.remove('typing-active');
    }
  }

  async saveResult() {
    if (!this.typingEngine || !this.currentPlanet) {
      console.warn("No typing session to save");
      return;
    }

    const results = this.typingEngine.getResults();
    if (!results) {
      console.warn("No results to save");
      return;
    }

    const sessionData = {
      planet: this.currentPlanet,
      wpm: results.wpm,
      accuracy: results.accuracy,
      totalTyped: results.totalTyped,
      totalErrors: results.totalErrors,
      duration: results.duration,
    };

    try {
      let saved = false;

      // Try to save to Supabase first
      if (TypingStats) {
        saved = await TypingStats.saveSession(sessionData);
      }

      // Always save to localStorage as backup
      this.saveResultsToStorage(sessionData);

      if (saved) {
        this.showMessage("💾 結果が保存されました！", "success");
      } else {
        this.showMessage("💾 結果をローカルに保存しました。", "info");
      }
    } catch (error) {
      console.error("Error saving results:", error);
      this.saveResultsToStorage(sessionData);
      this.showMessage("💾 結果をローカルに保存しました。", "info");
    }
  }

  saveResultsToStorage(results) {
    try {
      const existingData = JSON.parse(
        localStorage.getItem("typing_sessions") || "[]"
      );
      existingData.push({
        ...results,
        id: Date.now(),
        saved_at: new Date().toISOString(),
      });

      // Keep only last 100 sessions
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }

      localStorage.setItem("typing_sessions", JSON.stringify(existingData));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  showMessage(message, type = "info") {
    // UX改善: より視覚的に優れた通知システム
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${type}`;
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle'
    };
    
    const colors = {
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      info: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    };
    
    messageDiv.innerHTML = `
      <i class="fas ${icons[type] || icons.info}" style="margin-right: 8px;"></i>
      <span>${message}</span>
    `;
    
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 14px 20px;
      border-radius: 10px;
      color: white;
      z-index: 9999;
      background: ${colors[type] || colors.info};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      font-weight: 500;
      display: flex;
      align-items: center;
      transform: translateX(120%);
      transition: transform 0.3s ease-out;
      max-width: 90vw;
    `;

    document.body.appendChild(messageDiv);
    
    // アニメーションでスライドイン
    requestAnimationFrame(() => {
      messageDiv.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      messageDiv.style.transform = 'translateX(120%)';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 300);
    }, 3000);
  }

  async loadPracticeTextsFromAPI() {
    try {
      if (PracticeTexts) {
        const planets = ["earth", "mars", "jupiter", "saturn"];
        for (const planet of planets) {
          const texts = await PracticeTexts.getTextsByPlanet(planet);
          if (texts && texts.length > 0) {
            // ローカルpracticeTextsの定義は削除
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load practice texts from API:", error);
    }
  }

  async getUserStats() {
    try {
      if (TypingStats) {
        const stats = await TypingStats.getOverallStats();
        return stats;
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
    return this.getLocalStats();
  }

  getLocalStats() {
    try {
      const sessions = JSON.parse(
        localStorage.getItem("typing_sessions") || "[]"
      );

      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          bestWpm: 0,
          bestAccuracy: 0,
        };
      }

      const stats = {
        totalSessions: sessions.length,
        totalWpm: 0,
        totalAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
      };

      sessions.forEach((session) => {
        stats.totalWpm += session.wpm;
        stats.totalAccuracy += session.accuracy;

        if (session.wpm > stats.bestWpm) {
          stats.bestWpm = session.wpm;
        }

        if (session.accuracy > stats.bestAccuracy) {
          stats.bestAccuracy = session.accuracy;
        }
      });

      stats.avgWpm = stats.totalWpm / stats.totalSessions;
      stats.avgAccuracy = stats.totalAccuracy / stats.totalSessions;

      return stats;
    } catch (error) {
      console.error("Error calculating local stats:", error);
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
      };
    }
  }

  // キーボード入力監視
  handleGlobalKeydown(e) {
    if (!this.isPracticeActive) return;
    if (e.key.length === 1) {
      this.userInput += e.key;
    } else if (e.key === 'Backspace') {
      this.userInput = this.userInput.slice(0, -1);
    }
    this.updateRomanizedText();
  }

  // ローマ字表記をtextDisplayの下に必ず表示＋色付け
  updateRomanizedText() {
    if (!this.elements.textDisplay) return;
    const text = this.elements.textDisplay.textContent;
    let romanized = text;
    let romanElem = document.getElementById('romanized-text');
    if (!romanElem) {
      romanElem = document.createElement('div');
      romanElem.id = 'romanized-text';
      romanElem.style.fontSize = '0.9em';
      romanElem.style.marginTop = '0.3em';
      this.elements.textDisplay.parentNode.insertBefore(romanElem, this.elements.textDisplay.nextSibling);
    }
    // 色付け
    let color = '#888';
    if (this.userInput.length > 0) {
      if (romanized.startsWith(this.userInput)) {
        color = '#10b981'; // 緑
      } else {
        color = '#ef4444'; // 赤
      }
    }
    romanElem.style.color = color;
    romanElem.textContent = romanized;
  }

  // リーダーボードに保存
  async saveToLeaderboard(results) {
    if (!this.leaderboardManager) {
      logger.warn('Leaderboard manager not initialized');
      return;
    }

    try {
      const saved = await this.leaderboardManager.saveScore(results);
      if (saved) {
        logger.info('Score saved to leaderboard');
      }
    } catch (error) {
      logger.error('Error saving to leaderboard:', error);
    }
  }

  // リーダーボードを表示
  async showLeaderboard(mode, timeLimit = null) {
    if (!this.leaderboardManager) {
      this.showMessage('リーダーボードが利用できません', 'error');
      return;
    }

    try {
      const leaderboard = await this.leaderboardManager.getLeaderboard(mode, timeLimit, 10);
      
      // Display leaderboard in UI
      this.displayLeaderboard(leaderboard, mode, timeLimit);
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      this.showMessage('リーダーボードの取得に失敗しました', 'error');
    }
  }

  // リーダーボードをUIに表示
  displayLeaderboard(leaderboard, mode, timeLimit) {
    logger.info('Leaderboard:', leaderboard);
    if (typeof showLeaderboardModal === 'function') {
      showLeaderboardModal(mode, timeLimit);
    }
  }
}

// Initialize app when DOM is ready
// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new CosmicTypingApp();
});

// Export startMission to window for HTML onclick handlers
window.startMission = function (missionType) {
  if (!window.app) {
    console.error('CosmicTypingAppインスタンスが初期化されていません');
    return;
  }
  const missionMap = {
    basic: 'earth',
    exploration: 'mars',
    speed: 'jupiter',
    accuracy: 'saturn',
    survival: 'survival'
  };

  // Check if it is time attack
  if (typeof missionType === 'string' && missionType.startsWith('timeAttack')) {
    console.warn("Time Attack is not fully integrated in startMission yet without refactoring.");
    return;
  }

  const planetKey = missionMap[missionType] || missionType;
  window.app.selectPlanet(planetKey);
  window.app.showTypingPractice();
};
