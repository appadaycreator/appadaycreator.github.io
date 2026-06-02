/**
 * 目標UIコンポーネント
 * AI開発対応: 明確なUI構造とイベント処理
 * @class GoalComponent
 */
class GoalComponent {
    /**
     * コンポーネントを初期化
     * @param {HTMLElement} container - コンテナ要素
     * @param {GoalService} goalService - 目標サービス
     * @param {UIManager} uiManager - UI管理サービス
     */
    constructor(container, goalService, uiManager) {
        this.container = container;
        this.goalService = goalService;
        this.uiManager = uiManager;
        this.eventHandlers = new Map();
        
        this._bindServiceEvents();
    }

    /**
     * サービスイベントをバインド
     * @private
     */
    _bindServiceEvents() {
        this.goalService.addEventListener('goalCreated', () => this.render());
        this.goalService.addEventListener('goalUpdated', () => this.render());
        this.goalService.addEventListener('goalDeleted', () => this.render());
        this.goalService.addEventListener('stepAdded', () => this.render());
        this.goalService.addEventListener('stepToggled', () => this.render());
    }

    /**
     * 目標一覧をレンダリング
     * AI開発対応: 明確なレンダリングロジック
     */
    render() {
        const goals = this.goalService.getAll();
        
        if (goals.length === 0) {
            this._renderEmptyState();
            return;
        }

        this.container.innerHTML = '';
        goals.forEach(goal => {
            const goalElement = this._createGoalCard(goal);
            this.container.appendChild(goalElement);
        });

        this._bindEvents();
    }

    /**
     * 空状態をレンダリング
     * @private
     */
    _renderEmptyState() {
        this.container.innerHTML = `
            <div class="text-center py-16">
                <div class="mb-4 text-6xl">🎯</div>
                <h3 class="text-2xl font-bold text-white mb-3">
                    まだ目標が設定されていません
                </h3>
                <p class="text-purple-100 mb-8 text-lg">
                    最初の目標を設定して、夢への第一歩を踏み出しましょう！
                </p>
                <button
                    onclick="uiManager.showModal('goalModal')"
                    class="px-8 py-4 bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition-colors font-bold text-lg shadow-lg"
                >
                    + 最初の目標を作成する
                </button>
            </div>
        `;
    }

