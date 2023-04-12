import { DBOutfit } from "@gathertown/gather-game-client";

require("dotenv").config();

export const API_KEY = process.env.API_KEY;
//This should be the full URL, not just the spaceId\\spaceName
export const SPACE_URLS = process.env.SPACE_URLS?.split(",") || [
  "https://app.gather.town/app/o9PWV3inJcJLV7u1/Scavenger%20Hunt"
];

export const DEFAULT_SPREADSHEET = process.env.DEFAULT_SPREADSHEET_ID;

export const NPC_NAME = process.env.NPC_NAME || "Nugget (AI Bot)";

export const BOT_OUTFIT: DBOutfit = {
  skin: "",
  hair: "",
  facial_hair: "",
  top: "",
  bottom: "",
  shoes: "",
  hat: "",
  glasses: "",
  other: "",
  costume: "dsfv7m1m15xasfdBoIEX",
  mobility: "",
  jacket: ""
};
