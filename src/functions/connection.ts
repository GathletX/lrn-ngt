/**
 * The connections file handles all of the websocket connection to the spaces.
 * It is not recommended to alter this file, unless you have a specific reason.
 */

import {
  Game,
  PlayerInitInfo,
  ServerClientEvent,
  SpaceMemberInfo
} from "@gathertown/gather-game-client";
import { SPACE_URLS, BOT_OUTFIT, NPC_NAME, API_KEY } from "../config/config";

require("dotenv").config();

interface GameArray {
  [key: string]: Game;
}

interface MembersArray {
  [key: string]: { [key: string]: SpaceMemberInfo };
}

export var spaceRoles: MembersArray = {};

export const connectToSpaces = (commands?: string[]): Promise<GameArray> => {
  return new Promise(async (resolve, reject) => {
    let games: GameArray = {};
    try {
      for (let url of SPACE_URLS) {
        const parser = url.split("?")[0].split("/");
        const cleanName = decodeURI(parser[5]);
        const game = new Game([parser[4], cleanName].join("\\"), () =>
          Promise.resolve({ apiKey: API_KEY! })
        );

        // No need to register commands. Uncomment this, if using commands.
        // if (commands) {
        //   registerCommands(game, commands);
        // }

        getUserRoles(game);
        enterAsNPC(game); /*Remove comment line to enter space as NPC*/
        game.connect();
        await game.waitForInit();
        interceptEngineEvents(game);
        // setBotUsername(game, NPC_NAME);
        console.log(`connected to ${parser[5]}`);
        games[parser[4]] = game;
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }

    resolve(games);
  });
};

const registerCommands = (game: Game, commands: string[]): void => {
  game.subscribeToConnection((connected: boolean) => {
    if (connected) {
      for (let cmd of commands) {
        game.registerCommand(cmd);
      }
    }
  });
};

const enterAsNPC = (game: Game): void => {
  const config: PlayerInitInfo = {
    ...(NPC_NAME && { name: NPC_NAME }),
    ...(BOT_OUTFIT && { outfitString: BOT_OUTFIT })
  };

  game.subscribeToConnection((connected: boolean) => {
    if (connected) {
      game.enter({ isNpc: true, ...config });
    }
  });
};

const getUserRoles = (game: Game) => {
  game.subscribeToEvent("spaceSetsSpaceMembers", (data, context) => {
    spaceRoles[game?.spaceId?.split("\\")[0]!] =
      data.spaceSetsSpaceMembers.members;
  });
};

const interceptEngineEvents = ({ engine }: Game) => {
  if (!engine) return;

  const eventProcessor = engine["processEvent"].bind(engine);
  engine["processEvent"] = (serverClientEvent: ServerClientEvent) => {
    switch (serverClientEvent?.event?.$case) {
      case "info":
        console.log(`✅ [ws-info]: ${engine.spaceId}`);
        break;
      case "warn":
        console.log(`⚠️ [ws-warning]: ${engine.spaceId}`);
        break;
      case "error":
        console.log(`❌ [ws-error]: ${engine.spaceId}`);
        break;
    }
    eventProcessor(serverClientEvent);
  };

  const wsClose = (engine["ws"]?.onclose as Function).bind(engine);
  engine.ws!.onclose = (evt) => {
    console.log(`❌ [ws-disconnection]: ${engine.spaceId}`);
    wsClose(evt);
  };

  const wsOpen = (engine["ws"]!.onopen as Function).bind(engine);
  engine.ws!.onopen = (evt) => {
    console.log(`🍭 [ws-connection]: ${engine.spaceId}`);
    wsOpen(evt);
  };
};
function setBotUsername(game: Game, name: string) {
  game.enter({ isNpc: true, name });
  setTimeout(() => game.exit(), 2000);
}
