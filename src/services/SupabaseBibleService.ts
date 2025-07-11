import { supabase, canUseSupabase } from '../lib/supabase';
import { BibleVerse, BiblePassage } from './BibleService';

interface JSONBibleData {
  books: {
    [bookName: string]: {
      chapters: {
        [chapterNumber: string]: {
          verses: {
            [verseNumber: string]: string;
          };
        };
      };
    };
  };
}

class SupabaseBibleService {
  private bibleData: JSONBibleData | null = null;
  private _dataLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  private bucketName = 'bible-data'; // Default bucket name - you can change this
  private fileName = 'bible.json'; // Default file name - you can change this

  constructor() {
    // Auto-load on instantiation
    this.loadBibleData();
  }

  // Allow configuration of bucket and file names
  configure(bucketName: string, fileName: string) {
    this.bucketName = bucketName;
    this.fileName = fileName;
    // Reset and reload with new configuration
    this.bibleData = null;
    this._dataLoaded = false;
    this.loadingPromise = null;
    this.loadBibleData();
  }

  private async loadBibleData(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.fetchAndParseJSONData();
    return this.loadingPromise;
  }

  private async fetchAndParseJSONData(): Promise<void> {
    if (!canUseSupabase() || !supabase) {
      console.warn('Supabase not configured, skipping JSON Bible data load');
      this._dataLoaded = true;
      return;
    }

    try {
      console.log(`Loading Bible data from Supabase storage: ${this.bucketName}/${this.fileName}`);
      
      // Download the JSON file from Supabase storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(this.fileName);

      if (error) {
        console.error('Error downloading Bible JSON from Supabase storage:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from Supabase storage');
      }

      // Convert Blob to text
      const jsonText = await data.text();
      
      // Parse JSON
      this.bibleData = JSON.parse(jsonText);
      this._dataLoaded = true;
      
      console.log('Bible JSON data loaded successfully from Supabase storage');
      console.log('Available books:', Object.keys(this.bibleData?.books || {}));
      
    } catch (error) {
      console.error('Error loading Bible data from Supabase storage:', error);
      this._dataLoaded = true; // Mark as loaded even on error to prevent infinite retries
      
      // You might want to show a user-friendly error message here
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          console.warn(`Bible JSON file not found at ${this.bucketName}/${this.fileName}`);
        } else if (error.message.includes('permission')) {
          console.warn('Permission denied accessing Bible JSON file. Check your RLS policies.');
        }
      }
    }
  }

  async getPassage(book: string, chapter: number, verses: string): Promise<BiblePassage | null> {
    await this.loadBibleData();

    if (!this.bibleData) {
      console.warn('Bible JSON data not available');
      return null;
    }

    // Normalize book name (handle different formats)
    const normalizedBook = this.normalizeBookName(book);
    const bookData = this.bibleData.books[normalizedBook];

    if (!bookData) {
      console.warn(`Book not found in JSON data: ${book} (normalized: ${normalizedBook})`);
      return null;
    }

    const chapterData = bookData.chapters[chapter.toString()];
    if (!chapterData) {
      console.warn(`Chapter not found: ${book} ${chapter}`);
      return null;
    }

    // Parse verse range (e.g., "1-5", "3", "1-3,5-7")
    const verseNumbers = this.parseVerseRange(verses);
    const matchingVerses: BibleVerse[] = [];

    for (const verseNum of verseNumbers) {
      const verseText = chapterData.verses[verseNum.toString()];
      if (verseText) {
        matchingVerses.push({
          book: normalizedBook,
          chapter,
          verse: verseNum,
          text: verseText
        });
      }
    }

    if (matchingVerses.length === 0) {
      console.warn(`No verses found for ${book} ${chapter}:${verses}`);
      return null;
    }

    return {
      book: normalizedBook,
      chapter,
      verses,
      text: matchingVerses
    };
  }

  async searchVerses(query: string, limit: number = 20): Promise<BibleVerse[]> {
    await this.loadBibleData();

    if (!this.bibleData) {
      return [];
    }

    const results: BibleVerse[] = [];
    const searchTerm = query.toLowerCase();

    for (const [bookName, bookData] of Object.entries(this.bibleData.books)) {
      for (const [chapterNum, chapterData] of Object.entries(bookData.chapters)) {
        for (const [verseNum, verseText] of Object.entries(chapterData.verses)) {
          if (verseText.toLowerCase().includes(searchTerm)) {
            results.push({
              book: bookName,
              chapter: parseInt(chapterNum),
              verse: parseInt(verseNum),
              text: verseText
            });

            if (results.length >= limit) {
              return results;
            }
          }
        }
      }
    }

    return results;
  }

  async getStats(): Promise<{totalVerses: number, totalBooks: number, totalChapters: number}> {
    await this.loadBibleData();

    if (!this.bibleData) {
      return {
        totalVerses: 0,
        totalBooks: 0,
        totalChapters: 0
      };
    }

    let totalVerses = 0;
    let totalChapters = 0;
    const totalBooks = Object.keys(this.bibleData.books).length;

    for (const bookData of Object.values(this.bibleData.books)) {
      const chapters = Object.keys(bookData.chapters);
      totalChapters += chapters.length;
      
      for (const chapterData of Object.values(bookData.chapters)) {
        totalVerses += Object.keys(chapterData.verses).length;
      }
    }

    return {
      totalVerses,
      totalBooks,
      totalChapters
    };
  }

  isLoaded(): boolean {
    return this._dataLoaded;
  }

  hasData(): boolean {
    return this.bibleData !== null;
  }

  getAvailableBooks(): string[] {
    if (!this.bibleData) {
      return [];
    }
    return Object.keys(this.bibleData.books);
  }

  private normalizeBookName(book: string): string {
    // Handle common book name variations
    const bookMappings: Record<string, string> = {
      'Genesis': 'Genesis',
      'Gen': 'Genesis',
      'Gen.': 'Genesis',
      'Exodus': 'Exodus',
      'Ex': 'Exodus',
      'Ex.': 'Exodus',
      'Leviticus': 'Leviticus',
      'Lev': 'Leviticus',
      'Lev.': 'Leviticus',
      'Numbers': 'Numbers',
      'Num': 'Numbers',
      'Num.': 'Numbers',
      'Deuteronomy': 'Deuteronomy',
      'Deut': 'Deuteronomy',
      'Deut.': 'Deuteronomy',
      'Joshua': 'Joshua',
      'Josh': 'Joshua',
      'Josh.': 'Joshua',
      'Judges': 'Judges',
      'Judg': 'Judges',
      'Judg.': 'Judges',
      'Ruth': 'Ruth',
      '1 Samuel': '1 Samuel',
      '1Sam': '1 Samuel',
      '1 Sam': '1 Samuel',
      '1 Sam.': '1 Samuel',
      '2 Samuel': '2 Samuel',
      '2Sam': '2 Samuel',
      '2 Sam': '2 Samuel',
      '2 Sam.': '2 Samuel',
      '1 Kings': '1 Kings',
      '1Ki': '1 Kings',
      '1 Ki': '1 Kings',
      '1 Ki.': '1 Kings',
      '2 Kings': '2 Kings',
      '2Ki': '2 Kings',
      '2 Ki': '2 Kings',
      '2 Ki.': '2 Kings',
      'Psalms': 'Psalms',
      'Ps': 'Psalms',
      'Ps.': 'Psalms',
      'Psalm': 'Psalms',
      'Proverbs': 'Proverbs',
      'Prov': 'Proverbs',
      'Prov.': 'Proverbs',
      'Matthew': 'Matthew',
      'Matt': 'Matthew',
      'Mt': 'Matthew',
      'Mt.': 'Matthew',
      'Mark': 'Mark',
      'Mk': 'Mark',
      'Mk.': 'Mark',
      'Luke': 'Luke',
      'Lk': 'Luke',
      'Lk.': 'Luke',
      'John': 'John',
      'Jn': 'John',
      'Jn.': 'John',
      'Acts': 'Acts',
      'Romans': 'Romans',
      'Rom': 'Romans',
      'Rom.': 'Romans',
      '1 Corinthians': '1 Corinthians',
      '1Cor': '1 Corinthians',
      '1 Cor': '1 Corinthians',
      '1 Cor.': '1 Corinthians',
      '2 Corinthians': '2 Corinthians',
      '2Cor': '2 Corinthians',
      '2 Cor': '2 Corinthians',
      '2 Cor.': '2 Corinthians',
      'Galatians': 'Galatians',
      'Gal': 'Galatians',
      'Gal.': 'Galatians',
      'Ephesians': 'Ephesians',
      'Eph': 'Ephesians',
      'Eph.': 'Ephesians',
      'Philippians': 'Philippians',
      'Phil': 'Philippians',
      'Phil.': 'Philippians',
      'Colossians': 'Colossians',
      'Col': 'Colossians',
      'Col.': 'Colossians',
      '1 Thessalonians': '1 Thessalonians',
      '1Th': '1 Thessalonians',
      '1 Th': '1 Thessalonians',
      '1 Th.': '1 Thessalonians',
      '2 Thessalonians': '2 Thessalonians',
      '2Th': '2 Thessalonians',
      '2 Th': '2 Thessalonians',
      '2 Th.': '2 Thessalonians',
      '1 Timothy': '1 Timothy',
      '1Tim': '1 Timothy',
      '1 Tim': '1 Timothy',
      '1 Tim.': '1 Timothy',
      '2 Timothy': '2 Timothy',
      '2Tim': '2 Timothy',
      '2 Tim': '2 Timothy',
      '2 Tim.': '2 Timothy',
      'Titus': 'Titus',
      'Tit': 'Titus',
      'Tit.': 'Titus',
      'Philemon': 'Philemon',
      'Philem': 'Philemon',
      'Philem.': 'Philemon',
      'Hebrews': 'Hebrews',
      'Heb': 'Hebrews',
      'Heb.': 'Hebrews',
      'James': 'James',
      'Jas': 'James',
      'Jas.': 'James',
      '1 Peter': '1 Peter',
      '1Pet': '1 Peter',
      '1 Pet': '1 Peter',
      '1 Pet.': '1 Peter',
      '2 Peter': '2 Peter',
      '2Pet': '2 Peter',
      '2 Pet': '2 Peter',
      '2 Pet.': '2 Peter',
      '1 John': '1 John',
      '1Jn': '1 John',
      '1 Jn': '1 John',
      '1 Jn.': '1 John',
      '2 John': '2 John',
      '2Jn': '2 John',
      '2 Jn': '2 John',
      '2 Jn.': '2 John',
      '3 John': '3 John',
      '3Jn': '3 John',
      '3 Jn': '3 John',
      '3 Jn.': '3 John',
      'Jude': 'Jude',
      'Revelation': 'Revelation',
      'Rev': 'Revelation',
      'Rev.': 'Revelation'
    };

    return bookMappings[book] || book;
  }

  private parseVerseRange(verses: string): number[] {
    const result: number[] = [];
    const parts = verses.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            result.push(i);
          }
        }
      } else {
        const num = parseInt(trimmed);
        if (!isNaN(num)) {
          result.push(num);
        }
      }
    }

    return result.sort((a, b) => a - b);
  }
}

export const supabaseBibleService = new SupabaseBibleService();