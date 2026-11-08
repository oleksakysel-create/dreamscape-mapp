import type { ColoringCategory } from "@/lib/coloring/types";

export interface ReflectionTask {
  id: string;
  month: number;
  /** Prompt with optional tokens: {name}, {focus}, {goal}. */
  prompt: string;
  hint: string;
  kind: "text" | "scale";
  sortOrder: number;
}

export interface MonthChapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  /** Suggested action for the month's planner. */
  actionPrompt: string;
  galleryCategories: readonly [ColoringCategory, ColoringCategory];
  /** Gradient endpoints for the chapter card. */
  gradient: readonly [string, string];
  tasks: readonly ReflectionTask[];
}

type TaskSeed = Omit<ReflectionTask, "id" | "month" | "sortOrder">;

function chapter(
  id: number,
  data: Omit<MonthChapter, "id" | "tasks">,
  tasks: TaskSeed[],
): MonthChapter {
  return {
    id,
    ...data,
    tasks: tasks.map((t, i) => ({ ...t, id: `m${id}-q${i + 1}`, month: id, sortOrder: i + 1 })),
  };
}

export const MONTHS: readonly MonthChapter[] = [
  chapter(1, {
    title: "Awakening",
    subtitle: "Notice where you are",
    description: "Every story starts with a gentle look around. No judgement — just noticing.",
    actionPrompt: "Plan one small morning ritual that feels like a fresh start.",
    galleryCategories: ["nature", "cosmos"],
    gradient: ["#FCE3D3", "#F6C6A8"],
  }, [
    { prompt: "{name}, what is quietly asking for your attention right now?", hint: "Let the first answer come, even if it surprises you.", kind: "text" },
    { prompt: "If {focus} felt 10% lighter this month, what would be different?", hint: "Think of one concrete, visible change.", kind: "text" },
    { prompt: "How hopeful do you feel about the year ahead?", hint: "1 is tender, 10 is radiant. Both are welcome.", kind: "scale" },
  ]),
  chapter(2, {
    title: "Roots",
    subtitle: "What holds you steady",
    description: "Before growing up, we grow down. Explore the habits and people that ground you.",
    actionPrompt: "Schedule time with someone or something that grounds you.",
    galleryCategories: ["botanical", "nature"],
    gradient: ["#E4EBD9", "#C7D6B3"],
  }, [
    { prompt: "Which daily habit makes you feel most like yourself?", hint: "Small things count — a walk, a song, a cup of tea.", kind: "text" },
    { prompt: "Who or what helped you get here? What would you thank them for?", hint: "Gratitude is a root system.", kind: "text" },
    { prompt: "How supported do you feel in your goal: “{goal}”?", hint: "Support can be people, tools, or time.", kind: "scale" },
  ]),
  chapter(3, {
    title: "Bloom",
    subtitle: "Let something new open",
    description: "Try one thing you've been curious about. Blooming is allowed to be imperfect.",
    actionPrompt: "Book a first try at something new — a class, a recipe, a route.",
    galleryCategories: ["botanical", "mandala"],
    gradient: ["#FADDE1", "#F4B6C2"],
  }, [
    { prompt: "What have you been curious about but haven't tried yet?", hint: "Name it without needing a plan.", kind: "text" },
    { prompt: "What would you attempt in {focus} if you couldn't get it wrong?", hint: "Imagine the kindest version of yourself cheering you on.", kind: "text" },
  ]),
  chapter(4, {
    title: "Momentum",
    subtitle: "Small steps, steady rhythm",
    description: "Momentum is gentle repetition. Find a rhythm that fits your real life.",
    actionPrompt: "Pick one tiny repeatable action and put the first one on your calendar.",
    galleryCategories: ["geometric", "ocean"],
    gradient: ["#DCEAF2", "#B5D2E3"],
  }, [
    { prompt: "What's the smallest step toward “{goal}” you could take this week?", hint: "Smaller than you think. Then halve it.", kind: "text" },
    { prompt: "When do you naturally have the most energy during the day?", hint: "Plan with your energy, not against it.", kind: "text" },
    { prompt: "How sustainable does your current pace feel?", hint: "1 is exhausting, 10 is effortless.", kind: "scale" },
  ]),
  chapter(5, {
    title: "Connection",
    subtitle: "The threads between us",
    description: "We are shaped by the people we let in. Tend to one relationship with intention.",
    actionPrompt: "Plan a call, letter, or visit with someone you miss.",
    galleryCategories: ["mandala", "botanical"],
    gradient: ["#FBE7C6", "#F5CD8E"],
  }, [
    { prompt: "Who makes you feel most at home? When did you last tell them?", hint: "A sentence is enough.", kind: "text" },
    { prompt: "What kind of friend, partner, or family member do you want to be?", hint: "Describe it in three words.", kind: "text" },
  ]),
  chapter(6, {
    title: "Midpoint",
    subtitle: "Pause and breathe",
    description: "Halfway. Look back with kindness and forward with curiosity. Adjusting is wisdom.",
    actionPrompt: "Block an unhurried hour for a solo check-in date.",
    galleryCategories: ["ocean", "cosmos"],
    gradient: ["#D9F0EC", "#A9DAD1"],
  }, [
    { prompt: "{name}, what are you proud of from the first half of your journey?", hint: "Include the invisible wins.", kind: "text" },
    { prompt: "Is {focus} still the right focus? What would you change?", hint: "Changing direction is not failing. You can update priorities anytime.", kind: "text" },
    { prompt: "How aligned does your life feel with what matters to you?", hint: "Just a snapshot, not a grade.", kind: "scale" },
  ]),
  chapter(7, {
    title: "Courage",
    subtitle: "One brave thing",
    description: "Courage is often quiet. Choose one thing that stretches you, kindly.",
    actionPrompt: "Schedule the brave conversation or step you've been postponing.",
    galleryCategories: ["geometric", "mandala"],
    gradient: ["#F9D8CE", "#EFA48B"],
  }, [
    { prompt: "What fear has been making decisions for you lately?", hint: "Naming it gently shrinks it.", kind: "text" },
    { prompt: "What brave step toward “{goal}” would future-you thank you for?", hint: "It can be small and still be brave.", kind: "text" },
  ]),
  chapter(8, {
    title: "Abundance",
    subtitle: "Notice what is enough",
    description: "Shift from scarcity to sufficiency. Celebrate resources you already have.",
    actionPrompt: "Plan a moment to enjoy something you already own or love.",
    galleryCategories: ["botanical", "nature"],
    gradient: ["#F3EBC8", "#E5D58E"],
  }, [
    { prompt: "What do you already have more of than you realise?", hint: "Time, skills, kindness, people…", kind: "text" },
    { prompt: "What does “enough” look like for you in {focus}?", hint: "Enough is a finish line you get to draw.", kind: "text" },
  ]),
  chapter(9, {
    title: "Harvest",
    subtitle: "Gather what has grown",
    description: "Collect the fruits of your effort — even the unexpected ones.",
    actionPrompt: "Plan a small celebration of something you completed.",
    galleryCategories: ["nature", "geometric"],
    gradient: ["#F6D9B8", "#E8AE72"],
  }, [
    { prompt: "What has grown in you since you began this journey?", hint: "Skills, beliefs, boundaries, friendships.", kind: "text" },
    { prompt: "Which effort toward “{goal}” paid off in a surprising way?", hint: "Not every harvest looks like the seed.", kind: "text" },
    { prompt: "How nourished do you feel by your progress?", hint: "1 is depleted, 10 is full.", kind: "scale" },
  ]),
  chapter(10, {
    title: "Letting Go",
    subtitle: "Make room",
    description: "Release what no longer fits — habits, expectations, or old stories about yourself.",
    actionPrompt: "Plan a gentle clearing: a drawer, a commitment, a calendar block.",
    galleryCategories: ["cosmos", "ocean"],
    gradient: ["#E3DDF0", "#C3B6DD"],
  }, [
    { prompt: "What are you ready to set down, {name}?", hint: "You can always pick it back up later.", kind: "text" },
    { prompt: "Which expectation about {focus} isn't really yours?", hint: "Whose voice is it?", kind: "text" },
  ]),
  chapter(11, {
    title: "Gratitude",
    subtitle: "Thank the path",
    description: "Look back at the road with warmth. Gratitude makes the journey visible.",
    actionPrompt: "Plan to write a thank-you note to someone (or to yourself).",
    galleryCategories: ["mandala", "botanical"],
    gradient: ["#FBE0CF", "#F2BD9C"],
  }, [
    { prompt: "List three moments from this year you'd like to remember forever.", hint: "Tiny moments are often the brightest.", kind: "text" },
    { prompt: "What would you like to thank yourself for?", hint: "Speak to yourself like a dear friend.", kind: "text" },
  ]),
  chapter(12, {
    title: "Homecoming",
    subtitle: "The next chapter",
    description: "You authored a year. Celebrate who you've become and dream the next story.",
    actionPrompt: "Plan a ritual to close this year and open the next.",
    galleryCategories: ["cosmos", "mandala"],
    gradient: ["#DDE5F3", "#AFC0E2"],
  }, [
    { prompt: "{name}, how would you title this chapter of your life?", hint: "A book title, a song, a single word.", kind: "text" },
    { prompt: "What did {focus} teach you this year?", hint: "Lessons can be soft or sharp.", kind: "text" },
    { prompt: "How at peace do you feel with your year?", hint: "Every number is a valid ending.", kind: "scale" },
  ]),
];

export function getMonth(id: number): MonthChapter | undefined {
  return MONTHS.find((m) => m.id === id);
}

export interface PersonalizationContext {
  name: string;
  focus: string;
  goal: string;
}

export function personalizePrompt(prompt: string, ctx: PersonalizationContext): string {
  return prompt
    .replaceAll("{name}", ctx.name || "friend")
    .replaceAll("{focus}", ctx.focus || "your focus area")
    .replaceAll("{goal}", ctx.goal || "your goal");
}
