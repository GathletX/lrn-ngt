import { getPlayerData, writePlayerData } from "./../database/database";
/**
 * Use this File to organize functions which do not pertain directly to subscriptions,
 * or which may be referenced by subscriptions and non-subscription functions.
 */

import { Game } from "@gathertown/gather-game-client";
import { sheets } from "./googleapi";

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
    `map_explanations/${playerData.mapId}/last_info_time/`
  );

  const minimumTime = 1000 * 60 * 60 * 24; // 24 hours
  if (Date.now() - databaseLog.val() <= minimumTime) {
    return console.log(
      `⏰ ${playerData.playerId} has been briefed about ${playerData.mapId} in the last 24 hours.`,
      `Last briefing time: ${new Date(databaseLog.val()).toLocaleString()}`
    );
  }

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "Descriptions!A1:B"
  });

  if (!data?.values) return;

  //trying to make the data returned by sheets API simpler
  //todo change this to refer to actual nugget help stuff

  const organizedData: { map: string; description: string }[] = data.values
    .map(([mapName, description]: any[]) => ({
      map: mapName,
      description
    }))
    .slice(1)
    .filter((spreadsheetItem) => spreadsheetItem.description);
  const description = organizedData.find(
    (spreadsheetItem: { map: string; description: string }) =>
      spreadsheetItem.map === playerData.mapId
  )?.description;

  if (!description) return;

  game.chat(playerData.playerId, [], playerData.mapId, {
    contents: `
    ${description}

    -------------------------------`
  });

  await writePlayerData(
    {
      clientId: "main-client",
      spaceId: game.engine!.spaceId,
      playerId: playerData.playerId
    },
    {
      [`map_explanations/${playerData.mapId}`]: { last_info_time: Date.now() }
    }
  );
}
