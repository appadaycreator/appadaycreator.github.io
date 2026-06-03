// ユーティリティ関数モジュール
// 共通の機能を提供し、コードの重複を削減

const Utils = {
  // DOM操作のユーティリティ
  dom: {
    // 安全な要素取得
    getElement(id) {
      try {
        const element = document.getElementById(id);
        if (!element) {
          debugLog(`Element with id '${id}' not found`);
        }
        return element;
      } catch (error) {
        debugLog(`Error getting element '${id}':`, error);
        return null;
      }
    },

    // 安全な要素作成
    createElement(tag, attributes = {}, textContent = '') {
      try {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
        
        if (textContent) {
          element.textContent = textContent;
        }
        
        return element;
      } catch (error) {
        debugLog(`Error creating element '${tag}':`, error);
        return null;
      }
    },

    // 安全なinnerHTML設定
    setInnerHTML(element, html) {
      try {
        if (!element) return false;
        element.innerHTML = SecurityModule.escapeHtml(html);
        return true;
      } catch (error) {
        debugLog('Error setting innerHTML:', error);
        return false;
      }
    },

    // イベントリスナーの安全な追加
    addEventListener(element, event, handler, options = {}) {
      try {
        if (!element || typeof handler !== 'function') return false;
        element.addEventListener(event, handler, options);
        return true;
      } catch (error) {
        debugLog('Error adding event listener:', error);
        return false;
      }
    }
  },

  // データ処理のユーティリティ
  data: {
    // 安全なJSON解析
    parseJSON(jsonString, defaultValue = null) {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        debugLog('JSON parse error:', error);
        return defaultValue;
      }
    },

    // 安全なJSON文字列化
    stringifyJSON(obj, defaultValue = '{}') {
      try {
        return JSON.stringify(obj);
      } catch (error) {
        debugLog('JSON stringify error:', error);
        return defaultValue;
      }
    },

    // 配列の重複除去
    removeDuplicates(array) {
      try {
        return [...new Set(array)];
      } catch (error) {
        debugLog('Array deduplication error:', error);
        return array || [];
      }
    },

    // オブジェクトの深いコピー
    deepClone(obj) {
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (error) {
        debugLog('Deep clone error:', error);
        return obj;
      }
    }
  },

  // 日付処理のユーティリティ
  date: {
    // 現在の日付をISO形式で取得
    getCurrentDateISO() {
      try {
        return new Date().toISOString().slice(0, 10);
      } catch (error) {
        debugLog('Date conversion error:', error);
        return '1970-01-01';
      }
    },

    // 日付のフォーマット
    formatDate(date, format = 'YYYY-MM-DD') {
      try {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return format
          .replace('YYYY', year)
          .replace('MM', month)
          .replace('DD', day);
      } catch (error) {
        debugLog('Date formatting error:', error);
        return date;
      }
    },

    // 日付の妥当性チェック
    isValidDate(dateString) {
      try {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
      } catch (error) {
        debugLog('Date validation error:', error);
        return false;
      }
    }
  },

  // 文字列処理のユーティリティ
  string: {
    // 文字列の切り詰め
    truncate(str, maxLength, suffix = '...') {
      try {
        if (typeof str !== 'string') return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
      } catch (error) {
        debugLog('String truncation error:', error);
        return str || '';
      }
    },

    // 文字列の正規化
    normalize(str) {
      try {
        if (typeof str !== 'string') return '';
        return str.trim().toLowerCase();
      } catch (error) {
        debugLog('String normalization error:', error);
        return str || '';
      }
    },

    // 文字列の検索
    searchInString(str, query) {
      try {
        if (typeof str !== 'string' || typeof query !== 'string') return false;
        return this.normalize(str).includes(this.normalize(query));
      } catch (error) {
        debugLog('String search error:', error);
        return false;
      }
    }
  },

  // 非同期処理のユーティリティ
  async: {
    // 遅延実行
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // タイムアウト付きPromise
    withTimeout(promise, timeoutMs) {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
      ]);
    },

    // リトライ機能付き実行
    async retry(fn, maxRetries = 3, delayMs = 1000) {
      try {
        return await fn();
      } catch (error) {
        if (maxRetries > 0) {
          await this.delay(delayMs);
          return this.retry(fn, maxRetries - 1, delayMs);
        }
        throw error;
      }
    }
  },

  // パフォーマンス監視のユーティリティ
  performance: {
    // 実行時間の測定
    measureTime(name, fn) {
      const start = performance.now();
      try {
        const result = fn();
        const end = performance.now();
        debugLog(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
      } catch (error) {
        debugLog(`${name} failed:`, error);
        throw error;
      }
    },

    // 非同期実行時間の測定
    async measureTimeAsync(name, fn) {
      const start = performance.now();
      try {
        const result = await fn();
        const end = performance.now();
        debugLog(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
      } catch (error) {
        debugLog(`${name} failed:`, error);
        throw error;
      }
    },

    // メモリ使用量の監視
    getMemoryUsage() {
      try {
        if (performance.memory) {
          return {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
          };
        }
        return null;
      } catch (error) {
        debugLog('Memory usage check error:', error);
        return null;
      }
    }
  },

  // エラーハンドリングのユーティリティ
  error: {
    // エラーメッセージの正規化
    normalizeError(error) {
      try {
        if (error instanceof Error) {
          return {
            message: error.message,
            stack: error.stack,
            name: error.name
          };
        }
        return {
          message: String(error),
          stack: null,
          name: 'UnknownError'
        };
      } catch (e) {
        return {
          message: 'Error normalization failed',
          stack: null,
          name: 'NormalizationError'
        };
      }
    },

    // エラーログの出力
    logError(context, error) {
      try {
        const normalizedError = this.normalizeError(error);
        debugLog(`[${context}] Error:`, normalizedError);
        
        // ユーザーに表示するエラーメッセージ
        if (typeof showToast === 'function') {
          showToast(`エラーが発生しました: ${normalizedError.message}`, 'danger');
        }
      } catch (e) {
        debugLog('Error logging failed:', e);
      }
    }
  },

  // 設定管理のユーティリティ
  config: {
    // 設定値の安全な取得
    get(key, defaultValue = null) {
      try {
        if (typeof Config === 'undefined') return defaultValue;
        
        const keys = key.split('.');
        let value = Config;
        
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return defaultValue;
          }
        }
        
        return value;
      } catch (error) {
        debugLog(`Config get error for key '${key}':`, error);
        return defaultValue;
      }
    },

    // 設定値の検証
    validate() {
      try {
        const requiredKeys = [
          'supabase.url',
          'supabase.anonKey',
          'security.maxFileSize',
          'security.allowedImageTypes'
        ];
        
        const missing = requiredKeys.filter(key => !this.get(key));
        
        if (missing.length > 0) {
          debugLog('Missing required config keys:', missing);
          return false;
        }
        
        return true;
      } catch (error) {
        debugLog('Config validation error:', error);
        return false;
      }
    }
  },

  // 統計データ取得のユーティリティ
  stats: {
    // 期間別料理登録数の取得
    async getMealRegistrationStats(period = '30days') {
      try {
        if (!window.supabase || !window.supabaseClient) {
          throw new Error('Supabase client not initialized');
        }

        const userId = window.supabaseClient.auth.getUser()?.data?.user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        let startDate;
        const endDate = new Date();
        
        switch (period) {
          case '7days':
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90days':
            startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1year':
            startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const { data, error } = await window.supabaseClient
          .from('meals')
          .select('capturedate')
          .eq('user_id', userId)
          .gte('capturedate', startDate.toISOString().slice(0, 10))
          .lte('capturedate', endDate.toISOString().slice(0, 10))
          .order('capturedate', { ascending: true });

        if (error) throw error;

        // 日付別に集計
        const dailyStats = {};
        data.forEach(meal => {
          const date = meal.capturedate;
          dailyStats[date] = (dailyStats[date] || 0) + 1;
        });

        // 期間内の全日期間を生成
        const allDates = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          allDates.push(currentDate.toISOString().slice(0, 10));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // グラフ用データを生成
        const chartData = allDates.map(date => ({
          date: date,
          count: dailyStats[date] || 0
        }));

        return {
          period: period,
          data: chartData,
          total: data.length,
          average: data.length / allDates.length
        };
      } catch (error) {
        debugLog('Error getting meal registration stats:', error);
        throw error;
      }
    },

    // カテゴリ別料理数の取得
    async getCategoryStats() {
      try {
        if (!window.supabase || !window.supabaseClient) {
          throw new Error('Supabase client not initialized');
        }

        const userId = window.supabaseClient.auth.getUser()?.data?.user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await window.supabaseClient
          .from('meals')
          .select('category')
          .eq('user_id', userId);

        if (error) throw error;

        // カテゴリ別に集計
        const categoryStats = {};
        data.forEach(meal => {
          const category = meal.category || '未分類';
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        });

        // グラフ用データを生成
        const chartData = Object.entries(categoryStats).map(([category, count]) => ({
          category: category,
          count: count
        }));

        return {
          data: chartData,
          total: data.length
        };
      } catch (error) {
        debugLog('Error getting category stats:', error);
        throw error;
      }
    },

    // お気に入り数の推移取得
    async getFavoriteStats(period = '30days') {
      try {
        if (!window.supabase || !window.supabaseClient) {
          throw new Error('Supabase client not initialized');
        }

        const userId = window.supabaseClient.auth.getUser()?.data?.user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        let startDate;
        const endDate = new Date();
        
        switch (period) {
          case '7days':
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90days':
            startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1year':
            startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const { data, error } = await window.supabaseClient
          .from('meals')
          .select('capturedate, is_favorite')
          .eq('user_id', userId)
          .gte('capturedate', startDate.toISOString().slice(0, 10))
          .lte('capturedate', endDate.toISOString().slice(0, 10))
          .order('capturedate', { ascending: true });

        if (error) throw error;

        // 日付別にお気に入り数を集計
        const dailyStats = {};
        data.forEach(meal => {
          const date = meal.capturedate;
          if (!dailyStats[date]) {
            dailyStats[date] = { total: 0, favorites: 0 };
          }
          dailyStats[date].total += 1;
          if (meal.is_favorite) {
            dailyStats[date].favorites += 1;
          }
        });

        // 期間内の全日期間を生成
        const allDates = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          allDates.push(currentDate.toISOString().slice(0, 10));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // グラフ用データを生成
        const chartData = allDates.map(date => ({
          date: date,
          total: dailyStats[date]?.total || 0,
          favorites: dailyStats[date]?.favorites || 0
        }));

        const totalFavorites = data.filter(meal => meal.is_favorite).length;

        return {
          period: period,
          data: chartData,
          total: data.length,
          totalFavorites: totalFavorites,
          favoriteRate: data.length > 0 ? (totalFavorites / data.length) * 100 : 0
        };
      } catch (error) {
        debugLog('Error getting favorite stats:', error);
        throw error;
      }
    },

    // 栄養バランス統計の取得
    async getNutritionStats(period = '30days') {
      try {
        if (!window.supabase || !window.supabaseClient) {
          throw new Error('Supabase client not initialized');
        }

        const userId = window.supabaseClient.auth.getUser()?.data?.user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        let startDate;
        const endDate = new Date();
        
        switch (period) {
          case '7days':
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90days':
            startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case '1year':
            startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const { data, error } = await window.supabaseClient
          .from('meals')
          .select('capturedate, calories, protein, carbs, fat, fiber, sodium')
          .eq('user_id', userId)
          .gte('capturedate', startDate.toISOString().slice(0, 10))
          .lte('capturedate', endDate.toISOString().slice(0, 10))
          .not('calories', 'is', null)
          .order('capturedate', { ascending: true });

        if (error) throw error;

        if (data.length === 0) {
          return {
            period: period,
            hasData: false,
            message: '栄養データが登録されていません'
          };
        }

        // 栄養素の合計を計算
        const totals = data.reduce((acc, meal) => {
          acc.calories += meal.calories || 0;
          acc.protein += meal.protein || 0;
          acc.carbs += meal.carbs || 0;
          acc.fat += meal.fat || 0;
          acc.fiber += meal.fiber || 0;
          acc.sodium += meal.sodium || 0;
          return acc;
        }, {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sodium: 0
        });

        // 平均値を計算
        const averages = {
          calories: totals.calories / data.length,
          protein: totals.protein / data.length,
          carbs: totals.carbs / data.length,
          fat: totals.fat / data.length,
          fiber: totals.fiber / data.length,
          sodium: totals.sodium / data.length
        };

        // マクロバランスを計算（カロリー基準）
        const macroBalance = {
          protein: (totals.protein * 4) / totals.calories * 100,
          carbs: (totals.carbs * 4) / totals.calories * 100,
          fat: (totals.fat * 9) / totals.calories * 100
        };

        return {
          period: period,
          hasData: true,
          totals: totals,
          averages: averages,
          macroBalance: macroBalance,
          dataCount: data.length
        };
      } catch (error) {
        debugLog('Error getting nutrition stats:', error);
        throw error;
      }
    }
  }
};

// グローバルに公開
window.Utils = Utils;
