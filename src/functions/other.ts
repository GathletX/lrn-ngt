import { writePlayerData } from "./../database/database";
/**
 * Use this File to organize functions which do not pertain directly to subscriptions,
 * or which may be referenced by subscriptions and non-subscription functions.
 */

import { Game } from "@gathertown/gather-game-client";

export async function handleOnboarding(
  game: Game,
  playerId: string,
  mapId: string,
  message?: string
): Promise<void> {
  message = message ? message : process.env.DEFAULT_ONBOARDING_MESSAGE;
  if (!message) return console.warn("⚠ NO ONBOARDING MESSAGE SET");
  //todo Schedule onboarding and check if player is available (promisify onboarding)
  game.wave(playerId);
  setTimeout(
    () =>
      game.chat(playerId, [], mapId, {
        contents: message!
      }),
    600
  );

  return await writePlayerData(
    { clientId: "main-client", playerId, spaceId: game.spaceId! },
    { lastOnboarded: Date.now() }
  );
}
