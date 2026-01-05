/**
 * Auto-save utility for drafts
 */

export class AutoSaveManager {
  constructor(documentId, saveCallback, interval = 30000) {
    this.documentId = documentId;
    this.saveCallback = saveCallback;
    this.interval = interval;
    this.timer = null;
    this.lastSaved = null;
    this.isDirty = false;
  }

  /**
   * Mark document as dirty (needs saving)
   */
  markDirty() {
    this.isDirty = true;
    this.startAutoSave();
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      if (this.isDirty) {
        this.save();
      }
    }, this.interval);
  }

  /**
   * Save document
   */
  async save() {
    try {
      await this.saveCallback();
      this.isDirty = false;
      this.lastSaved = new Date();
      return true;
    } catch (error) {
      console.error('Auto-save error:', error);
      return false;
    }
  }

  /**
   * Stop auto-save
   */
  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Force save immediately
   */
  async forceSave() {
    this.stop();
    return await this.save();
  }

  /**
   * Get last saved time
   */
  getLastSaved() {
    return this.lastSaved;
  }

  /**
   * Check if document has unsaved changes
   */
  hasUnsavedChanges() {
    return this.isDirty;
  }
}

