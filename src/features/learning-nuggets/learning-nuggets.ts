import { Game, Player } from "@gathertown/gather-game-client";
import { DEFAULT_SPREADSHEET } from "../../config/config";
import { writePlayerData } from "../../database/database";
import { PlayerData, SpaceConfig } from "../../database/database.model";
import { sheets } from "../../functions/googleapi";
import { LearningNugget } from "../../models/nuggets.model";

export const handleNuggets = async (
  game: Game,
  { id, map }: Partial<Player>,
  playerData: PlayerData,
  spaceConfig: SpaceConfig | undefined
) => {
  const hasBeenNuggeted = hasPlayerBeenNuggetted(
    playerData,
    spaceConfig?.COOLDOWN_INTERVAL
  );
  if (!hasBeenNuggeted) {
    console.log(`Issuing nugget 🍗🐔 for ${id}`);
    await issueNuggets(
      game,
      {
        playerId: id!,
        mapId: map!,
      },
      spaceConfig
    );
  }
};

function hasPlayerBeenNuggetted(
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

async function issueNuggets(
  game: Game,
  playerData: {
    playerId: string;
    mapId: string;
  },
  spaceConfig: SpaceConfig | undefined
) {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spaceConfig?.SPREADSHEET_ID ?? DEFAULT_SPREADSHEET,
    range: "A2:B",
  });

  if (!data?.values) return;

  //trying to make the data returned by sheets API simpler
  const organizedData: LearningNugget[] = data.values
    .map(([category, content]: any[]) => ({
      category,
      content,
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

      -------------------------------`,
  });

  await writePlayerData(
    {
      clientId: "main-client",
      spaceId: game.engine!.spaceId,
      playerId: playerData.playerId,
    },
    {
      lastNugget: Date.now(),
    }
  );
}
