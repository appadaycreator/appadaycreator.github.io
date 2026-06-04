// Text Manager Module for Cosmic Typing Adventure
// Handles practice text management, filtering, favorites, and custom texts
// Version: 2.0.0

import { logger } from './logger.js';
import { errorHandler } from './error-handler.js';
import { DOMUtils } from './dom-utils.js';

export class TextManager {
  constructor(supabaseClient = null) {
    this.supabase = supabaseClient;
    this.texts = [];
    this.customTexts = [];
    this.filters = {
      category: null,
      difficulty: null,
      favorite: false
    };
    this.currentUserId = null;
  }

  /**
   * Initialize text manager
   */
  async init() {
    try {
      await this.loadTextsFromJSON();
      if (this.supabase) {
        await this.loadTextsFromSupabase();
        await this.loadCustomTexts();
      }
      logger.info('TextManager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize TextManager:', error);
      errorHandler.handleError(error, {
        userMessage: 'テキストの読み込みに失敗しました。',
        showNotification: true
      });
    }
  }

  /**
   * Load texts from local JSON file
   */
  async loadTextsFromJSON() {
    try {
      const response = await fetch('./data/practice-texts.json');
      if (!response.ok) {
        throw new Error('Failed to fetch practice texts');
      }
      const data = await response.json();
      this.texts = data.texts || [];
      logger.info(`Loaded ${this.texts.length} texts from JSON`);
    } catch (error) {
      logger.error('Failed to load texts from JSON:', error);
      throw error;
    }
  }

  /**
   * Load texts from Supabase
   */
  async loadTextsFromSupabase() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('practice_texts')
        .select('*')
        .eq('is_active', true)
        .order('text_id');

      if (error) throw error;

