import { Game } from "@gathertown/gather-game-client";

export const liftInteractionListener = (game: Game) =>
  game.subscribeToEvent(
    "playerInteractsWithObject",
    ({ playerInteractsWithObject }) => {
      if (!playerInteractsWithObject.dataJson) return;
      // Parse the dataJson string into an object and extract selectedLevel from it
      const { levelSelect } = JSON.parse(playerInteractsWithObject.dataJson);
      lift(game, playerInteractsWithObject.mapId, levelSelect);
    },
    ({ playerInteractsWithObject }) => {
      const triggeredObject = game.getObjectByKey(
        playerInteractsWithObject.mapId,
        playerInteractsWithObject.key
      )!;
      return triggeredObject.id === "Liftpanel";
    }
  );

export function lift(
  game: Game,
  startMap: string,
  selectedLevel: string
): void {
  let t = 0;
  const spawns = game.partialMaps[selectedLevel].spawns || [];
  Object.keys(game.players).forEach((playerId, i) => {
    if (game.players[playerId].map === startMap) {
      setTimeout(() => {
        const s = Math.floor(Math.random() * spawns.length);
        const endTile = spawns[s];
        game.teleport(selectedLevel, endTile.x, endTile.y, playerId);
      }, 100 * i++);
      game.playSound(
        `https://assets.mixkit.co/sfx/preview/mixkit-elevator-announcement-bells-112.mp3`,
        1,
        playerId
      );
    }
  });
}
