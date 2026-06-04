// Language Manager for Cosmic Typing Adventure

import { logger } from './logger.js';
import { getTextManager } from './text-manager.js';

export class LanguageManager {
    constructor() {
        this.practiceTexts = {};
        this.textManager = null;
        this.loadPracticeTexts();
        logger.info('Language Manager initialized');
    }

    async loadPracticeTexts() {
        try {
            const jaResponse = await fetch('data/practice-texts.json');
            this.practiceTexts = { ja: await jaResponse.json() };
            
            // Initialize TextManager
            this.textManager = getTextManager();
            await this.textManager.loadTextsFromJSON();
            
            logger.info('Practice texts loaded successfully');
        } catch (error) {
            logger.error('Failed to load practice texts:', error);
            this.practiceTexts = { ja: { planets: {}, texts: [] } };
        }
    }

    // Get practice text (with TextManager integration)
    getPracticeText(planetKey, textId = null) {
        // Try to get from TextManager first
        if (this.textManager && this.textManager.texts.length > 0) {
            if (textId) {
                return this.textManager.getTextById(textId);
            } else {
                // P4: 直近5件の重複回避
                const filters = this.getPlanetFilters(planetKey);
                const allFiltered = this.textManager.getFilteredTexts(filters);
                if (allFiltered.length === 0) return this.textManager.getRandomText(filters);
                const recent = this._recentIds || [];
                const candidates = allFiltered.filter(t => !recent.includes(t.id));
                const pool = candidates.length > 0 ? candidates : allFiltered;
                const pick = pool[Math.floor(Math.random() * pool.length)];
                this._recentIds = [...recent.slice(-4), pick.id];
                return pick;
            }
        }

        // Fallback to old planet-based system
        const planet = this.practiceTexts.ja?.planets?.[planetKey];
        if (!planet || !planet.texts) {
            // Try to get from texts array
            const texts = this.practiceTexts.ja?.texts || [];
            if (texts.length > 0) {
                const randomIndex = Math.floor(Math.random() * texts.length);
                return texts[randomIndex];
            }
            return null;
        }
        
        if (textId) {
            return planet.texts.find(text => text.id === textId || text.text_id === textId);
        } else {
            const randomIndex = Math.floor(Math.random() * planet.texts.length);
            return planet.texts[randomIndex];
        }
    }

    // Get filters based on planet
    getPlanetFilters(planetKey) {
        const planetFilterMap = {
            'earth': { difficulty: 1, category: 'daily' },
            'mars': { difficulty: 2, category: 'business' },
            'jupiter': { difficulty: 2, category: 'programming' },
            'saturn': { difficulty: 3, category: 'literature' },
            'code': { difficulty: 3, category: 'code_snippets' }
        };

        return planetFilterMap[planetKey] || {};
    }

    // Get recommended texts based on user proficiency
    async getRecommendedTexts(userId, limit = 10) {
        if (this.textManager) {
            return await this.textManager.getRecommendedTexts(userId, limit);
        }
        return [];
    }

    // Get texts by category
    getTextsByCategory(category) {
        if (this.textManager) {
            return this.textManager.getTextsByCategory(category);
        }
        return [];
    }

    // Get texts by difficulty
    getTextsByDifficulty(difficulty) {
        if (this.textManager) {
            return this.textManager.getTextsByDifficulty(difficulty);
        }
        return [];
    }
} 