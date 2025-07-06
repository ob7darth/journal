import { BibleVerse, BiblePassage } from './BibleService';

interface ParsedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

class NASBBibleService {
  private verses: Map<string, ParsedVerse[]> = new Map();
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    // Auto-load on instantiation
    this.loadBibleData();
  }

  private async loadBibleData(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.fetchAndParseBibleData();
    return this.loadingPromise;
  }

  private async fetchAndParseBibleData(): Promise<void> {
    try {
      console.log('Loading NASB Bible data...');
      
      // Note: Due to CORS restrictions, we may need to use a proxy or download the file
      // For now, let's create a fallback system with sample data
      const response = await fetch('/api/bible-data', {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        }
      }).catch(() => {
        console.warn('Could not fetch Bible data from API, using fallback data');
        return null;
      });

      let bibleText = '';
      
      if (response && response.ok) {
        bibleText = await response.text();
      } else {
        // Use fallback sample data for development
        bibleText = this.getFallbackBibleData();
      }

      this.parseBibleText(bibleText);
      this.isLoaded = true;
      console.log('Bible data loaded successfully');
      
    } catch (error) {
      console.error('Error loading Bible data:', error);
      // Load fallback data on error
      this.parseBibleText(this.getFallbackBibleData());
      this.isLoaded = true;
    }
  }

  private getFallbackBibleData(): string {
    // Fallback sample data for development/testing
    return `
Genesis 1:1 In the beginning God created the heavens and the earth.
Genesis 1:2 The earth was formless and void, and darkness was over the surface of the deep, and the Spirit of God was moving over the surface of the waters.
Genesis 1:3 Then God said, "Let there be light"; and there was light.
Genesis 1:4 God saw that the light was good; and God separated the light from the darkness.
Genesis 1:5 God called the light day, and the darkness He called night. And there was evening and there was morning, one day.

Psalms 23:1 The LORD is my shepherd, I shall not want.
Psalms 23:2 He makes me lie down in green pastures; He leads me beside quiet waters.
Psalms 23:3 He restores my soul; He guides me in the paths of righteousness For His name's sake.
Psalms 23:4 Even though I walk through the valley of the shadow of death, I fear no evil, for You are with me; Your rod and Your staff, they comfort me.
Psalms 23:5 You prepare a table before me in the presence of my enemies; You have anointed my head with oil; My cup overflows.
Psalms 23:6 Surely goodness and lovingkindness will follow me all the days of my life, And I will dwell in the house of the LORD forever.

John 3:16 For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life.
John 14:6 Jesus said to him, "I am the way, and the truth, and the life; no one comes to the Father but through Me."

Romans 3:23 for all have sinned and fall short of the glory of God,
Romans 6:23 For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.
Romans 8:28 And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.

Philippians 4:13 I can do all things through Him who strengthens me.
Philippians 4:19 And my God will supply all your needs according to His riches in glory in Christ Jesus.
`;
  }

  private parseBibleText(text: string): void {
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const parsed = this.parseVerseLine(line);
      if (parsed) {
        const key = `${parsed.book}_${parsed.chapter}`;
        if (!this.verses.has(key)) {
          this.verses.set(key, []);
        }
        this.verses.get(key)!.push(parsed);
      }
    }
  }

  private parseVerseLine(line: string): ParsedVerse | null {
    // Try different verse formats
    const patterns = [
      // "Genesis 1:1 In the beginning..."
      /^([A-Za-z0-9\s]+)\s+(\d+):(\d+)\s+(.+)$/,
      // "1 John 3:16 For God so loved..."
      /^(\d+\s+[A-Za-z]+)\s+(\d+):(\d+)\s+(.+)$/,
      // Handle books with numbers like "1 Kings", "2 Chronicles"
      /^(\d+\s+[A-Za-z]+)\s+(\d+):(\d+)\s+(.+)$/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, book, chapter, verse, text] = match;
        return {
          book: book.trim(),
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          text: text.trim()
        };
      }
    }

    return null;
  }

  private normalizeBookName(book: string): string {
    const bookMap: Record<string, string> = {
      'Gen': 'Genesis',
      'Ex': 'Exodus',
      'Lev': 'Leviticus',
      'Num': 'Numbers',
      'Deut': 'Deuteronomy',
      'Josh': 'Joshua',
      'Judg': 'Judges',
      '1 Sam': '1 Samuel',
      '2 Sam': '2 Samuel',
      '1 Ki': '1 Kings',
      '2 Ki': '2 Kings',
      '1 Chr': '1 Chronicles',
      '2 Chr': '2 Chronicles',
      'Ps': 'Psalms',
      'Prov': 'Proverbs',
      'Ecc': 'Ecclesiastes',
      'Is': 'Isaiah',
      'Jer': 'Jeremiah',
      'Ezek': 'Ezekiel',
      'Dan': 'Daniel',
      'Hos': 'Hosea',
      'Joel': 'Joel',
      'Amos': 'Amos',
      'Obad': 'Obadiah',
      'Jon': 'Jonah',
      'Mic': 'Micah',
      'Nah': 'Nahum',
      'Hab': 'Habakkuk',
      'Zeph': 'Zephaniah',
      'Hag': 'Haggai',
      'Zech': 'Zechariah',
      'Mal': 'Malachi',
      'Mt': 'Matthew',
      'Mk': 'Mark',
      'Lk': 'Luke',
      'Jn': 'John',
      'Acts': 'Acts',
      'Rom': 'Romans',
      '1 Cor': '1 Corinthians',
      '2 Cor': '2 Corinthians',
      'Gal': 'Galatians',
      'Eph': 'Ephesians',
      'Phil': 'Philippians',
      'Col': 'Colossians',
      '1 Th': '1 Thessalonians',
      '2 Th': '2 Thessalonians',
      '1 Tim': '1 Timothy',
      '2 Tim': '2 Timothy',
      'Tit': 'Titus',
      'Philem': 'Philemon',
      'Heb': 'Hebrews',
      'Jas': 'James',
      '1 Pet': '1 Peter',
      '2 Pet': '2 Peter',
      '1 Jn': '1 John',
      '2 Jn': '2 John',
      '3 Jn': '3 John',
      'Jude': 'Jude',
      'Rev': 'Revelation'
    };

    return bookMap[book] || book;
  }

  async getPassage(book: string, chapter: number, verses: string): Promise<BiblePassage | null> {
    await this.loadBibleData();

    const normalizedBook = this.normalizeBookName(book);
    const key = `${normalizedBook}_${chapter}`;
    const chapterVerses = this.verses.get(key);

    if (!chapterVerses) {
      console.warn(`No verses found for ${normalizedBook} ${chapter}`);
      return null;
    }

    // Parse verse range (e.g., "1-5", "3", "1-3,5-7")
    const verseNumbers = this.parseVerseRange(verses);
    const matchingVerses = chapterVerses.filter(v => 
      verseNumbers.includes(v.verse)
    );

    if (matchingVerses.length === 0) {
      return null;
    }

    return {
      book: normalizedBook,
      chapter,
      verses,
      text: matchingVerses.map(v => ({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text
      }))
    };
  }

  private parseVerseRange(verses: string): number[] {
    const result: number[] = [];
    const parts = verses.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          result.push(i);
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

  async searchVerses(query: string, limit: number = 20): Promise<BibleVerse[]> {
    await this.loadBibleData();

    const results: BibleVerse[] = [];
    const searchTerm = query.toLowerCase();

    for (const [, chapterVerses] of this.verses) {
      for (const verse of chapterVerses) {
        if (verse.text.toLowerCase().includes(searchTerm)) {
          results.push({
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text
          });

          if (results.length >= limit) {
            return results;
          }
        }
      }
    }

    return results;
  }

  async getStats(): Promise<{totalVerses: number, totalBooks: number, totalChapters: number}> {
    await this.loadBibleData();

    let totalVerses = 0;
    const uniqueBooks = new Set<string>();
    const uniqueChapters = new Set<string>();

    for (const [key, chapterVerses] of this.verses) {
      totalVerses += chapterVerses.length;
      
      for (const verse of chapterVerses) {
        uniqueBooks.add(verse.book);
        uniqueChapters.add(`${verse.book}_${verse.chapter}`);
      }
    }

    return {
      totalVerses,
      totalBooks: uniqueBooks.size,
      totalChapters: uniqueChapters.size
    };
  }

  isLoaded(): boolean {
    return this.isLoaded;
  }
}

export const nasbBibleService = new NASBBibleService();