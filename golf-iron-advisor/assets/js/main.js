/**
 * Main Application Entry Point
 */
import { EventBus } from './core/EventBus.js';
import { StateManager } from './core/StateManager.js';
import { TranslationManager } from './core/TranslationManager.js';
import { ClubDataService } from './services/ClubDataService.js';
import { DiagnosisEngine } from './services/DiagnosisEngine.js';
import { ComparisonService } from './services/ComparisonService.js';
import { ComparisonComponent } from './components/ComparisonComponent.js';
import { ResultDisplay } from './components/ResultDisplay.js';
import { ChartComponent } from './components/ChartComponent.js';
import { Tooltip } from './components/Tooltip.js';
import { LoadingOverlay } from './components/LoadingOverlay.js';

const LOADING_MESSAGES = {
    ja: [
        'あなたにぴったりのクラブを探しています...',
        'データベースから相性の良いアイアンを選定中です...',
        'スイング特性をもとに最適な組み合わせを計算しています...',
        'ミスの傾向に合わせてやさしいモデルをチェックしています...',
        '飛距離と方向性のバランスが良い候補を絞り込んでいます...',
        '価格帯に合わせておすすめを最適化しています...',
        '最後の仕上げ中です。もう少しだけお待ちください...',
    ],
    en: [
        'Finding the best clubs for you...',
        'Searching the database for great matches...',
        'Calculating recommendations from your swing profile...',
        'Checking forgiving models based on mishit tendencies...',
        'Balancing distance and accuracy for your fit...',
        'Optimizing recommendations within your budget...',
        'Finalizing results. Almost there...',
    ]
};

class App {
    constructor() {
        this.eventBus = new EventBus();
        this.stateManager = new StateManager(this.eventBus);
        this.translationManager = new TranslationManager();
        this.clubDataService = new ClubDataService(this.eventBus);
        this.comparisonService = new ComparisonService(this.eventBus);
        this.comparisonComponent = new ComparisonComponent(this.comparisonService);
        this.diagnosisEngine = new DiagnosisEngine(this.clubDataService);
        this.resultDisplay = new ResultDisplay('resultsContainer', this.comparisonService, this.comparisonComponent);
        this.chartComponent = new ChartComponent('compatibilityChart');
        this.tooltip = new Tooltip();
        this.loadingOverlay = new LoadingOverlay({
            translationManager: this.translationManager,
            messagesByLanguage: LOADING_MESSAGES,
            titleByLanguage: {
                ja: 'AI分析中...',
                en: 'Analyzing with AI...'
            }
        });

        this.diagnosisData = {};
        this.currentStep = 0;
        this.quickMode = false; // P35: 速攻3問モードフラグ

        this.setupEventListeners();
    }

    async init() {
        // 言語設定の初期化
        this.translationManager.translatePage();

        // ツールチップの初期化
        this.tooltip.init();

        // クラブデータのロード
        try {
            await this.clubDataService.loadClubs();
        } catch (e) {
            console.error('Failed to load initial data', e);
        }

        // 履歴の表示更新
        this.updateHistoryDisplay();

        // P24: 途中再開バナーの初期化
        this.initResumeBanner();

        // 累積診断カウンター表示の初期化
        this.initDiagnosisCount();
    }

    initResumeBanner() {
        try {
            const saved = JSON.parse(localStorage.getItem('gia_progress_save') || 'null');
            if (!saved || !saved.step || !saved.data) return;
            // 1時間以上古いデータは破棄
            if (Date.now() - (saved.ts || 0) > 3600000) {
                localStorage.removeItem('gia_progress_save');
                return;
            }
            const banner = document.getElementById('gia-resume-banner');
            const info = document.getElementById('gia-resume-info');
            if (!banner) return;
            banner.classList.remove('hidden');
            if (info) info.textContent = `ステップ ${saved.step}/8 まで回答済み`;

            document.getElementById('resumeBtn')?.addEventListener('click', () => {
                banner.classList.add('hidden');
                this.resumeDiagnosis();
            });
            document.getElementById('discardResumeBtn')?.addEventListener('click', () => {
                localStorage.removeItem('gia_progress_save');
                banner.classList.add('hidden');
                this.startDiagnosis();
            });
        } catch (e) {
            localStorage.removeItem('gia_progress_save');
        }
    }

