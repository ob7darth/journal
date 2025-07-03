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
  private sampleVerses: BibleVerse[] = [
    // Genesis
    { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning God created the heavens and the earth.' },
    { book: 'Genesis', chapter: 1, verse: 2, text: 'And the earth was waste and void; and darkness was upon the face of the deep: and the Spirit of God moved upon the face of the waters.' },
    { book: 'Genesis', chapter: 1, verse: 3, text: 'And God said, Let there be light: and there was light.' },
    { book: 'Genesis', chapter: 1, verse: 26, text: 'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the birds of the heavens, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.' },
    { book: 'Genesis', chapter: 1, verse: 27, text: 'And God created man in his own image, in the image of God created he him; male and female created he them.' },
    
    // Psalms
    { book: 'Psalms', chapter: 23, verse: 1, text: 'Jehovah is my shepherd; I shall not want.' },
    { book: 'Psalms', chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures; He leadeth me beside still waters.' },
    { book: 'Psalms', chapter: 23, verse: 3, text: 'He restoreth my soul: He guideth me in the paths of righteousness for his name\'s sake.' },
    { book: 'Psalms', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil; for thou art with me; Thy rod and thy staff, they comfort me.' },
    
    // Matthew
    { book: 'Matthew', chapter: 5, verse: 3, text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.' },
    { book: 'Matthew', chapter: 5, verse: 4, text: 'Blessed are they that mourn: for they shall be comforted.' },
    { book: 'Matthew', chapter: 5, verse: 13, text: 'Ye are the salt of the earth: but if the salt have lost its savor, wherewith shall it be salted? it is thenceforth good for nothing, but to be cast out and trodden under foot of men.' },
    { book: 'Matthew', chapter: 5, verse: 14, text: 'Ye are the light of the world. A city set on a hill cannot be hid.' },
    { book: 'Matthew', chapter: 6, verse: 9, text: 'After this manner therefore pray ye. Our Father who art in heaven, Hallowed be thy name.' },
    
    // John
    { book: 'John', chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
    { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth on him should not perish, but have eternal life.' },
    { book: 'John', chapter: 14, verse: 6, text: 'Jesus saith unto him, I am the way, and the truth, and the life: no one cometh unto the Father, but by me.' },
    
    // Romans
    { book: 'Romans', chapter: 3, verse: 23, text: 'for all have sinned, and fall short of the glory of God;' },
    { book: 'Romans', chapter: 6, verse: 23, text: 'For the wages of sin is death; but the free gift of God is eternal life in Christ Jesus our Lord.' },
    { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that to them that love God all things work together for good, even to them that are called according to his purpose.' },
    
    // Philippians
    { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things in him that strengtheneth me.' },
    { book: 'Philippians', chapter: 4, verse: 19, text: 'And my God shall supply every need of yours according to his riches in glory in Christ Jesus.' }
  ];

  async getPassage(book: string, chapter: number, verses: string): Promise<BiblePassage | null> {
    // Find verses that match the book and chapter
    const matchingVerses = this.sampleVerses.filter(v => 
      v.book === book && v.chapter === chapter
    );

    if (matchingVerses.length === 0) {
      return {
        book,
        chapter,
        verses,
        text: [{
          book,
          chapter,
          verse: 1,
          text: `[${book} ${chapter}:${verses}] - This passage is not available in the sample data. Please refer to your Bible or use the Bible Gateway link.`
        }]
      };
    }

    return {
      book,
      chapter,
      verses,
      text: matchingVerses
    };
  }

  async searchVerses(query: string, limit: number = 20): Promise<BibleVerse[]> {
    const results = this.sampleVerses.filter(verse => 
      verse.text.toLowerCase().includes(query.toLowerCase())
    );

    return results.slice(0, limit);
  }

  async getStats(): Promise<{totalVerses: number, totalBooks: number, totalChapters: number}> {
    const uniqueBooks = new Set(this.sampleVerses.map(v => v.book));
    const uniqueChapters = new Set(this.sampleVerses.map(v => `${v.book}-${v.chapter}`));

    return {
      totalVerses: this.sampleVerses.length,
      totalBooks: uniqueBooks.size,
      totalChapters: uniqueChapters.size
    };
  }
}

export const bibleService = new BibleService();