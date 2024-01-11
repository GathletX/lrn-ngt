import { DBOutfit } from "@gathertown/gather-game-client";

export interface PlayerData {
  lastNugget: number;
  lastOnboarded: number;
}

export interface PlayerQueryConfig {
  clientId: string;
  spaceId: string;
  playerId: string;
}

export enum FeatureTokens {
  LEARNING_NUGGETS = "learning-nuggets",
  OPEN_AI = "open-ai",
  AUTO_JOIN_ALLOW = "auto-join-allow",
  ELEVATOR = "elevator",
}

export type SpaceFeatures = {
  [key in FeatureTokens]: boolean;
};
export interface SpaceConfig {
  SPREADSHEET_ID?: string;
  NPC_NAME?: string;
  NPC_OUTFIT?: Partial<DBOutfit>;
  CUSTOM_MESSAGE?: string;
  COOLDOWN_INTERVAL?: number;
  ONBOARDING_MESSAGE?: string;
}
