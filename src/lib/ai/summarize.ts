/**
 * AI-ready reflection summarization layer.
 *
 * The app depends only on the `Summarizer` interface. The default
 * implementation runs fully on-device (no reflection text ever leaves the
 * browser). A model-backed implementation can be dropped in by implementing
 * `Summarizer` (e.g. calling a server action) and returning it from
 * `getSummarizer()` — UI and storage stay unchanged.
 */
import { LIFE_SPHERES, type SphereId } from "@/lib/data/spheres";

export type Mood = "tender" | "steady" | "bright";

export interface ReflectionSummary {
  headline: string;
  themes: SphereId[];
  mood: Mood;
  keyPhrase?: string;
  wordCount: number;
  generatedBy: string;
  createdAt: string;
}

export interface ReflectionInput {
  month: number;
  monthTitle: string;
  items: { prompt: string; answer: string; kind: "text" | "scale" }[];
  focusSpheres: SphereId[];
}

export interface Summarizer {
  readonly id: string;
  summarize(input: ReflectionInput): Promise<ReflectionSummary>;
}

const LEXICON: Record<SphereId, string[]> = {
  health: ["sleep", "body", "run", "walk", "gym", "exercise", "eat", "food", "energy", "tired", "health", "yoga", "rest", "water"],
  mind: ["anxious", "anxiety", "calm", "stress", "mind", "feel", "emotion", "therapy", "meditat", "breath", "overwhelm", "peace"],
  relationships: ["friend", "friends", "social", "people", "community", "together", "call"],
  family: ["mom", "dad", "mother", "father", "parent", "sister", "brother", "family", "kids", "child", "son", "daughter"],
  love: ["partner", "love", "date", "romance", "husband", "wife", "boyfriend", "girlfriend", "intimacy"],
  career: ["work", "job", "career", "boss", "project", "team", "promotion", "craft", "client", "business"],
  finances: ["money", "save", "saving", "budget", "debt", "invest", "salary", "spend", "finance"],
  growth: ["learn", "read", "book", "course", "study", "skill", "grow", "class", "language"],
  fun: ["play", "fun", "travel", "hobby", "music", "paint", "game", "adventure", "dance", "laugh", "joy"],
  home: ["home", "house", "room", "garden", "space", "clean", "declutter", "nature", "plants"],
  community: ["volunteer", "help", "give", "contribut", "neighbo", "donate", "mentor"],
  purpose: ["purpose", "meaning", "values", "faith", "spirit", "soul", "pray", "gratitude", "grateful", "why"],
};

const BRIGHT = ["happy", "proud", "excited", "grateful", "joy", "hope", "love", "calm", "peace", "light", "better", "free", "strong"];
const TENDER = ["tired", "sad", "anxious", "afraid", "fear", "lonely", "lost", "stuck", "overwhelm", "hard", "difficult", "hurt", "worried"];

function countMatches(text: string, words: string[]) {
  return words.reduce((n, w) => n + (text.match(new RegExp(`\\b${w}`, "g"))?.length ?? 0), 0);
}

export const localSummarizer: Summarizer = {
  id: "local-heuristic-v1",
  async summarize(input) {
    const textAnswers = input.items.filter((i) => i.kind === "text").map((i) => i.answer.trim()).filter(Boolean);
    const scaleValues = input.items
      .filter((i) => i.kind === "scale")
      .map((i) => Number(i.answer))
      .filter((n) => Number.isFinite(n) && n > 0);
    const corpus = textAnswers.join(" ").toLowerCase();
    const wordCount = corpus.split(/\s+/).filter(Boolean).length;

    const scored = LIFE_SPHERES.map((s) => ({ id: s.id, score: countMatches(corpus, LEXICON[s.id]) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
    const themes = (scored.length ? scored.map((s) => s.id) : input.focusSpheres).slice(0, 3);

    const tone = countMatches(corpus, BRIGHT) - countMatches(corpus, TENDER);
    const avgScale = scaleValues.length ? scaleValues.reduce((a, b) => a + b, 0) / scaleValues.length : 5.5;
    const signal = tone + (avgScale - 5.5) / 2;
    const mood: Mood = signal >= 1 ? "bright" : signal <= -1 ? "tender" : "steady";

    const sentences = textAnswers.flatMap((a) => a.split(/(?<=[.!?])\s+/)).map((s) => s.trim()).filter((s) => s.length > 12);
    const keyPhrase = sentences.sort((a, b) => Math.abs(a.length - 70) - Math.abs(b.length - 70))[0]?.slice(0, 140);

    const themeNames = themes.map((t) => LIFE_SPHERES.find((s) => s.id === t)!.name.toLowerCase());
    const moodLine: Record<Mood, string> = {
      bright: "There's a warm, hopeful light in your words",
      steady: "Your words feel grounded and honest",
      tender: "Your words hold something tender — be gentle with yourself",
    };
    const headline = themeNames.length
      ? `${moodLine[mood]}, circling around ${themeNames.join(", ").replace(/, ([^,]*)$/, " and $1")}.`
      : `${moodLine[mood]}.`;

    return {
      headline,
      themes,
      mood,
      keyPhrase,
      wordCount,
      generatedBy: this.id,
      createdAt: new Date().toISOString(),
    };
  },
};

export function getSummarizer(): Summarizer {
  return localSummarizer;
}
