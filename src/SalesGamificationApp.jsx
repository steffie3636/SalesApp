import { useState, useEffect } from "react";

// ─── Point rules ────────────────────────────────────────────────────────────
const PTS_PER_CHF        = 0.02;
const PTS_PER_NEW_CLIENT = 150;
const PTS_PER_CALL       = 5;

function calcPoints(revenue, newClients, calls) {
  return Math.round(revenue * PTS_PER_CHF + newClients * PTS_PER_NEW_CLIENT + calls * PTS_PER_CALL);
}
function calcLevel(points) { return Math.max(1, Math.floor(points / 1000) + 1); }

// ─── Seed data ───────────────────────────────────────────────────────────────
const SEED_TEAM = [
  { id: 1, name: "Sarah Meier",   avatar: "SM", revenue: 142000, newClients: 8,  calls: 94,  badges: ["🔥","💎","🎯"], streak: 7  },
  { id: 2, name: "Lukas Braun",   avatar: "LB", revenue: 118500, newClients: 6,  calls: 87,  badges: ["⚡","🎯"],      streak: 3  },
  { id: 3, name: "Nina Vogel",    avatar: "NV", revenue: 97200,  newClients: 11, calls: 102, badges: ["🌟","🏆"],      streak: 12 },
  { id: 4, name: "Max Fischer",   avatar: "MF", revenue: 203000, newClients: 5,  calls: 61,  badges: ["💎","🔥","🚀","🏆"], streak: 5 },
  { id: 5, name: "Lea Hoffmann",  avatar: "LH", revenue: 76400,  newClients: 9,  calls: 78,  badges: ["⚡"],           streak: 2  },
  { id: 6, name: "Tom Richter",   avatar: "TR", revenue: 88900,  newClients: 4,  calls: 55,  badges: ["🎯"],           streak: 1  },
].map(p => ({ ...p, points: calcPoints(p.revenue, p.newClients, p.calls), level: calcLevel(calcPoints(p.revenue, p.newClients, p.calls)) }));

const SEED_CHALLENGES = [
  { id: 1, title: "Deal Crusher",   desc: "Schliesse 5 Deals diese Woche ab",    reward: 500,  progress: 3,     total: 5,     icon: "🤝", deadline: "3 Tage", color: "#f59e0b" },
  { id: 2, title: "Cold Call King", desc: "Erreiche 100 Anrufe diesen Monat",     reward: 800,  progress: 87,    total: 100,   icon: "📞", deadline: "8 Tage", color: "#06b6d4" },
  { id: 3, title: "New Blood",      desc: "Gewinne 3 Neukunden diese Woche",      reward: 1200, progress: 1,     total: 3,     icon: "🌱", deadline: "3 Tage", color: "#10b981" },
  { id: 4, title: "Revenue Rocket", desc: "Erziele CHF 50k Umsatz in 2 Wochen",  reward: 2000, progress: 31000, total: 50000, icon: "🚀", deadline: "6 Tage", color: "#a855f7" },
];

const SEED_BADGES = [
  { icon: "🔥", name: "On Fire",      desc: "5 Tage Streak",         color: "#f97316", image: null },
  { icon: "💎", name: "Diamond",      desc: "CHF 100k+ Umsatz",      color: "#818cf8", image: null },
  { icon: "🎯", name: "Sharpshooter", desc: "80%+ Abschlussrate",    color: "#ef4444", image: null },
  { icon: "⚡", name: "Speed Demon",  desc: "10 Deals in einer Woche",color: "#facc15", image: null },
  { icon: "🌟", name: "Rising Star",  desc: "Bester Newcomer",       color: "#fbbf24", image: null },
  { icon: "🏆", name: "Champion",     desc: "Platz 1 Monatsranking", color: "#f59e0b", image: null },
  { icon: "🚀", name: "Rocket",       desc: "CHF 200k+ Umsatz",      color: "#6366f1", image: null },
  { icon: "🌱", name: "New Blood",    desc: "5 Neukunden gewonnen",  color: "#22c55e", image: null },
];

const MONTHS = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

const SEED_TARGETS = {
  year: 2025,
  beNeukunden: 500000,
  anzNeukunden: 50,
  beTotal: 2000000,
};

const TARGET_CATS = [
  { key: "beNeukunden", label: "BE Neukunden", icon: "🌱", color: "#10b981", unit: "CHF" },
  { key: "anzNeukunden", label: "Anz. Neukunden", icon: "👥", color: "#6366f1", unit: "" },
  { key: "beTotal", label: "BE Total", icon: "💰", color: "#f59e0b", unit: "CHF" },
];

const CHALLENGE_ICONS  = ["🤝","📞","🌱","🚀","💰","🎯","⚡","🔥","🏆","📈"];
const CHALLENGE_COLORS = ["#f59e0b","#06b6d4","#10b981","#a855f7","#6366f1","#ef4444","#f97316","#22c55e","#ec4899","#8b5cf6"];
const MAIN_TABS = ["Leaderboard","Challenges","Achievements","Mein Profil","Ziele"];

// ─── Shared primitives ───────────────────────────────────────────────────────
function useCountUp(target, dur = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = target / (dur / 16);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setV(Math.floor(cur));
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return v;
}

function Avatar({ initials, size = 44 }) {
  const COLS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444"];
  const bg = COLS[(initials.charCodeAt(0) + (initials[1] ? initials.charCodeAt(1) : 0)) % COLS.length];
  const fontSize = initials.length > 2 ? size * 0.28 : size * 0.35;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg,${bg}dd,${bg}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize, color: "#fff",
      boxShadow: `0 0 0 2px ${bg}44`, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function BadgeDisplay({ icon, allBadges, size = 24 }) {
  const badge = allBadges && allBadges.find(b => b.icon === icon);
  if (badge && badge.image) {
    return <img src={badge.image} alt={badge.name || icon} style={{ width: size, height: size, borderRadius: 4, objectFit: "cover" }} />;
  }
  return <span style={{ fontSize: size * 0.75 }}>{icon}</span>;
}

function RankBadge({ rank }) {
  const S = {
    1: { bg: "linear-gradient(135deg,#fbbf24,#f59e0b)", c: "#1a0a00" },
    2: { bg: "linear-gradient(135deg,#d1d5db,#9ca3af)", c: "#111" },
    3: { bg: "linear-gradient(135deg,#cd7c2e,#92400e)", c: "#fff" },
  };
  const s = S[rank] || { bg: "rgba(255,255,255,0.07)", c: "#94a3b8" };
  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, color: s.c,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Mono',monospace", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
      {rank}
    </div>
  );
}

