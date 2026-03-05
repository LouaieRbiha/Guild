export interface AkashaWeapon {
  name: string;
  icon: string;
  weaponId: number;
  level: number;
  refinement: number;
  rarity: number;
}

export interface AkashaArtifactSet {
  count: number;
  icon: string;
}

export interface AkashaCalculation {
  calculationId: string;
  name: string;
  details: string;
  ranking: number;
  outOf: number;
  result: number;
  weapon: {
    name: string;
    rarity: number;
    refinement: number;
  };
}

export interface AkashaCharacter {
  id: string;
  name: string;
  characterId: number;
  constellation: number;
  icon: string;
  weapon: AkashaWeapon;
  artifactSets: Record<string, AkashaArtifactSet>;
  calculations: {
    fit?: AkashaCalculation;
  };
}

export interface AkashaProfile {
  uid: string;
  characters: AkashaCharacter[];
  fetchedAt: number;
}