      // Merge with local texts (Supabase takes precedence)
      if (data && data.length > 0) {
        const supabaseTextIds = new Set(data.map(t => t.text_id));
        this.texts = [
          ...data,
          ...this.texts.filter(t => !supabaseTextIds.has(t.id))
        ];
        logger.info(`Loaded ${data.length} texts from Supabase`);
      }
    } catch (error) {
      logger.warn('Failed to load texts from Supabase:', error);
      // Continue with local texts
    }
  }

  /**
   * Load custom texts from Supabase
   */
  async loadCustomTexts() {
    if (!this.supabase || !this.currentUserId) return;

    try {
      const { data, error } = await this.supabase
        .from('custom_texts')
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.customTexts = data || [];
      logger.info(`Loaded ${this.customTexts.length} custom texts`);
    } catch (error) {
      logger.warn('Failed to load custom texts:', error);
    }
  }

  /**
   * Get texts by filter
   */
  getFilteredTexts(filters = {}) {
    let filtered = [...this.texts];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty !== null && filters.difficulty !== undefined) {
      filtered = filtered.filter(t => t.difficulty === filters.difficulty);
    }

    // Apply favorite filter
    if (filters.favorite) {
      filtered = filtered.filter(t => t.is_favorite === true);
    }

    return filtered;
  }

  /**
   * Get random text
   */
  getRandomText(filters = {}) {
    const filtered = this.getFilteredTexts(filters);
    if (filtered.length === 0) {
      logger.warn('No texts found for given filters', filters);
      return null;
    }
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  /**
   * Get text by ID
   */
  getTextById(textId) {
    return this.texts.find(t => t.id === textId || t.text_id === textId);
  }

  /**
   * Get recommended texts based on user proficiency
   */
  async getRecommendedTexts(userId, limit = 10) {
    if (!this.supabase) {
      // Fallback to local recommendation
      return this.getLocalRecommendedTexts(limit);
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_recommended_texts', {
          p_user_id: userId,
          p_limit: limit
        });

      if (error) throw error;

      return data || this.getLocalRecommendedTexts(limit);
    } catch (error) {
      logger.warn('Failed to get recommended texts from Supabase:', error);
      return this.getLocalRecommendedTexts(limit);
    }
  }

  /**
   * Get local recommended texts (fallback)
   */
  getLocalRecommendedTexts(limit = 10) {
    // Simple recommendation: get random texts from each difficulty
    const texts = [...this.texts];
    const shuffled = texts.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(textId) {
    // Update local state
    const text = this.getTextById(textId);
    if (text) {
      text.is_favorite = !text.is_favorite;
    }

    // Update in localStorage
    this.saveFavoritesToLocalStorage();

    // Update in Supabase if available
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .rpc('toggle_favorite_text', { p_text_id: textId });

        if (error) throw error;

        logger.info(`Toggled favorite for text ${textId}: ${data}`);
        return data;
      } catch (error) {
        logger.warn('Failed to toggle favorite in Supabase:', error);
      }
    }

    return text ? text.is_favorite : false;
  }

  /**
   * Save favorites to localStorage
   */
  saveFavoritesToLocalStorage() {
    try {
      const favorites = this.texts
        .filter(t => t.is_favorite)
        .map(t => t.id || t.text_id);
      localStorage.setItem('favorite_texts', JSON.stringify(favorites));
    } catch (error) {
      logger.error('Failed to save favorites to localStorage:', error);
    }
  }

  /**
   * Load favorites from localStorage
   */
  loadFavoritesFromLocalStorage() {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorite_texts') || '[]');
      this.texts.forEach(text => {
        if (favorites.includes(text.id || text.text_id)) {
          text.is_favorite = true;
        }
      });
      logger.debug(`Loaded ${favorites.length} favorites from localStorage`);
    } catch (error) {
      logger.error('Failed to load favorites from localStorage:', error);
    }
  }

  /**
   * Upload custom text
   */
  async uploadCustomText(textData) {
    // Validate input
    if (!textData.title || !textData.content) {
      throw new Error('タイトルと内容は必須です');
    }

    // Calculate metadata
    const metadata = this.calculateTextMetadata(textData.content);

    const customText = {
      ...textData,
      word_count: metadata.wordCount,
      char_count: metadata.charCount,
      source: textData.source || 'manual',
      user_id: this.currentUserId,
      created_at: new Date().toISOString()
    };

    // Save to Supabase if available
    if (this.supabase && this.currentUserId) {
      try {
        const { data, error } = await this.supabase
          .from('custom_texts')
          .insert([customText])
          .select();

        if (error) throw error;

        this.customTexts.unshift(data[0]);
        logger.info('Custom text uploaded to Supabase');
        return data[0];
      } catch (error) {
        logger.error('Failed to upload custom text to Supabase:', error);
        throw error;
      }
    }

    // Save to localStorage as fallback
    this.saveCustomTextToLocalStorage(customText);
    this.customTexts.unshift(customText);
    logger.info('Custom text saved to localStorage');
    return customText;
  }

  /**
   * Load text from URL
   */
  async loadTextFromURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('URLからテキストの読み込みに失敗しました');
      }
      
      const contentType = response.headers.get('content-type');
      let content = '';

      if (contentType && contentType.includes('text/html')) {
        // Parse HTML and extract text
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove script and style elements
        const scripts = doc.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());
        
        // Get text content
        content = doc.body.textContent || '';
        content = content.trim().replace(/\s+/g, ' ');
      } else {
        // Plain text
        content = await response.text();
      }

      return {
        title: this.extractTitleFromURL(url),
        content: content.substring(0, 1000), // Limit to 1000 chars
        source: 'url',
        source_url: url
      };
    } catch (error) {
      logger.error('Failed to load text from URL:', error);
      throw new Error('URLからテキストの読み込みに失敗しました');
    }
  }

  /**
   * Extract title from URL
   */
  extractTitleFromURL(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/').filter(p => p);
      return parts[parts.length - 1] || urlObj.hostname;
    } catch {
      return 'カスタムテキスト';
    }
  }

  /**
   * Calculate text metadata
   */
  calculateTextMetadata(text) {
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    return {
      charCount,
      wordCount
    };
  }

  /**
   * Save custom text to localStorage
   */
  saveCustomTextToLocalStorage(text) {
    try {
      const stored = JSON.parse(localStorage.getItem('custom_texts') || '[]');
      stored.unshift(text);
      // Keep only last 50
      if (stored.length > 50) {
        stored.splice(50);
      }
      localStorage.setItem('custom_texts', JSON.stringify(stored));
    } catch (error) {
      logger.error('Failed to save custom text to localStorage:', error);
    }
  }

  /**
   * Load custom texts from localStorage
   */
  loadCustomTextsFromLocalStorage() {
    try {
      const stored = JSON.parse(localStorage.getItem('custom_texts') || '[]');
      this.customTexts = [...stored, ...this.customTexts];
      logger.debug(`Loaded ${stored.length} custom texts from localStorage`);
    } catch (error) {
      logger.error('Failed to load custom texts from localStorage:', error);
    }
  }

  /**
   * Delete custom text
   */
  async deleteCustomText(textId) {
    // Remove from local array
    this.customTexts = this.customTexts.filter(t => t.id !== textId);

    // Remove from Supabase if available
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('custom_texts')
          .delete()
          .eq('id', textId);

        if (error) throw error;

        logger.info(`Deleted custom text ${textId} from Supabase`);
      } catch (error) {
        logger.warn('Failed to delete custom text from Supabase:', error);
      }
    }

    // Remove from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('custom_texts') || '[]');
      const filtered = stored.filter(t => t.id !== textId);
      localStorage.setItem('custom_texts', JSON.stringify(filtered));
    } catch (error) {
      logger.error('Failed to delete custom text from localStorage:', error);
    }
  }

  /**
   * Get all texts (including custom)
   */
  getAllTexts() {
    return [...this.texts, ...this.customTexts];
  }

  /**
   * Get texts by category
   */
  getTextsByCategory(category) {
    return this.getFilteredTexts({ category });
  }

  /**
   * Get texts by difficulty
   */
  getTextsByDifficulty(difficulty) {
    return this.getFilteredTexts({ difficulty });
  }

  /**
   * Get favorite texts
   */
  getFavoriteTexts() {
    return this.getFilteredTexts({ favorite: true });
  }

  /**
   * Get categories
   */
  getCategories() {
    return [
      { id: 'daily', name: '日常会話', description: '日常生活で使う会話表現' },
      { id: 'business', name: 'ビジネス', description: 'ビジネスシーンで使う表現' },
      { id: 'programming', name: 'プログラミング', description: 'プログラミング関連の用語と文章' },
      { id: 'literature', name: '文学', description: '文学作品からの抜粋' }
    ];
  }

  /**
   * Get difficulty levels
   */
  getDifficultyLevels() {
    return [
      { id: 1, name: '初級', description: '基本的なタイピング練習' },
      { id: 2, name: '中級', description: '少し難しい文章での練習' },
      { id: 3, name: '上級', description: '長文や専門用語を含む難しい文章' }
    ];
  }

  /**
   * Set current user ID
   */
  setCurrentUserId(userId) {
    this.currentUserId = userId;
  }

  /**
   * Get text statistics
   */
  getStatistics() {
    return {
      total: this.texts.length,
      byCategory: this.getCategories().map(cat => ({
        category: cat.name,
        count: this.texts.filter(t => t.category === cat.id).length
      })),
      byDifficulty: this.getDifficultyLevels().map(diff => ({
        difficulty: diff.name,
        count: this.texts.filter(t => t.difficulty === diff.id).length
      })),
      favorites: this.texts.filter(t => t.is_favorite).length,
      custom: this.customTexts.length
    };
  }
}

// Export singleton instance
let textManagerInstance = null;

export function getTextManager(supabaseClient = null) {
  if (!textManagerInstance) {
    textManagerInstance = new TextManager(supabaseClient);
  }
  return textManagerInstance;
}
