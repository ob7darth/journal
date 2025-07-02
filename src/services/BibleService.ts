import { initSqlJs, Database } from 'sql.js';

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

      // Load sample ASV verses for demonstration
      await this.loadSampleVerses();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Bible database:', error);
      throw error;
    }
  }

  private async loadSampleVerses(): Promise<void> {
    if (!this.db) return;

    // Sample ASV verses for the first few days of the reading plan
    const sampleVerses = [
      // Genesis 1
      { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning God created the heavens and the earth.' },
      { book: 'Genesis', chapter: 1, verse: 2, text: 'And the earth was waste and void; and darkness was upon the face of the deep: and the Spirit of God moved upon the face of the waters.' },
      { book: 'Genesis', chapter: 1, verse: 3, text: 'And God said, Let there be light: and there was light.' },
      { book: 'Genesis', chapter: 1, verse: 27, text: 'And God created man in his own image, in the image of God created he him; male and female created he them.' },
      { book: 'Genesis', chapter: 1, verse: 31, text: 'And God saw everything that he had made, and, behold, it was very good. And there was evening and there was morning, the sixth day.' },
      
      // Genesis 2
      { book: 'Genesis', chapter: 2, verse: 7, text: 'And Jehovah God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.' },
      { book: 'Genesis', chapter: 2, verse: 18, text: 'And Jehovah God said, It is not good that the man should be alone; I will make him a help meet for him.' },
      
      // Genesis 3
      { book: 'Genesis', chapter: 3, verse: 15, text: 'And I will put enmity between thee and the woman, and between thy seed and her seed: he shall bruise thy head, and thou shalt bruise his heel.' },
      { book: 'Genesis', chapter: 3, verse: 21, text: 'And Jehovah God made for Adam and for his wife coats of skins, and clothed them.' },
      
      // Luke 1
      { book: 'Luke', chapter: 1, verse: 1, text: 'Forasmuch as many have taken in hand to draw up a narrative concerning those matters which have been fulfilled among us,' },
      { book: 'Luke', chapter: 1, verse: 37, text: 'For no word from God shall be void of power.' },
      { book: 'Luke', chapter: 1, verse: 46, text: 'And Mary said, My soul doth magnify the Lord,' },
      { book: 'Luke', chapter: 1, verse: 47, text: 'And my spirit hath rejoiced in God my Saviour.' },
      
      // Luke 2
      { book: 'Luke', chapter: 2, verse: 10, text: 'And the angel said unto them, Be not afraid; for behold, I bring you good tidings of great joy which shall be to all the people:' },
      { book: 'Luke', chapter: 2, verse: 11, text: 'for there is born to you this day in the city of David a Saviour, who is Christ the Lord.' },
      { book: 'Luke', chapter: 2, verse: 14, text: 'Glory to God in the highest, And on earth peace among men in whom he is well pleased.' },
      
      // Matthew 5 (Beatitudes)
      { book: 'Matthew', chapter: 5, verse: 3, text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.' },
      { book: 'Matthew', chapter: 5, verse: 4, text: 'Blessed are they that mourn: for they shall be comforted.' },
      { book: 'Matthew', chapter: 5, verse: 5, text: 'Blessed are the meek: for they shall inherit the earth.' },
      { book: 'Matthew', chapter: 5, verse: 6, text: 'Blessed are they that hunger and thirst after righteousness: for they shall be filled.' },
      { book: 'Matthew', chapter: 5, verse: 13, text: 'Ye are the salt of the earth: but if the salt have lost its savor, wherewith shall it be salted? it is thenceforth good for nothing, but to be cast out and trodden under foot of men.' },
      { book: 'Matthew', chapter: 5, verse: 14, text: 'Ye are the light of the world. A city set on a hill cannot be hid.' },
      { book: 'Matthew', chapter: 5, verse: 16, text: 'Even so let your light shine before men; that they may see your good works, and glorify your Father who is in heaven.' },
      
      // Psalms
      { book: 'Psalms', chapter: 1, verse: 1, text: 'Blessed is the man that walketh not in the counsel of the wicked, Nor standeth in the way of sinners, Nor sitteth in the seat of scoffers:' },
      { book: 'Psalms', chapter: 1, verse: 2, text: 'But his delight is in the law of Jehovah; And on his law doth he meditate day and night.' },
      { book: 'Psalms', chapter: 1, verse: 3, text: 'And he shall be like a tree planted by the streams of water, That bringeth forth its fruit in its season, Whose leaf also doth not wither; And whatsoever he doeth shall prosper.' },
      { book: 'Psalms', chapter: 23, verse: 1, text: 'Jehovah is my shepherd; I shall not want.' },
      { book: 'Psalms', chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures; He leadeth me beside still waters.' },
      { book: 'Psalms', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil; for thou art with me; Thy rod and thy staff, they comfort me.' },
      { book: 'Psalms', chapter: 119, verse: 105, text: 'Thy word is a lamp unto my feet, And light unto my path.' },
      { book: 'Psalms', chapter: 119, verse: 11, text: 'Thy word have I laid up in my heart, That I might not sin against thee.' },
      
      // John
      { book: 'John', chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { book: 'John', chapter: 1, verse: 14, text: 'And the Word became flesh, and dwelt among us (and we beheld his glory, glory as of the only begotten from the Father), full of grace and truth.' },
      { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth on him should not perish, but have eternal life.' },
      { book: 'John', chapter: 14, verse: 6, text: 'Jesus saith unto him, I am the way, and the truth, and the life: no one cometh unto the Father, but by me.' },
      { book: 'John', chapter: 8, verse: 12, text: 'Again therefore Jesus spake unto them, saying, I am the light of the world: he that followeth me shall not walk in the darkness, but shall have the light of life.' },
      
      // Romans
      { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that to them that love God all things work together for good, even to them that are called according to his purpose.' },
      { book: 'Romans', chapter: 12, verse: 2, text: 'And be not fashioned according to this world: but be ye transformed by the renewing of your mind, and ye may prove what is the good and acceptable and perfect will of God.' },
      { book: 'Romans', chapter: 3, verse: 23, text: 'for all have sinned, and fall short of the glory of God;' },
      { book: 'Romans', chapter: 6, verse: 23, text: 'For the wages of sin is death; but the free gift of God is eternal life in Christ Jesus our Lord.' },
      
      // Philippians
      { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things in him that strengtheneth me.' },
      { book: 'Philippians', chapter: 4, verse: 19, text: 'And my God shall supply every need of yours according to his riches in glory in Christ Jesus.' },
      { book: 'Philippians', chapter: 4, verse: 6, text: 'In nothing be anxious; but in everything by prayer and supplication with thanksgiving let your requests be made known unto God.' },
      { book: 'Philippians', chapter: 4, verse: 7, text: 'And the peace of God, which passeth all understanding, shall guard your hearts and your thoughts in Christ Jesus.' },
      
      // Ephesians
      { book: 'Ephesians', chapter: 2, verse: 8, text: 'for by grace have ye been saved through faith; and that not of yourselves, it is the gift of God;' },
      { book: 'Ephesians', chapter: 2, verse: 9, text: 'not of works, that no man should glory.' },
      { book: 'Ephesians', chapter: 6, verse: 11, text: 'Put on the whole armor of God, that ye may be able to stand against the wiles of the devil.' },
      
      // 1 Corinthians
      { book: '1 Corinthians', chapter: 13, verse: 4, text: 'Love suffereth long, and is kind; love envieth not; love vaunteth not itself, is not puffed up,' },
      { book: '1 Corinthians', chapter: 13, verse: 13, text: 'But now abideth faith, hope, love, these three; and the greatest of these is love.' },
      { book: '1 Corinthians', chapter: 10, verse: 13, text: 'There hath no temptation taken you but such as man can bear: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation make also the way of escape, that ye may be able to endure it.' },
      
      // Proverbs
      { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in Jehovah with all thy heart, And lean not upon thine own understanding:' },
      { book: 'Proverbs', chapter: 3, verse: 6, text: 'In all thy ways acknowledge him, And he will direct thy paths.' },
      { book: 'Proverbs', chapter: 27, verse: 17, text: 'Iron sharpeneth iron; So a man sharpeneth the countenance of his friend.' },
      
      // Isaiah
      { book: 'Isaiah', chapter: 40, verse: 31, text: 'but they that wait for Jehovah shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; they shall walk, and not faint.' },
      { book: 'Isaiah', chapter: 55, verse: 11, text: 'so shall my word be that goeth forth out of my mouth: it shall not return unto me void, but it shall accomplish that which I please, and it shall prosper in the thing whereto I sent it.' },
      
      // Jeremiah
      { book: 'Jeremiah', chapter: 29, verse: 11, text: 'For I know the thoughts that I think toward you, saith Jehovah, thoughts of peace, and not of evil, to give you hope in your latter end.' },
      
      // 2 Timothy
      { book: '2 Timothy', chapter: 3, verse: 16, text: 'Every scripture inspired of God is also profitable for teaching, for reproof, for correction, for instruction which is in righteousness:' },
      
      // Hebrews
      { book: 'Hebrews', chapter: 11, verse: 1, text: 'Now faith is assurance of things hoped for, a conviction of things not seen.' },
      { book: 'Hebrews', chapter: 4, verse: 12, text: 'For the word of God is living, and active, and sharper than any two-edged sword, and piercing even to the dividing of soul and spirit, of both joints and marrow, and quick to discern the thoughts and intents of the heart.' },
      
      // James
      { book: 'James', chapter: 1, verse: 5, text: 'But if any of you lacketh wisdom, let him ask of God, who giveth to all liberally and upbraideth not; and it shall be given him.' },
      { book: 'James', chapter: 4, verse: 8, text: 'Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye doubleminded.' }
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

  // Method to load full Bible data (would be called with actual ASV data)
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