    /**
     * 目標カードを作成
     * @private
     * @param {GoalModel} goal - 目標インスタンス
     * @returns {HTMLElement} 目標カード要素
     */
    _createGoalCard(goal) {
        const progress = goal.calculateProgress();
        const deadline = new Date(goal.deadline).toLocaleDateString('ja-JP');
        const isOverdue = new Date(goal.deadline) < new Date() && !goal.completed;
        
        const cardElement = document.createElement('div');
        cardElement.className = `goal-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 ${
            goal.completed ? 'opacity-75 border-l-4 border-green-500' : ''
        } ${isOverdue ? 'border-l-4 border-red-500' : ''}`;
        cardElement.dataset.goalId = goal.id;

        cardElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800 ${goal.completed ? 'line-through' : ''}">
                        ${this._escapeHtml(goal.title)}
                        ${goal.completed ? '<i class="fas fa-check-circle text-green-500 ml-2"></i>' : ''}
                        ${isOverdue ? '<i class="fas fa-exclamation-triangle text-red-500 ml-2"></i>' : ''}
                    </h3>
                    <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span class="goal-type-badge bg-${this._getTypeColor(goal.type)}-100 text-${this._getTypeColor(goal.type)}-800 px-2 py-1 rounded-full">
                            ${this._getTypeLabel(goal.type)}
                        </span>
                        <span>期限: ${deadline}</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-${progress === 100 ? 'green' : 'blue'}-600">
                        ${progress}%
                    </div>
                    <div class="text-xs text-gray-500">進捗</div>
                </div>
            </div>

            ${goal.description ? `
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                    ${this._escapeHtml(goal.description)}
                </p>
            ` : ''}

            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">進捗</span>
                    <span class="text-sm text-gray-600">${progress}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        class="bg-gradient-to-r from-${progress === 100 ? 'green' : 'blue'}-500 to-${progress === 100 ? 'green' : 'blue'}-600 h-3 rounded-full transition-all duration-500" 
                        style="width: ${progress}%"
                    ></div>
                </div>
            </div>

            ${goal.customSteps.length > 0 ? `
                <div class="mb-4">
                    <div class="text-sm text-gray-600 mb-2">
                        カスタムステップ (${goal.customSteps.filter(s => s.completed).length}/${goal.customSteps.length})
                    </div>
                    <div class="flex flex-wrap gap-1">
                        ${goal.customSteps.slice(0, 3).map(step => `
                            <span class="inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                step.completed 
                                    ? 'bg-green-100 text-green-800' 
                                    : `bg-${this._getPriorityColor(step.priority)}-100 text-${this._getPriorityColor(step.priority)}-800`
                            }">
                                ${step.completed ? '<i class="fas fa-check mr-1"></i>' : ''}
                                ${this._escapeHtml(step.title)}
                            </span>
                        `).join('')}
                        ${goal.customSteps.length > 3 ? `
                            <span class="text-xs text-gray-500">+${goal.customSteps.length - 3}個</span>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <div class="flex flex-wrap gap-2">
                <button 
                    onclick="goalComponents.showAddStepModal(${goal.id})" 
                    class="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <i class="fas fa-plus mr-1"></i>ステップ追加
                </button>
                <button 
                    onclick="goalComponents.showGoalDetails(${goal.id})" 
                    class="flex-1 sm:flex-none px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <i class="fas fa-eye mr-1"></i>詳細
                </button>
                <button 
                    onclick="goalComponents.showDeleteConfirm(${goal.id})" 
                    class="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                    <i class="fas fa-trash mr-1"></i>削除
                </button>
            </div>
        `;

        return cardElement;
    }

    /**
     * イベントをバインド
     * @private
     */
    _bindEvents() {
        // カード要素の詳細表示（クリック）
        this.container.querySelectorAll('.goal-card').forEach(card => {
            const titleElement = card.querySelector('h3');
            if (titleElement) {
                titleElement.style.cursor = 'pointer';
                titleElement.addEventListener('click', () => {
                    const goalId = card.dataset.goalId;
                    this.showGoalDetails(Number(goalId));
                });
            }
        });
    }

    /**
     * ステップ追加モーダルを表示
     * @param {number} goalId - 目標ID
     */
    showAddStepModal(goalId) {
        const goal = this.goalService.get(goalId);
        if (!goal) return;

        // モーダル内の目標ID設定
        const targetGoalIdField = document.getElementById('targetGoalId');
        if (targetGoalIdField) {
            targetGoalIdField.value = goalId;
        }

        // 日付の初期値設定
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        const startDateField = document.getElementById('stepStartDate');
        const endDateField = document.getElementById('stepEndDate');
        
        if (startDateField) startDateField.value = today;
        if (endDateField) endDateField.value = nextWeekStr;

        this.uiManager.showModal('stepModal');
    }

    /**
     * 目標詳細を表示
     * @param {number} goalId - 目標ID
     */
    showGoalDetails(goalId) {
        const goal = this.goalService.get(goalId);
        if (!goal) return;

        const modal = document.getElementById('goalDetailsModal');
        if (!modal) return;

        // タイトル設定
        const titleElement = modal.querySelector('#goalDetailsTitle');
        if (titleElement) {
            titleElement.textContent = goal.title;
            titleElement.dataset.goalId = goal.id;
        }

        // 詳細コンテンツ生成
        const contentElement = modal.querySelector('#goalDetailsContent');
        if (contentElement) {
            contentElement.innerHTML = this._generateGoalDetailsContent(goal);
        }

        this.uiManager.showModal('goalDetailsModal');
    }

    /**
     * 削除確認ダイアログを表示
     * @param {number} goalId - 目標ID
     */
    showDeleteConfirm(goalId) {
        const goal = this.goalService.get(goalId);
        if (!goal) return;

        // 他のモーダルを閉じる
        this.uiManager.hideModal('goalDetailsModal');

        // 削除対象の目標情報設定
        const deleteGoalIdField = document.getElementById('deleteGoalId');
        const deleteMessageElement = document.getElementById('deleteGoalMessage');
        
        if (deleteGoalIdField) deleteGoalIdField.value = goalId;
        if (deleteMessageElement) {
            deleteMessageElement.textContent = `「${goal.title}」を削除しますか？`;
        }

        this.uiManager.showModal('deleteGoalModal');
    }

    /**
     * 目標詳細コンテンツを生成
     * @private
     * @param {GoalModel} goal - 目標インスタンス
     * @returns {string} HTML文字列
     */
    _generateGoalDetailsContent(goal) {
        const progress = goal.calculateProgress();
        const deadline = new Date(goal.deadline).toLocaleDateString('ja-JP');
        
        return `
            <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-700 mb-2">基本情報</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">タイプ:</span>
                            <span class="ml-2">${this._getTypeLabel(goal.type)}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">期限:</span>
                            <span class="ml-2">${deadline}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">作成日:</span>
                            <span class="ml-2">${new Date(goal.createdAt).toLocaleDateString('ja-JP')}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">進捗:</span>
                            <span class="ml-2 font-semibold text-blue-600">${progress}%</span>
                        </div>
                    </div>
                    ${goal.description ? `
                        <div class="mt-3">
                            <span class="text-gray-600">説明:</span>
                            <p class="mt-1 text-gray-800">${this._escapeHtml(goal.description)}</p>
                        </div>
                    ` : ''}
                </div>

                ${goal.customSteps.length > 0 ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-3">カスタムステップ</h3>
                        <div class="space-y-2">
                            ${goal.customSteps.map(step => `
                                <div class="flex items-center justify-between p-3 border rounded-lg ${
                                    step.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                                }">
                                    <div class="flex items-center space-x-3">
                                        <button 
                                            onclick="goalService.toggleStepCompletion(${goal.id}, ${step.id})" 
                                            class="w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                step.completed 
                                                    ? 'bg-green-500 border-green-500 text-white' 
                                                    : 'border-gray-300 hover:border-blue-500'
                                            }"
                                        >
                                            ${step.completed ? '<i class="fas fa-check text-xs"></i>' : ''}
                                        </button>
                                        <div>
                                            <div class="font-medium ${step.completed ? 'line-through text-gray-500' : ''}">
                                                ${this._escapeHtml(step.title)}
                                            </div>
                                            ${step.description ? `
                                                <div class="text-sm text-gray-600">
                                                    ${this._escapeHtml(step.description)}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xs px-2 py-1 rounded-full bg-${this._getPriorityColor(step.priority)}-100 text-${this._getPriorityColor(step.priority)}-800">
                                            ${step.priority}
                                        </span>
                                        <button 
                                            onclick="goalComponents.deleteStep(${goal.id}, ${step.id})" 
                                            class="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="border-t pt-4">
                    <button 
                        onclick="goalComponents.showDeleteConfirm(${goal.id})" 
                        class="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <i class="fas fa-trash mr-2"></i>この目標を削除
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * ステップを削除
     * @param {number} goalId - 目標ID
     * @param {number} stepId - ステップID
     */
    async deleteStep(goalId, stepId) {
        if (!confirm('このステップを削除してもよろしいですか？')) return;

        try {
            const goal = this.goalService.get(goalId);
            if (goal && goal.removeCustomStep(stepId)) {
                await this.goalService._saveGoals();
                this.showGoalDetails(goalId); // モーダルを更新
                this.uiManager.showToast('ステップを削除しました', 'info');
            }
        } catch (error) {
            console.error('Failed to delete step:', error);
            this.uiManager.showToast('ステップの削除に失敗しました', 'error');
        }
    }

    /**
     * ユーティリティメソッド
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    _getTypeColor(type) {
        const colors = { habit: 'green', project: 'blue', numeric: 'purple' };
        return colors[type] || 'gray';
    }

    _getTypeLabel(type) {
        const labels = { habit: '習慣化目標', project: 'プロジェクト目標', numeric: '数値目標' };
        return labels[type] || type;
    }

    _getPriorityColor(priority) {
        const colors = { high: 'red', medium: 'yellow', low: 'green' };
        return colors[priority] || 'gray';
    }
}

// グローバルエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoalComponent;
} else if (typeof window !== 'undefined') {
    window.GoalComponent = GoalComponent;
}