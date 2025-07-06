/**
 * Bible Data Loader
 * 
 * This service handles loading Bible data from various sources.
 * Due to copyright restrictions, we provide multiple loading strategies.
 */

export class BibleDataLoader {
  private static instance: BibleDataLoader;
  private loadingPromise: Promise<string> | null = null;

  static getInstance(): BibleDataLoader {
    if (!BibleDataLoader.instance) {
      BibleDataLoader.instance = new BibleDataLoader();
    }
    return BibleDataLoader.instance;
  }

  async loadBibleData(): Promise<string> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.attemptDataLoad();
    return this.loadingPromise;
  }

  private async attemptDataLoad(): Promise<string> {
    // Strategy 1: Try to load from local file (if user has downloaded it)
    try {
      const localData = await this.loadFromLocal();
      if (localData) {
        console.log('Loaded Bible data from local file');
        return localData;
      }
    } catch (error) {
      console.log('Local file not available, trying other sources...');
    }

    // Strategy 2: Try to load from a CORS-enabled proxy
    try {
      const proxyData = await this.loadFromProxy();
      if (proxyData) {
        console.log('Loaded Bible data from proxy');
        return proxyData;
      }
    } catch (error) {
      console.log('Proxy not available, using fallback data...');
    }

    // Strategy 3: Use built-in sample data
    console.log('Using built-in sample Bible data');
    return this.getFallbackData();
  }

  private async loadFromLocal(): Promise<string | null> {
    try {
      // Try to load from public folder
      const response = await fetch('/bible-data.txt');
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      // File doesn't exist
    }
    return null;
  }

  private async loadFromProxy(): Promise<string | null> {
    try {
      // You could set up a simple proxy server or use a CORS proxy service
      // For security reasons, we'll skip this in the demo
      const proxyUrl = 'https://api.allorigins.win/get?url=' + 
        encodeURIComponent('https://archive.org/download/nasb-new-american-standard-bible-nasb/NASB%20New%20American%20Standard%20Bible%20%28NASB%29_djvu.txt');
      
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const data = await response.json();
        return data.contents;
      }
    } catch (error) {
      console.error('Proxy load failed:', error);
    }
    return null;
  }

  private getFallbackData(): string {
    // Comprehensive fallback data with key passages
    return `
Genesis 1:1 In the beginning God created the heavens and the earth.
Genesis 1:2 The earth was formless and void, and darkness was over the surface of the deep, and the Spirit of God was moving over the surface of the waters.
Genesis 1:3 Then God said, "Let there be light"; and there was light.
Genesis 1:26 Then God said, "Let Us make man in Our image, according to Our likeness; and let them rule over the fish of the sea and over the birds of the sky and over the cattle and over all the earth, and over every creeping thing that creeps on the earth."
Genesis 1:27 God created man in His own image, in the image of God He created him; male and female He created them.

Exodus 20:3 You shall have no other gods before Me.
Exodus 20:4 You shall not make for yourself an idol, or any likeness of what is in heaven above or on the earth beneath or in the water under the earth.
Exodus 20:7 You shall not take the name of the LORD your God in vain, for the LORD will not leave him unpunished who takes His name in vain.
Exodus 20:8 Remember the sabbath day, to keep it holy.
Exodus 20:12 Honor your father and your mother, that your days may be prolonged in the land which the LORD your God gives you.
Exodus 20:13 You shall not murder.
Exodus 20:14 You shall not commit adultery.
Exodus 20:15 You shall not steal.
Exodus 20:16 You shall not bear false witness against your neighbor.
Exodus 20:17 You shall not covet your neighbor's house, your neighbor's wife or his male servant, or his female servant, or his ox, or his donkey, or anything that belongs to your neighbor.

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

Jeremiah 29:11 For I know the plans that I have for you,' declares the LORD, 'plans for welfare and not for calamity to give you a future and a hope.

Matthew 5:3 Blessed are the poor in spirit, for theirs is the kingdom of heaven.
Matthew 5:4 Blessed are those who mourn, for they shall be comforted.
Matthew 5:5 Blessed are the gentle, for they shall inherit the earth.
Matthew 5:6 Blessed are those who hunger and thirst for righteousness, for they shall be satisfied.
Matthew 5:7 Blessed are the merciful, for they shall receive mercy.
Matthew 5:8 Blessed are the pure in heart, for they shall see God.
Matthew 5:9 Blessed are the peacemakers, for they shall be called sons of God.

Matthew 6:9 Pray, then, in this way: 'Our Father who is in heaven, Hallowed be Your name.
Matthew 6:10 Your kingdom come. Your will be done, On earth as it is in heaven.
Matthew 6:11 Give us this day our daily bread.
Matthew 6:12 And forgive us our debts, as we also have forgiven our debtors.
Matthew 6:13 And do not lead us into temptation, but deliver us from evil. For Yours is the kingdom and the power and the glory forever. Amen.'

Matthew 28:19 Go therefore and make disciples of all the nations, baptizing them in the name of the Father and the Son and the Holy Spirit,
Matthew 28:20 teaching them to observe all that I commanded you; and lo, I am with you always, even to the end of the age.

John 1:1 In the beginning was the Word, and the Word was with God, and the Word was God.
John 1:14 And the Word became flesh, and dwelt among us, and we saw His glory, glory as of the only begotten from the Father, full of grace and truth.

John 3:16 For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life.
John 3:17 For God did not send the Son into the world to judge the world, but that the world might be saved through Him.

John 14:6 Jesus said to him, "I am the way, and the truth, and the life; no one comes to the Father but through Me."

Romans 3:23 for all have sinned and fall short of the glory of God,
Romans 6:23 For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.
Romans 8:28 And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.
Romans 10:9 that if you confess with your mouth Jesus as Lord, and believe in your heart that God raised Him from the dead, you will be saved;
Romans 10:10 for with the heart a person believes, resulting in righteousness, and with the mouth he confesses, resulting in salvation.

1 Corinthians 13:4 Love is patient, love is kind and is not jealous; love does not brag and is not arrogant,
1 Corinthians 13:5 does not act unbecomingly; it does not seek its own, is not provoked, does not take into account a wrong suffered,
1 Corinthians 13:6 does not rejoice in unrighteousness, but rejoices with the truth;
1 Corinthians 13:7 bears all things, believes all things, hopes all things, endures all things.
1 Corinthians 13:8 Love never fails; but if there are gifts of prophecy, they will be done away; if there are tongues, they will cease; if there is knowledge, it will be done away.

Ephesians 2:8 For by grace you have been saved through faith; and that not of yourselves, it is the gift of God;
Ephesians 2:9 not as a result of works, so that no one may boast.

Philippians 4:13 I can do all things through Him who strengthens me.
Philippians 4:19 And my God will supply all your needs according to His riches in glory in Christ Jesus.

2 Timothy 3:16 All Scripture is inspired by God and profitable for teaching, for reproof, for correction, for training in righteousness;
2 Timothy 3:17 so that the man of God may be adequate, equipped for every good work.

Hebrews 11:1 Now faith is the assurance of things hoped for, the conviction of things not seen.

James 1:17 Every good thing given and every perfect gift is from above, coming down from the Father of lights, with whom there is no variation or shifting shadow.

1 Peter 5:7 casting all your anxiety on Him, because He cares for you.

1 John 1:9 If we confess our sins, He is faithful and righteous to forgive us our sins and to cleanse us from all unrighteousness.

Revelation 3:20 Behold, I stand at the door and knock; if anyone hears My voice and opens the door, I will come in to him and will dine with him, and he with Me.
`;
  }
}