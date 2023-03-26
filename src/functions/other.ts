import { PlayerData, SpaceConfig } from "./../database/database.model";
import { DEFAULT_SPREADSHEET } from "./../config/config";
import {
  getPlayerData,
  getSpaceConfig,
  writePlayerData
} from "./../database/database";
/**
 * Use this File to organize functions which do not pertain directly to subscriptions,
 * or which may be referenced by subscriptions and non-subscription functions.
 */

import { Game } from "@gathertown/gather-game-client";
import { PlayerQueryConfig } from "../database/database.model";
import { LearningNugget } from "../models/nuggets.model";
import { sheets } from "./googleapi";

export async function handleNuggets(
  game: Game,
  playerData: {
    playerId: string;
    mapId: string;
  },
  spaceConfig: SpaceConfig | null
) {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spaceConfig?.SPREADSHEET_ID ?? DEFAULT_SPREADSHEET,
    range: "A2:B"
  });

  if (!data?.values) return;

  //trying to make the data returned by sheets API simpler
  const organizedData: LearningNugget[] = data.values
    .map(([category, content]: any[]) => ({
      category,
      content
    }))
    .filter((nugget: LearningNugget) => nugget.content);

  const randomNugget: LearningNugget =
    organizedData[Math.floor(Math.random() * organizedData.length)];
  if (!randomNugget) return;

  game.chat(playerData.playerId, [], playerData.mapId, {
    contents: `
    𝙃𝙞, ${game.players[playerData.playerId].name}.
    ${spaceConfig?.CUSTOM_MESSAGE || "𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙙𝙖𝙞𝙡𝙮 𝙇𝙚𝙖𝙧𝙣𝙞𝙣𝙜 𝙉𝙪𝙜𝙜𝙚𝙩!"}

    ${randomNugget.category}:
    ${randomNugget.content}

    -------------------------------`
  });

  await writePlayerData(
    {
      clientId: "main-client",
      spaceId: game.engine!.spaceId,
      playerId: playerData.playerId
    },
    {
      lastNugget: Date.now()
    }
  );
}

export function hasPlayerBeenNuggetted(
  playerData: PlayerData,
  coolDownPeriod = 1000 * 60 * 60 * 24 /*24 hours*/
): boolean {
  if (Date.now() - playerData?.lastNugget <= coolDownPeriod) {
    console.log(
      `🐔 Player has been nuggetted in the cooldown period (${coolDownPeriod}).`,
      `⏰ Last nuggetted time: ${new Date(
        playerData.lastNugget
      ).toLocaleString()}`
    );
    return true;
  }
  return false;
}

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
