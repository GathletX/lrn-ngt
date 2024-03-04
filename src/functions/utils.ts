import { Game } from "@gathertown/gather-game-client";
import { getGlobalFeatures, getSpaceFeatures } from "../database/database";
import { FeatureTokens, SpaceFeatures } from "./../database/database.model";

const SPACE_FEATURES: { [spaceId: string]: SpaceFeatures } = {};
let COMMON_FEATURES: Partial<SpaceFeatures> = {};

export const initializeGlobalFeatures = async () => {
  COMMON_FEATURES = await getGlobalFeatures();
};

export const initializeSpaceFeatures = async (game: Game) => {
  if (SPACE_FEATURES[game.spaceId!]) return;
  SPACE_FEATURES[game.spaceId!] = await getSpaceFeatures({
    clientId: "main-client",
    spaceId: game.spaceId,
  });
  console.log(
    "☢ Initialized space features",
    game.spaceId,
    SPACE_FEATURES[game.spaceId!]
  );
};

export const isFeatureEnabled = (
  game: Game,
  featureToken: FeatureTokens
): boolean =>
  SPACE_FEATURES[game.spaceId!]?.[featureToken] ??
  COMMON_FEATURES[featureToken] ??
  false;
