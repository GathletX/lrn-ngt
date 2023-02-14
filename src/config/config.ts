import { DBOutfit } from "@gathertown/gather-game-client";

require("dotenv").config();

export const API_KEY = process.env.API_KEY;
//This should be the full URL, not just the spaceId\\spaceName
export const SPACE_URLS = process.env.SPACE_URLS?.split(",") || [
  "https://app.gather.town/app/arIfmcBhsz7Hiedn/Testisland-Office"
];

export const DEFAULT_SPREADSHEET = process.env.DEFAULT_SPREADSHEET_ID;

export const NPC_NAME = process.env.NPC_NAME || "LRN-NGT";

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
  costume: "5XAHIu9qjue80RbG8kxE",
  mobility: "",
  jacket: ""
};
