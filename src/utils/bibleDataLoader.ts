// Utility to load full ASV Bible data from various sources

import { bibleService, BibleVerse } from '../services/BibleService';

export interface BibleDataSource {
  name: string;
  url: string;
  format: 'json' | 'csv' | 'xml' | 'txt';
}

// Common sources for ASV Bible data
export const asvDataSources: BibleDataSource[] = [
  {
    name: 'Bible API',
    url: 'https://bible-api.com/asv',
    format: 'json'
  },
  {
    name: 'ESV API',
    url: 'https://api.esv.org/v3/passage/text/',
    format: 'json'
  },
  {
    name: 'Bible Gateway',
    url: 'https://www.biblegateway.com/passage/',
    format: 'json'
  }
];

// Function to load ASV data from a JSON file
export async function loadASVFromJSON(jsonData: any[]): Promise<void> {
  const verses: BibleVerse[] = jsonData.map(item => ({
    book: item.book,
    chapter: parseInt(item.chapter),
    verse: parseInt(item.verse),
    text: item.text
  }));

  await bibleService.loadFullBible(verses);
}

// Function to load ASV data from CSV format
export async function loadASVFromCSV(csvText: string): Promise<void> {
  const lines = csvText.split('\n');
  const verses: BibleVerse[] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (!line) continue;

    const [book, chapter, verse, text] = line.split(',').map(item => 
      item.replace(/^"/, '').replace(/"$/, '') // Remove quotes
    );

    if (book && chapter && verse && text) {
      verses.push({
        book: book.trim(),
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        text: text.trim()
      });
    }
  }

  await bibleService.loadFullBible(verses);
}

// Function to parse and load Bible data from various formats
export async function loadBibleData(data: string, format: 'json' | 'csv' | 'xml' | 'txt'): Promise<void> {
  switch (format) {
    case 'json':
      const jsonData = JSON.parse(data);
      await loadASVFromJSON(jsonData);
      break;
    
    case 'csv':
      await loadASVFromCSV(data);
      break;
    
    case 'txt':
      // Parse plain text format (implement based on your text format)
      console.warn('Plain text format parsing not implemented yet');
      break;
    
    case 'xml':
      // Parse XML format (implement based on your XML structure)
      console.warn('XML format parsing not implemented yet');
      break;
    
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// Example function to demonstrate loading from a local file
export async function loadLocalASVData(): Promise<void> {
  try {
    // This would typically load from a local JSON file containing the full ASV text
    // For demonstration, we'll show the structure you would need
    
    const sampleFullData = [
      // This would contain all 31,102 verses of the Bible in ASV
      { book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heavens and the earth." },
      { book: "Genesis", chapter: 1, verse: 2, text: "And the earth was waste and void; and darkness was upon the face of the deep: and the Spirit of God moved upon the face of the waters." },
      // ... continue with all verses
      { book: "Revelation", chapter: 22, verse: 21, text: "The grace of the Lord Jesus be with the saints. Amen." }
    ];

    await loadASVFromJSON(sampleFullData);
    console.log('ASV Bible data loaded successfully');
  } catch (error) {
    console.error('Failed to load ASV data:', error);
  }
}

// Function to check if full Bible is loaded
export async function checkBibleDataStatus(): Promise<{isLoaded: boolean, stats: any}> {
  const stats = await bibleService.getStats();
  
  // ASV has approximately 31,102 verses
  const isLoaded = stats.totalVerses > 30000;
  
  return {
    isLoaded,
    stats
  };
}