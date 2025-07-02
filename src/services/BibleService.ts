import initSqlJs, { Database } from 'sql.js';

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

class BibleService {
  private db: Database | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
      });

      // Create in-memory database
      this.db = new SQL.Database();
      
      // Create the bible table
      this.db.run(`
        CREATE TABLE bible (
          id INTEGER PRIMARY KEY,
          book TEXT NOT NULL,
          chapter INTEGER NOT NULL,
          verse INTEGER NOT NULL,
          text TEXT NOT NULL
        );
        
        CREATE INDEX idx_book_chapter_verse ON bible(book, chapter, verse);
      `);

      // Load sample NIV verses for demonstration
      await this.loadSampleVerses();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Bible database:', error);
      throw error;
    }
  }

  private async loadSampleVerses(): Promise<void> {
    if (!this.db) return;

    // Sample NIV verses for the first few days of the reading plan
    const sampleVerses = [
      // Genesis 1
      { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning God created the heavens and the earth.' },
      { book: 'Genesis', chapter: 1, verse: 2, text: 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.' },
      { book: 'Genesis', chapter: 1, verse: 3, text: 'And God said, "Let there be light," and there was light.' },
      { book: 'Genesis', chapter: 1, verse: 27, text: 'So God created mankind in his own image, in the image of God he created them; male and female he created them.' },
      { book: 'Genesis', chapter: 1, verse: 31, text: 'God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.' },
      
      // Genesis 2
      { book: 'Genesis', chapter: 2, verse: 7, text: 'Then the Lord God formed a man from the dust of the ground and breathed into his nostrils the breath of life, and the man became a living being.' },
      { book: 'Genesis', chapter: 2, verse: 18, text: 'The Lord God said, "It is not good for the man to be alone. I will make a helper suitable for him."' },
      
      // Luke 1
      { book: 'Luke', chapter: 1, verse: 1, text: 'Many have undertaken to draw up an account of the things that have been fulfilled among us,' },
      { book: 'Luke', chapter: 1, verse: 37, text: 'For no word from God will ever fail.' },
      { book: 'Luke', chapter: 1, verse: 46, text: 'And Mary said: "My soul glorifies the Lord' },
      
      // Matthew 5 (Beatitudes)
      { book: 'Matthew', chapter: 5, verse: 3, text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.' },
      { book: 'Matthew', chapter: 5, verse: 4, text: 'Blessed are those who mourn, for they will be comforted.' },
      { book: 'Matthew', chapter: 5, verse: 5, text: 'Blessed are the meek, for they will inherit the earth.' },
      { book: 'Matthew', chapter: 5, verse: 6, text: 'Blessed are those who hunger and thirst for righteousness, for they will be filled.' },
      { book: 'Matthew', chapter: 5, verse: 13, text: 'You are the salt of the earth. But if the salt loses its saltiness, how can it be made salty again?' },
      { book: 'Matthew', chapter: 5, verse: 14, text: 'You are the light of the world. A town built on a hill cannot be hidden.' },
      { book: 'Matthew', chapter: 5, verse: 16, text: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.' },
      
      // Psalms
      { book: 'Psalms', chapter: 1, verse: 1, text: 'Blessed is the one who does not walk in step with the wicked or stand in the way that sinners take or sit in the company of mockers,' },
      { book: 'Psalms', chapter: 1, verse: 2, text: 'but whose delight is in the law of the Lord, and who meditates on his law day and night.' },
      { book: 'Psalms', chapter: 23, verse: 1, text: 'The Lord is my shepherd, I lack nothing.' },
      { book: 'Psalms', chapter: 23, verse: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
      { book: 'Psalms', chapter: 119, verse: 105, text: 'Your word is a lamp for my feet, a light on my path.' },
      
      // John
      { book: 'John', chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { book: 'John', chapter: 1, verse: 14, text: 'The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.' },
      { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
      { book: 'John', chapter: 14, verse: 6, text: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."' },
      
      // Romans
      { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
      { book: 'Romans', chapter: 12, verse: 2, text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is—his good, pleasing and perfect will.' },
      
      // Philippians
      { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all this through him who gives me strength.' },
      { book: 'Philippians', chapter: 4, verse: 19, text: 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.' }
    ];

    const stmt = this.db.prepare('INSERT INTO bible (book, chapter, verse, text) VALUES (?, ?, ?, ?)');
    
    for (const verse of sampleVerses) {
      stmt.run([verse.book, verse.chapter, verse.verse, verse.text]);
    }
    
    stmt.free();
  }

  async getPassage(book: string, chapter: number, verses: string): Promise<BiblePassage | null> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      let verseNumbers: number[] = [];
      
      // Parse verse range (e.g., "1-5", "1,3,5", "1-3,5-7")
      if (verses.includes('-') && verses.includes(',')) {
        // Handle mixed ranges like "1-3,5-7"
        const parts = verses.split(',');
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= end; i++) {
              verseNumbers.push(i);
            }
          } else {
            verseNumbers.push(parseInt(part.trim()));
          }
        }
      } else if (verses.includes('-')) {
        // Handle simple range like "1-5"
        const [start, end] = verses.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          verseNumbers.push(i);
        }
      } else if (verses.includes(',')) {
        // Handle comma-separated like "1,3,5"
        verseNumbers = verses.split(',').map(n => parseInt(n.trim()));
      } else {
        // Single verse
        verseNumbers = [parseInt(verses)];
      }

      // If we don't have specific verses in the database, return a sample passage
      const stmt = this.db!.prepare(`
        SELECT * FROM bible 
        WHERE book = ? AND chapter = ? AND verse IN (${verseNumbers.map(() => '?').join(',')})
        ORDER BY verse
      `);
      
      const result = stmt.all([book, chapter, ...verseNumbers]);
      stmt.free();

      if (result.length === 0) {
        // Return a placeholder passage if not found in database
        return {
          book,
          chapter,
          verses,
          text: [{
            book,
            chapter,
            verse: verseNumbers[0] || 1,
            text: `[${book} ${chapter}:${verses}] - This passage is not yet loaded in the local database. Please refer to your Bible or use the Bible Gateway link below.`
          }]
        };
      }

      return {
        book,
        chapter,
        verses,
        text: result.map(row => ({
          book: row.book as string,
          chapter: row.chapter as number,
          verse: row.verse as number,
          text: row.text as string
        }))
      };
    } catch (error) {
      console.error('Error fetching passage:', error);
      return null;
    }
  }

  async searchVerses(query: string, limit: number = 10): Promise<BibleVerse[]> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const stmt = this.db!.prepare(`
        SELECT * FROM bible 
        WHERE text LIKE ? 
        ORDER BY book, chapter, verse 
        LIMIT ?
      `);
      
      const result = stmt.all([`%${query}%`, limit]);
      stmt.free();

      return result.map(row => ({
        book: row.book as string,
        chapter: row.chapter as number,
        verse: row.verse as number,
        text: row.text as string
      }));
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }

  // Method to load full Bible data (would be called with actual NIV data)
  async loadFullBible(bibleData: BibleVerse[]): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    const stmt = this.db!.prepare('INSERT INTO bible (book, chapter, verse, text) VALUES (?, ?, ?, ?)');
    
    for (const verse of bibleData) {
      stmt.run([verse.book, verse.chapter, verse.verse, verse.text]);
    }
    
    stmt.free();
  }
}

export const bibleService = new BibleService();