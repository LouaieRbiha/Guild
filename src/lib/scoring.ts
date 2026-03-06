// Artifact scoring and roast generation engine

import type { Artifact, Character } from "./enka/client";

// ── Substat weights by role ────────────────────────────────────────────

const USEFUL_SUBS = ["ATK%", "HP%", "DEF%", "Energy Recharge", "Elemental Mastery"];

// Max single-roll values for substats (5★, highest tier)
const MAX_ROLL: Record<string, number> = {
  "HP": 299, "ATK": 19, "DEF": 23,
  "HP%": 5.8, "ATK%": 5.8, "DEF%": 7.3,
  "CRIT Rate": 3.9, "CRIT DMG": 7.8,
  "Energy Recharge": 6.5, "Elemental Mastery": 23,
};

// ── Scoring ────────────────────────────────────────────────────────────

export function scoreArtifact(art: Artifact): number {
  // Simple CV-based scoring: CRIT Rate × 2 + CRIT DMG + useful subs contribution
  let cv = 0;
  let usefulScore = 0;

  for (const sub of art.substats) {
    const numVal = parseFloat(sub.value);
    if (isNaN(numVal)) continue;

    if (sub.name === "CRIT Rate") {
      cv += numVal * 2;
    } else if (sub.name === "CRIT DMG") {
      cv += numVal;
    } else if (USEFUL_SUBS.includes(sub.name)) {
      const max = MAX_ROLL[sub.name] || 1;
      usefulScore += (numVal / (max * 5)) * 15; // up to 15 points for maxed useful subs
    }
  }

  // CV score: max realistic CV is ~45-50, normalize to 0-85 range
  const cvScore = Math.min((cv / 45) * 85, 85);

  // Add useful sub bonus (max 15)
  const total = Math.min(Math.round(cvScore + usefulScore), 100);
  return Math.max(total, 0);
}

export function scoreCharacterBuild(char: Character): number {
  if (char.artifacts.length === 0) return 0;
  const scores = char.artifacts.map(scoreArtifact);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  // Convert 0-100 to 0-10 scale
  return Math.round(avg / 10 * 10) / 10;
}

// ── Resin estimation ───────────────────────────────────────────────────

export function estimateResinForPiece(score: number) {
  // Per-piece resin cost: based on probability of rolling this quality
  // ~20 resin per domain run, ~2 useful pieces per 3 runs avg
  // Higher score = exponentially more attempts needed
  const baseRuns = Math.round(3 + (score / 100) ** 2 * 200);
  const resin = baseRuns * 20;
  return { resin, days: Math.round(resin / 180) };
}

export function estimateResin(avgScore: number) {
  // Based on probability of getting artifacts with this score
  // Higher score = exponentially more resin needed
  const matchResin = Math.round(200 + (avgScore / 100) * 8000);
  const goodResin = Math.round(matchResin * 2.5);
  const godResin = Math.round(matchResin * 8);
  return {
    match: { resin: matchResin, days: Math.round(matchResin / 180) },
    good: { resin: goodResin, days: Math.round(goodResin / 180) },
    god: { resin: godResin, days: Math.round(godResin / 180) },
  };
}

// ── Roast engine 🔥 ───────────────────────────────────────────────────

