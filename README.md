# Verse Order - Bible Puzzle Game

A production-ready Bible verse puzzle game designed for live church events. Players arrange scrambled Bible verse fragments in the correct order across three difficulty levels.

## Features

- **3 Progressive Difficulty Levels**: Easy → Medium → Hard
- **30 seconds per level** with visual timer
- **Fragment-based gameplay**: Verses split into 7-8 fragments (max 2 words per fragment)
- **Touch/Mouse-only interaction**: No keyboard input required during gameplay
- **Security code verification**: 6-digit code system with verification screen
- **Live leaderboard**: Real-time Supabase integration with top 3 highlighting
- **Scoring system**: Anti-tie algorithm with per-level breakdown
- **Church-appropriate design**: Soft colors, clean UI, smooth animations

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **Supabase** for leaderboard backend
- **Zustand** for state management
- **Canvas Confetti** for celebratory animations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration file to create the `players` table:

```bash
# Copy the SQL from supabase/migrations/001_create_players_table.sql
# and run it in your Supabase SQL editor
```

3. Get your Supabase URL and anon key from Project Settings → API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Game Flow

1. **Registration**: Player enters name and selects Indian state
2. **Security Code**: 6-digit code displayed with countdown (5 → 4 → 3 → 2 → 1 → GO!)
3. **Level 1 (Easy)**: Full Bible reference visible, arrange fragments
4. **Level 2 (Medium)**: Partial reference (book name only), full reference appears at 15 seconds
5. **Level 3 (Hard)**: No reference initially, select from 5 options + arrange fragments
6. **Verification**: Enter security code using on-screen keypad
7. **Punishment Screen** (if code incorrect): Check 5 Hail Mary boxes
8. **Final Score**: View score breakdown and celebratory animation
9. **Leaderboard**: View top scores with real-time updates

## Scoring Algorithm

The scoring system uses a non-linear time weighting to minimize ties:

```
levelScore = floor(
  (remainingSeconds ^ 1.3) ×
  difficultyMultiplier ×
  accuracyFactor
)

finalScore = sum(easyScore + mediumScore + hardScore)
```

**Difficulty Multipliers:**
- Easy: 1.0×
- Medium: 1.5×
- Hard: 2.5×

## Project Structure

```
verse-order/
├── app/
│   ├── countdown/          # Security code + countdown screen
│   ├── level/[levelNumber]/ # Game levels (1, 2, 3)
│   ├── verify/             # Code verification screen
│   ├── punishment/         # Hail Mary checkboxes
│   ├── final-score/        # Score display + submission
│   ├── score/              # Leaderboard
│   ├── layout.tsx
│   ├── page.tsx            # Registration screen
│   └── globals.css
├── components/
│   ├── FragmentDraggable.tsx
│   └── LevelTimer.tsx
├── data/
│   ├── constants.ts        # Indian states list
│   └── verses.ts           # 20 Bible verses (frontend)
├── lib/
│   └── supabase.ts         # Supabase client
├── store/
│   └── gameStore.ts        # Zustand state management
├── utils/
│   ├── fragmentSplitter.ts # Fragment splitting algorithm
│   └── scoring.ts          # Scoring calculations
└── supabase/
    └── migrations/
        └── 001_create_players_table.sql
```

## Bible Verses

The game includes 20 Bible verses stored as frontend objects in `data/verses.ts`:
- 5 Easy verses
- 8 Medium verses
- 7 Hard verses

Verses are randomly selected per game session. Each verse is dynamically split into 7-8 fragments based on word count.

## Leaderboard Admin

The leaderboard page includes an admin reset button (password: `admin123`). Change this in production by modifying `app/score/page.tsx`.

## Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Vercel, Netlify, or your preferred hosting platform

3. Ensure environment variables are set in your hosting platform

4. Update the admin password in `app/score/page.tsx` for security

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Optimized for touch devices (minimum 44×44px touch targets)

## License

This project is designed for church events and community use.

