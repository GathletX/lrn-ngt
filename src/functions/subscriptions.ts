import {
  getGlobalConfig,
  getGlobalFeatures,
  getSpaceFeatures
} from "./../database/database";
/**
 * Use this File to organize functions which pertain directly to subscriptions,
 * or which may be referenced by subscriptions.
 */

import { Game } from "@gathertown/gather-game-client";
import { checkForCommand } from "../config/commands";
import { getPlayerData, getSpaceConfig } from "../database/database";
import { PlayerData } from "../database/database.model";
require("dotenv").config();

/*
    //Space Member Permssions, to create Moderator or Owner limited actions.
    Note: spaceId here is the randomly generated characters before the space name, ie spaceId\\spaceName, not both parts
    [spaceId:string]:{playerId:{currentlyEquippedWearables:{...},name:string,roles:{DEFAULT_BUILDER:boolean,OWNER:boolean,DEFAULT_MOD:boolean}}}
*/
import { spaceRoles, spaceCapacities } from "./connection";
import {
  handleNuggets,
  handleOnboarding,
  hasPlayerBeenNuggetted
} from "./other";
import { triggerChatWebhook } from "./webhooks";
import { accessRequestsUpdatedListener } from "../features/auto-join-allow/auto-allow";

export const subscribeToEvents = async (game: Game): Promise<void> => {
  // const COMMON_CONFIG = await getGlobalConfig();
  //todo not ideal... needs to be updated when the firebase configs change
  const COMMON_FEATURES = await getGlobalFeatures();
  const spaceConfig = await getSpaceConfig({
    clientId: "main-client",
    spaceId: game.engine!.spaceId
  });
  const spaceFeatures = await getSpaceFeatures({
    clientId: "main-client",
    spaceId: game.engine!.spaceId
  });

  game.subscribeToEvent(
    "playerSendsCommand",
    ({ playerSendsCommand }, context) => {
      const parser = playerSendsCommand.command.split(" ");
      checkForCommand({ parser, game, playerSendsCommand, context });
    }
  );

  game.subscribeToEvent(
    "playerJoins",
    async ({ playerJoins }, { playerId, player }) => {
      if (!playerId || playerId === game.engine?.clientUid) return;

      const playerData: PlayerData = await getPlayerData({
        clientId: "main-client",
        spaceId: game.spaceId!,
        playerId
      });

      console.log(`Player ${playerId} joined space ${game.spaceId!}`);
      console.log(`PlayerData: ${JSON.stringify(playerData)}`);

      if (!playerData?.lastOnboarded) {
        await handleOnboarding(
          game,
          playerId,
          player?.map!,
          spaceConfig?.ONBOARDING_MESSAGE
        );
      }

      if (
        COMMON_FEATURES?.["learning-nuggets"] ||
        spaceFeatures?.["learning-nuggets"]
      ) {
        const hasBeenNuggeted = hasPlayerBeenNuggetted(
          playerData,
          spaceConfig?.COOLDOWN_INTERVAL
        );
        if (!hasBeenNuggeted) {
          console.log(`Issuing nugget 🍗🐔 for ${playerId}`);
          await handleNuggets(
            game,
            {
              playerId: playerId,
              mapId: player?.map!
            },
            spaceConfig
          );
        }
      }
    }
  );

  game.subscribeToEvent("playerJoins", ({ playerJoins }, context) => {
    const numberOfPlayers: number = Object.keys(game.players).length;

    console.log("nPlayers:", numberOfPlayers);
    console.log(spaceCapacities[game.spaceId!]);

    if (numberOfPlayers >= spaceCapacities[game.spaceId!] - 2) {
      game.disconnect();
    }
  });

  game.subscribeToEvent("playerChats", ({ playerChats }, context) => {
    const message = playerChats.contents;
    const player: { id: string; name: string; mapId: string } = {
      id: playerChats.senderId,
      name: playerChats.senderName,
      mapId: context.player?.map!
    };

    //this means it's not a message directed TO the bot, but a message for EVERYONE or NEARBY
    if (playerChats.messageType !== "DM") return;

    if (game.engine?.clientUid === player.id) {
      return;
    }

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

    console.log(
      `🕊️ ${player.name} (${player.id}) sent chat to server: ${playerChats.contents}`
    );

    if (COMMON_FEATURES?.["open-ai"] || spaceFeatures?.["open-ai"]) {
      triggerChatWebhook(game, message, player);
    }
  });

  if (
    COMMON_FEATURES?.["auto-join-allow"] ||
    spaceFeatures?.["auto-join-allow"]
  ) {
    /* -------------------------------------------------------------------------- */
    /*              sets up subscription for handling Access Requests             */
    /* -------------------------------------------------------------------------- */
    accessRequestsUpdatedListener(game);
  }
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
