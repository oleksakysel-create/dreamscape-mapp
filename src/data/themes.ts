export interface Question {
  id: string
  prompt: string
  hint: string
  kind: 'text' | 'scale'
}

export interface Theme {
  month: number
  title: string
  /** Short line under the title */
  tagline: string
  intro: string
  /** Coloring sheet for the Pause tab */
  art: string
  dream: string
  questions: Question[]
  /** Question whose answer is offered as the first plan step */
  stepQuestion: string
  /** Question whose answer is the dream in the person's own words (shown on the card) */
  dreamQuestion: string
  suggestions: string[]
}

type Q = [prompt: string, hint: string, kind?: 'scale']

function theme(
  month: number,
  t: Omit<Theme, 'month' | 'questions' | 'stepQuestion' | 'dreamQuestion'> & { q: Q[]; step: number; dreamQ: number },
): Theme {
  const questions: Question[] = t.q.map(([prompt, hint, kind], i) => ({ id: `m${month}q${i + 1}`, prompt, hint, kind: kind ?? 'text' }))
  const { q: _q, step, dreamQ, ...rest } = t
  return { month, ...rest, questions, stepQuestion: questions[step]!.id, dreamQuestion: questions[dreamQ]!.id }
}

export const THEMES: Theme[] = [
  theme(1, {
    title: 'Starting point',
    tagline: 'An honest look at your life',
    intro: 'Before changing your life, see it clearly. No judgement — just as it is. And picture the place you want to wake up in a few years from now.',
    art: 'villa',
    dream: 'Dream home',
    q: [
      ['Describe an ordinary weekday. What in it is truly yours, and what is obligation?', 'List it as it is. This isn’t a test.'],
      ['Describe the home you want to live in. The city, the light, the view from the window.', 'The more specific the details, the more real the dream.'],
      ['How close is your life today to the one you want?', '1 — nothing like it, 10 — this is it.', 'scale'],
      ['What is the smallest step that brings you closer to that home this month?', 'It becomes the first item of your plan.'],
    ],
    step: 3,
    dreamQ: 1,
    suggestions: ['Collect references for the dream home', 'Check prices in the area you like', 'Set aside an hour a week to browse listings'],
  }),
  theme(2, {
    title: 'Energy',
    tagline: 'What your strength is made of',
    intro: 'Dreams take energy. Let’s see what fills you up, what quietly drains you — and bring back into your week what actually works.',
    art: 'retreat',
    dream: 'Mountain retreat',
    q: [
      ['When did you last feel truly rested? What made it possible?', 'Place, people, activity — it all counts.'],
      ['What takes the most out of you every week?', 'Tasks, conversations, habits.'],
      ['Your energy level right now', '1 — empty, 10 — full of energy.', 'scale'],
      ['Which one habit are you ready to bring back or start?', 'Realistic, not perfect.'],
    ],
    step: 3,
    dreamQ: 0,
    suggestions: ['Book a weekend without your phone', 'Two 40-minute walks this week', 'In bed before 11 pm three nights'],
  }),
  theme(3, {
    title: 'Money & freedom',
    tagline: 'Money as a tool, not a worry',
    intro: 'Freedom starts with a calm relationship with money. Let’s work out what your dream costs and how to move toward it without sacrifice.',
    art: 'watch',
    dream: 'Dream watch',
    q: [
      ['What does financial freedom mean to you — in numbers or in feelings?', 'For example: “not checking the price of dinner”, or an exact amount.'],
      ['What do you spend money on that brings you no joy?', 'Subscriptions, impulse buys, “that’s what people do”.'],
      ['How calm do you feel about money?', '1 — constant worry, 10 — completely at ease.', 'scale'],
      ['How much a month could you put toward the dream without hurting your life?', 'Even a small amount is a beginning.'],
    ],
    step: 3,
    dreamQ: 0,
    suggestions: ['Open a separate “Dream” account', 'Review subscriptions and regular spending', 'Set up an automatic transfer on payday'],
  }),
  theme(4, {
    title: 'The wider world',
    tagline: 'The trip you keep postponing',
    intro: 'A dream holiday doesn’t just happen — it gets written into the calendar. Pick the place, the dates and the first real step.',
    art: 'islands',
    dream: 'Islands',
    q: [
      ['Where do you dream of going, and why there?', 'What do you want to feel there?'],
      ['What has stopped you so far?', 'Time, money, circumstances, someone’s opinion.'],
      ['When in the next year could you realistically get away for at least five days?', 'Name a month or exact dates.'],
    ],
    step: 2,
    dreamQ: 0,
    suggestions: ['Pick dates and book the time off', 'Compare three flight and stay options', 'Put aside the first 10% of the trip budget'],
  }),
  theme(5, {
    title: 'Closeness',
    tagline: 'The people it’s all for',
    intro: 'The most important dreams are often about the people around us. Give your attention to those you love — on purpose, not with what’s left over.',
    art: 'ring',
    dream: 'Diamond ring',
    q: [
      ['Who are the most important people in your life right now?', 'Name them.'],
      ['Which relationships get less attention than you’d like?', 'Why does it happen?'],
      ['How heard do you feel by the people close to you?', '1 — not at all, 10 — completely.', 'scale'],
      ['What gesture of attention can you make this month?', 'Simple, but sincere.'],
    ],
    step: 3,
    dreamQ: 1,
    suggestions: ['An evening for two without phones', 'Call someone you miss', 'Plan a special dinner'],
  }),
  theme(6, {
    title: 'Courage',
    tagline: 'What you thought was “not for your age”',
    intro: 'Courage has no age limit. Name what you’ve wanted for a long time but keep postponing — and take the first step this week.',
    art: 'car',
    dream: 'Sports car',
    q: [
      ['What have you wanted for a long time but put off because it’s “not the time” or “not for my age”?', 'Be honest — this is only for you.'],
      ['What fear is behind putting it off?', 'Naming a fear makes it smaller.'],
      ['What brave but realistic step can you take within 30 days?', 'It goes into your plan.'],
    ],
    step: 2,
    dreamQ: 0,
    suggestions: ['Book a test drive of the dream car', 'Take an advanced driving lesson', 'Work out the real cost of owning one'],
  }),
  theme(7, {
    title: 'Freedom',
    tagline: 'Time that belongs to you',
    intro: 'Freedom isn’t the absence of obligations — it’s the right to choose. Let’s find what you can let go of to make room for what matters.',
    art: 'yacht',
    dream: 'Yacht',
    q: [
      ['When do you feel truly free?', 'Recall a specific moment.'],
      ['Which obligations could you drop or delegate?', 'At home, at work, socially.'],
      ['How many decisions in your life are made by you rather than by circumstance?', '1 — almost none, 10 — all of them.', 'scale'],
      ['What one thing are you ready to delegate or cancel this month?', 'The time you free up goes to the dream.'],
    ],
    step: 3,
    dreamQ: 0,
    suggestions: ['Charter a yacht for a day with friends', 'Take an intro sailing lesson', 'Delegate one recurring task'],
  }),
  theme(8, {
    title: 'Life’s work',
    tagline: 'Work you can be proud of',
    intro: 'A career can be more than income — it can be a way to express yourself. Let’s define where you want to get to and what it takes.',
    art: 'penthouse',
    dream: 'Penthouse',
    q: [
      ['What do you want to be known for in ten years?', 'Not a job title — the work itself.'],
      ['What in your work gives you joy, and what only gives you money?', 'Split it into two lists.'],
      ['How well does your work match your ambition right now?', '1 — not at all, 10 — completely.', 'scale'],
      ['Which skill or project would move you toward that goal?', 'One, the most important.'],
    ],
    step: 3,
    dreamQ: 0,
    suggestions: ['Two hours a week on your own project', 'Meet a mentor', 'Update your CV and portfolio'],
  }),
  theme(9, {
    title: 'Discovery',
    tagline: 'Learning at any age',
    intro: 'New knowledge and places bring back the feeling that life is just getting started. Choose what you’ll discover this month.',
    art: 'paris',
    dream: 'Paris',
    q: [
      ['What have you long wanted to learn but never started?', 'A language, a craft, an instrument, a subject.'],
      ['Which city or culture draws you, and why?', 'What do you want to see or try there?'],
      ['What first lesson, book or trip would get it started?', 'Concrete and doable.'],
    ],
    step: 2,
    dreamQ: 1,
    suggestions: ['A trial French lesson', 'Plan a three-day itinerary', 'Read one book about the place'],
  }),
  theme(10, {
    title: 'Scale',
    tagline: 'Let yourself dream big',
    intro: 'Big goals are scary until they’re broken into steps. Let’s see where you hold yourself back — and make a big dream manageable.',
    art: 'jet',
    dream: 'Private jet',
    q: [
      ['If you had twice the resources, what would you change first?', 'Time, money, energy — anything.'],
      ['Where do you think “that’s not for me”?', 'Is that belief yours, or someone else’s?'],
      ['How much do you believe big goals are within your reach?', '1 — not at all, 10 — absolutely.', 'scale'],
      ['Which big goal are you ready to break into steps?', 'Write it in one sentence.'],
    ],
    step: 3,
    dreamQ: 3,
    suggestions: ['Break the big goal into three stages', 'Find a community with similar goals', 'Price a private flight for a special occasion'],
  }),
  theme(11, {
    title: 'Abundance',
    tagline: 'Noticing what already worked',
    intro: 'We often rush to the next goal without noticing what we’ve achieved. This month is about gratitude and celebrating the road.',
    art: 'tuscany',
    dream: 'Vineyard',
    q: [
      ['What are you grateful to this year for?', 'People, events, changes in yourself.'],
      ['What do you already have that you once dreamed of?', 'Remember yourself five years ago.'],
      ['How will you celebrate what you’ve already achieved?', 'Achievements deserve a celebration.'],
    ],
    step: 2,
    dreamQ: 1,
    suggestions: ['A dinner in honour of your wins', 'Write down ten things that worked out', 'Go to a wine tasting'],
  }),
  theme(12, {
    title: 'A new chapter',
    tagline: 'Who you became this year',
    intro: 'Twelve months ago you began with an honest look at your life. Time to see what changed — and choose the dream for your next chapter.',
    art: 'aurora',
    dream: 'Northern lights',
    q: [
      ['Who have you become over these twelve months?', 'What changed in you?'],
      ['Which dreams moved from “someday” into reality?', 'Even partly — it counts.'],
      ['How close is your life now to the one you want?', 'Compare it with chapter one.', 'scale'],
      ['Which dream will lead you into next year?', 'The new chapter starts with it.'],
    ],
    step: 3,
    dreamQ: 3,
    suggestions: ['Plan a trip to see the northern lights', 'Put together next year’s dream board', 'Write a letter to yourself a year from now'],
  }),
]

export const getTheme = (month: number) => THEMES[month - 1]
