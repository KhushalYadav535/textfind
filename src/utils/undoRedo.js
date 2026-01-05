/**
 * Undo/Redo utility for text editors
 */

export class UndoRedoManager {
  constructor(initialState = '') {
    this.history = [initialState];
    this.currentIndex = 0;
    this.maxHistorySize = 50;
  }

  /**
   * Add new state to history
   */
  push(state) {
    // Remove any states after current index (when undoing and then making new change)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new state
    this.history.push(state);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo - go back one state
   */
  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Redo - go forward one state
   */
  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Check if undo is possible
   */
  canUndo() {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrent() {
    return this.history[this.currentIndex];
  }

  /**
   * Reset history
   */
  reset(initialState = '') {
    this.history = [initialState];
    this.currentIndex = 0;
  }

  /**
   * Clear history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

