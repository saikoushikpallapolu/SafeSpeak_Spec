export interface CharacterData {
  id: string
  name: string
  animal: string
  tagline: string
  situation: string
  quote: string
  description: string
  deeperContext: string
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
    tagline: "Hey, I'm a nocturnal owl who stays up watching the stars.",
    situation: "I can't switch off the night before an exam",
    quote: "The clock reads 2:47 AM, and my thoughts are running a marathon.",
    description: "I lie awake staring at the ceiling, constantly re-reading mental notes and convinced that everything I studied has somehow vanished.",
    deeperContext: "I carry the heavy weight of expectations and deadlines, quietly dreading the thought of letting myself or others down.",
    color: '#E0E0E0',
    accentColor: '#FFFFFF',
    emoji: '🦉',
    traits: ['Overthinking', 'Exam Pressure', 'Night Owl', 'High Standards'],
  },
  {
    id: 'deer',
    name: 'Echo',
    animal: 'Deer',
    tagline: "Hey, I'm a meadow deer who grazes in quiet sunlit clearings.",
    situation: "I replay every conversation in my head afterward",
    quote: "I said 'you too' when the waiter said 'enjoy your meal' three days ago.",
    description: "I catch myself analyzing every tiny facial expression, rewinding pauses in conversations, and endlessly rewriting what I should have said.",
    deeperContext: "I am hyper-aware of judgment and deeply care about making real connections, but I get trapped in spirals of social self-doubt.",
    color: '#CCCCCC',
    accentColor: '#FFFFFF',
    emoji: '🦌',
    traits: ['Social Anxiety', 'Replaying Words', 'Sensitive', 'Empathetic'],
  },
  {
    id: 'panda',
    name: 'Cosmo',
    animal: 'Panda',
    tagline: "Hey, I'm a fluffy panda who munches bamboo & takes naps.",
    situation: "I feel completely alone even in a full room",
    quote: "Surrounded by laughter and conversation, yet I feel completely out of frame.",
    description: "I sit right in the middle of a crowd, smiling and nodding along, but deep down I feel invisible and emotionally disconnected.",
    deeperContext: "I crave genuine, meaningful depth in conversations, but I feel exhausted by superficial small talk and quiet isolation.",
    color: '#F5F5F5',
    accentColor: '#FFFFFF',
    emoji: '🐼',
    traits: ['Quiet Loneliness', 'Disconnected', 'Soft-Hearted', 'Searching for Depth'],
  },
  {
    id: 'rabbit',
    name: 'Mochi',
    animal: 'Rabbit',
    tagline: "Hey, I'm a bouncy rabbit who loves clover & twitching ears.",
    situation: "I feel judged about how I look every day",
    quote: "I changed my outfit four times and still feel like everyone is staring at me.",
    description: "Getting dressed every morning feels like a high-stakes performance, and catching my reflection in windows brings an instant rush of self-critique.",
    deeperContext: "I struggle with body image and self-esteem, constantly fighting the exhausting urge to shrink away and hide.",
    color: '#E8E8E8',
    accentColor: '#FFFFFF',
    emoji: '🐰',
    traits: ['Body Image', 'Self-Conscious', 'Gentle', 'Needs Safe Space'],
  },
  {
    id: 'capybara',
    name: 'Haze',
    animal: 'Capybara',
    tagline: "Hey, I'm a chill capybara who loves warm citrus river baths.",
    situation: "I'm leaning on a habit more than I'd like to admit",
    quote: "It started as a simple way to cope, but now it feels like the only off-switch I have.",
    description: "I endure everything quietly, looking unbothered to the outside world while secretly relying on a habit to numb the daily overwhelm.",
    deeperContext: "Everyone assumes I'm completely calm and chill, but beneath the surface I'm carrying hidden burnout and coping exhaustion.",
    color: '#D0D0D0',
    accentColor: '#FFFFFF',
    emoji: '🦦',
    traits: ['Hidden Burnout', 'Coping Habits', 'Masking Stress', 'Silent Resilience'],
  },
  {
    id: 'penguin',
    name: 'Pebble',
    animal: 'Penguin',
    tagline: "Hey, I'm a dapper penguin who belly-slides & collects pebbles.",
    situation: "I'm quietly struggling but I never admit it out loud",
    quote: "I'm paddling frantically beneath the surface, but smiling above the water.",
    description: "I look completely composed on the outside, and whenever someone asks how I am, 'I'm totally fine!' comes out automatically.",
    deeperContext: "I keep holding everything together for everyone else, while secretly wishing someone would see right through my brave face.",
    color: '#F0F0F0',
    accentColor: '#FFFFFF',
    emoji: '🐧',
    traits: ['Masking Pain', 'People Pleaser', 'Brave Face', 'Quiet Hope'],
  },
]

export function getCharacterById(id: string): CharacterData | undefined {
  return CHARACTERS.find(c => c.id === id)
}
