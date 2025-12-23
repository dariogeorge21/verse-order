Below is a **single, clean, production-ready BUILD PROMPT** you can directly give to an AI coding assistant (or reuse yourself) to generate the **entire game** exactly as you described.

No explanations, no theory — just the **one prompt that builds everything**.

---

## 🎮 BUILD PROMPT — *Verse Order* (Church Event Game)

**Goal**
Build a complete, polished Bible puzzle game called **“Verse Order”** for a church event using **Next.js (App Router)**, **Tailwind CSS**, and **Supabase** backend.
The game must be fully mouse/touch driven (NO keyboard gameplay), event-ready, visually attractive, and scalable for live leaderboard display.

---

### 🧱 Tech Stack (Strict)

* Next.js (latest, App Router)
* TypeScript
* Tailwind CSS
* Supabase (Auth optional, DB required)
* Zustand or React Context (game + security state)
* No external game engines
* No keyboard input for gameplay

---

## 🧠 Core Game Rules

### Gameplay Structure

* Each player plays **exactly 3 Bible verses**

* Each verse has **30 seconds**

* Total gameplay time: **90 seconds**

* Difficulty progression:

  1. **Easy**
  2. **Medium**
  3. **Hard**

* Verse pool: **15–20 verses**, stored as **objects in the frontend**

* Each verse:

  * Stored with quotation (e.g., `John 1:1`)
  * Fragments are **determined by frontend algorithm** based on word count calculation
  * Broken into **7–8 fragments**
  * Each fragment max **2 words**

---

## 🎯 Level Design

- Choose random verses from the object containing all verses.

### 🟢 Level 1 — Easy

* Timer: 30s
* Full quotation visible (e.g., `John 1:1`)
* Drag & drop OR tap-to-place fragments
* Submit button
* On submit:

  * Correct → **green screen flicker**
  * Incorrect → **red screen flicker**
* Smooth transition to next level

---

### 🟡 Level 2 — Medium

* Timer: 30s
* **Only half quotation visible**

  * Example: `John`
* In last **15 seconds**, full quotation fades in
* Same interaction + evaluation flicker

---

### 🔴 Level 3 — Hard

* Timer: 30s
* **Quotation NOT shown**
* Display **5 random quotations** from verse pool

  * Includes the correct one
  * Example:

    * Isaiah 41:10
    * 1 Corinthians 12:12
    * Romans 16:19
    * Zephaniah 3:17
    * John 1:1
* Player must:

  1. Arrange fragments correctly
  2. Select the correct quotation
* Submit → evaluate both correctness

---

## 🧮 Scoring System (Non-Trivial)

Score must ensure **most players do NOT tie**.

### Factors

* Remaining time per level
* Difficulty multiplier:

  * Easy × 1.0
  * Medium × 1.5
  * Hard × 2.5
* Accuracy bonus
* Speed bonus (non-linear curve)

### Example Formula

```
score += floor(
  (remainingSeconds ^ 1.3) *
  difficultyMultiplier *
  accuracyFactor
)
```

Final score = sum of all 3 levels

---

## 👤 Player Input (NO Keyboard)

* Name → voice input
* Region → **All 28 Indian States**
* On-screen selection only
* Validate before game start

---

## 🔐 Fun Security Feature (Mandatory) - right after input

### Security Code Generation

* Generate **random 6-digit numeric code**
* Display prominently
* Message: **“Remember this code!”**
* Visible for **minimum 5 seconds**
* Animate countdown:
  **5 → 4 → 3 → 2 → 1 → 0**
* Store securely in Zustand / Context

---

## 🔎 Post-Game Verification (`/verify`) - after the game

### Step 1: Code Verification

* Prompt: “Enter your 6-digit security code”
* On-screen **numeric keypad only**
* No native keyboard
* Max **2 attempts**

### Step 2: Punishment (If Failed)

After 2 failed attempts OR clicking **“Forgot Code?”**:

* Show punishment screen:

  * Message: **“Recite 5 Hail Marys to continue”**
  * 5 large checkboxes:

    * Hail Mary 1
    * Hail Mary 2
    * Hail Mary 3
    * Hail Mary 4
    * Hail Mary 5
  * Continue button enabled **only if all checked**

---

## 🏁 Final Screen

* Show:

  * Player Name
  * Region
  * Final Score
  * Breakdown (Easy / Medium / Hard)
* Buttons:

  * **Play Again** → landing page
  * **View Leaderboard** → `/score`
* On navigation away:

  * Fully reset game state
  * Clear stores / contexts

---

## 🏆 Live Leaderboard (`/score`)

* Powered by Supabase
* Live fetch
* Sorted by score (desc)
* Display:

  * Rank
  * Name
  * Region
  * Score
* Manual reset button (admin only)

---

## 🗄 Supabase Requirements

### Primary Purpose
**Supabase is primarily used for the leaderboard functionality.**

### Tables

* `players` - Single table storing both player details and scores:
  * Player details: name, region, security code (optional)
  * Score: final score, score breakdown (Easy/Medium/Hard), timestamp

### Data Storage
* **Verses are stored as objects in the frontend** (not in database)
* **Fragments are calculated dynamically** in the frontend based on word count algorithm
* **Backend only stores**: Player details, security code (optional), and scores for leaderboard

### Migrations
* **Provide Supabase migrations** to create the `players` table with all required columns
* Include proper indexes for leaderboard queries (score, timestamp)

---

## 🎨 UI / UX Requirements

* Church-appropriate aesthetics
* Smooth animations
* Large touch targets
* Clear color feedback (green/red)
* Responsive for phones + tablets
* Projector-friendly leaderboard view

---

## 🚫 Constraints

* No keyboard gameplay
* No dummy data
* No mock backend
* Supabase env keys provided externally
* **Supabase migrations must be provided** (SQL migration files)
* Verses must be stored as frontend objects (not in database)
* Fragment generation must be handled by frontend algorithm

---

## ✅ End Result

A **fully working, production-ready game** built in **Next.js + Tailwind + Supabase**, ready for a church event with:

* 90s gameplay
* 3-level difficulty
* Secure verification
* Fun punishment mechanic
* Live leaderboard
* Clean, joyful UI

---

If you want next:

* DB schema & migrations (single `players` table with all fields)
* Frontend verse data structure & fragment algorithm
* Exact Zustand store design
* UI color + font system
* Deployment checklist for event day

Say the word.