    setupEventListeners() {
        // localStorage クォータ超過時の通知
        this.eventBus.on('storageQuotaExceeded', () => {
            this.showToast('保存容量が不足しています。ブラウザのキャッシュを削除してください。', 'error');
        });

        // P4: Step1 身長・体重スキップ（平均値自動入力）
        window._skipStep1 = () => {
            const heightEl = document.getElementById('height');
            const weightEl = document.getElementById('weight');
            const ageEl = document.getElementById('age');
            if (heightEl && !heightEl.value) heightEl.value = '170';
            if (weightEl && !weightEl.value) weightEl.value = '70';
            if (ageEl && !ageEl.value) ageEl.value = '40s';
            this.handleNextStep(1);
        };

        // 診断開始ボタン
        const startBtn = document.getElementById('startBtn');
        const startDiagnosisBtn = document.getElementById('startDiagnosisBtn');

        if (startBtn) startBtn.addEventListener('click', () => this.startDiagnosis());
        // P35: 速攻3問モードボタン
        const startQuickBtn = document.getElementById('startQuickBtn');
        if (startQuickBtn) startQuickBtn.addEventListener('click', () => this.startQuickDiagnosis());
        if (startDiagnosisBtn) startDiagnosisBtn.addEventListener('click', () => {
            const section = document.getElementById('diagnosis');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => this.startDiagnosis(), 500);
            }
        });

        // リアルタイムバリデーションの設定
        this.setupRealtimeValidation();

        // ナビゲーションボタン（動的にハンドリング）
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quiz-option')) {
                this.handleOptionSelect(e.target.closest('.quiz-option'));
            }

            // Nextボタン
            if (e.target.id && e.target.id.startsWith('next-')) {
                const stepNum = parseInt(e.target.id.split('-')[1]);
                this.handleNextStep(stepNum);
            }

            // Prevボタン
            if (e.target.id && e.target.id.startsWith('prev-')) {
                this.prevStep();
            }

            // 言語切り替え
            if (e.target.id === 'languageSelector') {
                this.translationManager.setLanguage(e.target.value);
            }
        });

        // 言語セレクターの変更イベント
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.addEventListener('change', (e) => {
                this.translationManager.setLanguage(e.target.value);
                // ツールチップのテキストも更新
                this.updateTooltipTexts();
                this.loadingOverlay.refreshTexts({ forceNewMessage: true });
            });
        }

        // 計算ボタン
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.handleCalculation());
        }

        // グローバル関数（後方互換性のため）
        window.startDiagnosis = () => this.startDiagnosis();
        window.shareClub = (name) => this.shareClub(name);
        window.shareResults = () => this.shareResults();

        // UI Event Listeners
        this.setupUIListeners();
    }

    setupUIListeners() {
        // Mobile menu with enhanced animations
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileSidebar = document.getElementById('mobileSidebar');
        const closeMobileSidebar = document.getElementById('closeMobileSidebar');
        
        // サイドバーオーバーレイを作成
        let sidebarOverlay = document.querySelector('.sidebar-overlay');
        if (!sidebarOverlay) {
            sidebarOverlay = document.createElement('div');
            sidebarOverlay.className = 'sidebar-overlay';
            document.body.appendChild(sidebarOverlay);
        }

        const openMobileSidebar = () => {
            if (mobileSidebar) {
                mobileSidebar.classList.add('sidebar-open');
                mobileSidebar.style.transform = 'translateX(0)';
                sidebarOverlay.classList.add('active');
                mobileMenuButton?.classList.add('menu-open');
                mobileMenuButton?.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden'; // スクロール防止
            }
        };

        const closeMobileSidebarFunc = () => {
            if (mobileSidebar) {
                mobileSidebar.classList.remove('sidebar-open');
                mobileSidebar.style.transform = 'translateX(100%)';
                sidebarOverlay.classList.remove('active');
                mobileMenuButton?.classList.remove('menu-open');
                mobileMenuButton?.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = ''; // スクロール復帰
            }
        };

        if (mobileMenuButton && mobileSidebar) {
            mobileMenuButton.addEventListener('click', openMobileSidebar);
        }
        
        if (closeMobileSidebar) {
            closeMobileSidebar.addEventListener('click', closeMobileSidebarFunc);
        }
        
        // オーバーレイクリックで閉じる
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeMobileSidebarFunc);
        }
        
        // サイドバー内のリンククリックで閉じる
        if (mobileSidebar) {
            mobileSidebar.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    setTimeout(closeMobileSidebarFunc, 300);
                });
            });
        }

        // Font size
        const fontSizeSelector = document.getElementById('fontSizeSelector');
        const mobileFontSizeSelector = document.getElementById('mobileFontSizeSelector');
        const savedFontSize = localStorage.getItem('fontSize') || 'md';

        this.changeFontSize(savedFontSize);
        if (fontSizeSelector) fontSizeSelector.value = savedFontSize;
        if (mobileFontSizeSelector) mobileFontSizeSelector.value = savedFontSize;

        const handleFontChange = (e) => {
            this.changeFontSize(e.target.value);
            if (fontSizeSelector) fontSizeSelector.value = e.target.value;
            if (mobileFontSizeSelector) mobileFontSizeSelector.value = e.target.value;
        };

        if (fontSizeSelector) fontSizeSelector.addEventListener('change', handleFontChange);
        if (mobileFontSizeSelector) mobileFontSizeSelector.addEventListener('change', handleFontChange);

        // Social Sharing (Static Buttons)
        const shareTwitter = document.getElementById('shareTwitter');
        if (shareTwitter) {
            shareTwitter.addEventListener('click', (e) => {
                e.preventDefault();
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent('ゴルフアイアン適性診断で最適なクラブを見つけよう！');
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
            });
        }

        // View History ボタン → 診断履歴セクションへスクロール
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => {
                document.getElementById('history')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        // Sidebar smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                // 内部リンクのみ対象
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Result Action Buttons
        document.getElementById('shareResultsBtn')?.addEventListener('click', () => this.shareResults());
        document.getElementById('retakeBtn')?.addEventListener('click', () => this.startDiagnosis());
    }

    startDiagnosis() {
        this.currentStep = 1;
        this.diagnosisData = {};
        localStorage.removeItem('gia_progress_save');

        // 全ステップを隠す
        document.querySelectorAll('#diagnosisContainer > div').forEach(div => {
            div.classList.add('hidden');
        });

        // ステップ1を表示
        const step1 = document.getElementById('step-1');
        if (step1) step1.classList.remove('hidden');

        this.updateProgress(1);

        this.quickMode = false;
        // ツールチップを再初期化
        setTimeout(() => this.tooltip.attachTooltips(), 100);

        // モバイルで診断エリアが画面外のときスクロール
        const diagSection = document.getElementById('diagnosis');
        if (diagSection) {
            setTimeout(() => diagSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        }
    }

    // P35: 速攻3問モード（経験→スイング速度→ミス傾向の3問のみ）
    startQuickDiagnosis() {
        this.quickMode = true;
        this.currentStep = 2;
        this.diagnosisData = {
            // デフォルト値（スキップされたステップの代替）
            height: '170', weight: '70', age: '40s', handedness: 'right',
            ballFlight: 'mid', priority: 'forgiveness', budget: 'budget2', situation: 'approach'
        };
        localStorage.removeItem('gia_progress_save');

        document.querySelectorAll('#diagnosisContainer > div').forEach(div => div.classList.add('hidden'));
        const step2 = document.getElementById('step-2');
        if (step2) step2.classList.remove('hidden');

        // 速攻モードバッジを各ステップに表示
        ['step-2', 'step-3', 'step-4'].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.querySelector('.gia-quick-badge')) {
                const badge = document.createElement('div');
                badge.className = 'gia-quick-badge mb-3 text-center';
                badge.innerHTML = '<span style="background:#f59e0b;color:white;font-size:0.7rem;font-weight:700;padding:2px 10px;border-radius:12px;">⚡ 速攻3問モード</span>';
                el.insertBefore(badge, el.firstChild);
            }
        });

        this.updateProgress(1);
        setTimeout(() => this.tooltip.attachTooltips(), 100);
    }

    // P24: 途中再開
    resumeDiagnosis() {
        try {
            const saved = JSON.parse(localStorage.getItem('gia_progress_save') || 'null');
            if (!saved) return;
            this.currentStep = saved.step;
            this.diagnosisData = saved.data || {};

            document.querySelectorAll('#diagnosisContainer > div').forEach(div => div.classList.add('hidden'));
            const stepEl = document.getElementById(`step-${this.currentStep}`);
            if (stepEl) stepEl.classList.remove('hidden');
            this.updateProgress(this.currentStep);
            setTimeout(() => this.tooltip.attachTooltips(), 100);
        } catch (e) {
            localStorage.removeItem('gia_progress_save');
        }
    }

    // P24: 途中状態を保存
    saveProgressState() {
        try {
            if (this.currentStep > 0 && this.currentStep < 8) {
                localStorage.setItem('gia_progress_save', JSON.stringify({
                    step: this.currentStep,
                    data: this.diagnosisData,
                    ts: Date.now()
                }));
            }
        } catch (e) { /* ignore */ }
    }

    handleOptionSelect(optionElement) {
        const step = optionElement.closest('[id^="step-"]');
        if (!step) return;

        // 同一ステップ内の他の選択を解除
        step.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // 選択状態にする
        optionElement.classList.add('selected');

        // Steps 4〜7: 選択後400ms後に自動次遷移
        const stepNum = parseInt(step.id.replace('step-', ''), 10);
        if ([4, 5, 6, 7].includes(stepNum)) {
            setTimeout(() => {
                if (step.querySelector('.quiz-option.selected')) {
                    this.handleNextStep(stepNum);
                }
            }, 400);
        } else if (stepNum === 8) {
            // Step 8: 選択後600msで自動的に診断計算を実行
            setTimeout(() => {
                if (step.querySelector('.quiz-option.selected')) {
                    this.handleCalculation();
                }
            }, 600);
        }
    }

    handleNextStep(stepNum) {
        // ステップごとのデータ収集とバリデーション
        if (stepNum === 1) {
            const heightEl = document.getElementById('height');
            const weightEl = document.getElementById('weight');
            const ageEl = document.getElementById('age');
            
            // すべてのフィールドをバリデート
            const isValid = this.validateAllFields([
                { element: heightEl, type: 'height' },
                { element: weightEl, type: 'weight' },
                { element: ageEl, type: 'age' }
            ]);

            if (!isValid) {
                this.showToast('入力内容を確認してください', 'error');
                return;
            }

            // バリデーション成功後、データを保存
            this.diagnosisData.height = heightEl.value;
            this.diagnosisData.weight = weightEl.value;
            this.diagnosisData.age = ageEl.value;
            // P10: 利き手
            this.diagnosisData.handedness = document.getElementById('handedness')?.value || 'right';
            // P41: ラウンド頻度（任意）
            this.diagnosisData.playFrequency = document.getElementById('playFrequency')?.value || '';
        } else if (stepNum === 3) {
            // P1: ヘッドスピード数値入力
            const hsEl = document.getElementById('headspeedInput');
            const hsVal = hsEl ? parseFloat(hsEl.value) : NaN;
            if (!isNaN(hsVal) && (hsVal < 20 || hsVal > 70)) {
                this.showToast('ヘッドスピードは20〜70 m/sの範囲で入力してください', 'error');
                return;
            }
            let speed = 'moderate';
            if (!isNaN(hsVal)) {
                if (hsVal < 38) speed = 'slow';
                else if (hsVal >= 45) speed = 'fast';
            }
            this.diagnosisData.swingSpeed = speed;
            this.diagnosisData.headspeedMs = isNaN(hsVal) ? null : hsVal;
        } else {
            // クイズ形式のステップ
            const currentStepEl = document.getElementById(`step-${stepNum}`);
            const selected = currentStepEl.querySelector('.quiz-option.selected');

            if (!selected) {
                // 選択肢全体にエラー表示
                this.highlightQuizOptions(currentStepEl);
                this.showToast('選択肢を選んでください', 'error');
                return;
            }

            // データのマッピング
            const value = selected.dataset.value;
            switch (stepNum) {
                case 2: {
                    this.diagnosisData.experience = value;
                    // P17: ハンディキャップが入力されていれば経験値を上書き
                    const hcpEl = document.getElementById('handicapInput');
                    const hcpVal = hcpEl ? parseInt(hcpEl.value, 10) : NaN;
                    if (!isNaN(hcpVal) && hcpVal >= 0 && hcpVal <= 54) {
                        this.diagnosisData.handicap = hcpVal;
                        if (hcpVal <= 10) this.diagnosisData.experience = 'advanced';
                        else if (hcpVal <= 20) this.diagnosisData.experience = 'intermediate';
                        else if (hcpVal <= 28) this.diagnosisData.experience = 'amateur';
                        else this.diagnosisData.experience = 'beginner';
                    } else {
                        this.diagnosisData.handicap = null;
                    }
                    break;
                }
                case 4: this.diagnosisData.missTendency = value; break;
                case 5: this.diagnosisData.ballFlight = value; break;
                case 6: this.diagnosisData.priority = (value === 'unknown-priority') ? 'forgiveness' : value; break;
                case 7: this.diagnosisData.budget = (value === 'unknown-budget') ? 'budget2' : value; break;
            }
        }

        // P35: 速攻モードではstep-4完了後に即計算
        if (this.quickMode && stepNum === 4) {
            this.handleQuickCalculation();
            return;
        }

        this.saveProgressState();
        this.nextStep();
    }

    // P35: 速攻3問モード用の計算（step-8をスキップ）
    async handleQuickCalculation() {
        this.showLoading();
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const results = await this.diagnosisEngine.calculateRecommendations(this.diagnosisData);
            this._lastResults = results;
            this._relatedResults = results._related || [];

            this.hideLoading();
            document.querySelectorAll('#diagnosisContainer > div').forEach(div => div.classList.add('hidden'));
            const resultsElQ = document.getElementById('results');
            resultsElQ.classList.remove('hidden');
            this.updateProgress(3);

            this.resultDisplay.render(results, this.diagnosisData);
            this.chartComponent.render(results);
            this.renderShaftSummary(this.diagnosisData);
            this.renderTopResultCard(results, this.diagnosisData);
            this.saveToHistory(this.diagnosisData, results);
            this.launchConfetti();
            this.incrementDiagnosisCount();

            // 結果カードへ自動スクロール
            setTimeout(() => {
                resultsElQ.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);

            // P44: 速攻モード完了後「フル診断でやり直す」ボタンを追加
            const reDiagnose = document.getElementById('gia-re-diagnose');
            if (reDiagnose) {
                reDiagnose.innerHTML = `
                    <button onclick="window.startDiagnosis()" class="bg-white border-2 border-green-300 text-green-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-green-50 transition-colors shadow-sm mr-2">🔄 フル診断でやり直す（8問）</button>
                    <button onclick="window.appInstance && window.appInstance.startQuickDiagnosis()" class="bg-white border-2 border-amber-300 text-amber-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-50 transition-colors shadow-sm">⚡ 速攻3問でやり直す</button>`;
                reDiagnose.classList.remove('hidden');
            }

            if (typeof window.giaAfterResults === 'function') {
                window.giaAfterResults(results, this.diagnosisData, this._relatedResults);
            }
        } catch (error) {
            console.error('Quick calculation failed:', error);
            this.hideLoading();
            this.showToast('診断中にエラーが発生しました', 'error');
        }
    }

    async transitionStep(direction) {
        const nextStepNum = direction === 'next' ? this.currentStep + 1 : this.currentStep - 1;
        if (nextStepNum < 1 || nextStepNum > 8) return;

        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        const nextStepEl = document.getElementById(`step-${nextStepNum}`);

        if (!currentStepEl || !nextStepEl) return;

        // フェードアウト
        currentStepEl.style.opacity = '0';
        currentStepEl.style.transform = 'translateY(-10px)';
        currentStepEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        await new Promise(r => setTimeout(r, 300));

        currentStepEl.classList.add('hidden');
        currentStepEl.style.opacity = '';
        currentStepEl.style.transform = '';

        this.currentStep = nextStepNum;

        // フェードイン準備
        nextStepEl.classList.remove('hidden');
        nextStepEl.style.opacity = '0';
        nextStepEl.style.transform = 'translateY(10px)';
        nextStepEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        // リフローを強制
        void nextStepEl.offsetWidth;

        // フェードイン
        nextStepEl.style.opacity = '1';
        nextStepEl.style.transform = 'translateY(0)';

        this.updateProgress(this.currentStep);

        // アニメーション完了後にスタイルをクリーンアップ＋モバイルスクロール
        setTimeout(() => {
            nextStepEl.style.opacity = '';
            nextStepEl.style.transform = '';
            nextStepEl.style.transition = '';
            // モバイルで次ステップが画面外のときスクロール
            const rect = nextStepEl.getBoundingClientRect();
            if (rect.top < 0 || rect.top > window.innerHeight * 0.6) {
                nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 300);
    }

    nextStep() {
        this.transitionStep('next');
    }

    prevStep() {
        this.transitionStep('prev');
    }

    async handleCalculation() {
        // 最終ステップ（スコアを落とすシチュエーション）のデータ収集
        const step8 = document.getElementById('step-8');
        const selected = step8.querySelector('.quiz-option.selected');
        if (!selected) {
            this.showToast('選択肢を選んでください', 'error');
            return;
        }
        this.diagnosisData.situation = selected.dataset.value;

        // ローディング表示
        this.showLoading();

        try {
            // 少し待機時間を設ける（UXのため）
            await new Promise(resolve => setTimeout(resolve, 1500));

            const results = await this.diagnosisEngine.calculateRecommendations(this.diagnosisData);
            this._lastResults = results;
            this._relatedResults = results._related || [];

            // 結果画面の表示準備
            this.hideLoading();
            document.querySelectorAll('#diagnosisContainer > div').forEach(div => div.classList.add('hidden'));
            const resultsEl = document.getElementById('results');
            resultsEl.classList.remove('hidden');
            this.updateProgress(7);

            // コンポーネント描画（userProfileを渡す）
            this.resultDisplay.render(results, this.diagnosisData);
            this.chartComponent.render(results);
            this.renderShaftSummary(this.diagnosisData);
            this.renderTopResultCard(results, this.diagnosisData);

            // 結果カードへ自動スクロール
            setTimeout(() => {
                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);

            // 速攻3問モード時に精度注意バナーを表示
            const quickBanner = document.getElementById('gia-quick-mode-banner');
            if (quickBanner) {
                if (this.quickMode) quickBanner.classList.remove('hidden');
                else quickBanner.classList.add('hidden');
            }

            // P45: 購買促進バナー表示＆リンク設定
            this.showPurchaseBanner(results);

            // P2-6: シェアボタン初期化
            this.initializeShareButtons(results);

            // 履歴保存
            this.saveToHistory(this.diagnosisData, results);
            // P24: 途中保存データを削除
            localStorage.removeItem('gia_progress_save');

            // P39: 診断完了コンフェティ演出
            this.launchConfetti();

            // P57: 診断完了時に累積カウンターをインクリメント
            this.incrementDiagnosisCount();

            // P2-P7 拡張機能コールバック
            if (typeof window.giaAfterResults === 'function') {
                window.giaAfterResults(results, this.diagnosisData, this._relatedResults);
            }

        } catch (error) {
            console.error('Calculation failed:', error);
            this.hideLoading();
            this.showToast('診断中にエラーが発生しました', 'error');
        }
    }

    changeFontSize(size) {
        document.body.className = document.body.className.replace(/font-size-\w+/, `font-size-${size}`);
        if (!document.body.className.includes('font-size-')) {
            document.body.classList.add(`font-size-${size}`);
        }
        localStorage.setItem('fontSize', size);
    }

    buildClubReasons(data) {
        if (!data) return [];
        const parts = [];
        const expMap = { beginner: '初心者にも扱いやすい寛容性の高い設計', amateur: 'アマチュア向けの易しさと飛距離を両立', intermediate: '中級者の精度向上に最適なモデル', advanced: '上級者向けの高精度・低重心設計' };
        if (data.experience && expMap[data.experience]) parts.push(expMap[data.experience]);
        const speedMap = { slow: 'スロースイング（85mph以下）でも高弾道を実現', medium: 'ミドルスイングで安定した弾道を発揮', fast: 'ファストスイングのパワーを最大化', very_fast: 'ハードヒッター向けの低スピン高速設計' };
        if (data.swingSpeed && speedMap[data.swingSpeed]) parts.push(speedMap[data.swingSpeed]);
        const priorityMap = { distance: '飛距離最大化を優先した設計', direction: '方向性・直進性を重視', control: 'コントロール性が高くスコアUPに有効', feel: '打感・フィーリングを重視したモデル', balance: '飛距離・方向性バランス重視' };
        if (data.priority && priorityMap[data.priority]) parts.push(priorityMap[data.priority]);
        return parts.slice(0, 3);
    }

    renderShaftSummary(diagnosisData) {
        const container = document.getElementById('gia-shaft-summary');
        if (!container) return;
        const hs = diagnosisData.headspeedMs;
        // フレックス判定
        let flex = 'R';
        let flexLabel = 'R（標準）';
        let flexColor = '#16a34a';
        let flexBg = '#f0fdf4';
        let flexBorder = '#86efac';
        let flexDesc = 'ヘッドスピード42〜46m/s対応。一般的なアマチュア男性に最も多いフレックスです。';

        if (hs !== null && hs !== undefined) {
            if (hs < 35) {
                flex = 'L/A'; flexLabel = 'L / A（やわらかめ）';
                flexColor = '#2563eb'; flexBg = '#eff6ff'; flexBorder = '#93c5fd';
                flexDesc = 'ヘッドスピード38m/s以下。シニア・女性・スローなスイング向け。軽量カーボンシャフトが最適です。';
            } else if (hs < 40) {
                flex = 'A/R'; flexLabel = 'A / R（やや軟らかい）';
                flexColor = '#2563eb'; flexBg = '#eff6ff'; flexBorder = '#93c5fd';
                flexDesc = 'ヘッドスピード38〜42m/s。カーボンシャフトのR寄りが飛距離・方向性のバランスが良いです。';
            } else if (hs < 45) {
                flex = 'SR/R'; flexLabel = 'SR / R（標準）';
                flexColor = '#16a34a'; flexBg = '#f0fdf4'; flexBorder = '#86efac';
                flexDesc = 'ヘッドスピード42〜46m/s。日本人アマチュア男性の平均的なフレックス帯です。';
            } else if (hs < 50) {
                flex = 'S'; flexLabel = 'S（やや硬め）';
                flexColor = '#d97706'; flexBg = '#fffbeb'; flexBorder = '#fcd34d';
                flexDesc = 'ヘッドスピード46〜50m/s。飛距離と方向性を両立させるスチールシャフトのSフレックスが適しています。';
            } else {
                flex = 'S/X'; flexLabel = 'S / X（硬め）';
                flexColor = '#dc2626'; flexBg = '#fef2f2'; flexBorder = '#fca5a5';
                flexDesc = 'ヘッドスピード50m/s以上。パワーヒッター向けの硬めシャフト。軽すぎると方向性が乱れます。';
            }
        }

        const rows = [
            { range: '〜38m/s', flex: 'L / A', label: 'やわらかい', color: '#2563eb' },
            { range: '38〜42', flex: 'A / R', label: 'やや軟', color: '#2563eb' },
            { range: '42〜46', flex: 'SR / R', label: '標準', color: '#16a34a' },
            { range: '46〜50', flex: 'S', label: 'やや硬', color: '#d97706' },
            { range: '50m/s〜', flex: 'S / X', label: '硬め', color: '#dc2626' },
        ];

        container.innerHTML = `
            <div style="background:${flexBg};border:2px solid ${flexBorder};border-radius:14px;padding:16px 20px;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
                    <div>
                        <p style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">推奨シャフトフレックス</p>
                        <p style="font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;color:${flexColor};line-height:1;">${flexLabel}</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:11px;color:#6b7280;margin-bottom:2px;">あなたのHS</p>
                        <p style="font-family:'Oswald',sans-serif;font-size:22px;font-weight:700;color:#374151;">${hs !== null && hs !== undefined ? hs + ' m/s' : '未計測'}</p>
                    </div>
                </div>
                <p style="font-size:12px;color:#374151;margin-bottom:12px;line-height:1.6;">${flexDesc}</p>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    ${rows.map((r, idx) => {
                        // インデックスベースで一致する行を判定
                        const flexIdx = { 'L/A': 0, 'A/R': 1, 'SR/R': 2, 'S': 3, 'S/X': 4, 'R': 2 }[flex] ?? 2;
                        const isActive = idx === flexIdx;
                        return `<div style="flex:1;min-width:52px;text-align:center;padding:6px 4px;border-radius:8px;border:2px solid ${isActive ? r.color : '#e5e7eb'};background:${isActive ? r.color + '18' : '#fff'};">
                            <div style="font-size:9px;color:#9ca3af;margin-bottom:2px;">${r.range}</div>
                            <div style="font-family:'Oswald',sans-serif;font-size:13px;font-weight:700;color:${isActive ? r.color : '#9ca3af'};">${r.flex}</div>
                            <div style="font-size:9px;color:${isActive ? r.color : '#9ca3af'};">${r.label}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        container.classList.remove('hidden');
    }

    renderTopResultCard(results, diagnosisData) {
        const container = document.getElementById('gia-top-result');
        if (!container || !results || results.length === 0) return;
        const top = results[0];
        const club = top.club?.basic_info || top.club || {};
        const name = club.name || '推薦クラブ';
        const score = Math.round(top.score || top.compatibility || 0);
        const type = club.type || '';

        // 推薦理由を生成
        const reasons = this.buildClubReasons(diagnosisData);
        const reasonsHtml = reasons.length > 0
            ? '<ul class="mb-3 space-y-1">' +
              reasons.map(r => `<li class="flex items-start gap-2 text-sm text-gray-700"><span class="text-green-500 font-bold mt-0.5">✓</span><span>${r}</span></li>`).join('') +
              '</ul>'
            : '';

        const top3 = results.slice(0, 3).map((r, i) => {
            const c = r.club?.basic_info || r.club || {};
            const clubId = r.club?.id;
            const medals = ['🥇', '🥈', '🥉'];
            const detailLink = clubId ? `<a href="./clubs/${clubId}/" style="font-size:10px;color:rgba(212,175,55,0.9);text-decoration:none;display:block;margin-top:4px;letter-spacing:0.05em;">詳細 →</a>` : '';
            return `<div class="bg-white rounded-lg p-3 shadow-sm border border-green-100 flex-1 min-w-0">
                <div class="text-lg">${medals[i]}</div>
                <div class="font-bold text-gray-800 text-xs leading-snug mt-1">${c.name || ''}</div>
                <div class="text-xs text-green-700 font-bold">適合 ${Math.round(r.score || r.compatibility || 0)}%</div>
                ${detailLink}
            </div>`;
        }).join('');

        // TOP3比較テーブル
        const comparisonRows = results.slice(0, 3).map((r, i) => {
            const c = r.club?.basic_info || r.club || {};
            const spec = r.club?.specifications || {};
            const medals = ['🥇', '🥈', '🥉'];
            const priceText = spec.price ? `¥${spec.price.toLocaleString()}` : '—';
            return `<tr class="${i === 0 ? 'bg-green-50 font-semibold' : (i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}">
                <td class="px-3 py-2 text-sm">${medals[i]} ${c.name || '—'}</td>
                <td class="px-3 py-2 text-sm text-center text-green-700 font-bold">${Math.round(r.score || r.compatibility || 0)}%</td>
                <td class="px-3 py-2 text-xs text-center text-gray-600">${priceText}</td>
                <td class="px-3 py-2 text-xs text-center text-gray-600">${c.type || '—'}</td>
            </tr>`;
        }).join('');
        const comparisonTable = results.length >= 2
            ? `<div class="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                <table class="w-full text-left border-collapse">
                <thead><tr class="bg-green-50">
                    <th class="px-3 py-2 text-xs font-semibold text-green-700">クラブ名</th>
                    <th class="px-3 py-2 text-xs font-semibold text-green-700 text-center">適合</th>
                    <th class="px-3 py-2 text-xs font-semibold text-green-700 text-center">価格目安</th>
                    <th class="px-3 py-2 text-xs font-semibold text-green-700 text-center">タイプ</th>
                </tr></thead>
                <tbody>${comparisonRows}</tbody>
                </table></div>`
            : '';

        // P53: Amazon購入URLを生成（Amazonアソシエイトタグ付き）
        const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(name + ' アイアン')}&tag=appadaycrea0f-22`;
        // P58: シェアURL生成（カード内で直接使用）
        const shareTextRaw = `ゴルフアイアン診断「${name}」が${score}%マッチ！ #ゴルフ診断`;
        const shareUrlBase = 'https://appadaycreator.com/golf-iron-advisor/';
        const lineHref = `https://line.me/R/share?text=${encodeURIComponent(shareTextRaw + ' ' + shareUrlBase)}`;
        const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextRaw)}&url=${encodeURIComponent(shareUrlBase)}&via=appadaycreator`;
        container.innerHTML = `
            <p class="gia-result-eyebrow">BEST MATCH</p>
            <h2 class="gia-result-name">🏆 ${name}</h2>
            <p style="color:rgba(255,255,255,0.75);font-size:13px;margin-bottom:16px;">適合率 <strong id="gia-top1-score-num" style="font-family:'Oswald',sans-serif;font-size:26px;color:var(--color-gold);">0</strong><span style="font-size:14px;color:rgba(255,255,255,0.6);">%</span>${type ? '<span style="color:rgba(255,255,255,0.55);font-size:12px;margin-left:8px;">' + type + '</span>' : ''}</p>
            ${reasonsHtml}
            <div class="flex gap-2 flex-wrap mb-4">${top3}</div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
              <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer nofollow sponsored"
                 class="js-track-affiliate"
                 data-platform="Amazon" data-item-name="${name}" data-link-type="top1_result"
                 style="background:var(--color-gold);color:var(--color-primary);font-family:'Noto Serif JP',serif;font-weight:700;padding:14px 24px;border-radius:2px;text-decoration:none;font-size:14px;letter-spacing:0.12em;box-shadow:0 8px 20px -8px rgba(212,175,55,0.6);display:inline-flex;align-items:center;gap:8px;transition:all 0.25s ease-out;">
                🛒 Amazonで価格を見る
              </a>
              <button onclick="document.getElementById('diagnosis')?.scrollIntoView({behavior:'smooth'})"
                style="background:transparent;color:rgba(255,255,255,0.8);border:1px solid rgba(212,175,55,0.45);padding:14px 20px;border-radius:2px;font-family:'Cormorant Garamond',serif;font-size:13px;letter-spacing:0.28em;text-transform:uppercase;cursor:pointer;transition:all 0.25s ease-out;">
                Re-Diagnose
              </button>
            </div>
            ${comparisonTable}
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.12);">
              <a href="${lineHref}" target="_blank" rel="noopener"
                 style="flex:1;min-width:110px;text-align:center;background:#06C755;color:#fff;padding:10px 12px;border-radius:2px;font-size:12px;font-weight:700;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:5px;font-family:'Noto Sans JP',sans-serif;letter-spacing:0.04em;">
                LINE でシェア
              </a>
              <a href="${xHref}" target="_blank" rel="noopener"
                 style="flex:1;min-width:110px;text-align:center;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.88);padding:10px 12px;border-radius:2px;font-size:12px;font-weight:700;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(255,255,255,0.22);font-family:'Noto Sans JP',sans-serif;letter-spacing:0.04em;">
                X でシェア
              </a>
            </div>`;
        container.classList.remove('hidden');

        // P3(横展開#25): スコアカウントアップアニメーション
        if (!window.animateValue) {
            window.animateValue = function(el, from, to, duration) {
                var start = null;
                function step(ts) {
                    if (!start) start = ts;
                    var progress = Math.min((ts - start) / duration, 1);
                    var ease = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(from + (to - from) * ease);
                    if (progress < 1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
            };
        }
        try {
            var scoreEl = document.getElementById('gia-top1-score-num');
            if (scoreEl) window.animateValue(scoreEl, 0, Math.round(score), 1500);
        } catch(e) {}
        try {
            var reDiagnoseEl = document.getElementById('gia-re-diagnose');
            if (reDiagnoseEl) reDiagnoseEl.classList.remove('hidden');
        } catch(e) {}

        // P2: 診断結果URLパラメーター化（横展開#21）
        try {
            if (name && score) {
                const sp = new URLSearchParams();
                sp.set('top', name);
                sp.set('score', String(score));
                if (type) sp.set('type', type);
                history.pushState({ giaResult: true }, '', '?' + sp.toString());
            }
        } catch(e) {}

        // P4: LINEシェア・Xシェアをパーソナライズ（横展開#21）
        try {
            const shareText = encodeURIComponent(`ゴルフアイアン診断「${name}」が${score}%マッチ！ #ゴルフ診断`);
            const shareUrl = encodeURIComponent('https://appadaycreator.com/golf-iron-advisor/');
            const lineEl = document.getElementById('gia-line-share');
            const xEl = document.getElementById('gia-x-share');
            if (lineEl) lineEl.href = 'https://line.me/R/share?text=' + shareText + '%20' + shareUrl;
            if (xEl) xEl.href = 'https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl + '&via=appadaycreator';
        } catch(e) {}

        // P4(横展開#22): document.titleを診断結果で動的更新
        try {
            document.title = `「${name}」が${score}%マッチ！ | ゴルフアイアン適性診断`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && results.length >= 2) {
                const top2c = results[1].club?.basic_info || results[1].club || {};
                metaDesc.setAttribute('content', `あなたに最適なアイアンは「${name}」（適合率${score}%）。次点：${top2c.name || ''}（${Math.round(results[1].score || 0)}%）。無料でアイアン診断 → appadaycreator.com/golf-iron-advisor/`);
            }
            // P3(横展開#23): OGP meta tag動的更新
            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogTitle) ogTitle.setAttribute('content', `「${name}」が${score}%マッチ！ | ゴルフアイアン適性診断`);
            if (ogDesc && results.length >= 2) {
                const top2c = results[1].club?.basic_info || results[1].club || {};
                ogDesc.setAttribute('content', `1位：${name}（${score}%）2位：${top2c.name || ''}。スイング特性から最適アイアンを無料診断。`);
            }
        } catch(e) {}

        // P4(横展開#23): 低スコア時（top1 < 70%）に条件変更提案メッセージを表示
        try {
            const lowScoreEl = document.getElementById('gia-low-score-msg');
            if (lowScoreEl) lowScoreEl.style.display = score < 70 ? 'block' : 'none';
        } catch(e) {}

        // P3(横展開#22): 最後の診断結果をlocalStorageに保存（前回結果リマインダー用）
        try {
            localStorage.setItem('gia_last_result', JSON.stringify({ name, score, type, ts: Date.now() }));
        } catch(e) {}

        // PWAインストールバナー（診断完了後に1度だけ表示）
        try {
            if (_pwaInstallPrompt && !localStorage.getItem('gia_pwa_prompted')) {
                const bar = document.getElementById('gia-pwa-install-bar');
                if (bar) bar.style.display = 'flex';
            }
        } catch(e) {}

        // P37: AmazonリンクをTOP1クラブ名で動的更新
        try {
            const amazonEl = document.getElementById('gia-amazon-aff');
            if (amazonEl && name) {
                const q = encodeURIComponent(name + ' アイアンセット');
                amazonEl.href = `https://www.amazon.co.jp/s?k=${q}&tag=appadaycrea0f-22`;
                amazonEl.textContent = `Amazonで${name}を見る →`;
            }
        } catch(e) {}

        // P1(横展開#22): アフィリエイトスティッキーCTAバーを3秒後に表示（UX改善）
        try {
            const isClosed = sessionStorage.getItem('gia_sticky_closed') === '1';
            if (!isClosed) {
                setTimeout(() => {
                    try {
                        const stickyBar = document.getElementById('gia-affiliate-sticky');
                        const stickyText = document.getElementById('gia-affiliate-sticky-text');
                        const stickyLink = document.getElementById('gia-sticky-link');
                        if (stickyBar && stickyText) {
                            const stickyKw = encodeURIComponent(name + ' アイアンセット');
                            if (stickyLink) stickyLink.href = `https://www.amazon.co.jp/s?k=${stickyKw}&tag=appadaycrea0f-22`;
                            stickyText.textContent = `🛒 「${name}」をAmazonで今すぐ見る →`;
                            stickyBar.style.display = 'block';
                        }
                    } catch(e) {}
                }, 3000);
            }
        } catch(e) {}

        // P5(横展開#22): クラブ購入チェックリストを表示・保存済み状態を復元
        try {
            const checklist = document.getElementById('gia-checklist');
            if (checklist) {
                checklist.classList.remove('hidden');
                if (typeof window._giaRestoreChecks === 'function') window._giaRestoreChecks();
            }
        } catch(e) {}

        // P78: 番手構成アドバイスの表示（TOP1クラブ名を渡して個別化）
        try {
            this.renderIronSetAdvice(diagnosisData, name);
        } catch(e) {}
    }

    renderIronSetAdvice(diagnosisData, topClubName) {
        const container = document.getElementById('gia-iron-set');
        if (!container) return;
        const exp = diagnosisData.experience || 'amateur';
        const speed = diagnosisData.swingSpeed || 'moderate';

        // 経験・スイングスピードから番手構成を決定
        let setTitle = '';
        let setRange = '';
        let setNote = '';
        let amazonQuery = '';
        let bgColor = 'bg-green-50';
        let borderColor = 'border-green-200';
        let textColor = 'text-green-800';

        if (exp === 'beginner') {
            setTitle = '7番〜SW（4〜5本セット）';
            setRange = '7I・8I・9I・PW・SW';
            setNote = '初心者はまず短めの番手から慣れましょう。7番〜SWで十分なコースマネジメントが可能です。';
            amazonQuery = topClubName ? topClubName + ' アイアンセット 初心者' : 'ゴルフ アイアン 初心者 7本セット';
            bgColor = 'bg-blue-50'; borderColor = 'border-blue-200'; textColor = 'text-blue-800';
        } else if (exp === 'amateur') {
            setTitle = '6番〜SW（5〜6本セット）';
            setRange = '6I・7I・8I・9I・PW・SW';
            setNote = 'アマチュアの方には6番〜SWの6本セットがバランス良くおすすめ。ロングアイアンは練習が必要ですが徐々に慣れていけます。';
            amazonQuery = topClubName ? topClubName + ' アイアンセット' : 'ゴルフ アイアン アマチュア 6本セット';
        } else if (exp === 'intermediate') {
            setTitle = '5番〜SW（6〜7本セット）';
            setRange = '5I・6I・7I・8I・9I・PW・SW';
            setNote = '中級者には5番〜SWの7本セットがスタンダード。5番アイアンをうまく使いこなせるとスコアが大きく変わります。';
            amazonQuery = topClubName ? topClubName + ' アイアンセット 中級' : 'ゴルフ アイアン 中級者 7本セット';
            bgColor = 'bg-purple-50'; borderColor = 'border-purple-200'; textColor = 'text-purple-800';
        } else {
            setTitle = '4番〜SW（7〜8本セット）';
            setRange = '4I・5I・6I・7I・8I・9I・PW・SW';
            setNote = '上級者は4番からのフルセットが基本。状況に応じてユーティリティや2番アイアンへの変更も検討してみてください。';
            amazonQuery = topClubName ? topClubName + ' アイアンセット 上級' : 'ゴルフ アイアン 上級者 フォージド';
            bgColor = 'bg-amber-50'; borderColor = 'border-amber-200'; textColor = 'text-amber-800';
        }

        const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(amazonQuery)}&tag=appadaycrea0f-22`;

        container.innerHTML = `
            <div class="${bgColor} border ${borderColor} rounded-xl p-5">
                <h4 class="font-bold ${textColor} mb-3 flex items-center gap-2">
                    <span>⛳</span> あなたにおすすめの番手構成
                </h4>
                <div class="bg-white rounded-lg px-4 py-3 mb-3 border ${borderColor}">
                    <p class="font-bold text-gray-800 text-sm mb-1">推奨セット: <span class="${textColor}">${setTitle}</span></p>
                    <div class="flex gap-1 flex-wrap mt-2">
                        ${setRange.split('・').map(n => `<span class="inline-block px-2 py-0.5 bg-white border ${borderColor} rounded-full text-xs font-bold ${textColor}">${n}</span>`).join('')}
                    </div>
                </div>
                <p class="text-xs text-gray-600 mb-3">${setNote}</p>
                <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer nofollow sponsored"
                   class="js-track-affiliate inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
                   data-platform="Amazon" data-item-name="${topClubName || setTitle}" data-link-type="iron_set_advice">
                    🛒 ${topClubName ? 'Amazonで' + topClubName + 'を探す' : 'Amazonで' + setTitle + 'を探す'} →
                </a>
            </div>`;
        container.classList.remove('hidden');
    }

    copyResultsText() {
        const results = this._lastResults;
        if (!results || results.length === 0) {
            this.showToast('先に診断を完了してください', 'error');
            return;
        }
        const lines = ['【ゴルフアイアン診断結果】'];
        results.slice(0, 3).forEach((r, i) => {
            const c = r.club?.basic_info || r.club || {};
            const score = Math.round(r.score || r.compatibility || 0);
            lines.push(`${i + 1}位: ${c.name || ''}（適合${score}%）`);
            if (i === 0) {
                const reasons = this.buildClubReasons(this.diagnosisData);
                if (reasons.length > 0) lines.push('　→ ' + reasons.join(' / '));
            }
        });
        lines.push('');
        lines.push('▶ 無料診断: https://appadaycreator.com/golf-iron-advisor/');
        const text = lines.join('\n');
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => this.showToast('診断結果をコピーしました！'));
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            this.showToast('診断結果をコピーしました！');
        }
    }

    async shareResults() {
        const top = this._lastResults && this._lastResults[0];
        const clubName = top?.club?.basic_info?.name || '';
        const score = top ? Math.round(top.score || top.compatibility || 0) : 0;
        // P19: URL共有対応（エンコード済みURLがあれば使用）
        const shareUrl = (typeof window.encodeResultToUrl === 'function' && this._lastResults)
            ? `https://appadaycreator.com/golf-iron-advisor/?r=${window.encodeResultToUrl(this._lastResults, this.diagnosisData)}`
            : 'https://appadaycreator.com/golf-iron-advisor/';
        const title = clubName ? `ゴルフアイアン診断：${clubName}が${score}%マッチ！` : 'ゴルフアイアン適性診断';
        const text = clubName
            ? `⛳ 推奨クラブ: ${clubName}（適合度${score}%）\n#ゴルフ #アイアン診断`
            : '⛳ ゴルフアイアン適性診断で最適なクラブが分かりました！\n#ゴルフ #アイアン';
        // Web Share API（モバイル対応）
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
                return;
            } catch (e) {
                if (e.name !== 'AbortError') console.error('Share failed:', e);
                return;
            }
        }
        // フォールバック: X(Twitter)シェア
        const tweetBody = `${text}\n${shareUrl}`;
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweetBody)}`, '_blank', 'noopener');
    }

    updateProgress(step) {
        const bar = document.getElementById('progressBar');
        const text = document.getElementById('progressText');
        const counter = document.getElementById('gia-question-counter');

        // P42+P43: 速攻モードと通常モードで表示を切り替え
        if (this.quickMode) {
            // 速攻3問モード: 1〜3の範囲で表示
            const quickStep = Math.min(step, 3);
            if (bar) bar.style.width = `${(quickStep / 3) * 100}%`;
            if (text) {
                const rem = 3 - quickStep;
                text.textContent = rem > 0 ? `⚡${quickStep}/3問 完了 (残り${rem}問)` : '⚡全問完了！';
            }
            if (counter) {
                const qmsgs = ['⚡STEP1/3 — 速攻モード！経験レベルを選択', '⚡STEP2/3 — スイング速度を教えて', '⚡STEP3/3 — 最後！ミスの傾向は？'];
                counter.textContent = qmsgs[quickStep - 1] || '';
                counter.classList.remove('hidden');
            }
        } else {
            // P42: 通常モード 7→8問修正
            if (bar) bar.style.width = `${(step / 8) * 100}%`;
            if (text) {
                const remaining = 8 - step;
                text.textContent = remaining > 0 ? `${step}/8問 完了 (残り${remaining}問)` : '全問完了！';
            }
            if (counter && step <= 8) {
                const msgs = [
                    'STEP1/8 — まずは基本情報から！',
                    'STEP2/8 — いいペースです👍',
                    'STEP3/8 — あと5問で診断完了！🎯',
                    'STEP4/8 — 折り返し！もう少し！',
                    'STEP5/8 — 半分以上終わりました✨',
                    'STEP6/8 — あと2問！ほぼ完了！🔥',
                    'STEP7/8 — あと1問！結果まであと一歩🎉',
                    'STEP8/8 — 最後の質問です！'
                ];
                counter.textContent = msgs[step - 1] || '';
                counter.classList.remove('hidden');
            }
        }
        // P26: ステップドット更新
        const dotsContainer = document.getElementById('gia-step-dots');
        if (dotsContainer) {
            dotsContainer.classList.remove('hidden');
            const maxStep = this.quickMode ? 3 : 8;
            dotsContainer.querySelectorAll('.step-dot').forEach(dot => {
                const dotStep = parseInt(dot.dataset.step);
                // 速攻モード時はStep4〜8のドットを非表示
                if (this.quickMode && dotStep > 3) {
                    dot.style.display = 'none';
                    return;
                }
                dot.style.display = '';
                dot.classList.remove('active', 'done');
                dot.removeAttribute('aria-current');
                if (dotStep === step) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-current', 'step');
                } else if (dotStep < step) {
                    dot.classList.add('done');
                    dot.setAttribute('title', '完了');
                }
            });
        }
    }

    // P57: 累積診断カウンターインクリメント（診断完了時のみ呼び出す）
    incrementDiagnosisCount() {
        try {
            const BASE = 12847;
            const stored = parseInt(localStorage.getItem('gia_total_count') || '0', 10);
            const cnt = Math.max(stored, BASE) + 1;
            localStorage.setItem('gia_total_count', String(cnt));
            const el = document.getElementById('gia-total-count');
            if (el) {
                const from = cnt - 1;
                this._animateCountUp(el, from, cnt, 600);
            }
        } catch(e) {}
    }

    // カウンター表示を初期化（ページロード時）
    initDiagnosisCount() {
        try {
            const BASE = 12847;
            const stored = parseInt(localStorage.getItem('gia_total_count') || '0', 10);
            const cnt = Math.max(stored, BASE);
            const el = document.getElementById('gia-total-count');
            if (el) {
                const target = parseInt(el.textContent.replace(/,/g, ''), 10) || BASE;
                this._animateCountUp(el, Math.max(target - 150, 0), cnt, 1800);
            }
        } catch(e) {}
    }

    // カウントアップアニメーション共通処理
    _animateCountUp(el, from, to, duration) {
        const start = performance.now();
        const update = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (to - from) * eased);
            el.textContent = current.toLocaleString('ja-JP');
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    // P39: 診断完了コンフェティ演出（純粋CSS/JS）
    launchConfetti() {
        const colors = ['#059669', '#fbbf24', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
        for (let i = 0; i < 60; i++) {
            const div = document.createElement('div');
            const size = 6 + Math.random() * 8;
            div.style.cssText = `position:fixed;top:-20px;left:${Math.random()*100}%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation:gia-confetti-fall ${1.2 + Math.random() * 1.5}s linear ${Math.random() * 0.5}s forwards;z-index:9999;pointer-events:none;`;
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 3500);
        }
    }

    showLoading() {
        this.loadingOverlay.show();
    }

    hideLoading() {
        this.loadingOverlay.hide();
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.remove('translate-y-full');
        toast.classList.add('translate-y-0');

        setTimeout(() => {
            toast.classList.remove('translate-y-0');
            toast.classList.add('translate-y-full');
        }, 3000);
    }

    saveToHistory(inputData, results) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            data: inputData,
            results: results
        };

        // StateManagerを使用して履歴を保存
        this.stateManager.updateHistory(historyItem);
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        // StateManagerから履歴を取得して表示（今回は簡易実装）
        // 本来はHistoryDisplayコンポーネントを作成すべき
        const history = this.stateManager.getHistory() || [];
        const container = document.getElementById('recentDiagnosisContainer');
        const historyContainer = document.getElementById('historyContainer');

        // サイドバーの表示更新
        if (container && history.length > 0) {
            container.innerHTML = '';
            history.slice(0, 3).forEach(item => {
                const div = document.createElement('div');
                div.className = 'p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition';
                div.innerHTML = `
                    <p class="text-xs text-gray-500">${new Date(item.timestamp).toLocaleDateString()}</p>
                    <p class="text-sm font-medium">${item.results[0]?.club?.basic_info?.name || '診断結果'}</p>
                `;
                div.addEventListener('click', () => {
                    this.diagnosisEngine.calculateRecommendations(item.data).then(results => {
                        document.getElementById('diagnosis').scrollIntoView({ behavior: 'smooth' });
                        this.diagnosisData = item.data;
                        this.handleCalculation();
                    });
                });
                container.appendChild(div);
            });
        }

        // 履歴ページの表示更新
        if (historyContainer) {
            historyContainer.innerHTML = '';
            if (history.length === 0) {
                historyContainer.innerHTML = '<p class="text-gray-500 text-center py-8">診断履歴がありません</p>';
            } else {
                history.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'card cursor-pointer hover:shadow-lg transition';
                    div.innerHTML = `
                         <div class="flex justify-between items-start">
                             <div class="flex-1">
                                 <p class="text-sm text-gray-500 mb-2">${new Date(item.timestamp).toLocaleString()}</p>
                                 <h3 class="font-semibold text-lg mb-2">${item.results[0]?.club?.basic_info?.name || '診断結果'}</h3>
                                 <p class="text-gray-600">適合度: ${Math.round(item.results[0]?.compatibility || 0)}%</p>
                             </div>
                             <div class="text-right">
                                 <span class="text-green-600 font-semibold">¥${(item.results[0]?.club?.specifications?.price || 0).toLocaleString()}</span>
                             </div>
                         </div>
                     `;
                    div.addEventListener('click', () => {
                        this.diagnosisEngine.calculateRecommendations(item.data).then(results => {
                            document.getElementById('diagnosis').scrollIntoView({ behavior: 'smooth' });
                            this.diagnosisData = item.data;
                            this.handleCalculation();
                        });
                    });
                    historyContainer.appendChild(div);
                });
            }
        }
    }

    shareClub(name) {
        const text = `${name}がおすすめされました！ゴルフアイアン適性診断で最適なクラブを見つけよう`;
        const url = window.location.href;

        if (navigator.share) {
            navigator.share({ title: 'Golf Iron Advisor', text: text, url: url });
        } else {
            navigator.clipboard.writeText(`${text} ${url}`);
            this.showToast('クリップボードにコピーしました');
        }
    }

    // バリデーションエラー表示メソッド
    showFieldError(element, message) {
        element.classList.add('field-error');
        element.style.borderColor = '#ef4444';
        element.style.backgroundColor = '#fef2f2';
        
        // 既存のエラーメッセージがあれば削除
        const existingError = element.parentNode.querySelector('.field-error-message');
        if (existingError) existingError.remove();
        
        // エラーメッセージを追加
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ef4444; 
            font-size: 0.875rem; 
            margin-top: 0.5rem; 
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        // エラーアイコンを追加
        const iconSpan = document.createElement('span');
        iconSpan.textContent = '⚠';
        iconSpan.style.fontSize = '1rem';
        errorDiv.insertBefore(iconSpan, errorDiv.firstChild);
        
        element.parentNode.appendChild(errorDiv);
        
        // シェイクアニメーション
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => element.style.animation = '', 500);
    }

    highlightQuizOptions(stepElement) {
        const options = stepElement.querySelectorAll('.quiz-option');
        options.forEach(opt => {
            opt.style.animation = 'shake 0.5s ease-in-out';
            opt.style.borderColor = '#ef4444';
            setTimeout(() => {
                opt.style.animation = '';
                opt.style.borderColor = '';
            }, 2000);
        });
    }

    /**
     * ツールチップテキストを更新（言語切り替え対応）
     */
    updateTooltipTexts() {
        const lang = this.translationManager.currentLanguage;
        const translations = this.translationManager.translations[lang];
        
        document.querySelectorAll('.help-icon').forEach(icon => {
            const helpKey = icon.dataset.helpKey;
            if (translations && translations[helpKey]) {
                icon.dataset.helpText = translations[helpKey];
            }
        });
    }

    /**
     * リアルタイムバリデーションの設定
     */
    setupRealtimeValidation() {
        // 基本情報フィールドのバリデーション
        const heightEl = document.getElementById('height');
        const weightEl = document.getElementById('weight');
        const ageEl = document.getElementById('age');

        if (heightEl) {
            heightEl.addEventListener('blur', () => this.validateField(heightEl, 'height'));
            heightEl.addEventListener('input', () => this.clearFieldError(heightEl));
        }

        if (weightEl) {
            weightEl.addEventListener('blur', () => this.validateField(weightEl, 'weight'));
            weightEl.addEventListener('input', () => this.clearFieldError(weightEl));
        }

        if (ageEl) {
            ageEl.addEventListener('blur', () => this.validateField(ageEl, 'age'));
            ageEl.addEventListener('change', () => this.clearFieldError(ageEl));
        }
    }

    /**
     * 個別フィールドのバリデーション
     */
    validateField(element, fieldType) {
        const value = element.value.trim();
        let errorMessage = '';

        switch (fieldType) {
            case 'height':
                if (!value) {
                    errorMessage = '身長を入力してください';
                } else {
                    const height = parseFloat(value);
                    if (height < 140 || height > 200) {
                        errorMessage = '身長は140cm〜200cmの範囲で入力してください';
                    }
                }
                break;

            case 'weight':
                if (!value) {
                    errorMessage = '体重を入力してください';
                } else {
                    const weight = parseFloat(value);
                    if (weight < 40 || weight > 120) {
                        errorMessage = '体重は40kg〜120kgの範囲で入力してください';
                    }
                }
                break;

            case 'age':
                if (!value) {
                    errorMessage = '年齢を選択してください';
                }
                break;
        }

        if (errorMessage) {
            this.showFieldError(element, errorMessage);
            return false;
        } else {
            this.clearFieldError(element);
            return true;
        }
    }

    /**
     * フィールドエラーのクリア
     */
    clearFieldError(element) {
        element.classList.remove('field-error');
        element.style.borderColor = '';
        element.style.backgroundColor = '';
        element.style.animation = '';
        
        const errorMsg = element.parentNode.querySelector('.field-error-message');
        if (errorMsg) errorMsg.remove();
    }

    /**
     * すべてのフィールドをバリデート
     */
    validateAllFields(fields) {
        let isValid = true;
        let firstErrorField = null;

        fields.forEach(({ element, type }) => {
            if (!this.validateField(element, type)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = element;
                }
            }
        });

        // 最初のエラーフィールドにフォーカス
        if (firstErrorField) {
            firstErrorField.focus();
            // スムーズスクロール
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }
}

// PWAインストールプロンプト
let _pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _pwaInstallPrompt = e;
});
window._giaInstallPWA = async function() {
    if (!_pwaInstallPrompt) return;
    try {
        _pwaInstallPrompt.prompt();
        const { outcome } = await _pwaInstallPrompt.userChoice;
        localStorage.setItem('gia_pwa_prompted', '1');
        const bar = document.getElementById('gia-pwa-install-bar');
        if (bar) bar.style.display = 'none';
        if (outcome === 'accepted' && window.dataLayer) {
            window.dataLayer.push({ event: 'pwa_install', outcome: 'accepted' });
        }
        _pwaInstallPrompt = null;
    } catch(e) {}
};

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    // グローバルエラーハンドリング
    window.onerror = function (message, source, lineno, colno, error) {
        console.error('Global Error Caught:', error);
        if (window.appInstance && window.appInstance.showToast) {
            window.appInstance.showToast('予期せぬエラーが発生しました', 'error');
        }
        return false;
    };

    window.addEventListener('unhandledrejection', function (event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        if (window.appInstance && window.appInstance.showToast) {
            window.appInstance.showToast('通信または処理中にエラーが発生しました', 'error');
        }
    });

    window.appInstance = new App();
    window.appInstance.init();

    // 累積診断カウンター（ソーシャルプルーフ）— 表示のみ（診断完了時にインクリメント）
    (function() {
        try {
            var BASE = 2341;
            var stored = parseInt(localStorage.getItem('gia_total_count') || '0', 10);
            var count = Math.max(stored, BASE);
            var el = document.getElementById('gia-total-count');
            if (el) el.textContent = count.toLocaleString('ja-JP');
        } catch(e) {}
    })();

    // P5(横展開#22): クラブ購入チェックリスト保存・復元
    window._giaSaveCheck = function(el) {
        try { localStorage.setItem(el.dataset.key, el.checked ? '1' : '0'); } catch(e) {}
    };
    window._giaRestoreChecks = function() {
        try {
            document.querySelectorAll('.gia-check').forEach(function(el) {
                el.checked = localStorage.getItem(el.dataset.key) === '1';
            });
        } catch(e) {}
    };

    // P3(横展開#22): 前回の診断リマインダー（2回目訪問ユーザー向け）
    (function() {
        try {
            var prev = JSON.parse(localStorage.getItem('gia_last_result') || 'null');
            if (!prev || !prev.name) return;
            var hint = document.getElementById('gia-prev-result-hint');
            var textEl = document.getElementById('gia-prev-result-text');
            if (hint && textEl) {
                textEl.textContent = '「' + prev.name + '」が' + prev.score + '%マッチ — 試打・購入はお済みですか？';
                hint.style.display = 'block';
            }
        } catch(e) {}
    })();

    // P2: 共有URLパラメーターで診断結果プレビューバナーを表示（横展開#21）
    (function() {
        try {
            var params = new URLSearchParams(window.location.search);
            var sharedTop = params.get('top');
            var sharedScore = params.get('score');
            if (sharedTop && sharedScore) {
                var banner = document.getElementById('gia-shared-result-banner');
                if (banner) {
                    var textEl = document.getElementById('gia-shared-result-text');
                    if (textEl) textEl.textContent = '「' + sharedTop + '」が適合率' + sharedScore + '%！';
                    banner.style.display = 'block';
                }
            }
        } catch(e) {}
    })();

    // 簡易フィードバック機能（後方互換用）
    window._giaFeedback = function(type) {
        try {
            const thanks = document.getElementById('gia-fb-thanks');
            if (thanks) thanks.classList.remove('hidden');
            if (window.dataLayer) {
                window.dataLayer.push({ event: 'diagnosis_feedback', feedback_type: type });
            }
        } catch(e) {}
    };

    // ★星評価フィードバック機能
    window._giaStarRate = function(rating) {
        try {
            const stars = document.querySelectorAll('.gia-star-btn');
            stars.forEach(function(btn) {
                const s = parseInt(btn.getAttribute('data-star'));
                btn.style.color = s <= rating ? '#f59e0b' : '#d1d5db';
                btn.style.transform = s === rating ? 'scale(1.3)' : 'scale(1)';
                btn.disabled = true;
            });
            const thanks = document.getElementById('gia-fb-thanks');
            if (thanks) thanks.classList.remove('hidden');
            try {
                const prev = JSON.parse(localStorage.getItem('gia_ratings') || '[]');
                prev.push({ ts: Date.now(), rating: rating });
                localStorage.setItem('gia_ratings', JSON.stringify(prev.slice(-20)));
            } catch(e) {}
            if (window.dataLayer) {
                window.dataLayer.push({ event: 'diagnosis_star_rating', rating: rating });
            }
        } catch(e) {}
    };

    // ★ホバーエフェクト
    (function() {
        try {
            document.addEventListener('mouseover', function(e) {
                const btn = e.target.closest && e.target.closest('.gia-star-btn');
                if (!btn || btn.disabled) return;
                const hoverStar = parseInt(btn.getAttribute('data-star'));
                document.querySelectorAll('.gia-star-btn').forEach(function(b) {
                    b.style.color = parseInt(b.getAttribute('data-star')) <= hoverStar ? '#fbbf24' : '#d1d5db';
                });
            });
            document.addEventListener('mouseout', function(e) {
                const btn = e.target.closest && e.target.closest('.gia-star-btn');
                if (!btn || btn.disabled) return;
                document.querySelectorAll('.gia-star-btn').forEach(function(b) {
                    b.style.color = b.disabled ? '' : '#d1d5db';
                });
            });
        } catch(e) {}
    })();

    // P2(横展開#23): 季節連動バナー（ゴルフシーズン別CTA）
    (function() {
        try {
            const m = new Date().getMonth() + 1;
            const seasons = {
                season: { months: [4,5,6,7,8,9,10], msg: '⛳ ゴルフシーズン！古いクラブを売って新しいアイアンへ', ctaUrl: 'https://px.a8.net/svt/ejp?a8mat=4B3WJ7+5T1GOA+5O4W+2HB8GI', ctaText: '出張買取ウリエル – 無料査定 →', color: '#065f46' },
                offseason: { months: [11,12,1,2,3], msg: '❄️ オフシーズンに古いクラブを売って来春に備えよう', ctaUrl: 'https://px.a8.net/svt/ejp?a8mat=4B3WJ7+5T1GOA+5O4W+2HB8GI', ctaText: '出張買取ウリエル – 無料査定 →', color: '#065f46' }
            };
            const season = m >= 4 && m <= 10 ? seasons.season : seasons.offseason;
            const banner = document.getElementById('gia-season-banner');
            if (!banner) return;
            banner.style.background = m >= 4 && m <= 10 ? 'linear-gradient(to right,#ecfdf5,#d1fae5)' : 'linear-gradient(to right,#eff6ff,#dbeafe)';
            const msgEl = document.getElementById('gia-season-msg');
            const ctaEl = document.getElementById('gia-season-cta');
            if (msgEl) msgEl.textContent = season.msg;
            if (ctaEl) { ctaEl.href = season.ctaUrl; ctaEl.textContent = season.ctaText; ctaEl.style.color = season.color; }
            banner.style.display = 'block';
        } catch(e) {}
    })();

    // P2-6: シェア機能
    window.appInstance = app;
    app.initializeShareButtons = function(results) {
        const shareSection = document.getElementById('gia-share-section');
        if (!shareSection) return;
        shareSection.classList.remove('hidden');

        const twitterBtn = document.getElementById('gia-share-twitter');
        const lineBtn = document.getElementById('gia-share-line');
        const copyBtn = document.getElementById('gia-share-copy');

        const baseUrl = window.location.origin + window.location.pathname;
        const resultText = `${results.topClub.maker} ${results.topClub.model} - ゴルフアイアン適性診断で推奨されました！`;

        if (twitterBtn) {
            twitterBtn.addEventListener('click', () => {
                const text = `私のゴルフアイアン適性診断結果は「${resultText}」です！あなたも試してみませんか？`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(baseUrl)}`;
                window.open(url, '_blank', 'width=600,height=400');
            });
        }

        if (lineBtn) {
            lineBtn.addEventListener('click', () => {
                const message = `${resultText}\n\n${baseUrl}`;
                const url = `https://line.me/R/msg/text/${encodeURIComponent(message)}`;
                window.open(url, '_blank');
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = `${resultText}\n${baseUrl}`;
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.textContent = '✓ コピー完了';
                    setTimeout(() => { copyBtn.textContent = '🔗 リンクコピー'; }, 2000);
                }).catch(err => console.error('Copy failed:', err));
            });
        }
    };
});
