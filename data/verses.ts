export type DifficultyType = "intro" | "mcq" | "easy" | "medium" | "hard";

export interface Verse {
  id: string;
  text: string;
  reference: string;
  difficulty?: DifficultyType;
}

// Data for Level 1 (Complete-the-verse): Shows verse with last 3 fragments missing
export interface IncompleteVerse {
  id: string;
  visibleText: string;       // The visible portion of the verse
  missingFragments: string[]; // The 3 fragments to arrange (in correct order)
  fullText: string;          // Complete verse text
  reference: string;
}

// Data for Level 2 (Multiple Choice): Complete the quotation
export interface MCQVerse {
  id: string;
  incompleteText: string;     // The verse with ending removed
  correctEnding: string;      // The correct completion
  wrongOptions: string[];     // 3 wrong options
  fullText: string;           // Complete verse text
  reference: string;
}

export const VERSES: Verse[] = [
  {
    id: "1",
    text: "For God so loved the world that he gave his one and only Son, that who believes in him may not perish but have eternal life.",
    reference: "John 3:16",
    difficulty: "easy",
  },
  {
    id: "2",
    text: "I can do all things through him who strengthens me.",
    reference: "Philippians 4:13",
    difficulty: "easy",
  },
  {
    id: "3",
    text: "Trust in the Lord with all your heart and do not rely on your own insight .",
    reference: "Proverbs 3:5",
    difficulty: "easy",
  },
  {
    id: "4",
    text: "The Lord is my shepherd, I shall not want.",
    reference: "Psalm 23:1",
    difficulty: "easy",
  },
  {
    id: "5",
    text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
    reference: "Psalm 46:10",
    difficulty: "medium",
  },
  {
    id: "6",
    text: "For surely I know the plans I have for you, says the Lord, plans for welfare and not to harm ,  to give your future with hope.",
    reference: "Jeremiah 29:11",
    difficulty: "medium",
  },
  {
    id: "7",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    reference: "Romans 8:28",
    difficulty: "medium",
  },
  {
    id: "8",
    text: "Do not worry about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
    reference: "Philippians 4:6",
    difficulty: "medium",
  },
  {
    id: "9",
    text: "The Lord will fight for you; you need only to be still.",
    reference: "Exodus 14:14",
    difficulty: "medium",
  },
  {
    id: "10",
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7",
    difficulty: "medium",
  },
  {
    id: "11",
    text: "but those who wait for the LORD shall renew their strength, they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.",
    reference: "Isaiah 40:31",
    difficulty: "hard",
  },
  {
    id: "12",
    text: "Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my victorious right hand.",
    reference: "Isaiah 41:10",
    difficulty: "hard",
  },
  {
    id: "13",
    text: "For God has not given us a spirit of cowardice,but rather a spirit of power and love and self-control.",
    reference: "2 Timothy 1:7",
    difficulty: "hard",
  },
  {
    id: "14",
    text: "The Lord your God is in your midst, the  Warrior who gives victory,he will rejoice over with you with gladness,he will renew you in his love,he will exult over you with loud singing.",
    reference: "Zephaniah 3:17",
    difficulty: "hard",
  },
  {
    id: "15",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    reference: "John 1:1",
    difficulty: "hard",
  },
  {
    id: "16",
    text: "Love is patient, love is kind. love does not envy, love does not boast, it is not arrogant.",
    reference: "1 Corinthians 13:4",
    difficulty: "medium",
  },
  {
    id: "17",
    text: "Jesus answered, I am the way and the truth and the life. No one comes to the Father except through me.",
    reference: "John 14:6",
    difficulty: "hard",
  },
  {
    id: "18",
    text: "Come to me, all you who are weary and are carrying heavy burdens, and I will give you rest.",
    reference: "Matthew 11:28",
    difficulty: "medium",
  },
  {
    id: "19",
    text: "The Lord is near to the brokenhearted and saves the crushed in spirit.",
    reference: "Psalm 34:18",
    difficulty: "medium",
  },
  {
    id: "20",
    text: "For where two or three gather in my name, there am I with them.",
    reference: "Matthew 18:20",
    difficulty: "easy",
  },
];

export function getVersesByDifficulty(difficulty: "easy" | "medium" | "hard"): Verse[] {
  return VERSES.filter((v) => v.difficulty === difficulty);
}

