export interface Ads {
  lokalna: number;
  premium: number;
  banner: number;
  tiktok: number;
  youtube: number;
  influencer: number;
}

export interface Bots {
  welcome: boolean;
  moderation: boolean;
  ticket: boolean;
  giveaway: boolean;
  analytics: boolean;
  stats: boolean;
  security: boolean;
  autopartner: boolean;
  viral: boolean;
  premium: boolean;
}

export interface Moderators {
  junior: boolean;
  mod: boolean;
  senior: boolean;
  admin: boolean;
}

export interface Channels {
  ads: boolean;
  news: boolean;
  partnerships: boolean;
  chat: boolean;
  giveaway: boolean;
  gaming: boolean;
  art: boolean;
  media: boolean;
  vip: boolean;
  forum: boolean;
}

export interface Upgrades {
  marketing: number;
  income: number;
  reputation: number;
}

export interface Partnership {
  id: string;
  name: string;
  bonus: number;
  membersBonus: number;
  reputationBonus: number;
}

export interface EventCooldowns {
  giveaway: number;
  quiz: number;
  contest: number;
  tournament: number;
  streaming: number;
  collab: number;
  special: number;
}

export interface Achievement {
  unlockedAt: number;
}

export interface Mission {
  completedAt: number;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  effectAmount: string;
  type: "positive" | "negative";
  timestamp: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: "success" | "info" | "warning";
}

export interface PrestigeUpgrades {
  cheap_ads?: number;
  cheap_bots?: number;
  more_partners?: number;
  more_events?: number;
  popular?: number;
  income?: number;
  respected?: number;
  offline_bonus?: number;
  legacy?: number;
}

export interface Settings {
  soundMuted: boolean;
}

export interface GameState {
  coins: number;
  members: number;
  reputation: number;
  engagement: number;
  prestige: number;
  prestigePoints: number;
  legacyBonus: number;
  lastSaveTime: number;
  giveawayCount: number;
  ads: Ads;
  bots: Bots;
  moderators: Moderators;
  channels: Channels;
  upgrades: Upgrades;
  prestigeUpgrades: PrestigeUpgrades;
  partnerships: Partnership[];
  pendingPartnerships: Partnership[];
  achievements: Record<string, Achievement>;
  missions: Record<string, Mission>;
  eventCooldowns: EventCooldowns;
  recentLogs: LogEntry[];
  randomEvents: RandomEvent[];
  settings: Settings;
}
