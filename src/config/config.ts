import { DBOutfit } from "@gathertown/gather-game-client";

require("dotenv").config();

export const API_KEY = process.env.API_KEY;
//This should be the full URL, not just the spaceId\\spaceName
export const SPACE_URLS = process.env.SPACE_URLS?.split(",") || [
  "https://app.gather.town/app/arIfmcBhsz7Hiedn/Testisland-Office"
];

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
  costume: JSON.stringify({
    id: "5XAHIu9qjue80RbG8kxE",
    color: "white",
    name: "robot",
    type: "costume",
    subType: "seasonal",
    style: "",
    isDefault: true,
    previewUrl:
      "https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/wearables/2JGBQYKKi4YrvgsN1fFiY",
    startDate: "",
    endDate: "",
    createdAt: "2022-04-01T15:00:00.000Z",
    updatedAt: "2022-09-27T18:09:08.237Z",
    parts: [{ layerId: "costume front", spritesheetId: "OVwEnO9GLkBxgjOgFw6o" }]
  }),
  mobility: "",
  jacket: ""
};
