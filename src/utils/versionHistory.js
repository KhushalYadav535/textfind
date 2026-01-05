import { base44 } from '../api/base44Client';

/**
 * Version history management for documents
 */

export class VersionHistory {
  /**
   * Save a new version of a document
   */
  static async saveVersion(documentId, text, metadata = {}) {
    const version = {
      id: Date.now().toString(),
      documentId,
      text,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        wordCount: text.split(/\s+/).length,
        characterCount: text.length
      }
    };

    // Get existing versions
    const existingVersions = await this.getVersions(documentId);
    const versions = [...existingVersions, version];

    // Keep only last 20 versions
    const limitedVersions = versions.slice(-20);

    // Store in localStorage
    const key = `version_history_${documentId}`;
    localStorage.setItem(key, JSON.stringify(limitedVersions));

    return version;
  }

  /**
   * Get all versions for a document
   */
  static async getVersions(documentId) {
    const key = `version_history_${documentId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get a specific version
   */
  static async getVersion(documentId, versionId) {
    const versions = await this.getVersions(documentId);
    return versions.find(v => v.id === versionId);
  }

  /**
   * Restore a version (creates new version with restored content)
   */
  static async restoreVersion(documentId, versionId) {
    const version = await this.getVersion(documentId, versionId);
    if (!version) throw new Error('Version not found');

    // Save as new version
    return await this.saveVersion(documentId, version.text, {
      restoredFrom: versionId,
      restoredAt: new Date().toISOString()
    });
  }

  /**
   * Compare two versions
   */
  static compareVersions(version1, version2) {
    const text1 = version1.text || '';
    const text2 = version2.text || '';

    // Simple diff - in production, use a proper diff library
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    const changes = [];
    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      if (i >= lines1.length) {
        changes.push({ type: 'added', line: i + 1, content: lines2[i] });
      } else if (i >= lines2.length) {
        changes.push({ type: 'removed', line: i + 1, content: lines1[i] });
      } else if (lines1[i] !== lines2[i]) {
        changes.push({ 
          type: 'modified', 
          line: i + 1, 
          oldContent: lines1[i],
          newContent: lines2[i]
        });
      }
    }

    return {
      added: changes.filter(c => c.type === 'added').length,
      removed: changes.filter(c => c.type === 'removed').length,
      modified: changes.filter(c => c.type === 'modified').length,
      changes
    };
  }

  /**
   * Delete all versions for a document
   */
  static async deleteVersions(documentId) {
    const key = `version_history_${documentId}`;
    localStorage.removeItem(key);
  }
}

