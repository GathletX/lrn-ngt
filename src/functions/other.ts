import { getPlayerData, writePlayerData } from "./../database/database";
/**
 * Use this File to organize functions which do not pertain directly to subscriptions,
 * or which may be referenced by subscriptions and non-subscription functions.
 */

import { Game } from "@gathertown/gather-game-client";
import { sheets } from "./googleapi";
import { LearningNugget } from "../models/nuggets.model";

export async function handlePlayerInfo(
  game: Game,
  playerData: {
    playerId: string;
    mapId: string;
  }
) {
  const databaseLog = await getPlayerData(
    {
      clientId: "main-client",
      spaceId: game.engine!.spaceId,
      playerId: playerData.playerId
    },
    "lastNugget"
  );

  const minimumTime = 1000 * 60 * 60 * 24; // 24 hours

  if (Date.now() - databaseLog.val() <= minimumTime) {
    return console.log(
      `🐔 ${playerData.playerId} has been nuggetted in the last 24 hours.`,
      `⏰Last nuggetted time: ${new Date(databaseLog.val()).toLocaleString()}`
    );
  }

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "rewritten!A2:B"
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
    Here's your daily Learning Nugget!
    
    ✨${randomNugget.category}:
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
