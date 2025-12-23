export interface Verse {
  id: string;
  text: string;
  reference: string;
  difficulty?: "easy" | "medium" | "hard";
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

