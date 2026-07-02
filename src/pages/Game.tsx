import { useState, useRef, useCallback } from "react";
import { useGame } from "../game/useGame";
import { formatNumber } from "../game/logic";
import { AD_CONFIGS, BOT_CONFIGS, MOD_CONFIGS, CHANNEL_CONFIGS, UPGRADE_LEVELS, EVENT_CONFIGS, PRESTIGE_UPGRADES, ACHIEVEMENTS, MISSIONS } from "../game/config";
import { getAdCost } from "../game/logic";

type Tab = "click" | "ads" | "bots" | "channels" | "upgrades" | "events" | "partners" | "prestige" | "achievements" | "settings";

interface FloatText { id: number; text: string; x: number; y: number }

export default function Game() {
  const game = useGame();
  const { state } = game;
  const [tab, setTab] = useState<Tab>("click");
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const floatId = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    game.clickEarn();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++floatId.current;
    const coinBonus = Math.max(10, Math.floor(game.cps * 5));
    const memberBonus = Math.max(1, Math.floor(game.mps * 2));
    setFloats(f => [...f, { id, text: `+${formatNumber(coinBonus)} 💰`, x, y }]);
    if (memberBonus >= 1) setTimeout(() => setFloats(f => [...f, { id: id + 0.5, text: `+${memberBonus} 👥`, x: x + 20, y: y + 20 }]), 150);
    setTimeout(() => setFloats(f => f.filter(fl => fl.id !== id && fl.id !== id + 0.5)), 900);
  }, [game]);

  const membersToPrestige = 1000000;
  const prestigeProgress = Math.min(100, (state.members / membersToPrestige) * 100);
  const canPrestige = state.members >= membersToPrestige;
  const repColor = state.reputation >= 80 ? "#22c55e" : state.reputation >= 50 ? "#eab308" : "#ef4444";
  const engColor = state.engagement >= 70 ? "#22c55e" : state.engagement >= 40 ? "#eab308" : "#ef4444";

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "click", label: "Klik", icon: "👆" },
    { id: "ads", label: "Reklamy", icon: "📢" },
    { id: "bots", label: "Boty", icon: "🤖" },
    { id: "channels", label: "Kanały", icon: "#" },
    { id: "upgrades", label: "Ulepszenia", icon: "⬆️" },
    { id: "events", label: "Eventy", icon: "🎉" },
    { id: "partners", label: "Partnerzy", icon: "🤝" },
    { id: "prestige", label: "Prestiż", icon: "🔮" },
    { id: "achievements", label: "Sukcesy", icon: "🏆" },
    { id: "settings", label: "Ustawienia", icon: "⚙️" },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground font-sans select-none">
      <Header state={state} cps={game.cps} mps={game.mps} repColor={repColor} engColor={engColor} />

      {game.offlineEarnings && game.offlineEarnings.coins > 1 && (
        <div className="mx-4 mt-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-between">
          <div>
            <p className="font-bold text-yellow-400">🌙 Offline Zarobki!</p>
            <p className="text-sm text-muted-foreground">
              +{formatNumber(game.offlineEarnings.coins)} monet · +{formatNumber(game.offlineEarnings.members)} memberów
            </p>
          </div>
          <button onClick={game.dismissOfflineEarnings} className="btn-gold text-xs px-3 py-1.5">Odbierz</button>
        </div>
      )}

      {state.pendingPartnerships.length > 0 && (
        <div className="mx-4 mt-3 space-y-2">
          {state.pendingPartnerships.slice(0, 2).map(p => (
            <div key={p.id} className="p-3 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-between">
              <span className="text-sm font-medium">🤝 Oferta od <strong>{p.name}</strong> (+{(p.bonus * 100).toFixed(1)}% zarobki)</span>
              <div className="flex gap-2">
                <button onClick={() => game.acceptPartner(p.id)} className="btn-primary text-xs px-3 py-1">Akceptuj</button>
                <button onClick={() => game.declinePartner(p.id)} className="btn-secondary text-xs px-3 py-1">Odrzuć</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 px-4 mt-3 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`tab-btn whitespace-nowrap flex-shrink-0 ${tab === t.id ? "tab-btn-active" : "tab-btn-inactive"}`}
          >
            <span className="mr-1">{t.icon}</span>{t.label}
            {t.id === "prestige" && state.prestigePoints > 0 && (
              <span className="ml-1 bg-accent text-white text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">{state.prestigePoints}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pb-4 mt-3 overflow-y-auto">
        {tab === "click" && <ClickTab game={game} handleClick={handleClick} floats={floats} prestigeProgress={prestigeProgress} canPrestige={canPrestige} />}
        {tab === "ads" && <AdsTab game={game} />}
        {tab === "bots" && <BotsTab game={game} />}
        {tab === "channels" && <ChannelsTab game={game} />}
        {tab === "upgrades" && <UpgradesTab game={game} />}
        {tab === "events" && <EventsTab game={game} />}
        {tab === "partners" && <PartnersTab game={game} />}
        {tab === "prestige" && <PrestigeTab game={game} />}
        {tab === "achievements" && <AchievementsTab game={game} />}
        {tab === "settings" && <SettingsTab game={game} confirmReset={confirmReset} setConfirmReset={setConfirmReset} />}
      </div>

      <Footer />
    </div>
  );
}

function Header({ state, cps, mps, repColor, engColor }: { state: any; cps: number; mps: number; repColor: string; engColor: string }) {
  return (
    <div className="px-4 pt-4 pb-3 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src="/promora-logo.png" alt="Promora" className="w-8 h-8 rounded-lg" />
          <div>
            <h1 className="font-bold text-sm leading-none">Reklamowy Tycoon</h1>
            {state.prestige > 0 && <span className="text-xs prestige-text font-medium">✨ Prestiż {state.prestige}</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Zarobki/s</p>
          <p className="coin-text font-bold text-sm">{formatNumber(cps)} 💰</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Monety</p>
          <p className="coin-text font-bold text-lg">{formatNumber(state.coins)}</p>
          <p className="text-xs text-muted-foreground">+{formatNumber(cps)}/s</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Memberowie</p>
          <p className="member-text font-bold text-lg">{formatNumber(state.members)}</p>
          <p className="text-xs text-muted-foreground">+{formatNumber(mps)}/s</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Reputacja</p>
            <p className="text-xs font-bold" style={{ color: repColor }}>{state.reputation.toFixed(0)}%</p>
          </div>
          <div className="progress-bar mt-1">
            <div className="progress-fill" style={{ width: `${state.reputation}%`, background: repColor }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Engagement</p>
            <p className="text-xs font-bold" style={{ color: engColor }}>{state.engagement.toFixed(0)}%</p>
          </div>
          <div className="progress-bar mt-1">
            <div className="progress-fill" style={{ width: `${state.engagement}%`, background: engColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ClickTab({ game, handleClick, floats, prestigeProgress, canPrestige }: any) {
  const { state } = game;
  return (
    <div className="space-y-4">
      <div className="relative flex justify-center">
        <button
          onClick={handleClick}
          className="relative w-44 h-44 rounded-full bg-gradient-to-br from-primary to-accent font-bold text-white text-6xl transition-all duration-100 active:scale-95 pulse-glow cursor-pointer shadow-2xl"
          style={{ boxShadow: "0 0 40px hsl(237 62% 60% / 0.4), 0 10px 40px rgba(0,0,0,0.5)" }}
        >
          📢
          {floats.map((f: FloatText) => (
            <span key={f.id} className="click-float absolute text-sm font-bold coin-text pointer-events-none" style={{ left: f.x, top: f.y }}>
              {f.text}
            </span>
          ))}
        </button>
      </div>

      <div className="card-gradient rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progres do Prestiżu</span>
          <span className="prestige-text font-bold">{formatNumber(state.members)} / 1M</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill bg-gradient-to-r from-purple-600 to-blue-500" style={{ width: `${prestigeProgress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground text-center">{prestigeProgress.toFixed(1)}% do prestiżu</p>
      </div>

      {canPrestige && (
        <button onClick={game.doPrestige} className="btn-prestige w-full py-4 text-lg prestige-pulse">
          🔮 PRESTIŻ! (+20% trwały bonus)
        </button>
      )}

      <div className="card-gradient rounded-xl p-4">
        <h3 className="font-bold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Ostatnie logi</h3>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {state.recentLogs.length === 0 && <p className="text-xs text-muted-foreground">Klikaj by zarabiać!</p>}
          {state.recentLogs.slice(0, 10).map((log: any) => (
            <div key={log.id} className="text-xs text-muted-foreground flex gap-2">
              <span className={log.type === "success" ? "text-green-400" : log.type === "warning" ? "text-yellow-400" : "text-blue-400"}>
                {log.type === "success" ? "✓" : log.type === "warning" ? "!" : "·"}
              </span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-gradient rounded-xl p-4">
        <h3 className="font-bold mb-2 text-sm">💡 Jak grać?</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Kup reklamy → rosną członkowie → rosną zarobki</li>
          <li>• Reputacja wzmacnia zarobki (do 3× przy 100%)</li>
          <li>• Engagement wpływa na dochód — utrzymuj go przez eventy</li>
          <li>• Prestiż przy 1M memberów → reset + trwały bonus +20%</li>
          <li>• {state.legacyBonus > 0 && <strong className="prestige-text">Bonus dziedzictwa: +{(state.legacyBonus * 100).toFixed(0)}%</strong>}</li>
        </ul>
      </div>
    </div>
  );
}

function AdsTab({ game }: { game: ReturnType<typeof useGame> }) {
  const { state } = game;
  const cheap = state.prestigeUpgrades.cheap_ads || 0;
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Reklamy generują memberów/s. Możesz kupować wielokrotnie!</p>
      {Object.entries(AD_CONFIGS).map(([key, cfg]) => {
        const amount = state.ads[key as keyof typeof state.ads];
        const cost1 = getAdCost(key, amount, cheap);
        const cost10 = Array.from({ length: 10 }, (_, i) => getAdCost(key, amount + i, cheap)).reduce((a, b) => a + b, 0);
        const canBuy1 = state.coins >= cost1;
        const canBuy10 = state.coins >= cost10;
        return (
          <div key={key} className="item-card">
            <span className="text-2xl">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{cfg.name}</p>
                <span className="text-xs member-text font-bold">{amount > 0 ? `×${amount}` : ""}</span>
              </div>
              <p className="text-xs text-muted-foreground">+{cfg.membersPerSec}/s na szt.</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => game.buyAd(key, 1)} disabled={!canBuy1} className="btn-primary text-xs px-3 py-1.5 flex-1">
                  ×1 — {formatNumber(cost1)} 💰
                </button>
                <button onClick={() => game.buyAd(key, 10)} disabled={!canBuy10} className="btn-secondary text-xs px-3 py-1.5 flex-1">
                  ×10 — {formatNumber(cost10)} 💰
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BotsTab({ game }: { game: ReturnType<typeof useGame> }) {
  const { state } = game;
  const discountPct = (state.prestigeUpgrades.cheap_bots || 0) * 25;
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Boty dają stałe bonusy. Każdy bot można kupić raz.{discountPct > 0 && ` 💸 Zniżka ${discountPct}%`}</p>
      {Object.entries(BOT_CONFIGS).map(([key, cfg]) => {
        const owned = state.bots[key as keyof typeof state.bots];
        const price = cfg.price * (1 - (state.prestigeUpgrades.cheap_bots || 0) * 0.25);
        const canBuy = state.coins >= price && !owned;
        return (
          <div key={key} className={`item-card ${owned ? "item-card-owned" : ""}`}>
            <span className="text-2xl">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{cfg.name}</p>
                {owned && <span className="text-xs text-green-400 font-bold">✓ Aktywny</span>}
              </div>
              <p className="text-xs text-muted-foreground">{cfg.description}</p>
              {!owned && (
                <button onClick={() => game.buyBot(key)} disabled={!canBuy} className="btn-primary text-xs px-3 py-1.5 mt-2">
                  {formatNumber(price)} 💰
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChannelsTab({ game }: { game: ReturnType<typeof useGame> }) {
  const { state } = game;
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Kanały odblokują pasywne bonusy na stałe.</p>
      {Object.entries(CHANNEL_CONFIGS).map(([key, cfg]) => {
        const owned = state.channels[key as keyof typeof state.channels];
        const canBuy = state.coins >= cfg.price && !owned;
        return (
          <div key={key} className={`item-card ${owned ? "item-card-owned" : ""}`}>
            <span className="text-2xl">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{cfg.name}</p>
                {owned && <span className="text-xs text-green-400 font-bold">✓ Aktywny</span>}
              </div>
              <p className="text-xs text-muted-foreground">{cfg.description}</p>
              {!owned && (
                <button onClick={() => game.buyChannel(key)} disabled={!canBuy} className="btn-primary text-xs px-3 py-1.5 mt-2">
                  {formatNumber(cfg.price)} 💰
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div className="mt-4">
        <h3 className="font-bold text-sm text-muted-foreground mb-2">MODERATORZY</h3>
        {Object.entries(MOD_CONFIGS).map(([key, cfg]) => {
          const owned = state.moderators[key as keyof typeof state.moderators];
          const canBuy = state.coins >= cfg.price && !owned;
          return (
            <div key={key} className={`item-card mb-2 ${owned ? "item-card-owned" : ""}`}>
              <span className="text-2xl">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{cfg.name}</p>
                  {owned && <span className="text-xs text-green-400 font-bold">✓ Aktywny</span>}
                </div>
                <p className="text-xs text-muted-foreground">{cfg.description}</p>
                {!owned && (
                  <button onClick={() => game.buyMod(key)} disabled={!canBuy} className="btn-primary text-xs px-3 py-1.5 mt-2">
                    {formatNumber(cfg.price)} 💰
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UpgradesTab({ game }: { game: ReturnType<typeof useGame> }) {
  const { state } = game;
  const upgradeInfo = [
    { key: "marketing", label: "Marketing", icon: "📈", desc: "Zwiększa wzrost memberów" },
    { key: "income", label: "Zarobki", icon: "💰", desc: "Zwiększa przychody z monet" },
    { key: "reputation", label: "Reputacja", icon: "⭐", desc: "Zwiększa max reputacji i jej przyrost" },
  ];
  return (
    <div className="space-y-4">
      {upgradeInfo.map(({ key, label, icon, desc }) => {
        const cur = state.upgrades[key as keyof typeof state.upgrades];
        const levels = UPGRADE_LEVELS[key];
        const nextLvl = cur < levels.length ? levels[cur] : null;
        const maxed = cur >= levels.length;
        return (
          <div key={key} className="card-gradient rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="font-bold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${maxed ? "coin-text" : "prestige-text"}`}>
                {maxed ? "MAX ✓" : `Poz. ${cur}/${levels.length}`}
              </span>
            </div>
            <div className="progress-bar mb-2">
              <div className="progress-fill bg-gradient-to-r from-primary to-accent" style={{ width: `${(cur / levels.length) * 100}%` }} />
            </div>
            {!maxed && nextLvl && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Następny: +{nextLvl.bonus < 1 ? `${(nextLvl.bonus * 100).toFixed(0)}%` : nextLvl.bonus.toFixed(1)}</p>
                <button onClick={() => game.buyUpgrade(key)} disabled={state.coins < nextLvl.price} className="btn-primary text-xs px-4 py-1.5">
                  {formatNumber(nextLvl.price)} 💰
                </button>
              </div>
            )}
            {maxed && <p className="text-xs text-green-400 text-center">Pełne ulepszenie!</p>}
          </div>
        );
      })}
    </div>
  );
}

function EventsTab({ game }: { game: ReturnType<typeof useGame> }) {
  const { state } = game;
  const now = Date.now();
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Eventy dają jednorazowe nagrody, memberów i engagement. Mają cooldown!</p>
      {Object.entries(EVENT_CONFIGS).map(([key, cfg]) => {
        const lastUsed = state.eventCooldowns[key as keyof typeof state.eventCooldowns] || 0;
        const cooldownMs = state.prestigeUpgrades.more_events ? cfg.cooldownMs / 2 : cfg.cooldownMs;
        const elapsed = now - lastUsed;
        const ready = elapsed >= cooldownMs;
        const remaining = Math.max(0, cooldownMs - elapsed);
        const remainingSec = Math.ceil(remaining / 1000);
        const canAfford = state.coins >= cfg.cost;
        let reward = cfg.reward;
        if (state.bots.giveaway) reward = Math.floor(reward * 1.5);
        return (
          <div key={key} className={`item-card ${!ready ? "opacity-60" : ""}`}>
            <span className="text-2xl">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-sm">{cfg.name}</p>
                <div className="text-right">
                  <p className="text-xs coin-text font-bold">+{formatNumber(reward)} 💰</p>
                  <p className="text-xs member-text">+{formatNumber(cfg.membersBonus)} 👥</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">+{cfg.repBonus} rep · +{cfg.engagementBonus}% eng · Koszt: {formatNumber(cfg.cost)}</p>
              {ready ? (
                <button onClick={() => game.triggerEvent(key)} disabled={!canAfford} className="btn-gold text-xs px-3 py-1.5 mt-2">
                  Organizuj! ({formatNumber(cfg.cost)} 💰)
                </button>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  ⏳ Cooldown: {remainingSec >= 3600 ? `${Math.floor(remainingSec / 3600)}h ${Math.floor((remainingSec % 3600) / 60)}m` : remainingSec >= 60 ? `${Math.floor(remainingSec / 60)}m ${remainingSec % 60}s` : `${remainingSec}s`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PartnersTab({ game }: { game: ReturnType<typeof useGame> }) {
  const { state } = game;
  return (
    <div className="space-y-3">
      <div className="stat-card">
        <p className="text-xs text-muted-foreground">Aktywne partnerstwa</p>
        <p className="font-bold text-lg">{state.partnerships.length} / {game.maxPartnerships}</p>
      </div>
      {state.partnerships.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-muted-foreground">AKTYWNI PARTNERZY</h3>
          {state.partnerships.map(p => (
            <div key={p.id} className="item-card item-card-owned">
              <span className="text-2xl">🤝</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  +{(p.bonus * 100).toFixed(1)}% zarobki · +{(p.membersBonus * 100).toFixed(1)}% marketing · +{p.reputationBonus.toFixed(1)} rep/min
                </p>
              </div>
              <span className="text-green-400 text-sm">✓</span>
            </div>
          ))}
        </div>
      )}
      {state.partnerships.length === 0 && state.pendingPartnerships.length === 0 && (
        <div className="card-gradient rounded-xl p-6 text-center">
          <p className="text-4xl mb-2">🌐</p>
          <p className="font-semibold">Brak ofert</p>
          <p className="text-sm text-muted-foreground">Oferty partnerskie pojawiają się co jakiś czas. Sprawdź tu co 1-2 minuty!</p>
        </div>
      )}
      {state.pendingPartnerships.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-muted-foreground">OCZEKUJĄCE OFERTY</h3>
          {state.pendingPartnerships.map(p => (
            <div key={p.id} className="item-card border-primary/30">
              <span className="text-2xl">🤝</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">+{(p.bonus * 100).toFixed(1)}% zarobki · +{(p.membersBonus * 100).toFixed(1)}% marketing</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => game.acceptPartner(p.id)} disabled={state.partnerships.length >= game.maxPartnerships} className="btn-primary text-xs px-3 py-1.5 flex-1">Akceptuj</button>
                  <button onClick={() => game.declinePartner(p.id)} className="btn-secondary text-xs px-3 py-1.5 flex-1">Odrzuć</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrestigeTab({ game }: { game: ReturnType<typeof useGame> }) {
  const { state } = game;
  const canPrestige = state.members >= 1000000;
  return (
    <div className="space-y-4">
      <div className="card-gradient rounded-xl p-4 text-center">
        <p className="text-5xl mb-2">🔮</p>
        <p className="font-bold text-lg">Prestiż {state.prestige}</p>
        <p className="text-sm text-muted-foreground">Punkty prestiżu: <strong className="prestige-text">{state.prestigePoints}</strong></p>
        {state.legacyBonus > 0 && (
          <p className="text-sm text-yellow-400 font-bold mt-1">👑 Bonus dziedzictwa: +{(state.legacyBonus * 100).toFixed(0)}%</p>
        )}
      </div>

      <div className="card-gradient rounded-xl p-4">
        <p className="text-sm font-semibold mb-1">Co daje Prestiż?</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• +20% trwały bonus zarobków i marketingu (na zawsze)</li>
          <li>• +1 punkt prestiżu do wydania na ulepszenia</li>
          <li>• Reset monet, memberów i zakupów (nie znikają ulepszenia prestiżu)</li>
          <li>• Wymagane: 1 000 000 memberów</li>
        </ul>
        <button
          onClick={game.doPrestige}
          disabled={!canPrestige}
          className={`${canPrestige ? "btn-prestige prestige-pulse" : "btn-secondary opacity-50 cursor-not-allowed"} w-full mt-3 py-3 font-bold`}
        >
          {canPrestige ? "🔮 WYKONAJ PRESTIŻ!" : `🔒 Potrzebujesz ${formatNumber(1000000 - state.members)} więcej memberów`}
        </button>
      </div>

      {state.prestigePoints > 0 && (
        <div>
          <h3 className="font-bold text-sm text-muted-foreground mb-2">ULEPSZENIA PRESTIŻU ({state.prestigePoints} pkt)</h3>
          <div className="space-y-2">
            {Object.entries(PRESTIGE_UPGRADES).map(([key, cfg]) => {
              const cur = state.prestigeUpgrades[key as keyof typeof state.prestigeUpgrades] || 0;
              const maxed = cur >= cfg.maxLevel;
              return (
                <div key={key} className={`item-card ${maxed ? "item-card-owned" : ""}`}>
                  <span className="text-2xl">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm">{cfg.name}</p>
                      <span className="text-xs prestige-text">{cur}/{cfg.maxLevel}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cfg.description}</p>
                    {!maxed && state.prestigePoints >= 1 && (
                      <button onClick={() => game.buyPrestigeUpgrade(key)} className="btn-prestige text-xs px-3 py-1.5 mt-2">
                        Kup (1 pkt)
                      </button>
                    )}
                    {maxed && <p className="text-xs text-green-400 mt-1">✓ Maksymalny poziom</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {state.prestigePoints === 0 && state.prestige === 0 && (
        <div className="card-gradient rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">Zdobędź 1 000 000 memberów i wykonaj prestiż, żeby odblokować specjalne ulepszenia!</p>
        </div>
      )}
    </div>
  );
}

function AchievementsTab({ game }: { game: ReturnType<typeof useGame> }) {
  const { state } = game;
  const unlocked = ACHIEVEMENTS.filter(a => state.achievements[a.id]);
  const locked = ACHIEVEMENTS.filter(a => !state.achievements[a.id]);
  const missionsUnlocked = MISSIONS.filter(m => state.missions[m.id]);
  const missionsLocked = MISSIONS.filter(m => !state.missions[m.id]);

  return (
    <div className="space-y-4">
      <div className="stat-card">
        <p className="text-xs text-muted-foreground">Ukończone osiągnięcia</p>
        <p className="font-bold text-lg">{unlocked.length} / {ACHIEVEMENTS.length}</p>
      </div>
      <div>
        <h3 className="font-bold text-sm text-muted-foreground mb-2">OSIĄGNIĘCIA</h3>
        <div className="space-y-2">
          {unlocked.map(a => (
            <div key={a.id} className="item-card item-card-owned">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.description}{a.reward > 0 && ` (+${formatNumber(a.reward)} 💰)`}</p>
              </div>
              <span className="text-green-400">✓</span>
            </div>
          ))}
          {locked.map(a => (
            <div key={a.id} className="item-card opacity-50">
              <span className="text-2xl grayscale">{a.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-muted-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
              <span className="text-muted-foreground text-lg">🔒</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-sm text-muted-foreground mb-2">MISJE</h3>
        <div className="space-y-2">
          {missionsUnlocked.map(m => (
            <div key={m.id} className="item-card item-card-owned">
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.description} (+{formatNumber(m.reward)} 💰)</p>
              </div>
              <span className="text-green-400">✓</span>
            </div>
          ))}
          {missionsLocked.map(m => (
            <div key={m.id} className="item-card opacity-60">
              <span className="text-2xl grayscale">{m.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-muted-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ game, confirmReset, setConfirmReset }: { game: ReturnType<typeof useGame>; confirmReset: boolean; setConfirmReset: (v: boolean) => void }) {
  const { state } = game;
  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promora-tycoon-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          localStorage.setItem("promora_tycoon_v3", JSON.stringify(data));
          window.location.reload();
        } catch { alert("Nieprawidłowy plik!"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="card-gradient rounded-xl p-4 space-y-3">
        <h3 className="font-bold">Dźwięki</h3>
        <button onClick={game.toggleMute} className="btn-secondary w-full">
          {state.settings.soundMuted ? "🔇 Włącz dźwięki" : "🔔 Wycisz dźwięki"}
        </button>
      </div>

      <div className="card-gradient rounded-xl p-4 space-y-3">
        <h3 className="font-bold">Zapis gry</h3>
        <p className="text-xs text-muted-foreground">Gra zapisuje się automatycznie co 5 sekund.</p>
        <button onClick={handleExport} className="btn-secondary w-full">📤 Eksportuj save (JSON)</button>
        <button onClick={handleImport} className="btn-secondary w-full">📥 Importuj save (JSON)</button>
      </div>

      <div className="card-gradient rounded-xl p-4 space-y-3">
        <h3 className="font-bold">Statystyki</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Prestiże: <strong className="prestige-text">{state.prestige}×</strong></p>
          <p>• Bonus dziedzictwa: <strong className="coin-text">+{(state.legacyBonus * 100).toFixed(0)}%</strong></p>
          <p>• Partnerstwa: <strong>{state.partnerships.length}</strong></p>
          <p>• Osiągnięcia: <strong>{Object.keys(state.achievements).length}/{ACHIEVEMENTS.length}</strong></p>
          <p>• Misje: <strong>{Object.keys(state.missions).length}/{MISSIONS.length}</strong></p>
        </div>
      </div>

      <div className="card-gradient rounded-xl p-4 space-y-3 border border-destructive/30">
        <h3 className="font-bold text-destructive">Niebezpieczna strefa</h3>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="w-full py-2 rounded-lg bg-destructive/20 text-destructive font-semibold border border-destructive/30 hover:bg-destructive/30 transition-colors cursor-pointer">
            🗑️ Usuń cały postęp
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-destructive font-medium">Na pewno? To jest nieodwracalne!</p>
            <div className="flex gap-2">
              <button onClick={() => { game.resetGame(); setConfirmReset(false); }} className="flex-1 py-2 rounded-lg bg-destructive text-white font-bold cursor-pointer">Tak, usuń</button>
              <button onClick={() => setConfirmReset(false)} className="flex-1 btn-secondary">Anuluj</button>
            </div>
          </div>
        )}
      </div>

      <div className="card-gradient rounded-xl p-4 text-center space-y-2">
        <a href="https://discord.gg/f8qhJQSRA7" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition-colors cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          Dołącz do naszego Discord!
        </a>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/promora-logo.png" alt="Promora" className="w-5 h-5 rounded opacity-70" />
        <span className="text-xs text-muted-foreground">Zrobione przez <strong className="text-foreground">Promora</strong></span>
      </div>
      <a href="https://discord.gg/f8qhJQSRA7" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-[#5865F2] hover:text-[#7289da] font-medium transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
        </svg>
        Discord
      </a>
    </div>
  );
}
