/**
 * localStorage Helper with Quota Management
 * Handles quota exceeded errors and manages storage limits
 */

const MAX_HISTORY_ITEMS = 50; // Maximum number of history items to keep
const STORAGE_KEY = 'uploadHistory';

/**
 * Get storage size in bytes
 */
export const getStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

/**
 * Get estimated storage quota (typically 5-10MB)
 */
export const getStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usagePercent: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error estimating storage:', error);
      return { usage: 0, quota: 0, usagePercent: 0 };
    }
  }
  return { usage: 0, quota: 0, usagePercent: 0 };
};

/**
 * Clean up old history items, keeping only the most recent N items
 */
export const cleanupHistory = (maxItems = MAX_HISTORY_ITEMS) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    if (existing.length <= maxItems) {
      return existing;
    }

    // Sort by date (newest first) and keep only the most recent items
    const sorted = existing.sort((a, b) => 
      new Date(b.created_date || b.id) - new Date(a.created_date || a.id)
    );
    
    const cleaned = sorted.slice(0, maxItems);
    
    // Remove file_data_url from old items to save space
    const optimized = cleaned.map((item, index) => {
      // Keep file_data_url only for the most recent 10 items
      if (index >= 10 && item.file_data_url) {
        const { file_data_url, ...rest } = item;
        return rest;
      }
      return item;
    });
    
    return optimized;
  } catch (error) {
    console.error('Error cleaning up history:', error);
    return [];
  }
};

/**
 * Save to localStorage with quota management and error handling
 */
export const saveToStorage = (key, data, options = {}) => {
  const {
    maxItems = MAX_HISTORY_ITEMS,
    removeFileData = false
  } = options;

  try {
    // Clean up data if it's an array (like history)
    let dataToSave = data;
    
    if (Array.isArray(data)) {
      // Clean up old items
      dataToSave = cleanupHistory(maxItems);
      
      // Remove file_data_url if requested to save space
      if (removeFileData) {
        dataToSave = dataToSave.map(item => {
          const { file_data_url, ...rest } = item;
          return rest;
        });
      }
    } else if (removeFileData && data.file_data_url) {
      // Remove file_data_url from single item
      const { file_data_url, ...rest } = data;
      dataToSave = rest;
    }

    const jsonString = JSON.stringify(dataToSave);
    
    // Try to save
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('Storage quota exceeded. Attempting cleanup...');
      
      // Try aggressive cleanup
      try {
        if (key === STORAGE_KEY) {
          // Remove file_data_url from all items
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const cleaned = existing.map(item => {
            const { file_data_url, ...rest } = item;
            return rest;
          });
          
          // Keep only last 20 items
          const limited = cleaned.slice(-20);
          
          localStorage.setItem(key, JSON.stringify(limited));
          console.log('Cleaned up storage, removed file data and old items');
          
          // Try to save the new item without file_data_url
          if (data && !Array.isArray(data)) {
            const { file_data_url, ...rest } = data;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(rest);
            const final = existing.slice(-20);
            localStorage.setItem(key, JSON.stringify(final));
          }
          
          return true;
        } else {
          // For other keys, try to clear some space
          clearOldStorage();
          localStorage.setItem(key, JSON.stringify(dataToSave));
          return true;
        }
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
        throw new Error('Storage is full. Please clear some history items manually.');
      }
    }
    
    throw error;
  }
};

/**
 * Clear old/unused storage items
 */
export const clearOldStorage = () => {
  try {
    // Clear old analytics data
    const analytics = localStorage.getItem('analytics');
    if (analytics) {
      const data = JSON.parse(analytics);
      // Keep only last 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (data.events) {
        data.events = data.events.filter(e => new Date(e.timestamp) > thirtyDaysAgo);
        localStorage.setItem('analytics', JSON.stringify(data));
      }
    }
    
    console.log('Cleared old storage items');
  } catch (error) {
    console.error('Error clearing old storage:', error);
  }
};

/**
 * Remove file_data_url from all history items to free up space
 */
export const removeFileDataFromHistory = () => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const cleaned = existing.map(item => {
      const { file_data_url, ...rest } = item;
      return rest;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    console.log('Removed file data from all history items');
    return cleaned;
  } catch (error) {
    console.error('Error removing file data:', error);
    return [];
  }
};

