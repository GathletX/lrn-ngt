import { commandList } from "./config/commands";
import * as connection from "./functions/connection";
import { subscribeToEvents } from "./functions/subscriptions";
import {
  initializeGlobalFeatures,
  initializeSpaceFeatures
} from "./functions/utils";
global.WebSocket = require("isomorphic-ws");

const run = async (): Promise<void> => {
  await initializeGlobalFeatures();

  const games = await connection.connectToSpaces(
    Object.keys(commandList) ?? undefined
  );

  for (let id in games) {
    await initializeSpaceFeatures(games[id]);
    subscribeToEvents(games[id]);
  }
};

run();
