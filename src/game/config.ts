import type { GameState } from "./types";

export const AD_CONFIGS: Record<string, { name: string; basePrice: number; membersPerSec: number; icon: string }> = {
  lokalna: { name: "Reklama Lokalna", basePrice: 100, membersPerSec: 0.5, icon: "📢" },
  premium: { name: "Reklama Premium", basePrice: 800, membersPerSec: 2, icon: "⭐" },
  banner: { name: "Banner Online", basePrice: 5000, membersPerSec: 8, icon: "🖼️" },
  tiktok: { name: "TikTok Ads", basePrice: 25000, membersPerSec: 25, icon: "🎵" },
  youtube: { name: "YouTube Ads", basePrice: 120000, membersPerSec: 80, icon: "▶️" },
  influencer: { name: "Influencer", basePrice: 600000, membersPerSec: 250, icon: "👑" },
};

export const BOT_CONFIGS: Record<string, { name: string; price: number; description: string; icon: string }> = {
  welcome: { name: "Bot Powitalny", price: 500, description: "+8% marketing", icon: "👋" },
  moderation: { name: "Bot Moderacji", price: 1500, description: "-20% negatywne zdarzenia", icon: "🛡️" },
  ticket: { name: "Bot Ticketów", price: 3000, description: "+15% zarobki", icon: "🎫" },
  giveaway: { name: "Bot Giveaway", price: 6000, description: "+50% nagrody eventów", icon: "🎁" },
  analytics: { name: "Bot Analityki", price: 12000, description: "+10% zarobki", icon: "📊" },
  stats: { name: "Bot Statystyk", price: 25000, description: "+20% zarobki", icon: "📈" },
  security: { name: "Bot Bezpieczeństwa", price: 50000, description: "+10% engagement", icon: "🔒" },
  autopartner: { name: "Auto Partner", price: 100000, description: "Auto partnerstwa", icon: "🤝" },
  viral: { name: "Bot Viralowy", price: 250000, description: "+80% marketing", icon: "🚀" },
  premium: { name: "Bot Premium", price: 500000, description: "+100% zarobki", icon: "💎" },
};

export const MOD_CONFIGS: Record<string, { name: string; price: number; description: string; icon: string }> = {
  junior: { name: "Junior Mod", price: 2000, description: "+5 reputacji/min", icon: "🔰" },
  mod: { name: "Moderator", price: 15000, description: "+10 reputacji/min", icon: "⚔️" },
  senior: { name: "Senior Mod", price: 80000, description: "+20 reputacji/min, -30% kary", icon: "🏅" },
  admin: { name: "Administrator", price: 400000, description: "+30 rep/min, -60% kary", icon: "👮" },
};

export const CHANNEL_CONFIGS: Record<string, { name: string; price: number; description: string; icon: string }> = {
  ads: { name: "#reklamy", price: 1000, description: "+1 member/s, +5% zarobki", icon: "#" },
  news: { name: "#aktualności", price: 3000, description: "+5% zarobki", icon: "📰" },
  partnerships: { name: "#partnerstwa", price: 8000, description: "+5% marketing", icon: "🤝" },
  chat: { name: "#ogólny", price: 5000, description: "+5% engagement/min", icon: "💬" },
  giveaway: { name: "#giveaway", price: 20000, description: "+10 members/s", icon: "🎁" },
  gaming: { name: "#gaming", price: 40000, description: "+8% zarobki", icon: "🎮" },
  art: { name: "#sztuka", price: 80000, description: "+20 members/s, +10 rep/min", icon: "🎨" },
  media: { name: "#media", price: 200000, description: "+60 members/s", icon: "📸" },
  vip: { name: "#vip", price: 500000, description: "+15% zarobki, subskrypcje", icon: "💎" },
  forum: { name: "#forum", price: 1500000, description: "+80 members/s, +15 rep/min", icon: "📋" },
};

export const UPGRADE_LEVELS: Record<string, { level: number; price: number; bonus: number }[]> = {
  marketing: [
    { level: 1, price: 500, bonus: 0.08 },
    { level: 2, price: 2000, bonus: 0.15 },
    { level: 3, price: 8000, bonus: 0.25 },
    { level: 4, price: 30000, bonus: 0.40 },
    { level: 5, price: 120000, bonus: 0.60 },
    { level: 6, price: 500000, bonus: 0.85 },
    { level: 7, price: 2000000, bonus: 1.20 },
    { level: 8, price: 8000000, bonus: 1.60 },
    { level: 9, price: 35000000, bonus: 2.10 },
    { level: 10, price: 150000000, bonus: 2.80 },
  ],
  income: [
    { level: 1, price: 1000, bonus: 0.15 },
    { level: 2, price: 8000, bonus: 0.30 },
    { level: 3, price: 60000, bonus: 0.50 },
    { level: 4, price: 400000, bonus: 0.80 },
    { level: 5, price: 2500000, bonus: 1.20 },
    { level: 6, price: 15000000, bonus: 1.70 },
    { level: 7, price: 90000000, bonus: 2.30 },
    { level: 8, price: 550000000, bonus: 3.00 },
    { level: 9, price: 3000000000, bonus: 4.00 },
    { level: 10, price: 20000000000, bonus: 5.50 },
  ],
  reputation: [
    { level: 1, price: 2000, bonus: 5 },
    { level: 2, price: 12000, bonus: 10 },
    { level: 3, price: 60000, bonus: 18 },
    { level: 4, price: 250000, bonus: 27 },
    { level: 5, price: 1000000, bonus: 35 },
    { level: 6, price: 4000000, bonus: 43 },
    { level: 7, price: 16000000, bonus: 52 },
    { level: 8, price: 65000000, bonus: 63 },
    { level: 9, price: 260000000, bonus: 76 },
    { level: 10, price: 1200000000, bonus: 90 },
  ],
};

