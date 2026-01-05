/**
 * Document statistics utilities
 */

export class DocumentStats {
  /**
   * Calculate word count
   */
  static wordCount(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate character count (with and without spaces)
   */
  static characterCount(text, includeSpaces = true) {
    if (!text) return 0;
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
  }

  /**
   * Calculate paragraph count
   */
  static paragraphCount(text) {
    if (!text) return 0;
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  }

  /**
   * Calculate line count
   */
  static lineCount(text) {
    if (!text) return 0;
    return text.split('\n').length;
  }

  /**
   * Estimate reading time (words per minute)
   */
  static readingTime(text, wordsPerMinute = 200) {
    const words = this.wordCount(text);
    const minutes = words / wordsPerMinute;
    return {
      minutes: Math.ceil(minutes),
      seconds: Math.ceil((minutes % 1) * 60),
      words
    };
  }

  /**
   * Get language distribution (simple detection)
   */
  static languageDistribution(text) {
    // Simple detection based on character ranges
    const hindiPattern = /[\u0900-\u097F]/g;
    const englishPattern = /[a-zA-Z]/g;
    const numbersPattern = /[0-9]/g;

    const hindiMatches = text.match(hindiPattern) || [];
    const englishMatches = text.match(englishPattern) || [];
    const numbersMatches = text.match(numbersPattern) || [];

    const total = hindiMatches.length + englishMatches.length + numbersMatches.length;

    return {
      hindi: total > 0 ? (hindiMatches.length / total * 100).toFixed(1) : 0,
      english: total > 0 ? (englishMatches.length / total * 100).toFixed(1) : 0,
      numbers: total > 0 ? (numbersMatches.length / total * 100).toFixed(1) : 0,
      other: total > 0 ? ((text.length - total) / text.length * 100).toFixed(1) : 0
    };
  }

  /**
   * Get all statistics
   */
  static getAllStats(text) {
    return {
      words: this.wordCount(text),
      characters: this.characterCount(text, true),
      charactersNoSpaces: this.characterCount(text, false),
      paragraphs: this.paragraphCount(text),
      lines: this.lineCount(text),
      readingTime: this.readingTime(text),
      languageDistribution: this.languageDistribution(text)
    };
  }
}

