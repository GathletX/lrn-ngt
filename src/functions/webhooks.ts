import { Game } from "@gathertown/gather-game-client";
import axios from "axios";

export async function triggerChatWebhook(
  game: Game,
  message: string,
  player: { id: string; name: string; mapId: string }
) {
  const url = "https://hook.eu1.make.com/px8wuvrutbje22gr7amar6itl1hyqnl7";
  axios
    .post(url, { message, playerName: player.name, playerId: player.id })
    .then((response) => {
      console.log(
        `✅ Chat Webhook triggered successfully for player: ${player.name}`
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
    );
}
