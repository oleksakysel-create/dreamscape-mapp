/**
 * Success stories shown to newcomers. Prototype content: replace the
 * people, words and posters with real (consented) member stories.
 */
export interface Story {
  id: string
  name: string
  age: number
  city: string
  /** Chapter theme it started in */
  chapter: string
  title: string
  /** The dream in their own words, as written on day one */
  words: string
  /** One honest answer from the Thoughts stage */
  thought: { prompt: string; answer: string }
  steps: { title: string; when: string }[]
  memo: string
  months: number
  hours: number
  /** Poster artwork id */
  art: string
}

export const STORIES: Story[] = [
  {
    id: 'margaret',
    name: 'Margaret',
    age: 63,
    city: 'Leeds',
    chapter: 'A new chapter',
    title: 'Northern lights from a glass igloo',
    words: 'I want to lie in bed and watch the sky turn green. I’ve wanted it since I was nine.',
    thought: { prompt: 'What has stopped you so far?', answer: 'I kept waiting for someone to come with me. Nobody was ever free.' },
    steps: [
      { title: 'Find three igloo hotels in Lapland', when: 'Sat morning · 45 min' },
      { title: 'Put £120 a month into a travel pot', when: 'Every payday' },
      { title: 'Book it — just for me', when: 'Tue evening · 30 min' },
    ],
    memo: 'Third night, 1 a.m. I cried. Going alone was the best decision I made in years.',
    months: 7,
    hours: 11,
    art: 'aurora',
  },
  {
    id: 'daniel',
    name: 'Daniel',
    age: 51,
    city: 'Rotterdam',
    chapter: 'Energy',
    title: 'One quiet weekend a month',
    words: 'A cabin by a lake, no laptop. Just once a month, I want to hear myself think.',
    thought: { prompt: 'What drains your energy most?', answer: 'Answering work messages at 10 p.m. because I feel I have to.' },
    steps: [
      { title: 'Tell the team I’m offline on Saturdays', when: 'Mon morning · 15 min' },
      { title: 'Shortlist cabins within two hours', when: 'Sun evening · 40 min' },
      { title: 'Block the first weekend of every month', when: 'Wed morning · 10 min' },
    ],
    memo: 'Five weekends in. My wife says I laugh more. I sleep through the night again.',
    months: 3,
    hours: 6,
    art: 'retreat',
  },
  {
    id: 'elena',
    name: 'Elena',
    age: 56,
    city: 'Lisbon',
    chapter: 'Discovery',
    title: 'Paris, finally, on my own',
    words: 'Coffee on a terrace in Paris, with nowhere to be. I’ve said “next year” for thirty years.',
    thought: { prompt: 'What would make it feel safe?', answer: 'A small hotel I’ve read about, and a plan for the first day only.' },
    steps: [
      { title: 'Renew my passport', when: 'Thu morning · 30 min' },
      { title: 'Learn twenty phrases in French', when: '10 min a day' },
      { title: 'Book a hotel near the Seine', when: 'Sat morning · 30 min' },
    ],
    memo: 'I walked eighteen kilometres a day and ordered everything in French. Nobody laughed.',
    months: 5,
    hours: 14,
    art: 'paris',
  },
  {
    id: 'tom',
    name: 'Tom',
    age: 68,
    city: 'Brighton',
    chapter: 'Freedom',
    title: 'A week on the water',
    words: 'Out on a boat along the coast with my grandson. Before he’s too old to want to.',
    thought: { prompt: 'Who do you want there with you?', answer: 'Sam. He’s fourteen. The window is closing and I know it.' },
    steps: [
      { title: 'Two refresher sailing lessons', when: 'Sat mornings · 2 h' },
      { title: 'Ask Sam’s parents for a week in July', when: 'Sun · 20 min' },
      { title: 'Charter a skippered boat', when: 'Wed evening · 45 min' },
    ],
    memo: 'Sam took the helm on day three. He’s already asking about next summer.',
    months: 6,
    hours: 9,
    art: 'yacht',
  },
  {
    id: 'priya',
    name: 'Priya',
    age: 45,
    city: 'Manchester',
    chapter: 'Abundance',
    title: 'Harvest week in Tuscany',
    words: 'Picking grapes, long dinners outside, a week where I don’t look after anyone.',
    thought: { prompt: 'What would you let go of to make room?', answer: 'Doing every school pick-up myself. My husband can take a week.' },
    steps: [
      { title: 'Agree the week at home', when: 'Sun evening · 20 min' },
      { title: 'Find a farm that takes harvest guests', when: 'Tue evening · 40 min' },
      { title: 'Book flights on a Tuesday sale', when: '15 min' },
    ],
    memo: 'Seven days, dirt under my nails, and I came home kinder to everyone.',
    months: 4,
    hours: 5,
    art: 'tuscany',
  },
  {
    id: 'michael',
    name: 'Michael',
    age: 49,
    city: 'Dublin',
    chapter: 'Courage',
    title: 'The car I always wanted',
    words: 'A red two-seater. Not practical, not sensible. Mine.',
    thought: { prompt: 'What would you say to the voice that says “too late”?', answer: 'That I’m not buying it for twenty-year-old me. I’m buying it for me now.' },
    steps: [
      { title: 'Work out the real monthly cost', when: 'Thu evening · 45 min' },
      { title: 'Test drive two models', when: 'Sat morning · 2 h' },
      { title: 'Sell the second family car', when: 'Over two weeks' },
    ],
    memo: 'First drive was along the coast road at sunset. I took the long way home.',
    months: 8,
    hours: 12,
    art: 'car',
  },
]
