import { Game } from "@gathertown/gather-game-client";

export const accessRequestsUpdatedListener = (game: Game) =>
  game.subscribeToEvent(
    "accessRequestsUpdated",
    ({ accessRequestsUpdated }) => {
      const botId = game.engine!.clientUid;

      accessRequestsUpdated.requests.forEach((request) => {
        if (request.memberId === botId) {
          game.respondToAccessRequest(request.guestId, true);
          setTimeout(() => {
            game.requestToLead(
              request.guestId,
              "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/O5MRcyagcF8P8nrk/GfZGP3i1srZ8ITf8nXXy1m"
            );
          }, 10000); // delay of 10000 milliseconds (10 seconds)
        }
      });
    }
  );