export const EVENT_CONFIGS: Record<string, { name: string; icon: string; cost: number; reward: number; membersBonus: number; repBonus: number; engagementBonus: number; cooldownMs: number }> = {
  giveaway: { name: "Giveaway", icon: "🎁", cost: 500, reward: 5000, membersBonus: 50, repBonus: 5, engagementBonus: 10, cooldownMs: 300000 },
  quiz: { name: "Quiz", icon: "❓", cost: 1000, reward: 8000, membersBonus: 80, repBonus: 8, engagementBonus: 12, cooldownMs: 600000 },
  contest: { name: "Konkurs", icon: "🏆", cost: 5000, reward: 30000, membersBonus: 200, repBonus: 15, engagementBonus: 20, cooldownMs: 1800000 },
  tournament: { name: "Turniej", icon: "⚔️", cost: 15000, reward: 80000, membersBonus: 500, repBonus: 20, engagementBonus: 25, cooldownMs: 3600000 },
  streaming: { name: "Stream na żywo", icon: "📡", cost: 30000, reward: 150000, membersBonus: 1000, repBonus: 25, engagementBonus: 30, cooldownMs: 7200000 },
  collab: { name: "Kolaboracja", icon: "🤝", cost: 100000, reward: 400000, membersBonus: 3000, repBonus: 30, engagementBonus: 35, cooldownMs: 14400000 },
  special: { name: "Wielkie Wydarzenie", icon: "🌟", cost: 1500000, reward: 4000000, membersBonus: 15000, repBonus: 40, engagementBonus: 50, cooldownMs: 86400000 },
};

export const PRESTIGE_UPGRADES: Record<string, { name: string; description: string; icon: string; maxLevel: number }> = {
  cheap_ads: { name: "Tanie Reklamy", description: "Reklamy 25% tańsze na poziom", icon: "💸", maxLevel: 3 },
  cheap_bots: { name: "Tanie Boty", description: "Boty 25% tańsze na poziom", icon: "🤖", maxLevel: 3 },
  more_partners: { name: "Więcej Partnerów", description: "+25 slotów partnerskich na poziom", icon: "🌐", maxLevel: 4 },
  more_events: { name: "Szybsze Eventy", description: "Cooldown eventów 50% krótszy", icon: "⚡", maxLevel: 1 },
  popular: { name: "Popularność", description: "+25% marketing na poziom", icon: "📣", maxLevel: 5 },
  income: { name: "Dochodowość", description: "+25% zarobki na poziom", icon: "💰", maxLevel: 5 },
  respected: { name: "Szacunek", description: "+10 startowej reputacji na poziom", icon: "🏅", maxLevel: 5 },
  offline_bonus: { name: "Offline Bonus", description: "+4h maks. offline na poziom", icon: "⏰", maxLevel: 3 },
  legacy: { name: "Dziedzictwo", description: "+5% trwały bonus na zawsze", icon: "👑", maxLevel: 10 },
};

export const ACHIEVEMENTS: { id: string; name: string; description: string; icon: string; req: (s: GameState) => boolean; reward: number }[] = [
  { id: "first_member", name: "Pierwszy Member!", description: "Zdobądź pierwszego membera", icon: "👋", req: s => s.members >= 1, reward: 100 },
  { id: "members_100", name: "Setka!", description: "100 memberów", icon: "💯", req: s => s.members >= 100, reward: 1000 },
  { id: "members_1k", name: "Tysiąc!", description: "1000 memberów", icon: "🎉", req: s => s.members >= 1000, reward: 5000 },
  { id: "members_10k", name: "10K!", description: "10 000 memberów", icon: "🚀", req: s => s.members >= 10000, reward: 25000 },
  { id: "members_100k", name: "100K!", description: "100 000 memberów", icon: "💫", req: s => s.members >= 100000, reward: 200000 },
  { id: "members_500k", name: "Pół Miliona!", description: "500 000 memberów", icon: "⭐", req: s => s.members >= 500000, reward: 1000000 },
  { id: "members_1m", name: "Milion!", description: "1 000 000 memberów", icon: "👑", req: s => s.members >= 1000000, reward: 5000000 },
  { id: "prestige_1", name: "Pierwsza Rebelia", description: "Pierwszy prestiż", icon: "🔮", req: s => s.prestige >= 1, reward: 0 },
  { id: "prestige_5", name: "Legenda", description: "5 prestiżów", icon: "🌟", req: s => s.prestige >= 5, reward: 0 },
  { id: "prestige_10", name: "Bóg Reklamy", description: "10 prestiżów", icon: "🏆", req: s => s.prestige >= 10, reward: 0 },
  { id: "rep_max", name: "Perfekcjonista", description: "100% reputacji", icon: "💎", req: s => s.reputation >= 100, reward: 50000 },
  { id: "engagement_max", name: "Hype Mode", description: "100% engagement", icon: "🔥", req: s => s.engagement >= 100, reward: 50000 },
  { id: "rich_1m", name: "Milioner", description: "1 000 000 monet", icon: "💰", req: s => s.coins >= 1000000, reward: 100000 },
  { id: "rich_1b", name: "Bilioner", description: "1 000 000 000 monet", icon: "🏦", req: s => s.coins >= 1000000000, reward: 500000000 },
  { id: "partnerships_5", name: "Networker", description: "5 aktywnych partnerstw", icon: "🤝", req: s => s.partnerships.length >= 5, reward: 30000 },
];

