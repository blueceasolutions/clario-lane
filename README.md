# Clariolane

Clariolane is a comprehensive reading improvement platform designed to enhance reading speed, comprehension, and efficiency through scientifically proven techniques.

## Reading Practice Modes

We offer three distinct practice modes, each targeting specific aspects of reading proficiency:

### 1. Speed Reading (RSVP)
*   **Explanation:** Uses **Rapid Serial Visual Presentation** to display words one by one at a fixed location on the screen.
*   **Benefits:**
    *   **Eliminates Sub-vocalization:** The speed forces you to stop "saying" words in your head.
    *   **Reduces Eye Movement:** Since words appear in the same spot, your eyes don't need to move (saccade) across the page, saving time and energy.
    *   **Increases Processing Speed:** Trains your brain to recognize words instantly.
*   **Difficulty:** **High**. It requires intense focus and can be fatiguing initially.

### 2. Comprehension (Scrolling Text)
*   **Explanation:** Text scrolls vertically automatically, similar to a teleprompter or karaoke lyrics, with a focus line or area.
*   **Benefits:**
    *   **Sustained Attention:** Keeps you engaged with a continuous flow of text.
    *   **Smooth Tracking:** Trains your eyes to track moving text smoothly without backtracking (regression).
    *   **Natural Flow:** Provides a more natural reading experience than RSVP while still guiding your pace.
*   **Difficulty:** **Low/Medium**. It's easier to follow and allows for some context retention, making it great for longer passages.

### 3. Word Chunking
*   **Explanation:** Flashes groups of words (chunks) at a time, with the center word highlighted as a focal point.
*   **Benefits:**
    *   **Expands Peripheral Vision:** Encourages you to focus on the center word while reading the surrounding words with your peripheral vision.
    *   **Increases Fixation Capacity:** Trains you to process multiple words in a single glance (fixation), reducing the total number of eye stops needed per line.
    *   **Reduces Eye Strain:** Less eye movement is required compared to standard reading.
*   **Difficulty:** **Medium/High**. It requires training to effectively process multiple words at once without moving your eyes to each individual word.

## Implementation Walkthrough

### Word Chunking Reader - Flash Behavior

Successfully implemented word chunking reader that **flashes complete chunks** of words (like RSVP but with N words).

#### How It Works

**Flash Pattern:**
1. Display chunk of N words (based on chunk size slider)
2. Middle word highlighted in `text-primary` 
3. Other words in normal `text-foreground`
4. After duration, flash next chunk
5. Repeat until passage complete

**Timing:**
- Time per chunk = `(60 / WPM) * chunkSize`
- Example: 200 WPM, 3 words = 900ms per chunk
- Chunk size affects total time proportionally

#### Key Changes

**[useWordChunkingReader.ts](src/components/exercises/wordchunking/useWordChunkingReader.ts)**
- Progression: `currentIndex + chunkSize` (was +1)
- Timing: `msPerWord * chunkSize` (chunk duration)
- Reads `chunkSize` from store

**[WordChunkDisplay.tsx](src/components/exercises/wordchunking/WordChunkDisplay.tsx)**
- Shows: `words[currentIndex...currentIndex+chunkSize]`
- Highlights: Middle word (index = `Math.floor(chunkSize/2)`)
- Other words: Normal color (not muted)

### Complete System

| Practice Type | Display Pattern | Progression |
|--------------|----------------|-------------|
| Speed Reading | 1 word RSVP | +1 word |
| Comprehension | Scrolling text | Continuous |
| Word Chunking | N-word flash | +N words |

### Zero Prop Drilling
All components consume from `usePracticeStore` - no props passed between components.
