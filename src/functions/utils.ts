import { Game } from "@gathertown/gather-game-client";
import { EMPTY_OUTFIT } from "../config/config";
import { getGlobalFeatures, setupDatabaseListener } from "../database/database";
import {
  FeatureTokens,
  SpaceConfig,
  SpaceFeatures,
} from "./../database/database.model";

export const SPACE_FEATURES: { [spaceId: string]: Partial<SpaceFeatures> } = {};
export const SPACE_CONFIGS: { [spaceId: string]: Partial<SpaceConfig> } = {};
let COMMON_FEATURES: Partial<SpaceFeatures> = {};

export const getLiveConfig = (
  spaceId: string
): Partial<SpaceConfig> | undefined => SPACE_CONFIGS[spaceId];

export const getLiveFeatures = (
  spaceId: string
): Partial<SpaceFeatures> | undefined => SPACE_FEATURES[spaceId];

export const initializeGlobalFeatures = async () => {
  COMMON_FEATURES = await getGlobalFeatures();
};

export const initializeSpaceFeatures = async (game: Game) => {
  if (SPACE_FEATURES[game.spaceId!]) return;
  await setupDatabaseListener(
    `/main-client/spaces/${game.engine?.spaceId}/features`,
    (data?: Partial<SpaceFeatures>) => {
      SPACE_FEATURES[game.spaceId!] = data ? data : {};
      console.log(
        "🪶 updated space features",
        game.spaceId,
        SPACE_FEATURES[game.spaceId!]
      );
    }
  );
};

export const initializeSpaceConfig = async (game: Game) => {
  if (SPACE_FEATURES[game.spaceId!]) return;
  await setupDatabaseListener(
    `/main-client/spaces/${game.engine?.spaceId}/config`,
    async (data?: Partial<SpaceConfig>) => {
      SPACE_CONFIGS[game.spaceId!] = data ? data : {};
      console.log(
        "🔧 updated space config",
        game.spaceId,
        SPACE_CONFIGS[game.spaceId!]
      );

      if (data?.NPC_NAME) {
        game.setName(data.NPC_NAME);
      }
      if (data?.NPC_OUTFIT) {
        game.setCurrentlyEquippedWearables({
          ...EMPTY_OUTFIT,
          ...data.NPC_OUTFIT,
        });
      }
    }
  );
};

export const isFeatureEnabled = (
  game: Game,
  featureToken: FeatureTokens
): boolean =>
  getLiveFeatures(game.spaceId!)?.[featureToken] ??
  COMMON_FEATURES[featureToken] ??
  false;

export const getSpaceConfigValue = <K extends keyof SpaceConfig>(
  spaceId: string,
  key: K
): SpaceConfig[K] | null => getLiveConfig(spaceId)?.[key] ?? null;
