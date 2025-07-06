import { BibleVerse, BiblePassage } from './BibleService';

interface ParsedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

class NASBBibleService {
  private verses: Map<string, ParsedVerse[]> = new Map();
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

    this.loadingPromise = this.fetchAndParseBibleData();
    return this.loadingPromise;
  }

  private async fetchAndParseBibleData(): Promise<void> {
    try {
      console.log('Loading NASB Bible data...');
      
      let bibleText = '';
      
      // Try to load from the uploaded file in public folder
      try {
        const response = await fetch('/NASB New American Standard Bible (NASB)_djvu.txt');
        if (response.ok) {
          bibleText = await response.text();
          console.log('Successfully loaded Bible data from uploaded file');
        } else {
          throw new Error('File not found');
        }
      } catch (error) {
        console.log('Could not load uploaded Bible file, trying alternative names...');
        
        // Try alternative file names
        const alternativeNames = [
          '/bible-data.txt',
          '/nasb.txt',
          '/bible.txt'
        ];
        
        let loaded = false;
        for (const fileName of alternativeNames) {
          try {
            const response = await fetch(fileName);
            if (response.ok) {
              bibleText = await response.text();
              console.log(`Successfully loaded Bible data from ${fileName}`);
              loaded = true;
              break;
            }
          } catch (e) {
            // Continue to next file
          }
        }
        
        if (!loaded) {
          console.log('No Bible data file found, using fallback data');
          bibleText = this.getFallbackBibleData();
        }
      }

      this.parseBibleText(bibleText);
      this._dataLoaded = true;
      console.log(`Bible data loaded successfully. Parsed ${this.verses.size} chapters.`);
      
    } catch (error) {
      console.error('Error loading Bible data:', error);
      // Load fallback data on error
      this.parseBibleText(this.getFallbackBibleData());
      this._dataLoaded = true;
    }
  }

  private getFallbackBibleData(): string {
    // Comprehensive fallback data with key passages
    return `
Genesis 1:1 In the beginning God created the heavens and the earth.
Genesis 1:2 The earth was formless and void, and darkness was over the surface of the deep, and the Spirit of God was moving over the surface of the waters.
Genesis 1:3 Then God said, "Let there be light"; and there was light.
Genesis 1:26 Then God said, "Let Us make man in Our image, according to Our likeness; and let them rule over the fish of the sea and over the birds of the sky and over the cattle and over all the earth, and over every creeping thing that creeps on the earth."
Genesis 1:27 God created man in His own image, in the image of God He created him; male and female He created them.

Genesis 2:7 Then the LORD God formed man of dust from the ground, and breathed into his nostrils the breath of life; and man became a living being.
Genesis 3:15 And I will put enmity Between you and the woman, And between your seed and her seed; He shall bruise you on the head, And you shall bruise him on the heel.

Exodus 3:14 God said to Moses, "I AM WHO I AM"; and He said, "Thus you shall say to the sons of Israel, 'I AM has sent me to you.'"
Exodus 20:3 You shall have no other gods before Me.
Exodus 20:13 You shall not murder.
Exodus 20:14 You shall not commit adultery.
Exodus 20:15 You shall not steal.

Leviticus 19:18 You shall not take vengeance, nor bear any grudge against the sons of your people, but you shall love your neighbor as yourself; I am the LORD.

Numbers 6:24 The LORD bless you, and keep you;
Numbers 6:25 The LORD make His face shine on you, And be gracious to you;
Numbers 6:26 The LORD lift up His countenance on you, And give you peace.

Deuteronomy 6:4 Hear, O Israel! The LORD is our God, the LORD is one!
Deuteronomy 6:5 You shall love the LORD your God with all your heart and with all your soul and with all your might.

Joshua 1:9 Have I not commanded you? Be strong and courageous! Do not tremble or be dismayed, for the LORD your God is with you wherever you go.

Psalms 1:1 How blessed is the man who does not walk in the counsel of the wicked, Nor stand in the path of sinners, Nor sit in the seat of scoffers!
Psalms 1:2 But his delight is in the law of the LORD, And in His law he meditates day and night.
Psalms 1:3 He will be like a tree firmly planted by streams of water, Which yields its fruit in its season And its leaf does not wither; And in whatever he does, he prospers.

Psalms 23:1 The LORD is my shepherd, I shall not want.
Psalms 23:2 He makes me lie down in green pastures; He leads me beside quiet waters.
Psalms 23:3 He restores my soul; He guides me in the paths of righteousness For His name's sake.
Psalms 23:4 Even though I walk through the valley of the shadow of death, I fear no evil, for You are with me; Your rod and Your staff, they comfort me.
Psalms 23:5 You prepare a table before me in the presence of my enemies; You have anointed my head with oil; My cup overflows.
Psalms 23:6 Surely goodness and lovingkindness will follow me all the days of my life, And I will dwell in the house of the LORD forever.

Psalms 119:105 Your word is a lamp to my feet And a light to my path.
Psalms 119:11 Your word I have treasured in my heart, That I may not sin against You.

Proverbs 3:5 Trust in the LORD with all your heart And do not lean on your own understanding.
Proverbs 3:6 In all your ways acknowledge Him, And He will make your paths straight.

Isaiah 40:31 Yet those who wait for the LORD Will gain new strength; They will mount up with wings like eagles, They will run and not get tired, They will walk and not become weary.
Isaiah 53:5 But He was pierced through for our transgressions, He was crushed for our iniquities; The chastening for our well-being fell upon Him, And by His scourging we are healed.
Isaiah 55:11 So will My word be which goes forth from My mouth; It will not return to Me empty, Without accomplishing what I desire, And without succeeding in the matter for which I sent it.

Jeremiah 29:11 For I know the plans that I have for you,' declares the LORD, 'plans for welfare and not for calamity to give you a future and a hope.

Matthew 5:3 Blessed are the poor in spirit, for theirs is the kingdom of heaven.
Matthew 5:4 Blessed are those who mourn, for they shall be comforted.
Matthew 5:16 Let your light shine before men in such a way that they may see your good works, and glorify your Father who is in heaven.

Matthew 6:9 Pray, then, in this way: 'Our Father who is in heaven, Hallowed be Your name.
Matthew 6:10 Your kingdom come. Your will be done, On earth as it is in heaven.
Matthew 6:11 Give us this day our daily bread.
Matthew 6:12 And forgive us our debts, as we also have forgiven our debtors.
Matthew 6:13 And do not lead us into temptation, but deliver us from evil. For Yours is the kingdom and the power and the glory forever. Amen.'

Matthew 28:19 Go therefore and make disciples of all the nations, baptizing them in the name of the Father and the Son and the Holy Spirit,
Matthew 28:20 teaching them to observe all that I commanded you; and lo, I am with you always, even to the end of the age.

Mark 12:30 AND YOU SHALL LOVE THE LORD YOUR GOD WITH ALL YOUR HEART, AND WITH ALL YOUR SOUL, AND WITH ALL YOUR MIND, AND WITH ALL YOUR STRENGTH.
Mark 12:31 The second is this, 'YOU SHALL LOVE YOUR NEIGHBOR AS YOURSELF.' There is no other commandment greater than these.

Luke 2:10 But the angel said to them, "Do not be afraid; for behold, I bring you good news of great joy which will be for all the people;
Luke 2:11 for today in the city of David there has been born for you a Savior, who is Christ the Lord.

John 1:1 In the beginning was the Word, and the Word was with God, and the Word was God.
John 1:14 And the Word became flesh, and dwelt among us, and we saw His glory, glory as of the only begotten from the Father, full of grace and truth.
John 3:16 For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life.
John 14:6 Jesus said to him, "I am the way, and the truth, and the life; no one comes to the Father but through Me.

Acts 1:8 but you will receive power when the Holy Spirit has come upon you; and you shall be My witnesses both in Jerusalem, and in all Judea and Samaria, and even to the remotest part of the earth.

Romans 3:23 for all have sinned and fall short of the glory of God,
Romans 6:23 For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.
Romans 8:28 And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.
Romans 10:9 that if you confess with your mouth Jesus as Lord, and believe in your heart that God raised Him from the dead, you will be saved;

1 Corinthians 13:4 Love is patient, love is kind and is not jealous; love does not brag and is not arrogant,
1 Corinthians 13:13 But now faith, hope, love, abide these three; but the greatest of these is love.

Galatians 5:22 But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness,
Galatians 5:23 gentleness, self-control; against such things there is no law.

Ephesians 2:8 For by grace you have been saved through faith; and that not of yourselves, it is the gift of God;
Ephesians 2:9 not as a result of works, so that no one may boast.

Philippians 4:13 I can do all things through Him who strengthens me.
Philippians 4:19 And my God will supply all your needs according to His riches in glory in Christ Jesus.

2 Timothy 3:16 All Scripture is inspired by God and profitable for teaching, for reproof, for correction, for training in righteousness;

Hebrews 11:1 Now faith is the assurance of things hoped for, the conviction of things not seen.
Hebrews 13:8 Jesus Christ is the same yesterday and today and forever.

James 1:17 Every good thing given and every perfect gift is from above, coming down from the Father of lights, with whom there is no variation or shifting shadow.

1 Peter 5:7 casting all your anxiety on Him, because He cares for you.

1 John 1:9 If we confess our sins, He is faithful and righteous to forgive us our sins and to cleanse us from all unrighteousness.
1 John 4:19 We love, because He first loved us.

Revelation 3:20 Behold, I stand at the door and knock; if anyone hears My Voice and opens the door, I will come in to him and will dine with him, and he with Me.
`;
  }

  private parseBibleText(text: string): void {
    const lines = text.split('\n').filter(line => line.trim());
    let parsedCount = 0;
    
    for (const line of lines) {
      const parsed = this.parseVerseLine(line);
      if (parsed) {
        const key = `${parsed.book}_${parsed.chapter}`;
        if (!this.verses.has(key)) {
          this.verses.set(key, []);
        }
        this.verses.get(key)!.push(parsed);
        parsedCount++;
      }
    }
    
    console.log(`Parsed ${parsedCount} verses from ${lines.length} lines`);
  }

  private parseVerseLine(line: string): ParsedVerse | null {
    // Clean the line
    const cleanLine = line.trim();
    if (!cleanLine) return null;
    
    // Try different verse formats for NASB text
    const patterns = [
      // Standard format: "Genesis 1:1 In the beginning..."
      /^([A-Za-z0-9\s]+?)\s+(\d+):(\d+)\s+(.+)$/,
      // With book numbers: "1 John 3:16 For God so loved..."
      /^(\d+\s+[A-Za-z]+)\s+(\d+):(\d+)\s+(.+)$/,
      // Alternative format with periods: "Gen. 1:1 In the beginning..."
      /^([A-Za-z0-9\s\.]+?)\s+(\d+):(\d+)\s+(.+)$/
    ];

    for (const pattern of patterns) {
      const match = cleanLine.match(pattern);
      if (match) {
        const [, book, chapter, verse, text] = match;
        const normalizedBook = this.normalizeBookName(book.trim());
        
        return {
          book: normalizedBook,
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          text: text.trim()
        };
      }
    }

    // Try to handle lines that might be continuation of previous verses
    // or have different formatting from the NASB file
    return null;
  }

  private normalizeBookName(book: string): string {
    // Remove periods and normalize spacing
    const cleaned = book.replace(/\./g, '').trim();
    
    const bookMap: Record<string, string> = {
      'Gen': 'Genesis',
      'Genesis': 'Genesis',
      'Ex': 'Exodus',
      'Exodus': 'Exodus',
      'Lev': 'Leviticus',
      'Leviticus': 'Leviticus',
      'Num': 'Numbers',
      'Numbers': 'Numbers',
      'Deut': 'Deuteronomy',
      'Deuteronomy': 'Deuteronomy',
      'Josh': 'Joshua',
      'Joshua': 'Joshua',
      'Judg': 'Judges',
      'Judges': 'Judges',
      'Ruth': 'Ruth',
      '1 Sam': '1 Samuel',
      '1 Samuel': '1 Samuel',
      '2 Sam': '2 Samuel',
      '2 Samuel': '2 Samuel',
      '1 Ki': '1 Kings',
      '1 Kings': '1 Kings',
      '2 Ki': '2 Kings',
      '2 Kings': '2 Kings',
      '1 Chr': '1 Chronicles',
      '1 Chronicles': '1 Chronicles',
      '2 Chr': '2 Chronicles',
      '2 Chronicles': '2 Chronicles',
      'Ezra': 'Ezra',
      'Neh': 'Nehemiah',
      'Nehemiah': 'Nehemiah',
      'Est': 'Esther',
      'Esther': 'Esther',
      'Job': 'Job',
      'Ps': 'Psalms',
      'Psalm': 'Psalms',
      'Psalms': 'Psalms',
      'Prov': 'Proverbs',
      'Proverbs': 'Proverbs',
      'Ecc': 'Ecclesiastes',
      'Ecclesiastes': 'Ecclesiastes',
      'Song': 'Song of Songs',
      'Song of Songs': 'Song of Songs',
      'Is': 'Isaiah',
      'Isa': 'Isaiah',
      'Isaiah': 'Isaiah',
      'Jer': 'Jeremiah',
      'Jeremiah': 'Jeremiah',
      'Lam': 'Lamentations',
      'Lamentations': 'Lamentations',
      'Ezek': 'Ezekiel',
      'Ezekiel': 'Ezekiel',
      'Dan': 'Daniel',
      'Daniel': 'Daniel',
      'Hos': 'Hosea',
      'Hosea': 'Hosea',
      'Joel': 'Joel',
      'Amos': 'Amos',
      'Obad': 'Obadiah',
      'Obadiah': 'Obadiah',
      'Jon': 'Jonah',
      'Jonah': 'Jonah',
      'Mic': 'Micah',
      'Micah': 'Micah',
      'Nah': 'Nahum',
      'Nahum': 'Nahum',
      'Hab': 'Habakkuk',
      'Habakkuk': 'Habakkuk',
      'Zeph': 'Zephaniah',
      'Zephaniah': 'Zephaniah',
      'Hag': 'Haggai',
      'Haggai': 'Haggai',
      'Zech': 'Zechariah',
      'Zechariah': 'Zechariah',
      'Mal': 'Malachi',
      'Malachi': 'Malachi',
      'Mt': 'Matthew',
      'Matt': 'Matthew',
      'Matthew': 'Matthew',
      'Mk': 'Mark',
      'Mark': 'Mark',
      'Lk': 'Luke',
      'Luke': 'Luke',
      'Jn': 'John',
      'John': 'John',
      'Acts': 'Acts',
      'Rom': 'Romans',
      'Romans': 'Romans',
      '1 Cor': '1 Corinthians',
      '1 Corinthians': '1 Corinthians',
      '2 Cor': '2 Corinthians',
      '2 Corinthians': '2 Corinthians',
      'Gal': 'Galatians',
      'Galatians': 'Galatians',
      'Eph': 'Ephesians',
      'Ephesians': 'Ephesians',
      'Phil': 'Philippians',
      'Philippians': 'Philippians',
      'Col': 'Colossians',
      'Colossians': 'Colossians',
      '1 Th': '1 Thessalonians',
      '1 Thess': '1 Thessalonians',
      '1 Thessalonians': '1 Thessalonians',
      '2 Th': '2 Thessalonians',
      '2 Thess': '2 Thessalonians',
      '2 Thessalonians': '2 Thessalonians',
      '1 Tim': '1 Timothy',
      '1 Timothy': '1 Timothy',
      '2 Tim': '2 Timothy',
      '2 Timothy': '2 Timothy',
      'Tit': 'Titus',
      'Titus': 'Titus',
      'Philem': 'Philemon',
      'Philemon': 'Philemon',
      'Heb': 'Hebrews',
      'Hebrews': 'Hebrews',
      'Jas': 'James',
      'James': 'James',
      '1 Pet': '1 Peter',
      '1 Peter': '1 Peter',
      '2 Pet': '2 Peter',
      '2 Peter': '2 Peter',
      '1 Jn': '1 John',
      '1 John': '1 John',
      '2 Jn': '2 John',
      '2 John': '2 John',
      '3 Jn': '3 John',
      '3 John': '3 John',
      'Jude': 'Jude',
      'Rev': 'Revelation',
      'Revelation': 'Revelation'
    };

    return bookMap[cleaned] || cleaned;
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

export const nasbBibleService = new NASBBibleService();