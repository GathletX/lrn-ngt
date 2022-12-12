/**
 * Use this File to organize functions which pertain directly to subscriptions,
 * or which may be referenced by subscriptions.
 */

import { Game } from "@gathertown/gather-game-client";
import { isContext } from "vm";
import { checkForCommand } from "../config/commands";
require("dotenv").config();

/*
    //Space Member Permssions, to create Moderator or Owner limited actions.
    Note: spaceId here is the randomly generated characters before the space name, ie spaceId\\spaceName, not both parts
    [spaceId:string]:{playerId:{currentlyEquippedWearables:{...},name:string,roles:{DEFAULT_BUILDER:boolean,OWNER:boolean,DEFAULT_MOD:boolean}}}
*/
import { spaceRoles } from "./connection";
import { handleNuggets, hasPlayerBeenNuggetted } from "./other";

export const subscribeToEvents = (game: Game): void => {
  game.subscribeToEvent(
    "playerSendsCommand",
    ({ playerSendsCommand }, context) => {
      const parser = playerSendsCommand.command.split(" ");
      checkForCommand({ parser, game, playerSendsCommand, context });
    }
  );

  game.subscribeToEvent(
    "playerJoins",
    ({ playerJoins }, { player, playerId }) => {
      if (playerId === game.engine?.clientUid) return;

      const isPlayerLoaded = new Promise<string>((resolve, reject) => {
        let CURRENT_RETRY = 0;
        const MAX_RETRIES = 20;
        const interval = setInterval(() => {
          const playerName = player?.name;

          CURRENT_RETRY++;
          if (CURRENT_RETRY >= MAX_RETRIES) {
            reject(clearInterval(interval));
          }

          if (!playerName) {
            return;
          } else {
            clearInterval(interval);
            resolve(playerName);
          }
        }, 500);
      });

      isPlayerLoaded.then((playerName: string) => {
        //insert playerJoins behaviour here
      });
    }
  );

  game.subscribeToEvent(
    "playerJoins",
    async ({ playerJoins }, { playerId, player }) => {
      if (playerId === game.engine?.clientUid) return;
      await hasPlayerBeenNuggetted({
        clientId: "main-client",
        spaceId: game.engine!.spaceId,
        playerId: playerId!
      }).then(async (hasBeenNuggetted) => {
        if (hasBeenNuggetted) return;
        console.log(`Issuing nugget 🍗🐔 for ${playerId}`);
        await handleNuggets(game, {
          playerId: playerId!,
          mapId: player!.map!
        });
      });
    }
  );

  game.subscribeToEvent("playerChats", ({ playerChats }, context) => {
    const message = playerChats.contents;
    const player: { id: string; name: string } = {
      id: playerChats.senderId,
      name: playerChats.senderName
    };

    //check to see if the message follows the command pattern
    const isCommand = message.match(/^\/(?<command>.*)/);
    if (isCommand) {
      console.log("🤖 CHAT MESSAGE IS A COMMAND, PARSING CHAT MESSAGE");
      const parser = isCommand.groups!.command.split(" ");
      return checkForCommand({
        game,
        parser,
        playerSendsCommand: {
          command: isCommand.groups!.command,
          encId: NaN
        },
        context: {
          spaceId: context.spaceId,
          player: context.player,
          playerId: player.id
        }
      });
    }

    if (game.engine?.clientUid === player.id) {
      return;
    }
  });
};

/**
 * Function checks permissions of given user
 * @param game
 * @param playerId
 * @param roles
 * @param operand //Operation to perform on role array. Defaults to AND
 * @returns
 */

enum Role {
  OWNER,
  DEFAULT_MOD,
  DEFAULT_BUILDER,
  MEMBER
}

const checkUserPermissions = (
  game: Game,
  playerId: string,
  roles: Role[],
  operand?: "AND" | "OR" | "NOT"
) => {
  //OWNER, DEFAULT_MOD, DEFAULT_BUILDER
  let check: boolean[] = [];
  for (let role of roles) {
    check.push(spaceRoles[game.spaceId!.split("\\")[0]][playerId!].roles[role]);
  }
  switch (operand) {
    case "AND":
      return !check.includes(false);
      break;
    case "OR":
      return check.includes(true);
      break;
    case "NOT":
      return !check.includes(true);
      break;
    default:
      return !check.includes(false);
      break;
  }
};
