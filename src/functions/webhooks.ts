import { Game, Player } from "@gathertown/gather-game-client";
import axios from "axios";

export async function triggerChatWebhook(
  game: Game,
  message: string,
  player: { id: string; name: string; mapId: string }
) {
  sendImmediateFeedback(game, player);
  const delayedFeedback = setupDelayedFeedback(game, player);

  const url = "https://hook.eu1.make.com/px8wuvrutbje22gr7amar6itl1hyqnl7";

  axios
    .post(url, {
      message,
      playerName: player.name,
      playerId: player.id,
      spaceId: game.spaceId!
    })
    .then((response) => {
      console.log(
        `✅ Chat Webhook triggered successfully for player ${
          player.name
        }, in space ${game.spaceId!}`
      );
      return response.data;
    })
    .then((openAIData) => {
      console.log(`🤖 The bot responded:`, openAIData);
      game.chat(player.id, [], player.mapId, {
        contents: openAIData.trim()
      });
    })
    .catch((error) =>
      console.log(
        "❌ Webhook failed to trigger",
        error?.response?.data || error.message
      )
    )
    .finally(() => {
      delayedFeedback.clear();
    });
}

function sendImmediateFeedback(
  game: Game,
  player: { id: string; name: string; mapId: string }
) {
  game.chat(player.id, [], player.mapId, {
    contents: "🤖 Prompt received!"
  });
}

function setupDelayedFeedback(
  game: Game,
  player: { id: string; name: string; mapId: string }
): { clear: Function } {
  const firstDelayedResponse = setTimeout(
    () =>
      game.chat(player.id, [], player.mapId, {
        contents: `
        Thinking...Blip, Blup, Blop...
        `
      }),
    1000
  );
  const secondDelayedResponse = setTimeout(
    () =>
      game.chat(player.id, [], player.mapId, {
        contents: `This is taking longer than I expected...
        `
      }),
    5000
  );

  const clearScheduledResponses = () =>
    [firstDelayedResponse, secondDelayedResponse].forEach((timeoutId) =>
      clearTimeout(timeoutId)
    );

  return { clear: clearScheduledResponses };
}
