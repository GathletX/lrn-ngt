require("dotenv").config();

//This should be the full URL, not just the spaceId\\spaceName
export const SPACE_URLS = process.env.SPACE_URLS?.split(",") || [
  "https://app.gather.town/app/arIfmcBhsz7Hiedn/Testisland-Office"
];
