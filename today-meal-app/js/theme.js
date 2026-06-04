// テーマ管理機能
// ==================== テーマ機能 ====================

function detectSystemTheme() {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch (error) {
    debugLog('テーマ検出エラー:', error);
    return 'light';
  }
}

function watchSystemTheme() {
  try {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        const systemTheme = e.matches ? 'dark' : 'light';
        const currentTheme = localStorage.getItem('theme');
        
        // システムテーマが変更された場合のみ更新
        if (!currentTheme || currentTheme === 'system') {
          setTheme(systemTheme);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      // 初期設定
      handleChange(mediaQuery);
    }
  } catch (error) {
    debugLog('テーマ監視エラー:', error);
  }
}

function setTheme(theme) {
  try {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    // 既存のテーマクラスを削除
    body.classList.remove('light-theme', 'dark-theme');
    
    // 新しいテーマを適用
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      if (themeToggle) {
        themeToggle.innerHTML = '🌙';
        themeToggle.setAttribute('aria-label', 'ライトテーマに切り替え');
      }
    } else {
      body.classList.add('light-theme');
      if (themeToggle) {
        themeToggle.innerHTML = '☀️';
        themeToggle.setAttribute('aria-label', 'ダークテーマに切り替え');
      }
    }
    
    // localStorageに保存
    localStorage.setItem('theme', theme);
    
    // Chart.jsのテーマも更新
    updateChartTheme(theme);
    
    debugLog('テーマ変更:', theme);
  } catch (error) {
    debugLog('テーマ設定エラー:', error);
  }
}

function toggleTheme() {
  try {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // アニメーション効果
    const body = document.body;
    addAnimation(body, 'theme-transition');
    
    // スクリーンリーダーに通知
    announceToScreenReader(`${newTheme === 'dark' ? 'ダーク' : 'ライト'}テーマに切り替えました`);
  } catch (error) {
    debugLog('テーマ切り替えエラー:', error);
  }
}

function initializeTheme() {
  try {
    // システムテーマの監視を開始
    watchSystemTheme();
    
    // 保存されたテーマを適用
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== 'system') {
      setTheme(savedTheme);
    } else {
      // システムテーマを使用
      const systemTheme = detectSystemTheme();
      setTheme(systemTheme);
    }
    
    debugLog('テーマ初期化完了');
  } catch (error) {
    debugLog('テーマ初期化エラー:', error);
  }
}

function updateChartTheme(theme) {
  try {
    // Chart.jsのデフォルトカラーを更新
    if (typeof Chart !== 'undefined') {
      Chart.defaults.color = theme === 'dark' ? '#ffffff' : '#333333';
      Chart.defaults.borderColor = theme === 'dark' ? '#444444' : '#e0e0e0';
      Chart.defaults.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    }
  } catch (error) {
    debugLog('チャートテーマ更新エラー:', error);
  }
}

// グローバル関数として公開
window.detectSystemTheme = detectSystemTheme;
window.watchSystemTheme = watchSystemTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
window.initializeTheme = initializeTheme;
window.updateChartTheme = updateChartTheme;
