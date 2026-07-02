import { useState, useEffect, useRef, useCallback } from "react";
import type { GameState } from "./types";
import {
  getCoinsPerSecond, getMembersPerSecond, getReputationPerMinute,
  getEngagementDecayPerMinute, getEngagementGainPerMinute,
  calcOfflineEarnings, saveGame, loadGame, resetGame as doReset,
  getAdCost, getMaxPartnerships, generatePartner, formatNumber
} from "./logic";
import { INITIAL_STATE, UPGRADE_LEVELS, BOT_CONFIGS, MOD_CONFIGS, CHANNEL_CONFIGS, EVENT_CONFIGS, ACHIEVEMENTS, MISSIONS, PRESTIGE_UPGRADES } from "./config";
import { toast } from "sonner";

function genId() { return Math.random().toString(36).slice(2); }

function addLog(state: GameState, message: string, type: "success" | "info" | "warning" = "info"): GameState {
  const entry = { id: genId(), timestamp: Date.now(), message, type };
  return { ...state, recentLogs: [entry, ...state.recentLogs].slice(0, 50) };
}

export interface OfflineEarnings { coins: number; members: number }

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGame();
    return saved ?? INITIAL_STATE();
  });
  const [offlineEarnings, setOfflineEarnings] = useState<OfflineEarnings | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setState(prev => {
      const next = fn(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    const elapsed = Date.now() - state.lastSaveTime;
    if (elapsed > 60000) {
      const earned = calcOfflineEarnings(state, elapsed);
      if (earned.coins > 1 || earned.members > 1) {
        setOfflineEarnings(earned);
        update(s => ({ ...s, coins: s.coins + earned.coins, members: s.members + earned.members, lastSaveTime: Date.now() }));
      }
    }
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      update(s => {
        const cps = getCoinsPerSecond(s);
        const mps = getMembersPerSecond(s);
        const repGain = getReputationPerMinute(s) / 60;
        const engGain = (getEngagementGainPerMinute(s) - getEngagementDecayPerMinute(s)) / 60;
        const now = Date.now();
        const activeEvents = s.randomEvents.filter(e => now - e.timestamp < 60000);
        let newS = {
          ...s,
          coins: s.coins + cps,
          members: s.members + mps,
          reputation: Math.min(100, Math.max(0, s.reputation + repGain)),
          engagement: Math.min(100, Math.max(0, s.engagement + engGain)),
          randomEvents: activeEvents,
          lastSaveTime: now,
        };
        newS = checkAchievements(newS);
        newS = checkMissions(newS);
        return newS;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [update]);

  useEffect(() => {
    const save = setInterval(() => saveGame(stateRef.current), 5000);
    const onUnload = () => saveGame(stateRef.current);
    window.addEventListener("beforeunload", onUnload);
    return () => { clearInterval(save); window.removeEventListener("beforeunload", onUnload); };
  }, []);

  useEffect(() => {
    const randomEvent = () => {
      const events = [
        { id: "viral_post", title: "Viralowy Post! 🚀", description: "Post poszedł viralem", effectAmount: "+10% zarobki przez 60s", type: "positive" as const },
        { id: "drama", title: "Drama na serwerze 😱", description: "Kontrowersyjna sytuacja", effectAmount: "-15% zarobki przez 60s", type: "negative" as const },
        { id: "celebrity_join", title: "Celebryta dołączył! ⭐", description: "Znana osoba na serwerze", effectAmount: "+5% marketing przez 60s", type: "positive" as const },
        { id: "spam_attack", title: "Atak spamem 🚨", description: "Spamerzy atakują", effectAmount: "-10% engagement przez 60s", type: "negative" as const },
        { id: "collab_offer", title: "Oferta współpracy! 🤝", description: "Inna społeczność proponuje kolaborację", effectAmount: "+500 memberów", type: "positive" as const },
      ];
      const ev = events[Math.floor(Math.random() * events.length)];
      const entry = { ...ev, timestamp: Date.now() };
      update(s => {
        let next = { ...s, randomEvents: [...s.randomEvents, entry] };
        if (ev.id === "collab_offer") next = { ...next, members: next.members + 500 };
        if (ev.type === "positive") {
          toast.success(ev.title, { description: ev.description });
        } else if (!s.bots.moderation) {
          toast.warning(ev.title, { description: ev.description });
        }
        return next;
      });
    };
    const t = setTimeout(function repeat() {
      randomEvent();
      setTimeout(repeat, 60000 + Math.random() * 120000);
    }, 60000 + Math.random() * 60000);
    return () => clearTimeout(t);
  }, [update]);

  function checkAchievements(s: GameState): GameState {
    let changed = false;
    let next = { ...s };
    for (const ach of ACHIEVEMENTS) {
      if (!s.achievements[ach.id] && ach.req(s)) {
        next = { ...next, achievements: { ...next.achievements, [ach.id]: { unlockedAt: Date.now() } } };
        if (ach.reward > 0) next = { ...next, coins: next.coins + ach.reward };
        toast.success(`🏆 ${ach.name}`, { description: ach.description + (ach.reward > 0 ? ` (+${formatNumber(ach.reward)} monet)` : "") });
        changed = true;
      }
    }
    for (const m of MISSIONS) {
      if (!s.missions[m.id] && m.req(s)) {
        next = { ...next, missions: { ...next.missions, [m.id]: { completedAt: Date.now() } }, coins: next.coins + m.reward };
        toast.success(`✅ Misja: ${m.name}`, { description: `+${formatNumber(m.reward)} monet` });
        changed = true;
      }
    }
    return changed ? next : s;
  }

  function checkMissions(s: GameState): GameState { return s; }

  const buyAd = useCallback((key: string, qty = 1) => {
    update(s => {
      const cheap = s.prestigeUpgrades.cheap_ads || 0;
      let total = 0, cur = s.ads[key as keyof typeof s.ads];
      for (let i = 0; i < qty; i++) { total += getAdCost(key, cur + i, cheap); }
      if (s.coins < total) return s;
      let next: GameState = { ...s, coins: s.coins - total, ads: { ...s.ads, [key]: cur + qty } };
      next = addLog(next, `Kupiono ${qty}x ${key}`, "success");
      return checkAchievements(next);
    });
  }, [update]);

  const buyBot = useCallback((key: string) => {
    update(s => {
      const cfg = BOT_CONFIGS[key];
      const price = cfg.price * (1 - (s.prestigeUpgrades.cheap_bots || 0) * 0.25);
      if (s.coins < price || s.bots[key as keyof typeof s.bots]) return s;
      let next: GameState = { ...s, coins: s.coins - price, bots: { ...s.bots, [key]: true } };
      next = addLog(next, `Zainstalowano ${cfg.name}`, "success");
      return checkAchievements(next);
    });
  }, [update]);

  const buyMod = useCallback((key: string) => {
    update(s => {
      const cfg = MOD_CONFIGS[key];
      if (s.coins < cfg.price || s.moderators[key as keyof typeof s.moderators]) return s;
      let next: GameState = { ...s, coins: s.coins - cfg.price, moderators: { ...s.moderators, [key]: true } };
      next = addLog(next, `Zatrudniono ${cfg.name}`, "success");
      return checkAchievements(next);
    });
  }, [update]);

  const buyChannel = useCallback((key: string) => {
    update(s => {
      const cfg = CHANNEL_CONFIGS[key];
      if (s.coins < cfg.price || s.channels[key as keyof typeof s.channels]) return s;
      let next: GameState = { ...s, coins: s.coins - cfg.price, channels: { ...s.channels, [key]: true } };
      if (key === "chat") next = { ...next, engagement: Math.min(100, next.engagement + 5) };
      next = addLog(next, `Utworzono kanał ${cfg.name}`, "success");
      return checkAchievements(next);
    });
  }, [update]);

  const buyUpgrade = useCallback((key: string) => {
    update(s => {
      const levels = UPGRADE_LEVELS[key];
      const cur = s.upgrades[key as keyof typeof s.upgrades];
      if (cur >= levels.length) return s;
      const lvl = levels[cur];
      if (s.coins < lvl.price) return s;
      let next: GameState = { ...s, coins: s.coins - lvl.price, upgrades: { ...s.upgrades, [key]: cur + 1 } };
      next = addLog(next, `Ulepszono ${key} → Poziom ${cur + 1}`, "success");
      return checkAchievements(next);
    });
  }, [update]);

  const triggerEvent = useCallback((key: string) => {
    update(s => {
      const cfg = EVENT_CONFIGS[key];
      if (s.coins < cfg.cost) return s;
      const now = Date.now();
      const last = s.eventCooldowns[key as keyof typeof s.eventCooldowns] || 0;
      const cooldown = s.prestigeUpgrades.more_events ? cfg.cooldownMs / 2 : cfg.cooldownMs;
      if (now - last < cooldown) return s;
      let reward = cfg.reward;
      let members = cfg.membersBonus;
      if (s.bots.giveaway) { reward = Math.floor(reward * 1.5); members = Math.floor(members * 1.5); }
      let next: GameState = {
        ...s,
        coins: s.coins - cfg.cost + reward,
        members: s.members + members,
        reputation: Math.min(100, s.reputation + cfg.repBonus),
        engagement: Math.min(100, s.engagement + cfg.engagementBonus),
        eventCooldowns: { ...s.eventCooldowns, [key]: now },
      };
      next = addLog(next, `Zorganizowano ${cfg.name}! +${formatNumber(reward)} monet`, "success");
      toast.success(`${cfg.icon} ${cfg.name}!`, { description: `+${formatNumber(reward)} monet, +${members} memberów` });
      return checkAchievements(next);
    });
  }, [update]);

  const clickEarn = useCallback(() => {
    update(s => {
      const coinBonus = Math.max(10, Math.floor(getCoinsPerSecond(s) * 5));
      const memberBonus = Math.max(1, Math.floor(getMembersPerSecond(s) * 2));
      return { ...s, coins: s.coins + coinBonus, members: s.members + memberBonus };
    });
  }, [update]);

  const acceptPartner = useCallback((id: string) => {
    update(s => {
      const p = s.pendingPartnerships.find(x => x.id === id);
      if (!p || s.partnerships.length >= getMaxPartnerships(s)) return s;
      let next: GameState = {
        ...s,
        pendingPartnerships: s.pendingPartnerships.filter(x => x.id !== id),
        partnerships: [...s.partnerships, p],
      };
      next = addLog(next, `Zaakceptowano partnerstwo: ${p.name}`, "success");
      return checkAchievements(next);
    });
  }, [update]);

  const declinePartner = useCallback((id: string) => {
    update(s => ({ ...s, pendingPartnerships: s.pendingPartnerships.filter(x => x.id !== id) }));
  }, [update]);

  const doPrestige = useCallback(() => {
    update(s => {
      if (s.members < 1000000) {
        toast.error("Potrzebujesz 1 000 000 memberów!", { description: "Rozbuduj serwer bardziej." });
        return s;
      }
      const newPrestige = s.prestige + 1;
      const legacyLevel = s.prestigeUpgrades.legacy || 0;
      const newLegacy = s.legacyBonus + 0.20 + legacyLevel * 0.05;
      const startRep = (s.prestigeUpgrades.respected || 0) * 10;
      toast.success(`🔮 Prestiż ${newPrestige}!`, { description: `+${Math.round((0.20 + legacyLevel * 0.05) * 100)}% trwały bonus zarobków` });
      const fresh = INITIAL_STATE();
      return {
        ...fresh,
        prestige: newPrestige,
        prestigePoints: s.prestigePoints + 1,
        legacyBonus: newLegacy,
        reputation: startRep,
        achievements: s.achievements,
        missions: s.missions,
        prestigeUpgrades: s.prestigeUpgrades,
        settings: s.settings,
        lastSaveTime: Date.now(),
      };
    });
  }, [update]);

  const buyPrestigeUpgrade = useCallback((key: string) => {
    update(s => {
      if (s.prestigePoints < 1) return s;
      const cfg = PRESTIGE_UPGRADES[key];
      const cur = s.prestigeUpgrades[key as keyof typeof s.prestigeUpgrades] || 0;
      if (cur >= cfg.maxLevel) return s;
      let next: GameState = {
        ...s,
        prestigePoints: s.prestigePoints - 1,
        prestigeUpgrades: { ...s.prestigeUpgrades, [key]: cur + 1 },
      };
      next = addLog(next, `Ulepszenie prestiżu: ${cfg.name} → Poz. ${cur + 1}`, "success");
      toast.success(`👑 ${cfg.name}`, { description: `Poziom ${cur + 1}` });
      return next;
    });
  }, [update]);

  const toggleMute = useCallback(() => {
    update(s => ({ ...s, settings: { ...s.settings, soundMuted: !s.settings.soundMuted } }));
  }, [update]);

  const resetGame = useCallback(() => {
    doReset();
    setState(INITIAL_STATE());
    toast.info("Gra zresetowana");
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const s = stateRef.current;
      if (s.partnerships.length >= getMaxPartnerships(s)) return;
      if (Math.random() < 0.3) {
        const existing = [...s.partnerships.map(p => p.id), ...s.pendingPartnerships.map(p => p.id)];
        const p = generatePartner(existing);
        if (p) {
          update(prev => ({ ...prev, pendingPartnerships: [...prev.pendingPartnerships, p].slice(0, 5) }));
          toast.info(`🤝 Nowa oferta partnerstwa od ${p.name}!`);
        }
      }
    }, 90000);
    return () => clearInterval(t);
  }, [update]);

  return {
    state,
    offlineEarnings,
    dismissOfflineEarnings: () => setOfflineEarnings(null),
    cps: getCoinsPerSecond(state),
    mps: getMembersPerSecond(state),
    maxPartnerships: getMaxPartnerships(state),
    buyAd, buyBot, buyMod, buyChannel, buyUpgrade,
    triggerEvent, clickEarn, acceptPartner, declinePartner,
    doPrestige, buyPrestigeUpgrade, toggleMute, resetGame,
  };
}
