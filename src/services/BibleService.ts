export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BiblePassage {
  book: string;
  chapter: number;
  verses: string;
  text: BibleVerse[];
}

import { nasbBibleService } from './NASBBibleService';

class BibleService {
  // Use the NASB Bible service as the primary data source
  private nasbService = nasbBibleService;

  async getPassage(book: string, chapter: number, verses: string): Promise<BiblePassage | null> {
    try {
      // Try to get from NASB service first
      const passage = await this.nasbService.getPassage(book, chapter, verses);
      if (passage) {
        return passage;
      }
    } catch (error) {
      console.error('Error fetching from NASB service:', error);
    }

    // Return null if no passage found
    return null;
  }

  async searchVerses(query: string, limit: number = 20): Promise<BibleVerse[]> {
    try {
      // Try to search in NASB service first
      const results = await this.nasbService.searchVerses(query, limit);
      if (results.length > 0) {
        return results;
      }
    } catch (error) {
      console.error('Error searching in NASB service:', error);
    }

    // Return empty array if no results
    return [];
  }

  async getStats(): Promise<{totalVerses: number, totalBooks: number, totalChapters: number}> {
    try {
      return await this.nasbService.getStats();
    } catch (error) {
      console.error('Error getting stats from NASB service:', error);
      return {
        totalVerses: 0,
        totalBooks: 0,
        totalChapters: 0
      };
    }
  }

  // Check if Bible data is loaded
  isLoaded(): boolean {
    return this.nasbService.isLoaded();
  }
}

export const bibleService = new BibleService();