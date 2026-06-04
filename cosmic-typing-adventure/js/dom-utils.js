// DOM操作ユーティリティ
// DOM要素の取得と操作を簡素化し、重複コードを削減

import { logger } from './logger.js';

/**
 * DOMユーティリティクラス
 */
class DOMUtils {
  /**
   * IDで要素を取得
   * @param {string} id - 要素のID
   * @param {boolean} required - 必須かどうか（デフォルト: true）
   * @returns {HTMLElement|null}
   */
  static getElementById(id, required = true) {
    const element = document.getElementById(id);
    if (!element && required) {
      logger.error(`必須要素が見つかりません: #${id}`);
    }
    return element;
  }

  /**
   * セレクタで要素を取得
   * @param {string} selector - CSSセレクタ
   * @param {boolean} required - 必須かどうか（デフォルト: true）
   * @returns {HTMLElement|null}
   */
  static querySelector(selector, required = true) {
    const element = document.querySelector(selector);
    if (!element && required) {
      logger.error(`必須要素が見つかりません: ${selector}`);
    }
    return element;
  }

  /**
   * セレクタで複数の要素を取得
   * @param {string} selector - CSSセレクタ
   * @returns {NodeList}
   */
  static querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * 複数のIDで要素をまとめて取得
   * @param {Object} idMap - {キー: ID}の形式のオブジェクト
   * @param {boolean} required - 必須かどうか（デフォルト: true）
   * @returns {Object} {キー: 要素}の形式のオブジェクト
   */
  static getElementsById(idMap, required = true) {
    const elements = {};
    for (const [key, id] of Object.entries(idMap)) {
      elements[key] = this.getElementById(id, required);
    }
    return elements;
  }

  /**
   * 要素を表示
   * @param {HTMLElement|string} element - 要素またはID
   */
  static show(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.classList.remove('hidden');
      el.style.display = '';
    }
  }

  /**
   * 要素を非表示
   * @param {HTMLElement|string} element - 要素またはID
   */
  static hide(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.classList.add('hidden');
    }
  }

  /**
   * 要素の表示/非表示を切り替え
   * @param {HTMLElement|string} element - 要素またはID
   */
  static toggle(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.classList.toggle('hidden');
    }
  }

  /**
   * テキストコンテンツを安全に設定（XSS対策）
   * @param {HTMLElement|string} element - 要素またはID
   * @param {string} text - テキスト
   */
  static setText(element, text) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.textContent = String(text);
    }
  }

  /**
   * HTMLを安全に設定（サニタイズ済みの内容のみ使用）
   * @param {HTMLElement|string} element - 要素またはID
   * @param {string} html - HTML文字列
   */
  static setHTML(element, html) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.innerHTML = html;
    }
  }

  /**
   * 属性を設定
   * @param {HTMLElement|string} element - 要素またはID
   * @param {string} attr - 属性名
   * @param {string} value - 属性値
   */
  static setAttribute(element, attr, value) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.setAttribute(attr, value);
    }
  }

  /**
   * クラスを追加
   * @param {HTMLElement|string} element - 要素またはID
   * @param {string} className - クラス名
   */
  static addClass(element, className) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.classList.add(className);
    }
  }

  /**
   * クラスを削除
   * @param {HTMLElement|string} element - 要素またはID
   * @param {string} className - クラス名
   */
  static removeClass(element, className) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.classList.remove(className);
    }
  }

  /**
   * クラスの有無を切り替え
   * @param {HTMLElement|string} element - 要素またはID
   * @param {string} className - クラス名
   */
  static toggleClass(element, className) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.classList.toggle(className);
    }
  }

  /**
   * イベントリスナーを追加
   * @param {HTMLElement|string} element - 要素またはID
   * @param {string} event - イベント名
   * @param {Function} handler - ハンドラ関数
   * @param {Object} options - オプション
   */
  static on(element, event, handler, options = {}) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.addEventListener(event, handler, options);
    }
  }

  /**
   * イベントリスナーを削除
   * @param {HTMLElement|string} element - 要素またはID
   * @param {string} event - イベント名
   * @param {Function} handler - ハンドラ関数
   */
  static off(element, event, handler) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.removeEventListener(event, handler);
    }
  }

  /**
   * 要素を作成
   * @param {string} tag - タグ名
   * @param {Object} attributes - 属性
   * @param {string} textContent - テキストコンテンツ
   * @returns {HTMLElement}
   */
  static createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.assign(element.dataset, value);
      } else {
        element.setAttribute(key, value);
      }
    }
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  }

  /**
   * 要素を削除
   * @param {HTMLElement|string} element - 要素またはID
   */
  static remove(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  /**
   * 子要素をすべて削除
   * @param {HTMLElement|string} element - 要素またはID
   */
  static empty(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }
  }

  /**
   * 要素が表示されているか確認
   * @param {HTMLElement|string} element - 要素またはID
   * @returns {boolean}
   */
  static isVisible(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (!el) return false;
    return !el.classList.contains('hidden') && el.style.display !== 'none';
  }

  /**
   * フォーカスを設定
   * @param {HTMLElement|string} element - 要素またはID
   */
  static focus(element) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.focus();
    }
  }

  /**
   * スクロールして要素を表示
   * @param {HTMLElement|string} element - 要素またはID
   * @param {Object} options - スクロールオプション
   */
  static scrollIntoView(element, options = { behavior: 'smooth', block: 'center' }) {
    const el = typeof element === 'string' ? this.getElementById(element) : element;
    if (el) {
      el.scrollIntoView(options);
    }
  }

  /**
   * DOMの準備完了を待つ
   * @returns {Promise}
   */
  static ready() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * 画像の読み込み完了を待つ
   * @param {string} src - 画像URL
   * @returns {Promise<HTMLImageElement>}
   */
  static loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`画像の読み込みに失敗: ${src}`));
      img.src = src;
    });
  }
}

export { DOMUtils };
