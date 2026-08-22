export interface CharacterData {
  id: string
  name: string
  animal: string
  situation: string
  description: string
  tagPrefix: string
  color: string
  accentColor: string
  emoji: string
}

export const CHARACTERS: CharacterData[] = [
  {
    id: 'owl',
    name: 'Stardust',
    animal: 'Owl',
    situation: "Can't switch off the night before an exam",
    description: "Still awake at 2am, thoughts racing, convincing yourself you've forgotten everything you studied.",
    tagPrefix: 'StressedOwl',
    color: '#8B7355',
    accentColor: '#C9A84C',
    emoji: '🦉',
  },
  {
    id: 'deer',
    name: 'Echo',
    animal: 'Deer',
    situation: "Replays every conversation afterward",
    description: "Said something three days ago, still rewriting how it should have gone.",
    tagPrefix: 'GentleDeer',
    color: '#A0826D',
    accentColor: '#D4875A',
    emoji: '🦌',
  },
  {
    id: 'panda',
    name: 'Cosmo',
    animal: 'Panda',
    situation: "Feels alone even in a full room",
    description: "Surrounded by people, somehow more invisible than when you were actually alone.",
    tagPrefix: 'QuietPanda',
    color: '#E8E4DC',
    accentColor: '#9BAF98',
    emoji: '🐼',
  },
  {
    id: 'rabbit',
    name: 'Mochi',
    animal: 'Rabbit',
    situation: "Feels judged about how they look",
    description: "Getting dressed feels like a whole performance. Mirrors have complicated feelings.",
    tagPrefix: 'ShyRabbit',
    color: '#C8B8D0',
    accentColor: '#9B89BC',
    emoji: '🐰',
  },
  {
    id: 'capybara',
    name: 'Haze',
    animal: 'Capybara',
    situation: "Leaning on a habit more than they'd like",
    description: "Started as something small. Now it's the first thing you reach for when things get heavy.",
    tagPrefix: 'TiredCapybara',
    color: '#B5956A',
    accentColor: '#C9A84C',
    emoji: '🦦',
  },
  {
    id: 'axolotl',
    name: 'Wisp',
    animal: 'Axolotl',
    situation: "Quietly struggling but won't say it",
    description: "Fine, you say. And mostly you are. Except for the part you don't say out loud.",
    tagPrefix: 'HiddenAxolotl',
    color: '#E8A0B4',
    accentColor: '#C47B7B',
    emoji: '🦎',
  },
]

export function getCharacterById(id: string): CharacterData | undefined {
  return CHARACTERS.find(c => c.id === id)
}
