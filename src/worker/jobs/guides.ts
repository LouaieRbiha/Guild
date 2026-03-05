import redis from "../../lib/redis";

const KQM_BASE = "https://keqingmains.com";

// Map of character names to KQM URL slugs
const CHARACTER_SLUGS: Record<string, string> = {
  "Raiden Shogun": "raiden",
  "Hu Tao": "hu-tao",
  "Neuvillette": "neuvillette",
  "Furina": "furina",
  "Kaedehara Kazuha": "kazuha",
  "Nahida": "nahida",
  "Bennett": "bennett",
  "Xiangling": "xiangling",
  "Xingqiu": "xingqiu",
  "Zhongli": "zhongli",
  "Yelan": "yelan",
  "Kamisato Ayaka": "ayaka",
  "Ganyu": "ganyu",
  "Alhaitham": "alhaitham",
  "Mavuika": "mavuika",
  "Clorinde": "clorinde",
  "Kinich": "kinich",
  "Citlali": "citlali",
  "Sucrose": "sucrose",
  "Fischl": "fischl",
  "Kujou Sara": "kujou-sara",
  "Xilonen": "xilonen",
};

interface KQMGuide {
  character: string;
  slug: string;
  url: string;
  talentPriority: string[];
  weapons: { name: string; notes?: string }[];
  artifacts: { set: string; pieces: string; notes?: string }[];
  teams: { name: string; members: string[] }[];
  lastUpdated: string;
}

function extractSection(html: string, heading: string): string {
  // Find a heading containing the text
  const headingRegex = new RegExp(
    `<h[23][^>]*>[^<]*${heading}[^<]*</h[23]>`,
    "i"
  );
  const match = html.match(headingRegex);
  if (!match || match.index === undefined) return "";

  const startIdx = match.index + match[0].length;
  // Find the next heading of the same or higher level
  const nextHeading = html.slice(startIdx).search(/<h[23][^>]*>/i);
  const endIdx = nextHeading === -1 ? startIdx + 5000 : startIdx + nextHeading;

  return html.slice(startIdx, endIdx);
}

function extractListItems(section: string): string[] {
  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRegex.exec(section)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    if (text) items.push(text);
  }
  return items;
}

async function scrapeCharacter(name: string, slug: string): Promise<KQMGuide | null> {
  const url = `${KQM_BASE}/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GuildBot/1.0 (Genshin fan site)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Extract talent priority
    const talentSection = extractSection(html, "Talent Priority");
    const talentPriority = extractListItems(talentSection).slice(0, 5);

    // Extract weapons
    const weaponSection = extractSection(html, "Weapon");
    const weaponItems = extractListItems(weaponSection).slice(0, 8);
    const weapons = weaponItems.map((w) => {
      const parts = w.split(/[-\u2013\u2014:]/);
      return {
        name: parts[0]?.trim() || w,
        notes: parts.slice(1).join("-").trim() || undefined,
      };
    });

    // Extract artifacts
    const artifactSection = extractSection(html, "Artifact");
    const artifactItems = extractListItems(artifactSection).slice(0, 6);
    const artifacts = artifactItems.map((a) => {
      const pcMatch = a.match(/(\d)(?:pc|[-\s]?piece)/i);
      return {
        set: a.replace(/\(\d(?:pc|[-\s]?piece)\)/gi, "").trim(),
        pieces: pcMatch ? `${pcMatch[1]}pc` : "4pc",
        notes: undefined,
      };
    });

    // Extract teams
    const teamSection = extractSection(html, "Team");
    const teamItems = extractListItems(teamSection).slice(0, 6);
    const teams = teamItems.map((t) => {
      const members = t.split(/[,/+]/).map((m) => m.trim()).filter(Boolean);
      return { name: members.join(" + "), members };
    });

    return {
      character: name,
      slug,
      url,
      talentPriority: talentPriority.length > 0 ? talentPriority : ["Check KQM for details"],
      weapons: weapons.length > 0 ? weapons : [{ name: "Check KQM for details" }],
      artifacts: artifacts.length > 0 ? artifacts : [{ set: "Check KQM for details", pieces: "4pc" }],
      teams: teams.length > 0 ? teams : [{ name: "See KQM guide", members: [] }],
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[guides] Failed to scrape ${name}:`, err);
    return null;
  }
}

export async function scrapeKQMGuides(): Promise<void> {
  console.log("[guides] Starting KQM guide scrape...");
  let success = 0;
  let failed = 0;

  for (const [name, slug] of Object.entries(CHARACTER_SLUGS)) {
    try {
      const guide = await scrapeCharacter(name, slug);
      if (guide) {
        await redis.set(
          `guild:guides:${slug}`,
          JSON.stringify(guide),
          "EX",
          86400 // 24 hour TTL
        );
        success++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`[guides] Error with ${name}:`, err);
      failed++;
    }

    // Rate limit: 1 second between requests
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`[guides] Scrape complete: ${success} success, ${failed} failed`);
}
