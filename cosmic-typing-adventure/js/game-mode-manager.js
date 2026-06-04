// Game Mode Manager for Cosmic Typing Adventure
// サバイバルモード、タイムアタックモード、リーダーボード管理

import { logger } from './logger.js';
export class GameModeManager {
    constructor() {
        this.currentMode = 'normal';
        this.modeConfig = {
            normal: {
                name: '通常モード',
                description: '練習モード',
                hasTimeLimit: false,
                hasLives: false
            },
            survival: {
                name: 'サバイバルモード',
                description: 'ミス3回で終了',
                hasTimeLimit: false,
                hasLives: true,
                maxLives: 3
            },
            timeAttack: {
                name: 'タイムアタックモード',
                description: '制限時間内にできるだけ多く入力',
                hasTimeLimit: true,
                hasLives: false,
                timeLimits: [30, 60, 180, 300] // seconds
            }
        };
    }

    /**
     * ランク評価を計算
     * @param {Object} results - タイピング結果
     * @returns {Object} ランク情報
     */
    calculateRank(results) {
        const { wpm, accuracy, mode } = results;
        
        // スコア計算（WPMと正確率の総合評価）
        const score = wpm * (accuracy / 100);
        
        let rank = 'D';
        let rankColor = '#9ca3af';
        let rankMessage = '練習を続けましょう';
        
        if (score >= 80) {
            rank = 'S';
            rankColor = '#fbbf24';
            rankMessage = '素晴らしい！完璧です！';
        } else if (score >= 60) {
            rank = 'A';
            rankColor = '#10b981';
            rankMessage = '素晴らしい！';
        } else if (score >= 40) {
            rank = 'B';
            rankColor = '#3b82f6';
            rankMessage = '良い調子です！';
        } else if (score >= 20) {
            rank = 'C';
            rankColor = '#f59e0b';
            rankMessage = 'もう少しです！';
        }
        
        return {
            rank,
            rankColor,
            rankMessage,
            score: Math.round(score)
        };
    }

    /**
     * タイムアタック結果の評価
     * @param {Object} results - タイピング結果
     * @returns {Object} 評価結果
     */
    evaluateTimeAttack(results) {
        const rankInfo = this.calculateRank(results);
        
        return {
            ...results,
            ...rankInfo,
            totalTyped: results.totalTyped || 0,
            timeUsed: results.duration || 0,
            cpm: Math.round((results.totalTyped / (results.duration / 60)) || 0)
        };
    }

    /**
     * サバイバル結果の評価
     * @param {Object} results - タイピング結果
     * @returns {Object} 評価結果
     */
    evaluateSurvival(results) {
        const rankInfo = this.calculateRank(results);
        const survivedTime = results.duration || 0;
        
        return {
            ...results,
            ...rankInfo,
            survivedTime,
            cause: results.cause || 'completion',
            message: results.cause === 'death' ? 'ミッション失敗' : 'ミッション完了！'
        };
    }
}

/**
 * Leaderboard Manager
 * リーダーボード機能の管理
 */