const ROASTS: Record<string, string[]> = {
  catastrophic: [
    "Did you equip these artifacts blindfolded? Actually, that would explain a lot.\nI've seen starter accounts with better stats. This is genuinely impressive — in the worst way.",
    "This build is a violation of the Geneva Convention.\nYour character called. They want a new owner.",
    "Congrats, you managed to make a 5★ character perform like a 3★.\nThe artifacts aren't just bad — they're aggressively, intentionally terrible. Like you're speedrunning failure.",
    "Even Paimon is embarrassed for you.\nI showed this build to three different theorycrafters and they all blocked me.",
    "I refuse to believe you farmed for this.\nYou opened the artifact screen, closed your eyes, and mashed equip. That's the only explanation.",
    "This is what happens when you let your little cousin play on your account.\nEvery substat rolled into the worst possible outcome. Statistically, this shouldn't even be possible.",
    "Your character isn't built — they're a hostage.\nFree them. Unequip everything. Literally anything would be an upgrade including nothing.",
    "I've done the math and your character would do more damage throwing the artifacts at the enemy.\nThis isn't a build, it's a cry for help wrapped in a war crime.",
    "Mihoyo designed the artifact system to cause suffering.\nYou're their greatest success story.",
    "This build has the same energy as bringing a plastic knife to a sword fight.\nAnd somehow losing the plastic knife on the way there.",
    "The domain bosses see you coming and feel bad.\nThey're considering letting you win out of pity. That's how down bad this is.",
    "I showed this to a random AR15 player and they offered you advice.\nLet that sink in. An actual beginner looked at your build and felt qualified to help.",
    "Your artifacts have the structural integrity of wet cardboard.\nEvery single piece is wrong. The main stats are wrong. The substats are wrong. The set is wrong. YOU are wrong.",
    "Even the Adventurer set is looking at this build and feeling superior.\nThat's a 3★ set. Feeling embarrassed yet?",
    "I'm not even mad. I'm fascinated.\nHow do you play the game long enough to reach this point and still build like it's your first day?",
    "With those substats, you'd need about 15,000 resin to match even an average build. That's 94 days of pure pain.",
    "The chance of rolling this badly is actually impressive — roughly 0.3% of players have it this rough.",
  ],
  tragic: [
    "This build is a cry for help. Are you okay?\nBecause your artifacts definitely aren't. They need therapy and a complete overhaul.",
    "You didn't farm for this. You panic-equipped and logged off.\nI can practically smell the copium from here.",
    "Even the Traveler's default artifacts put this to shame.\nThe ones they give you for FREE. In the tutorial.",
    "Your artifacts have the same energy as reheated leftovers.\nLike, three-day-old leftovers that you found in the back of the fridge.",
    "The domain literally gave you better options. You chose this.\nThat's not bad luck anymore — that's a lifestyle choice.",
    "I've seen copium builds before, but this? This is copium's copium.\nYou're huffing artifact fumes and calling it a strategy.",
    "Your crit ratio looks like a phone number.\nUnfortunately, it's the number for a crisis helpline. Which you might need.",
    "Somewhere in Teyvat, an NPC has better artifacts than you.\nTimaeus. I'm talking about Timaeus. The guy who can't even do alchemy right.",
    "This build has the same vibe as showing up to Abyss in pajamas.\nLike, you technically showed up. But nobody's impressed.",
    "You know domains drop 5★ artifacts, right?\nLike, you've seen them? In person? This build makes me doubt that.",
    "The substats on these pieces read like a random number generator having a stroke.\nFlat DEF on a DPS goblet? Bold choice. Wrong, but bold.",
    "Your character is doing their best despite you, not because of you.\nThey deserve better. We all deserve better.",
    "I don't think the artifact strongbox can save this.\nYou'd need to strongbox your entire account and start over.",
    "Bro spent 10,000 resin and came home with THIS.\nThe resin didn't die for this. It was murdered.",
    "This build screams 'I have other characters to worry about.'\nExcept your other characters probably look like this too.",
  ],
  mid: [
    "The definition of 'it's fine I guess.' Your ancestors are unimpressed.\nYou didn't fail. You just aggressively refused to succeed.",
    "Aggressively mediocre. Like ordering water at a bar.\nIt gets the job done, but nobody's celebrating.",
    "You tried. Not hard, but you tried.\nAnd honestly? In this economy? That's kind of brave.",
    "Peak copium build. It works, barely.\nLike a car with three wheels — technically mobile, practically embarrassing.",
    "This is what 'good enough' looks like. And it's not a compliment.\nYour character can clear content the way a student passes with a D-minus.",
    "If mediocrity had a mascot, it would be this build.\nNot bad enough to roast, not good enough to praise. Just... there.",
    "This build has big 'I'll fix it later' energy.\nSpoiler: you won't. You never do. We both know this.",
    "You're in the artifact purgatory — not bad enough to restart, not good enough to stop.\nThis is where accounts go to stagnate.",
    "Perfectly balanced between effort and laziness.\nThanos would be proud. Your DPS numbers would not.",
    "This build is the equivalent of a participation trophy.\nYou showed up. That's... that's about it.",
    "Your artifacts are giving 'first draft that never got edited.'\nThe potential is there if you squint. And lie to yourself a little.",
    "It's not terrible! It's just... not good.\nLike airport food. Or a Monday. Or this build.",
    "I've seen worse. I've seen MUCH better. You're in the uncanny valley of builds.\nClose enough to good that it hurts. Far enough from good that it doesn't matter.",
    "This build runs on vibes and prayer.\nMainly prayer. Heavy, desperate prayer.",
    "The artifacts said 'we'll do the bare minimum' and they meant it.\nEvery substat did exactly one good roll and then gave up, just like you.",
    "Your Sands has ATK% — a 26.68% drop rate. The fact that the substats still went to DEF is just Genshin being Genshin.",
    "Statistically, you should have better crit rolls by now. The expected crit value at +20 is 28.3 CV. You're... not there.",
  ],
  solid: [
    "Okay, you actually put some work in. Respect.\nNot everyone can say that. Your character has a future.",
    "Not bad. Not great. But I've seen far worse today.\nYou're in the top half, and honestly? That's an achievement in this game.",
    "Decent build. Your character can hold their head up.\nNot high. But up. That's more than most can say.",
    "You're in the 'I actually farm' club. Welcome.\nMembership perks include existential dread and slightly better numbers.",
    "Solid work. Now do this for every character.\nSee you in 2027. Bring snacks.",
    "Hey, your crit ratio actually makes sense!\nI'm genuinely surprised. In a good way. Don't let it go to your head.",
    "This build tells me you've read at least one guide.\nAnd more importantly, you actually followed it. A rare breed.",
    "Your artifacts aren't perfect, but they're honest work.\nEvery substat roll that hit crit — I see you. I appreciate you.",
    "This character could actually survive in Abyss.\nMaybe not Floor 12 with full stars, but they won't embarrass you. Probably.",
    "Respectable. Like a firm handshake.\nYou put in the hours, the resin, the pain. It shows.",
    "Not gonna lie, a few of these pieces are actually pretty good.\nThe others are carrying weight, but the good ones? Chef's kiss.",
    "You're past the copium phase and into actual competence.\nWelcome to the other side. The resin costs don't get better, but the builds do.",
    "This build has 'I clear Abyss but don't brag about it' energy.\nQuiet confidence. Understated power. I respect it.",
    "Your character would survive a tierlist debate.\nThey wouldn't win it, but they'd survive. And that's something.",
    "Someone actually invested time here and it shows.\nYou're not done — a few upgrades could push this into cracked territory. Keep going.",
  ],
  cracked: [
    "Touch grass. Actually, don't — keep farming, you're built different.\nThis build is what happens when talent meets obsession. Beautiful and terrifying.",
    "The RNG gods chose you. Congrats on your one bit of luck in life.\nEvery substat rolled exactly where it needed to. Disgusting.",
    "This build is illegal in 47 countries.\nReported to Mihoyo, the FBI, and the Adventurer's Guild.",
    "You didn't farm this. You sold your soul. Worth it though.\nSatan got a great deal. You got cracked artifacts. Everyone wins.",
    "Everyone who sees this build is now farming the same domain out of spite.\nYou've caused more resin waste than any content creator ever could.",
    "I'm not even going to roast this. I'm just going to stare in awe.\nAnd then quietly cry about my own artifacts.",
    "This build goes so hard it has its own gravitational pull.\nOther characters in your account orbit around this one's power.",
    "You didn't build a character. You built a weapon of mass destruction.\nThe Abyss doesn't fear you — it respects you.",
    "I showed this to a whale and they asked for your artifacts.\nNot your account. Just the artifacts. That's how good these are.",
    "This is the kind of build that makes F2P players quit the game.\nNot because they're jealous — because they know they'll never reach this.",
    "Your crit ratio is so good it made me double-check for photoshop.\nIt's real. Unfortunately. For the rest of us.",
    "Every substat rolled high. EVERY. SINGLE. ONE.\nDo you have blackmail on the RNG algorithm? Be honest.",
    "This build is the final boss of showcases.\nOther players see this and close the game for the day. You've ruined their motivation.",
    "Theorycrafters are going to use your build as a benchmark.\nNot the character — YOUR specific artifacts. That's legacy.",
    "I need to sit down after seeing this. My artifacts just filed for divorce.\nThis is the build equivalent of a mic drop. There's nothing left to say.",
    "Your crit ratio is in the top 5% of registered builds. The resin gods smiled upon you — approximately 8,000 resin worth of luck.",
    "Most players need 40+ days to get artifacts this good. Either you're dedicated or you sold your soul to RNGesus.",
  ],
};

