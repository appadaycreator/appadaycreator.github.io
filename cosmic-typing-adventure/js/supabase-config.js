// localStorage-based data management for Cosmic Typing Adventure
// Supabaseを除去し、localStorage のみで動作するように移行

import { logger } from './logger.js';

// localStorage ヘルパー
function lsGet(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) { return []; } }
function lsSet(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {} }
function lsGenId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

// No-op: Supabase初期化は不要
export async function initializeSupabase() {
  logger.info("Supabase removed: using localStorage only");
  return true;
}

// Database operations for typing statistics
export const TypingStats = {
  // Save typing session results to localStorage
  async saveSession(sessionData) {
    return this.saveToLocalStorage(sessionData);
  },

  // Save to localStorage
  saveToLocalStorage(sessionData) {
    try {
      const existingData = lsGet('typing_sessions');
      const newSession = {
        ...sessionData,
        id: lsGenId(),
        saved_at: new Date().toISOString(),
        synced: true,
        source: 'localStorage'
      };

      existingData.push(newSession);
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }

      lsSet('typing_sessions', existingData);
      logger.info("Session saved to localStorage");
      return true;
    } catch (error) {
      logger.error("Error saving to localStorage:", error);
      return false;
    }
  },

  // Get user's typing history from localStorage
  async getHistory(limit = 50) {
    return this.getLocalHistory(limit);
  },

  // Get history from localStorage
  getLocalHistory(limit = 50) {
    try {
      const data = lsGet('typing_sessions');
      return data.slice(-limit).reverse();
    } catch (error) {
      logger.error("Error reading from localStorage:", error);
      return [];
    }
  },

  // Get statistics by planet from localStorage
  async getStatsByPlanet() {
    return this.getLocalStatsByPlanet();
  },

  // Calculate planet statistics from data
  calculatePlanetStats(data) {
    const stats = {};

    data.forEach((session) => {
      if (!stats[session.planet]) {
        stats[session.planet] = {
          sessions: 0,
          totalWpm: 0,
          totalAccuracy: 0,
          totalTyped: 0,
          totalErrors: 0,
          bestWpm: 0,
          bestAccuracy: 0,
        };
      }

      const planetStats = stats[session.planet];
      planetStats.sessions++;
      planetStats.totalWpm += session.wpm;
      planetStats.totalAccuracy += session.accuracy;
      planetStats.totalTyped += session.total_typed || session.totalTyped || 0;
      planetStats.totalErrors += session.total_errors || session.totalErrors || 0;

      if (session.wpm > planetStats.bestWpm) {
        planetStats.bestWpm = session.wpm;
      }

      if (session.accuracy > planetStats.bestAccuracy) {
        planetStats.bestAccuracy = session.accuracy;
      }
    });

    Object.keys(stats).forEach((planet) => {
      const planetStats = stats[planet];
      planetStats.avgWpm = planetStats.totalWpm / planetStats.sessions;
      planetStats.avgAccuracy = planetStats.totalAccuracy / planetStats.sessions;
    });

    return stats;
  },

  // Get local stats by planet
  getLocalStatsByPlanet() {
    try {
      const data = lsGet('typing_sessions');
      return this.calculatePlanetStats(data);
    } catch (error) {
      logger.error("Error reading local stats:", error);
      return {};
    }
  },

  // Get overall statistics from localStorage
  async getOverallStats() {
    return this.getLocalOverallStats();
  },

  // Calculate overall statistics
  calculateOverallStats(data) {
    if (!data || data.length === 0) {
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalTyped: 0,
        totalErrors: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalTime: 0,
      };
    }

    const stats = {
      totalSessions: data.length,
      totalWpm: 0,
      totalAccuracy: 0,
      totalTyped: 0,
      totalErrors: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      totalTime: 0,
    };

    data.forEach((session) => {
      stats.totalWpm += session.wpm;
      stats.totalAccuracy += session.accuracy;
      stats.totalTyped += session.total_typed || session.totalTyped || 0;
      stats.totalErrors += session.total_errors || session.totalErrors || 0;

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
  },

  // Get local overall stats
  getLocalOverallStats() {
    try {
      const data = lsGet('typing_sessions');
      return this.calculateOverallStats(data);
    } catch (error) {
      logger.error("Error reading local overall stats:", error);
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalTyped: 0,
        totalErrors: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalTime: 0,
      };
    }
  },

  // Mark local session as synced (no-op since always local)
  markAsSynced(sessionId) {
    logger.info(`Session ${sessionId} already local`);
  },
};

// Practice texts management (localStorage only)
export const PracticeTexts = {
  async getTextsByPlanet(planet) {
    return this.getLocalTextsByPlanet(planet);
  },

  getLocalTextsByPlanet(planet) {
    const localTexts = {
      earth: [
        "地球は太陽系の第三惑星です。生命が存在する唯一の惑星として知られています。",
        "私たちの故郷である地球は、美しい青い惑星です。海と陸地が調和した姿は、宇宙から見ると特別な存在です。",
        "地球の大気は主に窒素と酸素で構成されており、生命を支える重要な役割を果たしています。",
      ],
      mars: [
        "火星は太陽系の第四惑星で、赤い惑星として知られています。",
        "火星の表面には、かつて水が流れていた痕跡が残されています。",
        "火星探査機は、この惑星の秘密を解き明かすために日夜観測を続けています。",
      ],
      jupiter: [
        "木星は太陽系最大の惑星で、ガス惑星の代表的な存在です。",
        "木星の大赤斑は、数百年にわたって続いている巨大な嵐です。",
        "木星の強い重力は、太陽系の他の天体の軌道に大きな影響を与えています。",
      ],
      saturn: [
        "土星は美しい環を持つ惑星として、天文学者たちを魅了し続けています。",
        "土星の環は、無数の氷の粒子で構成されており、太陽の光を反射して輝きます。",
        "土星の衛星タイタンは、地球以外で唯一、表面に液体の湖が存在することが確認されています。",
      ],
    };

    return localTexts[planet] || [];
  },

  async getRandomText(planet) {
    const texts = await this.getTextsByPlanet(planet);
    if (texts.length === 0) {
      return "テキストが見つかりませんでした。";
    }
    return texts[Math.floor(Math.random() * texts.length)];
  },

  async savePreferences(preferences) {
    this.savePreferencesToLocal(preferences);
    return true;
  },

  savePreferencesToLocal(preferences) {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      logger.info("Preferences saved to localStorage");
      return true;
    } catch (error) {
      logger.error("Error saving preferences to localStorage:", error);
      return false;
    }
  },

  async getPreferences() {
    return this.getPreferencesFromLocal();
  },

  getPreferencesFromLocal() {
    try {
      const prefs = localStorage.getItem('user_preferences');
      return prefs ? JSON.parse(prefs) : this.getDefaultPreferences();
    } catch (error) {
      logger.error("Error reading preferences from localStorage:", error);
      return this.getDefaultPreferences();
    }
  },

  getDefaultPreferences() {
    return {
      theme: 'dark',
      sound_enabled: true,
      show_wpm: true,
      show_accuracy: true,
      auto_save: true,
    };
  },
};

// No-op error handler
export function handleSupabaseError(error, fallbackData = null) {
  logger.error("Operation failed:", error);
  return fallbackData;
}

// No-op: always returns null (no Supabase client)
export function getSupabaseClient() {
  return null;
}

// Always returns true (no network dependency)
export function isSupabaseOnline() {
  return true;
}
