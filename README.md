# Truth or Myth (حقيقة أم خرافة)

An interactive web-based flashcard game built for the Mental Health Forum (*لكل صوت أثر*). Players classify common statements about mental health into **Facts** (حقيقة) or **Myths** (خرافة) using drag-and-drop, followed by a scored results screen with verified medical explanations and sources.

## Features

- **Flashcard Deck**: Cards appear stacked one after another. Dragging the top card reveals the next one queued behind it.
- **Flexible Drag & Drop**: Powered by `@dnd-kit`. Supports dragging from deck to piles, moving cards between Fact and Myth piles, or returning a card back to the deck for reclassification.
- **Randomized Questions**: Statements are shuffled on every game start so each playthrough has a fresh order.
- **Medical Sources & Explanations**: 15 authentic statements backed by citations from the WHO, APA, NIMH, Mayo Clinic, Harvard Medical School, and Yale University.
- **Live Timer & Submission Guard**: Tracks completion time and warns players if they try to turn in before categorizing all cards.
- **Database Ready**: Built-in support for saving player names, scores, and completion times to Supabase.

## Tech Stack

- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **@dnd-kit** (`@dnd-kit/core`)
- **Supabase** (`@supabase/supabase-js`)
- **Typography**: 29LT Azer Bold (Arabic font)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ITSM4Z/Truth-Or-Myth.git
   cd truth-or-myth
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## Supabase Setup (Optional)

If you want to save scores to a database, create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Then in `src/Postgame.jsx`, uncomment the `supabase` import and the insert call inside `saveScore()`.

If you don't configure Supabase, the game still runs completely fine client-side without errors.

## Scripts

- `npm run dev` - Start local development server with hot reload
- `npm run build` - Build production bundle in `dist/`
- `npm run preview` - Locally preview the production build
- `npm run lint` - Run ESLint checks

## Credits

Created for the **Mental Health Forum (لكل صوت أثر)** in collaboration with:
- Umm Al-Qura University Student Clubs (Engineering Club, Computer Club, Translation Club)
- Tuwaiq Club