export const MISSIONS: { id: string; name: string; description: string; icon: string; req: (s: GameState) => boolean; reward: number }[] = [
  { id: "buy_first_ad", name: "Pierwsza Reklama", description: "Kup jakąkolwiek reklamę", icon: "📢", req: s => Object.values(s.ads).some(v => v > 0), reward: 500 },
  { id: "buy_5_ads", name: "Kampania Reklamowa", description: "Kup 5 reklam łącznie", icon: "📣", req: s => Object.values(s.ads).reduce((a, b) => a + b, 0) >= 5, reward: 2000 },
  { id: "buy_first_bot", name: "Pierwszy Bot", description: "Zainstaluj bota", icon: "🤖", req: s => Object.values(s.bots).some(Boolean), reward: 1000 },
  { id: "buy_first_channel", name: "Pierwszy Kanał", description: "Utwórz kanał", icon: "#", req: s => Object.values(s.channels).some(Boolean), reward: 1500 },
  { id: "first_partnership", name: "Pierwsze Partnerstwo", description: "Zdobądź partnera", icon: "🤝", req: s => s.partnerships.length >= 1, reward: 3000 },
  { id: "rep_50", name: "Znana Marka", description: "Osiągnij 50% reputacji", icon: "⭐", req: s => s.reputation >= 50, reward: 10000 },
  { id: "engagement_70", name: "Zaangażowana Społeczność", description: "Osiągnij 70% engagement", icon: "🔥", req: s => s.engagement >= 70, reward: 15000 },
  { id: "first_event", name: "Pierwszy Event", description: "Zorganizuj event", icon: "🎉", req: s => Object.values(s.eventCooldowns).some(v => v > 0), reward: 5000 },
  { id: "upgrade_max_marketing", name: "Mistrz Marketingu", description: "Ulepszenie marketingu max poziom", icon: "📈", req: s => s.upgrades.marketing >= 10, reward: 500000 },
  { id: "upgrade_max_income", name: "Mistrz Zarobków", description: "Ulepszenie zarobków max poziom", icon: "💰", req: s => s.upgrades.income >= 10, reward: 5000000 },
];

export const PARTNER_NAMES = [
  "TechHub", "GameZone", "ArtStation", "MusicVibes", "SportArena",
  "StudyGroup", "MovieNight", "CryptoTalk", "FoodLovers", "TravelBuddies",
  "AnimeWorld", "CodersHub", "FitnessGoals", "BookClub", "MemeFactory",
  "DevCommunity", "StreamersUnion", "DesignersHub", "Photography+", "NFTWorld",
];

export const INITIAL_STATE = (): import("./types").GameState => ({
  coins: 250,
  members: 0,
  reputation: 10,
  engagement: 50,
  prestige: 0,
  prestigePoints: 0,
  legacyBonus: 0,
  lastSaveTime: Date.now(),
  giveawayCount: 0,
  ads: { lokalna: 0, premium: 0, banner: 0, tiktok: 0, youtube: 0, influencer: 0 },
  bots: { welcome: false, moderation: false, ticket: false, giveaway: false, analytics: false, stats: false, security: false, autopartner: false, viral: false, premium: false },
  moderators: { junior: false, mod: false, senior: false, admin: false },
  channels: { ads: false, news: false, partnerships: false, chat: false, giveaway: false, gaming: false, art: false, media: false, vip: false, forum: false },
  upgrades: { marketing: 0, income: 0, reputation: 0 },
  prestigeUpgrades: {},
  partnerships: [],
  pendingPartnerships: [],
  achievements: {},
  missions: {},
  eventCooldowns: { giveaway: 0, quiz: 0, contest: 0, tournament: 0, streaming: 0, collab: 0, special: 0 },
  recentLogs: [],
  randomEvents: [],
  settings: { soundMuted: false },
});

export const SAVE_KEY = "promora_tycoon_v3";
