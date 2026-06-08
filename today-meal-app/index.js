// Today Meal App - メインアプリケーション
// ==================== メインアプリケーション ====================

// Supabaseクライアントの初期化
let supabase = null;

// グローバル変数
let meals = [];
let filteredMeals = [];
let currentFilters = {
  search: '',
  category: 'all',
  favorite: 'all',
  sort: 'date-desc'
};

let categories = [];
let ingredients = [];

// デバッグモード
const DEBUG_MODE = localStorage.getItem('debug_mode') === 'true';

function debugLog(message, data = null) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// Supabase接続エラーのフラグ
let supabaseConnectionError = false;

// Supabaseクライアントの初期化
function initializeSupabase() {
  try {
    if (typeof window !== 'undefined' && window.supabase && Config && Config.supabase) {
      // 設定が有効かチェック
      if (Config.supabase.url === 'https://your-project.supabase.co' || 
          Config.supabase.anonKey === 'your-anon-key-here') {
        debugLog('Supabase configuration is not set, skipping initialization');
        return false;
      }
      
      // 無効なURLパターンをチェック
      if (!Config.supabase.url || !Config.supabase.url.startsWith('https://')) {
        debugLog('Invalid Supabase URL format');
        return false;
      }
      
      supabase = window.supabase.createClient(Config.supabase.url, Config.supabase.anonKey, {
        auth: {
          autoRefreshToken: false, // 自動リフレッシュを無効化してエラーを抑制
          persistSession: false, // セッションを永続化しない
          detectSessionInUrl: false // URLからセッションを検出しない
        }
      });
      
      debugLog('Supabase client initialized');
      supabaseConnectionError = false;
      return true;
    } else {
      debugLog('Supabase client initialization failed: missing dependencies');
      return false;
    }
  } catch (error) {
    debugLog('Supabase client initialization error:', error);
    supabaseConnectionError = true;
    return false;
  }
}

// テスト用にグローバルに公開
if (typeof window !== 'undefined') {
  window.initializeSupabase = initializeSupabase;
}

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  // Supabase接続エラーは無視（既にハンドリング済み）
  if (event.error && event.error.message && 
      (event.error.message.includes('Failed to fetch') || 
       event.error.message.includes('ERR_NAME_NOT_RESOLVED') ||
       event.error.message.includes('supabase.co'))) {
    if (!supabaseConnectionError) {
      supabaseConnectionError = true;
//       console.warn('Supabase接続エラーが検出されました。Supabase機能は無効化されます。');
      supabase = null; // Supabaseクライアントを無効化
    }
    event.preventDefault(); // エラーを抑制
    return;
  }
  
  debugLog('Global error:', event.error);
  showToast('予期しないエラーが発生しました', 'danger');
});

window.addEventListener('unhandledrejection', (event) => {
  // Supabase接続エラーは無視（既にハンドリング済み）
  if (event.reason && 
      (event.reason.message && (
        event.reason.message.includes('Failed to fetch') || 
        event.reason.message.includes('ERR_NAME_NOT_RESOLVED') ||
        event.reason.message.includes('supabase.co')
      ) || 
      event.reason.name === 'AuthRetryableFetchError')) {
    if (!supabaseConnectionError) {
      supabaseConnectionError = true;
//       console.warn('Supabase接続エラーが検出されました。Supabase機能は無効化されます。');
      supabase = null; // Supabaseクライアントを無効化
    }
    event.preventDefault(); // エラーを抑制
    return;
  }
  
  debugLog('Unhandled promise rejection:', event.reason);
  showToast('非同期処理でエラーが発生しました', 'danger');
});

// パフォーマンス監視
function measurePerformance(name, fn) {
  return Utils.performance.measureTime(name, fn);
}

// アニメーション機能（将来の使用のために保持）
// function addAnimation(element, animationClass) {
//   try {
//     element.classList.add(animationClass);
//     setTimeout(() => {
//       element.classList.remove(animationClass);
//     }, 300);
//   } catch (error) {
//     console.error('アニメーションエラー:', error);
//   }
// }

// スクリーンリーダー向けアナウンス機能（将来の使用のために保持）
// function announceToScreenReader(message) {
//   try {
//     const announcement = document.createElement('div');
//     announcement.setAttribute('aria-live', 'polite');
//     announcement.setAttribute('aria-atomic', 'true');
//     announcement.className = 'sr-only';
//     announcement.textContent = message;
//     
//     document.body.appendChild(announcement);
//     
//     setTimeout(() => {
//       document.body.removeChild(announcement);
//     }, 1000);
//   } catch (error) {
//     console.error('スクリーンリーダー通知エラー:', error);
//   }
// }

// 食事時間帯のヘルパー関数
function getMealTimeEmoji(mealTime) {
  const emojis = {
    'breakfast': '🌅',
    'lunch': '🌞',
    'dinner': '🌙',
    'snack': '🍪'
  };
  return emojis[mealTime] || '';
}

function getMealTimeName(mealTime) {
  const names = {
    'breakfast': '朝食',
    'lunch': '昼食',
    'dinner': '夕食',
    'snack': '間食'
  };
  return names[mealTime] || '';
}

// キーボードナビゲーション
function setupKeyboardNavigation() {
  try {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+D でデバッグモード切り替え
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDebugMode();
      }
      
      // Ctrl+Shift+T でテスト実行
      if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        runTests();
      }
      
      // Escape でモーダルを閉じる
      if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
          const bsModal = bootstrap.Modal.getInstance(modal);
          if (bsModal) {
            bsModal.hide();
          }
        });
      }
    });
    
    debugLog('キーボードナビゲーション設定完了');
  } catch (error) {
    // console.error('キーボードナビゲーション設定エラー:', error);
  }
}

