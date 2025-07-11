import { ReadingPlan, DailyReading } from '../types/ReadingPlan';
import { format, addDays } from 'date-fns';

export function generateFullYearPlan(): ReadingPlan {
  const days: DailyReading[] = [];
  const startDate = new Date(2025, 0, 1); // January 1, 2025

  // Sample reading plan with 365 days
  for (let dayNumber = 1; dayNumber <= 365; dayNumber++) {
    const currentDate = addDays(startDate, dayNumber - 1);
    const formattedDate = format(currentDate, 'MMMM d, yyyy');

    // Create a basic reading plan with rotating themes and passages
    const themes = [
      'God\'s Love and Grace',
      'Faith and Trust',
      'Prayer and Worship',
      'Service and Compassion',
      'Wisdom and Understanding',
      'Hope and Perseverance',
      'Forgiveness and Redemption',
      'Community and Fellowship',
      'Spiritual Growth',
      'God\'s Faithfulness'
    ];

    const samplePassages = [
      { book: 'Genesis', chapter: 1, verses: '1-31' },
      { book: 'Psalms', chapter: 23, verses: '1-6' },
      { book: 'John', chapter: 3, verses: '16-21' },
      { book: 'Romans', chapter: 8, verses: '28-39' },
      { book: 'Ephesians', chapter: 2, verses: '8-10' },
      { book: 'Philippians', chapter: 4, verses: '13-19' },
      { book: 'Matthew', chapter: 5, verses: '1-12' },
      { book: 'Proverbs', chapter: 3, verses: '5-6' },
      { book: '1 Corinthians', chapter: 13, verses: '1-13' },
      { book: 'Isaiah', chapter: 40, verses: '28-31' }
    ];

    const themeIndex = (dayNumber - 1) % themes.length;
    const passageIndex = (dayNumber - 1) % samplePassages.length;

    days.push({
      day: dayNumber,
      date: formattedDate,
      passages: [samplePassages[passageIndex]],
      theme: themes[themeIndex]
    });
  }

  return {
    name: 'Life Journal Daily Devotions - 2025',
    days
  };
}