import { FeatureTokens } from "./../database/database.model";
import { getSpaceConfigValue, isFeatureEnabled } from "./utils";
/**
 * Use this File to organize functions which pertain directly to subscriptions,
 * or which may be referenced by subscriptions.
 */

import { Game } from "@gathertown/gather-game-client";
import { checkForCommand } from "../config/commands";
import { getPlayerData } from "../database/database";
import { PlayerData } from "../database/database.model";
require("dotenv").config();

/*
    //Space Member Permssions, to create Moderator or Owner limited actions.
    Note: spaceId here is the randomly generated characters before the space name, ie spaceId\\spaceName, not both parts
    [spaceId:string]:{playerId:{currentlyEquippedWearables:{...},name:string,roles:{DEFAULT_BUILDER:boolean,OWNER:boolean,DEFAULT_MOD:boolean}}}
*/
import { accessRequestsUpdatedListener } from "../features/auto-join-allow/auto-allow";
import { handleNuggets } from "../features/learning-nuggets/learning-nuggets";
import { liftInteractionListener } from "../features/lift/lift";
import { spaceCapacities, spaceRoles } from "./connection";
import { handleOnboarding } from "./other";
import { triggerChatWebhook } from "./webhooks";

export const subscribeToEvents = async (game: Game): Promise<void> => {
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

      console.log(`Player ${playerId} joined space ${game.spaceId!}`);

      const playerData: PlayerData = await getPlayerData({
        clientId: "main-client",
        spaceId: game.spaceId!,
        playerId,
      });

      if (!playerData?.lastOnboarded) {
        await handleOnboarding(
          game,
          playerId,
          player?.map!,
          getSpaceConfigValue(game.spaceId!, "ONBOARDING_MESSAGE") ?? undefined
        );
      }

      if (isFeatureEnabled(game, FeatureTokens.LEARNING_NUGGETS)) {
        handleNuggets(game, player!, playerData);
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
      mapId: context.player?.map!,
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
      const { command } = isCommand.groups!;
      const parser = command.split(" ");
      return checkForCommand({
        game,
        parser,
        playerSendsCommand: {
          command,
          encId: NaN,
        },
        context: {
          spaceId: context.spaceId,
          player: context.player,
          playerId: player.id,
        },
      });
    }

    console.log(`🕊️ ${player.name} (${player.id}) sent chat to server`);

    const AI_CHAT_ENABLED = isFeatureEnabled(game, FeatureTokens.OPEN_AI);

    if (AI_CHAT_ENABLED) {
      triggerChatWebhook(game, message, player);
    }
  });

  if (isFeatureEnabled(game, FeatureTokens.AUTO_JOIN_ALLOW)) {
    /* sets up subscription for handling Access Requests  */
    accessRequestsUpdatedListener(game);
  }

  if (isFeatureEnabled(game, FeatureTokens.ELEVATOR)) {
    /* sets up subscription for handling Lift Interactions */
    liftInteractionListener(game);
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
  MEMBER,
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
    case "OR":
      return check.includes(true);
    case "NOT":
      return !check.includes(true);
    default:
      return !check.includes(false);
  }
};
