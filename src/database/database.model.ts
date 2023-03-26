export interface PlayerData {
  lastNugget: number;
  lastOnboarded: number;
}

export interface PlayerQueryConfig {
  clientId: string;
  spaceId: string;
  playerId: string;
}

export interface SpaceFeatures {
  "learning-nuggets": boolean;
  "open-ai": boolean;
}
export interface SpaceConfig {
  SPREADSHEET_ID?: string;
  NPC_NAME?: string;
  CUSTOM_MESSAGE?: string;
  COOLDOWN_INTERVAL?: number;
  ONBOARDING_MESSAGE?: string;
}
