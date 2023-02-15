export interface PlayerData {
  lastNugget: number;
}

export interface SpaceConfig {
  SPREADSHEET_ID?: string;
  NPC_NAME?: string;
  CUSTOM_MESSAGE?: string;
  COOLDOWN_INTERVAL?: number;
}

export interface PlayerQueryConfig {
  clientId: string;
  spaceId: string;
  playerId: string;
}
