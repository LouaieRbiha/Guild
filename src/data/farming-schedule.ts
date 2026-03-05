// Talent book domains are open on specific days
// Mon/Thu - first set, Tue/Fri - second set, Wed/Sat - third set, Sun - all
export const TALENT_BOOK_SCHEDULE: Record<string, string[]> = {
  // Mondstadt
  "Freedom": ["Monday", "Thursday"],
  "Resistance": ["Tuesday", "Friday"],
  "Ballad": ["Wednesday", "Saturday"],
  // Liyue
  "Prosperity": ["Monday", "Thursday"],
  "Diligence": ["Tuesday", "Friday"],
  "Gold": ["Wednesday", "Saturday"],
  // Inazuma
  "Transience": ["Monday", "Thursday"],
  "Elegance": ["Tuesday", "Friday"],
  "Light": ["Wednesday", "Saturday"],
  // Sumeru
  "Admonition": ["Monday", "Thursday"],
  "Ingenuity": ["Tuesday", "Friday"],
  "Praxis": ["Wednesday", "Saturday"],
  // Fontaine
  "Equity": ["Monday", "Thursday"],
  "Justice": ["Tuesday", "Friday"],
  "Order": ["Wednesday", "Saturday"],
  // Natlan
  "Contention": ["Monday", "Thursday"],
  "Kindling": ["Tuesday", "Friday"],
  "Conflict": ["Wednesday", "Saturday"],
};

// Weapon material domains follow the same Mon/Thu, Tue/Fri, Wed/Sat pattern
export const WEAPON_MATERIAL_SCHEDULE: Record<string, string[]> = {
  // Mondstadt
  "Decarabian": ["Monday", "Thursday"],
  "Boreal Wolf": ["Tuesday", "Friday"],
  "Dandelion Gladiator": ["Wednesday", "Saturday"],
  // Liyue
  "Guyun": ["Monday", "Thursday"],
  "Mist Veiled": ["Tuesday", "Friday"],
  "Aerosiderite": ["Wednesday", "Saturday"],
  // Inazuma
  "Distant Sea": ["Monday", "Thursday"],
  "Narukami": ["Tuesday", "Friday"],
  "Mask": ["Wednesday", "Saturday"],
  // Sumeru
  "Forest Dew": ["Monday", "Thursday"],
  "Oasis Garden": ["Tuesday", "Friday"],
  "Scorching Might": ["Wednesday", "Saturday"],
  // Fontaine
  "Ancient Chord": ["Monday", "Thursday"],
  "Dewdrop": ["Tuesday", "Friday"],
  "Pristine Sea": ["Wednesday", "Saturday"],
  // Natlan
  "Blazing Hearth": ["Monday", "Thursday"],
  "Night Wind": ["Tuesday", "Friday"],
  "Sacred Flame": ["Wednesday", "Saturday"],
};

// Check if a material domain is available today
export function isDomainOpenToday(materialName: string): boolean {
  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[today.getDay()];

  if (todayName === "Sunday") return true; // All domains open on Sunday

  // Check if any talent book schedule matches
  for (const [bookName, days] of Object.entries(TALENT_BOOK_SCHEDULE)) {
    if (materialName.toLowerCase().includes(bookName.toLowerCase())) {
      return days.includes(todayName);
    }
  }

  // Check weapon material schedule
  for (const [matName, days] of Object.entries(WEAPON_MATERIAL_SCHEDULE)) {
    if (materialName.toLowerCase().includes(matName.toLowerCase())) {
      return days.includes(todayName);
    }
  }

  return true; // Default to available if not a domain material
}

export function getDomainDays(materialName: string): string[] | null {
  for (const [bookName, days] of Object.entries(TALENT_BOOK_SCHEDULE)) {
    if (materialName.toLowerCase().includes(bookName.toLowerCase())) {
      return [...days, "Sunday"];
    }
  }
  for (const [matName, days] of Object.entries(WEAPON_MATERIAL_SCHEDULE)) {
    if (materialName.toLowerCase().includes(matName.toLowerCase())) {
      return [...days, "Sunday"];
    }
  }
  return null;
}