function ProgressBar({ value, max, color = "#6366f1", height = 6 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 99, height, overflow: "hidden", width: "100%" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99,
        background: `linear-gradient(90deg,${color}cc,${color})`,
        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `0 0 8px ${color}88` }} />
    </div>
  );
}

function StatCard({ label, value, unit = "", color = "#6366f1", icon }) {
  const a = useCountUp(typeof value === "number" ? value : 0, 900);
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8,
      position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 16px 0 80px", background: `${color}18` }} />
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 26, fontWeight: 700, color: "#f1f5f9" }}>
        {unit === "CHF" ? `CHF ${a.toLocaleString("de-CH")}` : `${a.toLocaleString("de-CH")}${unit}`}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
  padding: "10px 14px", color: "#f1f5f9", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", width: "100%",
};
const selectStyle = { ...inputStyle, cursor: "pointer" };

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 999,
      background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff",
      borderRadius: 14, padding: "14px 22px", fontWeight: 700, fontSize: 14,
      boxShadow: "0 8px 32px #10b98144", animation: "fadeIn 0.3s ease" }}>
      ✓ {msg}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", padding: 16 }}>
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 32,
        width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", animation: "fadeIn 0.25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#f1f5f9" }}>{title}</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8,
            width: 32, height: 32, color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── MAIN TABS ───────────────────────────────────────────────────────────────
