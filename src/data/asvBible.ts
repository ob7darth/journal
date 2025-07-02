// This file will contain the full ASV Bible text
// Due to size constraints, this is a structure example
// You would need to obtain the full ASV text from a reliable source

export interface BibleBook {
  name: string;
  chapters: BibleChapter[];
}

export interface BibleChapter {
  number: number;
  verses: BibleVerse[];
}

export interface BibleVerse {
  number: number;
  text: string;
}

// Sample structure - you would replace this with the full ASV dataset
export const asvBibleData: BibleBook[] = [
  {
    name: "Genesis",
    chapters: [
      {
        number: 1,
        verses: [
          { number: 1, text: "In the beginning God created the heavens and the earth." },
          { number: 2, text: "And the earth was waste and void; and darkness was upon the face of the deep: and the Spirit of God moved upon the face of the waters." },
          { number: 3, text: "And God said, Let there be light: and there was light." },
          // ... continue with all verses of Genesis 1
        ]
      },
      // ... continue with all chapters of Genesis
    ]
  },
  // ... continue with all 66 books of the Bible
];

// Helper function to convert the structured data to the format expected by BibleService
export const convertToServiceFormat = (books: BibleBook[]) => {
  const verses: Array<{book: string, chapter: number, verse: number, text: string}> = [];
  
  for (const book of books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        verses.push({
          book: book.name,
          chapter: chapter.number,
          verse: verse.number,
          text: verse.text
        });
      }
    }
  }
  
  return verses;
};