export class LeaderboardManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.localStorageKey = 'cosmic_typing_leaderboard';
    }

    /**
     * リーダーボードにスコアを保存
     * @param {Object} scoreData - スコアデータ
     * @returns {Promise<boolean>} 保存成功/失敗
     */
    async saveScore(scoreData) {
        const entry = {
            mode: scoreData.mode,
            time_limit: scoreData.timeLimit || null,
            wpm: scoreData.wpm,
            accuracy: scoreData.accuracy,
            score: scoreData.score,
            rank: scoreData.rank,
            total_typed: scoreData.totalTyped || 0,
            duration: scoreData.duration || 0,
            player_name: scoreData.playerName || 'Anonymous',
            created_at: new Date().toISOString()
        };

        // Try to save to Supabase
        if (this.supabase && navigator.onLine) {
            try {
                const { data, error } = await this.supabase
                    .from('leaderboard')
                    .insert([entry]);
                
                if (error) {
                    logger.error('Supabase leaderboard save error:', error);
                    return this.saveToLocalStorage(entry);
                }
                
                logger.debug('Score saved to leaderboard:', data);
                
                // Also save to localStorage as backup
                this.saveToLocalStorage(entry);
                return true;
            } catch (error) {
                logger.error('Error saving to leaderboard:', error);
                return this.saveToLocalStorage(entry);
            }
        }
        
        // Fallback to localStorage
        return this.saveToLocalStorage(entry);
    }

    /**
     * ローカルストレージに保存
     * @param {Object} entry - スコアエントリー
     * @returns {boolean} 保存成功/失敗
     */
    saveToLocalStorage(entry) {
        try {
            const existing = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
            existing.push(entry);
            
            // Keep only last 500 entries
            if (existing.length > 500) {
                existing.splice(0, existing.length - 500);
            }
            
            localStorage.setItem(this.localStorageKey, JSON.stringify(existing));
            logger.debug('Score saved to localStorage');
            return true;
        } catch (error) {
            logger.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * リーダーボードを取得
     * @param {string} mode - ゲームモード
     * @param {number} timeLimit - タイムアタックの制限時間（オプション）
     * @param {number} limit - 取得件数
     * @returns {Promise<Array>} スコアリスト
     */
    async getLeaderboard(mode, timeLimit = null, limit = 10) {
        if (this.supabase && navigator.onLine) {
            try {
                let query = this.supabase
                    .from('leaderboard')
                    .select('*')
                    .eq('mode', mode)
                    .order('score', { ascending: false })
                    .limit(limit);
                
                if (timeLimit) {
                    query = query.eq('time_limit', timeLimit);
                }
                
                const { data, error } = await query;
                
                if (error) {
                    logger.error('Supabase leaderboard fetch error:', error);
                    return this.getLocalLeaderboard(mode, timeLimit, limit);
                }
                
                return data || [];
            } catch (error) {
                logger.error('Error fetching leaderboard:', error);
                return this.getLocalLeaderboard(mode, timeLimit, limit);
            }
        }
        
        return this.getLocalLeaderboard(mode, timeLimit, limit);
    }

    /**
     * ローカルストレージからリーダーボードを取得
     * @param {string} mode - ゲームモード
     * @param {number} timeLimit - タイムアタックの制限時間（オプション）
     * @param {number} limit - 取得件数
     * @returns {Array} スコアリスト
     */
    getLocalLeaderboard(mode, timeLimit = null, limit = 10) {
        try {
            const data = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
            
            let filtered = data.filter(entry => entry.mode === mode);
            
            if (timeLimit) {
                filtered = filtered.filter(entry => entry.time_limit === timeLimit);
            }
            
            // Sort by score descending
            filtered.sort((a, b) => b.score - a.score);
            
            return filtered.slice(0, limit);
        } catch (error) {
            logger.error('Error reading local leaderboard:', error);
            return [];
        }
    }

    /**
     * ユーザーのランキング順位を取得
     * @param {number} score - ユーザーのスコア
     * @param {string} mode - ゲームモード
     * @param {number} timeLimit - タイムアタックの制限時間（オプション）
     * @returns {Promise<number>} 順位
     */
    async getUserRank(score, mode, timeLimit = null) {
        const leaderboard = await this.getLeaderboard(mode, timeLimit, 1000);
        
        const higherScores = leaderboard.filter(entry => entry.score > score);
        return higherScores.length + 1;
    }
}

/**
 * Mode-specific result formatting
 */
export function formatModeResults(mode, results, rankInfo) {
    const baseResults = {
        mode,
        wpm: results.wpm,
        accuracy: results.accuracy,
        totalTyped: results.totalTyped,
        totalErrors: results.totalErrors,
        duration: results.duration,
        ...rankInfo
    };

    switch (mode) {
        case 'survival':
            return {
                ...baseResults,
                lives: results.lives || 0,
                cause: results.cause || 'completion',
                survived: results.cause !== 'death'
            };
        
        case 'timeAttack':
            return {
                ...baseResults,
                timeLimit: results.timeLimit || 0,
                timeUsed: results.duration || 0,
                cpm: Math.round((results.totalTyped / (results.duration / 60)) || 0)
            };
        
        default:
            return baseResults;
    }
}
