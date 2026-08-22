export interface CharacterData {
  id: string
  name: string
  animal: string
  situation: string
  quote: string
  description: string
  deeperContext: string
  tagPrefix: string
  color: string
  accentColor: string
  emoji: string
  traits: string[]
}

export const CHARACTERS: CharacterData[] = [
  {
    id: 'owl',
    name: 'Stardust',
    animal: 'Owl',
    situation: "Can't switch off the night before an exam",
    quote: "The clock reads 2:47 AM, and my thoughts are running a marathon.",
    description: "Still awake staring at the ceiling, re-reading mental notes, convinced everything studied has somehow vanished.",
    deeperContext: "Carrying the weight of expectations, deadlines, and the quiet fear of letting yourself or others down.",
    tagPrefix: 'StressedOwl',
    color: '#E0E0E0',
    accentColor: '#FFFFFF',
    emoji: '🦉',
    traits: ['Overthinking', 'Exam Pressure', 'Night Owl', 'High Standards'],
  },
  {
    id: 'deer',
    name: 'Echo',
    animal: 'Deer',
    situation: "Replays every conversation afterward",
    quote: "I said 'you too' when the waiter said 'enjoy your meal' three days ago.",
    description: "Analyzing every facial expression, rewinding pauses in conversations, rewriting what you should have said.",
    deeperContext: "Hyper-aware of judgment and deeply caring about connections, but trapped in spirals of social self-doubt.",
    tagPrefix: 'GentleDeer',
    color: '#CCCCCC',
    accentColor: '#FFFFFF',
    emoji: '🦌',
    traits: ['Social Anxiety', 'Replaying Words', 'Sensitive', 'Empathetic'],
  },
  {
    id: 'panda',
    name: 'Cosmo',
    animal: 'Panda',
    situation: "Feels alone even in a full room",
    quote: "Surrounded by laughter and conversation, yet completely out of frame.",
    description: "Sitting right in the middle of a crowd, nodding along, but feeling invisible and emotionally disconnected.",
    deeperContext: "Craving genuine depth while feeling exhausted by superficial interactions and quiet isolation.",
    tagPrefix: 'QuietPanda',
    color: '#F5F5F5',
    accentColor: '#FFFFFF',
    emoji: '🐼',
    traits: ['Quiet Loneliness', 'Disconnected', 'Soft-Hearted', 'Searching for Depth'],
  },
  {
    id: 'rabbit',
    name: 'Mochi',
    animal: 'Rabbit',
    situation: "Feels judged about how they look",
    quote: "Changed my outfit four times and still feel like everyone is staring.",
    description: "Getting dressed feels like a high-stakes performance. Catching reflections in shop windows with instant self-critique.",
    deeperContext: "Navigating body image, self-esteem, and the exhausting urge to shrink away from unwanted attention.",
    tagPrefix: 'ShyRabbit',
    color: '#E8E8E8',
    accentColor: '#FFFFFF',
    emoji: '🐰',
    traits: ['Body Image', 'Self-Conscious', 'Gentle', 'Needs Safe Space'],
  },
  {
    id: 'capybara',
    name: 'Haze',
    animal: 'Capybara',
    situation: "Leaning on a habit more than they'd like",
    quote: "Started as a coping mechanism, now it feels like the only switch I have.",
    description: "Enduring quietly, looking unbothered to the outside world while relying heavily on a habit to numb the overwhelm.",
    deeperContext: "The one everyone assumes is completely chill, while carrying hidden burnout and coping exhaustion.",
    tagPrefix: 'TiredCapybara',
    color: '#D0D0D0',
    accentColor: '#FFFFFF',
    emoji: '🦦',
    traits: ['Hidden Burnout', 'Coping Habits', 'Masking Stress', 'Silent Resilience'],
  },
  {
    id: 'penguin',
    name: 'Pebble',
    animal: 'Penguin',
    situation: "Quietly struggling but won't say it",
    quote: "Paddling frantically beneath the surface, but smiling above the water.",
    description: "Looking perfectly composed on the outside. When asked how you are, 'I'm totally fine!' comes out automatically.",
    deeperContext: "Holding everything together for others while secretly wishing someone would see through the brave face.",
    tagPrefix: 'QuietPenguin',
    color: '#F0F0F0',
    accentColor: '#FFFFFF',
    emoji: '🐧',
    traits: ['Masking Pain', 'People Pleaser', 'Brave Face', 'Quiet Hope'],
  },
]

export function getCharacterById(id: string): CharacterData | undefined {
  return CHARACTERS.find(c => c.id === id)
}
