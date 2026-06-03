// バリデーション機能
// ==================== バリデーション機能 ====================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function validateEmail(email) {
  try {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  } catch (error) {
    debugLog('メールバリデーションエラー:', error);
    return false;
  }
}

function validatePassword(password) {
  try {
    if (!password || typeof password !== 'string') return false;
    
    // 最小6文字
    return password.length >= 6;
  } catch (error) {
    debugLog('パスワードバリデーションエラー:', error);
    return false;
  }
}

function validateMealName(name) {
  try {
    if (!name || typeof name !== 'string') return false;
    
    const trimmed = name.trim();
    return trimmed.length >= 1 && trimmed.length <= 200;
  } catch (error) {
    debugLog('料理名バリデーションエラー:', error);
    return false;
  }
}

function validateCategory(category) {
  try {
    if (!category || typeof category !== 'string') return false;
    
    const trimmed = category.trim();
    return trimmed.length >= 1 && trimmed.length <= 50;
  } catch (error) {
    debugLog('カテゴリバリデーションエラー:', error);
    return false;
  }
}

function validateIngredient(ingredient) {
  try {
    if (!ingredient || typeof ingredient !== 'string') return false;
    
    const trimmed = ingredient.trim();
    return trimmed.length >= 1 && trimmed.length <= 50;
  } catch (error) {
    debugLog('食材バリデーションエラー:', error);
    return false;
  }
}

function validateFile(file) {
  try {
    if (!file || !file.type) return false;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  } catch (error) {
    debugLog('ファイルバリデーションエラー:', error);
    return false;
  }
}

function validateNutritionValue(value) {
  try {
    if (value === null || value === undefined || value === '') return true; // 空は許可
    
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  } catch (error) {
    debugLog('栄養値バリデーションエラー:', error);
    return false;
  }
}

// グローバル関数として公開
window.escapeHtml = escapeHtml;
window.sanitizeInput = sanitizeInput;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.validateMealName = validateMealName;
window.validateCategory = validateCategory;
window.validateIngredient = validateIngredient;
window.validateFile = validateFile;
window.validateNutritionValue = validateNutritionValue;