function LeaderboardTab({ team, sortKey, setSortKey, allBadges }) {
  const sorted = [...team].sort((a, b) => b[sortKey] - a[sortKey]);
  const keys = [{ key: "points", label: "Punkte" }, { key: "revenue", label: "Umsatz" }, { key: "newClients", label: "Neukunden" }];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {keys.map(k => (
          <button key={k.key} onClick={() => setSortKey(k.key)} style={{
            padding: "8px 18px", borderRadius: 99, border: "1px solid",
            borderColor: sortKey === k.key ? "#6366f1" : "rgba(255,255,255,0.1)",
            background: sortKey === k.key ? "rgba(99,102,241,0.2)" : "transparent",
            color: sortKey === k.key ? "#a5b4fc" : "#64748b",
            fontFamily: "'DM Mono',monospace", fontSize: 13, cursor: "pointer",
          }}>{k.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((p, i) => (
          <div key={p.id} style={{
            background: i === 0 ? "linear-gradient(135deg,rgba(251,191,36,0.08),rgba(99,102,241,0.05))" : "rgba(255,255,255,0.03)",
            border: `1px solid ${i === 0 ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
            animation: `fadeIn 0.4s ease ${i * 0.06}s both`,
          }}>
            <RankBadge rank={i + 1} />
            <Avatar initials={p.avatar} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>{p.name}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", color: "#a5b4fc", fontWeight: 700, fontSize: 16 }}>
                  {sortKey === "revenue" ? `CHF ${p.revenue.toLocaleString("de-CH")}` : sortKey === "newClients" ? `${p.newClients} Neukunden` : `${p.points.toLocaleString()} pts`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <ProgressBar
                  value={sortKey === "revenue" ? p.revenue : sortKey === "newClients" ? p.newClients : p.points}
                  max={sortKey === "revenue" ? 250000 : sortKey === "newClients" ? 15 : 7000}
                  color={i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c2e" : "#6366f1"} />
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>{p.badges.slice(0, 3).map((b, bi) => <span key={bi}><BadgeDisplay icon={b} allBadges={allBadges} size={20} /></span>)}</div>
              </div>
            </div>
            {p.streak > 4 && (
              <div style={{ background: "linear-gradient(135deg,#f97316,#ef4444)", borderRadius: 8, padding: "4px 10px",
                fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                🔥 {p.streak}d
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengesTab({ challenges }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
      {challenges.map((c, i) => {
        const pct = Math.round((c.progress / c.total) * 100);
        return (
          <div key={c.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}33`,
            borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16,
            position: "relative", overflow: "hidden", animation: `fadeIn 0.5s ease ${i * 0.1}s both` }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `${c.color}15` }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${c.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `1px solid ${c.color}44` }}>{c.icon}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'DM Mono',monospace", color: c.color, fontWeight: 700, fontSize: 18 }}>+{c.reward} pts</div>
                <div style={{ fontSize: 12, color: "#475569" }}>⏱ {c.deadline}</div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 17, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{c.desc}</div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#475569" }}>Fortschritt</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: c.color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <ProgressBar value={c.progress} max={c.total} color={c.color} height={8} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "#334155" }}>{c.total > 1000 ? `CHF ${c.progress.toLocaleString("de-CH")}` : c.progress}</span>
                <span style={{ fontSize: 11, color: "#334155" }}>{c.total > 1000 ? `CHF ${c.total.toLocaleString("de-CH")}` : c.total}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AchievementsTab({ team, allBadges }) {
  const earned = new Set(team.flatMap(p => p.badges));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Alle Abzeichen</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {allBadges.map((b, i) => {
            const ok = earned.has(b.icon);
            return (
              <div key={i} style={{ background: ok ? `${b.color}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${ok ? b.color + "40" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, opacity: ok ? 1 : 0.4 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: ok ? `${b.color}20` : "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, filter: ok ? "none" : "grayscale(1)" }}>
                  {b.image ? <img src={b.image} alt={b.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} /> : b.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: ok ? "#f1f5f9" : "#334155", fontSize: 14 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Top Performer</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[...team].sort((a, b) => b.points - a.points).slice(0, 3).map(p => (
            <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flex: "1 1 200px" }}>
              <Avatar initials={p.avatar} size={40} />
              <div>
                <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>{p.badges.map((b, bi) => <span key={bi}><BadgeDisplay icon={b} allBadges={allBadges} size={18} /></span>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ team, allBadges }) {
  const me = team[0];
  const rank = [...team].sort((a, b) => b.points - a.points).findIndex(p => p.id === me.id) + 1;
  const kpis = [
    { label: "Umsatz Ziel",      value: me.revenue,    max: 200000, unit: "CHF",      color: "#6366f1" },
    { label: "Neukunden Ziel",   value: me.newClients, max: 12,     unit: "",          color: "#10b981" },
    { label: "Aktivitäten Ziel", value: me.calls,      max: 120,    unit: " Anrufe",   color: "#f59e0b" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))",
        border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24, padding: 28,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Avatar initials={me.avatar} size={72} />
          <div style={{ position: "absolute", bottom: -4, right: -4,
            background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 8, padding: "2px 7px",
            fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 700, color: "#fff" }}>Lv.{me.level}</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>{me.name}</div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>Sales Executive · Rang #{rank}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {me.badges.map((b, i) => <span key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px", fontSize: 16, display: "inline-flex", alignItems: "center" }}><BadgeDisplay icon={b} allBadges={allBadges} size={22} /></span>)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 32, fontWeight: 800, color: "#a5b4fc" }}>{me.points.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>Gesamtpunkte</div>
          <div style={{ marginTop: 8, fontFamily: "'DM Mono',monospace", color: "#f97316", fontSize: 14, fontWeight: 700 }}>🔥 {me.streak} Tage Streak</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Meine KPI Ziele</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 600, color: "#cbd5e1", fontSize: 14 }}>{k.label}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", color: k.color, fontWeight: 700 }}>
                  {k.unit === "CHF" ? `CHF ${k.value.toLocaleString("de-CH")}` : `${k.value}${k.unit}`}
                  <span style={{ color: "#334155" }}> / {k.unit === "CHF" ? `CHF ${k.max.toLocaleString("de-CH")}` : `${k.max}${k.unit}`}</span>
                </span>
              </div>
              <ProgressBar value={k.value} max={k.max} color={k.color} height={10} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
        <StatCard label="Umsatz"    value={me.revenue}    unit="CHF"     color="#6366f1" icon="💰" />
        <StatCard label="Neukunden" value={me.newClients} unit=" Kunden" color="#10b981" icon="🌱" />
        <StatCard label="Anrufe"    value={me.calls}      unit=""        color="#f59e0b" icon="📞" />
        <StatCard label="Punkte"    value={me.points}     unit=""        color="#a855f7" icon="⭐" />
      </div>
    </div>
  );
}

// ─── TARGETS TAB ─────────────────────────────────────────────────────────────
function TargetsTab({ team, targets, monthlyData }) {
  function getPlayerTotals(playerId) {
    const data = monthlyData[playerId] || {};
    let beNeukunden = 0, anzNeukunden = 0, beTotal = 0;
    for (const m of Object.values(data)) {
      beNeukunden += m.beNeukunden || 0;
      anzNeukunden += m.anzNeukunden || 0;
      beTotal += m.beTotal || 0;
    }
    return { beNeukunden, anzNeukunden, beTotal };
  }

  const teamTotals = team.reduce((acc, p) => {
    const t = getPlayerTotals(p.id);
    return { beNeukunden: acc.beNeukunden + t.beNeukunden, anzNeukunden: acc.anzNeukunden + t.anzNeukunden, beTotal: acc.beTotal + t.beTotal };
  }, { beNeukunden: 0, anzNeukunden: 0, beTotal: 0 });

  function fmt(val, unit) { return unit === "CHF" ? `CHF ${val.toLocaleString("de-CH")}` : val.toLocaleString("de-CH"); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ fontSize: 13, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
        Jahresziele {targets.year}
      </div>

      {/* Team summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {TARGET_CATS.map(c => {
          const actual = teamTotals[c.key];
          const target = targets[c.key] || 0;
          const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
          return (
            <div key={c.key} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}33`, borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `${c.color}15` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>Team Total</div>
                </div>
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 24, fontWeight: 800, color: c.color, marginBottom: 4 }}>
                {fmt(actual, c.unit)}
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>
                Ziel: {fmt(target, c.unit)} · <span style={{ color: pct >= 100 ? "#10b981" : c.color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <ProgressBar value={actual} max={target || 1} color={c.color} height={8} />
            </div>
          );
        })}
      </div>

      {/* Per player breakdown */}
      <div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Fortschritt pro Spieler</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {team.map(p => {
            const t = getPlayerTotals(p.id);
            const filledMonths = Object.keys(monthlyData[p.id] || {}).length;
            return (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <Avatar initials={p.avatar} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#334155" }}>{filledMonths}/12 Monate erfasst</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {TARGET_CATS.map(c => {
                    const val = t[c.key];
                    const target = targets[c.key] || 0;
                    const playerShare = team.length > 0 ? target / team.length : 0;
                    const pct = playerShare > 0 ? Math.round((val / playerShare) * 100) : 0;
                    return (
                      <div key={c.key}>
                        <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontFamily: "'DM Mono',monospace", color: c.color, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                          {fmt(val, c.unit)}
                        </div>
                        <ProgressBar value={val} max={playerShare || 1} color={c.color} height={4} />
                        <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>{pct}% von {fmt(Math.round(playerShare), c.unit)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
function AdminPanel({ team, setTeam, challenges, setChallenges, allBadges, setAllBadges, targets, setTargets, monthlyData, setMonthlyData, onToast }) {
  const [adminTab, setAdminTab] = useState(0);
  const ADMIN_TABS = ["📊 Deal erfassen","👤 Spieler","🏆 Challenges","🎖 Badges","📈 Ziele"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ADMIN_TABS.map((t, i) => (
          <button key={i} onClick={() => setAdminTab(i)} style={{
            padding: "9px 18px", borderRadius: 10, border: "1px solid",
            borderColor: adminTab === i ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
            background: adminTab === i ? "rgba(239,68,68,0.15)" : "transparent",
            color: adminTab === i ? "#fca5a5" : "#64748b",
            fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>{t}</button>
        ))}
      </div>
      {adminTab === 0 && <DealEntry      team={team} setTeam={setTeam} onToast={onToast} />}
      {adminTab === 1 && <PlayerMgmt     team={team} setTeam={setTeam} onToast={onToast} />}
      {adminTab === 2 && <ChallengeMgmt  challenges={challenges} setChallenges={setChallenges} onToast={onToast} />}
      {adminTab === 3 && <BadgeMgmt      team={team} setTeam={setTeam} allBadges={allBadges} setAllBadges={setAllBadges} onToast={onToast} />}
      {adminTab === 4 && <TargetMgmt     team={team} targets={targets} setTargets={setTargets} monthlyData={monthlyData} setMonthlyData={setMonthlyData} onToast={onToast} />}
    </div>
  );
}

// ── Deal Entry ────────────────────────────────────────────────────────────────
function DealEntry({ team, setTeam, onToast }) {
  const empty = { playerId: "", revenue: "", newClients: "", calls: "" };
  const [form, setForm] = useState(empty);
  const [log,  setLog]  = useState([]);

  function submit() {
    const p = team.find(x => x.id === Number(form.playerId));
    if (!p) return;
    const rev  = Number(form.revenue)    || 0;
    const nc   = Number(form.newClients) || 0;
    const cl   = Number(form.calls)      || 0;
    const gain = calcPoints(rev, nc, cl);

    setTeam(prev => prev.map(x => {
      if (x.id !== p.id) return x;
      const nr  = x.revenue    + rev;
      const nnc = x.newClients + nc;
      const ncl = x.calls      + cl;
      const np  = calcPoints(nr, nnc, ncl);
      return { ...x, revenue: nr, newClients: nnc, calls: ncl, points: np, level: calcLevel(np) };
    }));

    const entry = { id: Date.now(), player: p.name, rev, nc, cl, gain,
      ts: new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }) };
    setLog(l => [entry, ...l].slice(0, 10));
    onToast(`+${gain} Punkte für ${p.name}!`);
    setForm(empty);
  }

  const preview = calcPoints(Number(form.revenue) || 0, Number(form.newClients) || 0, Number(form.calls) || 0);
  const hasValues = form.revenue || form.newClients || form.calls;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 20, fontSize: 16 }}>Neue Aktivität erfassen</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
          <Field label="Verkäufer">
            <select value={form.playerId} onChange={e => setForm(f => ({ ...f, playerId: e.target.value }))} style={selectStyle}>
              <option value="">— wählen —</option>
              {team.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Umsatz (CHF)">
            <input type="number" placeholder="0" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} style={inputStyle} />
          </Field>
          <Field label="Neukunden">
            <input type="number" placeholder="0" value={form.newClients} onChange={e => setForm(f => ({ ...f, newClients: e.target.value }))} style={inputStyle} />
          </Field>
          <Field label="Anrufe">
            <input type="number" placeholder="0" value={form.calls} onChange={e => setForm(f => ({ ...f, calls: e.target.value }))} style={inputStyle} />
          </Field>
        </div>

        {hasValues && (
          <div style={{ marginTop: 16, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⭐</span>
            <span style={{ fontFamily: "'DM Mono',monospace", color: "#a5b4fc", fontWeight: 700 }}>
              +{preview} Punkte werden vergeben
            </span>
            <span style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>
              CHF×{PTS_PER_CHF} · Neukunde×{PTS_PER_NEW_CLIENT} · Anruf×{PTS_PER_CALL}
            </span>
          </div>
        )}

        <button onClick={submit} disabled={!form.playerId} style={{
          marginTop: 18, width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: form.playerId ? "linear-gradient(135deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.05)",
          color: form.playerId ? "#fff" : "#334155",
          fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15,
          cursor: form.playerId ? "pointer" : "not-allowed",
        }}>Aktivität speichern ✓</button>
      </div>

      {/* Point formula info */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px 20px", display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", alignSelf: "center" }}>Punkteformel</div>
        {[["💰 CHF Umsatz", `×${PTS_PER_CHF}`],["🌱 Neukunde", `×${PTS_PER_NEW_CLIENT}`],["📞 Anruf", `×${PTS_PER_CALL}`]].map(([l,v]) => (
          <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 13, color: "#cbd5e1" }}>{l}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", color: "#a5b4fc", fontWeight: 700 }}>{v} Punkte</div>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 20 }}>
          <div style={{ fontWeight: 700, color: "#64748b", marginBottom: 14, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" }}>Letzte Einträge dieser Session</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {log.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#334155", fontFamily: "'DM Mono',monospace" }}>{e.ts}</span>
                  <span style={{ fontWeight: 600, color: "#cbd5e1", fontSize: 14 }}>{e.player}</span>
                  <span style={{ fontSize: 12, color: "#475569" }}>
                    {e.rev > 0 && `CHF ${e.rev.toLocaleString("de-CH")} `}
                    {e.nc > 0 && `${e.nc} Neukunden `}
                    {e.cl > 0 && `${e.cl} Anrufe`}
                  </span>
                </div>
                <span style={{ fontFamily: "'DM Mono',monospace", color: "#10b981", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>+{e.gain} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Player Management ────────────────────────────────────────────────────────
function PlayerMgmt({ team, setTeam, onToast }) {
  const [modal, setModal] = useState(null);
  const empty = { name: "", avatar: "" };
  const [form, setForm]   = useState(empty);

  function openAdd()   { setForm(empty); setModal("add"); }
  function openEdit(p) { setForm({ name: p.name, avatar: p.avatar }); setModal(p); }

  function save() {
    if (!form.name.trim()) return;
    const av = (form.avatar.trim().toUpperCase().slice(0, 3)) || form.name.trim().slice(0, 3).toUpperCase();
    if (modal === "add") {
      setTeam(p => [...p, { id: Date.now(), name: form.name.trim(), avatar: av, revenue: 0, newClients: 0, calls: 0, points: 0, level: 1, badges: [], streak: 0 }]);
      onToast(`${form.name.trim()} hinzugefügt!`);
    } else {
      setTeam(p => p.map(x => x.id === modal.id ? { ...x, name: form.name.trim(), avatar: av } : x));
      onToast("Spieler aktualisiert!");
    }
    setModal(null);
  }

  function remove(id) { setTeam(p => p.filter(x => x.id !== id)); onToast("Spieler entfernt."); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Spieler hinzufügen</button>
      </div>
      {team.map(p => (
        <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar initials={p.avatar} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{p.name}</div>
            <div style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono',monospace" }}>
              Lv.{p.level} · {p.points.toLocaleString()} pts · CHF {p.revenue.toLocaleString("de-CH")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(p)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>✏️ Edit</button>
            <button onClick={() => remove(p.id)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", cursor: "pointer", fontSize: 13 }}>🗑 Remove</button>
          </div>
        </div>
      ))}
      {modal && (
        <Modal title={modal === "add" ? "Spieler hinzufügen" : "Spieler bearbeiten"} onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Name"><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Vorname Nachname" /></Field>
            <Field label="Kürzel (2–3 Buchstaben)"><input style={inputStyle} value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} placeholder="z.B. SM oder SAM" maxLength={3} /></Field>
            <button onClick={save} style={{ padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Speichern ✓</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Challenge Management ──────────────────────────────────────────────────────
function ChallengeMgmt({ challenges, setChallenges, onToast }) {
  const [modal, setModal] = useState(null);
  const emptyC = { title: "", desc: "", reward: "", total: "", deadline: "", icon: "🎯", color: "#6366f1", progress: "0" };
  const [form, setForm]   = useState(emptyC);

  function openAdd()   { setForm(emptyC); setModal("add"); }
  function openEdit(c) { setForm({ ...c, reward: String(c.reward), total: String(c.total), progress: String(c.progress) }); setModal(c); }

  function save() {
    if (!form.title.trim()) return;
    const entry = { ...form, reward: Number(form.reward), total: Number(form.total), progress: Number(form.progress) };
    if (modal === "add") {
      setChallenges(c => [...c, { ...entry, id: Date.now() }]);
      onToast("Challenge erstellt!");
    } else {
      setChallenges(c => c.map(x => x.id === modal.id ? { ...entry, id: modal.id } : x));
      onToast("Challenge aktualisiert!");
    }
    setModal(null);
  }

  function remove(id) { setChallenges(c => c.filter(x => x.id !== id)); onToast("Challenge gelöscht."); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Challenge erstellen</button>
      </div>
      {challenges.map(c => (
        <div key={c.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}33`, borderRadius: 16, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1px solid ${c.color}44`, flexShrink: 0 }}>{c.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{c.title}</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{c.desc} · +{c.reward} pts · ⏱ {c.deadline}</div>
            <ProgressBar value={c.progress} max={c.total} color={c.color} height={4} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(c)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>✏️ Edit</button>
            <button onClick={() => remove(c.id)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", cursor: "pointer", fontSize: 13 }}>🗑 Löschen</button>
          </div>
        </div>
      ))}
      {modal && (
        <Modal title={modal === "add" ? "Challenge erstellen" : "Challenge bearbeiten"} onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Titel"><input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Deal Crusher" /></Field>
            <Field label="Beschreibung"><input style={inputStyle} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Schliesse 5 Deals diese Woche ab" /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Belohnung (Punkte)"><input type="number" style={inputStyle} value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))} /></Field>
              <Field label="Deadline"><input style={inputStyle} value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} placeholder="3 Tage" /></Field>
              <Field label="Ziel (Total)"><input type="number" style={inputStyle} value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} /></Field>
              <Field label="Fortschritt"><input type="number" style={inputStyle} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} /></Field>
            </div>
            <Field label="Icon">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CHALLENGE_ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.icon === ic ? "#6366f1" : "rgba(255,255,255,0.1)"}`, background: form.icon === ic ? "rgba(99,102,241,0.2)" : "transparent", fontSize: 20, cursor: "pointer" }}>{ic}</button>
                ))}
              </div>
            </Field>
            <Field label="Farbe">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CHALLENGE_COLORS.map(col => (
                  <button key={col} onClick={() => setForm(f => ({ ...f, color: col }))} style={{ width: 32, height: 32, borderRadius: "50%", background: col, border: `3px solid ${form.color === col ? "#fff" : "transparent"}`, cursor: "pointer" }} />
                ))}
              </div>
            </Field>
            <button onClick={save} style={{ padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Speichern ✓</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Badge Management ──────────────────────────────────────────────────────────
function BadgeMgmt({ team, setTeam, allBadges, setAllBadges, onToast }) {
  const [sel, setSel] = useState({ playerId: "", badge: "" });
  const [showCreate, setShowCreate] = useState(false);
  const emptyBadge = { name: "", desc: "", color: "#6366f1", image: null, emoji: "" };
  const [newBadge, setNewBadge] = useState(emptyBadge);

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewBadge(b => ({ ...b, image: ev.target.result }));
    reader.readAsDataURL(file);
  }

  function createBadge() {
    if (!newBadge.name.trim()) return;
    if (!newBadge.image && !newBadge.emoji.trim()) { onToast("Bitte Bild hochladen oder Emoji eingeben!"); return; }
    const icon = newBadge.image ? `img_${Date.now()}` : newBadge.emoji.trim();
    if (allBadges.some(b => b.icon === icon)) { onToast("Badge existiert bereits!"); return; }
    const badge = { icon, name: newBadge.name.trim(), desc: newBadge.desc.trim(), color: newBadge.color, image: newBadge.image };
    setAllBadges(prev => [...prev, badge]);
    onToast(`Badge "${badge.name}" erstellt!`);
    setNewBadge(emptyBadge);
    setShowCreate(false);
  }

  function deleteBadge(icon) {
    setAllBadges(prev => prev.filter(b => b.icon !== icon));
    setTeam(prev => prev.map(p => ({ ...p, badges: p.badges.filter(b => b !== icon) })));
    onToast("Badge gelöscht.");
  }

  function award() {
    const p = team.find(x => x.id === Number(sel.playerId));
    if (!p || !sel.badge) return;
    if (p.badges.includes(sel.badge)) { onToast("Badge bereits vergeben!"); return; }
    setTeam(prev => prev.map(x => x.id === p.id ? { ...x, badges: [...x.badges, sel.badge] } : x));
    const badgeObj = allBadges.find(b => b.icon === sel.badge);
    onToast(`${badgeObj ? badgeObj.name : sel.badge} an ${p.name} vergeben!`);
    setSel(s => ({ ...s, badge: "" }));
  }

  function revoke(playerId, badge) {
    setTeam(prev => prev.map(x => x.id === playerId ? { ...x, badges: x.badges.filter(b => b !== badge) } : x));
    onToast("Badge entfernt.");
  }

  const canAward = sel.playerId && sel.badge;
  const BADGE_COLORS = ["#f97316","#818cf8","#ef4444","#facc15","#fbbf24","#f59e0b","#6366f1","#22c55e","#ec4899","#06b6d4"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Badge erstellen */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showCreate ? 20 : 0 }}>
          <div style={{ fontWeight: 700, color: "#f1f5f9" }}>Badges verwalten</div>
          <button onClick={() => setShowCreate(s => !s)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: showCreate ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {showCreate ? "Abbrechen" : "+ Badge erstellen"}
          </button>
        </div>
        {showCreate && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Name"><input style={inputStyle} value={newBadge.name} onChange={e => setNewBadge(b => ({ ...b, name: e.target.value }))} placeholder="z.B. Top Closer" /></Field>
              <Field label="Beschreibung"><input style={inputStyle} value={newBadge.desc} onChange={e => setNewBadge(b => ({ ...b, desc: e.target.value }))} placeholder="z.B. 90%+ Abschlussrate" /></Field>
            </div>
            <Field label="Badge-Bild hochladen">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <label style={{ padding: "10px 18px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.03)", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  📁 Bild wählen...
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
                {newBadge.image && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img src={newBadge.image} alt="Vorschau" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }} />
                    <button onClick={() => setNewBadge(b => ({ ...b, image: null }))} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, color: "#fca5a5", cursor: "pointer", padding: "4px 8px", fontSize: 11 }}>Entfernen</button>
                  </div>
                )}
              </div>
            </Field>
            {!newBadge.image && (
              <Field label="Oder Emoji eingeben">
                <input style={{ ...inputStyle, maxWidth: 80, fontSize: 22, textAlign: "center" }} value={newBadge.emoji} onChange={e => setNewBadge(b => ({ ...b, emoji: e.target.value }))} placeholder="🎖" maxLength={2} />
              </Field>
            )}
            <Field label="Farbe">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {BADGE_COLORS.map(col => (
                  <button key={col} onClick={() => setNewBadge(b => ({ ...b, color: col }))} style={{ width: 32, height: 32, borderRadius: "50%", background: col, border: `3px solid ${newBadge.color === col ? "#fff" : "transparent"}`, cursor: "pointer" }} />
                ))}
              </div>
            </Field>
            <button onClick={createBadge} style={{ padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Badge erstellen ✓</button>
          </div>
        )}
        {/* Badge-Liste */}
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {allBadges.map(b => (
            <div key={b.icon} style={{ background: `${b.color}15`, border: `1px solid ${b.color}40`, borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              {b.image ? <img src={b.image} alt={b.name} style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} /> : <span style={{ fontSize: 18 }}>{b.icon}</span>}
              <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>{b.name}</span>
              <button onClick={() => deleteBadge(b.icon)} title="Badge löschen" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, padding: "2px 4px" }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Badge vergeben */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 20 }}>Badge manuell vergeben</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Field label="Spieler">
            <select value={sel.playerId} onChange={e => setSel(s => ({ ...s, playerId: e.target.value }))} style={selectStyle}>
              <option value="">— wählen —</option>
              {team.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Badge">
            <select value={sel.badge} onChange={e => setSel(s => ({ ...s, badge: e.target.value }))} style={selectStyle}>
              <option value="">— wählen —</option>
              {allBadges.map(b => <option key={b.icon} value={b.icon}>{b.image ? "🖼" : b.icon} {b.name}</option>)}
            </select>
          </Field>
        </div>
        <button onClick={award} disabled={!canAward} style={{
          width: "100%", padding: "12px", borderRadius: 12, border: "none",
          background: canAward ? "linear-gradient(135deg,#f59e0b,#f97316)" : "rgba(255,255,255,0.05)",
          color: canAward ? "#fff" : "#334155", fontWeight: 700, cursor: canAward ? "pointer" : "not-allowed", fontSize: 15,
        }}>Badge vergeben 🎖</button>
      </div>

      {/* Badges pro Spieler */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 13, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Badges pro Spieler</div>
        {team.map(p => (
          <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar initials={p.avatar} size={40} />
            <div style={{ fontWeight: 600, color: "#cbd5e1", fontSize: 14, minWidth: 120 }}>{p.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {p.badges.length === 0 && <span style={{ fontSize: 12, color: "#334155" }}>Keine Badges</span>}
              {p.badges.map((b, i) => (
                <button key={i} onClick={() => revoke(p.id, b)} title="Entfernen" style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, padding: "4px 10px", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                }}><BadgeDisplay icon={b} allBadges={allBadges} size={22} /><span style={{ fontSize: 10, color: "#ef4444" }}>✕</span></button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Target Management ────────────────────────────────────────────────────────
function TargetMgmt({ team, targets, setTargets, monthlyData, setMonthlyData, onToast }) {
  const [targetForm, setTargetForm] = useState({
    year: String(targets.year),
    beNeukunden: String(targets.beNeukunden),
    anzNeukunden: String(targets.anzNeukunden),
    beTotal: String(targets.beTotal),
  });
  const [selPlayer, setSelPlayer] = useState("");
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [entryForm, setEntryForm] = useState({ beNeukunden: "", anzNeukunden: "", beTotal: "" });

  useEffect(() => {
    if (!selPlayer) return;
    const data = monthlyData[selPlayer]?.[selMonth];
    if (data) {
      setEntryForm({ beNeukunden: String(data.beNeukunden), anzNeukunden: String(data.anzNeukunden), beTotal: String(data.beTotal) });
    } else {
      setEntryForm({ beNeukunden: "", anzNeukunden: "", beTotal: "" });
    }
  }, [selPlayer, selMonth, monthlyData]);

  function saveTargets() {
    setTargets({
      year: Number(targetForm.year),
      beNeukunden: Number(targetForm.beNeukunden) || 0,
      anzNeukunden: Number(targetForm.anzNeukunden) || 0,
      beTotal: Number(targetForm.beTotal) || 0,
    });
    onToast("Jahresziele gespeichert!");
  }

  function saveMonthData() {
    if (!selPlayer) return;
    setMonthlyData(prev => ({
      ...prev,
      [selPlayer]: {
        ...(prev[selPlayer] || {}),
        [selMonth]: {
          beNeukunden: Number(entryForm.beNeukunden) || 0,
          anzNeukunden: Number(entryForm.anzNeukunden) || 0,
          beTotal: Number(entryForm.beTotal) || 0,
        }
      }
    }));
    const player = team.find(p => p.id === Number(selPlayer));
    onToast(`Ist-Werte ${MONTHS[selMonth]} für ${player?.name || ""} gespeichert!`);
  }

  const thStyle = { padding: "8px 6px", fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)" };
  const tdStyle = { padding: "8px 6px", fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#cbd5e1", borderBottom: "1px solid rgba(255,255,255,0.04)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Yearly targets */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 20, fontSize: 16 }}>Jahresziele definieren</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
          <Field label="Jahr">
            <input type="number" style={inputStyle} value={targetForm.year} onChange={e => setTargetForm(f => ({ ...f, year: e.target.value }))} />
          </Field>
          <Field label="BE Neukunden (CHF)">
            <input type="number" style={inputStyle} value={targetForm.beNeukunden} onChange={e => setTargetForm(f => ({ ...f, beNeukunden: e.target.value }))} placeholder="500000" />
          </Field>
          <Field label="Anz. Neukunden">
            <input type="number" style={inputStyle} value={targetForm.anzNeukunden} onChange={e => setTargetForm(f => ({ ...f, anzNeukunden: e.target.value }))} placeholder="50" />
          </Field>
          <Field label="BE Total (CHF)">
            <input type="number" style={inputStyle} value={targetForm.beTotal} onChange={e => setTargetForm(f => ({ ...f, beTotal: e.target.value }))} placeholder="2000000" />
          </Field>
        </div>
        <button onClick={saveTargets} style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Ziele speichern ✓</button>
      </div>

      {/* Monthly data entry */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 20, fontSize: 16 }}>Monatliche Ist-Werte erfassen</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Field label="Spieler">
            <select value={selPlayer} onChange={e => setSelPlayer(e.target.value)} style={selectStyle}>
              <option value="">— wählen —</option>
              {team.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Monat">
            <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))} style={selectStyle}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m} {targets.year}</option>)}
            </select>
          </Field>
        </div>
        {selPlayer && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 14 }}>
              <Field label="BE Neukunden (CHF)">
                <input type="number" style={inputStyle} value={entryForm.beNeukunden} onChange={e => setEntryForm(f => ({ ...f, beNeukunden: e.target.value }))} placeholder="0" />
              </Field>
              <Field label="Anz. Neukunden">
                <input type="number" style={inputStyle} value={entryForm.anzNeukunden} onChange={e => setEntryForm(f => ({ ...f, anzNeukunden: e.target.value }))} placeholder="0" />
              </Field>
              <Field label="BE Total (CHF)">
                <input type="number" style={inputStyle} value={entryForm.beTotal} onChange={e => setEntryForm(f => ({ ...f, beTotal: e.target.value }))} placeholder="0" />
              </Field>
            </div>
            <button onClick={saveMonthData} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Ist-Werte speichern ✓</button>
          </>
        )}
      </div>

      {/* Overview table per player - cumulative */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24, overflowX: "auto" }}>
        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 6, fontSize: 16 }}>Übersicht {targets.year}</div>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>Werte kumuliert (laufende Summe pro Monat)</div>
        {team.map(p => {
          const pData = monthlyData[p.id] || {};
          const hasData = Object.keys(pData).length > 0;
          return (
            <div key={p.id} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar initials={p.avatar} size={32} />
                <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{p.name}</span>
              </div>
              {!hasData ? (
                <div style={{ fontSize: 12, color: "#334155", padding: "8px 0" }}>Noch keine Daten erfasst</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>KPI</th>
                        {MONTHS.map((m, i) => <th key={i} style={{ ...thStyle, textAlign: "right", color: pData[i] ? "#64748b" : "#1e293b" }}>{m}</th>)}
                        <th style={{ ...thStyle, textAlign: "right", color: "#a5b4fc" }}>Ist Total</th>
                        <th style={{ ...thStyle, textAlign: "right", color: "#f59e0b" }}>Ziel</th>
                        <th style={{ ...thStyle, textAlign: "right", color: "#10b981" }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TARGET_CATS.map(c => {
                        let cumulative = 0;
                        const cumulativeValues = MONTHS.map((_, i) => {
                          cumulative += pData[i]?.[c.key] || 0;
                          return { month: pData[i]?.[c.key] || 0, cum: cumulative };
                        });
                        const total = cumulative;
                        const target = targets[c.key] || 0;
                        const playerTarget = team.length > 0 ? Math.round(target / team.length) : 0;
                        const pct = playerTarget > 0 ? Math.round((total / playerTarget) * 100) : 0;
                        return (
                          <tr key={c.key}>
                            <td style={{ ...tdStyle, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: c.color, fontSize: 12, whiteSpace: "nowrap" }}>{c.label}</td>
                            {cumulativeValues.map((v, i) => (
                              <td key={i} style={{ ...tdStyle, textAlign: "right", color: v.cum > 0 ? "#cbd5e1" : "#1e293b", position: "relative" }}>
                                {v.cum > 0 ? (
                                  <div>
                                    <div style={{ fontWeight: 700 }}>{c.unit === "CHF" ? v.cum.toLocaleString("de-CH") : v.cum}</div>
                                    {v.month > 0 && <div style={{ fontSize: 10, color: "#475569" }}>+{c.unit === "CHF" ? v.month.toLocaleString("de-CH") : v.month}</div>}
                                  </div>
                                ) : "–"}
                              </td>
                            ))}
                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: c.color }}>
                              {c.unit === "CHF" ? total.toLocaleString("de-CH") : total}
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right", color: "#64748b" }}>
                              {c.unit === "CHF" ? playerTarget.toLocaleString("de-CH") : playerTarget}
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: pct >= 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444" }}>
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function SalesGamificationApp() {
  const [activeTab,  setActiveTab]  = useState(0);
  const [sortKey,    setSortKey]    = useState("points");
  const [team,       setTeam]       = useState(SEED_TEAM);
  const [challenges, setChallenges] = useState(SEED_CHALLENGES);
  const [allBadges,  setAllBadges]  = useState(SEED_BADGES);
  const [targets,    setTargets]    = useState(SEED_TARGETS);
  const [monthlyData, setMonthlyData] = useState({});
  const [adminOpen,  setAdminOpen]  = useState(false);
  const [toast,      setToast]      = useState(null);

  const totalRevenue    = team.reduce((s, p) => s + p.revenue, 0);
  const totalNewClients = team.reduce((s, p) => s + p.newClients, 0);
  const totalPoints     = team.reduce((s, p) => s + p.points, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#f1f5f9", padding: "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:0}
        button:hover{opacity:0.85;transform:scale(0.98)}
        button{transition:all 0.15s}
        input:focus,select:focus{border-color:rgba(99,102,241,0.6)!important;box-shadow:0 0 0 3px rgba(99,102,241,0.15)!important}
        input[type=number]::-webkit-inner-spin-button{opacity:0.4}
      `}</style>

      {/* Sticky header */}
      <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(10,14,26,0) 60%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "28px 32px 20px", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏆</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#f1f5f9", letterSpacing: "-0.03em" }}>SalesArena</div>
                <div style={{ fontSize: 12, color: "#475569" }}>Q1 2025 · {team.length} Spieler aktiv</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              {[
                { label: "Team Umsatz", value: `CHF ${(totalRevenue / 1000).toFixed(0)}k`, icon: "💰" },
                { label: "Neukunden",   value: totalNewClients, icon: "🌱" },
                { label: "Team Punkte", value: totalPoints.toLocaleString(), icon: "⭐" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, fontWeight: 700, color: "#a5b4fc" }}>{s.icon} {s.value}</div>
                  <div style={{ fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                </div>
              ))}
              <button onClick={() => setAdminOpen(o => !o)} style={{
                padding: "9px 18px", borderRadius: 10, border: `1px solid ${adminOpen ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
                background: adminOpen ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                color: adminOpen ? "#fca5a5" : "#94a3b8",
                fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>⚙️ {adminOpen ? "Admin schliessen" : "Admin"}</button>
            </div>
          </div>

          {!adminOpen && (
            <div style={{ display: "flex", gap: 4 }}>
              {MAIN_TABS.map((tab, i) => (
                <button key={i} onClick={() => setActiveTab(i)} style={{
                  padding: "9px 20px", borderRadius: 10, border: "none",
                  background: activeTab === i ? "rgba(99,102,241,0.2)" : "transparent",
                  color: activeTab === i ? "#a5b4fc" : "#475569",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: activeTab === i ? "inset 0 0 0 1px rgba(99,102,241,0.4)" : "none",
                }}>{tab}</button>
              ))}
            </div>
          )}
          {adminOpen && (
            <div style={{ padding: "6px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚙️</span>
              <span style={{ fontWeight: 700, color: "#fca5a5", fontSize: 13 }}>Admin Panel — Änderungen wirken sich sofort auf das Leaderboard aus</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "32px auto 0", padding: "0 24px", animation: "fadeIn 0.4s ease" }}>
        {adminOpen ? (
          <AdminPanel team={team} setTeam={setTeam} challenges={challenges} setChallenges={setChallenges} allBadges={allBadges} setAllBadges={setAllBadges} targets={targets} setTargets={setTargets} monthlyData={monthlyData} setMonthlyData={setMonthlyData} onToast={setToast} />
        ) : (
          <>
            {activeTab === 0 && <LeaderboardTab team={team} sortKey={sortKey} setSortKey={setSortKey} allBadges={allBadges} />}
            {activeTab === 1 && <ChallengesTab challenges={challenges} />}
            {activeTab === 2 && <AchievementsTab team={team} allBadges={allBadges} />}
            {activeTab === 3 && <ProfileTab team={team} allBadges={allBadges} />}
            {activeTab === 4 && <TargetsTab team={team} targets={targets} monthlyData={monthlyData} />}
          </>
        )}
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