// Per-piece roasts for particularly bad artifacts
const PIECE_ROASTS: Record<string, string[]> = {
  terrible: [
    "This piece belongs in the strongbox. Actually, even the strongbox would reject it.",
    "I've seen 4-star artifacts with better rolls than this.",
    "Every single roll went into the worst possible substat. Impressive, in a depressing way.",
    "This artifact is actively making your character weaker. Unequip it and throw it into the ocean.",
    "The domain gave you this as a joke. You equipped it as a tragedy.",
    "This piece has the same energy as bringing a water gun to a boss fight.",
    "Flat DEF and flat HP said 'we got you fam' and they really did. Got you good.",
    "If artifacts had feelings, this one would be ashamed of itself.",
    "This piece rolled like a drunk character dodging — everywhere except where it should.",
  ],
  bad: [
    "This piece is trying its best. Its best just isn't very good.",
    "One or two rolls went right. The rest went on vacation.",
    "This artifact has 'I'll do' energy. But barely.",
    "You kept this because you had nothing better. I understand. I don't approve, but I understand.",
    "The substats on this piece are having an identity crisis.",
    "This piece got one good roll and then immediately gave up, like your motivation to farm.",
  ],
  decent: [
    "Not bad! A few more rolls in the right place and this could've been great.",
    "This piece is the definition of 'close but no cigar.'",
    "Decent piece. Your character isn't complaining, but they're not celebrating either.",
    "A solid B effort. Like homework you did at 2am but still passed.",
  ],
  great: [
    "Now THIS is a piece worth keeping. The rolls actually cooperated for once.",
    "This artifact understood the assignment. Mostly.",
    "Every time you look at this piece, thank the RNG gods and move on before they take it back.",
  ],
};