// デバッグモード切り替え
function toggleDebugMode() {
  try {
    const newMode = !DEBUG_MODE;
    localStorage.setItem('debug_mode', newMode.toString());
    
    showToast(`デバッグモード: ${newMode ? 'ON' : 'OFF'}`, 'info');
    
    // ページをリロードしてデバッグモードを反映
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    // console.error('デバッグモード切り替えエラー:', error);
  }
}

// テスト実行
function runTests() {
  try {
    showToast('テストを実行中...', 'info');
    
    // 基本的な機能テスト
    const tests = [
      () => validateMealName('テスト料理'),
      () => validateCategory('テストカテゴリ'),
      () => validateIngredient('テスト食材'),
      () => loadCategories(),
      () => loadIngredients()
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach((test, index) => {
      try {
        const result = test();
        if (result !== false && result !== null) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        // console.error(`テスト ${index + 1} 失敗:`, error);
        failed++;
      }
    });
    
    showToast(`テスト完了: ${passed}件成功, ${failed}件失敗`, failed === 0 ? 'success' : 'warning');
  } catch (error) {
    // console.error('テスト実行エラー:', error);
    showToast('テスト実行に失敗しました', 'danger');
  }
}

// アプリケーション初期化
async function initializeApp() {
  try {
    debugLog('アプリケーション初期化開始');
    
    // 設定を読み込み
    await loadConfig();
    
    // データを読み込み
    categories = loadCategories();
    ingredients = loadIngredients();
    
    // UIを初期化
    initializeUI();
    
    // イベントリスナーを設定
    setupEventListeners();
    
    // テーマを初期化
    initializeTheme();
    
    // キーボードナビゲーションを設定
    setupKeyboardNavigation();
    
    // Supabaseクライアントを初期化
    if (initializeSupabase()) {
      // Keep-Alive機能を開始（自動pauseを防ぐ）
      startKeepAlive();
    }
    
    // 認証状態に応じたUI更新
    await updateAuthUI();
    
    // 料理データを読み込み
    await loadMeals();
    
    debugLog('アプリケーション初期化完了');
  } catch (error) {
    // console.error('アプリケーション初期化エラー:', error);
    showToast('アプリケーションの初期化に失敗しました', 'danger');
  }
}

// UI初期化
function initializeUI() {
  try {
    // カテゴリオプションを更新
    updateCategoryOptions();
    
    // 食材オプションを更新
    updateIngredientOptions();
    
    // フォームをリセット
    resetForm();
    
    debugLog('UI初期化完了');
  } catch (error) {
    // console.error('UI初期化エラー:', error);
  }
}

// イベントリスナー設定
function setupEventListeners() {
  try {
    // フォーム送信
    const mealForm = document.getElementById('meal-form');
    if (mealForm) {
      mealForm.addEventListener('submit', handleMealSubmit);
    }
    
    // 検索フィルタ
    const searchInput = document.getElementById('meal-search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(handleSearch, 250));
    }
    
    // カテゴリフィルタ
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', handleCategoryFilter);
    }
    
    // お気に入りフィルタ
    const favoriteFilter = document.getElementById('favorite-filter');
    if (favoriteFilter) {
      favoriteFilter.addEventListener('change', handleFavoriteFilter);
    }
    
    // ソート
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', handleSort);
    }
    
    // フィルタクリア
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // ソート
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', handleSort);
    }

    // フィルタクリア
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // お気に入りフィルタ（トグルボタン）
    const favFilterBtn = document.getElementById('favorite-filter');
    if (favFilterBtn) {
      favFilterBtn.addEventListener('click', () => {
        const isActive = favFilterBtn.classList.toggle('active');
        currentFilters.favorite = isActive ? 'favorites' : 'all';
        favFilterBtn.title = isActive ? 'お気に入りのみ表示中' : 'お気に入りフィルタ';
        applyFilters();
      });
    }

    // ナビゲーション
    setupNavigation();

    // 提案機能
    setupSuggestions();

    // テーマ切り替え
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
    
    // ログインボタン
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('login');
      });
    }
    
    // 新規登録ボタン
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
      signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('signup');
      });
    }
    
    // ログアウトボタン
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
      });
    }
    
    // 認証フォーム送信
    const authForm = document.getElementById('auth-form');
    if (authForm) {
      authForm.addEventListener('submit', handleAuthSubmit);
    }
    
    debugLog('イベントリスナー設定完了');
  } catch (error) {
    // console.error('イベントリスナー設定エラー:', error);
  }
}

