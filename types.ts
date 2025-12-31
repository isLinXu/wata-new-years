
export interface Wish {
  id: string;
  content: string;
  color: string;
  createdAt: number;
}

export interface Photo {
  id: string;
  url: string;
  name: string;
}

export interface AppConfig {
  targetDate: string;
  backgroundUrl: string;
  currentGreeting: string;
  greetingInterval: number;
  autoPlayPhoto: boolean;
}

export enum ThemeColor {
  GOLD = '#FFD700',
  RED = '#FF4D4D',
  BLUE = '#4D96FF',
  PURPLE = '#BD93F9'
}
