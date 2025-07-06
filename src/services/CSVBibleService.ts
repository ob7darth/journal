import { BibleVerse, BiblePassage } from './BibleService';

interface CSVVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

class CSVBibleService {
  private verses: Map<string, CSVVerse[]> = new Map();
  private _dataLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    // Auto-load on instantiation
    this.loadBibleData();
  }

  private async loadBibleData(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.fetchAndParseCSVData();
    return this.loadingPromise;
  }

  private async fetchAndParseCSVData(): Promise<void> {
    try {
      console.log('Loading Bible data from CSV...');
      
      let csvText = '';
      
      // Try to load from the uploaded CSV file
      try {
        const response = await fetch('/genesis_bible_verses.csv');
        if (response.ok) {
          csvText = await response.text();
          console.log('Successfully loaded Bible data from CSV file');
        } else {
          throw new Error('CSV file not found');
        }
      } catch (error) {
        console.log('Could not load CSV file, using fallback data...');
        csvText = this.getFallbackCSVData();
      }

      this.parseCSVText(csvText);
      this._dataLoaded = true;
      console.log(`Bible data loaded successfully. Parsed ${this.verses.size} chapters.`);
      
    } catch (error) {
      console.error('Error loading Bible data:', error);
      // Load fallback data on error
      this.parseCSVText(this.getFallbackCSVData());
      this._dataLoaded = true;
    }
  }

  private getFallbackCSVData(): string {
    // Fallback CSV data with Genesis verses
    return `book,chapter,verse,text
Genesis,1,1,"In the beginning God created the heavens and the earth."
Genesis,1,2,"The earth was formless and void, and darkness was over the surface of the deep, and the Spirit of God was moving over the surface of the waters."
Genesis,1,3,"Then God said, ""Let there be light""; and there was light."
Genesis,1,4,"God saw that the light was good; and God separated the light from the darkness."
Genesis,1,5,"God called the light day, and the darkness He called night. And there was evening and there was morning, one day."
Genesis,1,26,"Then God said, ""Let Us make man in Our image, according to Our likeness; and let them rule over the fish of the sea and over the birds of the sky and over the cattle and over all the earth, and over every creeping thing that creeps on the earth."""
Genesis,1,27,"God created man in His own image, in the image of God He created him; male and female He created them."
Genesis,1,28,"God blessed them; and God said to them, ""Be fruitful and multiply, and fill the earth, and subdue it; and rule over the fish of the sea and over the birds of the sky and over every living thing that moves on the earth."""
Genesis,2,7,"Then the LORD God formed man of dust from the ground, and breathed into his nostrils the breath of life; and man became a living being."
Genesis,2,15,"Then the LORD God took the man and put him into the garden of Eden to cultivate it and keep it."
Genesis,2,18,"Then the LORD God said, ""It is not good for the man to be alone; I will make him a helper suitable for him."""
Genesis,3,1,"Now the serpent was more cunning than any beast of the field which the LORD God had made. And he said to the woman, ""Has God indeed said, 'You shall not eat of every tree of the garden'?"""
Genesis,3,6,"When the woman saw that the tree was good for food, and that it was a delight to the eyes, and that the tree was desirable to make one wise, she took from its fruit and ate; and she gave also to her husband with her, and he ate."
Genesis,3,15,"And I will put enmity Between you and the woman, And between your seed and her seed; He shall bruise you on the head, And you shall bruise him on the heel."
Psalms,23,1,"The LORD is my shepherd, I shall not want."
Psalms,23,2,"He makes me lie down in green pastures; He leads me beside quiet waters."
Psalms,23,3,"He restores my soul; He guides me in the paths of righteousness For His name's sake."
Psalms,23,4,"Even though I walk through the valley of the shadow of death, I fear no evil, for You are with me; Your rod and Your staff, they comfort me."
John,3,16,"For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life."
John,14,6,"Jesus said to him, ""I am the way, and the truth, and the life; no one comes to the Father but through Me."""
Romans,3,23,"for all have sinned and fall short of the glory of God,"
Romans,6,23,"For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord."
Ephesians,2,8,"For by grace you have been saved through faith; and that not of yourselves, it is the gift of God;"
Ephesians,2,9,"not as a result of works, so that no one may boast."`;
  }

  private parseCSVText(csvText: string): void {
    const lines = csvText.split('\n').filter(line => line.trim());
    let parsedCount = 0;
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    for (const line of dataLines) {
      const parsed = this.parseCSVLine(line);
      if (parsed) {
        const key = `${parsed.book}_${parsed.chapter}`;
        if (!this.verses.has(key)) {
          this.verses.set(key, []);
        }
        this.verses.get(key)!.push(parsed);
        parsedCount++;
      }
    }
    
    console.log(`Parsed ${parsedCount} verses from ${dataLines.length} lines`);
  }

  private parseCSVLine(line: string): CSVVerse | null {
    try {
      // Simple CSV parsing - handles quoted fields
      const fields = this.parseCSVFields(line);
      
      if (fields.length < 4) {
        return null;
      }

      const [book, chapterStr, verseStr, text] = fields;
      const chapter = parseInt(chapterStr);
      const verse = parseInt(verseStr);

      if (isNaN(chapter) || isNaN(verse)) {
        return null;
      }

      return {
        book: book.trim(),
        chapter,
        verse,
        text: text.trim()
      };
    } catch (error) {
      console.warn('Error parsing CSV line:', line, error);
      return null;
    }
  }

  private parseCSVFields(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        fields.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    fields.push(current);
    
    return fields;
  }

  async getPassage(book: string, chapter: number, verses: string): Promise<BiblePassage | null> {
    await this.loadBibleData();

    const key = `${book}_${chapter}`;
    const chapterVerses = this.verses.get(key);

    if (!chapterVerses) {
      console.warn(`No verses found for ${book} ${chapter}`);
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
      book,
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
    return this._dataLoaded;
  }
}

export const csvBibleService = new CSVBibleService();