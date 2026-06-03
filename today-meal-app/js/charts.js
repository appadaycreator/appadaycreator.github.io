// 統計・グラフ機能
// ==================== 統計・グラフ機能 ====================

// Chart.jsインスタンスを管理するオブジェクト
const chartInstances = {};

// グラフの色設定
const chartColors = {
  primary: '#007bff',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  secondary: '#6c757d',
  light: '#f8f9fa',
  dark: '#343a40'
};

// グラフの共通設定
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: '日付'
      }
    },
    y: {
      display: true,
      beginAtZero: true
    }
  }
};

// 登録数推移グラフの作成
async function createRegistrationChart() {
  try {
    const canvas = document.getElementById('registrationChart');
    if (!canvas) return;

    const period = document.getElementById('stats-period')?.value || '30days';
    const stats = await Utils.stats.getMealRegistrationStats(period);

    // 既存のグラフを破棄
    if (chartInstances.registrationChart) {
      chartInstances.registrationChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartInstances.registrationChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.data.map(d => d.date),
        datasets: [{
          label: '料理登録数',
          data: stats.data.map(d => d.count),
          borderColor: chartColors.primary,
          backgroundColor: chartColors.primary + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          title: {
            display: true,
            text: `料理登録数の推移 (${period})`
          }
        }
      }
    });

    // 統計情報を更新
    document.getElementById('total-registrations').textContent = stats.total;
    document.getElementById('avg-per-day').textContent = stats.average.toFixed(1);

    debugLog('Registration chart created');
  } catch (error) {
    debugLog('Registration chart error:', error);
    showToast('登録数グラフの作成に失敗しました', 'danger');
  }
}

// カテゴリ別グラフの作成
async function createCategoryChart() {
  try {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    const stats = await Utils.stats.getCategoryStats();

    // 既存のグラフを破棄
    if (chartInstances.categoryChart) {
      chartInstances.categoryChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartInstances.categoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.data.map(d => d.category),
        datasets: [{
          label: '料理数',
          data: stats.data.map(d => d.count),
          backgroundColor: [
            chartColors.primary,
            chartColors.success,
            chartColors.warning,
            chartColors.danger,
            chartColors.info,
            chartColors.secondary
          ],
          borderColor: [
            chartColors.primary,
            chartColors.success,
            chartColors.warning,
            chartColors.danger,
            chartColors.info,
            chartColors.secondary
          ],
          borderWidth: 1
        }]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          title: {
            display: true,
            text: 'カテゴリ別料理数'
          }
        }
      }
    });

    debugLog('Category chart created');
  } catch (error) {
    debugLog('Category chart error:', error);
    showToast('カテゴリグラフの作成に失敗しました', 'danger');
  }
}

// お気に入りグラフの作成
async function createFavoriteChart() {
  try {
    const canvas = document.getElementById('favoriteChart');
    if (!canvas) return;

    const stats = await Utils.stats.getFavoriteStats();

    // 既存のグラフを破棄
    if (chartInstances.favoriteChart) {
      chartInstances.favoriteChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartInstances.favoriteChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.data.map(d => d.date),
        datasets: [
          {
            label: '総料理数',
            data: stats.data.map(d => d.total),
            borderColor: chartColors.primary,
            backgroundColor: chartColors.primary + '20',
            borderWidth: 2,
            fill: false
          },
          {
            label: 'お気に入り数',
            data: stats.data.map(d => d.favorites),
            borderColor: chartColors.success,
            backgroundColor: chartColors.success + '20',
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          title: {
            display: true,
            text: 'お気に入り数の推移'
          }
        }
      }
    });

    // 統計情報を更新
    document.getElementById('total-favorites').textContent = stats.totalFavorites;
    document.getElementById('favorite-rate').textContent = stats.favoriteRate.toFixed(1);

    debugLog('Favorite chart created');
  } catch (error) {
    debugLog('Favorite chart error:', error);
    showToast('お気に入りグラフの作成に失敗しました', 'danger');
  }
}

// 栄養バランスグラフの作成
async function createNutritionChart() {
  try {
    const canvas = document.getElementById('nutritionChart');
    if (!canvas) return;

    const stats = await Utils.stats.getNutritionStats();

    // 既存のグラフを破棄
    if (chartInstances.nutritionChart) {
      chartInstances.nutritionChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    chartInstances.nutritionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['タンパク質', '炭水化物', '脂質'],
        datasets: [{
          data: [stats.macros.protein, stats.macros.carbs, stats.macros.fat],
          backgroundColor: [
            chartColors.primary,
            chartColors.success,
            chartColors.warning
          ],
          borderColor: [
            chartColors.primary,
            chartColors.success,
            chartColors.warning
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'マクロバランス'
          }
        }
      }
    });

    debugLog('Nutrition chart created');
  } catch (error) {
    debugLog('Nutrition chart error:', error);
    showToast('栄養グラフの作成に失敗しました', 'danger');
  }
}

// グラフのクリーンアップ
function cleanupCharts() {
  try {
    Object.values(chartInstances).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    Object.keys(chartInstances).forEach(key => {
      delete chartInstances[key];
    });
    debugLog('Charts cleaned up');
  } catch (error) {
    debugLog('Chart cleanup error:', error);
  }
}

// 統計データの更新
async function updateStats() {
  try {
    showToast('統計データを更新中...', 'info');
    
    await Promise.all([
      createRegistrationChart(),
      createCategoryChart(),
      createFavoriteChart(),
      createNutritionChart()
    ]);
    
    showToast('統計データの更新が完了しました', 'success');
  } catch (error) {
    debugLog('Stats update error:', error);
    showToast('統計データの更新に失敗しました', 'danger');
  }
}

// グローバル関数として公開
window.createRegistrationChart = createRegistrationChart;
window.createCategoryChart = createCategoryChart;
window.createFavoriteChart = createFavoriteChart;
window.createNutritionChart = createNutritionChart;
window.cleanupCharts = cleanupCharts;
window.updateStats = updateStats;