// ゲストモード用: ローカルに料理を保存してUIを更新
function saveMealLocally(mealData) {
  const newMeal = Object.assign({}, mealData, {
    _id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const localMeals = loadMealsFromLocal();
  localMeals.unshift(newMeal);
  saveMealsToLocal(localMeals);

  meals.unshift(newMeal);
  filteredMeals = [...meals];

  if (newMeal.category && !categories.includes(newMeal.category)) {
    categories.push(newMeal.category);
    saveCategories(categories);
    updateCategoryOptions();
  }

  if (newMeal.ingredients) {
    newMeal.ingredients.forEach(ingredient => {
      if (!ingredients.includes(ingredient)) {
        ingredients.push(ingredient);
      }
    });
    saveIngredients(ingredients);
  }

  renderMealList();
  updateCategoryFilter();
  updateSearchResultsCounter();
  resetForm();
  showToast('料理を追加しました', 'success');
}

// カテゴリフィルタのオプションを更新
function updateCategoryFilter() {
  const filter = document.getElementById('category-filter');
  if (!filter) return;

  const currentVal = filter.value;
  const usedCategories = [...new Set(meals.map(m => m.category).filter(Boolean))];

  filter.innerHTML = '<option value="">すべてのカテゴリ</option>';
  usedCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  filter.value = usedCategories.includes(currentVal) ? currentVal : '';
}

// デバウンス関数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 料理データ読み込み
async function loadMeals() {
  try {
    debugLog('料理データ読み込み開始');
    
    // Supabase未接続の場合はゲストモード（localStorage）で動作
    if (supabaseConnectionError) {
      debugLog('ゲストモード: localStorageからデータを読み込み');
      meals = loadMealsFromLocal();
      filteredMeals = [...meals];
      renderMealList();
      updateCategoryFilter();
      updateSearchResultsCounter();
      return;
    }

    // Supabaseクライアントの初期化チェック
    if (!supabase) {
      if (!initializeSupabase()) {
        debugLog('ゲストモード: localStorageからデータを読み込み');
        meals = loadMealsFromLocal();
        filteredMeals = [...meals];
        renderMealList();
        updateCategoryFilter();
        updateSearchResultsCounter();
        return;
      }
    }

    // 認証状態をチェック（未ログイン時はゲストモード）
    const user = await getCurrentUser();
    if (!user) {
      debugLog('ゲストモード: localStorageからデータを読み込み');
      meals = loadMealsFromLocal();
      filteredMeals = [...meals];
      renderMealList();
      updateCategoryFilter();
      updateSearchResultsCounter();
      return;
    }
    
    // Supabaseからデータを取得
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('capturedate', { ascending: false });
    
    if (error) {
      debugLog('料理データ読み込みエラー:', error);
      // 404エラー（認証エラーまたはテーブル不存在）の場合は空配列を返す
      if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('Not Found')) {
        debugLog('認証エラーまたはテーブル不存在のため、空配列を返します');
        meals = [];
        filteredMeals = [];
        renderMealList();
        updateSearchResultsCounter();
        return;
      }
      // 接続エラーの場合はフラグを設定
      if (error.message && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('ERR_NAME_NOT_RESOLVED') ||
        error.message.includes('NetworkError')
      )) {
        supabaseConnectionError = true;
        supabase = null;
      }
      meals = [];
      filteredMeals = [];
      renderMealList();
      updateSearchResultsCounter();
      return;
    }
    
    meals = data || [];
    filteredMeals = [...meals];
    
    // ローカルストレージのお気に入りと同期
    syncLocalFavorites();
    
    // UIを更新
    renderMealList();
    updateSearchResultsCounter();
    
    debugLog('料理データ読み込み完了', { count: meals.length });
  } catch (error) {
    debugLog('料理データ読み込みエラー:', error);
    // 404エラー（認証エラーまたはテーブル不存在）の場合は空配列を返す
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      debugLog('認証エラーまたはテーブル不存在のため、空配列を返します');
      meals = [];
      filteredMeals = [];
      renderMealList();
      updateSearchResultsCounter();
      return;
    }
    // 接続エラーの場合はフラグを設定
    if (error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('ERR_NAME_NOT_RESOLVED') ||
      error.message.includes('NetworkError')
    )) {
      supabaseConnectionError = true;
      supabase = null;
    }
    meals = [];
    filteredMeals = [];
    renderMealList();
    updateSearchResultsCounter();
  }
}

// ローカルストレージのお気に入りと同期
function syncLocalFavorites() {
  try {
    const localFavorites = loadFavorites();
    
    meals.forEach(meal => {
      if (localFavorites[meal._id] !== undefined) {
        meal.is_favorite = localFavorites[meal._id];
      }
    });
    
    debugLog('お気に入り同期完了');
  } catch (error) {
    // console.error('お気に入り同期エラー:', error);
  }
}

