export interface LanguageData {
  learning_language: string;
  from_language: string;
  points: number;
  skills_learned: number;
  total_lessons: number;
  days_active: number;
  last_active: string;
  prior_proficiency: number;
}

export interface TestData {
  "Test Datetime": string;
  "Test Status": string;
  "Score": string | number;
  "Test Type": string;
}

export interface ClassLogData {
  classroom_id: number;
  event_type: string;
  event_time: string;
}

export interface LeaderboardData {
  leaderboard: string;
  timestamp: string;
  tier: number;
  score: number;
}

export interface InventoryData {
  item_type: string;
  purchase_datetime: string;
  active: boolean;
  price_in_virtual_currency?: number;
}

export interface SummaryStats {
  totalXP: number;
  totalLessons: number;
  daysActive: number;
  currentTier: string;
  bestScore: number;
  lastActive: string;
  completionRate: number;
  totalTests: number;
  streakFreezesUsed: number;
  learningLang: string;
  baseLang: string;
  skillsLearned: number;
  priorProficiency: number;
  maxStreak?: number;
  englishScore?: number;
  studyMinutes2025?: number;
  studyMinutes2026?: number;
  studyMinutes2024?: number;
  studyMinutes2023?: number;
  studyMinutes2022?: number;
  studyMinutes2021?: number;
  xpPerYear?: Record<string, number>;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: "academic" | "competitive" | "milestone";
  icon?: string;
}
