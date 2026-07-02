import type { GameState } from "./types";
import { UPGRADE_LEVELS, AD_CONFIGS, SAVE_KEY, INITIAL_STATE } from "./config";

export function getAdCost(adKey: string, currentAmount: number, cheapDiscount = 0): number {
  const base = AD_CONFIGS[adKey].basePrice;
  const discount = Math.min(0.75, cheapDiscount * 0.25);
  return Math.floor(base * Math.pow(1.15, currentAmount) * (1 - discount));
}

export function getIncomeMultiplier(state: GameState): number {
  let mult = 1 + state.legacyBonus;
  if (state.upgrades.income > 0) {
    const lvl = UPGRADE_LEVELS.income[state.upgrades.income - 1];
    if (lvl) mult += lvl.bonus;
  }
  if (state.bots.ticket) mult += 0.15;
  if (state.bots.analytics) mult += 0.10;
  if (state.bots.stats) mult += 0.20;
  if (state.bots.premium) mult += 1.00;
  if (state.channels.news) mult += 0.05;
  if (state.channels.gaming) mult += 0.08;
  if (state.channels.vip) mult += 0.15;
  if (state.channels.ads) mult += 0.05;
  if (state.prestigeUpgrades.income) mult += (state.prestigeUpgrades.income * 0.25);
  for (const ev of state.randomEvents) {
    if (Date.now() - ev.timestamp < 60000 && ev.type === "positive") mult += 0.10;
    if (Date.now() - ev.timestamp < 60000 && ev.type === "negative" && !state.moderators.admin) mult *= 0.85;
  }
  return Math.max(0.1, mult);
}

export function getMarketingMultiplier(state: GameState): number {
  let mult = 1 + state.legacyBonus;
  if (state.upgrades.marketing > 0) {
    const lvl = UPGRADE_LEVELS.marketing[state.upgrades.marketing - 1];
    if (lvl) mult += lvl.bonus;
  }
  if (state.bots.welcome) mult += 0.08;
  if (state.bots.viral) mult += 0.80;
  if (state.channels.partnerships) mult += 0.05;
  if (state.prestigeUpgrades.popular) mult += (state.prestigeUpgrades.popular * 0.25);
  for (const p of state.partnerships) mult += p.membersBonus;
  return Math.max(0.1, mult);
}

export function getReputationMultiplier(state: GameState): number {
  return 1 + (state.reputation / 100) * 2;
}

export function getEngagementFactor(state: GameState): number {
  return Math.max(0.1, state.engagement / 100);
}

export function getCoinsPerSecond(state: GameState): number {
  const baseIncome = state.members * 0.02;
  const incMult = getIncomeMultiplier(state);
  const repMult = getReputationMultiplier(state);
  const engFactor = getEngagementFactor(state);
  let vipIncome = 0;
  if (state.channels.vip) vipIncome = Math.floor(state.members * 0.001) * 5;
  return baseIncome * incMult * repMult * engFactor + vipIncome;
}

export function getMembersPerSecond(state: GameState): number {
  let mps = 0;
  const cheap = state.prestigeUpgrades.cheap_ads || 0;
  for (const [key, amount] of Object.entries(state.ads)) {
    if (amount > 0) mps += amount * AD_CONFIGS[key].membersPerSec;
  }
  if (state.channels.ads) mps += 1;
  if (state.channels.giveaway) mps += 10;
  if (state.channels.art) mps += 20;
  if (state.channels.media) mps += 60;
  if (state.channels.forum) mps += 80;
  const _ = cheap;
  return mps * getMarketingMultiplier(state);
}

export function getReputationPerMinute(state: GameState): number {
  let rpm = 0;
  if (state.channels.chat) rpm += 2;
  if (state.channels.art) rpm += 5;
  if (state.channels.forum) rpm += 8;
  if (state.moderators.junior) rpm += 3;
  if (state.moderators.mod) rpm += 8;
  if (state.moderators.senior) rpm += 15;
  if (state.moderators.admin) rpm += 25;
  if (state.upgrades.reputation > 0) {
    const lvl = UPGRADE_LEVELS.reputation[state.upgrades.reputation - 1];
    if (lvl) rpm += lvl.bonus * 0.5;
  }
  for (const p of state.partnerships) rpm += p.reputationBonus;
  return rpm;
}

export function getEngagementDecayPerMinute(_state: GameState): number {
  return 1.5;
}

export function getEngagementGainPerMinute(state: GameState): number {
  let gain = 0;
  if (state.channels.chat) gain += 1;
  if (state.channels.gaming) gain += 2;
  if (state.channels.art) gain += 2;
  if (state.channels.forum) gain += 3;
  if (state.bots.security) gain += 1;
  if (state.moderators.senior) gain += 1;
  if (state.moderators.admin) gain += 2;
  return gain;
}

export function getMaxOfflineHours(state: GameState): number {
  const base = 8;
  const bonus = (state.prestigeUpgrades.offline_bonus || 0) * 4;
  return base + bonus;
}

export function calcOfflineEarnings(state: GameState, elapsedMs: number): { coins: number; members: number } {
  const maxSec = getMaxOfflineHours(state) * 3600;
  const sec = Math.min(Math.floor(elapsedMs / 1000), maxSec);
  if (sec <= 0) return { coins: 0, members: 0 };
  return {
    coins: getCoinsPerSecond(state) * sec,
    members: getMembersPerSecond(state) * sec,
  };
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaveTime: Date.now() }));
  } catch {}
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const initial = INITIAL_STATE();
    return {
      ...initial,
      ...parsed,
      bots: { ...initial.bots, ...parsed.bots },
      moderators: { ...initial.moderators, ...parsed.moderators },
      channels: { ...initial.channels, ...parsed.channels },
      upgrades: { ...initial.upgrades, ...parsed.upgrades },
      settings: { ...initial.settings, ...parsed.settings },
      ads: { ...initial.ads, ...parsed.ads },
      eventCooldowns: { ...initial.eventCooldowns, ...parsed.eventCooldowns },
    };
  } catch {
    return null;
  }
}

export function resetGame(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function formatNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toString();
}

export function generatePartner(existing: string[]): import("./types").Partnership | null {
  const names = ["TechHub", "GameZone", "ArtStation", "MusicVibes", "SportArena",
    "StudyGroup", "MovieNight", "CryptoTalk", "FoodLovers", "TravelBuddies",
    "AnimeWorld", "CodersHub", "FitnessGoals", "BookClub", "MemeFactory",
    "DevCommunity", "StreamersUnion", "DesignersHub", "Photography+", "NFTWorld"];
  const available = names.filter(n => !existing.includes(n));
  if (available.length === 0) return null;
  const name = available[Math.floor(Math.random() * available.length)];
  return {
    id: name,
    name,
    bonus: 0.02 + Math.random() * 0.08,
    membersBonus: 0.02 + Math.random() * 0.08,
    reputationBonus: 1 + Math.random() * 3,
  };
}

export function getMaxPartnerships(state: GameState): number {
  return 5 + (state.prestigeUpgrades.more_partners || 0) * 25;
}
