// ローカルストレージ管理機能
// ==================== ストレージ機能 ====================

function loadFromLocalStorage(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (error) {
    debugLog(`ローカルストレージ読み込みエラー (${key}):`, error);
    return defaultValue;
  }
}

function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    debugLog(`ローカルストレージ保存: ${key}`, data);
  } catch (error) {
    debugLog(`ローカルストレージ保存エラー (${key}):`, error);
  }
}

function loadCategories() {
  try {
    const categories = loadFromLocalStorage('categories');
    
    // デフォルトカテゴリが設定されていない場合は初期化
    if (categories.length === 0) {
      const defaultCategories = [
        '和食', '洋食', '中華', 'イタリアン', '韓国料理',
        'エスニック', 'スイーツ', 'ヘルシー', 'ファストフード', 'ベジタリアン'
      ];
      saveToLocalStorage('categories', defaultCategories);
      return defaultCategories;
    }
    
    return categories;
  } catch (error) {
    debugLog('カテゴリ読み込みエラー:', error);
    return [];
  }
}

function saveCategories(categories) {
  try {
    if (!Array.isArray(categories)) {
      debugLog('カテゴリは配列である必要があります');
      return;
    }
    
    saveToLocalStorage('categories', categories);
    debugLog('カテゴリ保存完了:', categories);
  } catch (error) {
    debugLog('カテゴリ保存エラー:', error);
  }
}

function loadIngredients() {
  try {
    const ingredients = loadFromLocalStorage('ingredients');
    return ingredients;
  } catch (error) {
    debugLog('食材読み込みエラー:', error);
    return [];
  }
}

function saveIngredients(ingredients) {
  try {
    if (!Array.isArray(ingredients)) {
      debugLog('食材は配列である必要があります');
      return;
    }
    
    saveToLocalStorage('ingredients', ingredients);
    debugLog('食材保存完了:', ingredients);
  } catch (error) {
    debugLog('食材保存エラー:', error);
  }
}

function loadFavorites() {
  try {
    const favorites = loadFromLocalStorage('meal_favorites', {});
    return favorites;
  } catch (error) {
    debugLog('お気に入り読み込みエラー:', error);
    return {};
  }
}

function saveFavorites(favorites) {
  try {
    if (typeof favorites !== 'object') {
      debugLog('お気に入りはオブジェクトである必要があります');
      return;
    }
    
    saveToLocalStorage('meal_favorites', favorites);
    debugLog('お気に入り保存完了:', favorites);
  } catch (error) {
    debugLog('お気に入り保存エラー:', error);
  }
}

function loadTheme() {
  try {
    return localStorage.getItem('theme') || 'light';
  } catch (error) {
    debugLog('テーマ読み込みエラー:', error);
    return 'light';
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
    debugLog('テーマ保存完了:', theme);
  } catch (error) {
    debugLog('テーマ保存エラー:', error);
  }
}

function clearStorage() {
  try {
    localStorage.clear();
    debugLog('ローカルストレージクリア完了');
  } catch (error) {
    debugLog('ローカルストレージクリアエラー:', error);
  }
}

// ゲストモード用: 料理データをlocalStorageに保存・取得
function loadMealsFromLocal() {
  try {
    const stored = localStorage.getItem('tm_meals');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function saveMealsToLocal(mealsData) {
  try {
    localStorage.setItem('tm_meals', JSON.stringify(mealsData));
  } catch (e) {
    console.error('料理データ保存エラー:', e);
  }
}

// グローバル関数として公開
window.loadFromLocalStorage = loadFromLocalStorage;
window.saveToLocalStorage = saveToLocalStorage;
window.loadCategories = loadCategories;
window.saveCategories = saveCategories;
window.loadIngredients = loadIngredients;
window.saveIngredients = saveIngredients;
window.loadFavorites = loadFavorites;
window.saveFavorites = saveFavorites;
window.loadTheme = loadTheme;
window.saveTheme = saveTheme;
window.clearStorage = clearStorage;
window.loadMealsFromLocal = loadMealsFromLocal;
window.saveMealsToLocal = saveMealsToLocal;
