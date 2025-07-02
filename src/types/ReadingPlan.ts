export interface Passage {
  book: string;
  chapter: number;
  verses: string;
}

export interface DailyReading {
  day: number;
  date: string;
  passages: Passage[];
  theme: string;
}

export interface ReadingPlan {
  name: string;
  days: DailyReading[];
}