// 料理一覧の描画
function renderMealList() {
  try {
    const mealList = document.getElementById('meal-list');
    if (!mealList) return;
    
    if (filteredMeals.length === 0) {
      mealList.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-emoji-frown fs-1 text-muted"></i>
          <p class="mt-3 text-muted">まだ料理が登録されていません</p>
          <p class="text-muted">上のフォームから料理を追加してください</p>
        </div>
      `;
      return;
    }
    
    const fragment = document.createDocumentFragment();
    
    filteredMeals.forEach(meal => {
      const mealCard = createMealCard(meal);
      fragment.appendChild(mealCard);
    });
    
    mealList.innerHTML = '';
    mealList.appendChild(fragment);
    
    debugLog('料理一覧描画完了', { count: filteredMeals.length });
  } catch (error) {
    // console.error('料理一覧描画エラー:', error);
  }
}

// 料理カードの作成
function createMealCard(meal) {
  try {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    card.innerHTML = `
      <div class="card h-100 meal-card" data-meal-id="${meal._id}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="card-title mb-0" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(meal.name)}</h6>
            <div class="d-flex gap-1 ms-2 flex-shrink-0">
              <button class="btn btn-sm btn-outline-warning favorite-btn"
                      data-meal-id="${meal._id}"
                      title="${meal.is_favorite ? 'お気に入りから削除' : 'お気に入りに追加'}">
                <i class="bi ${meal.is_favorite ? 'bi-star-fill' : 'bi-star'}"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger delete-btn"
                      data-meal-id="${meal._id}"
                      title="削除">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
          <p class="card-text text-muted small mb-2">
            <i class="bi bi-calendar3"></i> ${meal.capturedate}
            ${meal.category ? `<span class="ms-2"><i class="bi bi-tag"></i> ${escapeHtml(meal.category)}</span>` : ''}
            ${meal.meal_time ? `<span class="ms-2">${getMealTimeEmoji(meal.meal_time)} ${getMealTimeName(meal.meal_time)}</span>` : ''}
          </p>
          ${meal.ingredients && meal.ingredients.length > 0 ? `
            <div class="ingredients mb-2">
              ${meal.ingredients.map(ingredient => 
                `<span class="badge bg-secondary me-1">${escapeHtml(ingredient)}</span>`
              ).join('')}
            </div>
          ` : ''}
          ${meal.image ? `
            <div class="meal-image mb-2">
              <img src="${meal.image}" alt="${escapeHtml(meal.name)}" 
                   class="img-fluid rounded" style="max-height: 150px; object-fit: cover;">
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // お気に入りボタンのイベントリスナー
    const favoriteBtn = card.querySelector('.favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(meal._id);
      });
    }

    // 削除ボタンのイベントリスナー
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteMeal(meal._id, meal.name);
      });
    }

    return card;
  } catch (error) {
    // console.error('料理カード作成エラー:', error);
    return document.createElement('div');
  }
}

// お気に入り切り替え
async function toggleFavorite(mealId) {
  try {
    const meal = meals.find(m => m._id === mealId);
    if (!meal) return;
    
    const newFavoriteStatus = !meal.is_favorite;
    
    // メモリ内のデータを更新
    meal.is_favorite = newFavoriteStatus;

    // localStorageの料理データを更新（ゲストモード含む）
    const localMeals = loadMealsFromLocal();
    const localIdx = localMeals.findIndex(m => m._id === mealId);
    if (localIdx >= 0) {
      localMeals[localIdx].is_favorite = newFavoriteStatus;
      saveMealsToLocal(localMeals);
    }

    // お気に入りオブジェクトも更新（後方互換）
    const favorites = loadFavorites();
    favorites[mealId] = newFavoriteStatus;
    saveFavorites(favorites);

    // UIを即時更新
    renderMealList();
    updateSearchResultsCounter();

    showToast(
      newFavoriteStatus ? 'お気に入りに追加しました' : 'お気に入りから削除しました',
      'success'
    );

    // Supabase接続がある場合はバックグラウンドで同期
    if (!supabaseConnectionError && supabase) {
      const user = await getCurrentUser();
      if (user) {
        supabase.from('meals').update({ is_favorite: newFavoriteStatus }).eq('_id', mealId)
          .then(({ error }) => { if (error) debugLog('Supabaseお気に入り同期エラー:', error); });
      }
    }
    
    debugLog('お気に入り切り替え完了', { mealId, favorite: newFavoriteStatus });
  } catch (error) {
    // console.error('お気に入り切り替えエラー:', error);
    showToast('お気に入りの切り替えに失敗しました', 'danger');
  }
}

// 料理削除
async function deleteMeal(mealId, mealName) {
  if (!confirm(`「${mealName}」を削除しますか？`)) return;

  // localStorageから削除
  const localMeals = loadMealsFromLocal();
  saveMealsToLocal(localMeals.filter(m => m._id !== mealId));

  // メモリから削除
  meals = meals.filter(m => m._id !== mealId);
  filteredMeals = filteredMeals.filter(m => m._id !== mealId);

  renderMealList();
  updateCategoryFilter();
  updateSearchResultsCounter();
  showToast('料理を削除しました', 'success');

  // Supabase接続がある場合はバックグラウンドで同期
  if (!supabaseConnectionError && supabase) {
    const user = await getCurrentUser();
    if (user) {
      supabase.from('meals').delete().eq('_id', mealId)
        .then(({ error }) => { if (error) debugLog('Supabase削除同期エラー:', error); });
    }
  }
}

// 検索処理
function handleSearch(event) {
  try {
    currentFilters.search = event.target.value.toLowerCase();
    applyFilters();
  } catch (error) {
    // console.error('検索処理エラー:', error);
  }
}

// カテゴリフィルタ処理
function handleCategoryFilter(event) {
  try {
    currentFilters.category = event.target.value;
    applyFilters();
  } catch (error) {
    // console.error('カテゴリフィルタ処理エラー:', error);
  }
}

// お気に入りフィルタ処理
function handleFavoriteFilter(event) {
  try {
    currentFilters.favorite = event.target.value;
    applyFilters();
  } catch (error) {
    // console.error('お気に入りフィルタ処理エラー:', error);
  }
}

// ソート処理
function handleSort(event) {
  try {
    currentFilters.sort = event.target.value;
    applyFilters();
  } catch (error) {
    // console.error('ソート処理エラー:', error);
  }
}

// フィルタ適用
function applyFilters() {
  try {
    filteredMeals = meals.filter(meal => {
      // 検索フィルタ
      if (currentFilters.search && !meal.name.toLowerCase().includes(currentFilters.search)) {
        return false;
      }
      
      // カテゴリフィルタ
      if (currentFilters.category !== 'all' && meal.category !== currentFilters.category) {
        return false;
      }
      
      // お気に入りフィルタ
      if (currentFilters.favorite === 'favorites' && !meal.is_favorite) {
        return false;
      }
      if (currentFilters.favorite === 'non-favorites' && meal.is_favorite) {
        return false;
      }
      
      return true;
    });
    
    // ソート適用
    sortMeals();
    
    // UIを更新
    renderMealList();
    updateSearchResultsCounter();
    
    debugLog('フィルタ適用完了', { 
      total: meals.length, 
      filtered: filteredMeals.length,
      filters: currentFilters 
    });
  } catch (error) {
    // console.error('フィルタ適用エラー:', error);
  }
}

// ソート処理
function sortMeals() {
  try {
    switch (currentFilters.sort) {
      case 'date-desc':
        filteredMeals.sort((a, b) => new Date(b.capturedate) - new Date(a.capturedate));
        break;
      case 'date-asc':
        filteredMeals.sort((a, b) => new Date(a.capturedate) - new Date(b.capturedate));
        break;
      case 'name-asc':
        filteredMeals.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filteredMeals.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'category':
        filteredMeals.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        break;
    }
  } catch (error) {
    // console.error('ソート処理エラー:', error);
  }
}

// フィルタクリア
function clearFilters() {
  try {
    currentFilters = {
      search: '',
      category: 'all',
      favorite: 'all',
      sort: 'date-desc'
    };
    
    // フォームをリセット
    const searchInput = document.getElementById('meal-search');
    if (searchInput) searchInput.value = '';
    
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) categoryFilter.value = 'all';
    
    const favoriteFilter = document.getElementById('favorite-filter');
    if (favoriteFilter) favoriteFilter.value = 'all';
    
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'date-desc';
    
    // フィルタを適用
    applyFilters();
    
    showToast('フィルタをクリアしました', 'info');
  } catch (error) {
    // console.error('フィルタクリアエラー:', error);
  }
}

// ナビゲーション設定
function setupNavigation() {
  const navLinks = document.querySelectorAll('[data-section]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionName = link.dataset.section;
      showSection(sectionName);
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // モバイルではナビバーを閉じる
      const navbarCollapse = document.getElementById('navbarNav');
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const toggler = document.querySelector('.navbar-toggler');
        if (toggler) toggler.click();
      }
    });
  });
}

// セクション表示切り替え
function showSection(sectionName) {
  const sections = ['meals', 'statistics', 'suggestions'];
  sections.forEach(name => {
    const el = document.getElementById(`${name}-section`);
    if (el) {
      el.style.display = name === sectionName ? '' : 'none';
    }
  });

  if (sectionName === 'statistics') {
    updateStatistics();
  }
}

// 統計情報を更新
function updateStatistics() {
  const totalEl = document.getElementById('total-meals');
  const favEl = document.getElementById('favorite-meals');
  const avgEl = document.getElementById('avg-per-day');
  const rateEl = document.getElementById('favorite-rate');

  if (totalEl) totalEl.textContent = meals.length;

  const favCount = meals.filter(m => m.is_favorite).length;
  if (favEl) favEl.textContent = favCount;
  if (rateEl) rateEl.textContent = meals.length > 0
    ? Math.round((favCount / meals.length) * 100) + '%'
    : '0%';

  if (avgEl) {
    if (meals.length > 0) {
      const uniqueDates = new Set(meals.map(m => m.capturedate)).size;
      avgEl.textContent = (meals.length / Math.max(uniqueDates, 1)).toFixed(1);
    } else {
      avgEl.textContent = '0';
    }
  }
}

// 提案機能設定
function setupSuggestions() {
  const btn = document.getElementById('suggest-meals-btn');
  if (btn) {
    btn.addEventListener('click', suggestMeals);
  }
}

// 献立をランダム提案
function suggestMeals() {
  const container = document.getElementById('suggestions-container');
  const noMsg = document.getElementById('no-suggestions-message');

  if (meals.length === 0) {
    if (container) container.innerHTML = '';
    if (noMsg) noMsg.style.display = '';
    return;
  }

  if (noMsg) noMsg.style.display = 'none';

  // お気に入り優先でシャッフル
  const favorites = meals.filter(m => m.is_favorite);
  const others = meals.filter(m => !m.is_favorite);
  const shuffled = [
    ...favorites.sort(() => Math.random() - 0.5),
    ...others.sort(() => Math.random() - 0.5)
  ];
  const suggestions = shuffled.slice(0, Math.min(5, shuffled.length));

  if (container) {
    container.innerHTML = suggestions.map(meal => `
      <div class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body text-center">
            ${meal.image ? `<img src="${meal.image}" alt="${escapeHtml(meal.name)}" class="img-fluid rounded mb-2" style="max-height:120px;object-fit:cover;">` : '<div class="py-3"><i class="bi bi-egg-fried fs-1 text-muted"></i></div>'}
            <h6 class="card-title">${escapeHtml(meal.name)}</h6>
            ${meal.category ? `<span class="badge bg-secondary mb-2">${escapeHtml(meal.category)}</span>` : ''}
            ${meal.is_favorite ? '<span class="badge bg-warning text-dark mb-2 ms-1">★ お気に入り</span>' : ''}
            <button class="btn btn-success btn-sm w-100 mt-2" onclick="acceptSuggestion('${meal._id}')">
              <i class="bi bi-check-circle me-1"></i>これにする
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// 提案を採用
function acceptSuggestion(mealId) {
  const meal = meals.find(m => m._id === mealId);
  if (!meal) return;
  showToast(`「${meal.name}」に決定！おいしく召し上がれ 🍽️`, 'success');
  showSection('meals');
  document.querySelectorAll('[data-section]').forEach(l => {
    l.classList.toggle('active', l.dataset.section === 'meals');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 検索結果カウンター更新
function updateSearchResultsCounter() {
  try {
    const counter = document.getElementById('search-results-counter');
    if (counter) {
      counter.textContent = `${filteredMeals.length}件の料理`;
    }
  } catch (error) {
    // console.error('検索結果カウンター更新エラー:', error);
  }
}

// カテゴリオプション更新
function updateCategoryOptions() {
  try {
    const categorySelect = document.getElementById('meal-category');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">選択してください</option>';
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    
    debugLog('カテゴリオプション更新完了', { count: categories.length });
  } catch (error) {
    // console.error('カテゴリオプション更新エラー:', error);
  }
}

// 食材オプション更新
function updateIngredientOptions() {
  try {
    // 食材の自動補完機能は実装済み
    debugLog('食材オプション更新完了', { count: ingredients.length });
  } catch (error) {
    // console.error('食材オプション更新エラー:', error);
  }
}

// フォームリセット
function resetForm() {
  try {
    const form = document.getElementById('meal-form');
    if (form) {
      form.reset();
    }
    
    // 料理名フィールドにフォーカス
    const mealNameInput = document.getElementById('meal-name');
    if (mealNameInput) {
      mealNameInput.focus();
    }
    
    debugLog('フォームリセット完了');
  } catch (error) {
    // console.error('フォームリセットエラー:', error);
  }
}

// 料理送信処理
async function handleMealSubmit(event) {
  try {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const mealData = {
      name: formData.get('meal-name').trim(),
      category: formData.get('meal-category') || null,
      meal_time: formData.get('meal-time') || null,
      ingredients: formData.get('meal-ingredients') ?
        formData.get('meal-ingredients').split(',').map(i => i.trim()).filter(i => i) : [],
      capturedate: formData.get('meal-date') || new Date().toISOString().split('T')[0],
      calories: formData.get('meal-calories') ? parseInt(formData.get('meal-calories')) : null,
      protein: formData.get('meal-protein') ? parseFloat(formData.get('meal-protein')) : null,
      carbs: formData.get('meal-carbs') ? parseFloat(formData.get('meal-carbs')) : null,
      fat: formData.get('meal-fat') ? parseFloat(formData.get('meal-fat')) : null,
      fiber: formData.get('meal-fiber') ? parseFloat(formData.get('meal-fiber')) : null,
      sodium: formData.get('meal-sodium') ? parseFloat(formData.get('meal-sodium')) : null
    };
    
    // バリデーション
    if (!validateMealName(mealData.name)) {
      showToast('料理名を正しく入力してください（1-200文字）', 'danger');
      return;
    }
    
    if (mealData.category && !validateCategory(mealData.category)) {
      showToast('カテゴリを正しく入力してください（1-50文字）', 'danger');
      return;
    }
    
    // 食材のバリデーション
    for (const ingredient of mealData.ingredients) {
      if (!validateIngredient(ingredient)) {
        showToast(`食材「${ingredient}」を正しく入力してください（1-50文字）`, 'danger');
        return;
      }
    }
    
    // 画像アップロード
    const imageFile = formData.get('meal-image');
    if (imageFile && imageFile.size > 0) {
      if (!validateFile(imageFile)) {
        showToast('画像ファイルが正しくありません（JPEG/PNG/GIF/WebP、10MB以下）', 'danger');
        return;
      }
      
      const imageUrl = await uploadImage(imageFile);
      if (imageUrl) {
        mealData.image = imageUrl;
      }
    }
    
    // Supabase未接続の場合はゲストモードでlocalStorageに保存
    if (supabaseConnectionError) {
      debugLog('ゲストモード: localStorageに料理を保存');
      saveMealLocally(mealData);
      return;
    }

    // Supabaseクライアントの初期化チェック
    if (!supabase) {
      if (!initializeSupabase()) {
        debugLog('ゲストモード: localStorageに料理を保存');
        saveMealLocally(mealData);
        return;
      }
    }

    // 認証状態をチェック（未ログイン時はゲストモード）
    const user = await getCurrentUser();
    if (!user) {
      debugLog('ゲストモード: localStorageに料理を保存');
      saveMealLocally(mealData);
      return;
    }
    
    // Supabaseに保存
    const { data, error } = await supabase
      .from('meals')
      .insert([mealData])
      .select()
      .single();
    
    if (error) {
      debugLog('料理保存エラー:', error);
      // 404エラー（認証エラーまたはテーブル不存在）の場合は警告を表示
      if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('Not Found')) {
        debugLog('認証エラーまたはテーブル不存在のため、料理保存をスキップ');
        showToast('ログインが必要です', 'warning');
        return;
      }
      // 接続エラーの場合はフラグを設定
      if (error.message && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('ERR_NAME_NOT_RESOLVED') ||
        error.message.includes('NetworkError')
      )) {
        supabaseConnectionError = true;
        supabase = null;
        showToast('データベース接続に失敗しました。Supabase設定を確認してください。', 'warning');
      } else {
        showToast('料理の保存に失敗しました', 'danger');
      }
      return;
    }
    
    // メモリ内のデータを更新
    meals.unshift(data);
    filteredMeals = [...meals];
    
    // カテゴリと食材を更新
    if (mealData.category && !categories.includes(mealData.category)) {
      categories.push(mealData.category);
      saveCategories(categories);
      updateCategoryOptions();
    }
    
    mealData.ingredients.forEach(ingredient => {
      if (!ingredients.includes(ingredient)) {
        ingredients.push(ingredient);
      }
    });
    saveIngredients(ingredients);
    
    // UIを更新
    renderMealList();
    updateSearchResultsCounter();
    resetForm();
    
    showToast('料理を追加しました', 'success');
    
    // dataは使用されている（mealIdのログ出力で使用）
    if (data && data._id) {
      debugLog('料理保存完了', { mealId: data._id });
    }
  } catch (error) {
    debugLog('料理送信エラー:', error);
    showToast('料理の保存に失敗しました', 'danger');
  }
}

// 画像アップロード
async function uploadImage(file) {
  try {
    // Supabase接続エラーが発生している場合はスキップ
    if (supabaseConnectionError) {
      debugLog('Supabase接続エラーのため、画像アップロードをスキップ');
      return null;
    }
    
    const user = await getCurrentUser();
    if (!user) {
      showToast('ログインが必要です', 'warning');
      return null;
    }
    
    // Supabaseクライアントの初期化チェック
    if (!supabase) {
      if (!initializeSupabase()) {
        debugLog('Supabase client not available');
        return null;
      }
    }
    
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    
    const { error } = await supabase.storage
      .from('meal-images')
      .upload(fileName, file);
    
    if (error) {
      debugLog('画像アップロードエラー:', error);
      // 接続エラーの場合はフラグを設定
      if (error.message && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('ERR_NAME_NOT_RESOLVED') ||
        error.message.includes('NetworkError')
      )) {
        supabaseConnectionError = true;
        supabase = null;
      }
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('meal-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    debugLog('画像アップロードエラー:', error);
    return null;
  }
}

// 現在のユーザー取得
async function getCurrentUser() {
  try {
    // Supabase接続エラーが発生している場合はスキップ
    if (supabaseConnectionError) {
      debugLog('Supabase接続エラーのため、ユーザー取得をスキップ');
      return null;
    }
    
    // Supabaseクライアントの初期化チェック
    if (!supabase) {
      if (!initializeSupabase()) {
        debugLog('Supabase client not available');
        return null;
      }
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // 接続エラーの場合はフラグを設定
      if (error.message && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('ERR_NAME_NOT_RESOLVED') ||
        error.message.includes('NetworkError')
      )) {
        supabaseConnectionError = true;
        supabase = null;
      }
      return null;
    }
    
    return user;
  } catch (error) {
    debugLog('ユーザー取得エラー:', error);
    // 接続エラーの場合はフラグを設定
    if (error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('ERR_NAME_NOT_RESOLVED') ||
      error.message.includes('NetworkError')
    )) {
      supabaseConnectionError = true;
      supabase = null;
    }
    return null;
  }
}

// 認証モーダル表示
let authMode = 'login'; // 'login' or 'signup'
function showAuthModal(mode = 'login') {
  try {
    authMode = mode;
    const modal = document.getElementById('auth-modal');
    const modalTitle = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const authForm = document.getElementById('auth-form');
    
    if (!modal || !modalTitle || !submitBtn || !authForm) {
      debugLog('認証モーダルの要素が見つかりません');
      return;
    }
    
    // モーダルのタイトルとボタンテキストを更新
    if (mode === 'signup') {
      modalTitle.textContent = '新規登録';
      submitBtn.textContent = '新規登録';
    } else {
      modalTitle.textContent = 'ログイン';
      submitBtn.textContent = 'ログイン';
    }
    
    // フォームをリセット
    authForm.reset();
    
    // Bootstrapモーダルを表示
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    debugLog(`認証モーダル表示: ${mode}`);
  } catch (error) {
    // console.error('認証モーダル表示エラー:', error);
    showToast('認証モーダルの表示に失敗しました', 'danger');
  }
}

// 認証フォーム送信処理
async function handleAuthSubmit(event) {
  try {
    event.preventDefault();
    
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const submitBtn = document.getElementById('auth-submit-btn');
    
    if (!emailInput || !passwordInput || !submitBtn) {
      showToast('フォームの要素が見つかりません', 'danger');
      return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // バリデーション
    if (!email || !password) {
      showToast('メールアドレスとパスワードを入力してください', 'warning');
      return;
    }
    
    if (password.length < 6) {
      showToast('パスワードは6文字以上で入力してください', 'warning');
      return;
    }
    
    // ボタンを無効化
    submitBtn.disabled = true;
    submitBtn.textContent = '処理中...';
    
    // Supabaseクライアントの初期化チェック
    if (!supabase) {
      if (!initializeSupabase()) {
        showToast('データベース接続に失敗しました', 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = authMode === 'signup' ? '新規登録' : 'ログイン';
        return;
      }
    }
    
    let result;
    if (authMode === 'signup') {
      // 新規登録
      result = await supabase.auth.signUp({
        email: email,
        password: password
      });
    } else {
      // ログイン
      result = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
    }
    
    if (result.error) {
      debugLog('認証エラー:', result.error);
      showToast(result.error.message || '認証に失敗しました', 'danger');
      submitBtn.disabled = false;
      submitBtn.textContent = authMode === 'signup' ? '新規登録' : 'ログイン';
      return;
    }
    
    // 成功
    if (authMode === 'signup') {
      showToast('新規登録が完了しました。確認メールを送信しました。', 'success');
    } else {
      showToast('ログインに成功しました', 'success');
    }
    
    // モーダルを閉じる
    const modal = document.getElementById('auth-modal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    }
    
    // UIを更新
    await updateAuthUI();
    
    // データを再読み込み
    await loadMeals();
    
    debugLog('認証成功:', authMode);
  } catch (error) {
    // console.error('認証処理エラー:', error);
    showToast('認証処理中にエラーが発生しました', 'danger');
    const submitBtn = document.getElementById('auth-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = authMode === 'signup' ? '新規登録' : 'ログイン';
    }
  }
}

// ログアウト処理
async function handleLogout() {
  try {
    if (!supabase) {
      showToast('ログアウトに失敗しました', 'danger');
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      debugLog('ログアウトエラー:', error);
      showToast('ログアウトに失敗しました', 'danger');
      return;
    }
    
    showToast('ログアウトしました', 'success');
    
    // UIを更新
    await updateAuthUI();
    
    // データをクリア
    meals = [];
    filteredMeals = [];
    renderMealList();
    updateSearchResultsCounter();
    
    debugLog('ログアウト成功');
  } catch (error) {
    // console.error('ログアウト処理エラー:', error);
    showToast('ログアウト処理中にエラーが発生しました', 'danger');
  }
}

// 認証状態に応じたUI更新
async function updateAuthUI() {
  try {
    const user = await getCurrentUser();
    const userEmail = document.getElementById('user-email');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (user) {
      // ログイン中
      if (userEmail) {
        userEmail.textContent = user.email || 'ログイン中';
      }
      if (loginBtn) {
        loginBtn.parentElement.style.display = 'none';
      }
      if (signupBtn) {
        signupBtn.parentElement.style.display = 'none';
      }
      if (logoutBtn) {
        logoutBtn.parentElement.style.display = 'block';
      }
    } else {
      // 未ログイン
      if (userEmail) {
        userEmail.textContent = '未ログイン';
      }
      if (loginBtn) {
        loginBtn.parentElement.style.display = 'block';
      }
      if (signupBtn) {
        signupBtn.parentElement.style.display = 'block';
      }
      if (logoutBtn) {
        logoutBtn.parentElement.style.display = 'none';
      }
    }
    
    debugLog('認証UI更新完了');
  } catch (error) {
    // console.error('認証UI更新エラー:', error);
  }
}

// Supabase Keep-Alive機能（自動pauseを防ぐ）
let keepAliveInterval = null;

// Supabaseにpingを送信してアクティブに保つ
async function pingSupabase() {
  try {
    // Supabase接続エラーが発生している場合はスキップ
    if (supabaseConnectionError || !supabase) {
      return;
    }
    
    // 軽量なpingリクエスト（REST APIのルートエンドポイント）
    const { error } = await supabase
      .from('meals')
      .select('_id')
      .limit(1);
    
    // エラーは無視（テーブルが存在しない場合など）
    if (error && !error.message.includes('Failed to fetch') && 
        !error.message.includes('ERR_NAME_NOT_RESOLVED')) {
      debugLog('Supabase keep-alive ping sent');
    }
  } catch (error) {
    // エラーは無視（接続エラーの場合は既にフラグが設定されている）
    debugLog('Supabase keep-alive ping error (ignored):', error.message);
  }
}

// Keep-Alive機能を開始
function startKeepAlive() {
  // 既に実行中の場合は停止
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  // 1時間ごとにpingを送信（Supabaseの自動pauseを防ぐ）
  keepAliveInterval = setInterval(() => {
    pingSupabase();
  }, 60 * 60 * 1000); // 1時間 = 60分 * 60秒 * 1000ミリ秒
  
  // 初回は即座にpingを送信
  pingSupabase();
  
  debugLog('Supabase keep-alive started (ping every 1 hour)');
}

// Keep-Alive機能を停止
function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    debugLog('Supabase keep-alive stopped');
  }
}

// ページが非表示になったら停止、表示されたら再開
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopKeepAlive();
  } else {
    startKeepAlive();
  }
});

// 設定読み込み
async function loadConfig() {
  try {
    // 設定ファイルが読み込まれていることを確認
    if (typeof Config === 'undefined') {
      throw new Error('設定ファイルが読み込まれていません');
    }
    
    debugLog('設定読み込み完了');
  } catch (error) {
    // console.error('設定読み込みエラー:', error);
    showToast('設定の読み込みに失敗しました', 'danger');
  }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

// グローバル関数として公開
window.debugLog = debugLog;
window.measurePerformance = measurePerformance;
window.toggleDebugMode = toggleDebugMode;
window.runTests = runTests;
window.loadMeals = loadMeals;
window.renderMealList = renderMealList;
window.toggleFavorite = toggleFavorite;
window.clearFilters = clearFilters;
window.updateCategoryOptions = updateCategoryOptions;
window.updateIngredientOptions = updateIngredientOptions;
window.resetForm = resetForm;
window.handleMealSubmit = handleMealSubmit;
window.uploadImage = uploadImage;
window.getCurrentUser = getCurrentUser;
window.deleteMeal = deleteMeal;
window.acceptSuggestion = acceptSuggestion;
window.showSection = showSection;
window.updateStatistics = updateStatistics;
window.updateCategoryFilter = updateCategoryFilter;