export function getRandomVerse(difficulty: "easy" | "medium" | "hard"): Verse {
  const verses = getVersesByDifficulty(difficulty);
  return verses[Math.floor(Math.random() * verses.length)];
}

export function getRandomVerses(count: number, excludeIds: string[] = []): Verse[] {
  const available = VERSES.filter((v) => !excludeIds.includes(v.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ==========================================
// LEVEL 1: Complete-the-verse Data
// Display verse with last 3 fragments missing
// ==========================================
export const INCOMPLETE_VERSES: IncompleteVerse[] = [
  {
    id: "intro-1",
    visibleText: "For God so loved the world that he gave his one and only Son, that who believes in him",
    missingFragments: ["may not", "perish but", "have eternal life."],
    fullText: "For God so loved the world that he gave his one and only Son, that who believes in him may not perish but have eternal life.",
    reference: "John 3:16",
  },
  {
    id: "intro-2",
    visibleText: "I can do all things",
    missingFragments: ["through him", "who strengthens", "me."],
    fullText: "I can do all things through him who strengthens me.",
    reference: "Philippians 4:13",
  },
  {
    id: "intro-3",
    visibleText: "Trust in the Lord with all your heart",
    missingFragments: ["and do not", "rely on", "your own insight."],
    fullText: "Trust in the Lord with all your heart and do not rely on your own insight.",
    reference: "Proverbs 3:5",
  },
  {
    id: "intro-4",
    visibleText: "The Lord is my shepherd,",
    missingFragments: ["I shall", "not", "want."],
    fullText: "The Lord is my shepherd, I shall not want.",
    reference: "Psalm 23:1",
  },
  {
    id: "intro-5",
    visibleText: "For where two or three gather in my name,",
    missingFragments: ["there am", "I with", "them."],
    fullText: "For where two or three gather in my name, there am I with them.",
    reference: "Matthew 18:20",
  },
];

export function getRandomIncompleteVerse(): IncompleteVerse {
  return INCOMPLETE_VERSES[Math.floor(Math.random() * INCOMPLETE_VERSES.length)];
}

// ==========================================
// LEVEL 2: Multiple Choice Quotation Data
// Complete the quotation with correct option
// ==========================================
export const MCQ_VERSES: MCQVerse[] = [
  {
    id: "mcq-1",
    incompleteText: "The Lord will fight for you;",
    correctEnding: "you need only to be still.",
    wrongOptions: [
      "you must stand firm in faith.",
      "you shall overcome all fears.",
      "you must trust His timing.",
    ],
    fullText: "The Lord will fight for you; you need only to be still.",
    reference: "Exodus 14:14",
  },
  {
    id: "mcq-2",
    incompleteText: "Cast all your anxiety on him",
    correctEnding: "because he cares for you.",
    wrongOptions: [
      "because he is always listening.",
      "for he knows your heart.",
      "and he will make a way.",
    ],
    fullText: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7",
  },
  {
    id: "mcq-3",
    incompleteText: "Come to me, all you who are weary and are carrying heavy burdens,",
    correctEnding: "and I will give you rest.",
    wrongOptions: [
      "and I will give you strength.",
      "for I am your shepherd.",
      "and you shall find peace.",
    ],
    fullText: "Come to me, all you who are weary and are carrying heavy burdens, and I will give you rest.",
    reference: "Matthew 11:28",
  },
  {
    id: "mcq-4",
    incompleteText: "The Lord is near to the brokenhearted",
    correctEnding: "and saves the crushed in spirit.",
    wrongOptions: [
      "and heals those who mourn.",
      "and comforts all who grieve.",
      "and restores the weary soul.",
    ],
    fullText: "The Lord is near to the brokenhearted and saves the crushed in spirit.",
    reference: "Psalm 34:18",
  },
  {
    id: "mcq-5",
    incompleteText: "In the beginning was the Word, and the Word was with God,",
    correctEnding: "and the Word was God.",
    wrongOptions: [
      "and the Word created all things.",
      "and the Word brought light.",
      "and the Word is life eternal.",
    ],
    fullText: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    reference: "John 1:1",
  },
];

export function getRandomMCQVerse(): MCQVerse {
  return MCQ_VERSES[Math.floor(Math.random() * MCQ_VERSES.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