export function getPieceRoast(score: number, seed: string): string | null {
  let pool: string[];
  if (score <= 20) pool = PIECE_ROASTS.terrible;
  else if (score <= 35) pool = PIECE_ROASTS.bad;
  else if (score >= 80) pool = PIECE_ROASTS.great;
  else return null; // don't roast mid pieces individually
  const hash = simpleHash(seed);
  return pool[hash % pool.length];
}

export function getTier(score: number): string {
  if (score <= 2) return "catastrophic";
  if (score <= 4) return "tragic";
  if (score <= 6) return "mid";
  if (score <= 8) return "solid";
  return "cracked";
}

export function getTierLabel(score: number): string {
  if (score <= 2) return "Catastrophic";
  if (score <= 4) return "Tragic";
  if (score <= 6) return "Mid";
  if (score <= 8) return "Solid";
  return "Cracked";
}

// Deterministic roast based on UID + character name (no Math.random = no hydration mismatch)
export function getRoast(tier: string, seed: string): string {
  const pool = ROASTS[tier] || ROASTS.mid;
  const hash = simpleHash(seed);
  return pool[hash % pool.length];
}

// Simple deterministic hash from string
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Crit Value ──────────────────────────────────────────────────────────

export function calculateCV(substats: { name: string; value: string }[]): number {
  let cv = 0;
  for (const sub of substats) {
    const v = parseFloat(sub.value);
    if (Number.isNaN(v)) continue;
    if (sub.name === 'CRIT Rate') cv += v * 2;
    else if (sub.name === 'CRIT DMG') cv += v;
  }
  return cv;
}

// ── Helper formatters ──────────────────────────────────────────────────

export function scoreColor(s: number): string {
  if (s <= 30) return "text-red-500";
  if (s <= 50) return "text-orange-400";
  if (s <= 70) return "text-yellow-400";
  if (s <= 85) return "text-green-400";
  return "text-emerald-400";
}

export function grade(s: number): string {
  if (s >= 90) return "S";
  if (s >= 80) return "A+";
  if (s >= 70) return "A";
  if (s >= 60) return "B+";
  if (s >= 50) return "B";
  if (s >= 40) return "C+";
  if (s >= 30) return "C";
  if (s >= 20) return "D";
  return "F";
}

export function barColor(s: number): string {
  if (s >= 70) return "bg-emerald-500";
  if (s >= 50) return "bg-yellow-500";
  if (s >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export function pieceLabel(s: number): string {
  if (s >= 80) return "Cracked";
  if (s >= 60) return "Solid";
  if (s >= 40) return "Mid";
  return "Pain";
}

export const tierBadge: Record<string, string> = {
  catastrophic: "bg-red-500/20 text-red-400",
  tragic: "bg-orange-500/20 text-orange-400",
  mid: "bg-yellow-500/20 text-yellow-400",
  solid: "bg-green-500/20 text-green-400",
  cracked: "bg-emerald-500/20 text-emerald-400",
};

export const elColor: Record<string, string> = {
  Hydro: "text-blue-400", Pyro: "text-red-400", Cryo: "text-cyan-300",
  Electro: "text-purple-400", Dendro: "text-green-400", Anemo: "text-teal-300", Geo: "text-yellow-400",
  Unknown: "text-gray-400",
};

export const elBg: Record<string, string> = {
  Hydro: "from-blue-500/10", Pyro: "from-red-500/10", Cryo: "from-cyan-500/10",
  Electro: "from-purple-500/10", Dendro: "from-green-500/10", Anemo: "from-teal-500/10", Geo: "from-yellow-500/10",
  Unknown: "from-gray-500/10",
};
