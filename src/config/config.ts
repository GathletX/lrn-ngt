import { DBOutfit } from "@gathertown/gather-game-client";

require("dotenv").config();

export const API_KEY = process.env.API_KEY;
//This should be the full URL, not just the spaceId\\spaceName
export const SPACE_URLS = process.env.SPACE_URLS?.split(",") || [
  "https://app.gather.town/app/CVhm8IiJMdEPSQDJ/notsotinyisland",
];

export const DEFAULT_SPREADSHEET = process.env.DEFAULT_SPREADSHEET_ID;

export const NPC_NAME = process.env.NPC_NAME || "Nugget (AI-Bot)";

export const BOT_OUTFIT: DBOutfit = {
  skin: "g4i74H15KaK1Fs9KvDjG",
  hair: "8TkbLsK2QxOMSnV8yKSF",
  facial_hair: "6DGt3O5rwQzWVq5hzkNn",
  top: "ISqj8ODXk0z79fQpNAsq",
  bottom: "3P8WFV4mQ2-r1NipDI4H",
  shoes: "jWRxPyatM2P0bdzSnf50",
  hat: "NmgE5mxDAD4upGmWxzfE",
  glasses: "LLgy9D9AEiacPxOMHFvb",
  other: "PDcy2ATIJeV9hg8ZyEoG",
  costume: "",
  mobility: "vFCPcTvWvTi04gj0hKkd",
  jacket: "IXbl8e_2QnafaPPO3fk8",
};
